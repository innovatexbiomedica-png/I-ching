import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Loader2, Mail, Lock, User, Globe, Phone, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

const Register = () => {
  const { register, language: currentLang } = useAuth();
  const t = useTranslation(currentLang);
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState(currentLang);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await register(email, password, name, language, phone);
      toast.success(t.auth.registerSuccess);
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || t.auth.error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    // Google OAuth not yet configured. Use email/password registration instead.
    alert('Registrazione con Google non ancora disponibile. Usa email e password.');
  };

  return (
    <div className="auth-container" data-testid="register-page">
      <div className="auth-card animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-3xl font-serif text-[#2C2C2C] mb-2" data-testid="register-title">
            {t.auth.register}
          </h1>
          <div className="w-12 h-px bg-[#C44D38] mx-auto" />
        </div>

        {/* Google Register Button */}
        <Button
          type="button"
          onClick={handleGoogleRegister}
          disabled={googleLoading}
          className="w-full mb-6 bg-white hover:bg-gray-50 text-[#2C2C2C] border border-gray-300 shadow-sm"
          data-testid="google-register-btn"
        >
          {googleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {currentLang === 'it' ? 'Registrati con Google' : 'Sign up with Google'}
        </Button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-[#595959]">
              {currentLang === 'it' ? 'oppure registrati con email' : 'or sign up with email'}
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <Label htmlFor="name" className="form-label">
              {t.auth.name}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#595959]" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-[#EBE8E1] border-[#D1CDC7] focus:border-[#C44D38] focus:ring-[#C44D38]"
                placeholder={currentLang === 'it' ? 'Il tuo nome' : 'Your name'}
                required
                data-testid="name-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <Label htmlFor="email" className="form-label">
              {t.auth.email}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#595959]" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-[#EBE8E1] border-[#D1CDC7] focus:border-[#C44D38] focus:ring-[#C44D38]"
                placeholder="email@esempio.com"
                required
                data-testid="email-input"
              />
            </div>
          </div>

          <div className="form-group">
            <Label htmlFor="phone" className="form-label">
              {currentLang === 'it' ? 'Telefono (per recupero password)' : 'Phone (for password recovery)'}
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#595959]" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 bg-[#EBE8E1] border-[#D1CDC7] focus:border-[#C44D38] focus:ring-[#C44D38]"
                placeholder="+39 123 456 7890"
                data-testid="phone-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <Label htmlFor="password" className="form-label">
              {t.auth.password}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#595959]" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-[#EBE8E1] border-[#D1CDC7] focus:border-[#C44D38] focus:ring-[#C44D38]"
                placeholder="••••••••"
                minLength={6}
                required
                data-testid="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#595959] hover:text-[#2C2C2C] focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-[#595959] mt-1">
              {currentLang === 'it' ? 'Minimo 6 caratteri' : 'Minimum 6 characters'}
            </p>
          </div>
          
          <div className="form-group">
            <Label htmlFor="language" className="form-label">
              {t.auth.language}
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#595959] z-10" />
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger 
                  className="pl-10 bg-[#EBE8E1] border-[#D1CDC7]"
                  data-testid="language-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#F9F7F2] border-[#D1CDC7]">
                  <SelectItem value="it" data-testid="lang-option-it">Italiano</SelectItem>
                  <SelectItem value="en" data-testid="lang-option-en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
            data-testid="register-submit"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.common.loading}
              </>
            ) : (
              t.auth.register
            )}
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-[#595959]">
            {t.auth.hasAccount}{' '}
            <Link 
              to="/login" 
              className="text-[#C44D38] hover:underline"
              data-testid="login-link"
            >
              {t.auth.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
