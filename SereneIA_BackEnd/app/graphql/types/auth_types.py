"""
Tipos GraphQL para autenticación y usuarios.
Usa Strawberry para definición de tipos con type hints de Python.
"""
import strawberry
from datetime import datetime
from typing import Optional
from uuid import UUID


@strawberry.type
class UserType:
    """Tipo GraphQL para representar un usuario."""
    id: UUID
    email: str
    username: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime


@strawberry.type
class AuthPayload:
    """Payload de respuesta de autenticación."""
    access_token: str
    refresh_token: str
    token_type: str
    user: UserType


@strawberry.type
class MessagePayload:
    """Payload genérico para respuestas con mensaje."""
    success: bool
    message: str


# ========================
# Input Types
# ========================

@strawberry.input
class RegisterInput:
    """Input para registro de usuario."""
    email: str
    username: str
    password: str
    full_name: Optional[str] = None


@strawberry.input
class LoginInput:
    """Input para login de usuario."""
    username: str  # Puede ser username o email
    password: str


@strawberry.input
class UpdateProfileInput:
    """Input para actualizar perfil de usuario."""
    email: Optional[str] = None
    full_name: Optional[str] = None


@strawberry.input
class ChangePasswordInput:
    """Input para cambiar contraseña."""
    current_password: str
    new_password: str
