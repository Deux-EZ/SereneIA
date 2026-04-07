import { useState, useEffect } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './lib/apollo';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { MainLayout } from './layouts/MainLayout';
import { ChatWindow, ConversationList } from './components/ChatInterface';
import { ModulesDocumentation } from './components/ModulesDocs';
import { useAuthStore, useChatStore } from './store';
import { chatService } from './services/chatService';
import { authService } from './services/authService';
import './App.css';

type AppView = 'landing' | 'auth' | 'app';

function AppContent() {
  const { isAuthenticated, user, setUser, logout } = useAuthStore();
  const { addConversation, setCurrentConversation } = useChatStore();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showDocs, setShowDocs] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      if (token && !isAuthenticated) {
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setCurrentView('app');
          }
        } catch (error) {
          console.error('Session check failed:', error);
          authService.clearToken();
        }
      }
    };
    checkAuth();
  }, []);

  // Listen for auth errors
  useEffect(() => {
    const handleAuthError = () => {
      logout();
      setCurrentView('auth');
    };
    
    window.addEventListener('auth:logout', handleAuthError);
    return () => window.removeEventListener('auth:logout', handleAuthError);
  }, [logout]);

  // Handle new conversation creation
  const handleNewConversation = async () => {
    if (!user?.id || isCreatingConversation) return;
    
    setIsCreatingConversation(true);
    try {
      const newConv = await chatService.createConversation(user.id, 'Nueva conversación');
      addConversation(newConv);
      setSelectedConversation(newConv.id);
      setCurrentConversation(newConv);
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setShowSidebar(false); // Close sidebar on mobile after selecting
  };

  // Landing page
  if (currentView === 'landing' && !isAuthenticated) {
    return <LandingPage onGetStarted={() => setCurrentView('auth')} />;
  }

  // Auth page
  if (currentView === 'auth' && !isAuthenticated) {
    return <AuthPage onBack={() => setCurrentView('landing')} />;
  }

  // If authenticated but still on auth/landing view, switch to app
  if (isAuthenticated && currentView !== 'app') {
    setCurrentView('app');
  }

  // Main app (authenticated)
  return (
    <MainLayout onShowDocs={() => setShowDocs(!showDocs)} onToggleSidebar={() => setShowSidebar(!showSidebar)}>
      {showDocs ? (
        <div className="h-full overflow-y-auto bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 p-8">
          <ModulesDocumentation />
        </div>
      ) : (
        <div className="flex h-full relative">
          {/* Mobile overlay */}
          {showSidebar && (
            <div
              className="fixed inset-0 bg-black/40 z-20 md:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}
          <div className={`
            fixed md:relative z-30 md:z-auto h-[calc(100vh-4rem)] md:h-auto
            transition-transform duration-300 ease-in-out
            ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <ConversationList
              onSelectConversation={handleSelectConversation}
              selectedId={selectedConversation}
              onNewConversation={handleNewConversation}
            />
          </div>
          <ChatWindow conversationId={selectedConversation} />
        </div>
      )}
    </MainLayout>
  );
}

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AppContent />
    </ApolloProvider>
  );
}

export default App;
