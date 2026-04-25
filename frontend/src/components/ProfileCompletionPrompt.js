import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  User, 
  Sparkles,
  X,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2
} from 'lucide-react';

const API = `${(process.env.REACT_APP_BACKEND_URL || "https://iching-backend-ac3n.onrender.com")}/api`;

const ProfileCompletionPrompt = ({ onDismiss, onComplete }) => {
  const { language, getToken } = useAuth();
  const [completionStatus, setCompletionStatus] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    birth_date: '',
    birth_time: '',
    birth_place: '',
    gender: '',
    iching_experience: '',
    activity_level: '',
    wellness_interests: []
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

  const handleDismiss = () => {
    if (showForm) {
      setShowForm(false);
      setCurrentStep(1);
      setError('');
    } else {
      setDismissed(true);
      if (onDismiss) onDismiss();
    }
  };

  const handleStartForm = () => {
    setShowForm(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleWellnessToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      wellness_interests: prev.wellness_interests.includes(interest)
        ? prev.wellness_interests.filter(i => i !== interest)
        : [...prev.wellness_interests, interest]
    }));
  };

  const validateStep = () => {
    if (currentStep === 1 && !formData.birth_date) {
      setError(language === 'it' ? 'La data di nascita è obbligatoria' : 'Birth date is required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      // Prepare data - only send non-empty values
      const dataToSend = {};
      if (formData.birth_date) dataToSend.birth_date = formData.birth_date;
      if (formData.birth_time) dataToSend.birth_time = formData.birth_time;
      if (formData.birth_place) dataToSend.birth_place = formData.birth_place;
      if (formData.gender) dataToSend.gender = formData.gender;
      if (formData.iching_experience) dataToSend.iching_experience = formData.iching_experience;
      if (formData.activity_level) dataToSend.activity_level = formData.activity_level;
      if (formData.wellness_interests.length > 0) dataToSend.wellness_interests = formData.wellness_interests;

      await axios.put(`${API}/profile`, dataToSend, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      setShowForm(false);
      setDismissed(true);
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.detail || (language === 'it' ? 'Errore nel salvataggio' : 'Error saving profile'));
    } finally {
      setLoading(false);
    }
  };

  // Don't show if dismissed or profile is complete
  if (dismissed || (completionStatus && !completionStatus.show_prompt)) {
    return null;
  }

  const genderOptions = [
    { value: 'male', labelIt: 'Uomo', labelEn: 'Male', emoji: '👨' },
    { value: 'female', labelIt: 'Donna', labelEn: 'Female', emoji: '👩' },
    { value: 'other', labelIt: 'Altro', labelEn: 'Other', emoji: '🧑' },
    { value: 'prefer_not_say', labelIt: 'Preferisco non dire', labelEn: 'Prefer not to say', emoji: '🤐' },
  ];

  const experienceOptions = [
    { value: 'beginner', labelIt: 'Principiante', labelEn: 'Beginner' },
    { value: 'intermediate', labelIt: 'Intermedio', labelEn: 'Intermediate' },
    { value: 'expert', labelIt: 'Esperto', labelEn: 'Expert' },
  ];

  const activityOptions = [
    { value: 'sedentary', labelIt: 'Sedentario', labelEn: 'Sedentary', emoji: '🪑' },
    { value: 'moderate', labelIt: 'Moderato', labelEn: 'Moderate', emoji: '🚶' },
    { value: 'active', labelIt: 'Attivo', labelEn: 'Active', emoji: '🏃' },
  ];

  const wellnessOptions = [
    { value: 'meditation', labelIt: 'Meditazione', labelEn: 'Meditation', emoji: '🧘' },
    { value: 'yoga', labelIt: 'Yoga', labelEn: 'Yoga', emoji: '🧘‍♀️' },
    { value: 'taichi', labelIt: 'Tai Chi', labelEn: 'Tai Chi', emoji: '☯️' },
    { value: 'qigong', labelIt: 'Qi Gong', labelEn: 'Qi Gong', emoji: '🌀' },
  ];

  // Form view
  if (showForm) {
    return (
      <div className="zen-card bg-white border-2 border-purple-200 mb-6 animate-fade-in-up relative max-w-lg mx-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-purple-100 rounded-full z-10"
        >
          <X className="w-4 h-4 text-[#595959]" />
        </button>

        {/* Progress indicator */}
        <div className="flex justify-center mb-6">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step < currentStep ? 'bg-purple-500 text-white' :
                step === currentStep ? 'bg-purple-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-8 h-1 ${step < currentStep ? 'bg-purple-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Birth data */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-[#2C2C2C] text-center mb-2">
              {language === 'it' ? 'Dati di Nascita' : 'Birth Data'}
            </h3>
            <p className="text-xs text-[#595959] text-center mb-4">
              {language === 'it' 
                ? 'Questi dati ci permettono di calcolare il tuo profilo astrologico'
                : 'This data allows us to calculate your astrological profile'}
            </p>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                {language === 'it' ? 'Data di nascita *' : 'Birth date *'}
              </label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                {language === 'it' ? 'Orario di nascita (opzionale)' : 'Birth time (optional)'}
              </label>
              <input
                type="time"
                value={formData.birth_time}
                onChange={(e) => handleInputChange('birth_time', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                {language === 'it' ? 'Luogo di nascita (opzionale)' : 'Birth place (optional)'}
              </label>
              <input
                type="text"
                value={formData.birth_place}
                onChange={(e) => handleInputChange('birth_place', e.target.value)}
                placeholder={language === 'it' ? 'Es: Roma, Italia' : 'E.g.: Rome, Italy'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 2: Personal info */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-[#2C2C2C] text-center mb-2">
              {language === 'it' ? 'Informazioni Personali' : 'Personal Information'}
            </h3>
            <p className="text-xs text-[#595959] text-center mb-4">
              {language === 'it' 
                ? 'Aiutaci a personalizzare la tua esperienza (opzionale)'
                : 'Help us personalize your experience (optional)'}
            </p>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                {language === 'it' ? 'Genere' : 'Gender'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {genderOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleInputChange('gender', opt.value)}
                    className={`p-2 text-sm rounded-lg border transition-all ${
                      formData.gender === opt.value
                        ? 'bg-purple-100 border-purple-500 text-purple-700'
                        : 'bg-white border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {opt.emoji} {language === 'it' ? opt.labelIt : opt.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                {language === 'it' ? 'Esperienza con I Ching' : 'I Ching Experience'}
              </label>
              <div className="flex gap-2">
                {experienceOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleInputChange('iching_experience', opt.value)}
                    className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                      formData.iching_experience === opt.value
                        ? 'bg-purple-100 border-purple-500 text-purple-700'
                        : 'bg-white border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {language === 'it' ? opt.labelIt : opt.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Wellness */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-[#2C2C2C] text-center mb-2">
              {language === 'it' ? 'Benessere e Attività' : 'Wellness & Activity'}
            </h3>
            <p className="text-xs text-[#595959] text-center mb-4">
              {language === 'it' 
                ? 'Personalizza i consigli in base al tuo stile di vita (opzionale)'
                : 'Customize advice based on your lifestyle (optional)'}
            </p>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                {language === 'it' ? 'Livello di attività fisica' : 'Physical activity level'}
              </label>
              <div className="flex gap-2">
                {activityOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleInputChange('activity_level', opt.value)}
                    className={`flex-1 p-2 text-sm rounded-lg border transition-all ${
                      formData.activity_level === opt.value
                        ? 'bg-purple-100 border-purple-500 text-purple-700'
                        : 'bg-white border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {opt.emoji} {language === 'it' ? opt.labelIt : opt.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                {language === 'it' ? 'Interessi benessere' : 'Wellness interests'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {wellnessOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleWellnessToggle(opt.value)}
                    className={`p-2 text-sm rounded-lg border transition-all ${
                      formData.wellness_interests.includes(opt.value)
                        ? 'bg-purple-100 border-purple-500 text-purple-700'
                        : 'bg-white border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {opt.emoji} {language === 'it' ? opt.labelIt : opt.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-sm text-[#595959] hover:text-[#2C2C2C] flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {language === 'it' ? 'Indietro' : 'Back'}
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm rounded-lg flex items-center hover:from-purple-600 hover:to-indigo-600 transition-all"
            >
              {language === 'it' ? 'Avanti' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm rounded-lg flex items-center hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'it' ? 'Salvataggio...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {language === 'it' ? 'Completa' : 'Complete'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Initial prompt view
  return (
    <div className="zen-card bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 mb-6 animate-fade-in-up relative">
      <div className="flex items-start space-x-3 pr-8">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-base text-[#2C2C2C] mb-1">
            {language === 'it' ? 'Completa il tuo Profilo' : 'Complete Your Profile'}
          </h3>
          <p className="text-xs text-[#595959]">
            {language === 'it' 
              ? 'Scopri il tuo profilo astrologico'
              : 'Discover your astrological profile'}
          </p>
        </div>
      </div>
      
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 hover:bg-purple-100 rounded-full"
      >
        <X className="w-4 h-4 text-[#595959]" />
      </button>
      
      <div className="mt-3">
        <button 
          type="button"
          onClick={handleStartForm}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm rounded-lg flex items-center justify-center hover:from-purple-600 hover:to-indigo-600 transition-all"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {language === 'it' ? 'Completa Ora (~2 min)' : 'Complete Now (~2 min)'}
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletionPrompt;
