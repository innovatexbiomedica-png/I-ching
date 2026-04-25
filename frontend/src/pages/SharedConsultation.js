import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../lib/translations';
import axios from 'axios';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { Calendar, Loader2, Circle, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';

const API = `${(process.env.REACT_APP_BACKEND_URL || "https://iching-backend-ac3n.onrender.com")}/api`;

const SharedConsultation = () => {
  const { shareToken } = useParams();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Detect browser language
  const browserLang = navigator.language.startsWith('it') ? 'it' : 'en';
  const t = useTranslation(browserLang);

  useEffect(() => {
    fetchConsultation();
  }, [shareToken]);

  const fetchConsultation = async () => {
    try {
      const response = await axios.get(`${API}/shared/${shareToken}`);
      setConsultation(response.data);
    } catch (err) {
      setError(browserLang === 'it' 
        ? 'Consultazione non trovata o link non valido'
        : 'Consultation not found or invalid link');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, 'dd MMMM yyyy', { 
      locale: browserLang === 'it' ? it : enUS 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C44D38]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center px-4">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-[#D1CDC7]" />
          <h1 className="text-2xl font-serif text-[#2C2C2C] mb-4">{error}</h1>
          <Link to="/">
            <Button className="btn-primary">
              {browserLang === 'it' ? 'Vai alla Home' : 'Go to Home'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      {/* Simple Header */}
      <nav className="backdrop-blur-md bg-[#F9F7F2]/80 border-b border-[#D1CDC7]/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="font-serif text-xl md:text-2xl text-[#2C2C2C] tracking-tight">
              I Ching <span className="text-[#C44D38]">del Benessere</span>
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              {browserLang === 'it' ? 'Registrati' : 'Sign Up'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 animate-fade-in-up">
            <p className="text-sm text-[#C44D38] tracking-[0.2em] uppercase mb-4">
              {browserLang === 'it' ? 'Consultazione Condivisa' : 'Shared Consultation'}
            </p>
            <h1 className="text-3xl md:text-4xl font-serif text-[#2C2C2C]">
              {t.consultation.result.title}
            </h1>
            <div className="w-16 h-px bg-[#C44D38] mx-auto mt-6" />
          </div>

          {/* Date */}
          <div className="flex items-center justify-center space-x-2 text-[#595959] mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Calendar className="w-4 h-4" />
            <span>{formatDate(consultation.created_at)}</span>
          </div>

          {/* Question */}
          <div className="zen-card mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm text-[#595959] mb-2">
              {browserLang === 'it' ? 'La domanda' : 'The question'}
            </p>
            <p className="font-serif text-xl text-[#2C2C2C] italic">
              "{consultation.question}"
            </p>
          </div>

          {/* Hexagram */}
          <div className="zen-card mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-center">
              <p className="text-sm text-[#595959] mb-2">{t.consultation.result.hexagram}</p>
              <h2 className="text-3xl font-serif text-[#2C2C2C] mb-2">
                {consultation.hexagram_number}. {consultation.hexagram_name}
              </h2>
            </div>

            {/* Moving Lines */}
            {consultation.moving_lines && consultation.moving_lines.length > 0 && (
              <div className="text-center mt-6 pt-6 border-t border-[#D1CDC7]">
                <p className="text-sm text-[#595959]">
                  {t.consultation.result.movingLines}: {consultation.moving_lines.join(', ')}
                </p>
              </div>
            )}

            {/* Derived Hexagram */}
            {consultation.derived_hexagram_number && (
              <div className="text-center mt-4 pt-4 border-t border-[#D1CDC7]">
                <p className="text-sm text-[#595959] mb-1">{t.consultation.result.derivedHexagram}</p>
                <p className="font-serif text-xl text-[#C44D38]">
                  {consultation.derived_hexagram_number}. {consultation.derived_hexagram_name}
                </p>
              </div>
            )}
          </div>

          {/* Interpretation */}
          <div className="zen-card mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="font-serif text-xl text-[#2C2C2C] mb-4">
              {t.consultation.result.interpretation}
            </h3>
            <div className="interpretation-text text-[#2C2C2C] whitespace-pre-wrap">
              {consultation.interpretation}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <p className="text-[#595959] mb-6">
              {browserLang === 'it' 
                ? 'Vuoi consultare l\'I Ching anche tu?' 
                : 'Want to consult the I Ching too?'}
            </p>
            <Link to="/register">
              <Button className="btn-primary inline-flex items-center space-x-2">
                <span>{browserLang === 'it' ? 'Inizia il tuo viaggio' : 'Start your journey'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#D1CDC7] bg-[#F9F7F2] py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="font-serif text-[#2C2C2C]">
            I Ching <span className="text-[#C44D38]">del Benessere</span>
          </div>
          <p className="text-sm text-[#595959] mt-2">
            © {new Date().getFullYear()} — L'antica saggezza per il mondo moderno
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SharedConsultation;
