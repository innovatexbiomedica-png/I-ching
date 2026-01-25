import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, BookOpen, Compass, Sparkles } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const DailyHexagram = () => {
  const { language, getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyHexagram();
  }, []);

  const fetchDailyHexagram = async () => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API}/daily-hexagram`, { headers });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching daily hexagram:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="zen-card animate-pulse">
        <div className="h-8 bg-[#E5E0D8] rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-[#E5E0D8] rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-[#E5E0D8] rounded w-full"></div>
      </div>
    );
  }

  if (!data) return null;

  const lunar = data.lunar_phase;

  return (
    <div className="zen-card bg-gradient-to-br from-[#F8F6F3] to-[#E5E0D8] border-2 border-[#D1CDC7]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-[#C44D38] flex items-center justify-center">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-[#2C2C2C]">
              {language === 'it' ? 'Esagramma del Giorno' : 'Hexagram of the Day'}
            </h2>
            <p className="text-sm text-[#595959]">{data.date}</p>
          </div>
        </div>
        
        {/* Lunar Phase */}
        <div className="text-center">
          <span className="text-3xl">{lunar.emoji}</span>
          <p className="text-xs text-[#595959]">
            {language === 'it' ? lunar.name_it : lunar.name_en}
          </p>
        </div>
      </div>

      {/* Hexagram Info */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-2">☰</div>
        <h3 className="font-serif text-2xl text-[#2C2C2C] mb-1">
          {data.hexagram_number}. {data.hexagram_name}
        </h3>
        <p className="text-[#8A8680] text-lg">{data.hexagram_chinese}</p>
      </div>

      {/* Daily Message */}
      <div className="bg-white/50 rounded-xl p-4 mb-4">
        <p className="text-[#2C2C2C] italic text-center">
          "{data.daily_message}"
        </p>
      </div>

      {/* Sentence Preview */}
      {data.sentence && (
        <div className="mb-4">
          <p className="text-sm text-[#595959] line-clamp-3">
            <span className="font-medium text-[#2C2C2C]">
              {language === 'it' ? 'Il Giudizio: ' : 'The Judgment: '}
            </span>
            {data.sentence}
          </p>
        </div>
      )}

      {/* Lunar Advice */}
      <div className="bg-[#2C2C2C]/5 rounded-lg p-3 mb-4">
        <div className="flex items-start space-x-2">
          <Moon className="w-4 h-4 text-[#C44D38] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#595959]">
            {language === 'it' ? lunar.advice_it : lunar.advice_en}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <Link 
          to={`/library/${data.hexagram_number}`}
          className="flex-1 btn-secondary text-center flex items-center justify-center space-x-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>{language === 'it' ? 'Approfondisci' : 'Learn More'}</span>
        </Link>
        <Link 
          to="/consultation"
          className="flex-1 btn-primary text-center flex items-center justify-center space-x-2"
        >
          <Compass className="w-4 h-4" />
          <span>{language === 'it' ? 'Consulta' : 'Consult'}</span>
        </Link>
      </div>
    </div>
  );
};

export default DailyHexagram;
