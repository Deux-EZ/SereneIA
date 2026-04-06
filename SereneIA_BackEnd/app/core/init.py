"""
Inicialización de la aplicación.
Contiene funciones para el lifespan de FastAPI.
- Crear tablas en la base de datos
- Crear usuario administrador por defecto
"""
import asyncio
from typing import Optional

from app.core.database import AsyncSessionLocal, init_database, close_database
from app.core.config import settings
from app.repositories import UserRepository
from app.models import User, UserRole


# Configuración del usuario admin por defecto
ADMIN_EMAIL = "admin@sereneia.com"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"  # ⚠️ CAMBIAR EN PRODUCCIÓN
ADMIN_FULL_NAME = "Administrador SereneIA"


async def create_admin_user() -> Optional[User]:
    """
    Crea el usuario administrador si no existe.
    
    Returns:
        Usuario admin creado o existente, None si falla
    """
    async with AsyncSessionLocal() as db:
        try:
            repo = UserRepository(db)
            
            # Verificar si ya existe
            existing = await repo.get_by_email(ADMIN_EMAIL)
            if existing:
                print(f"✅ Usuario admin ya existe: {ADMIN_EMAIL}")
                return existing
            
            # Crear usuario admin
            admin = await repo.create(
                email=ADMIN_EMAIL,
                username=ADMIN_USERNAME,
                password=ADMIN_PASSWORD,
                full_name=ADMIN_FULL_NAME,
                role=UserRole.ADMIN.value,
            )
            
            print(f"✅ Usuario admin creado: {ADMIN_EMAIL}")
            print(f"   📧 Email: {ADMIN_EMAIL}")
            print(f"   👤 Username: {ADMIN_USERNAME}")
            print(f"   🔑 Password: {ADMIN_PASSWORD}")
            print(f"   ⚠️  IMPORTANTE: Cambia la contraseña en producción!")
            
            return admin
            
        except Exception as e:
            print(f"❌ Error creando usuario admin: {e}")
            return None


async def _init_db_with_retry(max_retries: int = 10, delay: float = 5.0) -> bool:
    """
    Intenta conectarse a la BD con reintentos.
    Retorna True si tuvo éxito, False si agotó los intentos.
    """
    for attempt in range(1, max_retries + 1):
        try:
            await init_database()
            print(f"✅ Base de datos conectada (intento {attempt})")
            await create_admin_user()
            return True
        except Exception as e:
            print(f"⏳ BD no disponible (intento {attempt}/{max_retries}): {e}")
            if attempt < max_retries:
                await asyncio.sleep(delay)
    print("❌ No se pudo conectar a la BD después de todos los intentos")
    return False


async def startup_tasks():
    """
    Tareas de inicio de la aplicación.
    Se ejecuta en el lifespan de FastAPI.

    Arranca el servidor inmediatamente y reintenta la conexión
    a la BD en segundo plano — no crashea si la BD tarda en estar lista.
    """
    print("\n" + "="*60)
    print("🚀 Iniciando SerenAI Backend")
    print("="*60)

    # Intentar conectar rápido (3 intentos, 2s entre c/u)
    # Si no está lista, lanzar tarea en background y dejar que el servidor arranque
    for attempt in range(1, 4):
        try:
            print(f"\n📦 Conectando a la base de datos (intento {attempt}/3)...")
            await init_database()
            print("✅ Tablas creadas/verificadas correctamente")
            print("\n👤 Verificando usuario administrador...")
            await create_admin_user()
            print("\n" + "="*60)
            print("✅ SerenAI Backend iniciado correctamente")
            print("="*60 + "\n")
            return
        except Exception as e:
            print(f"⚠️  BD no disponible: {e}")
            if attempt < 3:
                await asyncio.sleep(2)

    # Si no conectó en los 3 intentos rápidos, arrancar en modo degradado
    # y seguir reintentando en background
    print("\n⚠️  Arrancando en modo degradado (BD no disponible)")
    print("🔄 Reintentando conexión a BD en segundo plano...")
    print("="*60 + "\n")
    asyncio.create_task(_init_db_with_retry(max_retries=20, delay=10.0))


async def shutdown_tasks():
    """
    Tareas de cierre de la aplicación.
    Se ejecuta en el lifespan de FastAPI.
    
    1. Cerrar conexiones de BD
    """
    print("\n" + "="*60)
    print("🔄 Cerrando SereneIA Backend...")
    print("="*60)
    
    await close_database()
    
    print("✅ Backend cerrado correctamente")
    print("="*60 + "\n")
