import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import axios from 'axios';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { Calendar, ArrowRight, ArrowLeft, Loader2, BookOpen, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import HexagramDisplay from '../components/HexagramDisplay';
import TraditionalReading from '../components/TraditionalReading';

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

  const handleDelete = async (e, consultationId) => {
    e.stopPropagation(); // Prevent opening the consultation
    
    const confirmMsg = language === 'it' 
      ? 'Sei sicuro di voler eliminare questa consultazione?' 
      : 'Are you sure you want to delete this consultation?';
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      await axios.delete(`${API}/consultations/${consultationId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      setConsultations(prev => prev.filter(c => c.id !== consultationId));
      if (selectedConsultation?.id === consultationId) {
        setSelectedConsultation(null);
      }
      
      toast.success(language === 'it' ? 'Consultazione eliminata' : 'Consultation deleted');
    } catch (error) {
      toast.error(language === 'it' ? 'Errore nell\'eliminazione' : 'Error deleting');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, 'dd MMMM yyyy, HH:mm', { 
      locale: language === 'it' ? it : enUS 
    });
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
    const aiTitle = language === 'it' ? 'Interpretazione I Ching del Benessere' : 'I Ching of Wellbeing Interpretation';

    return (
      <div className="section-zen" data-testid="consultation-detail">
        <div className="container-zen max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setSelectedConsultation(null)}
              className="flex items-center space-x-2 text-[#595959] hover:text-[#2C2C2C] transition-colors"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.common.back}</span>
            </button>
            <button
              onClick={(e) => handleDelete(e, selectedConsultation.id)}
              className="flex items-center space-x-2 text-[#595959] hover:text-[#C44D38] transition-colors"
              data-testid="delete-detail-btn"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'it' ? 'Elimina' : 'Delete'}</span>
            </button>
          </div>

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

            {/* Hexagram with Trigrams */}
            <div className="zen-card mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Hexagram Visual */}
                <div className="flex justify-center">
                  <HexagramDisplay
                    hexagramNumber={selectedConsultation.hexagram_number}
                    hexagramName={selectedConsultation.hexagram_name}
                    hexagramChinese={selectedConsultation.hexagram_chinese || selectedConsultation.hexagram_name}
                    trigramAbove={selectedConsultation.trigram_above}
                    trigramBelow={selectedConsultation.trigram_below}
                    movingLines={selectedConsultation.moving_lines}
                    lines={selectedConsultation.lines}
                    size="medium"
                  />
                </div>
                {/* Hexagram Info */}
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-serif text-[#2C2C2C] mb-2">
                    {selectedConsultation.hexagram_number}. {selectedConsultation.hexagram_name}
                  </h3>
                  {selectedConsultation.hexagram_chinese && (
                    <p className="text-lg text-[#C44D38] font-serif mb-4">{selectedConsultation.hexagram_chinese}</p>
                  )}
                  {selectedConsultation.trigram_above && selectedConsultation.trigram_below && (
                    <div className="text-sm text-[#595959] space-y-1">
                      <p>{language === 'it' ? 'Trigramma superiore' : 'Upper Trigram'}: {selectedConsultation.trigram_above}</p>
                      <p>{language === 'it' ? 'Trigramma inferiore' : 'Lower Trigram'}: {selectedConsultation.trigram_below}</p>
                    </div>
                  )}
                  {selectedConsultation.derived_hexagram_number && (
                    <div className="mt-4 pt-4 border-t border-[#E5E0D8]">
                      <p className="text-sm text-[#595959]">
                        {language === 'it' ? 'Evolve in' : 'Evolves into'}:
                      </p>
                      <p className="text-[#C44D38] font-serif">
                        {selectedConsultation.derived_hexagram_number}. {selectedConsultation.derived_hexagram_name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 1: Traditional Reading */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#2C2C2C] flex items-center justify-center">
                  <span className="text-white font-serif text-xl">1</span>
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-[#2C2C2C]">
                    {language === 'it' ? 'Lettura dal Libro dei Mutamenti' : 'Reading from the Book of Changes'}
                  </h2>
                  <p className="text-sm text-[#595959]">
                    {language === 'it' ? 'I testi tradizionali e la saggezza taoista' : 'Traditional texts and Taoist wisdom'}
                  </p>
                </div>
              </div>
              
              <TraditionalReading
                hexagramNumber={selectedConsultation.hexagram_number}
                hexagramName={selectedConsultation.hexagram_name}
                hexagramChinese={selectedConsultation.hexagram_chinese || selectedConsultation.hexagram_name}
                traditionalData={selectedConsultation.traditional_data}
                derivedHexagramNumber={selectedConsultation.derived_hexagram_number}
                derivedHexagramName={selectedConsultation.derived_hexagram_name}
                derivedTraditionalData={selectedConsultation.derived_traditional_data}
                movingLines={selectedConsultation.moving_lines}
                language={language}
              />
            </div>

            {/* SECTION 2: AI Interpretation */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#C44D38] flex items-center justify-center">
                  <span className="text-white font-serif text-xl">2</span>
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-[#2C2C2C] flex items-center space-x-2">
                    <span>{aiTitle}</span>
                    <Sparkles className="w-5 h-5 text-[#C44D38]" />
                  </h2>
                  <p className="text-sm text-[#595959]">
                    {language === 'it' ? 'L\'oracolo interpreta la tua domanda' : 'The oracle interprets your question'}
                  </p>
                </div>
              </div>
              <div className="zen-card border-l-4 border-[#C44D38]">
                <div className="interpretation-text text-[#2C2C2C] whitespace-pre-wrap leading-relaxed">
                  {selectedConsultation.interpretation}
                </div>
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
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                    <button
                      onClick={(e) => handleDelete(e, consultation.id)}
                      className="p-2 text-[#D1CDC7] hover:text-[#C44D38] hover:bg-[#C44D38]/10 rounded transition-colors"
                      title={language === 'it' ? 'Elimina' : 'Delete'}
                      data-testid={`delete-${consultation.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-5 h-5 text-[#D1CDC7] group-hover:text-[#C44D38] transition-colors" />
                  </div>
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
