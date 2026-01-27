"""
Modelo de Conversación.
Representa una sesión de chat entre un usuario y el AI Agent.
El ID de esta conversación se usa como sessionId en N8N Postgres Chat Memory.
"""
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Conversation(Base):
    """
    Modelo de conversación.
    
    Cada conversación tiene un UUID único que se envía a N8N como sessionId.
    N8N usa ese sessionId para almacenar los mensajes en su tabla n8n_chat_histories.
    
    Atributos:
        id: UUID único (usado como sessionId en N8N)
        user_id: ID del usuario propietario
        title: Título de la conversación (generado del primer mensaje)
        created_at: Fecha de creación
        updated_at: Fecha de última actualización
        is_archived: Si la conversación está archivada
    """
    
    __tablename__ = "conversations"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="UUID único, usado como sessionId en N8N Postgres Chat Memory"
    )
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID del usuario propietario de la conversación"
    )
    
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Nueva conversación",
        comment="Título de la conversación (generado del primer mensaje)"
    )
    
    # Preview del último mensaje para mostrar en la lista
    last_message_preview: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Preview del último mensaje para mostrar en la lista"
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Fecha de creación"
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        index=True,
        comment="Fecha de última actualización"
    )
    
    is_archived: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Si la conversación está archivada"
    )
    
    # Relación con el usuario
    user: Mapped["User"] = relationship(
        "User",
        back_populates="conversations",
        lazy="selectin"
    )
    
    def __repr__(self) -> str:
        return f"<Conversation(id={self.id}, title='{self.title[:20]}...', user_id={self.user_id})>"
    
    @property
    def session_id(self) -> str:
        """
        SessionId para N8N Postgres Chat Memory.
        Retorna el UUID como string para usar en el webhook de N8N.
        """
        return str(self.id)
