"""
Schema GraphQL principal.
Combina todos los queries y mutations usando Strawberry.
"""
import strawberry
from strawberry.fastapi import GraphQLRouter
from strawberry.types import Info
from fastapi import Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.graphql.resolvers import AuthQuery, AuthMutation, ConversationQuery, ConversationMutation
from app.core.database import get_db_session
from app.core.exceptions import AppException


@strawberry.type
class Query(AuthQuery, ConversationQuery):
    """
    Query raíz de GraphQL.
    Combina todas las queries de la aplicación.
    """
    
    @strawberry.field
    def ping(self) -> str:
        """Health check simple."""
        return "pong"


@strawberry.type
class Mutation(AuthMutation, ConversationMutation):
    """
    Mutation raíz de GraphQL.
    Combina todas las mutations de la aplicación.
    """
    pass


# Crear schema de Strawberry
schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
)


async def get_graphql_context(
    request: Request,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Contexto inyectado en cada resolver de GraphQL.
    
    Contiene:
    - request: Request de FastAPI (para headers, etc.)
    - db: Sesión de base de datos
    """
    return {
        "request": request,
        "db": db,
    }


# Router de GraphQL para montar en FastAPI
graphql_router = GraphQLRouter(
    schema=schema,
    context_getter=get_graphql_context,
    graphiql=True,  # Habilita GraphiQL en desarrollo
    path="/",
)
