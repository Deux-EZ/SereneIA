"""
Resolvers de autenticación y gestión de usuarios.
"""
import strawberry
from strawberry.types import Info

from app.graphql.types import (
    UserType,
    AuthPayload,
    MessagePayload,
    RegisterInput,
    LoginInput,
    UpdateProfileInput,
    ChangePasswordInput,
)
from app.graphql.dependencies import get_current_user
from app.repositories import UserRepository
from app.core.security import create_tokens_for_user, verify_password
from app.core.exceptions import ConflictError, ValidationError


def user_to_type(user) -> UserType:
    """Convierte un modelo User a UserType de GraphQL."""
    return UserType(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@strawberry.type
class AuthQuery:
    """Queries relacionadas con autenticación y usuarios."""
    
    @strawberry.field
    async def me(self, info: Info) -> UserType:
        """
        Obtiene el perfil del usuario autenticado.
        
        Requiere: Token de acceso válido
        """
        user = await get_current_user(info)
        return user_to_type(user)


@strawberry.type
class AuthMutation:
    """Mutaciones relacionadas con autenticación y usuarios."""
    
    @strawberry.mutation
    async def register(self, info: Info, input: RegisterInput) -> AuthPayload:
        """
        Registra un nuevo usuario.
        
        Args:
            input: Datos de registro (email, username, password, full_name)
            
        Returns:
            Tokens de acceso y datos del usuario
            
        Raises:
            ConflictError: Si el email o username ya existen
            ValidationError: Si los datos son inválidos
        """
        db = info.context["db"]
        repo = UserRepository(db)
        
        # Validaciones básicas
        if len(input.password) < 8:
            raise ValidationError("La contraseña debe tener al menos 8 caracteres")
        
        if len(input.username) < 3:
            raise ValidationError("El nombre de usuario debe tener al menos 3 caracteres")
        
        # Verificar disponibilidad
        if await repo.exists_email(input.email):
            raise ConflictError("El email ya está registrado")
        
        if await repo.exists_username(input.username):
            raise ConflictError("El nombre de usuario ya existe")
        
        # Crear usuario
        user = await repo.create(
            email=input.email,
            username=input.username,
            password=input.password,
            full_name=input.full_name,
        )
        
        # Generar tokens
        tokens = create_tokens_for_user(str(user.id), user.role)
        
        return AuthPayload(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type=tokens["token_type"],
            user=user_to_type(user),
        )
    
    @strawberry.mutation
    async def login(self, info: Info, input: LoginInput) -> AuthPayload:
        """
        Inicia sesión con username/email y contraseña.
        
        Args:
            input: Credenciales (username, password)
            
        Returns:
            Tokens de acceso y datos del usuario
            
        Raises:
            ValidationError: Si las credenciales son inválidas
        """
        db = info.context["db"]
        repo = UserRepository(db)
        
        # Autenticar usuario
        user = await repo.authenticate(input.username, input.password)
        
        if not user:
            raise ValidationError("Credenciales inválidas")
        
        # Generar tokens
        tokens = create_tokens_for_user(str(user.id), user.role)
        
        return AuthPayload(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type=tokens["token_type"],
            user=user_to_type(user),
        )
    
    @strawberry.mutation
    async def logout(self, info: Info) -> MessagePayload:
        """
        Cierra sesión del usuario.
        
        Nota: En una implementación completa, agregarías el token
        a una blacklist en Redis.
        
        Requiere: Token de acceso válido
        """
        # Verificar que el usuario está autenticado
        await get_current_user(info)
        
        # En producción: agregar token a blacklist en Redis
        # token = info.context["request"].headers.get("Authorization").split()[1]
        # await redis.setex(f"blacklist:{token}", expiry, "1")
        
        return MessagePayload(
            success=True,
            message="Sesión cerrada exitosamente"
        )
    
    @strawberry.mutation
    async def update_profile(
        self,
        info: Info,
        input: UpdateProfileInput
    ) -> UserType:
        """
        Actualiza el perfil del usuario autenticado.
        
        Requiere: Token de acceso válido
        
        Args:
            input: Campos a actualizar (email, full_name)
            
        Returns:
            Usuario actualizado
        """
        db = info.context["db"]
        user = await get_current_user(info)
        repo = UserRepository(db)
        
        # Verificar email único si se está cambiando
        if input.email and input.email.lower() != user.email:
            if await repo.exists_email(input.email):
                raise ConflictError("El email ya está en uso")
        
        # Actualizar
        updated_user = await repo.update(
            user=user,
            email=input.email,
            full_name=input.full_name,
        )
        
        return user_to_type(updated_user)
    
    @strawberry.mutation
    async def change_password(
        self,
        info: Info,
        input: ChangePasswordInput
    ) -> MessagePayload:
        """
        Cambia la contraseña del usuario autenticado.
        
        Requiere: Token de acceso válido
        
        Args:
            input: Contraseña actual y nueva
            
        Returns:
            Mensaje de éxito
        """
        db = info.context["db"]
        user = await get_current_user(info)
        repo = UserRepository(db)
        
        # Verificar contraseña actual
        if not verify_password(input.current_password, user.password_hash):
            raise ValidationError("Contraseña actual incorrecta")
        
        # Validar nueva contraseña
        if len(input.new_password) < 8:
            raise ValidationError("La nueva contraseña debe tener al menos 8 caracteres")
        
        # Actualizar contraseña
        await repo.update(user=user, password=input.new_password)
        
        return MessagePayload(
            success=True,
            message="Contraseña actualizada exitosamente"
        )
