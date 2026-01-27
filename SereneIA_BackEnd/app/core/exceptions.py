"""
Excepciones personalizadas de la aplicación.
Permiten un manejo de errores consistente y tipado.
"""
from typing import Optional


class AppException(Exception):
    """Excepción base de la aplicación."""
    
    def __init__(self, message: str, code: str = "APP_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class AuthenticationError(AppException):
    """Error de autenticación (credenciales inválidas, token expirado, etc.)."""
    
    def __init__(self, message: str = "No autenticado"):
        super().__init__(message, code="AUTHENTICATION_ERROR")


class AuthorizationError(AppException):
    """Error de autorización (permisos insuficientes)."""
    
    def __init__(self, message: str = "No tienes permisos para realizar esta acción"):
        super().__init__(message, code="AUTHORIZATION_ERROR")


class NotFoundError(AppException):
    """Recurso no encontrado."""
    
    def __init__(self, resource: str = "Recurso", identifier: Optional[str] = None):
        message = f"{resource} no encontrado"
        if identifier:
            message = f"{resource} con id '{identifier}' no encontrado"
        super().__init__(message, code="NOT_FOUND")


class ValidationError(AppException):
    """Error de validación de datos."""
    
    def __init__(self, message: str = "Datos inválidos"):
        super().__init__(message, code="VALIDATION_ERROR")


class ConflictError(AppException):
    """Conflicto (ej: email ya registrado)."""
    
    def __init__(self, message: str = "El recurso ya existe"):
        super().__init__(message, code="CONFLICT")


class ExternalServiceError(AppException):
    """Error en servicio externo (N8N, etc.)."""
    
    def __init__(self, service: str = "Servicio externo", message: str = "Error de conexión"):
        super().__init__(f"{service}: {message}", code="EXTERNAL_SERVICE_ERROR")
