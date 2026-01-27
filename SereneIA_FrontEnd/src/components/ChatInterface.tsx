import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Trash2, Loader } from 'lucide-react';
import { Button, EmptyState, LoadingSpinner } from './Common';
import { useChatStore } from '../store';
import * as chatService from '../services/chatService';
import type { Message } from '../types';

interface ChatWindowProps {
  conversationId: string | null;
}

// Mock messages para visualización
const MOCK_MESSAGES: Message[] = [
  {
    id: 'mock-1',
    conversationId: 'conv-1',
    role: 'assistant',
    content: '¡Hola! 👋 Soy SereneIA, tu asistente de bienestar emocional. Estoy aquí para escucharte y acompañarte. ¿Cómo te sientes hoy?',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'mock-2',
    conversationId: 'conv-1',
    role: 'user',
    content: 'Hola, me siento un poco ansioso últimamente.',
    timestamp: new Date(Date.now() - 540000).toISOString(),
  },
  {
    id: 'mock-3',
    conversationId: 'conv-1',
    role: 'assistant',
    content: 'Entiendo que te sientas así. La ansiedad es algo que muchas personas experimentan. ¿Hay algo específico que te esté causando esta sensación? A veces hablar sobre ello puede ayudar a identificar patrones y encontrar formas de manejarlo mejor.',
    timestamp: new Date(Date.now() - 480000).toISOString(),
  },
  {
    id: 'mock-4',
    conversationId: 'conv-1',
    role: 'user',
    content: 'Creo que es por el trabajo y algunas responsabilidades que tengo.',
    timestamp: new Date(Date.now() - 420000).toISOString(),
  },
  {
    id: 'mock-5',
    conversationId: 'conv-1',
    role: 'assistant',
    content: '💙 Es completamente válido sentirse así con las presiones del trabajo. Te propongo algunos ejercicios de respiración que podrían ayudarte:\n\n1. Respiración 4-7-8: Inhala por 4 segundos, mantén por 7, exhala por 8\n2. Toma pausas breves cada hora\n3. Prioriza tus tareas en orden de importancia\n\n¿Te gustaría que exploráramos alguna de estas técnicas?',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
];

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, setMessages } = useChatStore();
  
  // Usar mensajes mock si no hay mensajes reales
  const displayMessages = messages.length > 0 ? messages : MOCK_MESSAGES;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  const loadMessages = async () => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const msgs = await chatService.getMessages(conversationId);
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || isLoading) return;

    setIsLoading(true);
    try {
      const response = await chatService.sendMessage(conversationId, input, '');
      setInput('');
      await loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon="💬"
          title="Select a conversation"
          description="Choose an existing conversation or start a new one"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-transparent">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner message="Loading messages..." />
          </div>
        ) : (
          displayMessages.map((msg: Message) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-md px-5 py-4 rounded-2xl shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-rose-500 to-purple-600 text-white rounded-br-none'
                    : 'bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-none border border-amber-200/50'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-rose-100' : 'text-gray-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="border-t border-amber-200/50 p-6 bg-gradient-to-r from-amber-50/50 to-rose-50/50 backdrop-blur-sm">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            disabled={isLoading}
            className="flex-1 px-5 py-3 rounded-2xl border-2 border-amber-200 bg-white/80 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:opacity-50 shadow-sm"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading || !input.trim()}
            className="px-6 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLoading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Mock conversations para visualización
const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    title: '💭 Manejo de ansiedad',
    userId: 'user1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
    lastMessage: 'Te propongo algunos ejercicios de respiración...',
  },
  {
    id: 'conv-2',
    title: '🌙 Problemas de sueño',
    userId: 'user1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    lastMessage: 'Establecer una rutina nocturna puede ayudarte...',
  },
  {
    id: 'conv-3',
    title: '💪 Motivación personal',
    userId: 'user1',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    lastMessage: 'Los pequeños pasos son igual de importantes...',
  },
  {
    id: 'conv-4',
    title: '🧘 Meditación guiada',
    userId: 'user1',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    lastMessage: 'Comencemos con 5 minutos al día...',
  },
  {
    id: 'conv-5',
    title: '❤️ Autocuidado diario',
    userId: 'user1',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
    lastMessage: 'Recuerda: tu bienestar es una prioridad...',
  },
  {
    id: 'conv-6',
    title: '🌱 Crecimiento personal',
    userId: 'user1',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
    lastMessage: 'El cambio empieza con la auto-reflexión...',
  },
];

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  selectedId: string | null;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedId,
}) => {
  const { conversations, setConversations } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Usar conversaciones mock si no hay conversaciones reales
  const displayConversations = conversations.length > 0 ? conversations : MOCK_CONVERSATIONS;

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const convs = await chatService.getConversations('user1');
      setConversations(convs);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (window.confirm('Delete this conversation?')) {
      try {
        await chatService.deleteConversation(id);
        await loadConversations();
        if (selectedId === id) {
          onSelectConversation('');
        }
      } catch (err) {
        console.error('Error deleting conversation:', err);
      }
    }
  };

  return (
    <div className="w-80 border-r border-amber-200/50 bg-gradient-to-b from-white/80 to-amber-50/50 backdrop-blur-md flex flex-col shadow-lg">
      <div className="p-4 border-b border-amber-200/50">
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          onClick={() => {
            // Create new conversation
          }}
        >
          <Plus size={20} />
          <span>Nueva Conversación</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          displayConversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden ${
                selectedId === conv.id
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white/70 hover:bg-white hover:shadow-md text-gray-800 border border-amber-200/50'
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-1 truncate">{conv.title}</p>
                  <p className={`text-xs truncate ${
                    selectedId === conv.id
                      ? 'text-rose-100'
                      : 'text-gray-500'
                  }`}>
                    {conv.lastMessage || 'Sin mensajes'}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    selectedId === conv.id
                      ? 'hover:bg-white/20 text-white'
                      : 'hover:bg-red-100 text-gray-400 hover:text-red-500'
                  }`}
                  title="Eliminar conversación"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className={`text-xs mt-2 ${
                selectedId === conv.id
                  ? 'text-rose-100'
                  : 'text-gray-400'
              }`}>
                {new Date(conv.updatedAt).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
