import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Briefcase,
  BookOpen,
  Activity,
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProfileCompletionPrompt = ({ onComplete, onDismiss }) => {
  const { language, getToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completionStatus, setCompletionStatus] = useState(null);
  
  const [formData, setFormData] = useState({
    birth_date: '',
    birth_time: '',
    birth_place: '',
    gender: '',
    occupation: '',
    iching_experience: '',
    activity_level: '',
    wellness_interests: [],
  });

  useEffect(() => {
    checkCompletionStatus();
  }, []);

  const checkCompletionStatus = async () => {
    try {
      const response = await axios.get(`${API}/profile/completion-status`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCompletionStatus(response.data);
    } catch (error) {
      console.error('Error checking profile completion:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Filter out empty values
      const dataToSend = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] && (Array.isArray(formData[key]) ? formData[key].length > 0 : true)) {
          dataToSend[key] = formData[key];
        }
      });
      
      await axios.put(`${API}/profile`, dataToSend, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      toast.success(language === 'it' ? 'Profilo aggiornato!' : 'Profile updated!');
      setShowModal(false);
      if (onComplete) onComplete();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    if (onDismiss) onDismiss();
  };

  const toggleWellnessInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      wellness_interests: prev.wellness_interests.includes(interest)
        ? prev.wellness_interests.filter(i => i !== interest)
        : [...prev.wellness_interests, interest]
    }));
  };

  // Don't show if profile is complete
  if (completionStatus && !completionStatus.show_prompt) {
    return null;
  }

  // Prompt Banner
  if (!showModal) {
    return (
      <div className="zen-card bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 mb-6 animate-fade-in-up">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#2C2C2C] mb-1">
                {language === 'it' ? 'Completa il tuo Profilo' : 'Complete Your Profile'}
              </h3>
              <p className="text-sm text-[#595959]">
                {language === 'it' 
                  ? 'Aggiungi la tua data di nascita per scoprire il tuo profilo astrologico cinese e occidentale'
                  : 'Add your birth date to discover your Chinese and Western astrological profile'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-purple-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#595959]" />
          </button>
        </div>
        
        <div className="mt-4 flex items-center space-x-3">
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {language === 'it' ? 'Completa Ora' : 'Complete Now'}
          </Button>
          <span className="text-xs text-[#595959]">
            {language === 'it' ? '~2 minuti' : '~2 minutes'}
          </span>
        </div>
      </div>
    );
  }

  // Modal Form
  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto my-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5E0D8] px-4 sm:px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-serif text-lg sm:text-xl text-[#2C2C2C]">
              {language === 'it' ? 'Il Tuo Profilo' : 'Your Profile'}
            </h2>
            <p className="text-sm text-[#595959]">
              {language === 'it' ? `Passo ${step} di 3` : `Step ${step} of 3`}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-[#E5E0D8] rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 sm:px-6 pt-4">
          <div className="h-2 bg-[#E5E0D8] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {/* Step 1: Birth Data */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center">
                  <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />
                </div>
                <h3 className="font-serif text-base sm:text-lg text-[#2C2C2C]">
                  {language === 'it' ? 'Dati di Nascita' : 'Birth Data'}
                </h3>
                <p className="text-xs sm:text-sm text-[#595959]">
                  {language === 'it' 
                    ? 'Per calcolare il tuo profilo astrologico'
                    : 'To calculate your astrological profile'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  📅 {language === 'it' ? 'Data di Nascita' : 'Birth Date'}
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E5E0D8] rounded-lg bg-[#F8F6F3] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  ⏰ {language === 'it' ? 'Orario di Nascita (opzionale)' : 'Birth Time (optional)'}
                </label>
                <input
                  type="time"
                  value={formData.birth_time}
                  onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E5E0D8] rounded-lg bg-[#F8F6F3] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  📍 {language === 'it' ? 'Luogo di Nascita (opzionale)' : 'Birth Place (optional)'}
                </label>
                <input
                  type="text"
                  value={formData.birth_place}
                  onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                  placeholder={language === 'it' ? 'Es: Roma, Italia' : 'E.g.: Rome, Italy'}
                  className="w-full px-4 py-3 border border-[#E5E0D8] rounded-lg bg-[#F8F6F3] focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-serif text-lg text-[#2C2C2C]">
                  {language === 'it' ? 'Informazioni Personali' : 'Personal Information'}
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  👤 {language === 'it' ? 'Genere' : 'Gender'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'male', label_it: 'Uomo', label_en: 'Male', emoji: '👨' },
                    { value: 'female', label_it: 'Donna', label_en: 'Female', emoji: '👩' },
                    { value: 'other', label_it: 'Altro', label_en: 'Other', emoji: '🧑' },
                    { value: 'prefer_not_say', label_it: 'Preferisco non dire', label_en: 'Prefer not to say', emoji: '🤐' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: option.value })}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.gender === option.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-[#E5E0D8] hover:border-purple-300'
                      }`}
                    >
                      <span className="mr-2">{option.emoji}</span>
                      <span className="text-sm">{language === 'it' ? option.label_it : option.label_en}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  💼 {language === 'it' ? 'Posizione lavorativa/studio' : 'Work/study position'}
                  <span className="text-xs text-[#595959] ml-2">(max 30 caratteri)</span>
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value.slice(0, 30) })}
                  maxLength={30}
                  placeholder={language === 'it' ? 'Es: Designer, Studente...' : 'E.g.: Designer, Student...'}
                  className="w-full px-4 py-3 border border-[#E5E0D8] rounded-lg bg-[#F8F6F3] focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <p className="text-xs text-[#595959] mt-1">{formData.occupation.length}/30</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  🧘 {language === 'it' ? 'Esperienza con I Ching' : 'I Ching Experience'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'beginner', label_it: 'Principiante', label_en: 'Beginner' },
                    { value: 'intermediate', label_it: 'Intermedio', label_en: 'Intermediate' },
                    { value: 'expert', label_it: 'Esperto', label_en: 'Expert' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, iching_experience: option.value })}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.iching_experience === option.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-[#E5E0D8] hover:border-purple-300'
                      }`}
                    >
                      <span className="text-sm">{language === 'it' ? option.label_it : option.label_en}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Wellness */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-serif text-lg text-[#2C2C2C]">
                  {language === 'it' ? 'Benessere' : 'Wellness'}
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  🏃 {language === 'it' ? 'Livello attività fisica' : 'Physical activity level'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'sedentary', label_it: 'Sedentario', label_en: 'Sedentary', emoji: '🪑' },
                    { value: 'moderate', label_it: 'Moderato', label_en: 'Moderate', emoji: '🚶' },
                    { value: 'active', label_it: 'Attivo', label_en: 'Active', emoji: '🏃' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, activity_level: option.value })}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.activity_level === option.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-[#E5E0D8] hover:border-purple-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{option.emoji}</span>
                      <span className="text-xs">{language === 'it' ? option.label_it : option.label_en}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  🍃 {language === 'it' ? 'Interesse per pratiche' : 'Interest in practices'}
                  <span className="text-xs text-[#595959] ml-2">
                    ({language === 'it' ? 'selezione multipla' : 'multiple selection'})
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'meditation', label_it: 'Meditazione', label_en: 'Meditation', emoji: '🧘' },
                    { value: 'yoga', label_it: 'Yoga', label_en: 'Yoga', emoji: '🧘‍♀️' },
                    { value: 'taichi', label_it: 'Tai Chi', label_en: 'Tai Chi', emoji: '☯️' },
                    { value: 'qigong', label_it: 'Qi Gong', label_en: 'Qi Gong', emoji: '🌀' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleWellnessInterest(option.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all flex items-center space-x-2 ${
                        formData.wellness_interests.includes(option.value)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-[#E5E0D8] hover:border-purple-300'
                      }`}
                    >
                      <span className="text-xl">{option.emoji}</span>
                      <span className="text-sm">{language === 'it' ? option.label_it : option.label_en}</span>
                      {formData.wellness_interests.includes(option.value) && (
                        <Check className="w-4 h-4 text-purple-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[#E5E0D8] px-6 py-4 flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {language === 'it' ? 'Indietro' : 'Back'}
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="text-[#595959]"
            >
              {language === 'it' ? 'Salta per ora' : 'Skip for now'}
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
            >
              {language === 'it' ? 'Avanti' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {language === 'it' ? 'Salva Profilo' : 'Save Profile'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionPrompt;
