import { create } from 'zustand';
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

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  setUser: (user: User) => set({
    user,
    isAuthenticated: true,
    error: null,
  }),
  
  logout: () => set({
    user: null,
    isAuthenticated: false,
    error: null,
  }),
  
  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

interface ChatStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  
  setConversations: (conversations: Conversation[]) => set({ conversations }),
  setCurrentConversation: (conversation: Conversation | null) => set({
    currentConversation: conversation,
    messages: [],
  }),
  setMessages: (messages: Message[]) => set({ messages }),
  addMessage: (message: Message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
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
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  darkMode: false,
  notificationMessage: null,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setNotification: (message: string | null) => set({ notificationMessage: message }),
}));
