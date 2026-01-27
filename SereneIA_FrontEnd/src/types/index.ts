// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  chatbotTone: 'formal' | 'casual' | 'professional';
  notificationsEnabled: boolean;
}

// Authentication Types
export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  user?: User;
}

export interface LoginPayload {
  username: string;
  email?: string; // Support both username and email login
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Message Type - defined first
export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'sent' | 'pending' | 'failed' | 'error';
}

// Conversation Type - uses Message
export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: Message;
}

export interface ChatbotResponse {
  conversationId: string;
  message: Message;
  status: 'completed' | 'streaming';
}

// Error Type
export interface ApiError {
  statusCode: number;
  message: string;
  details?: Record<string, any>;
}

// GraphQL Query Response Type
export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: {
      code: string;
    };
  }>;
}

// Module Documentation Types
export interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  responsibilities: string[];
  integrations: string;
  color: string;
}

export interface SystemArchitecture {
  modules: ModuleInfo[];
  dataFlow: string;
  generalModules: GeneralModule[];
}

export interface GeneralModule {
  name: string;
  description: string;
  standards: string[];
}
