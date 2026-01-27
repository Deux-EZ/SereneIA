"""
Repositorio de usuarios.
Implementa el patrón Repository para desacoplar la lógica de negocio del acceso a datos.
"""
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.core.security import hash_password, verify_password


class UserRepository:
    """
    Repositorio para operaciones CRUD de usuarios.
    
    Principios aplicados:
    - Single Responsibility: Solo maneja persistencia de usuarios
    - Dependency Injection: Recibe la sesión de DB
    - Repository Pattern: Abstrae el acceso a datos
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
        email: str,
        username: str,
        password: str,
        full_name: Optional[str] = None,
        role: str = "user"
    ) -> User:
        """
        Crea un nuevo usuario.
        
        Args:
            email: Email del usuario
            username: Nombre de usuario
            password: Contraseña en texto plano (será hasheada)
            full_name: Nombre completo (opcional)
            role: Rol del usuario (default: "user")
            
        Returns:
            Usuario creado
        """
        user = User(
            email=email.lower().strip(),
            username=username.strip(),
            password_hash=hash_password(password),
            full_name=full_name.strip() if full_name else None,
            role=role
        )
        self._db.add(user)
        await self._db.commit()
        await self._db.refresh(user)
        return user
    
    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        """
        Obtiene un usuario por su ID.
        
        Args:
            user_id: UUID del usuario
            
        Returns:
            Usuario si existe, None en caso contrario
        """
        result = await self._db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Obtiene un usuario por su email.
        
        Args:
            email: Email del usuario
            
        Returns:
            Usuario si existe, None en caso contrario
        """
        result = await self._db.execute(
            select(User).where(User.email == email.lower().strip())
        )
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> Optional[User]:
        """
        Obtiene un usuario por su nombre de usuario.
        
        Args:
            username: Nombre de usuario
            
        Returns:
            Usuario si existe, None en caso contrario
        """
        result = await self._db.execute(
            select(User).where(User.username == username.strip())
        )
        return result.scalar_one_or_none()
    
    async def authenticate(self, username: str, password: str) -> Optional[User]:
        """
        Autentica un usuario con username/email y contraseña.
        
        Args:
            username: Nombre de usuario o email
            password: Contraseña en texto plano
            
        Returns:
            Usuario si las credenciales son válidas, None en caso contrario
        """
        # Intentar buscar por username o email
        user = await self.get_by_username(username)
        if not user:
            user = await self.get_by_email(username)
        
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        if not user.is_active:
            return None
        
        return user
    
    async def update(
        self,
        user: User,
        email: Optional[str] = None,
        full_name: Optional[str] = None,
        password: Optional[str] = None
    ) -> User:
        """
        Actualiza los campos de un usuario.
        
        Args:
            user: Usuario a actualizar
            email: Nuevo email (opcional)
            full_name: Nuevo nombre completo (opcional)
            password: Nueva contraseña (opcional, será hasheada)
            
        Returns:
            Usuario actualizado
        """
        if email is not None:
            user.email = email.lower().strip()
        
        if full_name is not None:
            user.full_name = full_name.strip() if full_name else None
        
        if password is not None:
            user.password_hash = hash_password(password)
        
        await self._db.commit()
        await self._db.refresh(user)
        return user
    
    async def deactivate(self, user: User) -> User:
        """
        Desactiva un usuario (soft delete).
        
        Args:
            user: Usuario a desactivar
            
        Returns:
            Usuario desactivado
        """
        user.is_active = False
        await self._db.commit()
        await self._db.refresh(user)
        return user
    
    async def exists_email(self, email: str) -> bool:
        """Verifica si un email ya está registrado."""
        user = await self.get_by_email(email)
        return user is not None
    
    async def exists_username(self, username: str) -> bool:
        """Verifica si un username ya está registrado."""
        user = await self.get_by_username(username)
        return user is not None
