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
  const [dismissed, setDismissed] = useState(false);
  
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
      setDismissed(true);
      if (onComplete) onComplete();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    setDismissed(true);
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

  // Don't show anything if dismissed or profile is complete
  if (dismissed || (completionStatus && !completionStatus.show_prompt)) {
    return null;
  }

  // Show the Modal Form
  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
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
              <div className="space-y-4 animate-fade-in-up">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-amber-600" />
                  </div>
                  <h3 className="font-serif text-base text-[#2C2C2C]">
                    {language === 'it' ? 'Dati di Nascita' : 'Birth Data'}
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    📅 {language === 'it' ? 'Data di Nascita' : 'Birth Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#E5E0D8] rounded-lg bg-[#F8F6F3] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    ⏰ {language === 'it' ? 'Orario (opzionale)' : 'Time (optional)'}
                  </label>
                  <input
                    type="time"
                    value={formData.birth_time}
                    onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#E5E0D8] rounded-lg bg-[#F8F6F3] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    📍 {language === 'it' ? 'Luogo (opzionale)' : 'Place (optional)'}
                  </label>
                  <input
                    type="text"
                    value={formData.birth_place}
                    onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                    placeholder={language === 'it' ? 'Es: Roma' : 'E.g.: Rome'}
                    className="w-full px-3 py-2.5 border border-[#E5E0D8] rounded-lg bg-[#F8F6F3] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-base"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                    <User className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-serif text-base text-[#2C2C2C]">
                    {language === 'it' ? 'Info Personali' : 'Personal Info'}
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    👤 {language === 'it' ? 'Genere' : 'Gender'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'male', label: language === 'it' ? 'Uomo' : 'Male' },
                      { value: 'female', label: language === 'it' ? 'Donna' : 'Female' },
                      { value: 'other', label: language === 'it' ? 'Altro' : 'Other' },
                      { value: 'prefer_not_say', label: language === 'it' ? 'Non dire' : 'Not say' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: opt.value })}
                        className={`p-2 rounded-lg border-2 text-sm ${
                          formData.gender === opt.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-[#E5E0D8]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    💼 {language === 'it' ? 'Occupazione' : 'Occupation'} (max 30)
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value.slice(0, 30) })}
                    maxLength={30}
                    className="w-full px-3 py-2.5 border border-[#E5E0D8] rounded-lg bg-[#F8F6F3] focus:border-purple-500 text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    🧘 {language === 'it' ? 'Esperienza I Ching' : 'I Ching Experience'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'beginner', label: language === 'it' ? 'Base' : 'Beginner' },
                      { value: 'intermediate', label: language === 'it' ? 'Medio' : 'Medium' },
                      { value: 'expert', label: language === 'it' ? 'Esperto' : 'Expert' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, iching_experience: opt.value })}
                        className={`p-2 rounded-lg border-2 text-sm ${
                          formData.iching_experience === opt.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-[#E5E0D8]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Wellness */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                    <Activity className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-serif text-base text-[#2C2C2C]">
                    {language === 'it' ? 'Benessere' : 'Wellness'}
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    🏃 {language === 'it' ? 'Attività fisica' : 'Physical activity'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'sedentary', label: '🪑', sublabel: language === 'it' ? 'Bassa' : 'Low' },
                      { value: 'moderate', label: '🚶', sublabel: language === 'it' ? 'Media' : 'Medium' },
                      { value: 'active', label: '🏃', sublabel: language === 'it' ? 'Alta' : 'High' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, activity_level: opt.value })}
                        className={`p-3 rounded-lg border-2 text-center ${
                          formData.activity_level === opt.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-[#E5E0D8]'
                        }`}
                      >
                        <span className="text-xl block">{opt.label}</span>
                        <span className="text-xs">{opt.sublabel}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                    🍃 {language === 'it' ? 'Interessi' : 'Interests'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'meditation', label: '🧘 Meditazione' },
                      { value: 'yoga', label: '🧘‍♀️ Yoga' },
                      { value: 'taichi', label: '☯️ Tai Chi' },
                      { value: 'qigong', label: '🌀 Qi Gong' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleWellnessInterest(opt.value)}
                        className={`p-2 rounded-lg border-2 text-sm text-left ${
                          formData.wellness_interests.includes(opt.value)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-[#E5E0D8]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-[#E5E0D8] px-4 py-3 flex items-center justify-between gap-3">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="text-sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                {language === 'it' ? 'Indietro' : 'Back'}
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleDismiss} className="text-[#595959] text-sm">
                {language === 'it' ? 'Salta' : 'Skip'}
              </Button>
            )}

            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm">
                {language === 'it' ? 'Avanti' : 'Next'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                {language === 'it' ? 'Salva' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show the Banner Prompt (default state)
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
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm w-full"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {language === 'it' ? 'Completa Ora (~2 min)' : 'Complete Now (~2 min)'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileCompletionPrompt;
