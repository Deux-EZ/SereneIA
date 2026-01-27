import type { User, LoginPayload, RegisterPayload, AuthResponse } from '../types';

// Mock API delay simulator
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock users database
const mockUsers: Record<string, User> = {
  'user1': {
    id: 'user1',
    username: 'santiago',
    email: 'santiago@sereneia.com',
    avatar: 'https://avatar.iran.liara.run/username?username=santiago',
    role: 'admin',
    preferences: {
      theme: 'dark',
      language: 'es',
      chatbotTone: 'professional',
      notificationsEnabled: true,
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2025-01-16').toISOString(),
  },
};

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    await delay();
    
    if (payload.username === 'santiago' && payload.password === 'admin123') {
      const user = mockUsers['user1'];
      return {
        success: true,
        message: 'Logged in successfully',
        accessToken: 'mock-jwt-token-' + Date.now(),
        user,
      };
    }

    // For demonstration, accept any other credentials as a test user
    if (payload.password.length >= 6) {
      const testUser: User = {
        id: 'user-' + Date.now(),
        username: payload.username,
        email: payload.username + '@test.com',
        avatar: `https://avatar.iran.liara.run/username?username=${payload.username}`,
        role: 'user',
        preferences: {
          theme: 'dark',
          language: 'es',
          chatbotTone: 'professional',
          notificationsEnabled: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return {
        success: true,
        message: 'Logged in successfully',
        accessToken: 'mock-jwt-token-' + Date.now(),
        user: testUser,
      };
    }

    return {
      success: false,
      message: 'Invalid username or password',
    };
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await delay();

    if (payload.password !== payload.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
      };
    }

    if (payload.password.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters',
      };
    }

    const newUser: User = {
      id: 'user-' + Date.now(),
      username: payload.username,
      email: payload.email,
      avatar: `https://avatar.iran.liara.run/username?username=${payload.username}`,
      role: 'user',
      preferences: {
        theme: 'dark',
        language: 'es',
        chatbotTone: 'professional',
        notificationsEnabled: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'User registered successfully',
      accessToken: 'mock-jwt-token-' + Date.now(),
      user: newUser,
    };
  },

  async logout(): Promise<void> {
    await delay(200);
    // Clear token from localStorage
    localStorage.removeItem('authToken');
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(300);
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    return mockUsers['user1'] || null;
  },

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  async updateUserPreferences(userId: string, preferences: Partial<any>): Promise<AuthResponse> {
    await delay();
    const user = mockUsers['user1'];
    if (user) {
      user.preferences = { ...user.preferences, ...preferences };
      user.updatedAt = new Date().toISOString();
      return {
        success: true,
        message: 'Preferences updated successfully',
        user,
      };
    }
    return {
      success: false,
      message: 'User not found',
    };
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<AuthResponse> {
    await delay();
    const user = mockUsers[userId] || mockUsers['user1'];
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Update allowed fields
    if (updates.username) user.username = updates.username;
    if (updates.email) user.email = updates.email;
    if (updates.avatar) user.avatar = updates.avatar;
    user.updatedAt = new Date().toISOString();

    return {
      success: true,
      message: 'Profile updated successfully',
      user,
    };
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<AuthResponse> {
    await delay();
    
    if (newPassword.length < 6) {
      return {
        success: false,
        message: 'New password must be at least 6 characters',
      };
    }

    // Mock validation
    if (oldPassword !== 'admin123') {
      return {
        success: false,
        message: 'Current password is incorrect',
      };
    }

    return {
      success: true,
      message: 'Password changed successfully',
    };
  },

  async verifyToken(token: string): Promise<boolean> {
    await delay(100);
    // Simple mock token validation
    return token.startsWith('mock-jwt-token-');
  },

  async refreshToken(): Promise<{ success: boolean; accessToken?: string }> {
    await delay(300);
    const currentToken = localStorage.getItem('authToken');
    
    if (!currentToken || !currentToken.startsWith('mock-jwt-token-')) {
      return { success: false };
    }

    const newToken = 'mock-jwt-token-' + Date.now();
    localStorage.setItem('authToken', newToken);
    
    return {
      success: true,
      accessToken: newToken,
    };
  },

  async validateEmail(email: string): Promise<{ valid: boolean; message?: string }> {
    await delay(200);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        message: 'Invalid email format',
      };
    }

    // Check if email already exists
    const existingUser = Object.values(mockUsers).find(u => u.email === email);
    if (existingUser) {
      return {
        valid: false,
        message: 'Email already registered',
      };
    }

    return { valid: true };
  },

  async validateUsername(username: string): Promise<{ valid: boolean; message?: string }> {
    await delay(200);
    
    if (username.length < 3) {
      return {
        valid: false,
        message: 'Username must be at least 3 characters',
      };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        valid: false,
        message: 'Username can only contain letters, numbers, and underscores',
      };
    }

    // Check if username already exists
    const existingUser = Object.values(mockUsers).find(u => u.username === username);
    if (existingUser) {
      return {
        valid: false,
        message: 'Username already taken',
      };
    }

    return { valid: true };
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    await delay(800);
    
    const user = Object.values(mockUsers).find(u => u.email === email);
    if (!user) {
      // For security, don't reveal if email exists
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    return {
      success: true,
      message: 'Password reset link sent to your email',
    };
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    await delay();
    
    if (newPassword.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters',
      };
    }

    // Mock token validation
    if (!token.startsWith('reset-token-')) {
      return {
        success: false,
        message: 'Invalid or expired reset token',
      };
    }

    return {
      success: true,
      message: 'Password reset successfully',
    };
  },
};
