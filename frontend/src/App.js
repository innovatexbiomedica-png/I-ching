import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
// Eagerly load pages used immediately (landing, auth)
import Landing from './pages/Landing';
import Login from './pages/Login';
// Lazy load all other pages for faster initial load
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Consultation = lazy(() => import('./pages/Consultation'));
const History = lazy(() => import('./pages/History'));
const Pricing = lazy(() => import('./pages/Pricing'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const SharedConsultation = lazy(() => import('./pages/SharedConsultation'));
const Library = lazy(() => import('./pages/Library'));
const Statistics = lazy(() => import('./pages/Statistics'));
const Paths = lazy(() => import('./pages/Paths'));
const CompletedPaths = lazy(() => import('./pages/CompletedPaths'));
const Subscription = lazy(() => import('./pages/Subscription'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const AstrologicalProfile = lazy(() => import('./pages/AstrologicalProfile'));
const NatalChart = lazy(() => import('./pages/NatalChart'));
const Fitness = lazy(() => import('./pages/Fitness'));
const Privacy = lazy(() => import('./pages/Privacy'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const DataProtection = lazy(() => import('./pages/DataProtection'));
import CookieBanner from './components/CookieBanner';
import SiteFooter from './components/SiteFooter';
import './App.css';

// Routes that must NOT be indexed by search engines (contain user data)
const PRIVATE_PATHS = [
  '/dashboard', '/profile', '/history', '/consult', '/natal-chart',
  '/paths', '/completed-paths', '/statistics', '/notifications',
  '/subscription', '/payment', '/auth/callback', '/shared',
  '/fitness',
];

// Sets/removes <meta name="robots" content="noindex,nofollow"> based on path
function useRobotsMeta() {
  const location = useLocation();
  useEffect(() => {
    const isPrivate = PRIVATE_PATHS.some((p) => location.pathname.startsWith(p));
    let tag = document.querySelector('meta[name="robots"]');
    if (isPrivate) {
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'robots');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', 'noindex, nofollow, noarchive, nosnippet');
    } else if (tag) {
      tag.parentNode.removeChild(tag);
    }
  }, [location.pathname]);
}

// Loading fallback for lazy routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
    <div className="w-8 h-8 border-2 border-[#C44D38] border-t-transparent rounded-full animate-spin" />
  </div>
);

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

  // Apply noindex/nofollow on private pages
  useRobotsMeta();

  // Check URL fragment for session_id (Google OAuth callback)
  // This must be checked synchronously BEFORE any other route matching
  if (location.hash?.includes('session_id=') || location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
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

      {/* Legal / policy pages (publicly indexable) */}
      <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
      <Route path="/cookie-policy" element={<Layout><CookiePolicy /></Layout>} />
      <Route path="/terms" element={<Layout><Terms /></Layout>} />
      <Route path="/data-protection" element={<Layout><DataProtection /></Layout>} />
      
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
      <Route path="/fitness" element={
        <ProtectedRoute>
          <Layout><Fitness /></Layout>
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
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
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <AppRouter />
        </div>
        <SiteFooter />
      </div>
      <CookieBanner />
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
