import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Heart, Sparkles } from 'lucide-react';
import { InputField, Button, Alert } from './Common';
import { useAuth } from '../hooks/useAuth';

interface AuthFormProps {
  isLogin: boolean;
  onToggle: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onToggle }) => {
  const [username, setUsername] = useState('santiago');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, register, isLoading, error } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!username.trim()) newErrors.username = 'Username is required';
    if (isLogin && !password) newErrors.password = 'Password is required';
    if (!isLogin) {
      if (!email.trim()) newErrors.email = 'Email is required';
      if (!password) newErrors.password = 'Password is required';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isLogin) {
      const result = await login(username, password);
      if (!result.success) {
        setErrors({ submit: result.error || 'Login failed' });
      }
    } else {
      const result = await register(username, email, password, confirmPassword);
      if (!result.success) {
        setErrors({ submit: result.error || 'Registration failed' });
      }
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 p-4 bg-gradient-to-br from-rose-400 via-amber-400 to-purple-500 rounded-full mb-4 animate-breathe shadow-2xl">
          <Heart className="w-12 h-12 text-white fill-white" />
          <Sparkles className="w-6 h-6 text-amber-200" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-500 via-amber-500 to-purple-600 bg-clip-text text-transparent mb-2">
          SereneIA
        </h1>
        <p className="text-gray-700 text-lg font-medium">
          {isLogin ? 'Bienvenido de nuevo 🌸' : 'Comienza tu viaje 🦋'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Tu asistente de bienestar mental
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/40">
        {error && <Alert type="error" message={error} />}
        {errors.submit && <Alert type="error" message={errors.submit} />}

        <InputField
          label="Usuario"
          type="text"
          value={username}
          onChange={setUsername}
          placeholder="Tu nombre de usuario"
          error={errors.username}
          required
        />

        {!isLogin && (
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="tu@email.com"
            error={errors.email}
            required
          />
        )}

        <InputField
          label="Contraseña"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          error={errors.password}
          required
        />

        {!isLogin && (
          <InputField
            label="Confirmar Contraseña"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="••••••••"
            error={errors.confirmPassword}
            required
          />
        )}

        <div className="bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm text-gray-700 flex items-start gap-2">
            <Sparkles size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <span>
              {isLogin ? (
                <>✨ Prueba con: <strong className="text-rose-600">santiago</strong> / <strong className="text-purple-600">admin123</strong></>
              ) : (
                <>🔐 Usa mínimo 6 caracteres para tu contraseña</>
              )}
            </span>
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full bg-gradient-to-r from-rose-500 via-amber-500 to-purple-600 hover:from-rose-600 hover:via-amber-600 hover:to-purple-700 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
        >
          {isLogin ? '🌟 Iniciar Sesión' : '🚀 Crear Cuenta'}
        </Button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        {isLogin ? "¿No tienes cuenta? " : '¿Ya tienes cuenta? '}
        <button
          onClick={onToggle}
          className="text-rose-600 hover:underline font-semibold hover:text-purple-600 transition-colors"
        >
          {isLogin ? '✨ Regístrate aquí' : '🌸 Inicia sesión'}
        </button>
      </p>
    </div>
  );
};
