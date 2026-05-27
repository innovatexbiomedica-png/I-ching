import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import GoogleSignIn from '../components/GoogleSignIn';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

const Login = () => {
  const { login, language } = useAuth();
  const t = useTranslation(language);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success(t.auth.loginSuccess);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || t.auth.error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google OAuth not yet configured. Use email/password login instead.
    alert('Login con Google non ancora disponibile. Usa email e password.');
  };

  return (
    <div className="auth-container" data-testid="login-page">
      <div className="auth-card animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-3xl font-serif text-[#2C2C2C] mb-2" data-testid="login-title">
            {t.auth.login}
          </h1>
          <div className="w-12 h-px bg-[#C44D38] mx-auto" />
        </div>

        {/* Google Sign-In (official button via Google Identity Services) */}
        <div className="mb-6">
          <GoogleSignIn text="signin_with" />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-[#595959]">
              {language === 'it' ? 'oppure' : 'or'}
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="mt-2 text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-[#C44D38] hover:underline"
                data-testid="forgot-password-link"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
            data-testid="login-submit"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.common.loading}
              </>
            ) : (
              t.auth.login
            )}
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-[#595959]">
            {t.auth.noAccount}{' '}
            <Link 
              to="/register" 
              className="text-[#C44D38] hover:underline"
              data-testid="register-link"
            >
              {t.auth.register}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
