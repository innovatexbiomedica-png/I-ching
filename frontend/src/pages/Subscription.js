import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Crown, Check, X, Zap, Compass, BookOpen, BarChart3, StickyNote, Moon, Bell, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const API = `${(process.env.REACT_APP_BACKEND_URL || "https://iching-backend-ac3n.onrender.com")}/api`;

const Subscription = () => {
  const { language, getToken, user, refreshUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get(`${API}/subscription/status`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType) => {
    setProcessingPayment(true);
    try {
      const response = await axios.post(`${API}/payments/create-checkout`, 
        { plan_type: planType },
        { headers: { Authorization: `Bearer ${getToken()}` }}
      );
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Errore nel processare il pagamento');
    } finally {
      setProcessingPayment(false);
    }
  };

  const features = [
    {
      icon: <Compass className="w-5 h-5" />,
      name: language === 'it' ? 'Consultazioni al mese' : 'Monthly consultations',
      free: '3',
      premium: language === 'it' ? 'Illimitate' : 'Unlimited',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      name: language === 'it' ? 'Stesa Diretta' : 'Direct Reading',
      free: true,
      premium: true,
    },
    {
      icon: <Moon className="w-5 h-5" />,
      name: language === 'it' ? 'Stesa Profonda' : 'Deep Reading',
      free: false,
      premium: true,
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      name: language === 'it' ? 'Storico consultazioni' : 'Consultation history',
      free: '10',
      premium: language === 'it' ? 'Illimitato' : 'Unlimited',
    },
    {
      icon: <StickyNote className="w-5 h-5" />,
      name: language === 'it' ? 'Note personali' : 'Personal notes',
      free: false,
      premium: true,
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      name: language === 'it' ? 'Statistiche complete' : 'Full statistics',
      free: false,
      premium: true,
    },
    {
      name: language === 'it' ? 'Continuazione conversazioni' : 'Conversation continuation',
      free: false,
      premium: true,
    },
    {
      name: language === 'it' ? 'Sintesi multiple stese' : 'Multiple readings synthesis',
      free: false,
      premium: true,
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      name: language === 'it' ? 'Consigli Personalizzati AI' : 'AI Personalized Advice',
      free: false,
      premium: true,
    },
    {
      icon: <Bell className="w-5 h-5" />,
      name: language === 'it' ? 'Notifiche & Calendario Cinese' : 'Notifications & Chinese Calendar',
      free: false,
      premium: true,
    },
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-[#E5E0D8] rounded w-1/3 mx-auto"></div>
            <div className="h-64 bg-[#E5E0D8] rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const isPremium = status?.plan === 'premium';

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#C44D38] to-[#E67E22] flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl text-[#2C2C2C] mb-2">
            {language === 'it' ? 'Abbonamento' : 'Subscription'}
          </h1>
          <p className="text-[#595959]">
            {language === 'it' 
              ? 'Sblocca tutte le funzionalità del tuo viaggio con l\'I Ching'
              : 'Unlock all features of your I Ching journey'}
          </p>
        </div>

        {/* Current Plan Status */}
        {isPremium && (
          <div className="zen-card mb-6 bg-gradient-to-r from-[#C44D38]/10 to-[#E67E22]/10 border-2 border-[#C44D38]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="w-8 h-8 text-[#C44D38]" />
                <div>
                  <h3 className="font-serif text-xl text-[#2C2C2C]">
                    {language === 'it' ? 'Piano Premium Attivo' : 'Premium Plan Active'}
                  </h3>
                  {status.subscription_end && (
                    <p className="text-sm text-[#595959]">
                      {language === 'it' ? 'Scade il: ' : 'Expires: '}
                      {new Date(status.subscription_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#595959]">
                  {language === 'it' ? 'Consultazioni questo mese' : 'Consultations this month'}
                </p>
                <p className="text-2xl font-bold text-[#C44D38]">{status.usage?.monthly_consultations || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free Plan */}
          <div className={`zen-card ${!isPremium ? 'border-2 border-[#C44D38]' : ''}`}>
            <div className="text-center mb-6">
              <h3 className="font-serif text-2xl text-[#2C2C2C] mb-2">Free</h3>
              <p className="text-4xl font-bold text-[#2C2C2C]">€0</p>
              <p className="text-sm text-[#595959]">{language === 'it' ? 'per sempre' : 'forever'}</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-[#595959]">{feature.name}</span>
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-[#D1CDC7]" />
                    )
                  ) : (
                    <span className="text-sm font-medium text-[#2C2C2C]">{feature.free}</span>
                  )}
                </li>
              ))}
            </ul>

            {!isPremium && (
              <button disabled className="w-full py-3 rounded-lg border-2 border-[#C44D38] text-[#C44D38] font-medium">
                {language === 'it' ? 'Piano Attuale' : 'Current Plan'}
              </button>
            )}
          </div>

          {/* Premium Plan */}
          <div className={`zen-card bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] text-white ${isPremium ? 'border-2 border-[#C44D38]' : ''}`}>
            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 bg-[#C44D38] rounded-full text-xs uppercase tracking-wider mb-2">
                {language === 'it' ? 'Più Popolare' : 'Most Popular'}
              </div>
              <h3 className="font-serif text-2xl mb-2">Premium</h3>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-4xl font-bold">€9.99</p>
                <span className="text-sm text-white/60">/{language === 'it' ? 'mese' : 'month'}</span>
              </div>
              <p className="text-sm text-white/60 mt-1">
                {language === 'it' ? 'o €79.99/anno (risparmia 33%)' : 'or €79.99/year (save 33%)'}
              </p>
            </div>
            
            <ul className="space-y-3 mb-6">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-white/80">{feature.name}</span>
                  {typeof feature.premium === 'boolean' ? (
                    feature.premium ? (
                      <Check className="w-5 h-5 text-[#C44D38]" />
                    ) : (
                      <X className="w-5 h-5 text-white/30" />
                    )
                  ) : (
                    <span className="text-sm font-medium text-[#C44D38]">{feature.premium}</span>
                  )}
                </li>
              ))}
            </ul>

            {isPremium ? (
              <button disabled className="w-full py-3 rounded-lg bg-[#C44D38] text-white font-medium">
                {language === 'it' ? 'Piano Attuale' : 'Current Plan'}
              </button>
            ) : (
              <div className="space-y-2">
                <button 
                  onClick={() => handleSubscribe('monthly')}
                  disabled={processingPayment}
                  className="w-full py-3 rounded-lg bg-[#C44D38] text-white font-medium hover:bg-[#A33D2B] transition-colors disabled:opacity-50"
                >
                  {processingPayment 
                    ? (language === 'it' ? 'Elaborazione...' : 'Processing...') 
                    : (language === 'it' ? 'Abbonati Mensile' : 'Subscribe Monthly')}
                </button>
                <button 
                  onClick={() => handleSubscribe('yearly')}
                  disabled={processingPayment}
                  className="w-full py-3 rounded-lg border-2 border-[#C44D38] text-[#C44D38] font-medium hover:bg-[#C44D38]/10 transition-colors disabled:opacity-50"
                >
                  {language === 'it' ? 'Abbonati Annuale (risparmia 33%)' : 'Subscribe Yearly (save 33%)'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Features Detail */}
        <div className="zen-card">
          <h3 className="font-serif text-xl text-[#2C2C2C] mb-4">
            {language === 'it' ? 'Cosa include Premium?' : 'What does Premium include?'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#C44D38]/10 flex items-center justify-center flex-shrink-0">
                <Compass className="w-5 h-5 text-[#C44D38]" />
              </div>
              <div>
                <h4 className="font-medium text-[#2C2C2C]">
                  {language === 'it' ? 'Consultazioni Illimitate' : 'Unlimited Consultations'}
                </h4>
                <p className="text-sm text-[#595959]">
                  {language === 'it' 
                    ? 'Nessun limite al numero di consultazioni mensili'
                    : 'No limit on monthly consultations'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#C44D38]/10 flex items-center justify-center flex-shrink-0">
                <Moon className="w-5 h-5 text-[#C44D38]" />
              </div>
              <div>
                <h4 className="font-medium text-[#2C2C2C]">
                  {language === 'it' ? 'Stese Profonde' : 'Deep Readings'}
                </h4>
                <p className="text-sm text-[#595959]">
                  {language === 'it' 
                    ? 'Interpretazioni complete di 600-900 parole'
                    : 'Complete interpretations of 600-900 words'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#C44D38]/10 flex items-center justify-center flex-shrink-0">
                <StickyNote className="w-5 h-5 text-[#C44D38]" />
              </div>
              <div>
                <h4 className="font-medium text-[#2C2C2C]">
                  {language === 'it' ? 'Diario Personale' : 'Personal Diary'}
                </h4>
                <p className="text-sm text-[#595959]">
                  {language === 'it' 
                    ? 'Aggiungi note e riflessioni alle tue consultazioni'
                    : 'Add notes and reflections to your consultations'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#C44D38]/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-[#C44D38]" />
              </div>
              <div>
                <h4 className="font-medium text-[#2C2C2C]">
                  {language === 'it' ? 'Statistiche Avanzate' : 'Advanced Statistics'}
                </h4>
                <p className="text-sm text-[#595959]">
                  {language === 'it' 
                    ? 'Scopri i tuoi pattern e tendenze nelle consultazioni'
                    : 'Discover your patterns and trends in consultations'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#C44D38]/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#C44D38]" />
              </div>
              <div>
                <h4 className="font-medium text-[#2C2C2C]">
                  {language === 'it' ? 'Consigli Personalizzati AI' : 'AI Personalized Advice'}
                </h4>
                <p className="text-sm text-[#595959]">
                  {language === 'it' 
                    ? 'Ricevi consigli giornalieri basati sui tuoi percorsi e calendario zodiacale cinese'
                    : 'Receive daily advice based on your paths and Chinese zodiac calendar'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#C44D38]/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-[#C44D38]" />
              </div>
              <div>
                <h4 className="font-medium text-[#2C2C2C]">
                  {language === 'it' ? 'Notifiche Personalizzate' : 'Personalized Notifications'}
                </h4>
                <p className="text-sm text-[#595959]">
                  {language === 'it' 
                    ? 'Scegli frequenza giornaliera, settimanale o mensile per i tuoi promemoria'
                    : 'Choose daily, weekly or monthly frequency for your reminders'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
