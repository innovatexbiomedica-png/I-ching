import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import { 
  Coins, 
  BookOpen, 
  History, 
  ArrowRight, 
  Circle,
  Calendar,
  Target,
  Heart,
  Sparkles,
  TrendingUp,
  Leaf,
  Brain,
  DollarSign,
  Watch,
  Bell,
  Video,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Compass,
  Sun,
  Moon,
  Mountain,
  Waves,
  Wind,
  Flame,
  CloudRain,
  Layers
} from 'lucide-react';

const Landing = () => {
  const { language, isAuthenticated } = useAuth();
  const t = useTranslation(language);
  const [expandedWellness, setExpandedWellness] = useState(null);
  const [expandedFeature, setExpandedFeature] = useState(null);

  // I Trigrammi con i loro significati
  const trigrams = [
    { name: '☰ Cielo', color: 'from-yellow-400 to-amber-500', icon: <Sun className="w-6 h-6" />, meaning: language === 'it' ? 'Creatività, Forza, Leadership' : 'Creativity, Strength, Leadership' },
    { name: '☷ Terra', color: 'from-amber-700 to-yellow-900', icon: <Mountain className="w-6 h-6" />, meaning: language === 'it' ? 'Ricettività, Nutrimento, Stabilità' : 'Receptivity, Nurturing, Stability' },
    { name: '☳ Tuono', color: 'from-purple-500 to-indigo-600', icon: <Sparkles className="w-6 h-6" />, meaning: language === 'it' ? 'Movimento, Iniziativa, Risveglio' : 'Movement, Initiative, Awakening' },
    { name: '☵ Acqua', color: 'from-blue-500 to-cyan-600', icon: <Waves className="w-6 h-6" />, meaning: language === 'it' ? 'Profondità, Pericolo, Saggezza' : 'Depth, Danger, Wisdom' },
    { name: '☶ Monte', color: 'from-stone-500 to-slate-700', icon: <Mountain className="w-6 h-6" />, meaning: language === 'it' ? 'Quiete, Meditazione, Fermezza' : 'Stillness, Meditation, Steadiness' },
    { name: '☴ Vento', color: 'from-emerald-400 to-teal-500', icon: <Wind className="w-6 h-6" />, meaning: language === 'it' ? 'Penetrazione, Gentilezza, Adattamento' : 'Penetration, Gentleness, Adaptation' },
    { name: '☲ Fuoco', color: 'from-orange-500 to-red-600', icon: <Flame className="w-6 h-6" />, meaning: language === 'it' ? 'Chiarezza, Intelligenza, Bellezza' : 'Clarity, Intelligence, Beauty' },
    { name: '☱ Lago', color: 'from-sky-400 to-blue-500', icon: <CloudRain className="w-6 h-6" />, meaning: language === 'it' ? 'Gioia, Comunicazione, Piacere' : 'Joy, Communication, Pleasure' },
  ];

  // Aree di benessere
  const wellnessAreas = [
    {
      id: 'economic',
      icon: <DollarSign className="w-8 h-8" />,
      title: language === 'it' ? 'Benessere Economico' : 'Economic Wellness',
      color: 'from-emerald-500 to-green-600',
      description: language === 'it' 
        ? 'Strategie per la prosperità finanziaria basate sulla saggezza dell\'I Ching'
        : 'Financial prosperity strategies based on I Ching wisdom',
      details: language === 'it'
        ? 'Ricevi consigli personalizzati su investimenti, risparmio e gestione delle risorse. L\'I Ching ti guida verso decisioni finanziarie equilibrate, aiutandoti a riconoscere i momenti propizi per agire e quelli per attendere.'
        : 'Receive personalized advice on investments, savings and resource management. The I Ching guides you toward balanced financial decisions.'
    },
    {
      id: 'moral',
      icon: <Heart className="w-8 h-8" />,
      title: language === 'it' ? 'Benessere Morale' : 'Moral Wellness',
      color: 'from-rose-500 to-pink-600',
      description: language === 'it'
        ? 'Equilibrio etico e relazionale per una vita in armonia'
        : 'Ethical and relational balance for a harmonious life',
      details: language === 'it'
        ? 'Coltiva relazioni sane, sviluppa la tua integrità personale e trova equilibrio tra i tuoi valori e le azioni quotidiane. Il percorso ti aiuta a navigare dilemmi etici con chiarezza.'
        : 'Cultivate healthy relationships, develop personal integrity and find balance between your values and daily actions.'
    },
    {
      id: 'nutrition',
      icon: <Leaf className="w-8 h-8" />,
      title: language === 'it' ? 'Benessere Alimentare' : 'Nutritional Wellness',
      color: 'from-lime-500 to-green-500',
      description: language === 'it'
        ? 'Alimentazione consapevole secondo i principi Yin-Yang'
        : 'Mindful nutrition according to Yin-Yang principles',
      details: language === 'it'
        ? 'Scopri come bilanciare la tua alimentazione secondo i principi energetici cinesi. Ricevi suggerimenti stagionali su cibi che armonizzano il tuo Qi e supportano il tuo benessere fisico.'
        : 'Learn how to balance your diet according to Chinese energetic principles. Receive seasonal suggestions on foods that harmonize your Qi.'
    },
    {
      id: 'spiritual',
      icon: <Sparkles className="w-8 h-8" />,
      title: language === 'it' ? 'Benessere Spirituale' : 'Spiritual Wellness',
      color: 'from-purple-500 to-indigo-600',
      description: language === 'it'
        ? 'Crescita interiore e connessione con il Tao'
        : 'Inner growth and connection with the Tao',
      details: language === 'it'
        ? 'Meditazioni guidate, pratiche di mindfulness e esercizi di connessione con il flusso universale. Impara a vivere in armonia con i cicli naturali e a coltivare la pace interiore.'
        : 'Guided meditations, mindfulness practices and exercises for connecting with universal flow. Learn to live in harmony with natural cycles.'
    },
    {
      id: 'mental',
      icon: <Brain className="w-8 h-8" />,
      title: language === 'it' ? 'Benessere Mentale' : 'Mental Wellness',
      color: 'from-cyan-500 to-blue-600',
      description: language === 'it'
        ? 'Chiarezza mentale e gestione dello stress'
        : 'Mental clarity and stress management',
      details: language === 'it'
        ? 'Tecniche per calmare la mente, migliorare la concentrazione e gestire l\'ansia. L\'I Ching offre prospettive uniche per affrontare le sfide mentali quotidiane.'
        : 'Techniques to calm the mind, improve focus and manage anxiety. The I Ching offers unique perspectives for facing daily mental challenges.'
    },
    {
      id: 'goals',
      icon: <Target className="w-8 h-8" />,
      title: language === 'it' ? 'Raggiungimento Obiettivi' : 'Goal Achievement',
      color: 'from-amber-500 to-orange-600',
      description: language === 'it'
        ? 'Piano strategico per realizzare i tuoi sogni'
        : 'Strategic plan to achieve your dreams',
      details: language === 'it'
        ? 'Definisci obiettivi chiari, crea piani d\'azione personalizzati e ricevi guidance settimanale per mantenerti sulla strada giusta. L\'I Ching ti aiuta a capire quando spingere e quando pazientare.'
        : 'Define clear goals, create personalized action plans and receive weekly guidance to stay on track.'
    },
  ];

  // Funzionalità future
  const futureFeatures = [
    {
      id: 'audio-video',
      icon: <Video className="w-8 h-8" />,
      title: language === 'it' ? 'Consultazioni Audio/Video' : 'Audio/Video Consultations',
      color: 'from-violet-500 to-purple-600',
      description: language === 'it'
        ? 'Messaggi popup con interpretazioni vocali e video animate'
        : 'Popup messages with voice interpretations and animated videos',
      status: language === 'it' ? 'Prossimamente' : 'Coming Soon'
    },
    {
      id: 'smartwatch',
      icon: <Watch className="w-8 h-8" />,
      title: language === 'it' ? 'Integrazione Smartwatch' : 'Smartwatch Integration',
      color: 'from-teal-500 to-cyan-600',
      description: language === 'it'
        ? 'Connessione con Apple Watch, Fitbit e altri per monitorare la tua salute e ricevere consigli personalizzati'
        : 'Connect with Apple Watch, Fitbit and others to monitor your health and receive personalized advice',
      status: language === 'it' ? 'In sviluppo' : 'In Development'
    },
    {
      id: 'notifications',
      icon: <Bell className="w-8 h-8" />,
      title: language === 'it' ? 'Notifiche Intelligenti' : 'Smart Notifications',
      color: 'from-pink-500 to-rose-600',
      description: language === 'it'
        ? 'Promemoria personalizzati basati sui tuoi ritmi e obiettivi, sincronizzati con i cicli lunari e le energie del giorno'
        : 'Personalized reminders based on your rhythms and goals, synced with lunar cycles and daily energies',
      status: language === 'it' ? 'Prossimamente' : 'Coming Soon'
    },
    {
      id: 'ai-coach',
      icon: <MessageCircle className="w-8 h-8" />,
      title: language === 'it' ? 'Coach AI Personale' : 'Personal AI Coach',
      color: 'from-indigo-500 to-blue-600',
      description: language === 'it'
        ? 'Un assistente AI che ti conosce, ti segue nel tempo e ti guida nel tuo percorso di crescita'
        : 'An AI assistant that knows you, follows you over time and guides you on your growth path',
      status: language === 'it' ? 'Beta' : 'Beta'
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center" data-testid="hero-section">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1628313348688-3d279e8538ed?crop=entropy&cs=srgb&fm=jpg&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        
        <div className="container-zen relative z-10 py-20">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-3 mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-px bg-[#C44D38]" />
              <span className="text-sm tracking-[0.2em] text-[#595959] uppercase">
                {language === 'it' ? 'Antica Saggezza Cinese' : 'Ancient Chinese Wisdom'}
              </span>
            </div>
            
            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-serif text-[#2C2C2C] leading-tight mb-6 animate-fade-in-up opacity-0"
              style={{ animationDelay: '0.2s' }}
              data-testid="hero-title"
            >
              {t.landing.title}
            </h1>
            
            <p 
              className="text-xl md:text-2xl font-serif italic text-[#595959] mb-4 animate-fade-in-up opacity-0"
              style={{ animationDelay: '0.3s' }}
            >
              {t.landing.subtitle}
            </p>
            
            <p 
              className="text-base md:text-lg text-[#595959] mb-12 max-w-xl animate-fade-in-up opacity-0"
              style={{ animationDelay: '0.4s' }}
            >
              {t.landing.description}
            </p>
            
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s' }}>
              <Link
                to={isAuthenticated ? '/consult' : '/register'}
                className="btn-primary inline-flex items-center space-x-3 group"
                data-testid="hero-cta"
              >
                <span>{t.landing.cta}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-zen bg-[#E5E0D8]/30" data-testid="features-section">
        <div className="container-zen">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-4">
              {t.landing.features.title}
            </h2>
            <div className="w-16 h-px bg-[#C44D38] mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="zen-card text-center group" data-testid="feature-divination">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[#D1CDC7] rounded-full group-hover:border-[#C44D38] transition-colors">
                <Coins className="w-7 h-7 text-[#C44D38]" />
              </div>
              <h3 className="text-xl font-serif text-[#2C2C2C] mb-3">
                {t.landing.features.divination.title}
              </h3>
              <p className="text-[#595959]">
                {t.landing.features.divination.description}
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="zen-card text-center group" data-testid="feature-interpretation">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[#D1CDC7] rounded-full group-hover:border-[#C44D38] transition-colors">
                <BookOpen className="w-7 h-7 text-[#C44D38]" />
              </div>
              <h3 className="text-xl font-serif text-[#2C2C2C] mb-3">
                {t.landing.features.interpretation.title}
              </h3>
              <p className="text-[#595959]">
                {t.landing.features.interpretation.description}
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="zen-card text-center group" data-testid="feature-history">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[#D1CDC7] rounded-full group-hover:border-[#C44D38] transition-colors">
                <History className="w-7 h-7 text-[#C44D38]" />
              </div>
              <h3 className="text-xl font-serif text-[#2C2C2C] mb-3">
                {t.landing.features.history.title}
              </h3>
              <p className="text-[#595959]">
                {t.landing.features.history.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-zen" data-testid="how-it-works-section">
        <div className="container-zen">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-4">
              {t.landing.howItWorks.title}
            </h2>
            <div className="w-16 h-px bg-[#C44D38] mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {/* Step 1 */}
            <div className="relative text-center" data-testid="step-1">
              <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center bg-[#C44D38] text-[#F9F7F2] font-serif text-xl rounded-full">
                1
              </div>
              <h3 className="text-xl font-serif text-[#2C2C2C] mb-3">
                {t.landing.howItWorks.step1.title}
              </h3>
              <p className="text-[#595959]">
                {t.landing.howItWorks.step1.description}
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px bg-[#D1CDC7]" />
            </div>
            
            {/* Step 2 */}
            <div className="relative text-center" data-testid="step-2">
              <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center bg-[#C44D38] text-[#F9F7F2] font-serif text-xl rounded-full">
                2
              </div>
              <h3 className="text-xl font-serif text-[#2C2C2C] mb-3">
                {t.landing.howItWorks.step2.title}
              </h3>
              <p className="text-[#595959]">
                {t.landing.howItWorks.step2.description}
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px bg-[#D1CDC7]" />
            </div>
            
            {/* Step 3 */}
            <div className="text-center" data-testid="step-3">
              <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center bg-[#C44D38] text-[#F9F7F2] font-serif text-xl rounded-full">
                3
              </div>
              <h3 className="text-xl font-serif text-[#2C2C2C] mb-3">
                {t.landing.howItWorks.step3.title}
              </h3>
              <p className="text-[#595959]">
                {t.landing.howItWorks.step3.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hexagram Display Section */}
      <section className="section-zen bg-[#2C2C2C]" data-testid="hexagram-display-section">
        <div className="container-zen">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#C44D38] text-sm tracking-[0.2em] uppercase mb-4 block">
                {language === 'it' ? 'I 64 Esagrammi' : 'The 64 Hexagrams'}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-[#F9F7F2] mb-6">
                {language === 'it' 
                  ? 'Ogni momento ha la sua configurazione unica'
                  : 'Every moment has its unique configuration'}
              </h2>
              <p className="text-[#E5E0D8] mb-8">
                {language === 'it'
                  ? 'L\'I Ching è composto da 64 esagrammi, ognuno formato da sei linee che possono essere intere (Yang) o spezzate (Yin). Le linee mutevoli indicano il cambiamento in atto, rivelando il percorso dall\'attuale al potenziale.'
                  : 'The I Ching consists of 64 hexagrams, each formed by six lines that can be solid (Yang) or broken (Yin). Moving lines indicate change in progress, revealing the path from current to potential.'}
              </p>
              <Link
                to={isAuthenticated ? '/consult' : '/register'}
                className="btn-secondary border-[#F9F7F2] text-[#F9F7F2] hover:bg-[#F9F7F2] hover:text-[#2C2C2C] inline-flex items-center space-x-2"
                data-testid="hexagram-cta"
              >
                <span>{t.landing.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Hexagram Visual */}
            <div className="flex justify-center">
              <div className="p-12 border border-[#595959] rounded">
                <div className="space-y-3">
                  {/* Example Hexagram lines */}
                  <div className="w-32 h-2 bg-[#F9F7F2]" /> {/* Yang */}
                  <div className="flex justify-between w-32">
                    <div className="w-12 h-2 bg-[#F9F7F2]" />
                    <div className="w-12 h-2 bg-[#F9F7F2]" />
                  </div> {/* Yin */}
                  <div className="w-32 h-2 bg-[#F9F7F2]" /> {/* Yang */}
                  <div className="w-32 h-2 bg-[#C44D38] relative">
                    <Circle className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C44D38]" />
                  </div> {/* Yang mutevole */}
                  <div className="flex justify-between w-32">
                    <div className="w-12 h-2 bg-[#F9F7F2]" />
                    <div className="w-12 h-2 bg-[#F9F7F2]" />
                  </div> {/* Yin */}
                  <div className="w-32 h-2 bg-[#F9F7F2]" /> {/* Yang */}
                </div>
                <p className="text-center mt-6 font-serif text-[#F9F7F2] text-lg">
                  乾 Qián
                </p>
                <p className="text-center text-[#E5E0D8] text-sm">
                  {language === 'it' ? 'Il Creativo' : 'The Creative'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-zen" data-testid="cta-section">
        <div className="container-zen text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-6">
            {language === 'it' 
              ? 'Inizia il tuo percorso di scoperta'
              : 'Begin your journey of discovery'}
          </h2>
          <p className="text-lg text-[#595959] mb-10 max-w-2xl mx-auto">
            {language === 'it'
              ? 'Lascia che l\'antica saggezza dell\'I Ching illumini il tuo cammino. Ogni consultazione è un dialogo con il profondo.'
              : 'Let the ancient wisdom of the I Ching illuminate your path. Every consultation is a dialogue with the profound.'}
          </p>
          <Link
            to={isAuthenticated ? '/consult' : '/register'}
            className="btn-primary inline-flex items-center space-x-3 text-lg px-10 py-4"
            data-testid="final-cta"
          >
            <span>{t.landing.cta}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
