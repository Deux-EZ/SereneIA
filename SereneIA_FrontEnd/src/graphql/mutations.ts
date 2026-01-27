import { gql } from '@apollo/client';

// ==================== AUTH MUTATIONS ====================
// Backend uses Input types: LoginInput { username, password }, RegisterInput { email, username, password, full_name }

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      tokenType
      user {
        id
        email
        username
        fullName
        role
        isActive
        createdAt
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      tokenType
      user {
        id
        email
        username
        fullName
        role
        isActive
        createdAt
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

// ==================== CONVERSATION MUTATIONS ====================
// Backend uses Input types: CreateConversationInput { title? }, SendMessageInput { conversationId, message }
// Backend returns: ChatMessagePayload { success, response, conversationId, error }

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($input: CreateConversationInput) {
    createConversation(input: $input) {
      success
      message
      conversation {
        id
        title
        createdAt
        updatedAt
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      success
      response
      conversationId
      error
    }
  }
`;

export const DELETE_CONVERSATION = gql`
  mutation DeleteConversation($conversationId: UUID!) {
    deleteConversation(conversationId: $conversationId) {
      success
      message
      error
    }
  }
`;

export const ARCHIVE_CONVERSATION = gql`
  mutation ArchiveConversation($conversationId: UUID!) {
    archiveConversation(conversationId: $conversationId) {
      success
      message
      error
    }
  }
`;
