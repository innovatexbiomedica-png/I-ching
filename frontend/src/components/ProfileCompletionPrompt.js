import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  User, 
  Sparkles,
  X
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProfileCompletionPrompt = ({ onDismiss }) => {
  const { language, getToken } = useAuth();
  const navigate = useNavigate();
  const [completionStatus, setCompletionStatus] = useState(null);
  const [dismissed, setDismissed] = useState(false);

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
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  const handleGoToProfile = () => {
    navigate('/profile/astrology');
  };

  // Don't show if dismissed or profile is complete
  if (dismissed || (completionStatus && !completionStatus.show_prompt)) {
    return null;
  }

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
          onClick={handleGoToProfile}
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
