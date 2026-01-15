import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Loader2, Circle, AlertCircle, BookOpen, Sparkles, Zap, Compass } from 'lucide-react';
import ShareButton from '../components/ShareButton';
import HexagramDisplay from '../components/HexagramDisplay';
import TraditionalReading from '../components/TraditionalReading';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Consultation = () => {
  const { language, getToken, hasSubscription } = useAuth();
  const t = useTranslation(language);
  const navigate = useNavigate();
  
  const [consultationType, setConsultationType] = useState(null); // 'direct' or 'deep'
  const [question, setQuestion] = useState('');
  const [lines, setLines] = useState({
    line1: '',
    line2: '',
    line3: '',
    line4: '',
    line5: '',
    line6: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleLineChange = (lineNum, value) => {
    setLines(prev => ({ ...prev, [lineNum]: value }));
  };

  const allLinesFilled = Object.values(lines).every(v => v !== '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Subscription check disabled for now
    // if (!hasSubscription) {
    //   toast.error(t.consultation.requiresSubscription);
    //   navigate('/pricing');
    //   return;
    // }

    if (!allLinesFilled) {
      toast.error(language === 'it' ? 'Inserisci tutti i lanci' : 'Enter all tosses');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/consultations`, {
        question,
        coin_tosses: {
          line1: parseInt(lines.line1),
          line2: parseInt(lines.line2),
          line3: parseInt(lines.line3),
          line4: parseInt(lines.line4),
          line5: parseInt(lines.line5),
          line6: parseInt(lines.line6)
        },
        consultation_type: consultationType || 'deep'
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      setResult(response.data);
      toast.success(language === 'it' ? 'Consultazione completata!' : 'Consultation complete!');
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(t.consultation.subscribeMessage);
        navigate('/pricing');
      } else {
        toast.error(error.response?.data?.detail || t.common.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderHexagramLine = (value, index, isMoving) => {
    const isYang = value === 7 || value === 9;
    
    return (
      <div key={index} className="flex items-center justify-center space-x-2">
        <span className="text-xs text-[#595959] w-6">{6 - index}</span>
        <div className="relative w-24">
          {isYang ? (
            <div className={`h-2 ${isMoving ? 'bg-[#C44D38]' : 'bg-[#2C2C2C]'}`} />
          ) : (
            <div className="flex justify-between">
              <div className={`w-10 h-2 ${isMoving ? 'bg-[#C44D38]' : 'bg-[#2C2C2C]'}`} />
              <div className={`w-10 h-2 ${isMoving ? 'bg-[#C44D38]' : 'bg-[#2C2C2C]'}`} />
            </div>
          )}
        </div>
        {isMoving && (
          <Circle className="w-3 h-3 text-[#C44D38]" />
        )}
      </div>
    );
  };

  if (result) {
    const aiTitle = language === 'it' ? 'Interpretazione I Ching del Benessere' : 'I Ching of Wellbeing Interpretation';

    return (
      <div className="section-zen" data-testid="consultation-result">
        <div className="container-zen max-w-4xl">
          {/* Title */}
          <div className="animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-4 text-center">
              {t.consultation.result.title}
            </h1>
            <div className="w-16 h-px bg-[#C44D38] mx-auto mb-12" />
          </div>

          {/* Question */}
          <div className="zen-card mb-8 animate-fade-in-up stagger-1" data-testid="result-question">
            <p className="text-sm text-[#595959] mb-2">{t.consultation.question}</p>
            <p className="font-serif text-xl text-[#2C2C2C] italic">"{result.question}"</p>
          </div>

          {/* SECTION 1: Traditional Reading - Full Display */}
          <div className="animate-fade-in-up stagger-2 mb-12">
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
              hexagramNumber={result.hexagram_number}
              hexagramName={result.hexagram_name}
              hexagramChinese={result.hexagram_chinese || result.hexagram_name}
              traditionalData={result.traditional_data}
              derivedHexagramNumber={result.derived_hexagram_number}
              derivedHexagramName={result.derived_hexagram_name}
              derivedTraditionalData={result.derived_traditional_data}
              movingLines={result.moving_lines}
              language={language}
            />
          </div>

          {/* SECTION 2: AI Interpretation */}
          <div className="animate-fade-in-up stagger-3 mb-8">
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
            <div className="zen-card border-l-4 border-[#C44D38]" data-testid="result-interpretation">
              <div className="interpretation-text text-[#2C2C2C] whitespace-pre-wrap leading-relaxed">
                {result.interpretation}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-4">
            <ShareButton 
              consultation={result}
              shareToken={result.share_token}
              onGenerateLink={async () => {
                try {
                  const response = await axios.post(`${API}/consultations/${result.id}/share`, {}, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                  });
                  return response.data.share_token;
                } catch (err) {
                  toast.error(language === 'it' ? 'Errore nella condivisione' : 'Share error');
                  return null;
                }
              }}
              language={language}
            />
            <Button
              onClick={() => {
                setResult(null);
                setQuestion('');
                setLines({ line1: '', line2: '', line3: '', line4: '', line5: '', line6: '' });
              }}
              className="btn-primary"
              data-testid="new-consultation-btn"
            >
              {t.dashboard.newConsultation}
            </Button>
            <Link to="/history">
              <Button variant="outline" className="btn-secondary w-full" data-testid="view-history-btn">
                {t.history.title}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Subscription check disabled for now
  // if (!hasSubscription) {
  //   return (
  //     <div className="section-zen" data-testid="subscription-required">
  //       ...
  //     </div>
  //   );
  // }

  return (
    <div className="section-zen" data-testid="consultation-page">
      <div className="container-zen max-w-2xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-4">
            {t.consultation.title}
          </h1>
          <div className="w-16 h-px bg-[#C44D38] mx-auto" />
        </div>

        {/* Consultation Type Selection */}
        {!consultationType && (
          <div className="animate-fade-in-up mb-8" data-testid="consultation-type-selection">
            <div className="zen-card border-2 border-[#E5E0D8] p-6 mb-4">
              <h3 className="font-serif text-xl text-[#2C2C2C] mb-2 text-center">
                {language === 'it' ? 'Scegli il tipo di consultazione' : 'Choose consultation type'}
              </h3>
              <p className="text-sm text-[#595959] text-center mb-6">
                {language === 'it' 
                  ? 'Seleziona lo stile di interpretazione che preferisci ricevere'
                  : 'Select the interpretation style you prefer to receive'}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Direct Reading */}
                <button
                  type="button"
                  onClick={() => setConsultationType('direct')}
                  className="p-6 rounded-xl border-2 border-[#D1CDC7] hover:border-[#C44D38] hover:bg-[#C44D38]/5 transition-all text-left group"
                  data-testid="select-direct"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#C44D38] flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-serif text-lg text-[#2C2C2C] group-hover:text-[#C44D38]">
                      {language === 'it' ? 'Stesa Diretta' : 'Direct Reading'}
                    </h4>
                  </div>
                  <p className="text-sm text-[#595959] mb-3">
                    {language === 'it' 
                      ? 'Interpretazione chiara, d\'impatto, che va dritta al punto. Ideale per risposte immediate e comprensibili.'
                      : 'Clear, impactful interpretation that gets straight to the point. Ideal for immediate and understandable answers.'}
                  </p>
                  <ul className="text-xs text-[#595959] space-y-1">
                    <li>✓ {language === 'it' ? 'Linguaggio semplice e diretto' : 'Simple and direct language'}</li>
                    <li>✓ {language === 'it' ? 'Risposta concisa e pratica' : 'Concise and practical response'}</li>
                    <li>✓ {language === 'it' ? 'Facile da comprendere' : 'Easy to understand'}</li>
                  </ul>
                </button>

                {/* Deep Reading */}
                <button
                  type="button"
                  onClick={() => setConsultationType('deep')}
                  className="p-6 rounded-xl border-2 border-[#D1CDC7] hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                  data-testid="select-deep"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                      <Compass className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-serif text-lg text-[#2C2C2C] group-hover:text-purple-600">
                      {language === 'it' ? 'Stesa Profonda' : 'Deep Reading'}
                    </h4>
                  </div>
                  <p className="text-sm text-[#595959] mb-3">
                    {language === 'it' 
                      ? 'Interpretazione completa con riferimenti al Libro dei Mutamenti, archetipi e saggezza taoista.'
                      : 'Complete interpretation with references to the Book of Changes, archetypes and Taoist wisdom.'}
                  </p>
                  <ul className="text-xs text-[#595959] space-y-1">
                    <li>✓ {language === 'it' ? 'Citazioni dal Libro dei Mutamenti' : 'Quotes from the Book of Changes'}</li>
                    <li>✓ {language === 'it' ? 'Analisi dettagliata delle linee' : 'Detailed line analysis'}</li>
                    <li>✓ {language === 'it' ? 'Linguaggio contemplativo e poetico' : 'Contemplative and poetic language'}</li>
                  </ul>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show selected type indicator */}
        {consultationType && (
          <div className="mb-6 animate-fade-in-up">
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${
              consultationType === 'direct' 
                ? 'bg-[#C44D38]/10 text-[#C44D38]' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {consultationType === 'direct' ? (
                <Zap className="w-4 h-4 mr-2" />
              ) : (
                <Compass className="w-4 h-4 mr-2" />
              )}
              <span className="font-medium">
                {consultationType === 'direct' 
                  ? (language === 'it' ? 'Stesa Diretta' : 'Direct Reading')
                  : (language === 'it' ? 'Stesa Profonda' : 'Deep Reading')}
              </span>
              <button 
                type="button"
                onClick={() => setConsultationType(null)}
                className="ml-2 text-xs underline opacity-70 hover:opacity-100"
              >
                {language === 'it' ? 'cambia' : 'change'}
              </button>
            </div>
          </div>
        )}

        {consultationType && (
        <form onSubmit={handleSubmit}>
          {/* Question Input */}
          <div className="zen-card mb-8 animate-fade-in-up stagger-1" data-testid="question-section">
            <Label htmlFor="question" className="form-label text-lg font-serif">
              {t.consultation.question}
            </Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t.consultation.questionPlaceholder}
              className="min-h-[120px] bg-[#EBE8E1] border-[#D1CDC7] focus:border-[#C44D38] font-serif text-lg"
              required
              data-testid="question-input"
            />
          </div>

          {/* Coin Tosses */}
          <div className="zen-card mb-8 animate-fade-in-up stagger-2" data-testid="coin-toss-section">
            <h3 className="font-serif text-xl text-[#2C2C2C] mb-3">
              {t.consultation.coinToss}
            </h3>
            <p className="text-sm text-[#595959] mb-4">
              {t.consultation.coinTossInstructions}
            </p>
            
            {/* Important note about hexagram construction */}
            <div className="bg-[#E5E0D8]/50 border-l-4 border-[#C44D38] p-4 mb-6">
              <p className="text-sm text-[#2C2C2C] font-medium">
                {language === 'it' 
                  ? '⬆ L\'esagramma si costruisce dal basso verso l\'alto: il primo lancio forma la linea inferiore (1), l\'ultimo lancio forma la linea superiore (6).'
                  : '⬆ The hexagram is built from bottom to top: the first toss forms the bottom line (1), the last toss forms the top line (6).'}
              </p>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="flex items-center space-x-4" data-testid={`line-${num}-input`}>
                  <div className="w-28 flex items-center space-x-2">
                    <span className="text-sm text-[#595959]">
                      {t.consultation.line} {num}
                    </span>
                    <span className="text-xs text-[#C44D38]">
                      {num === 1 ? (language === 'it' ? '(basso)' : '(bottom)') : 
                       num === 6 ? (language === 'it' ? '(alto)' : '(top)') : ''}
                    </span>
                  </div>
                  <Select 
                    value={lines[`line${num}`]} 
                    onValueChange={(v) => handleLineChange(`line${num}`, v)}
                  >
                    <SelectTrigger className="flex-1 bg-[#EBE8E1] border-[#D1CDC7]">
                      <SelectValue placeholder={`${t.consultation.toss} ${num}`} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#F9F7F2] border-[#D1CDC7]">
                      <SelectItem value="6">{t.consultation.values[6]}</SelectItem>
                      <SelectItem value="7">{t.consultation.values[7]}</SelectItem>
                      <SelectItem value="8">{t.consultation.values[8]}</SelectItem>
                      <SelectItem value="9">{t.consultation.values[9]}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Coin Value Legend */}
            <div className="mt-6 pt-6 border-t border-[#D1CDC7]">
              <p className="text-xs text-[#595959] mb-2">
                {language === 'it' ? 'Calcolo:' : 'Calculation:'} 
                {language === 'it' ? ' Testa = 3, Croce = 2' : ' Heads = 3, Tails = 2'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#595959]">
                <div>6 = 2+2+2 ({language === 'it' ? '3 croci' : '3 tails'})</div>
                <div>7 = 2+2+3 ({language === 'it' ? '2 croci, 1 testa' : '2 tails, 1 head'})</div>
                <div>8 = 2+3+3 ({language === 'it' ? '1 croce, 2 teste' : '1 tail, 2 heads'})</div>
                <div>9 = 3+3+3 ({language === 'it' ? '3 teste' : '3 heads'})</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center animate-fade-in-up stagger-3">
            <Button
              type="submit"
              disabled={loading || !allLinesFilled || !question}
              className="btn-primary px-12 py-4 text-lg"
              data-testid="submit-consultation"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t.common.loading}
                </>
              ) : (
                t.consultation.submit
              )}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default Consultation;
