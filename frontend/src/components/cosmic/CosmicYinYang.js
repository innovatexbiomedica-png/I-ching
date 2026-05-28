import React from 'react';

/*
 * Yin-Yang luminoso che ruota, con alone (glow) oro/viola.
 * Pure CSS/SVG, leggerissimo. Si ferma con prefers-reduced-motion.
 */
export default function CosmicYinYang({ size = 280 }) {
  return (
    <div
      className="cosmic-yy-wrap"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 200 200" width={size} height={size} className="cosmic-yy">
        <defs>
          <radialGradient id="yyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E6B859" stopOpacity="0.0" />
            <stop offset="70%" stopColor="#E6B859" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
          </radialGradient>
          <linearGradient id="yyLight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF7E6" />
            <stop offset="100%" stopColor="#E6B859" />
          </linearGradient>
          <linearGradient id="yyDark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2A1A55" />
            <stop offset="100%" stopColor="#0A0F2C" />
          </linearGradient>
          <filter id="yySoft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow */}
        <circle cx="100" cy="100" r="98" fill="url(#yyGlow)" />

        {/* Rotating group */}
        <g className="cosmic-yy-rotor" style={{ transformOrigin: '100px 100px' }}>
          {/* Outer ring */}
          <circle cx="100" cy="100" r="74" fill="none" stroke="#E6B859" strokeWidth="0.8" opacity="0.5" />

          {/* Main yin-yang body */}
          <g filter="url(#yySoft)">
            {/* Light half */}
            <path
              d="M100 28
                 a72 72 0 0 1 0 144
                 a36 36 0 0 1 0 -72
                 a36 36 0 0 0 0 -72 z"
              fill="url(#yyLight)"
            />
            {/* Dark half */}
            <path
              d="M100 28
                 a72 72 0 0 0 0 144
                 a36 36 0 0 0 0 -72
                 a36 36 0 0 1 0 -72 z"
              fill="url(#yyDark)"
            />
            {/* Dots */}
            <circle cx="100" cy="64" r="9" fill="url(#yyDark)" />
            <circle cx="100" cy="136" r="9" fill="url(#yyLight)" />
            <circle cx="100" cy="64" r="3" fill="#E6B859" />
            <circle cx="100" cy="136" r="3" fill="#2A1A55" />
          </g>
        </g>

        {/* Orbiting trigram dots */}
        <g className="cosmic-yy-orbit" style={{ transformOrigin: '100px 100px' }}>
          <circle cx="100" cy="14" r="2.2" fill="#E6B859" />
          <circle cx="186" cy="100" r="1.8" fill="#A878FF" />
          <circle cx="100" cy="186" r="2.2" fill="#E6B859" />
          <circle cx="14" cy="100" r="1.8" fill="#A878FF" />
        </g>
      </svg>

      <style>{`
        .cosmic-yy-wrap { position: relative; display: inline-block; }
        .cosmic-yy-rotor { animation: cosmic-spin 24s linear infinite; }
        .cosmic-yy-orbit { animation: cosmic-spin 40s linear infinite reverse; }
        @keyframes cosmic-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cosmic-yy-rotor, .cosmic-yy-orbit { animation: none; }
        }
      `}</style>
    </div>
  );
}
