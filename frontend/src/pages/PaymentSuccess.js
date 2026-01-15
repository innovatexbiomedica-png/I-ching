import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import axios from 'axios';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, getToken } = useAuth();
  const t = useTranslation(language);
  
  const [status, setStatus] = useState('loading');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      pollPaymentStatus(sessionId);
    } else {
      setStatus('error');
    }
  }, []);

  const pollPaymentStatus = async (sessionId) => {
    if (attempts >= maxAttempts) {
      setStatus('timeout');
      return;
    }

    try {
      const response = await axios.get(`${API}/payments/status/${sessionId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      if (response.data.payment_status === 'paid') {
        setStatus('success');
        // Reload user data to update subscription status
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3000);
      } else if (response.data.status === 'expired') {
        setStatus('expired');
      } else {
        // Continue polling
        setAttempts(prev => prev + 1);
        setTimeout(() => pollPaymentStatus(sessionId), 2000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setAttempts(prev => prev + 1);
      setTimeout(() => pollPaymentStatus(sessionId), 2000);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-[#C44D38]" />
            <h1 className="text-2xl font-serif text-[#2C2C2C] mb-2">
              {t.payment.processing}
            </h1>
            <p className="text-[#595959]">
              {language === 'it' ? 'Attendere prego...' : 'Please wait...'}
            </p>
          </>
        );
      
      case 'success':
        return (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-6 text-[#8A9A5B]" />
            <h1 className="text-2xl font-serif text-[#2C2C2C] mb-2">
              {t.payment.success}
            </h1>
            <p className="text-[#595959] mb-8">
              {t.payment.successMessage}
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
              data-testid="go-to-dashboard"
            >
              {t.payment.goToDashboard}
            </Button>
          </>
        );
      
      case 'expired':
      case 'timeout':
      case 'error':
        return (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-6 text-[#C44D38]" />
            <h1 className="text-2xl font-serif text-[#2C2C2C] mb-2">
              {language === 'it' ? 'Si è verificato un problema' : 'Something went wrong'}
            </h1>
            <p className="text-[#595959] mb-8">
              {language === 'it' 
                ? 'Il pagamento potrebbe essere stato elaborato. Controlla la tua email.'
                : 'The payment may have been processed. Check your email.'}
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              {t.payment.goToDashboard}
            </Button>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="section-zen" data-testid="payment-success-page">
      <div className="container-zen max-w-md text-center">
        <div className="zen-card animate-fade-in-up">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
