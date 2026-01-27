import type { Conversation, Message, ChatbotResponse } from '../types';

const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Mock conversations database
let mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    userId: 'user1',
    title: 'Consulta sobre integración N8N',
    createdAt: new Date('2025-01-10').toISOString(),
    updatedAt: new Date('2025-01-15').toISOString(),
    messageCount: 5,
  },
  {
    id: 'conv-2',
    userId: 'user1',
    title: 'Arquitectura del sistema SereneIA',
    createdAt: new Date('2025-01-12').toISOString(),
    updatedAt: new Date('2025-01-14').toISOString(),
    messageCount: 8,
  },
  {
    id: 'conv-3',
    userId: 'user1',
    title: 'Configuración de PostgreSQL',
    createdAt: new Date('2025-01-13').toISOString(),
    updatedAt: new Date('2025-01-13').toISOString(),
    messageCount: 3,
  },
];

// Mock messages database
const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      role: 'user',
      content: '¿Cómo integro N8N con el backend?',
      timestamp: new Date('2025-01-10T10:00:00').toISOString(),
      status: 'sent',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      role: 'assistant',
      content: 'Para integrar N8N con tu backend FastAPI, necesitas:\n\n1. Crear un webhook en N8N\n2. Configurar los endpoints en FastAPI\n3. Establecer la comunicación por HTTP\n\n¿Necesitas detalles de configuración?',
      timestamp: new Date('2025-01-10T10:01:00').toISOString(),
      status: 'sent',
    },
  ],
  'conv-2': [
    {
      id: 'msg-3',
      conversationId: 'conv-2',
      role: 'user',
      content: 'Explícame la arquitectura completa de SereneIA',
      timestamp: new Date('2025-01-12T14:00:00').toISOString(),
      status: 'sent',
    },
    {
      id: 'msg-4',
      conversationId: 'conv-2',
      role: 'assistant',
      content: 'SereneIA está dividida en tres componentes principales:\n\n📱 **Frontend**: React + TypeScript + Tailwind CSS\n🔧 **Backend**: FastAPI + Strawberry GraphQL + PostgreSQL\n🤖 **Chatbot**: N8N + Ollama (Qwen3:4b) + PostgreSQL\n\nEl flujo es: Frontend → GraphQL → Backend → Webhook → Chatbot → Respuesta\n\n¿Quieres detalles de algún módulo específico?',
      timestamp: new Date('2025-01-12T14:01:00').toISOString(),
      status: 'sent',
    },
  ],
  'conv-3': [
    {
      id: 'msg-5',
      conversationId: 'conv-3',
      role: 'user',
      content: '¿Cómo configuro PostgreSQL?',
      timestamp: new Date('2025-01-13T09:00:00').toISOString(),
      status: 'sent',
    },
  ],
};

// Chatbot responses - simulating AI responses
const botResponses = [
  'Excelente pregunta. Te lo explico en detalle...',
  'Esto es muy importante en la arquitectura de SereneIA. Permíteme desarrollarlo...',
  'Basándome en los estándares de la aplicación, te recomiendo...',
  'Considerando la integración con todos los módulos...',
  'De acuerdo a la documentación técnica...',
];

export const chatService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    await delay(500);
    return mockConversations.filter(c => c.userId === userId);
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    await delay(400);
    return mockMessages[conversationId] || [];
  },

  async createConversation(userId: string, firstMessage: string): Promise<Conversation> {
    await delay(300);
    const newConversation: Conversation = {
      id: 'conv-' + Date.now(),
      userId,
      title: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 1,
    };
    mockConversations.push(newConversation);
    mockMessages[newConversation.id] = [];
    return newConversation;
  },

  async sendMessage(conversationId: string, userMessage: string, userId: string): Promise<ChatbotResponse> {
    await delay(600);

    // Add user message
    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      conversationId,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = [];
    }
    mockMessages[conversationId].push(userMsg);

    // Simulate bot response
    await delay(1000);
    
    const botResponse: Message = {
      id: 'msg-' + (Date.now() + 1),
      conversationId,
      role: 'assistant',
      content: `${botResponses[Math.floor(Math.random() * botResponses.length)]} ${userMessage}\n\nEsto es una respuesta simulada del chatbot basada en ${conversationId}. En producción, esto vendría del modelo LLM Ollama Qwen3:4b conectado a través de N8N.`,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    mockMessages[conversationId].push(botResponse);

    // Update conversation
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.messageCount += 2;
      conv.updatedAt = new Date().toISOString();
      conv.lastMessage = botResponse;
    }

    return {
      conversationId,
      message: botResponse,
      status: 'completed',
    };
  },

  async deleteConversation(conversationId: string): Promise<boolean> {
    await delay(300);
    mockConversations = mockConversations.filter(c => c.id !== conversationId);
    delete mockMessages[conversationId];
    return true;
  },

  async updateConversationTitle(conversationId: string, title: string): Promise<boolean> {
    await delay(200);
    const conv = mockConversations.find(c => c.id === conversationId);
    if (conv) {
      conv.title = title;
      return true;
    }
    return false;
  },
};
