import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
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
  const { user, logout, language, updateLanguage, isAuthenticated, getToken } = useAuth();
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
    <div className="min-h-screen flex flex-col bg-[#F9F7F2]">
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-[#F9F7F2]/95 border-b border-[#D1CDC7]/50 sticky top-0 z-50" data-testid="main-navigation">
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
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#F9F7F2] border-[#D1CDC7]">
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-[#2C2C2C] cursor-pointer"
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
              className="md:hidden p-2 text-[#2C2C2C]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#F9F7F2] border-t border-[#D1CDC7]" data-testid="mobile-menu">
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block py-2 ${isActive(link.to) ? 'text-[#C44D38]' : 'text-[#2C2C2C]'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="flex items-center space-x-4 py-2 border-t border-[#D1CDC7]">
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

              {isAuthenticated ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center space-x-2 py-2 text-[#2C2C2C]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.nav.logout}</span>
                </button>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t border-[#D1CDC7]">
                  <Link
                    to="/login"
                    className="py-2 text-[#2C2C2C]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-center py-2"
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
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D1CDC7] bg-[#F9F7F2]" data-testid="footer">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="font-serif text-[#2C2C2C]">
              I Ching <span className="text-[#C44D38]">del Benessere</span>
            </div>
            <div className="text-sm text-[#595959]">
              © {new Date().getFullYear()} — L'antica saggezza per il mondo moderno
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
