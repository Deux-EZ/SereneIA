"""
SereneIA Backend API
====================

Aplicación FastAPI con GraphQL (Strawberry) para el sistema SereneIA.

Arquitectura:
- Backend (este): Autenticación, autorización y proxy a N8N
- N8N: Maneja el chatbot, LLM (Ollama), memoria (Postgres) y RAG (Qdrant)
- Frontend: Interfaz de usuario React

Flujo de datos:
Frontend → GraphQL (Backend) → Webhook (N8N) → AI Agent → Respuesta → Frontend
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_database, close_database
from app.core.exceptions import AppException
from app.graphql import graphql_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle de la aplicación.
    
    Startup:
    - Inicializa tablas de base de datos
    
    Shutdown:
    - Cierra conexiones de base de datos
    """
    # Startup
    await init_database()
    yield
    # Shutdown
    await close_database()


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
