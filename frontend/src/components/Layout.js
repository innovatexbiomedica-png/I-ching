import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import { Menu, X, User, LogOut, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

const Layout = ({ children }) => {
  const { user, logout, language, updateLanguage, isAuthenticated } = useAuth();
  const t = useTranslation(language);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: t.nav.dashboard },
        { to: '/consult', label: t.nav.consult },
        { to: '/history', label: t.nav.history },
        { to: '/library', label: language === 'it' ? 'Biblioteca' : 'Library' },
        { to: '/paths', label: language === 'it' ? 'Percorsi' : 'Paths' },
        { to: '/statistics', label: language === 'it' ? 'Statistiche' : 'Statistics' },
      ]
    : [
        { to: '/library', label: language === 'it' ? 'Biblioteca' : 'Library' },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2]">
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-[#F9F7F2]/80 border-b border-[#D1CDC7]/50 sticky top-0 z-50" data-testid="main-navigation">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="font-serif text-xl md:text-2xl text-[#2C2C2C] tracking-tight"
              data-testid="logo-link"
            >
              I Ching <span className="text-[#C44D38]">del Benessere</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${isActive(link.to) ? 'active text-[#2C2C2C]' : ''}`}
                  data-testid={`nav-${link.to.replace('/', '')}`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Language Selector */}
              <div className="flex items-center space-x-1 border-l border-[#D1CDC7] pl-6">
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
                      <span className="font-sans text-sm">{user?.name}</span>
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
