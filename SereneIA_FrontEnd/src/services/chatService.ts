import { apolloClient } from '../lib/apollo';
import { CREATE_CONVERSATION, SEND_MESSAGE } from '../graphql/mutations';
import { GET_CONVERSATIONS, GET_CONVERSATION_HISTORY } from '../graphql/queries';
import type { Conversation, Message, ChatbotResponse } from '../types';

/**
 * Transform backend conversation to frontend Conversation type
 * Backend: ConversationType { id, title, lastMessagePreview, createdAt, updatedAt, isArchived }
 */
function transformConversation(backendConv: any): Conversation {
  return {
    id: backendConv.id,
    userId: '',
    title: backendConv.title || 'Nueva conversación',
    createdAt: backendConv.createdAt,
    updatedAt: backendConv.updatedAt || backendConv.createdAt,
    messageCount: 0,
    lastMessagePreview: backendConv.lastMessagePreview || undefined,
  };
}

/**
 * Transform backend message to frontend Message type
 * Backend: ChatMessage { id, type (HUMAN/AI), content, createdAt }
 */
function transformMessage(backendMsg: any, conversationId: string): Message {
  return {
    id: String(backendMsg.id),
    conversationId,
    role: backendMsg.type === 'AI' ? 'assistant' : 'user',
    content: backendMsg.content,
    timestamp: backendMsg.createdAt,
    status: 'sent',
  };
}

export const chatService = {
  /**
   * Get all conversations for the current user
   * Backend returns: ConversationListPayload { conversations, total, hasMore }
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const result = await apolloClient.query({
        query: GET_CONVERSATIONS,
        variables: { limit: 50, offset: 0, includeArchived: false },
        fetchPolicy: 'network-only', // Always fetch fresh data
      });

      const data = result.data as any;
      if (data?.conversations?.conversations) {
        return data.conversations.conversations.map((conv: any) => ({
          ...transformConversation(conv),
          userId,
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  /**
   * Get messages for a specific conversation
   * Backend returns: ChatMessage[] { id, type, content, createdAt }
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const result = await apolloClient.query({
        query: GET_CONVERSATION_HISTORY,
        variables: { conversationId },
        fetchPolicy: 'network-only',
      });

      const data = result.data as any;
      if (data?.conversationHistory) {
        return data.conversationHistory.map((msg: any) => 
          transformMessage(msg, conversationId)
        );
      }

      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  /**
   * Create a new conversation
   * Backend expects: CreateConversationInput { title? }
   */
  async createConversation(userId: string, title?: string): Promise<Conversation> {
    try {
      const result = await apolloClient.mutate({
        mutation: CREATE_CONVERSATION,
        variables: { 
          input: title ? { title } : null // Input is optional
        },
        refetchQueries: [{ query: GET_CONVERSATIONS }],
      });

      const data = result.data as any;
      if (data?.createConversation?.conversation) {
        return {
          ...transformConversation(data.createConversation.conversation),
          userId,
        };
      }

      throw new Error(data?.createConversation?.message || 'Failed to create conversation');
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  /**
   * Send a message and get AI response
   * Backend expects: SendMessageInput { conversationId, message }
   * Backend returns: ChatMessagePayload { success, response, conversationId, error }
   */
  async sendMessage(conversationId: string, userMessage: string, _userId: string): Promise<ChatbotResponse> {
    try {
      const result = await apolloClient.mutate({
        mutation: SEND_MESSAGE,
        variables: {
          input: {
            conversationId,
            message: userMessage,
          },
        },
      });

      const data = result.data as any;
      if (data?.sendMessage?.success) {
        const { response } = data.sendMessage;
        
        // Return the AI response as a Message object
        return {
          conversationId,
          message: {
            id: 'ai-' + Date.now(),
            conversationId,
            role: 'assistant',
            content: response || 'No response received',
            timestamp: new Date().toISOString(),
            status: 'sent',
          },
          status: 'completed',
        };
      }

      // Handle error response from backend
      throw new Error(data?.sendMessage?.error || 'Failed to send message');
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Return error response
      return {
        conversationId,
        message: {
          id: 'error-' + Date.now(),
          conversationId,
          role: 'assistant',
          content: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta nuevamente.',
          timestamp: new Date().toISOString(),
          status: 'error',
        },
        status: 'completed', // Changed from 'error' to match type
      };
    }
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const { DELETE_CONVERSATION } = await import('../graphql/mutations');
      const result = await apolloClient.mutate({
        mutation: DELETE_CONVERSATION,
        variables: { conversationId },
        refetchQueries: [{ query: GET_CONVERSATIONS, variables: { limit: 50, offset: 0, includeArchived: false } }],
      });

      const data = result.data as any;
      return data?.deleteConversation?.success || false;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  },

  /**
   * Update conversation title (TODO: implement backend mutation)
   */
  async updateConversationTitle(_conversationId: string, _title: string): Promise<boolean> {
    console.warn('updateConversationTitle not implemented in backend');
    return false;
  },
};
