"""
Repositorio de conversaciones.
Implementa el patrón Repository para operaciones CRUD de conversaciones.
"""
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from sqlalchemy import select, update, delete, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation


class ConversationRepository:
    """
    Repositorio para operaciones CRUD de conversaciones.
    
    Responsabilidades:
    - Crear, leer, actualizar y eliminar conversaciones
    - Gestionar el ciclo de vida de las conversaciones del usuario
    - Proporcionar queries optimizadas para listar conversaciones
    """
    
    def __init__(self, db: AsyncSession):
        """
        Inicializa el repositorio con una sesión de base de datos.
        
        Args:
            db: Sesión asíncrona de SQLAlchemy
        """
        self._db = db
    
    async def create(
        self,
        user_id: UUID,
        title: str = "Nueva conversación"
    ) -> Conversation:
        """
        Crea una nueva conversación para un usuario.
        
        Args:
            user_id: UUID del usuario propietario
            title: Título de la conversación (default: "Nueva conversación")
            
        Returns:
            Conversación creada con su UUID (usado como sessionId en N8N)
        """
        conversation = Conversation(
            user_id=user_id,
            title=title.strip() if title else "Nueva conversación"
        )
        self._db.add(conversation)
        await self._db.commit()
        await self._db.refresh(conversation)
        return conversation
    
    async def get_by_id(self, conversation_id: UUID) -> Optional[Conversation]:
        """
        Obtiene una conversación por su ID.
        
        Args:
            conversation_id: UUID de la conversación
            
        Returns:
            Conversación si existe, None en caso contrario
        """
        result = await self._db.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_id_and_user(
        self,
        conversation_id: UUID,
        user_id: UUID
    ) -> Optional[Conversation]:
        """
        Obtiene una conversación por ID verificando que pertenece al usuario.
        
        Args:
            conversation_id: UUID de la conversación
            user_id: UUID del usuario (para verificar propiedad)
            
        Returns:
            Conversación si existe y pertenece al usuario, None en caso contrario
        """
        result = await self._db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
        )
        return result.scalar_one_or_none()
    
    async def get_user_conversations(
        self,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0,
        include_archived: bool = False
    ) -> List[Conversation]:
        """
        Obtiene todas las conversaciones de un usuario.
        Ordenadas por fecha de actualización (más recientes primero).
        
        Args:
            user_id: UUID del usuario
            limit: Número máximo de conversaciones a retornar
            offset: Número de conversaciones a saltar (para paginación)
            include_archived: Si incluir conversaciones archivadas
            
        Returns:
            Lista de conversaciones del usuario
        """
        query = select(Conversation).where(
            Conversation.user_id == user_id
        )
        
        if not include_archived:
            query = query.where(Conversation.is_archived == False)
        
        query = query.order_by(desc(Conversation.updated_at)).limit(limit).offset(offset)
        
        result = await self._db.execute(query)
        return list(result.scalars().all())
    
    async def update_title(
        self,
        conversation_id: UUID,
        title: str
    ) -> Optional[Conversation]:
        """
        Actualiza el título de una conversación.
        
        Args:
            conversation_id: UUID de la conversación
            title: Nuevo título
            
        Returns:
            Conversación actualizada o None si no existe
        """
        conversation = await self.get_by_id(conversation_id)
        if not conversation:
            return None
        
        conversation.title = title.strip()
        conversation.updated_at = datetime.utcnow()
        await self._db.commit()
        await self._db.refresh(conversation)
        return conversation
    
    async def update_last_message_preview(
        self,
        conversation_id: UUID,
        preview: str
    ) -> Optional[Conversation]:
        """
        Actualiza el preview del último mensaje.
        Se llama después de cada mensaje para mostrar en la lista.
        
        Args:
            conversation_id: UUID de la conversación
            preview: Preview del último mensaje (primeros ~100 chars)
            
        Returns:
            Conversación actualizada o None si no existe
        """
        conversation = await self.get_by_id(conversation_id)
        if not conversation:
            return None
        
        # Truncar a 100 caracteres para el preview
        conversation.last_message_preview = preview[:100] if len(preview) > 100 else preview
        conversation.updated_at = datetime.utcnow()
        await self._db.commit()
        await self._db.refresh(conversation)
        return conversation
    
    async def update_title_if_default(
        self,
        conversation_id: UUID,
        first_message: str
    ) -> Optional[Conversation]:
        """
        Actualiza el título solo si es el título por defecto.
        Genera el título a partir del primer mensaje del usuario.
        
        Args:
            conversation_id: UUID de la conversación
            first_message: Primer mensaje del usuario
            
        Returns:
            Conversación actualizada o None si no existe
        """
        conversation = await self.get_by_id(conversation_id)
        if not conversation:
            return None
        
        # Solo actualizar si tiene el título por defecto
        if conversation.title == "Nueva conversación":
            # Generar título del primer mensaje (max 50 chars)
            new_title = first_message[:50].strip()
            if len(first_message) > 50:
                new_title += "..."
            conversation.title = new_title
            await self._db.commit()
            await self._db.refresh(conversation)
        
        return conversation
    
    async def archive(self, conversation_id: UUID) -> Optional[Conversation]:
        """
        Archiva una conversación (soft delete).
        
        Args:
            conversation_id: UUID de la conversación
            
        Returns:
            Conversación archivada o None si no existe
        """
        conversation = await self.get_by_id(conversation_id)
        if not conversation:
            return None
        
        conversation.is_archived = True
        await self._db.commit()
        await self._db.refresh(conversation)
        return conversation
    
    async def unarchive(self, conversation_id: UUID) -> Optional[Conversation]:
        """
        Desarchiva una conversación.
        
        Args:
            conversation_id: UUID de la conversación
            
        Returns:
            Conversación desarchivada o None si no existe
        """
        conversation = await self.get_by_id(conversation_id)
        if not conversation:
            return None
        
        conversation.is_archived = False
        await self._db.commit()
        await self._db.refresh(conversation)
        return conversation
    
    async def delete(self, conversation_id: UUID) -> bool:
        """
        Elimina una conversación permanentemente.
        
        NOTA: Los mensajes en N8N (n8n_chat_histories) no se eliminan automáticamente.
        Se podría implementar una limpieza programada si es necesario.
        
        Args:
            conversation_id: UUID de la conversación
            
        Returns:
            True si se eliminó, False si no existía
        """
        result = await self._db.execute(
            delete(Conversation).where(Conversation.id == conversation_id)
        )
        await self._db.commit()
        return result.rowcount > 0
    
    async def count_user_conversations(
        self,
        user_id: UUID,
        include_archived: bool = False
    ) -> int:
        """
        Cuenta el número de conversaciones de un usuario.
        
        Args:
            user_id: UUID del usuario
            include_archived: Si incluir conversaciones archivadas
            
        Returns:
            Número de conversaciones
        """
        from sqlalchemy import func as sql_func
        
        query = select(sql_func.count(Conversation.id)).where(
            Conversation.user_id == user_id
        )
        
        if not include_archived:
            query = query.where(Conversation.is_archived == False)
        
        result = await self._db.execute(query)
        return result.scalar() or 0
