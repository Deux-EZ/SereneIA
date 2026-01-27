"""
Resolvers del chatbot.
Manejan la comunicación con N8N para el procesamiento de mensajes.
"""
import strawberry
from strawberry.types import Info

from app.graphql.types import (
    ChatMessagePayload,
    HealthStatus,
    SendMessageInput,
)
from app.graphql.dependencies import get_current_user
from app.services import n8n_service
from app.core.database import AsyncSessionLocal


@strawberry.type
class ChatQuery:
    """Queries relacionadas con el chat."""
    
    @strawberry.field
    async def health(self, info: Info) -> HealthStatus:
        """
        Verifica el estado de los servicios.
        
        Returns:
            Estado de backend, N8N y base de datos
        """
        # Verificar N8N
        n8n_healthy = await n8n_service.health_check()
        
        # Verificar base de datos
        db_healthy = True
        try:
            async with AsyncSessionLocal() as session:
                await session.execute("SELECT 1")
        except Exception:
            db_healthy = False
        
        return HealthStatus(
            backend=True,
            n8n=n8n_healthy,
            database=db_healthy,
        )


@strawberry.type
class ChatMutation:
    """Mutaciones relacionadas con el chat/chatbot."""
    
    @strawberry.mutation
    async def send_message(
        self,
        info: Info,
        input: SendMessageInput
    ) -> ChatMessagePayload:
        """
        Envía un mensaje al chatbot y recibe la respuesta.
        
        El flujo es:
        1. Validar autenticación del usuario
        2. Enviar mensaje a N8N webhook
        3. N8N procesa con el AI Agent (Ollama + Postgres Memory)
        4. Devolver respuesta al frontend
        
        N8N maneja automáticamente:
        - El historial de conversación (Postgres Chat Memory)
        - El contexto del LLM
        - El vector store (Qdrant)
        
        Requiere: Token de acceso válido
        
        Args:
            input: Mensaje del usuario
            
        Returns:
            Respuesta del chatbot
        """
        # Obtener usuario autenticado
        user = await get_current_user(info)
        
        # Validar mensaje
        message = input.message.strip()
        if not message:
            return ChatMessagePayload(
                success=False,
                error="El mensaje no puede estar vacío"
            )
        
        if len(message) > 10000:
            return ChatMessagePayload(
                success=False,
                error="El mensaje es demasiado largo (máximo 10,000 caracteres)"
            )
        
        # Enviar a N8N
        # El session_id es el UUID del usuario, que N8N usa para
        # mantener el historial en Postgres Chat Memory
        response = await n8n_service.send_message(
            session_id=user.session_id,  # UUID del usuario
            message=message,
            user_name=user.full_name or user.username,
        )
        
        if not response.success:
            return ChatMessagePayload(
                success=False,
                session_id=user.id,
                error=response.error,
            )
        
        return ChatMessagePayload(
            success=True,
            response=response.response,
            session_id=user.id,
        )
