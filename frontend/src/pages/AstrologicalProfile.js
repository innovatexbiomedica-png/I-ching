import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Star,
  Sun,
  Moon,
  Sparkles,
  Edit2,
  ArrowLeft,
  Loader2,
  Heart,
  Briefcase,
  Activity
} from 'lucide-react';
import { Button } from '../components/ui/button';
import ProfileCompletionPrompt from '../components/ProfileCompletionPrompt';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AstrologicalProfile = () => {
  const { language, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showEditPrompt, setShowEditPrompt] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const genderLabels = {
    male: { it: 'Uomo', en: 'Male', emoji: '👨' },
    female: { it: 'Donna', en: 'Female', emoji: '👩' },
    other: { it: 'Altro', en: 'Other', emoji: '🧑' },
    prefer_not_say: { it: 'Non specificato', en: 'Not specified', emoji: '🤐' },
  };

  const experienceLabels = {
    beginner: { it: 'Principiante', en: 'Beginner' },
    intermediate: { it: 'Intermedio', en: 'Intermediate' },
    expert: { it: 'Esperto', en: 'Expert' },
  };

  const activityLabels = {
    sedentary: { it: 'Sedentario', en: 'Sedentary', emoji: '🪑' },
    moderate: { it: 'Moderato', en: 'Moderate', emoji: '🚶' },
    active: { it: 'Attivo', en: 'Active', emoji: '🏃' },
  };

  const wellnessLabels = {
    meditation: { it: 'Meditazione', en: 'Meditation', emoji: '🧘' },
    yoga: { it: 'Yoga', en: 'Yoga', emoji: '🧘‍♀️' },
    taichi: { it: 'Tai Chi', en: 'Tai Chi', emoji: '☯️' },
    qigong: { it: 'Qi Gong', en: 'Qi Gong', emoji: '🌀' },
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

  // Show completion prompt if no profile
  if (!profile?.profile_completed) {
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

          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-[#2C2C2C] mb-2">
              {language === 'it' ? 'Profilo Astrologico' : 'Astrological Profile'}
            </h1>
            <p className="text-[#595959]">
              {language === 'it' 
                ? 'Completa il tuo profilo per scoprire il tuo tema astrale'
                : 'Complete your profile to discover your astrological chart'}
            </p>
          </div>

          <ProfileCompletionPrompt 
            onComplete={fetchProfile}
            onDismiss={() => {}}
          />
        </div>
      </div>
    );
  }

  const astro = profile.astrological_profile;
  const userData = profile.profile || {};

  return (
    <div className="page-container">
      <div className="content-container max-w-4xl">
        {/* Header */}
        <Link 
          to="/dashboard" 
          className="flex items-center space-x-2 text-[#595959] hover:text-[#2C2C2C] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'it' ? 'Torna alla Dashboard' : 'Back to Dashboard'}</span>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[#2C2C2C] mb-2">
              {language === 'it' ? 'Profilo Astrologico' : 'Astrological Profile'}
            </h1>
            <p className="text-[#595959]">
              {profile.name}
              {astro?.age && ` • ${astro.age} ${language === 'it' ? 'anni' : 'years old'}`}
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowEditPrompt(true)}
            className="flex items-center space-x-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>{language === 'it' ? 'Modifica' : 'Edit'}</span>
          </Button>
        </div>

        {/* Edit Modal */}
        {showEditPrompt && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <ProfileCompletionPrompt 
              onComplete={() => {
                fetchProfile();
                setShowEditPrompt(false);
              }}
              onDismiss={() => setShowEditPrompt(false)}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Chinese Zodiac */}
          {astro?.chinese_zodiac && (
            <div className="zen-card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-4xl">
                  {astro.chinese_zodiac.animal_emoji}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-red-600 font-medium">
                    {language === 'it' ? 'Zodiaco Cinese' : 'Chinese Zodiac'}
                  </p>
                  <h3 className="font-serif text-2xl text-[#2C2C2C]">
                    {astro.chinese_zodiac.animal}
                  </h3>
                  <p className="text-sm text-[#595959]">
                    {language === 'it' ? 'Anno' : 'Year'} {astro.chinese_zodiac.year}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                  <span className="text-2xl">{astro.chinese_zodiac.element_emoji}</span>
                  <div>
                    <p className="text-xs text-[#595959]">{language === 'it' ? 'Elemento' : 'Element'}</p>
                    <p className="font-medium text-[#2C2C2C]">{astro.chinese_zodiac.element}</p>
                  </div>
                </div>
                
                <div className="p-3 bg-white/50 rounded-lg">
                  <p className="text-xs text-[#595959] mb-1">{language === 'it' ? 'Caratteristiche' : 'Traits'}</p>
                  <p className="text-sm text-[#2C2C2C]">{astro.chinese_zodiac.animal_traits}</p>
                </div>

                <div className="p-3 bg-white/50 rounded-lg">
                  <p className="text-xs text-[#595959] mb-1">{language === 'it' ? 'Qualità elemento' : 'Element qualities'}</p>
                  <p className="text-sm text-[#2C2C2C]">{astro.chinese_zodiac.element_traits}</p>
                </div>

                <div className="flex space-x-3">
                  <div className="flex-1 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">💚 {language === 'it' ? 'Compatibile con' : 'Compatible with'}</p>
                    <p className="text-sm text-[#2C2C2C]">{astro.chinese_zodiac.compatible_with?.join(', ')}</p>
                  </div>
                  <div className="flex-1 p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-600 mb-1">💔 {language === 'it' ? 'Meno compatibile' : 'Less compatible'}</p>
                    <p className="text-sm text-[#2C2C2C]">{astro.chinese_zodiac.incompatible_with?.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Western Zodiac */}
          {astro?.western_zodiac && (
            <div className="zen-card bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-4xl">
                  {astro.western_zodiac.sign_emoji}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-purple-600 font-medium">
                    {language === 'it' ? 'Zodiaco Occidentale' : 'Western Zodiac'}
                  </p>
                  <h3 className="font-serif text-2xl text-[#2C2C2C]">
                    {astro.western_zodiac.sign}
                  </h3>
                  <p className="text-sm text-[#595959]">
                    {astro.western_zodiac.dates}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/50 rounded-lg">
                    <p className="text-xs text-[#595959]">{language === 'it' ? 'Elemento' : 'Element'}</p>
                    <p className="font-medium text-[#2C2C2C]">{astro.western_zodiac.element}</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <p className="text-xs text-[#595959]">{language === 'it' ? 'Pianeta reggente' : 'Ruling planet'}</p>
                    <p className="font-medium text-[#2C2C2C]">{astro.western_zodiac.ruling_planet}</p>
                  </div>
                </div>
                
                <div className="p-3 bg-white/50 rounded-lg">
                  <p className="text-xs text-[#595959] mb-1">{language === 'it' ? 'Caratteristiche' : 'Traits'}</p>
                  <p className="text-sm text-[#2C2C2C]">{astro.western_zodiac.traits}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Combined Reading */}
        {astro?.combined_reading && (
          <div className="zen-card mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-[#2C2C2C]">
                  {language === 'it' ? 'Lettura Combinata' : 'Combined Reading'}
                </h3>
                <p className="text-sm text-[#595959]">
                  {language === 'it' ? 'Il tuo profilo energetico unico' : 'Your unique energetic profile'}
                </p>
              </div>
            </div>
            <p className="text-[#2C2C2C] leading-relaxed whitespace-pre-line">
              {astro.combined_reading}
            </p>
          </div>
        )}

        {/* Natal Chart CTA */}
        <Link to="/natal-chart" className="block mt-6">
          <div className="zen-card bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-xl">
                    {language === 'it' ? 'Genera il tuo Tema Natale' : 'Generate your Natal Chart'}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {language === 'it' 
                      ? 'Ruota zodiacale, posizioni planetarie, aspetti e interpretazioni complete'
                      : 'Zodiac wheel, planetary positions, aspects and complete interpretations'}
                  </p>
                </div>
              </div>
              <ArrowLeft className="w-6 h-6 rotate-180" />
            </div>
          </div>
        </Link>

        {/* Personal Info */}
        <div className="zen-card mt-6">
          <h3 className="font-serif text-xl text-[#2C2C2C] mb-4 flex items-center space-x-2">
            <User className="w-5 h-5 text-[#C44D38]" />
            <span>{language === 'it' ? 'Informazioni Personali' : 'Personal Information'}</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {userData.birth_date && (
              <div className="flex items-center space-x-3 p-3 bg-[#F8F6F3] rounded-lg">
                <Calendar className="w-5 h-5 text-[#C44D38]" />
                <div>
                  <p className="text-xs text-[#595959]">{language === 'it' ? 'Data di nascita' : 'Birth date'}</p>
                  <p className="font-medium text-[#2C2C2C]">
                    {new Date(userData.birth_date).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {userData.birth_time && (
              <div className="flex items-center space-x-3 p-3 bg-[#F8F6F3] rounded-lg">
                <Clock className="w-5 h-5 text-[#C44D38]" />
                <div>
                  <p className="text-xs text-[#595959]">{language === 'it' ? 'Orario di nascita' : 'Birth time'}</p>
                  <p className="font-medium text-[#2C2C2C]">{userData.birth_time}</p>
                </div>
              </div>
            )}

            {userData.birth_place && (
              <div className="flex items-center space-x-3 p-3 bg-[#F8F6F3] rounded-lg">
                <MapPin className="w-5 h-5 text-[#C44D38]" />
                <div>
                  <p className="text-xs text-[#595959]">{language === 'it' ? 'Luogo di nascita' : 'Birth place'}</p>
                  <p className="font-medium text-[#2C2C2C]">{userData.birth_place}</p>
                </div>
              </div>
            )}

            {userData.gender && genderLabels[userData.gender] && (
              <div className="flex items-center space-x-3 p-3 bg-[#F8F6F3] rounded-lg">
                <span className="text-xl">{genderLabels[userData.gender].emoji}</span>
                <div>
                  <p className="text-xs text-[#595959]">{language === 'it' ? 'Genere' : 'Gender'}</p>
                  <p className="font-medium text-[#2C2C2C]">
                    {genderLabels[userData.gender][language === 'it' ? 'it' : 'en']}
                  </p>
                </div>
              </div>
            )}

            {userData.occupation && (
              <div className="flex items-center space-x-3 p-3 bg-[#F8F6F3] rounded-lg">
                <Briefcase className="w-5 h-5 text-[#C44D38]" />
                <div>
                  <p className="text-xs text-[#595959]">{language === 'it' ? 'Occupazione' : 'Occupation'}</p>
                  <p className="font-medium text-[#2C2C2C]">{userData.occupation}</p>
                </div>
              </div>
            )}

            {userData.iching_experience && experienceLabels[userData.iching_experience] && (
              <div className="flex items-center space-x-3 p-3 bg-[#F8F6F3] rounded-lg">
                <Star className="w-5 h-5 text-[#C44D38]" />
                <div>
                  <p className="text-xs text-[#595959]">{language === 'it' ? 'Esperienza I Ching' : 'I Ching Experience'}</p>
                  <p className="font-medium text-[#2C2C2C]">
                    {experienceLabels[userData.iching_experience][language === 'it' ? 'it' : 'en']}
                  </p>
                </div>
              </div>
            )}

            {userData.activity_level && activityLabels[userData.activity_level] && (
              <div className="flex items-center space-x-3 p-3 bg-[#F8F6F3] rounded-lg">
                <Activity className="w-5 h-5 text-[#C44D38]" />
                <div>
                  <p className="text-xs text-[#595959]">{language === 'it' ? 'Attività fisica' : 'Physical activity'}</p>
                  <p className="font-medium text-[#2C2C2C]">
                    {activityLabels[userData.activity_level].emoji} {activityLabels[userData.activity_level][language === 'it' ? 'it' : 'en']}
                  </p>
                </div>
              </div>
            )}

            {userData.wellness_interests && userData.wellness_interests.length > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-[#F8F6F3] rounded-lg md:col-span-2">
                <Sparkles className="w-5 h-5 text-[#C44D38] mt-0.5" />
                <div>
                  <p className="text-xs text-[#595959] mb-2">{language === 'it' ? 'Interessi benessere' : 'Wellness interests'}</p>
                  <div className="flex flex-wrap gap-2">
                    {userData.wellness_interests.map(interest => (
                      <span key={interest} className="px-3 py-1 bg-white rounded-full text-sm">
                        {wellnessLabels[interest]?.emoji} {wellnessLabels[interest]?.[language === 'it' ? 'it' : 'en']}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AstrologicalProfile;
