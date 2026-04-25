import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { 
  Check, 
  X, 
  Loader2, 
  Star, 
  Sparkles, 
  Moon, 
  Sun, 
  BookOpen, 
  MessageCircle,
  BarChart3,
  FileText,
  Compass,
  Heart
} from 'lucide-react';

const API = `${(process.env.REACT_APP_BACKEND_URL || "https://iching-backend-ac3n.onrender.com")}/api`;

const Pricing = () => {
  const { language, getToken, hasSubscription, isAuthenticated } = useAuth();
  const t = useTranslation(language);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error(language === 'it' ? 'Accedi per sottoscrivere' : 'Login to subscribe');
      navigate('/login');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/payments/checkout`, {
        origin_url: window.location.origin
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.detail || t.common.error);
      setLoading(false);
    }
  };

  const plans = {
    free: {
      name: language === 'it' ? 'Piano Gratuito' : 'Free Plan',
      price: '€0',
      period: language === 'it' ? '/sempre' : '/forever',
      description: language === 'it' 
        ? 'Inizia il tuo viaggio con l\'I Ching' 
        : 'Start your I Ching journey',
      features: [
        { 
          name: language === 'it' ? '3 consultazioni al mese' : '3 consultations/month', 
          included: true,
          icon: <MessageCircle className="w-4 h-4" />
        },
        { 
          name: language === 'it' ? 'Stesa diretta' : 'Direct casting', 
          included: true,
          icon: <Compass className="w-4 h-4" />
        },
        { 
          name: language === 'it' ? 'Biblioteca 64 Esagrammi' : '64 Hexagrams Library', 
          included: true,
          icon: <BookOpen className="w-4 h-4" />
        },
        { 
          name: language === 'it' ? 'Storico ultime 10 consultazioni' : 'Last 10 consultations history', 
          included: true,
          icon: <FileText className="w-4 h-4" />
        },
        { 
          name: language === 'it' ? 'Stesa profonda' : 'Deep casting', 
          included: false,
          icon: <Sparkles className="w-4 h-4" />
        },
        { 
          name: language === 'it' ? 'Tema Natale completo' : 'Complete Natal Chart', 
          included: false,
          icon: <Star className="w-4 h-4" />
        },
        { 
          name: language === 'it' ? 'Profilo Astrologico' : 'Astrological Profile', 
          included: false,
          icon: <Moon className="w-4 h-4" />
        },
        { 
          name: language === 'it' ? 'Conversazione continua' : 'Continue conversation', 
          included: false,
          icon: <MessageCircle className="w-4 h-4" />
        },
        { 
          name: language === 'it' ? 'Statistiche personali' : 'Personal statistics', 
          included: false,
          icon: <BarChart3 className="w-4 h-4" />
        },
        { 
          name: language === 'it' ? 'Percorsi guidati' : 'Guided paths', 
          included: false,
          icon: <Compass className="w-4 h-4" />
        },
      ]
    },
    premium: {
      name: language === 'it' ? 'Piano Premium' : 'Premium Plan',
      price: billingPeriod === 'monthly' ? '€9.99' : '€79.99',
      period: billingPeriod === 'monthly' 
        ? (language === 'it' ? '/mese' : '/month')
        : (language === 'it' ? '/anno' : '/year'),
      savings: billingPeriod === 'yearly' ? (language === 'it' ? 'Risparmi 33%' : 'Save 33%') : null,
      description: language === 'it' 
        ? 'Accesso completo a tutte le funzionalità' 
        : 'Full access to all features',
      highlight: true,
      features: [
        { 
          name: language === 'it' ? 'Consultazioni illimitate' : 'Unlimited consultations', 
          included: true,
          icon: <MessageCircle className="w-4 h-4" />,
          highlight: true
        },
        { 
          name: language === 'it' ? 'Stesa diretta + profonda' : 'Direct + Deep casting', 
          included: true,
          icon: <Sparkles className="w-4 h-4" />,
          highlight: true
        },
        { 
          name: language === 'it' ? 'Biblioteca 64 Esagrammi' : '64 Hexagrams Library', 
          included: true,
          icon: <BookOpen className="w-4 h-4" />
        },
        { 
          name: language === 'it' ? 'Storico illimitato' : 'Unlimited history', 
          included: true,
          icon: <FileText className="w-4 h-4" />,
          highlight: true
        },
        { 
          name: language === 'it' ? 'Tema Natale interattivo' : 'Interactive Natal Chart', 
          included: true,
          icon: <Star className="w-4 h-4" />,
          highlight: true,
          isNew: true
        },
        { 
          name: language === 'it' ? 'Profilo Astrologico completo' : 'Complete Astrological Profile', 
          included: true,
          icon: <Moon className="w-4 h-4" />,
          highlight: true,
          isNew: true
        },
        { 
          name: language === 'it' ? 'Aspetti planetari dettagliati' : 'Detailed planetary aspects', 
          included: true,
          icon: <Sun className="w-4 h-4" />,
          isNew: true
        },
        { 
          name: language === 'it' ? 'Conversazione continua AI' : 'AI continuous conversation', 
          included: true,
          icon: <MessageCircle className="w-4 h-4" />,
          highlight: true
        },
        { 
          name: language === 'it' ? 'Statistiche e analisi' : 'Statistics & analysis', 
          included: true,
          icon: <BarChart3 className="w-4 h-4" />
        },
        { 
          name: language === 'it' ? 'Percorsi guidati tematici' : 'Thematic guided paths', 
          included: true,
          icon: <Compass className="w-4 h-4" />
        },
        { 
          name: language === 'it' ? 'Esportazione PDF' : 'PDF export', 
          included: true,
          icon: <FileText className="w-4 h-4" />
        },
        { 
          name: language === 'it' ? 'Modalità meditativa' : 'Meditative mode', 
          included: true,
          icon: <Heart className="w-4 h-4" />
        },
      ]
    }
  };

  return (
    <div className="section-zen" data-testid="pricing-page">
      <div className="container-zen max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-4">
            {language === 'it' ? 'Scegli il Tuo Percorso' : 'Choose Your Path'}
          </h1>
          <p className="text-lg text-[#595959] max-w-2xl mx-auto">
            {language === 'it' 
              ? 'Accedi alla saggezza millenaria dell\'I Ching e alle potenti funzionalità astrologiche'
              : 'Access the ancient wisdom of I Ching and powerful astrological features'}
          </p>
          <div className="w-16 h-px bg-[#C44D38] mx-auto mt-6" />
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center bg-[#EBE8E1] rounded-full p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === 'monthly' 
                  ? 'bg-white text-[#2C2C2C] shadow-sm' 
                  : 'text-[#595959] hover:text-[#2C2C2C]'
              }`}
            >
              {language === 'it' ? 'Mensile' : 'Monthly'}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingPeriod === 'yearly' 
                  ? 'bg-white text-[#2C2C2C] shadow-sm' 
                  : 'text-[#595959] hover:text-[#2C2C2C]'
              }`}
            >
              {language === 'it' ? 'Annuale' : 'Yearly'}
              <span className="text-xs bg-[#8A9A5B] text-white px-2 py-0.5 rounded-full">
                -33%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="animate-fade-in-up stagger-1">
            <div className="zen-card h-full border-2 border-[#D1CDC7] hover:border-[#C44D38]/30 transition-colors">
              <div className="text-center mb-6">
                <h3 className="font-serif text-2xl text-[#2C2C2C] mb-2">{plans.free.name}</h3>
                <p className="text-sm text-[#595959] mb-4">{plans.free.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-serif text-[#2C2C2C]">{plans.free.price}</span>
                  <span className="text-[#595959] ml-1">{plans.free.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plans.free.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      feature.included 
                        ? 'bg-[#8A9A5B]/20 text-[#6B7A40]' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {feature.included ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    </div>
                    <span className={`text-sm ${feature.included ? 'text-[#2C2C2C]' : 'text-gray-400 line-through'}`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              {!isAuthenticated ? (
                <Button
                  onClick={() => navigate('/register')}
                  className="w-full bg-[#EBE8E1] text-[#2C2C2C] hover:bg-[#D1CDC7]"
                >
                  {language === 'it' ? 'Registrati Gratis' : 'Sign Up Free'}
                </Button>
              ) : (
                <div className="text-center text-sm text-[#595959]">
                  {language === 'it' ? 'Il tuo piano attuale' : 'Your current plan'}
                </div>
              )}
            </div>
          </div>

          {/* Premium Plan */}
          <div className="animate-fade-in-up stagger-2">
            <div className="zen-card h-full border-2 border-[#C44D38] relative overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-4 right-4">
                <span className="bg-[#C44D38] text-white text-xs px-3 py-1 rounded-full">
                  {language === 'it' ? '⭐ Consigliato' : '⭐ Recommended'}
                </span>
              </div>

              <div className="text-center mb-6 pt-4">
                <h3 className="font-serif text-2xl text-[#2C2C2C] mb-2">{plans.premium.name}</h3>
                <p className="text-sm text-[#595959] mb-4">{plans.premium.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-serif text-[#C44D38]">{plans.premium.price}</span>
                  <span className="text-[#595959] ml-1">{plans.premium.period}</span>
                </div>
                {plans.premium.savings && (
                  <span className="inline-block mt-2 text-sm text-[#8A9A5B] font-medium">
                    {plans.premium.savings}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plans.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      feature.highlight 
                        ? 'bg-[#C44D38]/20 text-[#C44D38]' 
                        : 'bg-[#8A9A5B]/20 text-[#6B7A40]'
                    }`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={`text-sm ${feature.highlight ? 'text-[#2C2C2C] font-medium' : 'text-[#2C2C2C]'}`}>
                      {feature.name}
                      {feature.isNew && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {hasSubscription ? (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 px-6 py-3 bg-[#8A9A5B]/20 text-[#6B7A40] rounded-lg">
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
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      {t.pricing.subscribe}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 animate-fade-in-up stagger-3">
          <h2 className="text-2xl font-serif text-[#2C2C2C] text-center mb-8">
            {language === 'it' ? 'Funzionalità Premium Esclusive' : 'Exclusive Premium Features'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Natal Chart */}
            <div className="zen-card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-serif text-lg text-[#2C2C2C] mb-2">
                {language === 'it' ? 'Tema Natale Interattivo' : 'Interactive Natal Chart'}
              </h3>
              <p className="text-sm text-[#595959]">
                {language === 'it' 
                  ? 'Calcolo preciso con Swiss Ephemeris. Zoom, trascinamento e descrizioni dettagliate delle 12 case.'
                  : 'Precise calculation with Swiss Ephemeris. Zoom, drag and detailed descriptions of 12 houses.'}
              </p>
            </div>

            {/* Astrological Profile */}
            <div className="zen-card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                <Moon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-serif text-lg text-[#2C2C2C] mb-2">
                {language === 'it' ? 'Profilo Astrologico' : 'Astrological Profile'}
              </h3>
              <p className="text-sm text-[#595959]">
                {language === 'it' 
                  ? 'Ascendente, Medio Cielo, posizioni planetarie e interpretazioni personalizzate basate sulla tua data di nascita.'
                  : 'Ascendant, Midheaven, planetary positions and personalized interpretations based on your birth date.'}
              </p>
            </div>

            {/* Planetary Aspects */}
            <div className="zen-card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                <Sun className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-serif text-lg text-[#2C2C2C] mb-2">
                {language === 'it' ? 'Aspetti Planetari' : 'Planetary Aspects'}
              </h3>
              <p className="text-sm text-[#595959]">
                {language === 'it' 
                  ? 'Congiunzioni, trigoni, quadrature e opposizioni con interpretazioni dettagliate per ogni combinazione.'
                  : 'Conjunctions, trines, squares and oppositions with detailed interpretations for each combination.'}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center animate-fade-in-up stagger-4">
          <p className="text-sm text-[#595959]">
            {language === 'it' 
              ? '🔒 Pagamento sicuro tramite Stripe • Cancella in qualsiasi momento • Nessun costo nascosto'
              : '🔒 Secure payment via Stripe • Cancel anytime • No hidden fees'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
