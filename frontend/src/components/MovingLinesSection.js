import React from 'react';
import { Circle } from 'lucide-react';

const MovingLinesSection = ({ movingLines, language = 'it' }) => {
  if (!movingLines || movingLines.length === 0) return null;

  const title = language === 'it' ? 'Sentenze delle Linee Mutevoli' : 'Moving Lines Sentences';
  const positionLabel = language === 'it' ? 'Linea' : 'Line';

  return (
    <div className="zen-card" data-testid="moving-lines-section">
      <h3 className="font-serif text-xl text-[#2C2C2C] mb-6 flex items-center space-x-2">
        <Circle className="w-4 h-4 text-[#C44D38]" />
        <span>{title}</span>
      </h3>
      
      <div className="space-y-6">
        {movingLines.map((line, idx) => (
          <div 
            key={idx} 
            className="border-l-2 border-[#C44D38] pl-4"
            data-testid={`moving-line-${line.position}`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-[#C44D38] text-white text-xs px-2 py-1 rounded-full">
                {positionLabel} {line.position}
              </span>
            </div>
            
            {line.text && (
              <p className="font-serif text-lg text-[#2C2C2C] italic mb-2">
                "{line.text}"
              </p>
            )}
            
            {line.meaning && (
              <p className="text-[#595959] text-sm">
                {line.meaning}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovingLinesSection;
