import React from 'react';

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    xs: { icon: 24, text: 'text-sm' },
    sm: { icon: 28, text: 'text-base' },
    md: { icon: 36, text: 'text-lg' },
    lg: { icon: 48, text: 'text-xl' },
    xl: { icon: 72, text: 'text-3xl' }
  };

  const { icon, text } = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo SVG */}
      <svg 
        width={icon} 
        height={icon} 
        viewBox="0 0 100 100" 
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logoGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7DC6F" />
            <stop offset="50%" stopColor="#E8D5B7" />
            <stop offset="100%" stopColor="#D4AC0D" />
          </linearGradient>
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Cerchio esterno */}
        <circle 
          cx="50" cy="50" r="45" 
          fill="none" 
          stroke="url(#logoGoldGradient)" 
          strokeWidth="2"
          filter="url(#logoGlow)"
        />
        
        {/* Trigrammi decorativi */}
        {[0, 90, 180, 270].map((angle, i) => (
          <g key={i} transform={`rotate(${angle} 50 50)`}>
            <rect x="47" y="8" width="6" height="2" fill="#C44D38" rx="1" />
            <rect x="47" y="12" width="6" height="2" fill="#C44D38" rx="1" />
          </g>
        ))}
        
        {/* Yin-Yang centrale */}
        <g>
          {/* Metà bianca */}
          <path 
            d="M50,15 A35,35 0 0,1 50,85 A17.5,17.5 0 0,1 50,50 A17.5,17.5 0 0,0 50,15" 
            fill="#F5F5F5" 
          />
          {/* Metà scura con gradiente */}
          <path 
            d="M50,15 A35,35 0 0,0 50,85 A17.5,17.5 0 0,0 50,50 A17.5,17.5 0 0,1 50,15" 
            fill="#2C2C2C" 
          />
          {/* Punto bianco */}
          <circle cx="50" cy="67.5" r="6" fill="#F5F5F5" />
          {/* Punto scuro */}
          <circle cx="50" cy="32.5" r="6" fill="#2C2C2C" />
        </g>
        
        {/* Esagramma stilizzato sovrapposto */}
        <g opacity="0.9">
          <line x1="42" y1="40" x2="58" y2="40" stroke="#D4AC0D" strokeWidth="2" strokeLinecap="round" />
          <line x1="42" y1="46" x2="48" y2="46" stroke="#D4AC0D" strokeWidth="2" strokeLinecap="round" />
          <line x1="52" y1="46" x2="58" y2="46" stroke="#D4AC0D" strokeWidth="2" strokeLinecap="round" />
          <line x1="42" y1="52" x2="58" y2="52" stroke="#D4AC0D" strokeWidth="2" strokeLinecap="round" />
          <line x1="42" y1="58" x2="48" y2="58" stroke="#D4AC0D" strokeWidth="2" strokeLinecap="round" />
          <line x1="52" y1="58" x2="58" y2="58" stroke="#D4AC0D" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>

      {/* Testo */}
      {showText && (
        <span className={`font-serif ${text} text-[#2C2C2C] whitespace-nowrap`}>
          I Ching del Benessere
        </span>
      )}
    </div>
  );
};

export default Logo;
