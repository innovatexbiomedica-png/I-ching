import React, { useState, useEffect, createContext, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import nativeService from '../services/NativeService';
import {
  Home,
  Compass,
  BookOpen,
  History,
  User,
  Menu,
  Plus,
  Sparkles,
  Bell,
  Settings,
  LogOut,
  X,
  Crown,
  Star,
  BarChart3
} from 'lucide-react';

// Mobile Navigation Context
const MobileNavContext = createContext();

export const useMobileNav = () => useContext(MobileNavContext);

// Mobile Bottom Navigation Bar Component
const MobileBottomNav = () => {
  const { isAuthenticated, language, logout, user } = useAuth();
  const t = useTranslation(language);
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setShowQuickActions(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Navigation items
  const navItems = isAuthenticated
    ? [
        { path: '/dashboard', icon: Home, label: language === 'it' ? 'Home' : 'Home' },
        { path: '/library', icon: BookOpen, label: language === 'it' ? 'Biblioteca' : 'Library' },
        { path: '/consult', icon: Sparkles, label: language === 'it' ? 'Consulta' : 'Consult', isCenter: true },
        { path: '/history', icon: History, label: language === 'it' ? 'Storico' : 'History' },
        { path: '/profile/astrology', icon: User, label: language === 'it' ? 'Profilo' : 'Profile' }
      ]
    : [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/library', icon: BookOpen, label: language === 'it' ? 'Biblioteca' : 'Library' },
        { path: '/login', icon: User, label: language === 'it' ? 'Accedi' : 'Login' }
      ];

  const handleNavClick = (path) => {
    nativeService.haptic('light');
    setShowQuickActions(false);
    setShowProfileMenu(false);
    navigate(path);
  };

  const handleCenterClick = () => {
    nativeService.haptic('medium');
    setShowProfileMenu(false);
    if (showQuickActions) {
      setShowQuickActions(false);
    } else {
      setShowQuickActions(true);
    }
  };

  const handleProfileClick = () => {
    nativeService.haptic('light');
    setShowQuickActions(false);
    setShowProfileMenu(!showProfileMenu);
  };

  const handleLogout = () => {
    nativeService.haptic('medium');
    setShowProfileMenu(false);
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  // Don't show on landing page for non-authenticated users
  if (!isAuthenticated && location.pathname === '/') return null;

  // Don't show on specific pages
  const hiddenPages = ['/login', '/register', '/forgot-password', '/reset-password'];
  if (hiddenPages.includes(location.pathname)) return null;

  return (
    <>
      {/* Quick Actions Overlay */}
      {showQuickActions && isAuthenticated && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowQuickActions(false)}
        >
          <div 
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { handleNavClick('/paths'); setShowQuickActions(false); }}
              className="flex items-center space-x-3 bg-white rounded-full px-5 py-3 shadow-xl animate-fade-up"
              style={{ animationDelay: '0.1s' }}
            >
              <Compass className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-[#2C2C2C]">
                {language === 'it' ? 'Percorso Guidato' : 'Guided Path'}
              </span>
            </button>
            <button
              onClick={() => { handleNavClick('/consult'); setShowQuickActions(false); }}
              className="flex items-center space-x-3 bg-white rounded-full px-5 py-3 shadow-xl animate-fade-up"
              style={{ animationDelay: '0.05s' }}
            >
              <Sparkles className="w-5 h-5 text-[#C44D38]" />
              <span className="font-medium text-[#2C2C2C]">
                {language === 'it' ? 'Nuova Consultazione' : 'New Consultation'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Menu Overlay */}
      {showProfileMenu && isAuthenticated && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowProfileMenu(false)}
        >
          <div 
            className="absolute bottom-24 right-4 flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User info header */}
            <div className="px-4 py-3 bg-[#F9F7F2] border-b border-[#D1CDC7]">
              <p className="font-medium text-[#2C2C2C]">{user?.name || 'Utente'}</p>
              <p className="text-xs text-[#595959]">{user?.email}</p>
            </div>
            
            {/* Menu items */}
            <button
              onClick={() => { handleNavClick('/profile/astrology'); }}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-[#F9F7F2] transition-colors"
            >
              <Star className="w-5 h-5 text-purple-500" />
              <span className="text-[#2C2C2C]">
                {language === 'it' ? 'Profilo Astrologico' : 'Astrological Profile'}
              </span>
            </button>
            
            <button
              onClick={() => { handleNavClick('/subscription'); }}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-[#F9F7F2] transition-colors"
            >
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="text-[#2C2C2C]">
                {language === 'it' ? 'Abbonamento' : 'Subscription'}
              </span>
            </button>
            
            <button
              onClick={() => { handleNavClick('/statistics'); }}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-[#F9F7F2] transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-green-500" />
              <span className="text-[#2C2C2C]">
                {language === 'it' ? 'Statistiche' : 'Statistics'}
              </span>
            </button>
            
            <button
              onClick={() => { handleNavClick('/notifications'); }}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-[#F9F7F2] transition-colors"
            >
              <Bell className="w-5 h-5 text-blue-500" />
              <span className="text-[#2C2C2C]">
                {language === 'it' ? 'Notifiche' : 'Notifications'}
              </span>
            </button>
            
            {/* Logout button */}
            <div className="border-t border-[#D1CDC7]">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 w-full text-[#C44D38] hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">
                  {language === 'it' ? 'Esci' : 'Logout'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav 
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="bg-white/95 backdrop-blur-lg border-t border-[#D1CDC7]/50 shadow-lg">
          <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
            {navItems.map((item) => (
              item.isCenter && isAuthenticated ? (
                <button
                  key={item.path}
                  onClick={handleCenterClick}
                  className={`relative flex items-center justify-center w-14 h-14 -mt-6 rounded-full shadow-lg transition-all duration-300 ${
                    showQuickActions 
                      ? 'bg-[#2C2C2C] rotate-45' 
                      : 'bg-gradient-to-br from-[#C44D38] to-[#A33D2B]'
                  }`}
                >
                  <Plus className="w-7 h-7 text-white" />
                  {/* Ripple effect */}
                  <span className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-20 transition-opacity" />
                </button>
              ) : (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-[#C44D38]'
                      : 'text-[#595959] hover:text-[#2C2C2C]'
                  }`}
                >
                  <item.icon 
                    className={`w-6 h-6 mb-1 transition-transform duration-200 ${
                      isActive(item.path) ? 'scale-110' : ''
                    }`} 
                  />
                  <span className={`text-xs font-medium ${
                    isActive(item.path) ? 'font-semibold' : ''
                  }`}>
                    {item.label}
                  </span>
                  {/* Active indicator */}
                  {isActive(item.path) && (
                    <span className="absolute -bottom-0.5 w-1 h-1 bg-[#C44D38] rounded-full" />
                  )}
                </button>
              )
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

// Mobile Header Component (simplified)
const MobileHeader = ({ title, showBack = false, rightAction }) => {
  const navigate = useNavigate();
  const { language } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#F9F7F2]/95 backdrop-blur-md border-b border-[#D1CDC7]/50 lg:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-[#2C2C2C]"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div className="w-10" />
        )}
        
        <h1 className="font-serif text-lg text-[#2C2C2C] truncate">
          {title}
        </h1>
        
        {rightAction || <div className="w-10" />}
      </div>
    </header>
  );
};

// Pull to Refresh Component
const PullToRefresh = ({ onRefresh, children }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const threshold = 80;

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling) return;
    
    const touch = e.touches[0];
    const distance = Math.max(0, touch.clientY - 100);
    setPullDistance(Math.min(distance, threshold * 1.5));
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      nativeService.haptic('medium');
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="flex items-center justify-center py-4 transition-all duration-200"
          style={{ height: isRefreshing ? 60 : pullDistance }}
        >
          <div 
            className={`w-8 h-8 border-2 border-[#C44D38] border-t-transparent rounded-full ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: isRefreshing ? 'none' : `rotate(${pullDistance * 3}deg)`,
              opacity: Math.min(1, pullDistance / threshold)
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
};

// Install Prompt Component (PWA)
const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { language } = useAuth();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay if not dismissed before
      const dismissed = localStorage.getItem('installPromptDismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 30000); // 30 seconds delay
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      nativeService.haptic('success');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:hidden animate-slide-up">
      <div className="bg-white rounded-2xl shadow-xl p-4 border border-[#D1CDC7]">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#C44D38] to-[#A33D2B] rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">☯</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#2C2C2C] mb-1">
              {language === 'it' ? 'Installa l\'App' : 'Install App'}
            </h3>
            <p className="text-sm text-[#595959] mb-3">
              {language === 'it' 
                ? 'Aggiungi I Ching alla schermata home per un accesso rapido'
                : 'Add I Ching to your home screen for quick access'}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-[#C44D38] text-white py-2 px-4 rounded-lg font-medium text-sm"
              >
                {language === 'it' ? 'Installa' : 'Install'}
              </button>
              <button
                onClick={handleDismiss}
                className="py-2 px-4 text-[#595959] text-sm"
              >
                {language === 'it' ? 'Non ora' : 'Not now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Offline Indicator
const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { language } = useAuth();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white py-2 px-4 text-center text-sm font-medium">
      {language === 'it' ? '📡 Sei offline - Alcune funzionalità potrebbero non essere disponibili' : '📡 You\'re offline - Some features may be unavailable'}
    </div>
  );
};

// Mobile Navigation Provider
export const MobileNavProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <MobileNavContext.Provider value={{ isMobile }}>
      <OfflineIndicator />
      {children}
      <MobileBottomNav />
      <InstallPrompt />
    </MobileNavContext.Provider>
  );
};

export { MobileBottomNav, MobileHeader, PullToRefresh, InstallPrompt, OfflineIndicator };
export default MobileNavProvider;