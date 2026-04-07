"""
SereneIA Backend API
====================

Aplicación FastAPI con GraphQL (Strawberry) para el sistema SereneIA.

Arquitectura:
- Backend (este): Autenticación, autorización, gestión de conversaciones y proxy a N8N
- N8N: Maneja el chatbot, LLM (Ollama), memoria de chat (Postgres) y RAG (Qdrant)
- Frontend: Interfaz de usuario React

Flujo de datos:
Frontend → GraphQL (Backend) → Webhook (N8N) → AI Agent → Respuesta → Frontend

Tablas en Backend (sereneia_users):
- users: Autenticación y datos de usuarios
- conversations: Metadatos de conversaciones (título, fechas, archivado)

Tablas en N8N (n8n):
- n8n_chat_histories: Mensajes de conversación (session_id = conversation.id)
"""
import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.init import startup_tasks, shutdown_tasks
from app.core.exceptions import AppException
from app.graphql import graphql_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("sereneia")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle de la aplicación.
    
    Startup:
    - Inicializa tablas de base de datos
    - Crea usuario administrador por defecto
    
    Shutdown:
    - Cierra conexiones de base de datos
    """
    # Startup
    await startup_tasks()
    yield
    # Shutdown
    await shutdown_tasks()


# Crear aplicación FastAPI
app = FastAPI(
    title=settings.app_name,
    description=__doc__,
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
)


# ========================
# Middleware
# ========================

# CORS debe estar configurado ANTES de montar cualquier ruta
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes en desarrollo
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = time.time()

    # Extraer usuario del header Authorization si existe
    auth = request.headers.get("authorization", "")
    user_hint = "anon"
    if auth.startswith("Bearer "):
        user_hint = f"jwt:{auth[7:15]}..."

    logger.info(
        f"[{request_id}] → {request.method} {request.url.path} | "
        f"ip={request.client.host} | user={user_hint}"
    )

    response = await call_next(request)
    elapsed = round((time.time() - start) * 1000)

    logger.info(
        f"[{request_id}] ← {response.status_code} | {elapsed}ms"
    )
    return response


# ========================
# Exception Handlers
# ========================

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handler para excepciones personalizadas de la aplicación."""
    return JSONResponse(
        status_code=400,
        content={
            "error": True,
            "code": exc.code,
            "message": exc.message,
        }
    )


# ========================
# Routers
# ========================

# Montar GraphQL en /graphql
app.include_router(graphql_router, prefix="/graphql", tags=["GraphQL"])


# ========================
# Endpoints REST básicos
# ========================

@app.get("/", tags=["Root"])
async def root():
    """
    Información del API.
    """
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "graphql_endpoint": "/graphql",
        "graphiql": "/graphql" if settings.debug else "disabled",
        "docs": "/docs" if settings.debug else "disabled",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check del backend.
    
    Para un health check completo incluyendo N8N y DB,
    usa la query GraphQL `health`.
    """
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
    }
