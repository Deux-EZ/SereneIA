"""
Resolvers de conversaciones.
Manejan el CRUD de conversaciones y la comunicación con N8N.
"""
import strawberry
from strawberry.types import Info
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.graphql.types import (
    ChatMessagePayload,
    ChatMessage,
    MessageType,
    ConversationType,
    ConversationPayload,
    ConversationListPayload,
    HealthStatus,
    SendMessageInput,
    CreateConversationInput,
    UpdateConversationInput,
)
from app.graphql.dependencies import get_current_user
from app.services import n8n_service
from app.repositories import ConversationRepository
from app.core.database import AsyncSessionLocal
from app.core.config import settings


def conversation_to_type(conv) -> ConversationType:
    """Convierte un modelo Conversation a ConversationType de GraphQL."""
    return ConversationType(
        id=conv.id,
        title=conv.title,
        last_message_preview=conv.last_message_preview,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        is_archived=conv.is_archived,
    )


@strawberry.type
class ConversationQuery:
    """Queries relacionadas con conversaciones."""
    
    @strawberry.field
    async def conversations(
        self,
        info: Info,
        limit: int = 50,
        offset: int = 0,
        include_archived: bool = False
    ) -> ConversationListPayload:
        """
        Obtiene todas las conversaciones del usuario autenticado.
        Ordenadas por fecha de actualización (más recientes primero).
        
        Args:
            limit: Número máximo de conversaciones (default: 50)
            offset: Número de conversaciones a saltar (paginación)
            include_archived: Si incluir archivadas (default: False)
            
        Returns:
            Lista de conversaciones con información de paginación
        """
        user = await get_current_user(info)
        
        async with AsyncSessionLocal() as db:
            repo = ConversationRepository(db)
            
            conversations = await repo.get_user_conversations(
                user_id=user.id,
                limit=limit + 1,  # +1 para saber si hay más
                offset=offset,
                include_archived=include_archived,
            )
            
            total = await repo.count_user_conversations(
                user_id=user.id,
                include_archived=include_archived,
            )
            
            has_more = len(conversations) > limit
            if has_more:
                conversations = conversations[:limit]
            
            return ConversationListPayload(
                conversations=[conversation_to_type(c) for c in conversations],
                total=total,
                has_more=has_more,
            )
    
    @strawberry.field
    async def conversation(
        self,
        info: Info,
        conversation_id: UUID
    ) -> Optional[ConversationType]:
        """
        Obtiene una conversación específica por ID.
        Verifica que pertenezca al usuario autenticado.
        
        Args:
            conversation_id: UUID de la conversación
            
        Returns:
            La conversación o None si no existe/no pertenece al usuario
        """
        user = await get_current_user(info)
        
        async with AsyncSessionLocal() as db:
            repo = ConversationRepository(db)
            conversation = await repo.get_by_id_and_user(
                conversation_id=conversation_id,
                user_id=user.id,
            )
            
            if not conversation:
                return None
            
            return conversation_to_type(conversation)
    
    @strawberry.field
    async def conversation_history(
        self,
        info: Info,
        conversation_id: UUID
    ) -> List[ChatMessage]:
        """
        Obtiene el historial de mensajes de una conversación.
        Lee directamente de la tabla n8n_chat_histories de la BD de N8N.
        
        Args:
            conversation_id: UUID de la conversación (sessionId en N8N)
            
        Returns:
            Lista de mensajes ordenados por fecha de creación
        """
        user = await get_current_user(info)
        
        # Verificar que la conversación pertenece al usuario
        async with AsyncSessionLocal() as db:
            repo = ConversationRepository(db)
            conversation = await repo.get_by_id_and_user(
                conversation_id=conversation_id,
                user_id=user.id,
            )
            
            if not conversation:
                return []
        
        # Leer mensajes de la BD de N8N
        # NOTA: La tabla n8n_chat_histories está en la misma instancia de PostgreSQL
        # pero en la base de datos 'n8n', no 'sereneia_users'
        messages = await n8n_service.get_conversation_history(str(conversation_id))
        
        return [
            ChatMessage(
                id=msg["id"],
                type=MessageType.HUMAN if msg["type"] == "human" else MessageType.AI,
                content=msg["content"],
                created_at=msg["created_at"],
            )
            for msg in messages
        ]
    
    @strawberry.field
    async def health(self, info: Info) -> HealthStatus:
        """
        Verifica el estado de los servicios.
        
        Returns:
            Estado de backend, N8N y base de datos
        """
        n8n_healthy = await n8n_service.health_check()
        
        db_healthy = True
        try:
            async with AsyncSessionLocal() as session:
                from sqlalchemy import text
                await session.execute(text("SELECT 1"))
        except Exception:
            db_healthy = False
        
        return HealthStatus(
            backend=True,
            n8n=n8n_healthy,
            database=db_healthy,
        )


@strawberry.type
class ConversationMutation:
    """Mutaciones relacionadas con conversaciones y chat."""
    
    @strawberry.mutation
    async def create_conversation(
        self,
        info: Info,
        input: Optional[CreateConversationInput] = None
    ) -> ConversationPayload:
        """
        Crea una nueva conversación.
        
        Args:
            input: Título opcional para la conversación
            
        Returns:
            La conversación creada
        """
        user = await get_current_user(info)
        
        title = "Nueva conversación"
        if input and input.title:
            title = input.title.strip()[:255]
        
        async with AsyncSessionLocal() as db:
            repo = ConversationRepository(db)
            conversation = await repo.create(
                user_id=user.id,
                title=title,
            )
            
            return ConversationPayload(
                success=True,
                conversation=conversation_to_type(conversation),
                message="Conversación creada exitosamente",
            )
    
    @strawberry.mutation
    async def send_message(
        self,
        info: Info,
        input: SendMessageInput
    ) -> ChatMessagePayload:
        """
        Envía un mensaje al chatbot en una conversación específica.
        
        El flujo es:
        1. Validar autenticación y propiedad de la conversación
        2. Enviar mensaje a N8N webhook con el conversation_id como sessionId
        3. N8N procesa con el AI Agent (Ollama + Postgres Memory)
        4. Actualizar título y preview de la conversación
        5. Devolver respuesta al frontend
        
        Args:
            input: conversation_id y mensaje del usuario
            
        Returns:
            Respuesta del chatbot
        """
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
        
        # Verificar que la conversación existe y pertenece al usuario
        async with AsyncSessionLocal() as db:
            repo = ConversationRepository(db)
            conversation = await repo.get_by_id_and_user(
                conversation_id=input.conversation_id,
                user_id=user.id,
            )
            
            if not conversation:
                return ChatMessagePayload(
                    success=False,
                    error="Conversación no encontrada"
                )
            
            # Enviar a N8N con el conversation_id como sessionId
            response = await n8n_service.send_message(
                session_id=str(conversation.id),  # UUID de la conversación
                message=message,
                user_name=user.full_name or user.username,
            )
            
            if not response.success:
                return ChatMessagePayload(
                    success=False,
                    conversation_id=conversation.id,
                    error=response.error,
                )
            
            # Actualizar título si es la primera vez (título por defecto)
            await repo.update_title_if_default(
                conversation_id=conversation.id,
                first_message=message,
            )
            
            # Actualizar preview con la respuesta del AI
            if response.response:
                await repo.update_last_message_preview(
                    conversation_id=conversation.id,
                    preview=response.response,
                )
            
            return ChatMessagePayload(
                success=True,
                response=response.response,
                conversation_id=conversation.id,
            )
    
    @strawberry.mutation
    async def update_conversation_title(
        self,
        info: Info,
        input: UpdateConversationInput
    ) -> ConversationPayload:
        """
        Actualiza el título de una conversación.
        
        Args:
            input: conversation_id y nuevo título
            
        Returns:
            Conversación actualizada
        """
        user = await get_current_user(info)
        
        if not input.title.strip():
            return ConversationPayload(
                success=False,
                error="El título no puede estar vacío",
            )
        
        async with AsyncSessionLocal() as db:
            repo = ConversationRepository(db)
            conversation = await repo.get_by_id_and_user(
                conversation_id=input.conversation_id,
                user_id=user.id,
            )
            
            if not conversation:
                return ConversationPayload(
                    success=False,
                    error="Conversación no encontrada",
                )
            
            updated = await repo.update_title(
                conversation_id=conversation.id,
                title=input.title.strip()[:255],
            )
            
            return ConversationPayload(
                success=True,
                conversation=conversation_to_type(updated),
                message="Título actualizado",
            )
    
    @strawberry.mutation
    async def archive_conversation(
        self,
        info: Info,
        conversation_id: UUID
    ) -> ConversationPayload:
        """
        Archiva una conversación (soft delete).
        
        Args:
            conversation_id: UUID de la conversación
            
        Returns:
            Conversación archivada
        """
        user = await get_current_user(info)
        
        async with AsyncSessionLocal() as db:
            repo = ConversationRepository(db)
            conversation = await repo.get_by_id_and_user(
                conversation_id=conversation_id,
                user_id=user.id,
            )
            
            if not conversation:
                return ConversationPayload(
                    success=False,
                    error="Conversación no encontrada",
                )
            
            archived = await repo.archive(conversation_id)
            
            return ConversationPayload(
                success=True,
                conversation=conversation_to_type(archived),
                message="Conversación archivada",
            )
    
    @strawberry.mutation
    async def delete_conversation(
        self,
        info: Info,
        conversation_id: UUID
    ) -> ConversationPayload:
        """
        Elimina una conversación permanentemente.
        
        NOTA: Los mensajes en N8N (n8n_chat_histories) permanecen
        como datos huérfanos. Se recomienda usar archive en su lugar.
        
        Args:
            conversation_id: UUID de la conversación
            
        Returns:
            Resultado de la operación
        """
        user = await get_current_user(info)
        
        async with AsyncSessionLocal() as db:
            repo = ConversationRepository(db)
            conversation = await repo.get_by_id_and_user(
                conversation_id=conversation_id,
                user_id=user.id,
            )
            
            if not conversation:
                return ConversationPayload(
                    success=False,
                    error="Conversación no encontrada",
                )
            
            deleted = await repo.delete(conversation_id)
            
            if deleted:
                return ConversationPayload(
                    success=True,
                    message="Conversación eliminada permanentemente",
                )
            else:
                return ConversationPayload(
                    success=False,
                    error="No se pudo eliminar la conversación",
                )
