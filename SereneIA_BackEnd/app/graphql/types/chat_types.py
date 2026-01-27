"""
Tipos GraphQL para el chat/chatbot.
"""
import strawberry
from typing import Optional
from uuid import UUID


@strawberry.type
class ChatMessagePayload:
    """
    Respuesta del chatbot.
    
    Attributes:
        success: Si la operación fue exitosa
        response: Respuesta del asistente (LLM)
        session_id: ID de sesión para el historial
        error: Mensaje de error si hubo problemas
    """
    success: bool
    response: Optional[str] = None
    session_id: Optional[UUID] = None
    error: Optional[str] = None


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
        message: Mensaje del usuario
    """
    message: str
