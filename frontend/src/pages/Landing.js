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
