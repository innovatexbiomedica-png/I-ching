import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move, Info, X } from 'lucide-react';

// Descrizioni delle 12 Case Astrologiche
const HOUSE_DESCRIPTIONS = {
  it: {
    1: {
      name: "Casa I - L'Ascendente",
      emoji: "🌅",
      theme: "Identità e Apparenza",
      description: "Rappresenta la tua personalità esteriore, l'aspetto fisico, la prima impressione che fai sugli altri e il modo in cui ti presenti al mondo. È la maschera che indossi nella vita quotidiana.",
      keywords: ["Identità", "Aspetto fisico", "Prima impressione", "Personalità", "Inizio"]
    },
    2: {
      name: "Casa II - I Beni",
      emoji: "💰",
      theme: "Risorse e Valori",
      description: "Governa le tue finanze personali, i possedimenti materiali, i talenti naturali e il senso di autostima. Indica come guadagni e gestisci il denaro.",
      keywords: ["Denaro", "Possedimenti", "Valori", "Autostima", "Talenti"]
    },
    3: {
      name: "Casa III - La Comunicazione",
      emoji: "💬",
      theme: "Mente e Ambiente",
      description: "Riguarda la comunicazione, l'apprendimento, i fratelli e sorelle, i vicini e i viaggi brevi. Rappresenta come pensi, parli e ti muovi nel tuo ambiente immediato.",
      keywords: ["Comunicazione", "Fratelli", "Viaggi brevi", "Studio", "Mente"]
    },
    4: {
      name: "Casa IV - Il Fondo Cielo",
      emoji: "🏠",
      theme: "Casa e Famiglia",
      description: "Rappresenta la tua casa, la famiglia d'origine, le radici, la fine delle cose e la vita privata. È il tuo rifugio interiore e le fondamenta emotive.",
      keywords: ["Casa", "Famiglia", "Radici", "Vita privata", "Madre"]
    },
    5: {
      name: "Casa V - La Creatività",
      emoji: "🎨",
      theme: "Espressione e Piacere",
      description: "Governa la creatività, i figli, il romanticismo, il divertimento, i giochi e la speculazione. È dove esprimi la tua gioia di vivere.",
      keywords: ["Creatività", "Figli", "Romance", "Divertimento", "Arte"]
    },
    6: {
      name: "Casa VI - Il Servizio",
      emoji: "⚕️",
      theme: "Salute e Lavoro",
      description: "Riguarda la salute, il lavoro quotidiano, le abitudini, i colleghi e gli animali domestici. Rappresenta il servizio agli altri e la routine.",
      keywords: ["Salute", "Lavoro", "Routine", "Servizio", "Abitudini"]
    },
    7: {
      name: "Casa VII - Il Discendente",
      emoji: "💑",
      theme: "Relazioni e Partnership",
      description: "Rappresenta il matrimonio, le partnership, i contratti e i nemici dichiarati. Mostra cosa cerchi negli altri e come ti relazioni.",
      keywords: ["Matrimonio", "Partner", "Contratti", "Relazioni", "Altri"]
    },
    8: {
      name: "Casa VIII - La Trasformazione",
      emoji: "🦋",
      theme: "Rinascita e Mistero",
      description: "Governa la trasformazione, la morte e rinascita, l'eredità, la sessualità profonda e le risorse condivise. È il regno del mistero e dell'occulto.",
      keywords: ["Trasformazione", "Eredità", "Sessualità", "Mistero", "Rinascita"]
    },
    9: {
      name: "Casa IX - L'Espansione",
      emoji: "🌍",
      theme: "Filosofia e Viaggi",
      description: "Riguarda i viaggi lunghi, l'istruzione superiore, la filosofia, la religione e le culture straniere. È la ricerca di significato e verità.",
      keywords: ["Viaggi", "Filosofia", "Università", "Spiritualità", "Cultura"]
    },
    10: {
      name: "Casa X - Il Medio Cielo",
      emoji: "👑",
      theme: "Carriera e Status",
      description: "Rappresenta la carriera, la reputazione pubblica, l'ambizione, il padre e l'autorità. È il punto più alto del cielo, le tue aspirazioni.",
      keywords: ["Carriera", "Reputazione", "Ambizione", "Status", "Padre"]
    },
    11: {
      name: "Casa XI - Le Amicizie",
      emoji: "🤝",
      theme: "Comunità e Speranze",
      description: "Governa le amicizie, i gruppi, le associazioni, le speranze e i sogni per il futuro. Rappresenta la tua rete sociale e gli ideali.",
      keywords: ["Amici", "Gruppi", "Speranze", "Futuro", "Ideali"]
    },
    12: {
      name: "Casa XII - L'Inconscio",
      emoji: "🌙",
      theme: "Spiritualità e Segreti",
      description: "Rappresenta l'inconscio, i segreti, l'isolamento, la spiritualità e il karma. È il regno dei sogni, delle paure nascoste e della trascendenza.",
      keywords: ["Inconscio", "Segreti", "Spiritualità", "Karma", "Sogni"]
    }
  },
  en: {
    1: {
      name: "House I - The Ascendant",
      emoji: "🌅",
      theme: "Identity and Appearance",
      description: "Represents your outer personality, physical appearance, first impression you make on others, and how you present yourself to the world.",
      keywords: ["Identity", "Physical appearance", "First impression", "Personality", "Beginning"]
    },
    2: {
      name: "House II - Possessions",
      emoji: "💰",
      theme: "Resources and Values",
      description: "Governs personal finances, material possessions, natural talents, and self-esteem. Indicates how you earn and manage money.",
      keywords: ["Money", "Possessions", "Values", "Self-worth", "Talents"]
    },
    3: {
      name: "House III - Communication",
      emoji: "💬",
      theme: "Mind and Environment",
      description: "Concerns communication, learning, siblings, neighbors, and short trips. Represents how you think, speak, and move in your immediate environment.",
      keywords: ["Communication", "Siblings", "Short trips", "Learning", "Mind"]
    },
    4: {
      name: "House IV - The IC",
      emoji: "🏠",
      theme: "Home and Family",
      description: "Represents your home, family of origin, roots, endings, and private life. It's your inner sanctuary and emotional foundations.",
      keywords: ["Home", "Family", "Roots", "Private life", "Mother"]
    },
    5: {
      name: "House V - Creativity",
      emoji: "🎨",
      theme: "Expression and Pleasure",
      description: "Governs creativity, children, romance, entertainment, games, and speculation. Where you express your joy of living.",
      keywords: ["Creativity", "Children", "Romance", "Fun", "Art"]
    },
    6: {
      name: "House VI - Service",
      emoji: "⚕️",
      theme: "Health and Work",
      description: "Concerns health, daily work, habits, colleagues, and pets. Represents service to others and daily routine.",
      keywords: ["Health", "Work", "Routine", "Service", "Habits"]
    },
    7: {
      name: "House VII - The Descendant",
      emoji: "💑",
      theme: "Relationships and Partnerships",
      description: "Represents marriage, partnerships, contracts, and open enemies. Shows what you seek in others and how you relate.",
      keywords: ["Marriage", "Partner", "Contracts", "Relationships", "Others"]
    },
    8: {
      name: "House VIII - Transformation",
      emoji: "🦋",
      theme: "Rebirth and Mystery",
      description: "Governs transformation, death and rebirth, inheritance, deep sexuality, and shared resources. The realm of mystery and occult.",
      keywords: ["Transformation", "Inheritance", "Sexuality", "Mystery", "Rebirth"]
    },
    9: {
      name: "House IX - Expansion",
      emoji: "🌍",
      theme: "Philosophy and Travel",
      description: "Concerns long journeys, higher education, philosophy, religion, and foreign cultures. The search for meaning and truth.",
      keywords: ["Travel", "Philosophy", "University", "Spirituality", "Culture"]
    },
    10: {
      name: "House X - The Midheaven",
      emoji: "👑",
      theme: "Career and Status",
      description: "Represents career, public reputation, ambition, father, and authority. The highest point in the sky, your aspirations.",
      keywords: ["Career", "Reputation", "Ambition", "Status", "Father"]
    },
    11: {
      name: "House XI - Friendships",
      emoji: "🤝",
      theme: "Community and Hopes",
      description: "Governs friendships, groups, associations, hopes, and dreams for the future. Represents your social network and ideals.",
      keywords: ["Friends", "Groups", "Hopes", "Future", "Ideals"]
    },
    12: {
      name: "House XII - The Unconscious",
      emoji: "🌙",
      theme: "Spirituality and Secrets",
      description: "Represents the unconscious, secrets, isolation, spirituality, and karma. The realm of dreams, hidden fears, and transcendence.",
      keywords: ["Unconscious", "Secrets", "Spirituality", "Karma", "Dreams"]
    }
  }
};

const InteractiveNatalChart = ({ svgContent, houses, language = 'it' }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showHouseInfo, setShowHouseInfo] = useState(false);
  
  const descriptions = HOUSE_DESCRIPTIONS[language] || HOUSE_DESCRIPTIONS.it;

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse/Touch drag
  const handleMouseDown = (e) => {
    if (e.target.closest('.zoom-controls') || e.target.closest('.house-info-panel')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  // Pinch zoom for mobile
  const [lastPinchDistance, setLastPinchDistance] = useState(null);
  
  const handlePinch = useCallback((e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (lastPinchDistance !== null) {
        const delta = (distance - lastPinchDistance) * 0.01;
        setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
      }
      setLastPinchDistance(distance);
    }
  }, [lastPinchDistance]);

  const handlePinchEnd = () => {
    setLastPinchDistance(null);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleTouchMove]);

  // Handle house selection
  const handleHouseClick = (houseNumber) => {
    setSelectedHouse(houseNumber);
    setShowHouseInfo(true);
  };

  return (
    <div className="relative">
      {/* Zoom Controls */}
      <div className="zoom-controls absolute top-4 right-4 z-20 flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={language === 'it' ? 'Zoom avanti' : 'Zoom in'}
        >
          <ZoomIn className="w-5 h-5 text-[#2C2C2C]" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={language === 'it' ? 'Zoom indietro' : 'Zoom out'}
        >
          <ZoomOut className="w-5 h-5 text-[#2C2C2C]" />
        </button>
        <div className="w-full h-px bg-gray-200" />
        <button
          onClick={handleReset}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={language === 'it' ? 'Reimposta vista' : 'Reset view'}
        >
          <RotateCcw className="w-5 h-5 text-[#2C2C2C]" />
        </button>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-1.5 text-sm text-[#595959]">
        {Math.round(scale * 100)}%
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-1.5 text-xs text-[#595959] flex items-center gap-2">
        <Move className="w-4 h-4" />
        {language === 'it' ? 'Trascina per muovere' : 'Drag to move'}
      </div>

      {/* SVG Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200"
        style={{ 
          height: '500px',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handlePinch}
        onTouchEnd={handlePinchEnd}
        onWheel={handleWheel}
      >
        <div
          ref={svgRef}
          className="absolute inset-0 flex items-center justify-center transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
        >
          <div 
            className="w-full max-w-lg"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      </div>

      {/* Houses Interactive Grid */}
      <div className="mt-6">
        <h4 className="font-serif text-lg text-[#2C2C2C] mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-500" />
          {language === 'it' ? 'Tocca una Casa per scoprire il suo significato' : 'Tap a House to discover its meaning'}
        </h4>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => {
            const house = houses?.find(h => h.number === num);
            const houseInfo = descriptions[num];
            return (
              <button
                key={num}
                onClick={() => handleHouseClick(num)}
                className={`p-3 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
                  selectedHouse === num 
                    ? 'bg-indigo-500 border-indigo-600 text-white shadow-lg' 
                    : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <div className="text-xl mb-1">{houseInfo?.emoji}</div>
                <div className="text-xs font-medium">
                  {language === 'it' ? 'Casa' : 'House'} {num}
                </div>
                {house && (
                  <div className="text-lg mt-1">{house.sign_symbol}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* House Info Panel */}
      {showHouseInfo && selectedHouse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-t-2xl">
              <button
                onClick={() => setShowHouseInfo(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="text-4xl mb-2">{descriptions[selectedHouse]?.emoji}</div>
              <h3 className="font-serif text-xl text-white">
                {descriptions[selectedHouse]?.name}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {descriptions[selectedHouse]?.theme}
              </p>
            </div>
            
            <div className="p-4 space-y-4">
              {/* House position in chart */}
              {houses?.find(h => h.number === selectedHouse) && (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                  <span className="text-3xl">
                    {houses.find(h => h.number === selectedHouse)?.sign_symbol}
                  </span>
                  <div>
                    <p className="text-xs text-indigo-600 font-medium">
                      {language === 'it' ? 'Nel tuo tema natale' : 'In your natal chart'}
                    </p>
                    <p className="font-medium text-[#2C2C2C]">
                      {houses.find(h => h.number === selectedHouse)?.sign}
                    </p>
                    <p className="text-sm text-[#595959]">
                      {houses.find(h => h.number === selectedHouse)?.degree_formatted}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Description */}
              <div>
                <h4 className="font-medium text-[#2C2C2C] mb-2">
                  {language === 'it' ? 'Significato' : 'Meaning'}
                </h4>
                <p className="text-[#595959] text-sm leading-relaxed">
                  {descriptions[selectedHouse]?.description}
                </p>
              </div>
              
              {/* Keywords */}
              <div>
                <h4 className="font-medium text-[#2C2C2C] mb-2">
                  {language === 'it' ? 'Parole chiave' : 'Keywords'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {descriptions[selectedHouse]?.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-xs font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InteractiveNatalChart;
