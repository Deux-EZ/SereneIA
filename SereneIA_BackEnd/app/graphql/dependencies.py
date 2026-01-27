"""
Dependencias y contexto para GraphQL.
Maneja la autenticación y obtención del usuario actual.
"""
from typing import Optional
from uuid import UUID

from strawberry.types import Info
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.repositories import UserRepository
from app.core.security import decode_token
from app.core.exceptions import AuthenticationError


async def get_current_user(info: Info) -> User:
    """
    Obtiene el usuario autenticado actual desde el contexto GraphQL.
    
    Extrae el token JWT del header Authorization, lo valida y
    retorna el usuario correspondiente.
    
    Args:
        info: Contexto de Strawberry GraphQL
        
    Returns:
        Usuario autenticado
        
    Raises:
        AuthenticationError: Si no hay token, es inválido o el usuario no existe
    """
    request = info.context["request"]
    db: AsyncSession = info.context["db"]
    
    # Obtener header Authorization
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        raise AuthenticationError("Token de autenticación requerido")
    
    # Verificar formato "Bearer <token>"
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise AuthenticationError("Formato de token inválido. Use: Bearer <token>")
    
    token = parts[1]
    
    # Decodificar y validar token
    payload = decode_token(token)
    
    if not payload:
        raise AuthenticationError("Token inválido o expirado")
    
    # Verificar tipo de token
    if payload.get("type") != "access":
        raise AuthenticationError("Se requiere un token de acceso")
    
    # Obtener user_id del payload
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise AuthenticationError("Token malformado: falta user_id")
    
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise AuthenticationError("Token malformado: user_id inválido")
    
    # Buscar usuario en la base de datos
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    
    if not user:
        raise AuthenticationError("Usuario no encontrado")
    
    if not user.is_active:
        raise AuthenticationError("Usuario desactivado")
    
    return user


async def get_optional_user(info: Info) -> Optional[User]:
    """
    Intenta obtener el usuario actual, devuelve None si no hay autenticación.
    
    Útil para endpoints que funcionan tanto autenticados como anónimos.
    
    Args:
        info: Contexto de Strawberry GraphQL
        
    Returns:
        Usuario si está autenticado, None en caso contrario
    """
    try:
        return await get_current_user(info)
    except AuthenticationError:
        return None
