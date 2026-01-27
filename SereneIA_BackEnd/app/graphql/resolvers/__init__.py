"""
Resolvers de GraphQL.
"""
from app.graphql.resolvers.auth_resolvers import AuthQuery, AuthMutation
from app.graphql.resolvers.conversation_resolvers import ConversationQuery, ConversationMutation

__all__ = [
    "AuthQuery", 
    "AuthMutation", 
    "ConversationQuery", 
    "ConversationMutation"
]
