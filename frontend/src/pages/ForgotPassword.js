import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, Mail, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ForgotPassword = () => {
  const { language } = useAuth();
  const t = useTranslation(language);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetCode, setResetCode] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/auth/request-reset`, { email, phone });
      setSubmitted(true);
      
      // Se siamo in modalità test, salva il codice
      if (response.data.reset_code) {
        setResetCode(response.data.reset_code);
      }
      
      toast.success(
        language === 'it' 
          ? 'Richiesta inviata!' 
          : 'Request sent!'
      );
    } catch (error) {
      toast.error(error.response?.data?.detail || t.auth.error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container" data-testid="forgot-password-success">
        <div className="auth-card animate-fade-in-up text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-serif text-[#2C2C2C] mb-4">
            {language === 'it' ? 'Richiesta Inviata' : 'Request Sent'}
          </h1>
          
          {/* Mostra il codice in modalità test */}
          {resetCode && (
            <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-400 rounded-lg">
              <p className="text-amber-800 text-sm font-medium mb-2">
                ⚠️ {language === 'it' ? 'MODALITÀ TEST' : 'TEST MODE'}
              </p>
              <p className="text-[#595959] text-sm mb-2">
                {language === 'it' 
                  ? 'Il tuo codice di reset è:'
                  : 'Your reset code is:'}
              </p>
              <div className="text-3xl font-mono font-bold text-[#C44D38] tracking-widest" data-testid="reset-code-display">
                {resetCode}
              </div>
              <p className="text-xs text-amber-700 mt-2">
                {language === 'it' 
                  ? '(In produzione questo codice verrà inviato via SMS/Email)'
                  : '(In production this code will be sent via SMS/Email)'}
              </p>
            </div>
          )}
          
          {!resetCode && (
            <p className="text-[#595959] mb-6">
              {language === 'it' 
                ? 'Abbiamo ricevuto la tua richiesta. L\'amministratore ti contatterà al numero di telefono fornito con il codice di reset.'
                : 'We received your request. The administrator will contact you at the phone number provided with the reset code.'}
            </p>
          )}
          
          <div className="space-y-4">
            <Button
              onClick={() => navigate('/reset-password')}
              className="w-full btn-primary"
              data-testid="go-to-reset-btn"
            >
              {language === 'it' ? 'Vai a Reimposta Password' : 'Go to Reset Password'}
            </Button>
            <Link 
              to="/login" 
              className="block text-[#C44D38] hover:underline"
            >
              {language === 'it' ? 'Torna al login' : 'Back to login'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" data-testid="forgot-password-page">
      <div className="auth-card animate-fade-in-up">
        <Link 
          to="/login" 
          className="flex items-center space-x-2 text-[#595959] hover:text-[#2C2C2C] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'it' ? 'Torna al login' : 'Back to login'}</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#2C2C2C] mb-2" data-testid="forgot-password-title">
            {language === 'it' ? 'Recupera Password' : 'Reset Password'}
          </h1>
          <div className="w-12 h-px bg-[#C44D38] mx-auto mb-4" />
          <p className="text-[#595959] text-sm">
            {language === 'it' 
              ? 'Inserisci la tua email e numero di telefono. Ti contatteremo con un codice di reset.'
              : 'Enter your email and phone number. We will contact you with a reset code.'}
          </p>
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
            <Label htmlFor="phone" className="form-label">
              {language === 'it' ? 'Numero di Telefono' : 'Phone Number'}
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
                required
                data-testid="phone-input"
              />
            </div>
            <p className="text-xs text-[#595959] mt-1">
              {language === 'it' 
                ? 'Ti contatteremo su questo numero con il codice di reset'
                : 'We will contact you on this number with the reset code'}
            </p>
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
            data-testid="submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.common.loading}
              </>
            ) : (
              language === 'it' ? 'Richiedi Reset' : 'Request Reset'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E5E0D8]">
          <p className="text-sm text-[#595959] text-center">
            {language === 'it' 
              ? 'Hai già ricevuto il codice?' 
              : 'Already have the code?'}
            {' '}
            <Link 
              to="/reset-password" 
              className="text-[#C44D38] hover:underline"
              data-testid="reset-link"
            >
              {language === 'it' ? 'Reimposta password' : 'Reset password'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
