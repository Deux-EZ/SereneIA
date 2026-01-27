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


async def startup_tasks():
    """
    Tareas de inicio de la aplicación.
    Se ejecuta en el lifespan de FastAPI.
    
    1. Crear/verificar tablas en la BD
    2. Crear usuario admin por defecto
    """
    print("\n" + "="*60)
    print("🚀 Iniciando SereneIA Backend")
    print("="*60)
    
    # 1. Inicializar base de datos (crear tablas)
    print("\n📦 Inicializando base de datos...")
    try:
        await init_database()
        print("✅ Tablas creadas/verificadas correctamente")
    except Exception as e:
        print(f"❌ Error inicializando BD: {e}")
        raise
    
    # 2. Crear usuario admin
    print("\n👤 Verificando usuario administrador...")
    await create_admin_user()
    
    print("\n" + "="*60)
    print("✅ SereneIA Backend iniciado correctamente")
    print("="*60)
    print(f"📍 GraphQL: http://0.0.0.0:8000/graphql")
    print(f"📍 Docs: http://0.0.0.0:8000/docs")
    print("="*60 + "\n")


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
