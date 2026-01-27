"""
Configuración de base de datos con SQLAlchemy async.
Solo se usa para la tabla de usuarios (auth).
N8N maneja su propia persistencia de conversaciones.
"""
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    """Clase base para todos los modelos SQLAlchemy."""
    pass


# Engine asíncrono con pool de conexiones
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# Factory de sesiones asíncronas
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncSession:
    """
    Dependency para obtener una sesión de base de datos.
    Uso: db = Depends(get_db_session)
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_database() -> None:
    """
    Inicializa las tablas en la base de datos.
    Se ejecuta al iniciar la aplicación.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_database() -> None:
    """Cierra las conexiones de la base de datos."""
    await engine.dispose()
