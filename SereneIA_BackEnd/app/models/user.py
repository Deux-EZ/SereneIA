"""
Modelo de Usuario para autenticación y autorización.
Este es el único modelo que maneja el backend.
Las conversaciones son manejadas por N8N (Postgres Chat Memory).
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class UserRole(str, Enum):
    """Roles de usuario disponibles."""
    USER = "user"
    ADMIN = "admin"


class User(Base):
    """
    Modelo de usuario para autenticación.
    
    Atributos:
        id: UUID único del usuario (usado como session_id en N8N)
        email: Email único del usuario
        username: Nombre de usuario único
        password_hash: Hash bcrypt de la contraseña
        full_name: Nombre completo (opcional)
        role: Rol del usuario (user/admin)
        is_active: Si el usuario está activo
        created_at: Fecha de creación
        updated_at: Fecha de última actualización
    """
    
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="UUID único del usuario, usado como session_id en N8N"
    )
    
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        comment="Email único del usuario"
    )
    
    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
        comment="Nombre de usuario único"
    )
    
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Hash bcrypt de la contraseña"
    )
    
    full_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Nombre completo del usuario"
    )
    
    role: Mapped[str] = mapped_column(
        String(20),
        default=UserRole.USER.value,
        nullable=False,
        comment="Rol del usuario"
    )
    
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Si el usuario está activo"
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
        comment="Fecha de última actualización"
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"
    
    @property
    def session_id(self) -> str:
        """
        ID de sesión para N8N Postgres Chat Memory.
        Usa el UUID del usuario para identificar sus conversaciones.
        """
        return str(self.id)
