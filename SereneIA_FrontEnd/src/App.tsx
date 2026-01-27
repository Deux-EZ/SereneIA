import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { MainLayout } from './layouts/MainLayout';
import { ChatWindow, ConversationList } from './components/ChatInterface';
import { ModulesDocumentation } from './components/ModulesDocs';
import { useAuthStore } from './store';
import './App.css';

type AppView = 'landing' | 'auth' | 'app';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedConversation, setSelectedConversation] = useState<string | null>('conv-1');
  const [showDocs, setShowDocs] = useState(false);

  // Landing page
  if (currentView === 'landing' && !isAuthenticated) {
    return <LandingPage onGetStarted={() => setCurrentView('auth')} />;
  }

  // Auth page
  if (currentView === 'auth' && !isAuthenticated) {
    return <AuthPage onBack={() => setCurrentView('landing')} />;
  }

  // Main app (authenticated)
  return (
    <MainLayout onShowDocs={() => setShowDocs(!showDocs)}>
      {showDocs ? (
        <div className="h-full overflow-y-auto bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50 p-8">
          <ModulesDocumentation />
        </div>
      ) : (
        <div className="flex h-full">
          <ConversationList
            onSelectConversation={setSelectedConversation}
            selectedId={selectedConversation}
          />
          <ChatWindow conversationId={selectedConversation} />
        </div>
      )}
    </MainLayout>
  );
}

export default App;
