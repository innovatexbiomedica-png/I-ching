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
  Moon
} from 'lucide-react';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NatalChart = () => {
  const { language, getToken, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    planets: true,
    houses: false,
    aspects: true
  });
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    birth_date: '',
    birth_time: '',
    birth_place: ''
  });

  useEffect(() => {
    fetchSavedChart();
  }, []);

  const fetchSavedChart = async () => {
    try {
      const response = await axios.get(`${API}/natal-chart`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (response.data.has_chart) {
        setChartData(response.data.chart);
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
    if (chartData?.chart_svg) {
      const blob = new Blob([chartData.chart_svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tema_natale_${formData.name || 'chart'}.svg`;
      a.click();
      URL.revokeObjectURL(url);
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
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{language === 'it' ? 'Rigenera' : 'Regenerate'}</span>
              </Button>
              {chartData.chart_svg && (
                <Button 
                  variant="outline"
                  onClick={downloadSVG}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'it' ? 'Scarica SVG' : 'Download SVG'}</span>
                </Button>
              )}
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

            {/* Grafico SVG */}
            {chartData.chart_svg && (
              <div className="zen-card">
                <h3 className="font-serif text-xl text-[#2C2C2C] mb-4 text-center">
                  {language === 'it' ? 'Ruota Zodiacale' : 'Zodiac Wheel'}
                </h3>
                <div 
                  className="w-full max-w-2xl mx-auto"
                  dangerouslySetInnerHTML={{ __html: chartData.chart_svg }}
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
                  <div className="mt-4 space-y-3">
                    {chartData.aspects.map((aspect, idx) => {
                      const aspectColors = {
                        conjunction: 'bg-purple-100 border-purple-300',
                        sextile: 'bg-green-100 border-green-300',
                        square: 'bg-red-100 border-red-300',
                        trine: 'bg-blue-100 border-blue-300',
                        opposition: 'bg-orange-100 border-orange-300'
                      };
                      
                      return (
                        <div key={idx} className={`p-3 rounded-lg border ${aspectColors[aspect.aspect] || 'bg-gray-100'}`}>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-xl">{aspect.planet1_symbol}</span>
                            <span className="text-lg">{aspect.aspect_symbol}</span>
                            <span className="text-xl">{aspect.planet2_symbol}</span>
                            <span className="text-sm text-[#595959]">
                              ({aspect.angle}° ± {aspect.orb}°)
                            </span>
                          </div>
                          <p className="text-sm text-[#595959]">{aspect.interpretation}</p>
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
