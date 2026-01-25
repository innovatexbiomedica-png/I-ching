import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Consultation from './pages/Consultation';
import History from './pages/History';
import Pricing from './pages/Pricing';
import PaymentSuccess from './pages/PaymentSuccess';
import SharedConsultation from './pages/SharedConsultation';
import Library from './pages/Library';
import Statistics from './pages/Statistics';
import Paths from './pages/Paths';
import Subscription from './pages/Subscription';
import NotificationSettings from './pages/NotificationSettings';
import AstrologicalProfile from './pages/AstrologicalProfile';
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

function AppRoutes() {
  return (
    <Routes>
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
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
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
    </AuthProvider>
  );
}

export default App;
