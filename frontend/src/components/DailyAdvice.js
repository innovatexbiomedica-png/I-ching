import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Sparkles, 
  Crown, 
  Calendar, 
  Bell, 
  ChevronRight,
  Sun,
  Moon,
  Loader2,
  Settings
} from 'lucide-react';

const API = `${(process.env.REACT_APP_BACKEND_URL || "https://iching-backend-ac3n.onrender.com")}/api`;

const DailyAdvice = () => {
  const { language, getToken, hasSubscription } = useAuth();
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchAdvice();
  }, []);

  const fetchAdvice = async () => {
    try {
      const response = await axios.get(`${API}/advice/current`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setAdvice(response.data);
    } catch (error) {
      console.error('Error fetching advice:', error);
    } finally {
      setLoading(false);
    }
  };

  if (dismissed) return null;

  if (loading) {
    return (
      <div className="zen-card animate-pulse">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#C44D38]" />
        </div>
      </div>
    );
  }

  // Preview per utenti Free
  if (advice?.is_preview) {
    return (
      <div className="zen-card bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#C44D38] to-[#E67E22] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#2C2C2C]">
                {language === 'it' ? 'Consiglio Personalizzato' : 'Personalized Advice'}
              </h3>
              <p className="text-sm text-amber-600 flex items-center space-x-1">
                <Crown className="w-4 h-4" />
                <span>{language === 'it' ? 'Funzionalità Premium' : 'Premium Feature'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Chinese Calendar Preview */}
        {advice.chinese_calendar && (
          <div className="mb-4 p-3 bg-white/50 rounded-lg">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{advice.chinese_calendar.day_energy?.animal?.emoji}</span>
                <div>
                  <p className="font-medium text-[#2C2C2C]">
                    {language === 'it' ? 'Energia del Giorno' : 'Today\'s Energy'}
                  </p>
                  <p className="text-[#595959]">
                    {language === 'it' 
                      ? advice.chinese_calendar.day_energy?.quality_it 
                      : advice.chinese_calendar.day_energy?.quality_en}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{advice.chinese_calendar.year_animal?.emoji}</span>
                <div>
                  <p className="font-medium text-[#2C2C2C]">
                    {language === 'it' ? 'Anno del' : 'Year of the'}
                  </p>
                  <p className="text-[#595959]">
                    {language === 'it' 
                      ? advice.chinese_calendar.year_animal?.animal 
                      : advice.chinese_calendar.year_animal?.animal_en}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-[#595959] mb-4">
          {advice.preview_message}
        </p>

        <Link 
          to="/subscription" 
          className="flex items-center justify-center space-x-2 w-full py-3 bg-gradient-to-r from-[#C44D38] to-[#E67E22] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Crown className="w-5 h-5" />
          <span>{language === 'it' ? 'Sblocca Consigli Personalizzati' : 'Unlock Personalized Advice'}</span>
        </Link>
      </div>
    );
  }

  // Full advice per utenti Premium
  if (!advice) return null;

  const frequencyLabels = {
    daily: language === 'it' ? 'Giornaliero' : 'Daily',
    weekly: language === 'it' ? 'Settimanale' : 'Weekly',
    monthly: language === 'it' ? 'Mensile' : 'Monthly',
  };

  const themeLabels = {
    love: language === 'it' ? '💕 Amore' : '💕 Love',
    career: language === 'it' ? '💼 Carriera' : '💼 Career',
    spiritual: language === 'it' ? '🧘 Spirituale' : '🧘 Spiritual',
    new_beginning: language === 'it' ? '🌅 Nuovo Inizio' : '🌅 New Beginning',
    general: language === 'it' ? '☯️ Generale' : '☯️ General',
  };

  return (
    <div className="zen-card bg-gradient-to-br from-[#FDF8F5] to-white border-2 border-[#C44D38]/20 relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#C44D38]/5 to-transparent rounded-bl-full" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#C44D38] to-[#E67E22] flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#2C2C2C]">
                {language === 'it' ? 'Il Tuo Consiglio' : 'Your Advice'}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-[#595959]">
                <Calendar className="w-4 h-4" />
                <span>{frequencyLabels[advice.frequency]}</span>
                <span>•</span>
                <span>{themeLabels[advice.theme]}</span>
              </div>
            </div>
          </div>
          <Link 
            to="/notifications" 
            className="p-2 hover:bg-[#E5E0D8] rounded-lg transition-colors"
            title={language === 'it' ? 'Impostazioni Notifiche' : 'Notification Settings'}
          >
            <Settings className="w-5 h-5 text-[#595959]" />
          </Link>
        </div>

        {/* Chinese Calendar Info */}
        {advice.chinese_calendar && (
          <div className="flex flex-wrap gap-3 mb-4 p-3 bg-white/70 rounded-lg border border-[#E5E0D8]">
            <div className="flex items-center space-x-2 px-3 py-1 bg-[#FDF8F5] rounded-full">
              <span className="text-xl">{advice.chinese_calendar.day_energy?.animal?.emoji}</span>
              <span className="text-sm text-[#595959]">
                {language === 'it' 
                  ? advice.chinese_calendar.day_energy?.element 
                  : advice.chinese_calendar.day_energy?.element_en}
              </span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-[#FDF8F5] rounded-full">
              <span className="text-xl">{advice.chinese_calendar.year_animal?.emoji}</span>
              <span className="text-sm text-[#595959]">
                {language === 'it' 
                  ? `Anno ${advice.chinese_calendar.year_animal?.animal}` 
                  : `Year of ${advice.chinese_calendar.year_animal?.animal_en}`}
              </span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-[#FDF8F5] rounded-full">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-[#595959]">
                {language === 'it' 
                  ? `Giorno ${advice.chinese_calendar.day_energy?.cycle_day} del ciclo Jiazi`
                  : `Day ${advice.chinese_calendar.day_energy?.cycle_day} of Jiazi cycle`}
              </span>
            </div>
          </div>
        )}

        {/* Advice Text */}
        <div className="mb-4">
          <p className="text-[#2C2C2C] leading-relaxed text-lg font-light italic">
            "{advice.advice_text}"
          </p>
        </div>

        {/* Stats */}
        {advice.user_stats && (
          <div className="flex items-center space-x-4 text-sm text-[#595959] mb-4">
            <span>📊 {advice.user_stats.total_consultations} {language === 'it' ? 'consultazioni' : 'consultations'}</span>
            <span>🛤️ {advice.user_stats.active_paths} {language === 'it' ? 'percorsi attivi' : 'active paths'}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E5E0D8]">
          <Link 
            to="/paths" 
            className="text-[#C44D38] hover:underline flex items-center space-x-1 text-sm"
          >
            <span>{language === 'it' ? 'Esplora Percorsi' : 'Explore Paths'}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-sm text-[#595959] hover:text-[#2C2C2C]"
          >
            {language === 'it' ? 'Nascondi' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyAdvice;
