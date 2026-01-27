"""
Configuración centralizada de la aplicación.
Usa pydantic-settings para validación y carga de variables de entorno.
"""
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configuración de la aplicación cargada desde variables de entorno.
    Sigue el principio 12-factor app para configuración externalizada.
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # ========================
    # Base de Datos (solo para usuarios)
    # ========================
    database_url: str = "postgresql+asyncpg://postgres:123456@localhost:5432/sereneia_users"
    
    # ========================
    # JWT Configuration
    # ========================
    jwt_secret_key: str = "CAMBIAR_EN_PRODUCCION_usa_openssl_rand_base64_32"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7
    
    # ========================
    # N8N Webhook Configuration
    # ========================
    n8n_base_url: str = "http://localhost:5678"
    n8n_webhook_path: str = "/webhook/0d9040d7-6c66-48b7-8ccd-914e8ddfa6a9"
    n8n_timeout_seconds: int = 120  # LLM puede tardar
    
    # ========================
    # CORS
    # ========================
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # ========================
    # Application
    # ========================
    debug: bool = True
    app_name: str = "SereneIA Backend"
    app_version: str = "1.0.0"
    
    @property
    def n8n_webhook_url(self) -> str:
        """URL completa del webhook de N8N."""
        return f"{self.n8n_base_url}{self.n8n_webhook_path}"
    
    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Permite pasar CORS_ORIGINS como string JSON o lista."""
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        return v


@lru_cache()
def get_settings() -> Settings:
    """
    Singleton para obtener la configuración.
    Usa caché para evitar recargar en cada request.
    """
    return Settings()


# Instancia global para imports directos
settings = get_settings()
