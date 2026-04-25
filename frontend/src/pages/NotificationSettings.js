import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Bell, 
  BellOff,
  Clock, 
  Calendar,
  Crown,
  ArrowLeft,
  Check,
  Loader2,
  Smartphone,
  Monitor,
  Info
} from 'lucide-react';
import { Button } from '../components/ui/button';

const API = `${(process.env.REACT_APP_BACKEND_URL || "https://iching-backend-ac3n.onrender.com")}/api`;

const NotificationSettings = () => {
  const { language, getToken, hasSubscription } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    enabled: true,
    frequency: 'daily',
    preferred_time: '08:00',
    push_enabled: false,
    in_app_enabled: true,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`${API}/notifications/preferences`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (updates) => {
    if (!hasSubscription) {
      toast.error(language === 'it' 
        ? 'Funzionalità disponibile solo per Premium' 
        : 'Feature available only for Premium');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(
        `${API}/notifications/preferences`,
        updates,
        { headers: { Authorization: `Bearer ${getToken()}` }}
      );
      setPreferences(response.data.preferences);
      toast.success(language === 'it' ? 'Preferenze salvate!' : 'Preferences saved!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error saving preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleFrequencyChange = (frequency) => {
    const newPrefs = { ...preferences, frequency };
    setPreferences(newPrefs);
    savePreferences({ frequency });
  };

  const handleTimeChange = (e) => {
    const preferred_time = e.target.value;
    const newPrefs = { ...preferences, preferred_time };
    setPreferences(newPrefs);
    savePreferences({ preferred_time });
  };

  const handleToggle = (field) => {
    const newValue = !preferences[field];
    const newPrefs = { ...preferences, [field]: newValue };
    setPreferences(newPrefs);
    savePreferences({ [field]: newValue });
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast.error(language === 'it' 
        ? 'Il tuo browser non supporta le notifiche push' 
        : 'Your browser does not support push notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success(language === 'it' 
          ? 'Notifiche push abilitate! La configurazione completa sarà disponibile a breve.' 
          : 'Push notifications enabled! Full configuration coming soon.');
        // In futuro qui registreremo il token Firebase
      } else {
        toast.error(language === 'it' 
          ? 'Permesso notifiche negato' 
          : 'Notification permission denied');
      }
    } catch (error) {
      toast.error(language === 'it' 
        ? 'Errore nella richiesta permessi' 
        : 'Error requesting permission');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#C44D38]" />
          </div>
        </div>
      </div>
    );
  }

  // Non Premium - mostra upgrade
  if (!hasSubscription) {
    return (
      <div className="page-container">
        <div className="content-container max-w-2xl">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 text-[#595959] hover:text-[#2C2C2C] mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'it' ? 'Torna alla Dashboard' : 'Back to Dashboard'}</span>
          </Link>

          <div className="zen-card text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#C44D38] to-[#E67E22] flex items-center justify-center">
              <Bell className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-serif text-3xl text-[#2C2C2C] mb-4">
              {language === 'it' ? 'Consigli Personalizzati' : 'Personalized Advice'}
            </h1>
            <p className="text-[#595959] mb-6 max-w-md mx-auto">
              {language === 'it' 
                ? 'Ricevi consigli giornalieri, settimanali o mensili basati sui tuoi percorsi e sul calendario zodiacale cinese. Una guida personale per il tuo viaggio con l\'I Ching.'
                : 'Receive daily, weekly or monthly advice based on your paths and the Chinese zodiac calendar. A personal guide for your I Ching journey.'}
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center space-x-3 text-[#595959]">
                <Check className="w-5 h-5 text-green-500" />
                <span>{language === 'it' ? 'Consigli basati sui tuoi percorsi' : 'Advice based on your paths'}</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-[#595959]">
                <Check className="w-5 h-5 text-green-500" />
                <span>{language === 'it' ? 'Calendario zodiacale cinese integrato' : 'Integrated Chinese zodiac calendar'}</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-[#595959]">
                <Check className="w-5 h-5 text-green-500" />
                <span>{language === 'it' ? 'Frequenza personalizzabile' : 'Customizable frequency'}</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-[#595959]">
                <Check className="w-5 h-5 text-green-500" />
                <span>{language === 'it' ? 'Notifiche push (prossimamente)' : 'Push notifications (coming soon)'}</span>
              </div>
            </div>

            <Link to="/subscription">
              <Button className="btn-primary px-8 py-3">
                <Crown className="w-5 h-5 mr-2" />
                {language === 'it' ? 'Passa a Premium - €9.99/mese' : 'Upgrade to Premium - €9.99/month'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container max-w-2xl">
        {/* Header */}
        <Link 
          to="/dashboard" 
          className="flex items-center space-x-2 text-[#595959] hover:text-[#2C2C2C] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'it' ? 'Torna alla Dashboard' : 'Back to Dashboard'}</span>
        </Link>

        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Bell className="w-8 h-8 text-[#C44D38]" />
            <h1 className="font-serif text-3xl text-[#2C2C2C]">
              {language === 'it' ? 'Impostazioni Notifiche' : 'Notification Settings'}
            </h1>
          </div>
          <p className="text-[#595959]">
            {language === 'it' 
              ? 'Personalizza come e quando ricevere i tuoi consigli'
              : 'Customize how and when to receive your advice'}
          </p>
        </div>

        {/* Master Toggle */}
        <div className="zen-card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {preferences.enabled ? (
                <Bell className="w-6 h-6 text-[#C44D38]" />
              ) : (
                <BellOff className="w-6 h-6 text-[#595959]" />
              )}
              <div>
                <h3 className="font-medium text-[#2C2C2C]">
                  {language === 'it' ? 'Consigli Attivi' : 'Active Advice'}
                </h3>
                <p className="text-sm text-[#595959]">
                  {language === 'it' 
                    ? 'Attiva o disattiva tutti i consigli'
                    : 'Enable or disable all advice'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.enabled ? 'bg-[#C44D38]' : 'bg-gray-300'
              }`}
              disabled={saving}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Frequency Selection */}
        <div className="zen-card mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-6 h-6 text-[#C44D38]" />
            <h3 className="font-medium text-[#2C2C2C]">
              {language === 'it' ? 'Frequenza Consigli' : 'Advice Frequency'}
            </h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'daily', label: language === 'it' ? 'Giornaliero' : 'Daily', desc: language === 'it' ? 'Ogni giorno' : 'Every day' },
              { value: 'weekly', label: language === 'it' ? 'Settimanale' : 'Weekly', desc: language === 'it' ? 'Ogni lunedì' : 'Every Monday' },
              { value: 'monthly', label: language === 'it' ? 'Mensile' : 'Monthly', desc: language === 'it' ? 'Inizio mese' : 'Start of month' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleFrequencyChange(option.value)}
                disabled={saving || !preferences.enabled}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  preferences.frequency === option.value
                    ? 'border-[#C44D38] bg-[#C44D38]/5'
                    : 'border-[#E5E0D8] hover:border-[#C44D38]/50'
                } ${!preferences.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <p className="font-medium text-[#2C2C2C]">{option.label}</p>
                <p className="text-xs text-[#595959] mt-1">{option.desc}</p>
                {preferences.frequency === option.value && (
                  <Check className="w-4 h-4 text-[#C44D38] mt-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Time */}
        <div className="zen-card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-[#C44D38]" />
              <div>
                <h3 className="font-medium text-[#2C2C2C]">
                  {language === 'it' ? 'Ora Preferita' : 'Preferred Time'}
                </h3>
                <p className="text-sm text-[#595959]">
                  {language === 'it' 
                    ? 'Quando vuoi ricevere i consigli'
                    : 'When you want to receive advice'}
                </p>
              </div>
            </div>
            <input
              type="time"
              value={preferences.preferred_time}
              onChange={handleTimeChange}
              disabled={saving || !preferences.enabled}
              className={`px-4 py-2 border border-[#E5E0D8] rounded-lg bg-white focus:border-[#C44D38] focus:ring-1 focus:ring-[#C44D38] ${
                !preferences.enabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        {/* Notification Channels */}
        <div className="zen-card mb-6">
          <h3 className="font-medium text-[#2C2C2C] mb-4 flex items-center space-x-2">
            <span>{language === 'it' ? 'Canali di Notifica' : 'Notification Channels'}</span>
          </h3>
          
          <div className="space-y-4">
            {/* In-App Notifications */}
            <div className="flex items-center justify-between p-3 bg-[#F8F6F3] rounded-lg">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-[#C44D38]" />
                <div>
                  <p className="font-medium text-[#2C2C2C]">
                    {language === 'it' ? 'In-App' : 'In-App'}
                  </p>
                  <p className="text-xs text-[#595959]">
                    {language === 'it' ? 'Mostra nella dashboard' : 'Show in dashboard'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('in_app_enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.in_app_enabled ? 'bg-[#C44D38]' : 'bg-gray-300'
                }`}
                disabled={saving || !preferences.enabled}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.in_app_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-3 bg-[#F8F6F3] rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-[#C44D38]" />
                <div>
                  <p className="font-medium text-[#2C2C2C]">
                    {language === 'it' ? 'Notifiche Push' : 'Push Notifications'}
                  </p>
                  <p className="text-xs text-amber-600 flex items-center space-x-1">
                    <Info className="w-3 h-3" />
                    <span>{language === 'it' ? 'Configurazione in arrivo' : 'Configuration coming soon'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={requestPushPermission}
                className="px-3 py-1 text-sm bg-[#C44D38] text-white rounded-lg hover:bg-[#A33D2B] transition-colors disabled:opacity-50"
                disabled={saving || !preferences.enabled}
              >
                {language === 'it' ? 'Abilita' : 'Enable'}
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 flex items-start space-x-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {language === 'it' 
                  ? 'Le notifiche push via browser e app saranno disponibili a breve. Per ora i consigli vengono mostrati nella dashboard.'
                  : 'Browser and app push notifications will be available soon. For now, advice is shown in the dashboard.'}
              </span>
            </p>
          </div>
        </div>

        {/* Saving indicator */}
        {saving && (
          <div className="fixed bottom-4 right-4 bg-[#2C2C2C] text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{language === 'it' ? 'Salvataggio...' : 'Saving...'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
