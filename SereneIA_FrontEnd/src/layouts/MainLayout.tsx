import React, { useState } from 'react';
import { LogOut, Menu, X, FileText, User } from 'lucide-react';
import { Button } from '../components/Common';
import { useAuth } from '../hooks/useAuth';
import { useUIStore } from '../store';

interface MainLayoutProps {
  children: React.ReactNode;
  onShowDocs: () => void;
}

// Componente Avatar con fallback a icono
const UserAvatar: React.FC<{ avatar?: string; username?: string }> = ({ avatar, username }) => {
  const [imgError, setImgError] = useState(false);

  if (!avatar || imgError) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center ring-2 ring-purple-300 shadow-lg">
        <User size={20} className="text-white" />
      </div>
    );
  }

  return (
    <img
      src={avatar}
      alt={username || 'Usuario'}
      className="w-10 h-10 rounded-full ring-2 ring-purple-300 shadow-lg object-cover"
      onError={() => setImgError(true)}
    />
  );
};

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onShowDocs }) => {
  const { user, logout } = useAuth();
  useUIStore(); // Just to maintain store connection
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await logout();
    }
  };

  return (
    <div className="flex h-screen bg-transparent">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpenMobileMenu(!openMobileMenu)}
        className="fixed top-4 left-4 z-50 md:hidden bg-primary text-white p-2 rounded-lg"
      >
        {openMobileMenu ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Header */}
      <header className="fixed top-0 right-0 left-0 h-16 bg-white/70 backdrop-blur-md border-b border-amber-200/50 flex items-center justify-between px-6 z-40 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-rose-400 via-amber-400 to-purple-500 rounded-xl shadow-lg animate-breathe">
              <svg className="w-6 h-6 text-white" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 via-amber-500 to-purple-600 bg-clip-text text-transparent">
              SerenAI
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onShowDocs}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-rose-100 hover:from-amber-200 hover:to-rose-200 text-gray-700 font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-amber-200/50"
          >
            <FileText size={18} className="text-amber-600" />
            <span>📚 Documentación</span>
          </button>

          <div className="flex items-center gap-3 border-l border-amber-200 pl-4">
            {user && (
              <>
                <div className="relative">
                  <UserAvatar avatar={user.avatar} username={user.username} />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Hola, {user.username} 👋
                </span>
              </>
            )}
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-16 overflow-hidden">
        {children}
      </main>

      {/* Mobile Menu */}
      {openMobileMenu && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setOpenMobileMenu(false)}>
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onShowDocs();
                setOpenMobileMenu(false);
              }}
              className="w-full"
            >
              <FileText size={18} /> Documentation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
