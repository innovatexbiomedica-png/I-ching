import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, HelpCircle, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = (process.env.REACT_APP_BACKEND_URL || "https://iching-backend-ac3n.onrender.com");

const FeedbackBanner = ({ consultationId, language, getToken, onFeedbackSubmitted }) => {
  const [selectedOption, setSelectedOption] = useState(null); // 'yes', 'no', 'other'
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const t = {
    it: {
      title: "L'interpretazione ti risuona?",
      subtitle: "Il tuo feedback ci aiuta a migliorare la qualità delle stese",
      yes: "Sì, mi rispecchia",
      no: "No, non mi risuona",
      other: "Parzialmente",
      placeholder: {
        no: "Cosa non ti ha convinto? Quali aspetti non riflettono la tua situazione?",
        other: "Quali parti ti risuonano e quali no? Come potremmo migliorare?"
      },
      submit: "Invia Feedback",
      thanks: "Grazie per il tuo feedback!",
      thanksSubtitle: "Ci aiuterà a rendere le interpretazioni sempre più precise.",
      skip: "Salta"
    },
    en: {
      title: "Does this interpretation resonate with you?",
      subtitle: "Your feedback helps us improve the quality of readings",
      yes: "Yes, it reflects me",
      no: "No, it doesn't resonate",
      other: "Partially",
      placeholder: {
        no: "What didn't convince you? Which aspects don't reflect your situation?",
        other: "Which parts resonate and which don't? How could we improve?"
      },
      submit: "Send Feedback",
      thanks: "Thank you for your feedback!",
      thanksSubtitle: "It will help us make interpretations more accurate.",
      skip: "Skip"
    }
  };

  const text = t[language] || t.it;

  const handleSubmit = async () => {
    if (!selectedOption) return;
    
    // Per "no" e "other" richiediamo il testo
    if ((selectedOption === 'no' || selectedOption === 'other') && !feedbackText.trim()) {
      toast.error(language === 'it' ? 'Per favore, scrivi il tuo feedback' : 'Please write your feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${API}/consultations/${consultationId}/feedback`,
        {
          rating: selectedOption,
          feedback_text: feedbackText.trim() || null,
        },
        { headers: { Authorization: `Bearer ${getToken()}` }}
      );
      
      setIsSubmitted(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(selectedOption, feedbackText);
      }
      toast.success(text.thanks);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(language === 'it' ? 'Errore nell\'invio del feedback' : 'Error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      await axios.post(
        `${API}/consultations/${consultationId}/feedback`,
        {
          rating: 'skipped',
          feedback_text: null,
        },
        { headers: { Authorization: `Bearer ${getToken()}` }}
      );
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error skipping feedback:', error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="zen-card bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 animate-fade-in-up">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-serif text-lg text-green-800">{text.thanks}</h4>
            <p className="text-sm text-green-600">{text.thanksSubtitle}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="zen-card bg-gradient-to-r from-[#F9F7F2] to-[#E8D5B7]/30 border-2 border-[#D4AC0D]/30 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#D4AC0D] to-[#C44D38] flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-serif text-xl text-[#2C2C2C] mb-1">{text.title}</h3>
        <p className="text-sm text-[#595959]">{text.subtitle}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Sì */}
        <button
          onClick={() => setSelectedOption('yes')}
          className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
            selectedOption === 'yes'
              ? 'border-green-500 bg-green-50 shadow-lg shadow-green-500/20'
              : 'border-[#D1CDC7] bg-white hover:border-green-300'
          }`}
        >
          <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
            selectedOption === 'yes' ? 'bg-green-500' : 'bg-green-100'
          }`}>
            <ThumbsUp className={`w-5 h-5 ${selectedOption === 'yes' ? 'text-white' : 'text-green-600'}`} />
          </div>
          <span className={`text-sm font-medium ${selectedOption === 'yes' ? 'text-green-700' : 'text-[#2C2C2C]'}`}>
            {text.yes}
          </span>
        </button>

        {/* No */}
        <button
          onClick={() => setSelectedOption('no')}
          className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
            selectedOption === 'no'
              ? 'border-red-500 bg-red-50 shadow-lg shadow-red-500/20'
              : 'border-[#D1CDC7] bg-white hover:border-red-300'
          }`}
        >
          <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
            selectedOption === 'no' ? 'bg-red-500' : 'bg-red-100'
          }`}>
            <ThumbsDown className={`w-5 h-5 ${selectedOption === 'no' ? 'text-white' : 'text-red-600'}`} />
          </div>
          <span className={`text-sm font-medium ${selectedOption === 'no' ? 'text-red-700' : 'text-[#2C2C2C]'}`}>
            {text.no}
          </span>
        </button>

        {/* Altro/Parzialmente */}
        <button
          onClick={() => setSelectedOption('other')}
          className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
            selectedOption === 'other'
              ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/20'
              : 'border-[#D1CDC7] bg-white hover:border-amber-300'
          }`}
        >
          <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
            selectedOption === 'other' ? 'bg-amber-500' : 'bg-amber-100'
          }`}>
            <HelpCircle className={`w-5 h-5 ${selectedOption === 'other' ? 'text-white' : 'text-amber-600'}`} />
          </div>
          <span className={`text-sm font-medium ${selectedOption === 'other' ? 'text-amber-700' : 'text-[#2C2C2C]'}`}>
            {text.other}
          </span>
        </button>
      </div>

      {/* Text Input for No/Other */}
      {(selectedOption === 'no' || selectedOption === 'other') && (
        <div className="mb-6 animate-fade-in-up">
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder={text.placeholder[selectedOption]}
            rows={3}
            className="w-full p-4 rounded-xl border-2 border-[#D1CDC7] focus:border-[#C44D38] focus:ring-0 bg-white resize-none transition-colors"
          />
          <p className="text-xs text-[#595959] mt-1">
            {language === 'it' 
              ? 'Il tuo feedback è anonimo e ci aiuta a migliorare le interpretazioni per tutti.'
              : 'Your feedback is anonymous and helps us improve interpretations for everyone.'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSkip}
          className="text-sm text-[#595959] hover:text-[#2C2C2C] transition-colors"
        >
          {text.skip}
        </button>
        
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting}
          className="btn-primary flex items-center space-x-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>{text.submit}</span>
        </Button>
      </div>
    </div>
  );
};

export default FeedbackBanner;
