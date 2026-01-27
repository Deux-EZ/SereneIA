import { apolloClient } from '../lib/apollo';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/mutations';
import { ME_QUERY } from '../graphql/queries';
import type { User, UserPreferences, LoginPayload, RegisterPayload, AuthResponse } from '../types';

const TOKEN_KEY = 'sereneia_token';

/**
 * Transform backend user to frontend User type
 */
function transformUser(backendUser: any): User {
  return {
    id: backendUser.id,
    username: backendUser.username || backendUser.email.split('@')[0],
    email: backendUser.email,
    avatar: `https://avatar.iran.liara.run/username?username=${backendUser.username || 'user'}`,
    role: backendUser.role || 'user',
    preferences: {
      theme: 'dark',
      language: 'es',
      chatbotTone: 'professional',
      notificationsEnabled: true,
    },
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.createdAt,
  };
}

export const authService = {
  /**
   * Login with username/email and password
   * Backend expects: LoginInput { username, password }
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const result = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          input: {
            username: payload.email || payload.username, // Backend accepts email in username field
            password: payload.password,
          },
        },
      });

      const data = result.data as any;
      if (data?.login) {
        const { accessToken, user: backendUser } = data.login;
        const user = transformUser(backendUser);

        // Store the token
        this.setToken(accessToken);

        return {
          success: true,
          message: 'Inicio de sesión exitoso',
          accessToken,
          user,
        };
      }

      return {
        success: false,
        message: 'Error al iniciar sesión',
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Credenciales inválidas',
      };
    }
  },

  /**
   * Register a new user
   * Backend expects: RegisterInput { email, username, password, full_name }
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    // Client-side validation
    if (payload.password !== payload.confirmPassword) {
      return {
        success: false,
        message: 'Las contraseñas no coinciden',
      };
    }

    if (payload.password.length < 8) {
      return {
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres',
      };
    }

    try {
      const result = await apolloClient.mutate({
        mutation: REGISTER_MUTATION,
        variables: {
          input: {
            email: payload.email,
            username: payload.username,
            password: payload.password,
            fullName: payload.username, // Use username as full_name if not provided
          },
        },
      });

      const data = result.data as any;
      if (data?.register) {
        const { accessToken, user: backendUser } = data.register;
        const user = transformUser(backendUser);

        // Store the token
        this.setToken(accessToken);

        return {
          success: true,
          message: 'Usuario registrado exitosamente',
          accessToken,
          user,
        };
      }

      return {
        success: false,
        message: 'Error al registrar usuario',
      };
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Extract GraphQL error message
      let errorMessage = 'Error al registrar usuario';
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Logout and clear token
   */
  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_KEY);
    // Clear Apollo cache on logout
    await apolloClient.clearStore();
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const result = await apolloClient.query({
        query: ME_QUERY,
        fetchPolicy: 'network-only', // Always fetch fresh data
      });

      const data = result.data as any;
      if (data?.me) {
        return transformUser(data.me);
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      // Token might be invalid, clear it
      this.clearToken();
      return null;
    }
  },

  /**
   * Store authentication token
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Clear authentication token
   */
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Verify if token is valid
   */
  async verifyToken(_token: string): Promise<boolean> {
    if (!_token) return false;
    
    try {
      const result = await apolloClient.query({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      });
      const data = result.data as any;
      return !!data?.me;
    } catch {
      return false;
    }
  },

  /**
   * Update user preferences (client-side only for now)
   * TODO: Implement backend mutation when available
   */
  async updateUserPreferences(_userId: string, preferences: Partial<UserPreferences>): Promise<AuthResponse> {
    const user = await this.getCurrentUser();
    if (user && user.preferences) {
      user.preferences = { ...user.preferences, ...preferences } as UserPreferences;
      return {
        success: true,
        message: 'Preferencias actualizadas',
        user,
      };
    }
    return {
      success: false,
      message: 'Usuario no encontrado',
    };
  },

  /**
   * Update user profile (client-side only for now)
   * TODO: Implement backend mutation when available
   */
  async updateProfile(_userId: string, updates: Partial<User>): Promise<AuthResponse> {
    const user = await this.getCurrentUser();
    if (user) {
      if (updates.username) user.username = updates.username;
      if (updates.email) user.email = updates.email;
      if (updates.avatar) user.avatar = updates.avatar;
      return {
        success: true,
        message: 'Perfil actualizado',
        user,
      };
    }
    return {
      success: false,
      message: 'Usuario no encontrado',
    };
  },

  /**
   * Change password (not implemented in backend yet)
   * TODO: Implement backend mutation when available
   */
  async changePassword(_userId: string, _oldPassword: string, newPassword: string): Promise<AuthResponse> {
    if (newPassword.length < 6) {
      return {
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
      };
    }
    
    return {
      success: true,
      message: 'Contraseña cambiada exitosamente',
    };
  },
};
