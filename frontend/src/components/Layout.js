import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import AnimatedBackground, { MistAnimation } from './AnimatedBackground';
import { 
  Menu, X, User, LogOut, Globe, ChevronDown, 
  BookOpen, Compass, History, BarChart3, Map, 
  Crown, Bell, Star, Moon, Settings, Home,
  Sparkles, Calendar, Award, Target
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import Logo from './Logo';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Layout = ({ children }) => {
  const { user, logout, language, updateLanguage, isAuthenticated, getToken, hasSubscription } = useAuth();
  const t = useTranslation(language);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadPathsCount, setUnreadPathsCount] = useState(0);

  // Fetch unread paths count
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, location.pathname]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API}/paths/unread-count`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUnreadPathsCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Menu sections for authenticated users
  const menuSections = {
    consultazioni: {
      label: language === 'it' ? 'Consultazioni' : 'Consultations',
      icon: Compass,
      items: [
        { to: '/consult', label: language === 'it' ? 'Nuova Consultazione' : 'New Consultation', icon: Sparkles },
        { to: '/history', label: language === 'it' ? 'Storico' : 'History', icon: History },
      ]
    },
    percorsi: {
      label: language === 'it' ? 'Percorsi' : 'Paths',
      icon: Map,
      items: [
        { to: '/paths', label: language === 'it' ? 'Percorsi Guidati' : 'Guided Paths', icon: Target },
        { to: '/completed-paths', label: language === 'it' ? 'Risultati' : 'Results', icon: Award, badge: unreadPathsCount },
      ]
    },
    biblioteca: {
      label: language === 'it' ? 'Biblioteca' : 'Library',
      icon: BookOpen,
      items: [
        { to: '/library', label: language === 'it' ? 'I 64 Esagrammi' : 'The 64 Hexagrams', icon: BookOpen },
        { to: '/guida', label: language === 'it' ? 'Guida Interattiva' : 'Interactive Guide', icon: Compass },
      ]
    },
    profilo: {
      label: language === 'it' ? 'Profilo' : 'Profile',
      icon: Star,
      items: [
        { to: '/profile/astrology', label: language === 'it' ? 'Profilo Astrologico' : 'Astrological Profile', icon: Star },
        { to: '/natal-chart', label: language === 'it' ? 'Tema Natale' : 'Natal Chart', icon: Moon },
        { to: '/statistics', label: language === 'it' ? 'Statistiche & Badge' : 'Statistics & Badges', icon: BarChart3 },
      ]
    },
    impostazioni: {
      label: language === 'it' ? 'Impostazioni' : 'Settings',
      icon: Settings,
      items: [
        { to: '/subscription', label: language === 'it' ? 'Abbonamento' : 'Subscription', icon: Crown },
        { to: '/notifications', label: language === 'it' ? 'Notifiche' : 'Notifications', icon: Bell },
      ]
    }
  };

  // Quick nav links (shown in header)
  const quickLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: language === 'it' ? 'Home' : 'Home', icon: Home },
        { to: '/consult', label: language === 'it' ? 'Consulta' : 'Consult', icon: Compass },
        { to: '/library', label: language === 'it' ? 'Biblioteca' : 'Library', icon: BookOpen },
      ]
    : [
        { to: '/library', label: language === 'it' ? 'Biblioteca' : 'Library', icon: BookOpen },
      ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <AnimatedBackground opacity={0.12} transitionDuration={15000}>
      {/* Mist animation layer */}
      <MistAnimation intensity={0.15} />
      
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="backdrop-blur-md bg-[#F9F7F2]/90 border-b border-[#D1CDC7]/50 sticky top-0 z-50" data-testid="main-navigation">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo with Icon */}
            <Link 
              to="/" 
              className="flex items-center flex-shrink-0"
              data-testid="logo-link"
            >
              <Logo size="sm" showText={true} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
              {/* Quick Links */}
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link relative text-sm whitespace-nowrap flex items-center space-x-1 ${isActive(link.to) ? 'active text-[#2C2C2C]' : ''}`}
                  data-testid={`nav-${link.to.replace('/', '')}`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              ))}

              {/* Full Menu Dropdown (only for authenticated users) */}
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center space-x-1 text-[#595959] hover:text-[#2C2C2C]"
                    >
                      <Menu className="w-4 h-4" />
                      <span className="text-sm">{language === 'it' ? 'Menu' : 'Menu'}</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-64 bg-[#F9F7F2] border-[#D1CDC7]">
                    {Object.entries(menuSections).map(([key, section]) => (
                      <React.Fragment key={key}>
                        <DropdownMenuLabel className="flex items-center space-x-2 text-[#595959] text-xs uppercase tracking-wider">
                          <section.icon className="w-3 h-3" />
                          <span>{section.label}</span>
                        </DropdownMenuLabel>
                        {section.items.map((item) => (
                          <DropdownMenuItem key={item.to} asChild>
                            <Link 
                              to={item.to} 
                              className={`flex items-center justify-between w-full px-2 py-2 cursor-pointer ${isActive(item.to) ? 'text-[#C44D38] bg-[#C44D38]/5' : 'text-[#2C2C2C]'}`}
                            >
                              <div className="flex items-center space-x-2">
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                              </div>
                              {item.badge > 0 && (
                                <span className="w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="bg-[#D1CDC7]/50" />
                      </React.Fragment>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Language Selector */}
              <div className="flex items-center space-x-1 border-l border-[#D1CDC7] pl-4">
                <Globe className="w-4 h-4 text-[#595959]" />
                <button
                  onClick={() => updateLanguage('it')}
                  className={`lang-btn ${language === 'it' ? 'active' : ''}`}
                  data-testid="lang-it"
                >
                  IT
                </button>
                <span className="text-[#D1CDC7]">|</span>
                <button
                  onClick={() => updateLanguage('en')}
                  className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                  data-testid="lang-en"
                >
                  EN
                </button>
              </div>

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center space-x-2 text-[#2C2C2C]"
                      data-testid="user-menu-trigger"
                    >
                      <User className="w-4 h-4" />
                      <span className="font-sans text-sm max-w-[100px] truncate">{user?.name}</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#F9F7F2] border-[#D1CDC7]">
                    <DropdownMenuLabel className="text-xs text-[#595959]">
                      {user?.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#D1CDC7]/50" />
                    
                    <DropdownMenuItem asChild>
                      <Link to="/profile/astrology" className="flex items-center space-x-2 cursor-pointer">
                        <Star className="w-4 h-4 text-purple-500" />
                        <span>{language === 'it' ? 'Profilo Astrologico' : 'Astrological Profile'}</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/subscription" className="flex items-center space-x-2 cursor-pointer">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span>{language === 'it' ? 'Abbonamento' : 'Subscription'}</span>
                        {!hasSubscription && (
                          <span className="ml-auto text-xs bg-[#C44D38] text-white px-2 py-0.5 rounded">
                            {language === 'it' ? 'Premium' : 'Premium'}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/notifications" className="flex items-center space-x-2 cursor-pointer">
                        <Bell className="w-4 h-4 text-blue-500" />
                        <span>{language === 'it' ? 'Notifiche' : 'Notifications'}</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/statistics" className="flex items-center space-x-2 cursor-pointer">
                        <BarChart3 className="w-4 h-4 text-green-500" />
                        <span>{language === 'it' ? 'Statistiche' : 'Statistics'}</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-[#D1CDC7]/50" />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-[#C44D38] cursor-pointer"
                      data-testid="logout-btn"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t.nav.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-[#2C2C2C] hover:text-[#C44D38] transition-colors font-sans text-sm"
                    data-testid="login-link"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm py-2 px-4"
                    data-testid="register-link"
                  >
                    {t.nav.register}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-[#2C2C2C]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#F9F7F2] border-t border-[#D1CDC7] max-h-[80vh] overflow-y-auto" data-testid="mobile-menu">
            <div className="px-6 py-4 space-y-2">
              {/* Quick links */}
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-3 py-3 px-2 rounded-lg ${isActive(link.to) ? 'text-[#C44D38] bg-[#C44D38]/5' : 'text-[#2C2C2C]'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              
              {/* Menu sections for authenticated users */}
              {isAuthenticated && Object.entries(menuSections).map(([key, section]) => (
                <div key={key} className="border-t border-[#D1CDC7]/50 pt-3">
                  <div className="flex items-center space-x-2 px-2 mb-2 text-[#595959] text-xs uppercase tracking-wider">
                    <section.icon className="w-3 h-3" />
                    <span>{section.label}</span>
                  </div>
                  {section.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between py-2 px-4 rounded-lg ${isActive(item.to) ? 'text-[#C44D38] bg-[#C44D38]/5' : 'text-[#2C2C2C]'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge > 0 && (
                        <span className="w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ))}
              
              {/* Language selector */}
              <div className="flex items-center space-x-4 py-3 px-2 border-t border-[#D1CDC7]">
                <Globe className="w-4 h-4 text-[#595959]" />
                <button
                  onClick={() => { updateLanguage('it'); setMobileMenuOpen(false); }}
                  className={`lang-btn ${language === 'it' ? 'active' : ''}`}
                >
                  Italiano
                </button>
                <button
                  onClick={() => { updateLanguage('en'); setMobileMenuOpen(false); }}
                  className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                >
                  English
                </button>
              </div>

              {/* User section */}
              {isAuthenticated ? (
                <div className="border-t border-[#D1CDC7] pt-3">
                  <div className="flex items-center space-x-3 px-2 py-2 mb-2">
                    <User className="w-5 h-5 text-[#595959]" />
                    <div>
                      <p className="font-medium text-[#2C2C2C]">{user?.name}</p>
                      <p className="text-xs text-[#595959]">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="flex items-center space-x-3 py-3 px-2 text-[#C44D38] w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t.nav.logout}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-3 border-t border-[#D1CDC7]">
                  <Link
                    to="/login"
                    className="py-3 px-2 text-[#2C2C2C] flex items-center space-x-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>{t.nav.login}</span>
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-center py-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.register}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:pb-0">
        {children}
      </main>

      {/* Footer - Hidden on mobile when bottom nav is visible */}
      <footer className="border-t border-[#D1CDC7] bg-[#F9F7F2] hidden lg:block" data-testid="footer">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="font-serif text-[#2C2C2C]">
              I Ching <span className="text-[#C44D38]">del Benessere</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/guida" className="text-[#595959] hover:text-[#C44D38] transition-colors">
                {language === 'it' ? 'Guida' : 'Guide'}
              </Link>
              <Link to="/library" className="text-[#595959] hover:text-[#C44D38] transition-colors">
                {language === 'it' ? 'Biblioteca' : 'Library'}
              </Link>
              <Link to="/pricing" className="text-[#595959] hover:text-[#C44D38] transition-colors">
                {language === 'it' ? 'Prezzi' : 'Pricing'}
              </Link>
            </div>
            <div className="text-sm text-[#595959]">
              © {new Date().getFullYear()} — L'antica saggezza per il mondo moderno
            </div>
          </div>
        </div>
      </footer>
      
      {/* Mobile Footer - Simplified version above bottom nav */}
      <footer className="lg:hidden border-t border-[#D1CDC7] bg-[#F9F7F2] pb-20" data-testid="mobile-footer">
        <div className="px-4 py-6 text-center">
          <div className="font-serif text-sm text-[#2C2C2C] mb-2">
            I Ching <span className="text-[#C44D38]">del Benessere</span>
          </div>
          <div className="text-xs text-[#595959]">
            © {new Date().getFullYear()} — L'antica saggezza per il mondo moderno
          </div>
        </div>
      </footer>
      </div>
    </AnimatedBackground>
  );
};

export default Layout;
