import React from 'react';
import { BookOpen, Sparkles, Quote, Mountain, Droplets, Flame, Wind, Cloud, Sun, Zap } from 'lucide-react';

// Trigram icons mapping
const getTrigramIcon = (element) => {
  const icons = {
    'Cielo': Sun,
    'Heaven': Sun,
    'Terra': Mountain,
    'Earth': Mountain,
    'Tuono': Zap,
    'Thunder': Zap,
    'Acqua': Droplets,
    'Water': Droplets,
    'Monte': Mountain,
    'Mountain': Mountain,
    'Vento/Legno': Wind,
    'Wind/Wood': Wind,
    'Fuoco': Flame,
    'Fire': Flame,
    'Lago': Cloud,
    'Lake': Cloud,
  };
  return icons[element] || Sun;
};

const TraditionalReading = ({ 
  hexagramNumber,
  hexagramName,
  hexagramChinese,
  traditionalData,
  derivedHexagramNumber,
  derivedHexagramName,
  derivedTraditionalData,
  movingLines,
  language = 'it' 
}) => {
  if (!traditionalData) return null;

  const labels = {
    it: {
      judgment: 'La Sentenza',
      image: 'L\'Immagine',
      commentary: 'Commento Taoista',
      movingLines: 'Le Linee Mutevoli',
      line: 'Linea',
      trigramAbove: 'Trigramma Superiore',
      trigramBelow: 'Trigramma Inferiore',
      derivedTitle: 'L\'Esagramma si Trasforma in',
      derivedMeaning: 'La situazione evolve verso',
    },
    en: {
      judgment: 'The Judgment',
      image: 'The Image',
      commentary: 'Taoist Commentary',
      movingLines: 'The Moving Lines',
      line: 'Line',
      trigramAbove: 'Upper Trigram',
      trigramBelow: 'Lower Trigram',
      derivedTitle: 'The Hexagram Transforms Into',
      derivedMeaning: 'The situation evolves toward',
    }
  };
  const t = labels[language] || labels.it;

  const TrigramAboveIcon = getTrigramIcon(traditionalData.trigram_above?.element);
  const TrigramBelowIcon = getTrigramIcon(traditionalData.trigram_below?.element);

  return (
    <div className="space-y-8" data-testid="traditional-reading">
      {/* Hexagram Header with Trigrams */}
      <div className="zen-card bg-gradient-to-b from-[#2C2C2C] to-[#3d3d3d] text-[#F9F7F2]">
        <div className="text-center mb-8">
          <p className="text-6xl font-serif mb-2">{hexagramChinese}</p>
          <h2 className="text-3xl font-serif">
            {hexagramNumber}. {hexagramName}
          </h2>
        </div>
        
        {/* Trigrams Display */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          {/* Upper Trigram */}
          <div className="text-center p-6 rounded-lg bg-white/10">
            <p className="text-xs uppercase tracking-wider text-[#E5E0D8] mb-3">{t.trigramAbove}</p>
            <div 
              className="text-5xl mb-2"
              style={{ color: traditionalData.trigram_above?.color || '#F9F7F2' }}
            >
              {traditionalData.trigram_above?.symbol}
            </div>
            <p className="font-serif text-lg" style={{ color: traditionalData.trigram_above?.color }}>
              {traditionalData.trigram_above?.name_local}
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2 text-sm text-[#E5E0D8]">
              <TrigramAboveIcon className="w-4 h-4" />
              <span>{traditionalData.trigram_above?.element}</span>
            </div>
            <p className="text-xs text-[#E5E0D8]/70 mt-1">
              {traditionalData.trigram_above?.quality}
            </p>
          </div>
          
          {/* Lower Trigram */}
          <div className="text-center p-6 rounded-lg bg-white/10">
            <p className="text-xs uppercase tracking-wider text-[#E5E0D8] mb-3">{t.trigramBelow}</p>
            <div 
              className="text-5xl mb-2"
              style={{ color: traditionalData.trigram_below?.color || '#F9F7F2' }}
            >
              {traditionalData.trigram_below?.symbol}
            </div>
            <p className="font-serif text-lg" style={{ color: traditionalData.trigram_below?.color }}>
              {traditionalData.trigram_below?.name_local}
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2 text-sm text-[#E5E0D8]">
              <TrigramBelowIcon className="w-4 h-4" />
              <span>{traditionalData.trigram_below?.element}</span>
            </div>
            <p className="text-xs text-[#E5E0D8]/70 mt-1">
              {traditionalData.trigram_below?.quality}
            </p>
          </div>
        </div>
      </div>

      {/* The Judgment */}
      {traditionalData.sentence && (
        <div className="zen-card border-l-4 border-[#C44D38]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#C44D38] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif text-xl text-[#2C2C2C]">{t.judgment}</h3>
          </div>
          <blockquote className="font-serif text-xl text-[#2C2C2C] italic pl-4 border-l-2 border-[#D1CDC7]">
            "{traditionalData.sentence}"
          </blockquote>
        </div>
      )}

      {/* The Image */}
      {traditionalData.image && (
        <div className="zen-card bg-[#E5E0D8]/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#8A9A5B] flex items-center justify-center">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif text-xl text-[#2C2C2C]">{t.image}</h3>
          </div>
          <p className="text-[#2C2C2C] leading-relaxed">
            {traditionalData.image}
          </p>
        </div>
      )}

      {/* Taoist Commentary */}
      {traditionalData.commentary && (
        <div className="zen-card bg-gradient-to-r from-[#F9F7F2] to-[#E5E0D8]/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#2C2C2C] flex items-center justify-center">
              <Quote className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif text-xl text-[#2C2C2C]">{t.commentary}</h3>
          </div>
          <p className="interpretation-text text-[#2C2C2C] leading-relaxed">
            {traditionalData.commentary}
          </p>
        </div>
      )}

      {/* Moving Lines */}
      {traditionalData.moving_lines_text && traditionalData.moving_lines_text.length > 0 && (
        <div className="zen-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#C44D38] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif text-xl text-[#2C2C2C]">{t.movingLines}</h3>
          </div>
          
          <div className="space-y-6">
            {traditionalData.moving_lines_text.map((line, idx) => (
              <div 
                key={idx} 
                className="relative pl-6 border-l-4 border-[#C44D38]"
              >
                <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-[#C44D38] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{line.position}</span>
                </div>
                
                <div className="ml-4">
                  <p className="text-xs uppercase tracking-wider text-[#C44D38] mb-2">
                    {t.line} {line.position}
                  </p>
                  
                  {line.text && (
                    <blockquote className="font-serif text-lg text-[#2C2C2C] italic mb-3 bg-[#E5E0D8]/30 p-4 rounded">
                      "{line.text}"
                    </blockquote>
                  )}
                  
                  {line.meaning && (
                    <p className="text-[#595959] text-sm">
                      <span className="font-medium text-[#2C2C2C]">Significato:</span> {line.meaning}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Derived Hexagram */}
      {derivedHexagramNumber && (
        <div className="zen-card bg-gradient-to-r from-[#C44D38]/10 to-transparent border-l-4 border-[#C44D38]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-3xl">→</div>
            <div>
              <p className="text-sm text-[#595959]">{t.derivedTitle}</p>
              <h3 className="font-serif text-2xl text-[#C44D38]">
                {derivedHexagramNumber}. {derivedHexagramName}
              </h3>
            </div>
          </div>
          
          {derivedTraditionalData?.sentence && (
            <div className="mt-4 pl-12">
              <p className="text-xs uppercase tracking-wider text-[#595959] mb-2">{t.derivedMeaning}:</p>
              <p className="font-serif text-[#2C2C2C] italic">
                "{derivedTraditionalData.sentence}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TraditionalReading;
