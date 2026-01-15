import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import axios from 'axios';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { Calendar, ArrowRight, ArrowLeft, Loader2, Circle, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import HexagramDisplay from '../components/HexagramDisplay';
import MovingLinesSection from '../components/MovingLinesSection';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const History = () => {
  const { id } = useParams();
  const { language, getToken } = useAuth();
  const t = useTranslation(language);
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    if (id && consultations.length > 0) {
      const found = consultations.find(c => c.id === id);
      if (found) setSelectedConsultation(found);
    }
  }, [id, consultations]);

  const fetchConsultations = async () => {
    try {
      const response = await axios.get(`${API}/consultations`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setConsultations(response.data);
      
      if (id) {
        const found = response.data.find(c => c.id === id);
        if (found) setSelectedConsultation(found);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, 'dd MMMM yyyy, HH:mm', { 
      locale: language === 'it' ? it : enUS 
    });
  };

  const renderHexagramLine = (isYang, isMoving) => {
    return (
      <div className="flex items-center justify-center">
        <div className="relative w-16">
          {isYang ? (
            <div className={`h-1.5 ${isMoving ? 'bg-[#C44D38]' : 'bg-[#2C2C2C]'}`} />
          ) : (
            <div className="flex justify-between">
              <div className={`w-6 h-1.5 ${isMoving ? 'bg-[#C44D38]' : 'bg-[#2C2C2C]'}`} />
              <div className={`w-6 h-1.5 ${isMoving ? 'bg-[#C44D38]' : 'bg-[#2C2C2C]'}`} />
            </div>
          )}
        </div>
        {isMoving && <Circle className="w-2 h-2 ml-1 text-[#C44D38]" />}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="section-zen flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C44D38]" />
      </div>
    );
  }

  // Detail View
  if (selectedConsultation) {
    return (
      <div className="section-zen" data-testid="consultation-detail">
        <div className="container-zen max-w-3xl">
          <button
            onClick={() => setSelectedConsultation(null)}
            className="flex items-center space-x-2 text-[#595959] hover:text-[#2C2C2C] mb-8 transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.common.back}</span>
          </button>

          <div className="animate-fade-in-up">
            {/* Date */}
            <div className="flex items-center space-x-2 text-[#595959] mb-4">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(selectedConsultation.created_at)}</span>
            </div>

            {/* Question */}
            <div className="zen-card mb-8">
              <p className="text-sm text-[#595959] mb-2">{t.consultation.question}</p>
              <p className="font-serif text-xl text-[#2C2C2C] italic">
                "{selectedConsultation.question}"
              </p>
            </div>

            {/* Hexagram */}
            <div className="zen-card mb-8">
              <div className="text-center">
                <p className="text-sm text-[#595959] mb-2">{t.consultation.result.hexagram}</p>
                <h2 className="text-2xl font-serif text-[#2C2C2C] mb-6">
                  {selectedConsultation.hexagram_number}. {selectedConsultation.hexagram_name}
                </h2>
              </div>

              {/* Moving Lines */}
              {selectedConsultation.moving_lines.length > 0 && (
                <div className="text-center pt-4 border-t border-[#D1CDC7]">
                  <p className="text-sm text-[#595959]">
                    {t.consultation.result.movingLines}: {selectedConsultation.moving_lines.join(', ')}
                  </p>
                </div>
              )}

              {/* Derived Hexagram */}
              {selectedConsultation.derived_hexagram_number && (
                <div className="text-center mt-4 pt-4 border-t border-[#D1CDC7]">
                  <p className="text-sm text-[#595959] mb-1">{t.consultation.result.derivedHexagram}</p>
                  <p className="font-serif text-[#C44D38]">
                    {selectedConsultation.derived_hexagram_number}. {selectedConsultation.derived_hexagram_name}
                  </p>
                </div>
              )}
            </div>

            {/* Interpretation */}
            <div className="zen-card">
              <h3 className="font-serif text-xl text-[#2C2C2C] mb-4">
                {t.consultation.result.interpretation}
              </h3>
              <div className="interpretation-text text-[#2C2C2C] whitespace-pre-wrap">
                {selectedConsultation.interpretation}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="section-zen" data-testid="history-page">
      <div className="container-zen">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-4">
            {t.history.title}
          </h1>
          <div className="w-16 h-px bg-[#C44D38] mx-auto" />
        </div>

        {consultations.length === 0 ? (
          <div className="zen-card text-center py-16 animate-fade-in-up" data-testid="empty-history">
            <BookOpen className="w-16 h-16 mx-auto mb-6 text-[#D1CDC7]" />
            <p className="text-xl text-[#595959] mb-6">{t.history.empty}</p>
            <Link to="/consult">
              <Button className="btn-primary" data-testid="start-consultation-btn">
                {t.dashboard.newConsultation}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            {consultations.map((consultation, index) => (
              <div
                key={consultation.id}
                onClick={() => setSelectedConsultation(consultation)}
                className="history-card cursor-pointer group"
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`history-item-${consultation.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-[#595959]" />
                      <span className="text-sm text-[#595959]">
                        {formatDate(consultation.created_at)}
                      </span>
                    </div>
                    <p className="text-[#2C2C2C] mb-3 line-clamp-2 font-serif text-lg">
                      {consultation.question}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className="text-[#C44D38] font-serif">
                        {consultation.hexagram_number}. {consultation.hexagram_name}
                      </span>
                      {consultation.moving_lines.length > 0 && (
                        <span className="text-xs text-[#595959] bg-[#E5E0D8] px-2 py-1 rounded">
                          {consultation.moving_lines.length} {language === 'it' ? 'linee mutevoli' : 'moving lines'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#D1CDC7] group-hover:text-[#C44D38] transition-colors flex-shrink-0 ml-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
