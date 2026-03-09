import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AppDashboard } from './components/AppDashboard';
import { OverviewPage } from './components/OverviewPage';
import { Auth } from './components/Auth';
import { Activity } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the app dashboard
  if (user) {
    return <AppDashboard />;
  }

  // If not authenticated and auth modal is open, show auth
  if (showAuth) {
    return (
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <nav className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Health Monitor AI</h1>
                  <p className="text-xs text-gray-400">Remote Health Tracking</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuth(false)}
                className="text-gray-400 hover:text-white transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </nav>

        {/* Auth Component */}
        <div className="py-12">
          <Auth initialMode={isLogin ? 'login' : 'signup'} />
        </div>
      </div>
    );
  }

  // Otherwise show the landing page
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Health Monitor AI</h1>
                <p className="text-xs text-gray-400">Remote Health Tracking</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Landing Page */}
      <div className="py-12">
        <OverviewPage
          onLoginClick={() => {
            setIsLogin(true);
            setShowAuth(true);
          }}
          onSignupClick={() => {
            setIsLogin(false);
            setShowAuth(true);
          }}
        />
      </div>
    </div>
  );
}

export default App;
