"""
Tipos GraphQL para el chat/chatbot y conversaciones.
"""
import strawberry
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from enum import Enum


@strawberry.enum
class MessageType(Enum):
    """Tipo de mensaje en la conversación."""
    HUMAN = "human"
    AI = "ai"


@strawberry.type
class ConversationType:
    """
    Tipo GraphQL para conversaciones.
    
    Attributes:
        id: UUID de la conversación (usado como sessionId en N8N)
        title: Título de la conversación
        last_message_preview: Preview del último mensaje
        created_at: Fecha de creación
        updated_at: Fecha de última actividad
        is_archived: Si está archivada
    """
    id: UUID
    title: str
    last_message_preview: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_archived: bool


@strawberry.type
class ChatMessage:
    """
    Mensaje individual de una conversación.
    Obtenido de la tabla n8n_chat_histories.
    
    Attributes:
        id: ID del mensaje
        type: Tipo (HUMAN o AI)
        content: Contenido del mensaje
        created_at: Fecha de creación
    """
    id: int
    type: MessageType
    content: str
    created_at: datetime


@strawberry.type
class ChatMessagePayload:
    """
    Respuesta del chatbot después de enviar un mensaje.
    
    Attributes:
        success: Si la operación fue exitosa
        response: Respuesta del asistente (LLM)
        conversation_id: ID de la conversación
        error: Mensaje de error si hubo problemas
    """
    success: bool
    response: Optional[str] = None
    conversation_id: Optional[UUID] = None
    error: Optional[str] = None


@strawberry.type
class ConversationPayload:
    """
    Payload para operaciones de conversación.
    
    Attributes:
        success: Si la operación fue exitosa
        conversation: La conversación (si aplica)
        message: Mensaje informativo
        error: Mensaje de error (si aplica)
    """
    success: bool
    conversation: Optional[ConversationType] = None
    message: Optional[str] = None
    error: Optional[str] = None


@strawberry.type
class ConversationListPayload:
    """
    Lista paginada de conversaciones.
    
    Attributes:
        conversations: Lista de conversaciones
        total: Total de conversaciones (para paginación)
        has_more: Si hay más páginas
    """
    conversations: List[ConversationType]
    total: int
    has_more: bool


@strawberry.type
class HealthStatus:
    """Estado de salud de los servicios."""
    backend: bool
    n8n: bool
    database: bool


# ========================
# Input Types
# ========================

@strawberry.input
class SendMessageInput:
    """
    Input para enviar un mensaje al chatbot.
    
    Attributes:
        conversation_id: ID de la conversación (UUID)
        message: Mensaje del usuario
    """
    conversation_id: UUID
    message: str


@strawberry.input
class CreateConversationInput:
    """
    Input para crear una nueva conversación.
    
    Attributes:
        title: Título inicial (opcional, se genera del primer mensaje)
    """
    title: Optional[str] = None


@strawberry.input
class UpdateConversationInput:
    """
    Input para actualizar una conversación.
    
    Attributes:
        conversation_id: ID de la conversación
        title: Nuevo título
    """
    conversation_id: UUID
    title: str
