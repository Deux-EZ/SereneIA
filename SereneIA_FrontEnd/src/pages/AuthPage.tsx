import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthForm } from '../components/AuthForm';

interface AuthPageProps {
  onBack?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      {/* Botón volver */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-gray-700">Volver</span>
        </button>
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>
      
      <div className="relative z-10">
        <AuthForm isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />
      </div>
    </div>
  );
};
