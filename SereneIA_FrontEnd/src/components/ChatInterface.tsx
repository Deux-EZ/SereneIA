import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Plus, Trash2, Loader, MessageCircle, RefreshCw, Sparkles } from 'lucide-react';
import { Button, EmptyState, LoadingSpinner } from './Common';
import { MessageBubble, TypingIndicator } from './MessageBubble';
import { useChatStore, useAuthStore } from '../store';
import { chatService } from '../services/chatService';
import type { Message, Conversation } from '../types';

interface ChatWindowProps {
  conversationId: string | null;
}

// Welcome message when starting a new conversation
const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  conversationId: '',
  role: 'assistant',
  content: '¡Hola! 👋 Soy SerenAI, tu asistente de bienestar emocional. Estoy aquí para escucharte y acompañarte. ¿Cómo te sientes hoy?',
  timestamp: new Date().toISOString(),
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    messages, 
    setMessages, 
    addMessage,
    updateMessageStatus,
    isLoading, 
    isSending,
    setLoading, 
    setSending,
    error,
    setError 
  } = useChatStore();
  
  const { user } = useAuthStore();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    } else {
      // Show welcome message for new conversations
      setMessages([WELCOME_MESSAGE]);
    }
  }, [conversationId]);

  // Focus input when conversation changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversationId]);

  const loadMessages = async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const msgs = await chatService.getMessages(conversationId);
      if (msgs.length === 0) {
        // Show welcome for empty conversations
        setMessages([{ ...WELCOME_MESSAGE, conversationId }]);
      } else {
        setMessages(msgs);
      }
    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError('Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || isSending) return;

    const userMessage: Message = {
      id: 'temp-' + Date.now(),
      conversationId,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // Optimistically add user message
    addMessage(userMessage);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(
        conversationId, 
        userMessage.content, 
        user?.id || ''
      );
      
      // Update user message status to 'sent'
      updateMessageStatus(userMessage.id, 'sent');
      
      // Add AI response
      if (response.message) {
        addMessage(response.message);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError('Error al enviar el mensaje. Intenta de nuevo.');
      
      // Update user message status to 'error'
      updateMessageStatus(userMessage.id, 'error');
      
      // Add error message from AI
      addMessage({
        id: 'error-' + Date.now(),
        conversationId,
        role: 'assistant',
        content: '❌ Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date().toISOString(),
        status: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-amber-50/30 to-rose-50/30">
        <EmptyState
          icon="💬"
          title="¡Bienvenido a SerenAI!"
          description="Selecciona una conversación existente o crea una nueva para comenzar"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-transparent">
      {/* Error banner */}
      {error && (
        <div className="px-6 py-3 bg-red-100 border-b border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent via-amber-50/20 to-rose-50/20">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center animate-pulse">
                <Sparkles size={32} className="text-white" />
              </div>
              <LoadingSpinner message="Cargando conversación..." />
            </div>
          </div>
        ) : (
          messages.map((msg: Message) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              userAvatar={user?.avatar}
              userName={user?.username}
            />
          ))
        )}
        
        {/* Typing indicator */}
        {isSending && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Mejorado */}
      <form onSubmit={handleSendMessage} className="border-t border-amber-200/50 p-4 md:p-6 bg-gradient-to-r from-amber-50/80 to-rose-50/80 backdrop-blur-md">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe cómo te sientes hoy... 💭"
              disabled={isSending}
              className="w-full px-5 py-4 pr-12 rounded-2xl border-2 border-amber-200/70 bg-white/90 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-300 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-300 text-base"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
              <Sparkles size={18} className={input.trim() ? 'text-purple-400' : ''} />
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSending || !input.trim()}
            className="px-6 py-4 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSending ? (
              <Loader size={22} className="animate-spin" />
            ) : (
              <Send size={22} className="transform rotate-0 hover:rotate-12 transition-transform" />
            )}
          </Button>
        </div>
        <p className="text-xs text-center mt-3 text-gray-400">
          SerenAI está aquí para escucharte 💜 Tus conversaciones son privadas y seguras
        </p>
      </form>
    </div>
  );
};

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  selectedId: string | null;
  onNewConversation: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedId,
  onNewConversation,
}) => {
  const { conversations, setConversations, isLoading, setLoading, setError } = useChatStore();
  const { user } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id]);

  const loadConversations = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const convs = await chatService.getConversations(user.id);
      setConversations(convs);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Error al cargar las conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadConversations();
    setIsRefreshing(false);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar esta conversación?')) {
      try {
        const success = await chatService.deleteConversation(id);
        if (success) {
          await loadConversations();
          if (selectedId === id) {
            onSelectConversation('');
          }
        } else {
          alert('Esta función aún no está disponible');
        }
      } catch (err) {
        console.error('Error deleting conversation:', err);
      }
    }
  };

  // Sort conversations by updatedAt (most recent first)
  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="w-80 border-r border-amber-200/30 bg-gradient-to-b from-white/95 via-amber-50/30 to-rose-50/30 backdrop-blur-xl flex flex-col shadow-xl">
      {/* Header con logo */}
      <div className="p-5 border-b border-amber-200/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">SerenAI</h2>
            <p className="text-xs text-gray-500">Tu espacio seguro 💜</p>
          </div>
        </div>
        
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={onNewConversation}
        >
          <Plus size={20} />
          <span>Nueva Conversación</span>
        </button>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conversaciones</span>
          <button
            className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-all"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Actualizar"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center animate-pulse mb-3">
              <MessageCircle size={24} className="text-white" />
            </div>
            <LoadingSpinner size="sm" />
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center">
              <MessageCircle size={32} className="text-amber-400" />
            </div>
            <p className="text-gray-600 font-medium">No tienes conversaciones</p>
            <p className="text-gray-400 text-sm mt-1">¡Crea una nueva para comenzar a chatear! ✨</p>
          </div>
        ) : (
          sortedConversations.map((conv: Conversation, index: number) => (
            <div
              key={conv.id}
              className={`
                p-4 rounded-xl cursor-pointer transition-all duration-300 group relative overflow-hidden
                ${selectedId === conv.id
                  ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 text-white shadow-lg scale-[1.02] border-none'
                  : 'bg-white/80 hover:bg-white hover:shadow-lg text-gray-800 border border-amber-200/50 hover:border-purple-200'
                }
              `}
              onClick={() => onSelectConversation(conv.id)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Decoración de fondo para elemento seleccionado */}
              {selectedId === conv.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
              )}
              
              <div className="flex items-start justify-between gap-2 relative">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Icono de conversación */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${selectedId === conv.id 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-br from-purple-100 to-pink-100'
                    }
                  `}>
                    <MessageCircle size={14} className={selectedId === conv.id ? 'text-white' : 'text-purple-500'} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-1 truncate">
                      {conv.title || 'Nueva conversación'}
                    </p>
                    <p className={`text-xs ${
                      selectedId === conv.id ? 'text-purple-100' : 'text-gray-400'
                    }`}>
                      {new Date(conv.updatedAt).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className={`
                    p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 
                    ${selectedId === conv.id
                      ? 'hover:bg-white/20 text-white/80 hover:text-white'
                      : 'hover:bg-red-50 text-gray-300 hover:text-red-500'
                    }
                  `}
                  title="Eliminar conversación"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-amber-200/30 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
        <p className="text-xs text-center text-gray-400">
          Hecho con 💜 para tu bienestar
        </p>
      </div>
    </div>
  );
};
