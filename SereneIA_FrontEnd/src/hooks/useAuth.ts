import { useEffect } from 'react';
import { useAuthStore } from '../store';
import { authService } from '../services/authService';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, setUser, logout, setError, setLoading } = useAuthStore();

  const login = async (emailOrUsername: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Pass email directly - authService handles both email and username
      const response = await authService.login({ 
        username: emailOrUsername, 
        email: emailOrUsername, 
        password 
      });
      if (response.success && response.accessToken && response.user) {
        authService.setToken(response.accessToken);
        setUser(response.user);
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string, confirmPassword: string) => {
    setLoading(true);
    try {
      const response = await authService.register({ username, email, password, confirmPassword });
      if (response.success && response.accessToken && response.user) {
        authService.setToken(response.accessToken);
        setUser(response.user);
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      await authService.logout();
      logout();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    const token = authService.getToken();
    if (!token && isAuthenticated) {
      logout();
      return;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout: logoutUser,
    setError,
  };
};
