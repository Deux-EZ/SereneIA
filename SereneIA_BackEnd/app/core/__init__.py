"""
Módulo core: configuración, seguridad, base de datos y excepciones.
"""
from app.core.config import settings, get_settings
from app.core.database import (
    Base,
    AsyncSessionLocal,
    get_db_session,
    init_database,
    close_database,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    create_tokens_for_user,
)
from app.core.exceptions import (
    AppException,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ValidationError,
    ConflictError,
    ExternalServiceError,
)

__all__ = [
    # Config
    "settings",
    "get_settings",
    # Database
    "Base",
    "AsyncSessionLocal",
    "get_db_session",
    "init_database",
    "close_database",
    # Security
    "hash_password",
    "verify_password",
    "create_access_token",
    "create_refresh_token",
    "decode_token",
    "create_tokens_for_user",
    # Exceptions
    "AppException",
    "AuthenticationError",
    "AuthorizationError",
    "NotFoundError",
    "ValidationError",
    "ConflictError",
    "ExternalServiceError",
]
