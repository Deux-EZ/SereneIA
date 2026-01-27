"""
Resolvers de GraphQL.
"""
from app.graphql.resolvers.auth_resolvers import AuthQuery, AuthMutation
from app.graphql.resolvers.chat_resolvers import ChatQuery, ChatMutation

__all__ = ["AuthQuery", "AuthMutation", "ChatQuery", "ChatMutation"]
