/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { TodayScreen } from './screens/Today';
import { UpcomingScreen } from './screens/Upcoming';
import { CalendarScreen } from './screens/Calendar';
import { TopicsScreen } from './screens/Topics';
import { TopicDetailScreen } from './screens/TopicDetail';
import { MissedScreen } from './screens/Missed';
import { SettingsScreen } from './screens/Settings';
import { Onboarding } from './screens/Onboarding';
import { Header, BottomNav } from './components/Navigation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

const AppContent: React.FC = () => {
  const { user, loading, isOnboarded, signIn } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-primary tracking-tighter uppercase italic mb-8">Revize</h1>
        <p className="text-zinc-400 mb-12 max-w-xs font-medium">Smart scheduling for consistent learning. Sign in to start your mastery journey.</p>
        <button 
          onClick={signIn}
          className="w-full max-w-xs h-16 bg-primary text-white rounded-3xl font-bold text-lg uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  if (!isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  const showShell = !['/onboarding'].includes(location.pathname) && !location.pathname.startsWith('/topic/');

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/today': return 'Revize';
      case '/upcoming': return 'Upcoming';
      case '/calendar': return 'Calendar';
      case '/topics': return 'Topics';
      case '/missed': return 'Missed';
      case '/settings': return 'Settings';
      default: return 'Revize';
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {showShell && <Header title={getPageTitle(location.pathname)} />}
      
      <main className={showShell ? "px-6 pt-2" : ""}>
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/today" element={<TodayScreen />} />
            <Route path="/upcoming" element={<UpcomingScreen />} />
            <Route path="/calendar" element={<CalendarScreen />} />
            <Route path="/topics" element={<TopicsScreen />} />
            <Route path="/topic/:id" element={<TopicDetailScreen />} />
            <Route path="/missed" element={<MissedScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/" element={<Navigate to={isOnboarded ? "/today" : "/onboarding"} replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {showShell && <BottomNav />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppContent />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}
