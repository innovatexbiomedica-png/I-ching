import React from 'react';

const HexagramDisplay = ({ 
  hexagramNumber, 
  hexagramName, 
  hexagramChinese,
  trigramAbove, 
  trigramBelow,
  movingLines = [],
  lines = [],
  size = 'medium'
}) => {
  const sizeClasses = {
    small: { line: 'h-2 w-20', gap: 'gap-1', text: 'text-lg' },
    medium: { line: 'h-3 w-32', gap: 'gap-2', text: 'text-2xl' },
    large: { line: 'h-4 w-40', gap: 'gap-3', text: 'text-3xl' }
  };
  
  const s = sizeClasses[size] || sizeClasses.medium;

  // Generate lines from values if provided, otherwise show generic display
  const renderLine = (isYang, isMoving, position) => {
    const lineColor = isMoving ? '#C44D38' : '#2C2C2C';
    
    return (
      <div key={position} className="flex items-center justify-center space-x-2">
        <span className="text-xs text-[#595959] w-4">{position}</span>
        <div className="relative">
          {isYang ? (
            <div className={`${s.line} rounded-sm`} style={{ backgroundColor: lineColor }} />
          ) : (
            <div className={`flex justify-between ${s.line}`}>
              <div className="w-[42%] h-full rounded-sm" style={{ backgroundColor: lineColor }} />
              <div className="w-[42%] h-full rounded-sm" style={{ backgroundColor: lineColor }} />
            </div>
          )}
        </div>
        {isMoving && (
          <span className="text-xs text-[#C44D38] font-bold">○</span>
        )}
      </div>
    );
  };

  // If we have line values, render them
  const renderLines = () => {
    if (lines.length === 6) {
      // Reverse to show from bottom (line 1) to top (line 6)
      return lines.slice().reverse().map((value, idx) => {
        const position = 6 - idx;
        const isYang = value === 7 || value === 9;
        const isMoving = movingLines.includes(position);
        return renderLine(isYang, isMoving, position);
      });
    }
    // Default display
    return [1, 0, 1, 1, 0, 1].map((isYang, idx) => renderLine(isYang, false, 6 - idx));
  };

  return (
    <div className="flex flex-col items-center" data-testid="hexagram-display">
      {/* Trigram Above */}
      {trigramAbove && (
        <div className="mb-4 text-center">
          <div 
            className="text-4xl mb-1" 
            style={{ color: trigramAbove.color }}
            title={trigramAbove.name_local}
          >
            {trigramAbove.symbol}
          </div>
          <p className="text-xs text-[#595959]">
            {trigramAbove.name_local} • {trigramAbove.element}
          </p>
        </div>
      )}

      {/* Hexagram Lines */}
      <div className={`flex flex-col ${s.gap} py-4`}>
        {renderLines()}
      </div>

      {/* Trigram Below */}
      {trigramBelow && (
        <div className="mt-4 text-center">
          <div 
            className="text-4xl mb-1" 
            style={{ color: trigramBelow.color }}
            title={trigramBelow.name_local}
          >
            {trigramBelow.symbol}
          </div>
          <p className="text-xs text-[#595959]">
            {trigramBelow.name_local} • {trigramBelow.element}
          </p>
        </div>
      )}

      {/* Hexagram Name */}
      <div className="mt-6 text-center">
        <p className={`font-serif ${s.text} text-[#2C2C2C]`}>
          {hexagramChinese}
        </p>
        <p className="text-[#C44D38] font-serif mt-1">
          {hexagramNumber}. {hexagramName}
        </p>
      </div>
    </div>
  );
};

export default HexagramDisplay;
