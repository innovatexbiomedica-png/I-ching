import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Check, Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Pricing = () => {
  const { language, getToken, hasSubscription, isAuthenticated } = useAuth();
  const t = useTranslation(language);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error(language === 'it' ? 'Accedi per sottoscrivere' : 'Login to subscribe');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/payments/checkout`, {
        origin_url: window.location.origin
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.detail || t.common.error);
      setLoading(false);
    }
  };

  return (
    <div className="section-zen" data-testid="pricing-page">
      <div className="container-zen max-w-4xl">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-4">
            {t.pricing.title}
          </h1>
          <p className="text-lg text-[#595959]">
            {t.pricing.subtitle}
          </p>
          <div className="w-16 h-px bg-[#C44D38] mx-auto mt-6" />
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto animate-fade-in-up stagger-1">
          <div className="pricing-card pricing-card-featured">
            <div className="text-center mb-8">
              <p className="text-sm text-[#C44D38] tracking-[0.2em] uppercase mb-4">
                {language === 'it' ? 'Abbonamento Mensile' : 'Monthly Subscription'}
              </p>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-serif text-[#2C2C2C]">{t.pricing.price}</span>
                <span className="text-[#595959] ml-1">{t.pricing.period}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {t.pricing.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#8A9A5B]/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#6B7A40]" />
                  </div>
                  <span className="text-[#2C2C2C]">{feature}</span>
                </li>
              ))}
            </ul>

            {hasSubscription ? (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 px-6 py-3 bg-[#8A9A5B]/20 text-[#6B7A40] rounded">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">{t.pricing.alreadySubscribed}</span>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full btn-primary py-4 text-lg"
                data-testid="subscribe-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t.common.loading}
                  </>
                ) : (
                  t.pricing.subscribe
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center animate-fade-in-up stagger-2">
          <p className="text-sm text-[#595959]">
            {language === 'it' 
              ? 'Pagamento sicuro tramite Stripe. Puoi cancellare in qualsiasi momento.'
              : 'Secure payment via Stripe. Cancel anytime.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
