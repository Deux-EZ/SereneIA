"""
Tipos GraphQL de la aplicación.
"""
from app.graphql.types.auth_types import (
    UserType,
    AuthPayload,
    MessagePayload,
    RegisterInput,
    LoginInput,
    UpdateProfileInput,
    ChangePasswordInput,
)
from app.graphql.types.chat_types import (
    ChatMessagePayload,
    ChatMessage,
    MessageType,
    ConversationType,
    ConversationPayload,
    ConversationListPayload,
    HealthStatus,
    SendMessageInput,
    CreateConversationInput,
    UpdateConversationInput,
)

__all__ = [
    # Auth types
    "UserType",
    "AuthPayload",
    "MessagePayload",
    "RegisterInput",
    "LoginInput",
    "UpdateProfileInput",
    "ChangePasswordInput",
    # Chat types
    "ChatMessagePayload",
    "ChatMessage",
    "MessageType",
    "ConversationType",
    "ConversationPayload",
    "ConversationListPayload",
    "HealthStatus",
    "SendMessageInput",
    "CreateConversationInput",
    "UpdateConversationInput",
]
