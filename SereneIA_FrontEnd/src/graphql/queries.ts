import { gql } from '@apollo/client';

// ==================== USER QUERIES ====================
// Backend returns UserType: id, email, username, full_name, role, is_active, created_at

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      username
      fullName
      role
      isActive
      createdAt
    }
  }
`;

// ==================== CONVERSATION QUERIES ====================
// Backend returns ConversationListPayload with conversations array

export const GET_CONVERSATIONS = gql`
  query GetConversations($limit: Int, $offset: Int, $includeArchived: Boolean) {
    conversations(limit: $limit, offset: $offset, includeArchived: $includeArchived) {
      conversations {
        id
        title
        lastMessagePreview
        createdAt
        updatedAt
        isArchived
      }
      total
      hasMore
    }
  }
`;

// Backend returns ChatMessage: id, type (HUMAN/AI), content, created_at
export const GET_CONVERSATION_HISTORY = gql`
  query GetConversationHistory($conversationId: UUID!) {
    conversationHistory(conversationId: $conversationId) {
      id
      type
      content
      createdAt
    }
  }
`;
