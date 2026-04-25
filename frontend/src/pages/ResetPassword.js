import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, Mail, Lock, Key, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || "https://iching-backend-ac3n.onrender.com")}/api`;

const ResetPassword = () => {
  const { language } = useAuth();
  const t = useTranslation(language);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error(
        language === 'it' 
          ? 'Le password non coincidono' 
          : 'Passwords do not match'
      );
      return;
    }

    if (newPassword.length < 6) {
      toast.error(
        language === 'it' 
          ? 'La password deve essere almeno 6 caratteri' 
          : 'Password must be at least 6 characters'
      );
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post(`${API}/auth/verify-reset`, { 
        email, 
        code, 
        new_password: newPassword 
      });
      setSuccess(true);
      toast.success(
        language === 'it' 
          ? 'Password aggiornata con successo!' 
          : 'Password updated successfully!'
      );
    } catch (error) {
      toast.error(error.response?.data?.detail || t.auth.error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container" data-testid="reset-success">
        <div className="auth-card animate-fade-in-up text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-serif text-[#2C2C2C] mb-4">
            {language === 'it' ? 'Password Aggiornata' : 'Password Updated'}
          </h1>
          <p className="text-[#595959] mb-6">
            {language === 'it' 
              ? 'La tua password è stata aggiornata con successo. Ora puoi accedere con la nuova password.'
              : 'Your password has been successfully updated. You can now log in with your new password.'}
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="w-full btn-primary"
            data-testid="go-to-login-btn"
          >
            {language === 'it' ? 'Vai al Login' : 'Go to Login'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" data-testid="reset-password-page">
      <div className="auth-card animate-fade-in-up">
        <Link 
          to="/forgot-password" 
          className="flex items-center space-x-2 text-[#595959] hover:text-[#2C2C2C] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'it' ? 'Richiedi nuovo codice' : 'Request new code'}</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#2C2C2C] mb-2" data-testid="reset-password-title">
            {language === 'it' ? 'Reimposta Password' : 'Reset Password'}
          </h1>
          <div className="w-12 h-px bg-[#C44D38] mx-auto mb-4" />
          <p className="text-[#595959] text-sm">
            {language === 'it' 
              ? 'Inserisci il codice ricevuto e la nuova password'
              : 'Enter the code you received and your new password'}
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
            <Label htmlFor="code" className="form-label">
              {language === 'it' ? 'Codice di Reset' : 'Reset Code'}
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#595959]" />
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="pl-10 bg-[#EBE8E1] border-[#D1CDC7] focus:border-[#C44D38] focus:ring-[#C44D38] text-center text-xl tracking-widest"
                placeholder="123456"
                maxLength={6}
                required
                data-testid="code-input"
              />
            </div>
            <p className="text-xs text-[#595959] mt-1">
              {language === 'it' 
                ? 'Inserisci il codice a 6 cifre ricevuto'
                : 'Enter the 6-digit code you received'}
            </p>
          </div>

          <div className="form-group">
            <Label htmlFor="newPassword" className="form-label">
              {language === 'it' ? 'Nuova Password' : 'New Password'}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#595959]" />
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 bg-[#EBE8E1] border-[#D1CDC7] focus:border-[#C44D38] focus:ring-[#C44D38]"
                placeholder="••••••••"
                minLength={6}
                required
                data-testid="new-password-input"
              />
            </div>
          </div>

          <div className="form-group">
            <Label htmlFor="confirmPassword" className="form-label">
              {language === 'it' ? 'Conferma Password' : 'Confirm Password'}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#595959]" />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 bg-[#EBE8E1] border-[#D1CDC7] focus:border-[#C44D38] focus:ring-[#C44D38]"
                placeholder="••••••••"
                minLength={6}
                required
                data-testid="confirm-password-input"
              />
            </div>
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
              language === 'it' ? 'Reimposta Password' : 'Reset Password'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#E5E0D8]">
          <p className="text-sm text-[#595959] text-center">
            {language === 'it' 
              ? 'Non hai il codice?' 
              : "Don't have the code?"}
            {' '}
            <Link 
              to="/forgot-password" 
              className="text-[#C44D38] hover:underline"
            >
              {language === 'it' ? 'Richiedilo qui' : 'Request it here'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
