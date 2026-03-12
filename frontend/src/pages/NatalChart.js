import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Star, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Wand2,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import InteractiveNatalChart from '../components/InteractiveNatalChart';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NatalChart = () => {
  const { language, getToken, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingInterpretation, setGeneratingInterpretation] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [aiInterpretation, setAiInterpretation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    planets: true,
    houses: false,
    aspects: true,
    interpretation: true
  });
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    birth_date: '',
    birth_time: '',
    birth_place: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch profile data first
      const profileResponse = await axios.get(`${API}/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const profileData = profileResponse.data;
      const profile = profileData.profile || {};
      setProfileData(profileData);
      
      // Pre-fill form with profile data if available
      const birthDate = profile.birth_date || '';
      const birthTime = profile.birth_time || '';
      const birthPlace = profile.birth_place || '';
      
      setFormData({
        name: profileData.name || user?.name || '',
        birth_date: birthDate,
        birth_time: birthTime,
        birth_place: birthPlace
      });
      
      // Fetch saved natal chart
      const chartResponse = await axios.get(`${API}/natal-chart`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (chartResponse.data.has_chart) {
        setChartData(chartResponse.data.chart);
        setShowForm(false);
      } else {
        // No chart exists - check if we have profile data to auto-generate
        if (birthDate && birthTime && birthPlace) {
          // Auto-generate with profile data
          await generateChartFromProfile({
            name: profileData.name,
            birth_date: birthDate,
            birth_time: birthTime,
            birth_place: birthPlace
          });
        } else {
          setShowForm(true);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  const generateChartFromProfile = async (profile) => {
    setGenerating(true);
    try {
      const response = await axios.post(
        `${API}/natal-chart/generate`,
        {
          name: profile.name || user?.name || '',
          birth_date: profile.birth_date,
          birth_time: profile.birth_time,
          birth_place: profile.birth_place
        },
        { headers: { Authorization: `Bearer ${getToken()}` }}
      );
      setChartData(response.data);
      setShowForm(false);
      toast.success(language === 'it' ? 'Tema natale generato automaticamente!' : 'Natal chart auto-generated!');
    } catch (error) {
      console.error('Error auto-generating chart:', error);
      setShowForm(true);
    } finally {
      setGenerating(false);
    }
  };

  const fetchSavedChart = async () => {
    try {
      const response = await axios.get(`${API}/natal-chart`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (response.data.has_chart) {
        setChartData(response.data.chart);
        // Carica anche l'interpretazione AI se presente
        if (response.data.chart.ai_interpretation) {
          setAiInterpretation(response.data.chart.ai_interpretation);
        }
      } else {
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error fetching natal chart:', error);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  // Genera interpretazione AI
  const generateAIInterpretation = async () => {
    setGeneratingInterpretation(true);
    try {
      const response = await axios.post(
        `${API}/natal-chart/interpret`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` }}
      );
      
      if (response.data.success) {
        setAiInterpretation(response.data.interpretation);
        toast.success(language === 'it' 
          ? 'Interpretazione generata con successo!' 
          : 'Interpretation generated successfully!');
      }
    } catch (error) {
      console.error('Error generating interpretation:', error);
      toast.error(error.response?.data?.detail || 'Error generating interpretation');
    } finally {
      setGeneratingInterpretation(false);
    }
  };

  const generateChart = async () => {
    if (!formData.birth_date || !formData.birth_time || !formData.birth_place) {
      toast.error(language === 'it' 
        ? 'Compila tutti i campi obbligatori' 
        : 'Fill all required fields');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post(
        `${API}/natal-chart/generate`,
        formData,
        { headers: { Authorization: `Bearer ${getToken()}` }}
      );
      setChartData(response.data);
      setShowForm(false);
      toast.success(language === 'it' ? 'Tema natale generato!' : 'Natal chart generated!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error generating chart');
    } finally {
      setGenerating(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const downloadSVG = () => {
    console.log('downloadSVG called, chartData:', chartData);
    console.log('chart_svg exists:', !!chartData?.chart_svg);
    
    if (chartData?.chart_svg) {
      try {
        const svgContent = chartData.chart_svg;
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tema_natale_${formData.name || chartData?.subject?.name || 'chart'}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(language === 'it' ? 'SVG scaricato!' : 'SVG downloaded!');
      } catch (error) {
        console.error('Error downloading SVG:', error);
        toast.error(language === 'it' ? 'Errore nel download SVG' : 'Error downloading SVG');
      }
    } else {
      console.error('No SVG data available');
      toast.error(language === 'it' ? 'Nessun grafico SVG disponibile' : 'No SVG chart available');
    }
  };

  const downloadPDF = async () => {
    try {
      toast.loading(language === 'it' ? 'Generazione PDF in corso...' : 'Generating PDF...', { id: 'pdf-loading' });
      
      const response = await axios.get(`${API}/natal-chart/pdf`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob'
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tema_natale_${formData.name || 'chart'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success(language === 'it' ? 'PDF scaricato!' : 'PDF downloaded!', { id: 'pdf-loading' });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error(
        language === 'it' 
          ? 'Errore nella generazione del PDF' 
          : 'Error generating PDF',
        { id: 'pdf-loading' }
      );
    }
  };

  if (loading || generating) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#C44D38] mb-4" />
            <p className="text-[#595959]">
              {generating 
                ? (language === 'it' ? 'Generazione tema natale in corso...' : 'Generating natal chart...')
                : (language === 'it' ? 'Caricamento...' : 'Loading...')
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container max-w-5xl">
        {/* Header */}
        <Link 
          to="/profile/astrology" 
          className="flex items-center space-x-2 text-[#595959] hover:text-[#2C2C2C] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'it' ? 'Torna al Profilo Astrologico' : 'Back to Astrological Profile'}</span>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[#2C2C2C] mb-2 flex items-center space-x-3">
              <Star className="w-8 h-8 text-[#C44D38]" />
              <span>{language === 'it' ? 'Tema Natale' : 'Natal Chart'}</span>
            </h1>
            <p className="text-[#595959]">
              {language === 'it' 
                ? 'La mappa del cielo al momento della tua nascita'
                : 'The map of the sky at the moment of your birth'}
            </p>
          </div>
          {chartData && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{language === 'it' ? 'Rigenera' : 'Regenerate'}</span>
              </Button>
              {chartData?.chart_svg && (
                <Button 
                  variant="outline"
                  onClick={downloadSVG}
                  className="flex items-center space-x-2 border-green-500 text-green-600 hover:bg-green-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'it' ? 'Scarica SVG' : 'Download SVG'}</span>
                </Button>
              )}
              <Button 
                onClick={downloadPDF}
                className="flex items-center space-x-2 bg-[#C44D38] text-white hover:bg-[#A33D2B]"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'it' ? 'Scarica PDF' : 'Download PDF'}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Form per generare il tema natale */}
        {showForm && (
          <div className="zen-card mb-8 animate-fade-in-up">
            <h2 className="font-serif text-xl text-[#2C2C2C] mb-4">
              {language === 'it' ? 'Genera il tuo Tema Natale' : 'Generate your Natal Chart'}
            </h2>
            <p className="text-sm text-[#595959] mb-6">
              {language === 'it' 
                ? 'Inserisci i tuoi dati di nascita per calcolare la posizione esatta dei pianeti'
                : 'Enter your birth data to calculate the exact position of the planets'}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  👤 {language === 'it' ? 'Nome (opzionale)' : 'Name (optional)'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E0D8] rounded-lg bg-[#F8F6F3] focus:border-[#C44D38] focus:ring-1 focus:ring-[#C44D38]"
                  placeholder={user?.name || ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  📅 {language === 'it' ? 'Data di Nascita *' : 'Birth Date *'}
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E0D8] rounded-lg bg-[#F8F6F3] focus:border-[#C44D38] focus:ring-1 focus:ring-[#C44D38]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  ⏰ {language === 'it' ? 'Orario di Nascita *' : 'Birth Time *'}
                </label>
                <input
                  type="time"
                  value={formData.birth_time}
                  onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E0D8] rounded-lg bg-[#F8F6F3] focus:border-[#C44D38] focus:ring-1 focus:ring-[#C44D38]"
                  required
                />
                <p className="text-xs text-[#595959] mt-1">
                  {language === 'it' 
                    ? "L'orario è fondamentale per calcolare l'Ascendente"
                    : "Time is essential to calculate the Ascendant"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                  📍 {language === 'it' ? 'Luogo di Nascita *' : 'Birth Place *'}
                </label>
                <input
                  type="text"
                  value={formData.birth_place}
                  onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                  placeholder={language === 'it' ? 'Es: Roma, Italia' : 'E.g.: Rome, Italy'}
                  className="w-full px-4 py-3 border border-[#E5E0D8] rounded-lg bg-[#F8F6F3] focus:border-[#C44D38] focus:ring-1 focus:ring-[#C44D38]"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={generateChart}
                disabled={generating}
                className="btn-primary flex items-center space-x-2"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{language === 'it' ? 'Genera Tema Natale' : 'Generate Natal Chart'}</span>
              </Button>
              {chartData && (
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  {language === 'it' ? 'Annulla' : 'Cancel'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Visualizzazione del Tema Natale */}
        {chartData && !showForm && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Info nascita */}
            <div className="zen-card bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span className="text-[#2C2C2C]">{chartData.subject?.birth_date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span className="text-[#2C2C2C]">{chartData.subject?.birth_time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <span className="text-[#2C2C2C]">{chartData.subject?.birth_place}</span>
                </div>
              </div>
            </div>

            {/* Grafico SVG Interattivo */}
            {chartData.chart_svg && (
              <div className="zen-card">
                <h3 className="font-serif text-xl text-[#2C2C2C] mb-4 text-center">
                  {language === 'it' ? 'Ruota Zodiacale Interattiva' : 'Interactive Zodiac Wheel'}
                </h3>
                <InteractiveNatalChart 
                  svgContent={chartData.chart_svg}
                  houses={chartData.houses}
                  language={language}
                />
              </div>
            )}

            {/* Ascendente e MC */}
            <div className="grid md:grid-cols-2 gap-4">
              {chartData.ascendant && (
                <div className="zen-card bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-4xl">{chartData.ascendant.sign_symbol}</span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-orange-600 font-medium">
                        {language === 'it' ? 'Ascendente' : 'Ascendant'}
                      </p>
                      <h3 className="font-serif text-2xl text-[#2C2C2C]">
                        {chartData.ascendant.sign}
                      </h3>
                      <p className="text-sm text-[#595959]">{chartData.ascendant.degree_formatted}</p>
                    </div>
                  </div>
                  {chartData.ascendant.interpretation && (
                    <p className="text-sm text-[#2C2C2C] leading-relaxed">
                      {chartData.ascendant.interpretation}
                    </p>
                  )}
                </div>
              )}

              {chartData.midheaven && (
                <div className="zen-card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-4xl">{chartData.midheaven.sign_symbol}</span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-blue-600 font-medium">
                        Medio Cielo (MC)
                      </p>
                      <h3 className="font-serif text-2xl text-[#2C2C2C]">
                        {chartData.midheaven.sign}
                      </h3>
                      <p className="text-sm text-[#595959]">{chartData.midheaven.degree_formatted}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#595959]">
                    {language === 'it' 
                      ? 'Il punto più alto del cielo al momento della nascita, indica la tua vocazione e aspirazioni pubbliche.'
                      : 'The highest point in the sky at birth, indicates your vocation and public aspirations.'}
                  </p>
                </div>
              )}
            </div>

            {/* Posizioni Planetarie */}
            <div className="zen-card">
              <button
                onClick={() => toggleSection('planets')}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="font-serif text-xl text-[#2C2C2C] flex items-center space-x-2">
                  <Sun className="w-5 h-5 text-[#C44D38]" />
                  <span>{language === 'it' ? 'Posizioni Planetarie' : 'Planetary Positions'}</span>
                </h3>
                {expandedSections.planets ? (
                  <ChevronUp className="w-5 h-5 text-[#595959]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#595959]" />
                )}
              </button>

              {expandedSections.planets && chartData.planets && (
                <div className="mt-4 space-y-4">
                  {chartData.planets.map((planet, idx) => (
                    <div key={idx} className="p-4 bg-[#F8F6F3] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{planet.symbol}</span>
                          <div>
                            <p className="font-medium text-[#2C2C2C]">
                              {planet.name_it || planet.name}
                              {planet.retrograde && <span className="text-red-500 ml-1">℞</span>}
                            </p>
                            <p className="text-sm text-[#595959]">
                              {planet.sign_symbol} {planet.sign} • {planet.degree_formatted}
                              {planet.house && ` • Casa ${planet.house}`}
                            </p>
                          </div>
                        </div>
                      </div>
                      {planet.interpretation && (
                        <p className="text-sm text-[#595959] mt-2 pl-11">
                          {planet.interpretation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aspetti */}
            {chartData.aspects && chartData.aspects.length > 0 && (
              <div className="zen-card">
                <button
                  onClick={() => toggleSection('aspects')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="font-serif text-xl text-[#2C2C2C] flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-[#C44D38]" />
                    <span>{language === 'it' ? 'Aspetti Planetari' : 'Planetary Aspects'}</span>
                  </h3>
                  {expandedSections.aspects ? (
                    <ChevronUp className="w-5 h-5 text-[#595959]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#595959]" />
                  )}
                </button>

                {expandedSections.aspects && (
                  <div className="mt-4 space-y-4">
                    {chartData.aspects.map((aspect, idx) => {
                      const aspectStyles = {
                        conjunction: {
                          bg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
                          border: 'border-purple-200',
                          badge: 'bg-purple-500',
                          icon: '☌'
                        },
                        sextile: {
                          bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
                          border: 'border-green-200',
                          badge: 'bg-green-500',
                          icon: '⚹'
                        },
                        square: {
                          bg: 'bg-gradient-to-br from-red-50 to-orange-50',
                          border: 'border-red-200',
                          badge: 'bg-red-500',
                          icon: '□'
                        },
                        trine: {
                          bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
                          border: 'border-blue-200',
                          badge: 'bg-blue-500',
                          icon: '△'
                        },
                        opposition: {
                          bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
                          border: 'border-orange-200',
                          badge: 'bg-orange-500',
                          icon: '☍'
                        }
                      };
                      
                      const style = aspectStyles[aspect.aspect] || aspectStyles.conjunction;
                      const isHarmonic = aspect.aspect_nature === 'armonico';
                      const isDynamic = aspect.aspect_nature === 'dinamico';
                      
                      return (
                        <div key={idx} className={`p-4 rounded-xl border-2 ${style.bg} ${style.border} transition-all hover:shadow-md`}>
                          {/* Header con pianeti e tipo di aspetto */}
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                                <span className="text-2xl">{aspect.planet1_symbol}</span>
                                <span className="font-medium text-[#2C2C2C]">
                                  {aspect.planet1_name || aspect.planet1}
                                </span>
                              </div>
                              <span className={`w-8 h-8 rounded-full ${style.badge} text-white flex items-center justify-center text-lg font-bold shadow-md`}>
                                {style.icon}
                              </span>
                              <div className="flex items-center space-x-1 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                                <span className="text-2xl">{aspect.planet2_symbol}</span>
                                <span className="font-medium text-[#2C2C2C]">
                                  {aspect.planet2_name || aspect.planet2}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {isHarmonic && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                  {language === 'it' ? '✨ Armonico' : '✨ Harmonic'}
                                </span>
                              )}
                              {isDynamic && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                  {language === 'it' ? '⚡ Dinamico' : '⚡ Dynamic'}
                                </span>
                              )}
                              <span className="text-xs text-[#595959] bg-white/60 px-2 py-1 rounded">
                                {aspect.angle}° ± {aspect.orb}°
                              </span>
                            </div>
                          </div>
                          
                          {/* Nome dell'aspetto */}
                          <h4 className="font-serif text-lg text-[#2C2C2C] mb-2">
                            {aspect.aspect_name || aspect.aspect}
                          </h4>
                          
                          {/* Interpretazione dettagliata */}
                          {aspect.interpretation && (
                            <div className="bg-white/60 rounded-lg p-3">
                              <p className="text-sm text-[#595959] leading-relaxed">
                                {aspect.interpretation}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Case */}
            {chartData.houses && chartData.houses.length > 0 && (
              <div className="zen-card">
                <button
                  onClick={() => toggleSection('houses')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="font-serif text-xl text-[#2C2C2C] flex items-center space-x-2">
                    <Moon className="w-5 h-5 text-[#C44D38]" />
                    <span>{language === 'it' ? 'Le 12 Case' : 'The 12 Houses'}</span>
                  </h3>
                  {expandedSections.houses ? (
                    <ChevronUp className="w-5 h-5 text-[#595959]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#595959]" />
                  )}
                </button>

                {expandedSections.houses && (
                  <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {chartData.houses.map((house, idx) => (
                      <div key={idx} className="p-3 bg-[#F8F6F3] rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#2C2C2C]">
                            {language === 'it' ? 'Casa' : 'House'} {house.number}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{house.sign_symbol}</span>
                            <span className="text-sm text-[#595959]">{house.degree_formatted}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NatalChart;
