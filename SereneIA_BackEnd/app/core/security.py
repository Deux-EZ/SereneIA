"""
Módulo de seguridad: JWT tokens y hashing de contraseñas.
Implementa autenticación stateless con JWT.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# Contexto para hashing de contraseñas con bcrypt
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Factor de costo para bcrypt
)


def hash_password(plain_password: str) -> str:
    """
    Genera un hash bcrypt de la contraseña.
    
    Args:
        plain_password: Contraseña en texto plano
        
    Returns:
        Hash bcrypt de la contraseña
    """
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si la contraseña coincide con el hash.
    
    Args:
        plain_password: Contraseña en texto plano
        hashed_password: Hash almacenado en la base de datos
        
    Returns:
        True si coinciden, False en caso contrario
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_token(
    data: dict[str, Any],
    token_type: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Crea un token JWT.
    
    Args:
        data: Payload del token (user_id, role, etc.)
        token_type: "access" o "refresh"
        expires_delta: Tiempo de expiración personalizado
        
    Returns:
        Token JWT codificado
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    elif token_type == "access":
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.jwt_access_token_expire_minutes
        )
    else:  # refresh
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.jwt_refresh_token_expire_days
        )
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": token_type
    })
    
    return jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )


def create_access_token(user_id: str, role: str) -> str:
    """Crea un token de acceso para el usuario."""
    return create_token(
        data={"sub": user_id, "role": role},
        token_type="access"
    )


def create_refresh_token(user_id: str) -> str:
    """Crea un token de refresco para el usuario."""
    return create_token(
        data={"sub": user_id},
        token_type="refresh"
    )


def decode_token(token: str) -> Optional[dict[str, Any]]:
    """
    Decodifica y valida un token JWT.
    
    Args:
        token: Token JWT a decodificar
        
    Returns:
        Payload del token si es válido, None si no lo es
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        return None


def create_tokens_for_user(user_id: str, role: str) -> dict[str, str]:
    """
    Crea ambos tokens (access y refresh) para un usuario.
    
    Args:
        user_id: ID del usuario
        role: Rol del usuario
        
    Returns:
        Diccionario con access_token, refresh_token y token_type
    """
    return {
        "access_token": create_access_token(user_id, role),
        "refresh_token": create_refresh_token(user_id),
        "token_type": "Bearer"
    }
