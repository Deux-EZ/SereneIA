import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  userAvatar?: string;
  userName?: string;
}

// Componente para renderizar el avatar
const Avatar: React.FC<{ 
  isUser: boolean; 
  avatar?: string; 
  name?: string;
}> = ({ isUser, avatar, name }) => {
  if (isUser) {
    if (avatar) {
      return (
        <img 
          src={avatar} 
          alt={name || 'Usuario'} 
          className="w-10 h-10 rounded-full object-cover border-2 border-purple-300 shadow-md"
        />
      );
    }
    // Avatar por defecto para usuario
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md border-2 border-purple-300">
        <User size={20} className="text-white" />
      </div>
    );
  }
  
  // Avatar de SerenAI (bot)
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center shadow-md border-2 border-amber-300 animate-pulse-slow">
      <Bot size={20} className="text-white" />
    </div>
  );
};

// Componente principal del mensaje
export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  userAvatar, 
  userName 
}) => {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const isPending = message.status === 'pending';

  return (
    <div 
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        <Avatar isUser={isUser} avatar={userAvatar} name={userName} />
      </div>

      {/* Mensaje */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {/* Nombre */}
        <span className={`text-xs font-medium mb-1 ${isUser ? 'text-purple-600' : 'text-amber-600'}`}>
          {isUser ? (userName || 'Tú') : '✨ SerenAI'}
        </span>

        {/* Burbuja del mensaje */}
        <div
          className={`
            px-5 py-4 rounded-2xl shadow-lg transition-all duration-300
            ${isUser
              ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white rounded-tr-sm'
              : isError
                ? 'bg-gradient-to-br from-red-50 to-red-100 text-red-700 rounded-tl-sm border border-red-200'
                : 'bg-gradient-to-br from-white to-amber-50/50 text-gray-800 rounded-tl-sm border border-amber-200/50 shadow-amber-100/50'
            }
            ${isPending ? 'opacity-70' : ''}
            hover:shadow-xl
          `}
        >
          {/* Contenido con Markdown */}
          <div className={`
            prose prose-sm max-w-none
            ${isUser 
              ? 'prose-invert prose-p:text-white prose-strong:text-white prose-li:text-white' 
              : 'prose-gray prose-strong:text-purple-700 prose-li:marker:text-amber-500'
            }
          `}>
            <ReactMarkdown
              components={{
                // Personalizar párrafos
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                ),
                // Personalizar listas
                ul: ({ children }) => (
                  <ul className="list-disc ml-4 space-y-1 my-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ml-4 space-y-1 my-2">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                // Personalizar negritas
                strong: ({ children }) => (
                  <strong className={`font-bold ${isUser ? 'text-white' : 'text-purple-700'}`}>
                    {children}
                  </strong>
                ),
                // Personalizar cursivas
                em: ({ children }) => (
                  <em className="italic">{children}</em>
                ),
                // Personalizar código inline
                code: ({ children }) => (
                  <code className={`
                    px-1.5 py-0.5 rounded text-sm font-mono
                    ${isUser ? 'bg-white/20' : 'bg-purple-100 text-purple-700'}
                  `}>
                    {children}
                  </code>
                ),
                // Personalizar bloques de código
                pre: ({ children }) => (
                  <pre className={`
                    p-3 rounded-lg my-2 overflow-x-auto text-sm
                    ${isUser ? 'bg-white/10' : 'bg-gray-100'}
                  `}>
                    {children}
                  </pre>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Timestamp */}
          <p className={`
            text-xs mt-3 pt-2 border-t 
            ${isUser 
              ? 'text-purple-200 border-purple-400/30' 
              : isError 
                ? 'text-red-400 border-red-200' 
                : 'text-gray-400 border-amber-200/50'
            }
          `}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
            {isPending && (
              <span className="ml-2 inline-flex items-center gap-1">
                <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                Enviando
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente de indicador de escritura mejorado
export const TypingIndicator: React.FC = () => (
  <div className="flex gap-3 animate-fade-in">
    <div className="flex-shrink-0 mt-1">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center shadow-md border-2 border-amber-300 animate-pulse">
        <Bot size={20} className="text-white" />
      </div>
    </div>
    <div className="flex flex-col items-start">
      <span className="text-xs font-medium mb-1 text-amber-600">✨ SerenAI</span>
      <div className="bg-gradient-to-br from-white to-amber-50/50 px-5 py-4 rounded-2xl rounded-tl-sm border border-amber-200/50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2.5 h-2.5 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2.5 h-2.5 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '300ms' }}></span>
          </div>
          <span className="text-sm text-gray-500 font-medium">Escribiendo algo especial para ti...</span>
        </div>
      </div>
    </div>
  </div>
);

export default MessageBubble;
