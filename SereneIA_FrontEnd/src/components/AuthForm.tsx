import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { InputField, Button, Alert } from './Common';
import { useAuth } from '../hooks/useAuth';

interface AuthFormProps {
  isLogin: boolean;
  onToggle: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onToggle }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, register, isLoading, error } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (isLogin) {
      if (!email.trim()) newErrors.email = 'Email es requerido';
      if (!password) newErrors.password = 'Contraseña es requerida';
    } else {
      if (!username.trim()) newErrors.username = 'Nombre es requerido';
      if (!email.trim()) newErrors.email = 'Email es requerido';
      if (!password) newErrors.password = 'Contraseña es requerida';
      if (password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isLogin) {
      // Use email for login (username field is used internally for compatibility)
      const result = await login(email, password);
      if (!result.success) {
        setErrors({ submit: result.error || 'Error al iniciar sesión' });
      }
    } else {
      const result = await register(username, email, password, confirmPassword);
      if (!result.success) {
        setErrors({ submit: result.error || 'Error al registrar usuario' });
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
          SerenAI
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

        {!isLogin && (
          <InputField
            label="Nombre"
            type="text"
            value={username}
            onChange={setUsername}
            placeholder="Tu nombre"
            error={errors.username}
            required
          />
        )}

        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="tu@email.com"
          error={errors.email}
          required
        />

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
                <>✨ Ingresa tus credenciales para acceder</>
              ) : (
                <>🔐 Usa mínimo 8 caracteres para tu contraseña</>
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
