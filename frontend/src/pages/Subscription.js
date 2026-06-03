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
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

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
      const response = await axios.post(
        `${API}/payments/checkout`,
        {
          plan_type: planType,
          origin_url: window.location.origin,
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      // Backend returns { url, session_id }
      const checkoutUrl = response.data.url || response.data.checkout_url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error('URL di pagamento mancante. Riprova.');
      }
    } catch (error) {
      const detail = error.response?.data?.detail;
      const msg = error.response?.status === 404
        ? 'Endpoint pagamento non disponibile. Contatta il supporto.'
        : (detail || 'Errore nel processare il pagamento');
      toast.error(msg);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Four-tier feature comparison: free / trial (gettone) / base / fitness coaching
  const features = [
    {
      icon: <Compass className="w-5 h-5" />,
      name: language === 'it' ? 'Consultazioni' : 'Consultations',
      free: language === 'it' ? '1 / mese' : '1 / mo',
      trial: language === 'it' ? '3 totali' : '3 total',
      base: language === 'it' ? 'Illimitate' : 'Unlimited',
      fitness: language === 'it' ? 'Illimitate' : 'Unlimited',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      name: language === 'it' ? 'Interpretazione Diretta (300-400 parole)' : 'Direct interpretation',
      free: true, trial: true, base: true, fitness: true,
    },
    {
      icon: <Moon className="w-5 h-5" />,
      name: language === 'it' ? 'Interpretazione Profonda (700-1000 parole)' : 'Deep interpretation',
      free: false, trial: true, base: true, fitness: true,
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      name: language === 'it' ? 'Storico consultazioni' : 'Consultation history',
      free: '10',
      trial: language === 'it' ? 'durante la prova' : 'during trial',
      base: language === 'it' ? 'Illimitato' : 'Unlimited',
      fitness: language === 'it' ? 'Illimitato' : 'Unlimited',
    },
    {
      icon: <StickyNote className="w-5 h-5" />,
      name: language === 'it' ? 'Note personali' : 'Personal notes',
      free: false, trial: true, base: true, fitness: true,
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      name: language === 'it' ? 'Statistiche e progressione' : 'Statistics & progression',
      free: false, trial: true, base: true, fitness: true,
    },
    {
      name: language === 'it' ? 'Continuazione conversazione' : 'Conversation continuation',
      free: false, trial: true, base: true, fitness: true,
    },
    {
      name: language === 'it' ? 'Sintesi multi-consultazioni' : 'Multi-reading synthesis',
      free: false, trial: true, base: true, fitness: true,
    },
    {
      name: language === 'it' ? 'Percorsi guidati (Amore, Carriera, Spirituale)' : 'Guided paths',
      free: false, trial: true, base: true, fitness: true,
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      name: language === 'it' ? '★ Tema natale (assaggio nella prova)' : '★ Natal chart (preview in trial)',
      free: false, trial: true, base: false, fitness: true,
    },
    {
      name: language === 'it' ? 'Export PDF / DOCX' : 'PDF / DOCX export',
      free: false, trial: false, base: false, fitness: true,
    },
    {
      icon: <Bell className="w-5 h-5" />,
      name: language === 'it' ? '★ Consigli personalizzati giornalieri' : '★ Daily personalized advice',
      free: false, trial: true, base: false, fitness: true,
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      name: language === 'it'
        ? '★ Programma interattivo Sport, Cultura e Benessere'
        : '★ Interactive Sport, Culture & Wellness program',
      free: false, trial: false, base: false, fitness: true,
    },
  ];

  const PLANS = {
    free: {
      key: 'free',
      title: 'Free',
      priceMonthly: 0,
      priceYearly: 0,
      monthlyEquivalentYearly: 0,
      savings: null,
      ctaMonthly: null,
      ctaYearly: null,
      column: 'free',
      tagline: language === 'it' ? 'Per iniziare' : 'To get started',
    },
    // GETTONE PROVA — €1,99 una tantum, 3 consultazioni con (quasi) tutto sbloccato.
    trial: {
      key: 'trial_pack',
      title: language === 'it' ? 'Gettone Prova' : 'Trial Token',
      priceMonthly: 1.99,           // stesso prezzo in entrambe le viste (una tantum)
      priceYearly: 1.99,
      monthlyEquivalentYearly: null,
      savings: null,
      ctaMonthly: 'trial_pack',
      ctaYearly: 'trial_pack',
      column: 'trial',
      isOneShot: true,
      tagline: language === 'it' ? 'Prova subito · 3 consultazioni' : 'Try now · 3 consultations',
    },
    base: {
      key: 'base',
      title: language === 'it' ? 'Base' : 'Base',
      priceMonthly: 9.99,
      priceYearly: 107.89,
      monthlyEquivalentYearly: 8.99,
      savings: '10%',
      ctaMonthly: 'base_monthly',
      ctaYearly: 'base_yearly',
      column: 'base',
      tagline: language === 'it' ? 'I Ching illimitato' : 'Unlimited I Ching',
      highlight: true,
    },
    fitness: {
      key: 'fitness_coaching',
      title: language === 'it' ? 'Benessere Fisico' : 'Wellness',
      priceMonthly: 19.99,
      priceYearly: 191.90,
      monthlyEquivalentYearly: 15.99,
      savings: '20%',
      ctaMonthly: 'fitness_monthly',
      ctaYearly: 'fitness_yearly',
      column: 'fitness',
      tagline: language === 'it' ? 'Esperienza completa' : 'Complete experience',
    },
  };

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

  const isPremium = status?.plan === 'premium' || status?.plan === 'base' || status?.plan === 'fitness_coaching';
  const onTrial = status?.plan === 'trial_pack' && (status?.trial?.credits_remaining || 0) > 0;

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

        {/* Gettone Prova attivo */}
        {onTrial && (
          <div className="zen-card mb-6 bg-gradient-to-r from-[#8A9A5B]/12 to-[#C44D38]/8 border-2 border-[#8A9A5B]/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-8 h-8 text-[#8A9A5B]" />
                <div>
                  <h3 className="font-serif text-xl text-[#2C2C2C]">
                    {language === 'it' ? 'Gettone Prova attivo' : 'Trial Token active'}
                  </h3>
                  <p className="text-sm text-[#595959]">
                    {language === 'it'
                      ? `Hai ${status.trial.credits_remaining} consultazione/i prova residue (su ${(status.trial.credits_consumed || 0) + status.trial.credits_remaining}). Tutte le funzioni premium sono temporaneamente sbloccate.`
                      : `You have ${status.trial.credits_remaining} trial consultation(s) left (of ${(status.trial.credits_consumed || 0) + status.trial.credits_remaining}). Premium features are temporarily unlocked.`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#7a6f63]">{language === 'it' ? 'Residue' : 'Left'}</p>
                <p className="text-3xl font-bold text-[#8A9A5B]">{status.trial.credits_remaining}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan Status */}
        {isPremium && (
          <div className="zen-card mb-6 bg-gradient-to-r from-[#C44D38]/10 to-[#E67E22]/10 border-2 border-[#C44D38]">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <Crown className="w-8 h-8 text-[#C44D38]" />
                <div>
                  <h3 className="font-serif text-xl text-[#2C2C2C]">
                    {status?.is_admin
                      ? (language === 'it' ? 'Account Amministratore (illimitato)' : 'Administrator Account (lifetime)')
                      : (language === 'it' ? 'Piano Premium Attivo' : 'Premium Plan Active')}
                  </h3>
                  {status.subscription_end && !status.is_admin && (
                    <p className="text-sm text-[#595959]">
                      {status.cancellation_requested_at
                        ? (language === 'it' ? 'Disdetta — attivo fino al: ' : 'Cancelled — active until: ')
                        : (language === 'it' ? 'Scade il: ' : 'Expires: ')}
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

            {/* Manage subscription: cancel auto-renew + 14-day withdrawal */}
            {!status?.is_admin && (
              <div className="mt-5 pt-5 border-t border-[#C44D38]/20 flex flex-col sm:flex-row gap-2 sm:gap-3">
                {!status.cancellation_requested_at ? (
                  <button
                    onClick={async () => {
                      const ok = window.confirm(
                        language === 'it'
                          ? 'Vuoi davvero disdire l\'abbonamento? Manterrai l\'accesso Premium fino alla scadenza già pagata, poi tornerai al piano Free senza ulteriori addebiti.'
                          : 'Cancel your subscription? You keep Premium until the end of the paid period, then you go back to Free with no further charges.'
                      );
                      if (!ok) return;
                      try {
                        const r = await axios.post(
                          `${API}/subscription/cancel`,
                          {},
                          { headers: { Authorization: `Bearer ${getToken()}` } }
                        );
                        toast.success(r.data.message);
                        fetchSubscriptionStatus();
                      } catch (e) {
                        toast.error(e.response?.data?.detail || 'Errore durante la disdetta');
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded border border-[#D1CDC7] bg-white text-[#2C2C2C] hover:bg-[#F9F7F2] text-sm"
                  >
                    {language === 'it' ? 'Disdici abbonamento (senza rimborso)' : 'Cancel subscription (no refund)'}
                  </button>
                ) : (
                  <div className="flex-1 px-4 py-2 rounded border border-[#D1CDC7] bg-[#F9F7F2] text-[#595959] text-sm text-center">
                    {language === 'it'
                      ? '✓ Disdetta confermata — niente rinnovo automatico'
                      : '✓ Cancellation confirmed — no auto-renewal'}
                  </div>
                )}

                {status.within_withdrawal_window && (
                  <button
                    onClick={async () => {
                      const ok = window.confirm(
                        language === 'it'
                          ? 'Esercitare il diritto di recesso (entro 14 giorni dall\'acquisto)? L\'accesso Premium verrà revocato immediatamente e il rimborso sarà processato entro 14 giorni lavorativi.'
                          : 'Exercise the right of withdrawal (within 14 days of purchase)? Premium access will be revoked immediately and the refund processed within 14 business days.'
                      );
                      if (!ok) return;
                      try {
                        const r = await axios.post(
                          `${API}/subscription/withdraw`,
                          {},
                          { headers: { Authorization: `Bearer ${getToken()}` } }
                        );
                        toast.success(r.data.message);
                        fetchSubscriptionStatus();
                      } catch (e) {
                        toast.error(e.response?.data?.detail || 'Errore');
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded bg-[#C44D38] text-white hover:bg-[#A63D2B] text-sm font-medium"
                    title={language === 'it' ? 'Recesso entro 14 giorni con rimborso (art. 52 Codice Consumo)' : 'Right of withdrawal within 14 days with refund'}
                  >
                    {language === 'it' ? '⚖️ Esercita recesso (con rimborso, ≤14 giorni)' : '⚖️ Withdraw (refund, ≤14 days)'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Billing cycle toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-[#F9F7F2] border border-[#D1CDC7] rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                billingCycle === 'monthly' ? 'bg-[#C44D38] text-white shadow' : 'text-[#595959]'
              }`}
            >
              {language === 'it' ? 'Mensile' : 'Monthly'}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                billingCycle === 'yearly' ? 'bg-[#C44D38] text-white shadow' : 'text-[#595959]'
              }`}
            >
              {language === 'it' ? 'Annuale' : 'Yearly'}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-[#C44D38] text-white'
              }`}>
                −10/20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards — 4 tiers (free / trial / base / fitness) */}
        <div className="grid xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 gap-5 mb-8">
          {Object.values(PLANS).map((plan) => {
            const isFreePlan = plan.key === 'free';
            const isTrial = plan.column === 'trial';
            const userPlanKey = status?.plan || 'free';
            const isCurrent = userPlanKey === plan.key
              || (userPlanKey === 'premium' && plan.key === 'fitness_coaching');
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const monthlyEquiv = billingCycle === 'yearly' ? plan.monthlyEquivalentYearly : null;
            const cta = billingCycle === 'yearly' ? plan.ctaYearly : plan.ctaMonthly;
            const isDark = plan.column === 'fitness';
            const isHighlighted = plan.highlight;

            return (
              <div
                key={plan.key}
                className={`zen-card relative ${
                  isDark ? 'bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] text-white' : ''
                } ${
                  isCurrent || isHighlighted ? 'border-2 border-[#C44D38]' : 'border border-[#D1CDC7]'
                }`}
              >
                {isHighlighted && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#C44D38] text-white rounded-full text-xs uppercase tracking-wider shadow">
                    {language === 'it' ? 'Più Popolare' : 'Most Popular'}
                  </div>
                )}

                <div className="text-center mb-5 pt-2">
                  <h3 className={`font-serif text-2xl mb-1 ${isDark ? 'text-white' : 'text-[#2C2C2C]'}`}>
                    {plan.title}
                  </h3>
                  <p className={`text-xs mb-3 ${isDark ? 'text-white/60' : 'text-[#7a6f63]'}`}>
                    {plan.tagline}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-[#2C2C2C]'}`}>
                      €{isFreePlan ? '0' : price.toFixed(2).replace('.', ',')}
                    </span>
                    {!isFreePlan && !isTrial && (
                      <span className={`text-xs ${isDark ? 'text-white/60' : 'text-[#595959]'}`}>
                        /{billingCycle === 'yearly' ? (language === 'it' ? 'anno' : 'yr') : (language === 'it' ? 'mese' : 'mo')}
                      </span>
                    )}
                    {isTrial && (
                      <span className="text-xs text-[#7a6f63]">
                        {language === 'it' ? 'una tantum' : 'one-time'}
                      </span>
                    )}
                  </div>
                  {!isTrial && billingCycle === 'yearly' && monthlyEquiv !== null && monthlyEquiv > 0 && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-[#7a6f63]'}`}>
                      ≈ €{monthlyEquiv.toFixed(2).replace('.', ',')} /{language === 'it' ? 'mese' : 'mo'} ·{' '}
                      <span className="text-[#C44D38] font-medium">−{plan.savings}</span>
                    </p>
                  )}
                  {isTrial && (
                    <p className="text-xs mt-1 text-[#7a6f63]">
                      {language === 'it'
                        ? '3 consultazioni con (quasi) tutto sbloccato'
                        : '3 consultations with (almost) everything unlocked'}
                    </p>
                  )}
                  {isFreePlan && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-[#7a6f63]'}`}>
                      {language === 'it' ? 'per sempre' : 'forever'}
                    </p>
                  )}
                </div>

                <ul className="space-y-2 mb-6 text-sm">
                  {features.map((f, idx) => {
                    const val = f[plan.column];
                    return (
                      <li key={idx} className="flex items-start justify-between gap-2">
                        <span className={`flex-1 ${isDark ? 'text-white/80' : 'text-[#595959]'}`}>
                          {f.name}
                        </span>
                        {typeof val === 'boolean' ? (
                          val ? (
                            <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-[#C44D38]' : 'text-green-600'}`} />
                          ) : (
                            <X className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-white/30' : 'text-[#D1CDC7]'}`} />
                          )
                        ) : (
                          <span className={`font-medium text-xs ${isDark ? 'text-[#C44D38]' : 'text-[#2C2C2C]'}`}>
                            {val}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className={`w-full py-2.5 rounded-lg font-medium text-sm ${
                      isDark
                        ? 'bg-[#C44D38] text-white'
                        : 'border-2 border-[#C44D38] text-[#C44D38] bg-white'
                    }`}
                  >
                    {isTrial && status?.trial?.credits_remaining > 0
                      ? (language === 'it'
                          ? `✓ Prova attiva · ${status.trial.credits_remaining}/3 residue`
                          : `✓ Trial active · ${status.trial.credits_remaining}/3 left`)
                      : (language === 'it' ? '✓ Piano Attuale' : '✓ Current Plan')}
                  </button>
                ) : isFreePlan ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg font-medium text-sm border border-[#D1CDC7] text-[#7a6f63] bg-[#F9F7F2]"
                  >
                    {language === 'it' ? 'Piano Gratuito' : 'Free Plan'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(cta)}
                    disabled={processingPayment || !cta}
                    className={`w-full py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50 ${
                      isDark
                        ? 'bg-[#C44D38] text-white hover:bg-[#A33D2B]'
                        : 'bg-[#C44D38] text-white hover:bg-[#A33D2B]'
                    }`}
                  >
                    {processingPayment
                      ? (language === 'it' ? 'Elaborazione...' : 'Processing...')
                      : isTrial
                        ? (language === 'it' ? 'Provalo · €1,99' : 'Try it · €1.99')
                        : (language === 'it' ? `Sottoscrivi ${plan.title}` : `Subscribe to ${plan.title}`)}
                  </button>
                )}
              </div>
            );
          })}
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
