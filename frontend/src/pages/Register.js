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
import { Loader2, Mail, Lock, User, Globe, Phone } from 'lucide-react';

const Register = () => {
  const { register, language: currentLang } = useAuth();
  const t = useTranslation(currentLang);
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState(currentLang);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="auth-container" data-testid="register-page">
      <div className="auth-card animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#2C2C2C] mb-2" data-testid="register-title">
            {t.auth.register}
          </h1>
          <div className="w-12 h-px bg-[#C44D38] mx-auto" />
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-[#EBE8E1] border-[#D1CDC7] focus:border-[#C44D38] focus:ring-[#C44D38]"
                placeholder="••••••••"
                minLength={6}
                required
                data-testid="password-input"
              />
            </div>
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
