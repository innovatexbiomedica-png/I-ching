import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Search, ChevronRight, ArrowLeft } from 'lucide-react';

const API = `${(process.env.REACT_APP_BACKEND_URL || "https://iching-backend-ac3n.onrender.com")}/api`;

const Library = () => {
  const { language, getToken } = useAuth();
  const { hexagramId } = useParams();
  const [hexagrams, setHexagrams] = useState([]);
  const [selectedHexagram, setSelectedHexagram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [trigrams, setTrigrams] = useState([]);
  const [activeTab, setActiveTab] = useState('hexagrams'); // 'hexagrams', 'trigrams', 'guide'

  useEffect(() => {
    fetchHexagrams();
    fetchTrigrams();
  }, []);

  useEffect(() => {
    if (hexagramId) {
      fetchHexagramDetail(hexagramId);
    } else {
      setSelectedHexagram(null);
    }
  }, [hexagramId]);

  const fetchHexagrams = async () => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API}/library/hexagrams`, { headers });
      setHexagrams(response.data);
    } catch (error) {
      console.error('Error fetching hexagrams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrigrams = async () => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API}/library/trigrams`, { headers });
      setTrigrams(response.data);
    } catch (error) {
      console.error('Error fetching trigrams:', error);
    }
  };

  const fetchHexagramDetail = async (id) => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API}/library/hexagrams/${id}`, { headers });
      setSelectedHexagram(response.data);
    } catch (error) {
      console.error('Error fetching hexagram detail:', error);
    }
  };

  const filteredHexagrams = hexagrams.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.chinese.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.number.toString().includes(searchTerm)
  );

  // Detail View
  if (selectedHexagram) {
    return (
      <div className="page-container">
        <div className="content-container">
          {/* Back Button */}
          <Link 
            to="/library" 
            className="inline-flex items-center text-[#C44D38] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'it' ? 'Torna alla Biblioteca' : 'Back to Library'}
          </Link>

          <div className="zen-card">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {selectedHexagram.trigram_above?.symbol}{selectedHexagram.trigram_below?.symbol}
              </div>
              <h1 className="font-serif text-3xl text-[#2C2C2C] mb-2">
                {selectedHexagram.number}. {selectedHexagram.name}
              </h1>
              <p className="text-xl text-[#8A8680]">{selectedHexagram.chinese}</p>
              {selectedHexagram.chinese_name && (
                <p className="text-lg text-[#C44D38]">{selectedHexagram.chinese_name}</p>
              )}
            </div>

            {/* Trigrams */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#F8F6F3] rounded-xl p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-[#8A8680] mb-2">
                  {language === 'it' ? 'Trigramma Superiore' : 'Upper Trigram'}
                </p>
                <span className="text-3xl">{selectedHexagram.trigram_above?.symbol}</span>
                <p className="font-medium text-[#2C2C2C]">{selectedHexagram.trigram_above?.name}</p>
                <p className="text-sm text-[#595959]">{selectedHexagram.trigram_above?.attribute}</p>
              </div>
              <div className="bg-[#F8F6F3] rounded-xl p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-[#8A8680] mb-2">
                  {language === 'it' ? 'Trigramma Inferiore' : 'Lower Trigram'}
                </p>
                <span className="text-3xl">{selectedHexagram.trigram_below?.symbol}</span>
                <p className="font-medium text-[#2C2C2C]">{selectedHexagram.trigram_below?.name}</p>
                <p className="text-sm text-[#595959]">{selectedHexagram.trigram_below?.attribute}</p>
              </div>
            </div>

            {/* Judgment */}
            {selectedHexagram.giudizio && (
              <div className="mb-6">
                <h3 className="font-serif text-lg text-[#C44D38] mb-2">
                  {language === 'it' ? 'Il Giudizio' : 'The Judgment'}
                </h3>
                <p className="text-[#2C2C2C] italic bg-[#F8F6F3] p-4 rounded-lg">
                  "{selectedHexagram.giudizio}"
                </p>
              </div>
            )}

            {/* Image */}
            {selectedHexagram.immagine && (
              <div className="mb-6">
                <h3 className="font-serif text-lg text-[#C44D38] mb-2">
                  {language === 'it' ? "L'Immagine" : 'The Image'}
                </h3>
                <p className="text-[#2C2C2C] italic bg-[#F8F6F3] p-4 rounded-lg">
                  "{selectedHexagram.immagine}"
                </p>
              </div>
            )}

            {/* Commentary */}
            {selectedHexagram.commento && (
              <div className="mb-6">
                <h3 className="font-serif text-lg text-[#C44D38] mb-2">
                  {language === 'it' ? 'Commento' : 'Commentary'}
                </h3>
                <p className="text-[#595959]">{selectedHexagram.commento}</p>
              </div>
            )}

            {/* Lines */}
            {selectedHexagram.lines && selectedHexagram.lines.length > 0 && (
              <div>
                <h3 className="font-serif text-lg text-[#C44D38] mb-4">
                  {language === 'it' ? 'Le Linee' : 'The Lines'}
                </h3>
                <div className="space-y-4">
                  {selectedHexagram.lines.map((line, idx) => (
                    <div key={idx} className="border-l-4 border-[#D1CDC7] pl-4">
                      <p className="text-xs uppercase tracking-wider text-[#8A8680] mb-1">
                        {language === 'it' ? `Linea ${line.position}` : `Line ${line.position}`}
                      </p>
                      {line.text && (
                        <p className="text-[#2C2C2C] italic mb-1">"{line.text}"</p>
                      )}
                      {line.meaning && (
                        <p className="text-sm text-[#595959]">{line.meaning}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consult Button */}
            <div className="mt-8 text-center">
              <Link 
                to="/consultation"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>{language === 'it' ? 'Fai una Consultazione' : 'Make a Consultation'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C44D38] flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl text-[#2C2C2C] mb-2">
            {language === 'it' ? 'Biblioteca dell\'I Ching' : 'I Ching Library'}
          </h1>
          <p className="text-[#595959]">
            {language === 'it' 
              ? 'Esplora tutti i 64 esagrammi e i loro significati'
              : 'Explore all 64 hexagrams and their meanings'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { id: 'hexagrams', label: language === 'it' ? 'Esagrammi' : 'Hexagrams', count: 64 },
            { id: 'trigrams', label: language === 'it' ? 'Trigrammi' : 'Trigrams', count: 8 },
            { id: 'guide', label: language === 'it' ? 'Guida' : 'Guide' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#C44D38] text-white'
                  : 'bg-[#E5E0D8] text-[#595959] hover:bg-[#D1CDC7]'
              }`}
            >
              {tab.label} {tab.count && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Hexagrams Tab */}
        {activeTab === 'hexagrams' && (
          <>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8A8680] w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'it' ? 'Cerca esagramma...' : 'Search hexagram...'}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#E5E0D8] focus:border-[#C44D38] focus:outline-none bg-white"
              />
            </div>

            {/* Hexagrams Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="aspect-square bg-[#E5E0D8] rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
                {filteredHexagrams.map(hex => (
                  <Link
                    key={hex.number}
                    to={`/library/${hex.number}`}
                    className="aspect-square flex flex-col items-center justify-center p-2 rounded-xl border-2 border-[#E5E0D8] hover:border-[#C44D38] hover:bg-[#C44D38]/5 transition-all group"
                  >
                    <span className="text-lg md:text-xl text-[#8A8680] group-hover:text-[#C44D38]">
                      {hex.trigram_above}{hex.trigram_below}
                    </span>
                    <span className="font-bold text-[#2C2C2C] text-sm">{hex.number}</span>
                    <span className="text-[8px] md:text-[10px] text-[#595959] text-center line-clamp-1">
                      {hex.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Trigrams Tab */}
        {activeTab === 'trigrams' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trigrams.map((trigram, idx) => (
              <div key={idx} className="zen-card text-center">
                <span className="text-5xl mb-2 block">{trigram.symbol}</span>
                <h3 className="font-serif text-lg text-[#2C2C2C]">{trigram.name}</h3>
                <p className="text-sm text-[#C44D38] mb-2">{trigram.attribute}</p>
                <div className="text-xs text-[#595959] space-y-1">
                  <p><span className="font-medium">{language === 'it' ? 'Natura:' : 'Nature:'}</span> {trigram.nature}</p>
                  <p><span className="font-medium">{language === 'it' ? 'Famiglia:' : 'Family:'}</span> {trigram.family}</p>
                  <p><span className="font-medium">{language === 'it' ? 'Corpo:' : 'Body:'}</span> {trigram.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="zen-card">
              <h3 className="font-serif text-xl text-[#2C2C2C] mb-4">
                {language === 'it' ? 'Cos\'è l\'I Ching?' : 'What is the I Ching?'}
              </h3>
              <p className="text-[#595959] mb-4">
                {language === 'it' 
                  ? 'L\'I Ching (易經), o "Libro dei Mutamenti", è un antico testo cinese di divinazione risalente a oltre 3000 anni fa. È uno dei più antichi classici cinesi e uno dei testi fondamentali del Confucianesimo e del Taoismo.'
                  : 'The I Ching (易經), or "Book of Changes", is an ancient Chinese divination text dating back over 3000 years. It is one of the oldest Chinese classics and a foundational text of Confucianism and Taoism.'}
              </p>
            </div>

            <div className="zen-card">
              <h3 className="font-serif text-xl text-[#2C2C2C] mb-4">
                {language === 'it' ? 'Come funziona?' : 'How does it work?'}
              </h3>
              <p className="text-[#595959] mb-4">
                {language === 'it'
                  ? 'L\'I Ching si basa su 64 esagrammi, figure composte da sei linee che possono essere intere (Yang) o spezzate (Yin). Ogni esagramma rappresenta una situazione o un archetipo della vita.'
                  : 'The I Ching is based on 64 hexagrams, figures composed of six lines that can be solid (Yang) or broken (Yin). Each hexagram represents a life situation or archetype.'}
              </p>
            </div>

            <div className="zen-card">
              <h3 className="font-serif text-xl text-[#2C2C2C] mb-4">
                {language === 'it' ? 'Come lanciare le monete' : 'How to toss the coins'}
              </h3>
              <div className="space-y-3 text-[#595959]">
                <p>1. {language === 'it' ? 'Prendi 3 monete uguali' : 'Take 3 identical coins'}</p>
                <p>2. {language === 'it' ? 'Concentrati sulla tua domanda' : 'Focus on your question'}</p>
                <p>3. {language === 'it' ? 'Lancia le monete 6 volte' : 'Toss the coins 6 times'}</p>
                <p>4. {language === 'it' ? 'Testa = 3, Croce = 2' : 'Heads = 3, Tails = 2'}</p>
                <p>5. {language === 'it' ? 'Somma i valori delle 3 monete (6, 7, 8 o 9)' : 'Sum the values of the 3 coins (6, 7, 8 or 9)'}</p>
              </div>
              <div className="mt-4 p-4 bg-[#F8F6F3] rounded-lg">
                <p className="text-sm font-medium text-[#2C2C2C] mb-2">
                  {language === 'it' ? 'Significato dei valori:' : 'Value meanings:'}
                </p>
                <ul className="text-sm text-[#595959] space-y-1">
                  <li><span className="font-medium">6</span> - {language === 'it' ? 'Linea Yin mutevole (vecchio Yin)' : 'Changing Yin line (old Yin)'}</li>
                  <li><span className="font-medium">7</span> - {language === 'it' ? 'Linea Yang stabile (giovane Yang)' : 'Stable Yang line (young Yang)'}</li>
                  <li><span className="font-medium">8</span> - {language === 'it' ? 'Linea Yin stabile (giovane Yin)' : 'Stable Yin line (young Yin)'}</li>
                  <li><span className="font-medium">9</span> - {language === 'it' ? 'Linea Yang mutevole (vecchio Yang)' : 'Changing Yang line (old Yang)'}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
