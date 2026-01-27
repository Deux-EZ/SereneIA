import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Conversation, Message } from '../types';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      setUser: (user: User) => set({
        user,
        isAuthenticated: true,
        error: null,
      }),
      
      logout: () => {
        // Clear token from localStorage
        localStorage.removeItem('sereneia_token');
        // Clear persisted auth state
        localStorage.removeItem('sereneia-auth');
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
        // Force reload to clear any cached state
        window.location.href = '/';
      },
      
      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'sereneia-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

interface ChatStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: 'pending' | 'sent' | 'error') => void;
  updateLastMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  
  setConversations: (conversations: Conversation[]) => set({ conversations }),
  
  addConversation: (conversation: Conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations],
  })),
  
  setCurrentConversation: (conversation: Conversation | null) => set({
    currentConversation: conversation,
    messages: [],
    error: null,
  }),
  
  setMessages: (messages: Message[]) => set({ messages }),
  
  addMessage: (message: Message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
  updateMessageStatus: (messageId: string, status: 'pending' | 'sent' | 'error') => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    ),
  })),
  
  updateLastMessage: (message: Message) => set((state) => {
    const messages = [...state.messages];
    const lastIndex = messages.length - 1;
    if (lastIndex >= 0) {
      messages[lastIndex] = message;
    }
    return { messages };
  }),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setSending: (sending: boolean) => set({ isSending: sending }),
  setError: (error: string | null) => set({ error }),
  
  clearChat: () => set({
    conversations: [],
    currentConversation: null,
    messages: [],
    error: null,
  }),
}));

interface UIStore {
  sidebarOpen: boolean;
  darkMode: boolean;
  notificationMessage: string | null;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setNotification: (message: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      darkMode: true, // Default to dark mode
      notificationMessage: null,
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setNotification: (message: string | null) => set({ notificationMessage: message }),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
    }),
    {
      name: 'sereneia-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        darkMode: state.darkMode,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
