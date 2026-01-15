import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import axios from 'axios';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { Calendar, ArrowRight, ArrowLeft, Loader2, BookOpen, Sparkles, Trash2, Circle, CheckCircle2, Layers, X } from 'lucide-react';
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
  
  // Selection mode for synthesis
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showSynthesisPanel, setShowSynthesisPanel] = useState(false);
  const [synthesisLoading, setSynthesisLoading] = useState(false);

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
    e.stopPropagation();
    
    const confirmMsg = language === 'it' 
      ? 'Sei sicuro di voler eliminare questa consultazione?' 
      : 'Are you sure you want to delete this consultation?';
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      await axios.delete(`${API}/consultations/${consultationId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      setConsultations(prev => prev.filter(c => c.id !== consultationId));
      setSelectedIds(prev => prev.filter(id => id !== consultationId));
      if (selectedConsultation?.id === consultationId) {
        setSelectedConsultation(null);
      }
      
      toast.success(language === 'it' ? 'Consultazione eliminata' : 'Consultation deleted');
    } catch (error) {
      toast.error(language === 'it' ? 'Errore nell\'eliminazione' : 'Error deleting');
    }
  };

  const toggleSelection = (e, consultationId) => {
    e.stopPropagation();
    
    // Don't allow selecting synthesis consultations for another synthesis
    const consultation = consultations.find(c => c.id === consultationId);
    if (consultation?.is_synthesis) {
      toast.error(language === 'it' 
        ? 'Non puoi selezionare una stesa di sintesi' 
        : 'Cannot select a synthesis reading');
      return;
    }
    
    setSelectedIds(prev => {
      if (prev.includes(consultationId)) {
        return prev.filter(id => id !== consultationId);
      } else {
        if (prev.length >= 5) {
          toast.error(language === 'it' 
            ? 'Massimo 5 consultazioni selezionabili' 
            : 'Maximum 5 consultations can be selected');
          return prev;
        }
        return [...prev, consultationId];
      }
    });
  };

  const handleCreateSynthesis = async (synthesisType) => {
    if (selectedIds.length < 2) {
      toast.error(language === 'it' 
        ? 'Seleziona almeno 2 consultazioni' 
        : 'Select at least 2 consultations');
      return;
    }

    setSynthesisLoading(true);
    try {
      const response = await axios.post(
        `${API}/consultations/synthesis`,
        { consultation_ids: selectedIds, synthesis_type: synthesisType },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      
      // Add the new synthesis to the list
      setConsultations(prev => [response.data, ...prev]);
      setSelectedConsultation(response.data);
      
      // Reset selection
      setSelectedIds([]);
      setSelectionMode(false);
      setShowSynthesisPanel(false);
      
      toast.success(language === 'it' 
        ? 'Stesa di sintesi generata!' 
        : 'Synthesis reading generated!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 
        (language === 'it' ? 'Errore nella generazione' : 'Generation error'));
    } finally {
      setSynthesisLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, 'dd MMMM yyyy, HH:mm', { 
      locale: language === 'it' ? it : enUS 
    });
  };

  const getSynthesisTypeLabel = (type) => {
    const labels = {
      confirmation: language === 'it' ? 'Conferma/Smentita' : 'Confirmation/Denial',
      deepening: language === 'it' ? 'Approfondimento' : 'Deepening',
      clarification: language === 'it' ? 'Chiarimento' : 'Clarification'
    };
    return labels[type] || type;
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
    const aiTitle = selectedConsultation.is_synthesis
      ? (language === 'it' ? 'Sintesi Divinatoria' : 'Divinatory Synthesis')
      : (language === 'it' ? 'Interpretazione I Ching del Benessere' : 'I Ching of Wellbeing Interpretation');

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
            {/* Synthesis Badge */}
            {selectedConsultation.is_synthesis && (
              <div className="mb-6 flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
                  <Layers className="w-4 h-4 mr-2" />
                  {getSynthesisTypeLabel(selectedConsultation.synthesis_type)}
                </span>
                <span className="text-sm text-[#595959]">
                  {language === 'it' 
                    ? `(${selectedConsultation.linked_consultation_ids?.length || 0} stese collegate)`
                    : `(${selectedConsultation.linked_consultation_ids?.length || 0} linked readings)`}
                </span>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center space-x-2 text-[#595959] mb-4">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(selectedConsultation.created_at)}</span>
            </div>

            {/* Question */}
            <div className="zen-card mb-8">
              <p className="text-sm text-[#595959] mb-2">{t.consultation.question}</p>
              <p className="font-serif text-xl text-[#2C2C2C] italic whitespace-pre-line">
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

            {/* SECTION 1: Traditional Reading (only for non-synthesis) */}
            {!selectedConsultation.is_synthesis && (
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
            )}

            {/* SECTION 2: AI Interpretation / Synthesis */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedConsultation.is_synthesis ? 'bg-purple-600' : 'bg-[#C44D38]'
                }`}>
                  <span className="text-white font-serif text-xl">
                    {selectedConsultation.is_synthesis ? '∞' : '2'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-[#2C2C2C] flex items-center space-x-2">
                    <span>{aiTitle}</span>
                    <Sparkles className={`w-5 h-5 ${selectedConsultation.is_synthesis ? 'text-purple-600' : 'text-[#C44D38]'}`} />
                  </h2>
                  <p className="text-sm text-[#595959]">
                    {selectedConsultation.is_synthesis
                      ? (language === 'it' ? 'Analisi combinata delle tue stese' : 'Combined analysis of your readings')
                      : (language === 'it' ? 'L\'oracolo interpreta la tua domanda' : 'The oracle interprets your question')}
                  </p>
                </div>
              </div>
              <div className={`zen-card border-l-4 ${selectedConsultation.is_synthesis ? 'border-purple-600' : 'border-[#C44D38]'}`}>
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
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-4">
            {t.history.title}
          </h1>
          <div className="w-16 h-px bg-[#C44D38] mx-auto" />
        </div>

        {/* Selection Mode Toggle */}
        {consultations.length >= 2 && (
          <div className="mb-6 flex justify-center animate-fade-in-up">
            <Button
              onClick={() => {
                setSelectionMode(!selectionMode);
                if (selectionMode) {
                  setSelectedIds([]);
                  setShowSynthesisPanel(false);
                }
              }}
              variant={selectionMode ? "default" : "outline"}
              className={selectionMode 
                ? "bg-purple-600 hover:bg-purple-700 text-white" 
                : "border-purple-600 text-purple-600 hover:bg-purple-50"}
              data-testid="toggle-selection-btn"
            >
              <Layers className="w-4 h-4 mr-2" />
              {selectionMode 
                ? (language === 'it' ? 'Esci dalla selezione' : 'Exit selection')
                : (language === 'it' ? 'Crea stesa di approfondimento' : 'Create synthesis reading')}
            </Button>
          </div>
        )}

        {/* Selection Info Bar */}
        {selectionMode && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg animate-fade-in-up">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                <span className="text-purple-800">
                  {language === 'it' 
                    ? `${selectedIds.length} stese selezionate (min 2, max 5)`
                    : `${selectedIds.length} readings selected (min 2, max 5)`}
                </span>
              </div>
              {selectedIds.length >= 2 && (
                <Button
                  onClick={() => setShowSynthesisPanel(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  data-testid="open-synthesis-panel-btn"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {language === 'it' ? 'Genera sintesi' : 'Generate synthesis'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Synthesis Panel Modal */}
        {showSynthesisPanel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#F9F7F2] rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif text-[#2C2C2C]">
                  {language === 'it' ? 'Crea stesa di sintesi' : 'Create synthesis reading'}
                </h3>
                <button 
                  onClick={() => setShowSynthesisPanel(false)}
                  className="text-[#595959] hover:text-[#2C2C2C]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-[#595959] mb-6">
                {language === 'it' 
                  ? `Hai selezionato ${selectedIds.length} stese. Scegli il tipo di analisi che desideri:`
                  : `You selected ${selectedIds.length} readings. Choose the type of analysis you want:`}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleCreateSynthesis('confirmation')}
                  disabled={synthesisLoading}
                  className="w-full p-4 text-left rounded-lg border-2 border-[#D1CDC7] hover:border-purple-500 hover:bg-purple-50 transition-all"
                  data-testid="synthesis-confirmation-btn"
                >
                  <div className="font-medium text-[#2C2C2C]">
                    {language === 'it' ? '✓ Conferma / Smentita' : '✓ Confirmation / Denial'}
                  </div>
                  <div className="text-sm text-[#595959]">
                    {language === 'it' 
                      ? 'Analizza se le stese confermano o smentiscono il messaggio iniziale'
                      : 'Analyze if the readings confirm or deny the initial message'}
                  </div>
                </button>

                <button
                  onClick={() => handleCreateSynthesis('deepening')}
                  disabled={synthesisLoading}
                  className="w-full p-4 text-left rounded-lg border-2 border-[#D1CDC7] hover:border-purple-500 hover:bg-purple-50 transition-all"
                  data-testid="synthesis-deepening-btn"
                >
                  <div className="font-medium text-[#2C2C2C]">
                    {language === 'it' ? '⬇ Approfondimento' : '⬇ Deepening'}
                  </div>
                  <div className="text-sm text-[#595959]">
                    {language === 'it' 
                      ? 'Trova connessioni nascoste e offre una comprensione più profonda'
                      : 'Find hidden connections and offer deeper understanding'}
                  </div>
                </button>

                <button
                  onClick={() => handleCreateSynthesis('clarification')}
                  disabled={synthesisLoading}
                  className="w-full p-4 text-left rounded-lg border-2 border-[#D1CDC7] hover:border-purple-500 hover:bg-purple-50 transition-all"
                  data-testid="synthesis-clarification-btn"
                >
                  <div className="font-medium text-[#2C2C2C]">
                    {language === 'it' ? '💡 Chiarimento' : '💡 Clarification'}
                  </div>
                  <div className="text-sm text-[#595959]">
                    {language === 'it' 
                      ? 'Risolve dubbi e ambiguità con una lettura definitiva'
                      : 'Resolve doubts and ambiguities with a definitive reading'}
                  </div>
                </button>
              </div>

              {synthesisLoading && (
                <div className="mt-6 flex items-center justify-center space-x-2 text-purple-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{language === 'it' ? 'Generazione in corso...' : 'Generating...'}</span>
                </div>
              )}
            </div>
          </div>
        )}

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
                onClick={() => !selectionMode && setSelectedConsultation(consultation)}
                className={`history-card cursor-pointer group relative ${
                  selectionMode && selectedIds.includes(consultation.id) 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : ''
                } ${consultation.is_synthesis ? 'border-l-4 border-purple-500' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`history-item-${consultation.id}`}
              >
                <div className="flex items-start justify-between">
                  {/* Selection Checkbox */}
                  {selectionMode && (
                    <button
                      onClick={(e) => toggleSelection(e, consultation.id)}
                      className="mr-4 flex-shrink-0 mt-1"
                      data-testid={`select-${consultation.id}`}
                    >
                      {selectedIds.includes(consultation.id) ? (
                        <CheckCircle2 className="w-6 h-6 text-purple-600" />
                      ) : (
                        <Circle className={`w-6 h-6 ${consultation.is_synthesis ? 'text-gray-300' : 'text-[#D1CDC7] hover:text-purple-400'}`} />
                      )}
                    </button>
                  )}

                  <div className="flex-1">
                    {/* Synthesis Badge */}
                    {consultation.is_synthesis && (
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                          <Layers className="w-3 h-3 mr-1" />
                          {getSynthesisTypeLabel(consultation.synthesis_type)}
                        </span>
                      </div>
                    )}

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
                      <span className={`font-serif ${consultation.is_synthesis ? 'text-purple-600' : 'text-[#C44D38]'}`}>
                        {consultation.hexagram_number}. {consultation.hexagram_name}
                      </span>
                      {consultation.moving_lines?.length > 0 && (
                        <span className="text-xs text-[#595959] bg-[#E5E0D8] px-2 py-1 rounded">
                          {consultation.moving_lines.length} {language === 'it' ? 'linee mutevoli' : 'moving lines'}
                        </span>
                      )}
                      {consultation.is_synthesis && consultation.linked_consultation_ids && (
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                          {consultation.linked_consultation_ids.length} {language === 'it' ? 'stese collegate' : 'linked readings'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                    {!selectionMode && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(e, consultation.id);
                        }}
                        className="p-2 text-[#D1CDC7] hover:text-[#C44D38] hover:bg-[#C44D38]/10 rounded transition-colors z-10"
                        title={language === 'it' ? 'Elimina' : 'Delete'}
                        data-testid={`delete-${consultation.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <ArrowRight className={`w-5 h-5 transition-colors ${
                      selectionMode 
                        ? 'text-transparent' 
                        : 'text-[#D1CDC7] group-hover:text-[#C44D38]'
                    }`} />
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
