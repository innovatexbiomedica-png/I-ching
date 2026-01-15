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
import { Loader2, Circle, AlertCircle } from 'lucide-react';
import ShareButton from '../components/ShareButton';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Consultation = () => {
  const { language, getToken, hasSubscription } = useAuth();
  const t = useTranslation(language);
  const navigate = useNavigate();
  
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
    
    if (!hasSubscription) {
      toast.error(t.consultation.requiresSubscription);
      navigate('/pricing');
      return;
    }

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
        }
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
    const lineValues = [
      parseInt(lines.line1), parseInt(lines.line2), parseInt(lines.line3),
      parseInt(lines.line4), parseInt(lines.line5), parseInt(lines.line6)
    ];

    return (
      <div className="section-zen" data-testid="consultation-result">
        <div className="container-zen max-w-3xl">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-4 text-center">
              {t.consultation.result.title}
            </h1>
            <div className="w-16 h-px bg-[#C44D38] mx-auto mb-12" />
          </div>

          {/* Question */}
          <div className="zen-card mb-8 animate-fade-in-up stagger-1" data-testid="result-question">
            <p className="text-sm text-[#595959] mb-2">{t.consultation.question}</p>
            <p className="font-serif text-lg text-[#2C2C2C] italic">"{result.question}"</p>
          </div>

          {/* Hexagram Display */}
          <div className="zen-card mb-8 animate-fade-in-up stagger-2" data-testid="result-hexagram">
            <div className="text-center mb-6">
              <p className="text-sm text-[#595959] mb-2">{t.consultation.result.hexagram}</p>
              <h2 className="text-2xl font-serif text-[#2C2C2C]">
                {result.hexagram_number}. {result.hexagram_name}
              </h2>
            </div>
            
            {/* Hexagram Lines */}
            <div className="flex justify-center py-6">
              <div className="space-y-2">
                {lineValues.slice().reverse().map((value, index) => 
                  renderHexagramLine(value, index, result.moving_lines.includes(6 - index))
                )}
              </div>
            </div>

            {/* Moving Lines */}
            {result.moving_lines.length > 0 && (
              <div className="text-center mt-4 pt-4 border-t border-[#D1CDC7]">
                <p className="text-sm text-[#595959]">
                  {t.consultation.result.movingLines}: {result.moving_lines.join(', ')}
                </p>
              </div>
            )}

            {/* Derived Hexagram */}
            {result.derived_hexagram_number && (
              <div className="text-center mt-4 pt-4 border-t border-[#D1CDC7]">
                <p className="text-sm text-[#595959] mb-1">{t.consultation.result.derivedHexagram}</p>
                <p className="font-serif text-[#C44D38]">
                  {result.derived_hexagram_number}. {result.derived_hexagram_name}
                </p>
              </div>
            )}
          </div>

          {/* Interpretation */}
          <div className="zen-card mb-8 animate-fade-in-up stagger-3" data-testid="result-interpretation">
            <h3 className="font-serif text-xl text-[#2C2C2C] mb-4">
              {t.consultation.result.interpretation}
            </h3>
            <div className="interpretation-text text-[#2C2C2C] whitespace-pre-wrap">
              {result.interpretation}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-4">
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

  if (!hasSubscription) {
    return (
      <div className="section-zen" data-testid="subscription-required">
        <div className="container-zen max-w-xl text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-6 text-[#C44D38]" />
          <h1 className="text-3xl font-serif text-[#2C2C2C] mb-4">
            {t.consultation.requiresSubscription}
          </h1>
          <p className="text-[#595959] mb-8">
            {t.consultation.subscribeMessage}
          </p>
          <Link to="/pricing">
            <Button className="btn-primary" data-testid="subscribe-btn">
              {t.pricing.subscribe}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-zen" data-testid="consultation-page">
      <div className="container-zen max-w-2xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-serif text-[#2C2C2C] mb-4">
            {t.consultation.title}
          </h1>
          <div className="w-16 h-px bg-[#C44D38] mx-auto" />
        </div>

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
            <p className="text-sm text-[#595959] mb-6">
              {t.consultation.coinTossInstructions}
            </p>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="flex items-center space-x-4" data-testid={`line-${num}-input`}>
                  <span className="w-20 text-sm text-[#595959]">
                    {t.consultation.line} {num}
                  </span>
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
      </div>
    </div>
  );
};

export default Consultation;
