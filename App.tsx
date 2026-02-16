import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Feed } from './pages/Feed';
import { Premium } from './pages/Premium';
import { Profile } from './pages/Profile';
import { Onboarding } from './pages/Onboarding';
import { Likes } from './pages/Likes';
import { Messages } from './pages/Messages';
import { ChatScreen } from './pages/ChatScreen';
import { AdsPage } from './pages/AdsPage';
import { WalletPage } from './pages/WalletPage';
import { authService } from './services/auth';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth on mount
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/feed" /> : <Onboarding />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route path="/feed" element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          } />
          
          <Route path="/likes" element={
            <ProtectedRoute>
              <Likes />
            </ProtectedRoute>
          } />

          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          
          <Route path="/chat/:userId" element={
            <ProtectedRoute>
              <ChatScreen />
            </ProtectedRoute>
          } />
          
          <Route path="/premium" element={
            <ProtectedRoute>
              <Premium />
            </ProtectedRoute>
          } />

          <Route path="/wallet" element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          } />

          <Route path="/ads" element={
            <ProtectedRoute>
              <AdsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;