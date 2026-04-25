import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Compass, BookOpen, Map, Star, BarChart3, Crown, 
  ChevronRight, ChevronDown, Play, Sparkles, Moon,
  Hand, MousePointer, ArrowRight, CheckCircle2,
  Coins, MessageCircle, History, Target, Award,
  Zap, Heart, Briefcase, TrendingUp
} from 'lucide-react';

const GuidaTutorial = () => {
  const { language } = useAuth();
  const [activeSection, setActiveSection] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set([0]));
  const sectionRefs = useRef([]);

  const t = {
    it: {
      title: "Guida Interattiva",
      subtitle: "Scopri come usare I Ching del Benessere",
      startJourney: "Inizia il tuo viaggio",
      sections: {
        intro: {
          title: "Benvenuto nell'I Ching del Benessere",
          description: "L'I Ching è un antico oracolo cinese che offre saggezza millenaria per guidarti nelle decisioni della vita. Questa guida ti mostrerà come utilizzare tutte le funzionalità del sito."
        },
        consultation: {
          title: "Come Fare una Consultazione",
          description: "Il cuore del sito: poni una domanda e ricevi la saggezza dell'I Ching",
          steps: [
            { icon: Target, title: "Scegli l'Argomento", desc: "Seleziona tra Amore, Lavoro, Fortuna, Soldi, Crescita Spirituale o Personale" },
            { icon: Sparkles, title: "Scegli il Tipo di Stesa", desc: "Stesa Diretta (breve) o Stesa Profonda (dettagliata, Premium)" },
            { icon: MessageCircle, title: "Formula la Domanda", desc: "Scrivi la tua domanda con chiarezza e intenzione" },
            { icon: Coins, title: "Lancia le Monete", desc: "Lancia 3 monete fisiche 6 volte e inserisci i risultati per creare l'esagramma" },
            { icon: BookOpen, title: "Ricevi l'Interpretazione", desc: "L'I Ching ti risponderà con saggezza personalizzata" }
          ]
        },
        library: {
          title: "La Biblioteca degli Esagrammi",
          description: "Esplora tutti i 64 esagrammi e gli 8 trigrammi dell'I Ching",
          features: [
            "64 esagrammi con descrizioni complete",
            "8 trigrammi fondamentali",
            "Significato delle linee mutevoli",
            "Ricerca per nome o numero"
          ]
        },
        paths: {
          title: "I Percorsi Guidati",
          description: "Viaggi tematici di 3-5 consultazioni su un argomento specifico",
          pathsList: [
            { icon: Heart, name: "Percorso dell'Amore", desc: "Esplora le relazioni affettive" },
            { icon: Briefcase, name: "Percorso della Carriera", desc: "Guida per decisioni lavorative" },
            { icon: Sparkles, name: "Percorso Spirituale", desc: "Crescita interiore e meditazione" },
            { icon: TrendingUp, name: "Nuovo Inizio", desc: "Per chi affronta cambiamenti" }
          ]
        },
        natalChart: {
          title: "Il Tema Natale",
          description: "Scopri la tua mappa astrale personalizzata basata su data, ora e luogo di nascita",
          features: [
            "Ruota zodiacale interattiva",
            "Posizioni planetarie dettagliate",
            "Case astrologiche",
            "Aspetti tra i pianeti"
          ]
        },
        statistics: {
          title: "Statistiche e Progressione",
          description: "Traccia il tuo percorso e guadagna badge",
          levels: [
            { name: "Cercatore", consultations: "0-4" },
            { name: "Studente", consultations: "5-14" },
            { name: "Praticante", consultations: "15-29" },
            { name: "Esperto", consultations: "30-49" },
            { name: "Saggio", consultations: "50-99" },
            { name: "Maestro", consultations: "100+" }
          ]
        },
        premium: {
          title: "Piano Premium",
          description: "Sblocca tutte le funzionalità avanzate",
          benefits: [
            "Consultazioni illimitate",
            "Stesa Profonda (interpretazioni dettagliate)",
            "Continuazione conversazione",
            "Stese di Sintesi",
            "Statistiche avanzate",
            "Consigli personalizzati"
          ]
        }
      },
      cta: "Pronto a iniziare?",
      ctaButton: "Fai la tua prima consultazione"
    },
    en: {
      title: "Interactive Guide",
      subtitle: "Discover how to use I Ching of Wellness",
      startJourney: "Start your journey",
      sections: {
        intro: {
          title: "Welcome to I Ching of Wellness",
          description: "The I Ching is an ancient Chinese oracle offering timeless wisdom to guide your life decisions. This guide will show you how to use all site features."
        },
        consultation: {
          title: "How to Make a Consultation",
          description: "The heart of the site: ask a question and receive I Ching wisdom",
          steps: [
            { icon: Target, title: "Choose Topic", desc: "Select from Love, Work, Fortune, Money, Spiritual or Personal Growth" },
            { icon: Sparkles, title: "Choose Reading Type", desc: "Direct Reading (brief) or Deep Reading (detailed, Premium)" },
            { icon: MessageCircle, title: "Ask Your Question", desc: "Write your question with clarity and intention" },
            { icon: Coins, title: "Toss the Coins", desc: "Toss 3 physical coins 6 times and enter the results to create the hexagram" },
            { icon: BookOpen, title: "Receive Interpretation", desc: "The I Ching will respond with personalized wisdom" }
          ]
        },
        library: {
          title: "The Hexagram Library",
          description: "Explore all 64 hexagrams and 8 trigrams of the I Ching",
          features: [
            "64 hexagrams with full descriptions",
            "8 fundamental trigrams",
            "Meaning of changing lines",
            "Search by name or number"
          ]
        },
        paths: {
          title: "Guided Paths",
          description: "Thematic journeys of 3-5 consultations on a specific topic",
          pathsList: [
            { icon: Heart, name: "Love Path", desc: "Explore romantic relationships" },
            { icon: Briefcase, name: "Career Path", desc: "Guide for work decisions" },
            { icon: Sparkles, name: "Spiritual Path", desc: "Inner growth and meditation" },
            { icon: TrendingUp, name: "New Beginning", desc: "For those facing changes" }
          ]
        },
        natalChart: {
          title: "Natal Chart",
          description: "Discover your personalized astrological map based on birth date, time and place",
          features: [
            "Interactive zodiac wheel",
            "Detailed planetary positions",
            "Astrological houses",
            "Planetary aspects"
          ]
        },
        statistics: {
          title: "Statistics & Progression",
          description: "Track your journey and earn badges",
          levels: [
            { name: "Seeker", consultations: "0-4" },
            { name: "Student", consultations: "5-14" },
            { name: "Practitioner", consultations: "15-29" },
            { name: "Expert", consultations: "30-49" },
            { name: "Sage", consultations: "50-99" },
            { name: "Master", consultations: "100+" }
          ]
        },
        premium: {
          title: "Premium Plan",
          description: "Unlock all advanced features",
          benefits: [
            "Unlimited consultations",
            "Deep Reading (detailed interpretations)",
            "Conversation continuation",
            "Synthesis readings",
            "Advanced statistics",
            "Personalized advice"
          ]
        }
      },
      cta: "Ready to start?",
      ctaButton: "Make your first consultation"
    }
  };

  const text = t[language] || t.it;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.dataset.index);
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, index]));
            setActiveSection(index);
          }
        });
      },
      { threshold: 0.3 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const AnimatedStep = ({ step, index, isVisible }) => (
    <div 
      className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-700 transform ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 -translate-x-10'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#C44D38] to-[#D4AC0D] flex items-center justify-center text-white shadow-lg">
        <step.icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-serif text-lg text-[#2C2C2C] mb-1">{step.title}</h4>
        <p className="text-[#595959] text-sm">{step.desc}</p>
      </div>
      {index < 4 && (
        <div className="absolute left-10 top-16 h-8 w-0.5 bg-gradient-to-b from-[#D4AC0D] to-transparent" />
      )}
    </div>
  );

  const CoinAnimation = () => (
    <div className="flex justify-center space-x-2 my-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AC0D] to-[#B8860B] shadow-lg animate-bounce"
          style={{ animationDelay: `${i * 200}ms`, animationDuration: '1s' }}
        >
          <div className="w-full h-full flex items-center justify-center text-[#2C2C2C] font-bold text-xs">
            ☯
          </div>
        </div>
      ))}
    </div>
  );

  const HexagramAnimation = () => (
    <div className="flex flex-col items-center space-y-1 my-6">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-2 bg-[#2C2C2C] rounded transition-all duration-500 ${
            i % 2 === 0 ? 'w-16' : 'w-16 flex space-x-2'
          }`}
          style={{ 
            animationDelay: `${i * 100}ms`,
            opacity: 0,
            animation: `fadeSlideIn 0.5s ease-out ${i * 100}ms forwards`
          }}
        >
          {i % 2 !== 0 && (
            <>
              <div className="w-6 h-2 bg-[#2C2C2C] rounded" />
              <div className="w-6 h-2 bg-[#2C2C2C] rounded" />
            </>
          )}
        </div>
      ))}
    </div>
  );

  const YinYangSpinner = () => (
    <div className="w-20 h-20 mx-auto my-6 animate-spin-slow">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke="#D4AC0D" strokeWidth="2"/>
        <path d="M50,2 A48,48 0 0,1 50,98 A24,24 0 0,1 50,50 A24,24 0 0,0 50,2" fill="#2C2C2C"/>
        <path d="M50,2 A48,48 0 0,0 50,98 A24,24 0 0,0 50,50 A24,24 0 0,1 50,2" fill="#F5F5F5"/>
        <circle cx="50" cy="26" r="6" fill="#F5F5F5"/>
        <circle cx="50" cy="74" r="6" fill="#2C2C2C"/>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2C2C2C] via-[#3D3D3D] to-[#2C2C2C]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl text-[#D4AC0D] animate-pulse">☰</div>
          <div className="absolute top-20 right-20 text-6xl text-[#D4AC0D] animate-pulse" style={{animationDelay: '0.5s'}}>☷</div>
          <div className="absolute bottom-20 left-1/4 text-6xl text-[#D4AC0D] animate-pulse" style={{animationDelay: '1s'}}>☲</div>
          <div className="absolute bottom-10 right-1/4 text-6xl text-[#D4AC0D] animate-pulse" style={{animationDelay: '1.5s'}}>☵</div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-6">
          <YinYangSpinner />
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
            {text.title}
          </h1>
          <p className="text-xl text-[#E8D5B7] mb-8">
            {text.subtitle}
          </p>
          <div className="flex justify-center">
            <a 
              href="#section-1"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#C44D38] to-[#D4AC0D] text-white rounded-full hover:shadow-lg transition-all transform hover:scale-105"
            >
              <Play className="w-5 h-5" />
              <span>{text.startJourney}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Progress Indicator */}
      <div className="sticky top-16 z-40 bg-[#F9F7F2]/95 backdrop-blur border-b border-[#D1CDC7] py-3 hidden md:block">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center">
            {['Intro', 'Consultazione', 'Biblioteca', 'Percorsi', 'Tema Natale', 'Statistiche', 'Premium'].map((label, i) => (
              <button
                key={i}
                onClick={() => {
                  sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center space-x-1 text-sm transition-all ${
                  activeSection === i 
                    ? 'text-[#C44D38] font-medium' 
                    : 'text-[#595959] hover:text-[#2C2C2C]'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  visibleSections.has(i)
                    ? 'bg-[#C44D38] text-white'
                    : 'bg-[#D1CDC7] text-[#595959]'
                }`}>
                  {visibleSections.has(i) ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </span>
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 0: Intro */}
      <section 
        id="section-0"
        ref={el => sectionRefs.current[0] = el}
        data-index="0"
        className="py-20 px-6"
      >
        <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
          visibleSections.has(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#D4AC0D] to-[#C44D38] flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-serif text-[#2C2C2C] mb-4">
            {text.sections.intro.title}
          </h2>
          <p className="text-lg text-[#595959] leading-relaxed max-w-2xl mx-auto">
            {text.sections.intro.description}
          </p>
        </div>
      </section>

      {/* Section 1: Consultation */}
      <section 
        id="section-1"
        ref={el => sectionRefs.current[1] = el}
        data-index="1"
        className="py-20 px-6 bg-white"
      >
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${
            visibleSections.has(1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C44D38]/10 mb-4">
              <Compass className="w-8 h-8 text-[#C44D38]" />
            </div>
            <h2 className="text-3xl font-serif text-[#2C2C2C] mb-2">
              {text.sections.consultation.title}
            </h2>
            <p className="text-[#595959]">{text.sections.consultation.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-2 relative">
              {text.sections.consultation.steps.map((step, i) => (
                <AnimatedStep 
                  key={i} 
                  step={step} 
                  index={i} 
                  isVisible={visibleSections.has(1)} 
                />
              ))}
            </div>
            
            <div className={`bg-[#F9F7F2] rounded-2xl p-8 transition-all duration-1000 delay-500 ${
              visibleSections.has(1) ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <h3 className="text-center font-serif text-xl text-[#2C2C2C] mb-4">
                {language === 'it' ? 'Animazione Monete' : 'Coin Animation'}
              </h3>
              <CoinAnimation />
              <div className="text-center mt-4">
                <ArrowRight className="w-6 h-6 mx-auto text-[#D4AC0D] animate-pulse" />
              </div>
              <h3 className="text-center font-serif text-xl text-[#2C2C2C] mb-4 mt-4">
                {language === 'it' ? 'Esagramma Risultante' : 'Resulting Hexagram'}
              </h3>
              <div className="flex flex-col items-center space-y-1">
                {[true, false, true, true, false, true].map((isYang, i) => (
                  <div 
                    key={i}
                    className={`h-3 rounded transition-all duration-500 ${
                      visibleSections.has(1) ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ transitionDelay: `${800 + i * 100}ms` }}
                  >
                    {isYang ? (
                      <div className="w-20 h-3 bg-[#2C2C2C] rounded" />
                    ) : (
                      <div className="flex space-x-2">
                        <div className="w-8 h-3 bg-[#2C2C2C] rounded" />
                        <div className="w-8 h-3 bg-[#2C2C2C] rounded" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`text-center mt-8 transition-all duration-1000 delay-700 ${
            visibleSections.has(1) ? 'opacity-100' : 'opacity-0'
          }`}>
            <Link 
              to="/consult"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#C44D38] text-white rounded-lg hover:bg-[#A43D2B] transition-colors"
            >
              <Compass className="w-5 h-5" />
              <span>{language === 'it' ? 'Prova Ora' : 'Try Now'}</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Library */}
      <section 
        id="section-2"
        ref={el => sectionRefs.current[2] = el}
        data-index="2"
        className="py-20 px-6"
      >
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${
            visibleSections.has(2) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AC0D]/10 mb-4">
              <BookOpen className="w-8 h-8 text-[#D4AC0D]" />
            </div>
            <h2 className="text-3xl font-serif text-[#2C2C2C] mb-2">
              {text.sections.library.title}
            </h2>
            <p className="text-[#595959]">{text.sections.library.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Animated Hexagram Grid */}
            <div className={`bg-white rounded-2xl p-6 shadow-lg transition-all duration-1000 ${
              visibleSections.has(2) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}>
              <div className="grid grid-cols-8 gap-2">
                {[...Array(64)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 rounded bg-gradient-to-br from-[#F9F7F2] to-[#E8D5B7] flex items-center justify-center text-xs font-medium text-[#2C2C2C] hover:from-[#C44D38] hover:to-[#D4AC0D] hover:text-white transition-all cursor-pointer transform hover:scale-110"
                    style={{ 
                      animationDelay: `${i * 20}ms`,
                      opacity: visibleSections.has(2) ? 1 : 0,
                      transition: `opacity 0.3s ease ${i * 20}ms`
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className={`space-y-4 transition-all duration-1000 delay-300 ${
              visibleSections.has(2) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
              {text.sections.library.features.map((feature, i) => (
                <div 
                  key={i}
                  className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm"
                  style={{ transitionDelay: `${300 + i * 100}ms` }}
                >
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-[#2C2C2C]">{feature}</span>
                </div>
              ))}
              
              <Link 
                to="/library"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#D4AC0D] text-white rounded-lg hover:bg-[#B8960B] transition-colors mt-4"
              >
                <BookOpen className="w-5 h-5" />
                <span>{language === 'it' ? 'Esplora la Biblioteca' : 'Explore Library'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Paths */}
      <section 
        id="section-3"
        ref={el => sectionRefs.current[3] = el}
        data-index="3"
        className="py-20 px-6 bg-white"
      >
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${
            visibleSections.has(3) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
              <Map className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-3xl font-serif text-[#2C2C2C] mb-2">
              {text.sections.paths.title}
            </h2>
            <p className="text-[#595959]">{text.sections.paths.description}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {text.sections.paths.pathsList.map((path, i) => (
              <div 
                key={i}
                className={`bg-gradient-to-br from-[#F9F7F2] to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${
                  visibleSections.has(3) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C44D38] to-[#D4AC0D] flex items-center justify-center mb-4">
                  <path.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-serif text-lg text-[#2C2C2C] mb-2">{path.name}</h3>
                <p className="text-sm text-[#595959]">{path.desc}</p>
              </div>
            ))}
          </div>

          <div className={`text-center mt-8 transition-all duration-1000 delay-500 ${
            visibleSections.has(3) ? 'opacity-100' : 'opacity-0'
          }`}>
            <Link 
              to="/paths"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Map className="w-5 h-5" />
              <span>{language === 'it' ? 'Scopri i Percorsi' : 'Discover Paths'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4: Natal Chart */}
      <section 
        id="section-4"
        ref={el => sectionRefs.current[4] = el}
        data-index="4"
        className="py-20 px-6"
      >
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${
            visibleSections.has(4) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
              <Moon className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-serif text-[#2C2C2C] mb-2">
              {text.sections.natalChart.title}
            </h2>
            <p className="text-[#595959]">{text.sections.natalChart.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Animated Zodiac Wheel */}
            <div className={`relative transition-all duration-1000 ${
              visibleSections.has(4) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}>
              <div className="w-64 h-64 mx-auto relative">
                <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-slow" style={{animationDuration: '30s'}}>
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#D4AC0D" strokeWidth="2"/>
                  <circle cx="100" cy="100" r="70" fill="none" stroke="#E8D5B7" strokeWidth="1"/>
                  <circle cx="100" cy="100" r="50" fill="none" stroke="#E8D5B7" strokeWidth="1"/>
                  {[...Array(12)].map((_, i) => (
                    <g key={i} transform={`rotate(${i * 30} 100 100)`}>
                      <line x1="100" y1="10" x2="100" y2="30" stroke="#D4AC0D" strokeWidth="1"/>
                      <text x="100" y="25" textAnchor="middle" fontSize="8" fill="#595959">
                        {['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'][i]}
                      </text>
                    </g>
                  ))}
                </svg>
                {/* Planets */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400 absolute animate-pulse" style={{top: '-30px', left: '10px'}} title="☉" />
                  <div className="w-3 h-3 rounded-full bg-gray-300 absolute animate-pulse" style={{top: '20px', left: '-25px', animationDelay: '0.5s'}} title="☽" />
                  <div className="w-3 h-3 rounded-full bg-red-400 absolute animate-pulse" style={{top: '15px', left: '30px', animationDelay: '1s'}} title="♂" />
                </div>
              </div>
            </div>

            <div className={`space-y-4 transition-all duration-1000 delay-300 ${
              visibleSections.has(4) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
              {text.sections.natalChart.features.map((feature, i) => (
                <div 
                  key={i}
                  className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm"
                >
                  <Star className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                  <span className="text-[#2C2C2C]">{feature}</span>
                </div>
              ))}
              
              <Link 
                to="/natal-chart"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mt-4"
              >
                <Moon className="w-5 h-5" />
                <span>{language === 'it' ? 'Genera il Tuo Tema' : 'Generate Your Chart'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Statistics */}
      <section 
        id="section-5"
        ref={el => sectionRefs.current[5] = el}
        data-index="5"
        className="py-20 px-6 bg-white"
      >
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${
            visibleSections.has(5) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-serif text-[#2C2C2C] mb-2">
              {text.sections.statistics.title}
            </h2>
            <p className="text-[#595959]">{text.sections.statistics.description}</p>
          </div>

          {/* Level Progression */}
          <div className={`bg-[#F9F7F2] rounded-2xl p-8 transition-all duration-1000 ${
            visibleSections.has(5) ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex flex-wrap justify-center gap-4">
              {text.sections.statistics.levels.map((level, i) => (
                <div 
                  key={i}
                  className={`text-center p-4 rounded-xl bg-white shadow-sm transition-all duration-500 transform hover:scale-105 ${
                    visibleSections.has(5) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#C44D38] to-[#D4AC0D] flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-serif text-[#2C2C2C]">{level.name}</h4>
                  <p className="text-xs text-[#595959]">{level.consultations} {language === 'it' ? 'cons.' : 'cons.'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`text-center mt-8 transition-all duration-1000 delay-500 ${
            visibleSections.has(5) ? 'opacity-100' : 'opacity-0'
          }`}>
            <Link 
              to="/statistics"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>{language === 'it' ? 'Vedi le Tue Statistiche' : 'View Your Statistics'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 6: Premium */}
      <section 
        id="section-6"
        ref={el => sectionRefs.current[6] = el}
        data-index="6"
        className="py-20 px-6 bg-gradient-to-br from-[#2C2C2C] via-[#3D3D3D] to-[#2C2C2C]"
      >
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-1000 ${
            visibleSections.has(6) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AC0D] to-[#F7DC6F] mb-4">
              <Crown className="w-8 h-8 text-[#2C2C2C]" />
            </div>
            <h2 className="text-3xl font-serif text-white mb-2">
              {text.sections.premium.title}
            </h2>
            <p className="text-[#E8D5B7]">{text.sections.premium.description}</p>
          </div>

          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-1000 ${
            visibleSections.has(6) ? 'opacity-100' : 'opacity-0'
          }`}>
            {text.sections.premium.benefits.map((benefit, i) => (
              <div 
                key={i}
                className={`flex items-center space-x-3 p-4 bg-white/10 backdrop-blur rounded-xl transition-all duration-500 ${
                  visibleSections.has(6) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <Zap className="w-5 h-5 text-[#D4AC0D] flex-shrink-0" />
                <span className="text-white">{benefit}</span>
              </div>
            ))}
          </div>

          <div className={`text-center mt-12 transition-all duration-1000 delay-500 ${
            visibleSections.has(6) ? 'opacity-100' : 'opacity-0'
          }`}>
            <Link 
              to="/pricing"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-[#D4AC0D] to-[#F7DC6F] text-[#2C2C2C] rounded-full font-medium hover:shadow-lg hover:shadow-[#D4AC0D]/30 transition-all transform hover:scale-105"
            >
              <Crown className="w-5 h-5" />
              <span>{language === 'it' ? 'Scopri Premium' : 'Discover Premium'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-[#F9F7F2]">
        <div className="max-w-3xl mx-auto text-center">
          <YinYangSpinner />
          <h2 className="text-3xl font-serif text-[#2C2C2C] mb-4">
            {text.cta}
          </h2>
          <Link 
            to="/consult"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-[#C44D38] text-white rounded-full font-medium hover:bg-[#A43D2B] transition-all transform hover:scale-105 shadow-lg"
          >
            <Compass className="w-6 h-6" />
            <span className="text-lg">{text.ctaButton}</span>
            <ChevronRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default GuidaTutorial;
