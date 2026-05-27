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
import GoogleSignIn from '../components/GoogleSignIn';

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

  // GDPR consent state — privacy is required, marketing is optional
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptedPrivacy) {
      toast.error(
        currentLang === 'it'
          ? 'Per procedere devi accettare l\'Informativa Privacy.'
          : 'You must accept the Privacy Notice to proceed.'
      );
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name, language, phone, {
        privacy_accepted: true,
        marketing_consent: acceptedMarketing,
      });
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
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-3xl font-serif text-[#2C2C2C] mb-2" data-testid="register-title">
            {t.auth.register}
          </h1>
          <div className="w-12 h-px bg-[#C44D38] mx-auto" />
        </div>

        {/* ──────────────────────────────────────────────────────────────
            GDPR CONSENT — must appear BEFORE any sign-up method (Google
            included). Without privacy consent the user cannot register.
            Layout follows the lawyer's spec:
            1. Short notice with link to full Privacy Policy
            2. Mandatory checkbox (privacy)
            3. Optional checkbox (marketing)
            ────────────────────────────────────────────────────────────── */}
        <div className="space-y-3 mb-6">
          {/* Short legal notice */}
          <div className="rounded-md border border-[#D1CDC7] bg-[#F9F7F2] px-4 py-3 text-sm text-[#3a3a3a] text-center">
            {currentLang === 'it'
              ? 'Procedendo con la registrazione accetti la nostra '
              : 'By signing up you accept our '}
            <Link to="/privacy" className="font-medium text-[#C44D38] underline" target="_blank" rel="noopener">
              {currentLang === 'it' ? 'Informativa Privacy' : 'Privacy Notice'}
            </Link>{' '}
            (art. 13 Reg. UE 2016/679).
          </div>

          {/* Mandatory privacy checkbox */}
          <label
            className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition ${
              acceptedPrivacy
                ? 'border-[#C44D38] bg-[#FDF4F1]'
                : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              className="mt-1 accent-[#C44D38] w-4 h-4 flex-shrink-0"
              data-testid="privacy-checkbox"
              required
            />
            <span className="text-sm text-[#2C2C2C] leading-snug">
              {currentLang === 'it' ? (
                <>
                  Ho letto e accetto l'
                  <Link to="/privacy" target="_blank" rel="noopener" className="font-medium text-[#C44D38] underline">
                    Informativa Privacy
                  </Link>
                  . Acconsento al trattamento dei miei dati personali ai sensi dell'art. 13 del Reg. UE 2016/679 (GDPR).{' '}
                  <span className="text-[#C44D38] font-medium">*obbligatorio</span>
                </>
              ) : (
                <>
                  I have read and accept the{' '}
                  <Link to="/privacy" target="_blank" rel="noopener" className="font-medium text-[#C44D38] underline">
                    Privacy Notice
                  </Link>
                  . I consent to the processing of my personal data under art. 13 of EU Reg. 2016/679 (GDPR).{' '}
                  <span className="text-[#C44D38] font-medium">*required</span>
                </>
              )}
            </span>
          </label>

          {/* Optional marketing checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-md border border-[#E5E0D8] bg-white cursor-pointer hover:bg-[#F9F7F2]">
            <input
              type="checkbox"
              checked={acceptedMarketing}
              onChange={(e) => setAcceptedMarketing(e.target.checked)}
              className="mt-1 accent-[#C44D38] w-4 h-4 flex-shrink-0"
              data-testid="marketing-checkbox"
            />
            <span className="text-sm text-[#3a3a3a] leading-snug">
              {currentLang === 'it'
                ? <>Acconsento a ricevere comunicazioni promozionali e aggiornamenti via email. <span className="text-[#7a6f63]">(facoltativo)</span></>
                : <>I consent to receive promotional communications and updates via email. <span className="text-[#7a6f63]">(optional)</span></>}
            </span>
          </label>
        </div>

        {/* ──────────────────────────────────────────────────────────────
            Sign-up methods. The Google button is disabled until the user
            checks the privacy box, so the consent precedes ANY data
            transmission to Google or to our backend.
            ────────────────────────────────────────────────────────────── */}
        {acceptedPrivacy ? (
          <div className="mb-6">
            <GoogleSignIn text="signup_with" />
          </div>
        ) : (
          <div className="mb-6">
            <button
              type="button"
              disabled
              className="w-full px-4 py-2.5 rounded border border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed flex items-center justify-center gap-2"
              title={currentLang === 'it' ? 'Accetta l\'Informativa Privacy per usare Google' : 'Accept the Privacy Notice to use Google'}
            >
              <svg className="h-5 w-5 opacity-50" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              </svg>
              <span className="text-sm">
                {currentLang === 'it' ? 'Accetta la privacy per usare Google' : 'Accept privacy to use Google'}
              </span>
            </button>
          </div>
        )}

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
            disabled={loading || !acceptedPrivacy}
            className="w-full btn-primary"
            data-testid="register-submit"
            title={
              !acceptedPrivacy
                ? (currentLang === 'it' ? 'Accetta l\'Informativa Privacy per procedere' : 'Accept the Privacy Notice to proceed')
                : ''
            }
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
          {!acceptedPrivacy && (
            <p className="text-xs text-center text-[#7a6f63] -mt-3">
              {currentLang === 'it'
                ? '↑ Accetta l\'Informativa Privacy per attivare la registrazione'
                : '↑ Accept the Privacy Notice to enable registration'}
            </p>
          )}
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
