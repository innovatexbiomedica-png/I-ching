import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Consultation from './pages/Consultation';
import History from './pages/History';
import Pricing from './pages/Pricing';
import PaymentSuccess from './pages/PaymentSuccess';
import SharedConsultation from './pages/SharedConsultation';
import Library from './pages/Library';
import Statistics from './pages/Statistics';
import Paths from './pages/Paths';
import CompletedPaths from './pages/CompletedPaths';
import Subscription from './pages/Subscription';
import NotificationSettings from './pages/NotificationSettings';
import AstrologicalProfile from './pages/AstrologicalProfile';
import NatalChart from './pages/NatalChart';
import GuidaTutorial from './pages/GuidaTutorial';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
        <div className="w-8 h-8 border-2 border-[#C44D38] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
        <div className="w-8 h-8 border-2 border-[#C44D38] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Router component that handles auth callback detection
function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id (Google OAuth callback)
  // This must be checked synchronously BEFORE any other route matching
  if (location.hash?.includes('session_id=') || location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

  return (
    <Routes>
      {/* Auth Callback Route */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Public Routes */}
      <Route path="/" element={<Layout><Landing /></Layout>} />
      <Route path="/login" element={
        <PublicRoute>
          <Layout><Login /></Layout>
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Layout><Register /></Layout>
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <Layout><ForgotPassword /></Layout>
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute>
          <Layout><ResetPassword /></Layout>
        </PublicRoute>
      } />
      <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
      <Route path="/shared/:shareToken" element={<SharedConsultation />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/consult" element={
        <ProtectedRoute>
          <Layout><Consultation /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute>
          <Layout><History /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/history/:id" element={
        <ProtectedRoute>
          <Layout><History /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/payment/success" element={
        <ProtectedRoute>
          <Layout><PaymentSuccess /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/library" element={
        <Layout><Library /></Layout>
      } />
      <Route path="/library/:hexagramId" element={
        <Layout><Library /></Layout>
      } />
      <Route path="/statistics" element={
        <ProtectedRoute>
          <Layout><Statistics /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/paths" element={
        <ProtectedRoute>
          <Layout><Paths /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/paths/:pathId" element={
        <ProtectedRoute>
          <Layout><Paths /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/completed-paths" element={
        <ProtectedRoute>
          <Layout><CompletedPaths /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/completed-paths/:completedPathId" element={
        <ProtectedRoute>
          <Layout><CompletedPaths /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/subscription" element={
        <ProtectedRoute>
          <Layout><Subscription /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Layout><NotificationSettings /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile/astrology" element={
        <ProtectedRoute>
          <Layout><AstrologicalProfile /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/natal-chart" element={
        <ProtectedRoute>
          <Layout><NatalChart /></Layout>
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppWithSplash() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  useEffect(() => {
    // Check if user has already seen splash this session
    const seen = sessionStorage.getItem('splashSeen');
    if (seen) {
      setShowSplash(false);
      setHasSeenSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashSeen', 'true');
    setShowSplash(false);
    setHasSeenSplash(true);
  };

  if (showSplash && !hasSeenSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#F9F7F2',
            border: '1px solid #D1CDC7',
            color: '#2C2C2C',
            fontFamily: 'Manrope, sans-serif'
          }
        }}
      />
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppWithSplash />
    </AuthProvider>
  );
}

export default App;
