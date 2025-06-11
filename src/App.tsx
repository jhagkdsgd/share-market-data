import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/Auth/AuthForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileNav } from './components/Layout/MobileNav';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TradeForm } from './components/TradeEntry/TradeForm';
import { Portfolio } from './components/Portfolio/Portfolio';
import { GoalManager } from './components/Goals/GoalManager';
import { AssetManager } from './components/Assets/AssetManager';
import { Settings } from './components/Settings/Settings';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'trades':
        return <TradeForm />;
      case 'assets':
        return <AssetManager />;
      case 'portfolio':
        return <Portfolio />;
      case 'goals':
        return <GoalManager />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your trading journal...</p>
        </div>
      </div>
    );
  }

  // Show auth form if user is not authenticated
  if (!user) {
    return <AuthForm />;
  }

  // Show main app if user is authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
        
        <main className="flex-1 pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
      
      <MobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;