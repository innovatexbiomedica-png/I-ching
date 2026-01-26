import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Dopo 2.5 secondi inizia il fade out
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Dopo 3 secondi completa
    const timer2 = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center">
        {/* Logo SVG animato */}
        <div className="relative w-48 h-48 mb-8">
          {/* Cerchio esterno rotante */}
          <svg 
            viewBox="0 0 200 200" 
            className="absolute inset-0 w-full h-full animate-spin-slow"
            style={{ animationDuration: '8s' }}
          >
            {/* Trigrammi esterni */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <g key={i} transform={`rotate(${angle} 100 100)`}>
                <rect x="95" y="15" width="10" height="3" fill="#E8D5B7" opacity="0.8" rx="1" />
                <rect x="95" y="22" width="10" height="3" fill="#E8D5B7" opacity="0.8" rx="1" />
                <rect x="95" y="29" width="10" height="3" fill="#E8D5B7" opacity="0.8" rx="1" />
              </g>
            ))}
          </svg>

          {/* Cerchio Yin-Yang centrale */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
            {/* Cerchio di sfondo con glow */}
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F7DC6F" />
                <stop offset="50%" stopColor="#E8D5B7" />
                <stop offset="100%" stopColor="#D4AC0D" />
              </linearGradient>
            </defs>
            
            {/* Cerchio esterno dorato */}
            <circle cx="100" cy="100" r="70" fill="none" stroke="url(#goldGradient)" strokeWidth="2" filter="url(#glow)" className="animate-pulse-slow" />
            
            {/* Yin-Yang */}
            <g className="animate-rotate-subtle" style={{ transformOrigin: '100px 100px' }}>
              {/* Metà bianca */}
              <path d="M100,30 A70,70 0 0,1 100,170 A35,35 0 0,1 100,100 A35,35 0 0,0 100,30" fill="#F5F5F5" />
              {/* Metà nera */}
              <path d="M100,30 A70,70 0 0,0 100,170 A35,35 0 0,0 100,100 A35,35 0 0,1 100,30" fill="#2C2C2C" />
              {/* Punto bianco nel nero */}
              <circle cx="100" cy="135" r="10" fill="#F5F5F5" />
              {/* Punto nero nel bianco */}
              <circle cx="100" cy="65" r="10" fill="#2C2C2C" />
            </g>

            {/* Esagramma centrale animato */}
            <g className="animate-fade-in-delayed">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <g key={i}>
                  <line 
                    x1={85} 
                    y1={75 + i * 10} 
                    x2={115} 
                    y2={75 + i * 10} 
                    stroke="#D4AC0D" 
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="animate-draw-line"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                </g>
              ))}
            </g>
          </svg>

          {/* Particelle luminose */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-twinkle"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${1.5 + Math.random()}s`
              }}
            />
          ))}
        </div>

        {/* Titolo */}
        <h1 className="font-serif text-3xl md:text-4xl text-[#E8D5B7] mb-2 animate-fade-in-up tracking-wider">
          I Ching del Benessere
        </h1>
        <p className="text-[#E8D5B7]/60 text-sm animate-fade-in-up-delayed">
          ☯ Saggezza Antica per il Benessere Moderno ☯
        </p>

        {/* Loading dots */}
        <div className="flex space-x-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[#E8D5B7] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Stili per animazioni custom */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotate-subtle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delayed {
          0%, 30% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes draw-line {
          from { stroke-dasharray: 30; stroke-dashoffset: 30; }
          to { stroke-dasharray: 30; stroke-dashoffset: 0; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-rotate-subtle {
          animation: rotate-subtle 4s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        .animate-fade-in-up-delayed {
          animation: fade-in-up 1s ease-out 0.3s forwards;
          opacity: 0;
        }
        .animate-fade-in-delayed {
          animation: fade-in-delayed 2s ease-out forwards;
        }
        .animate-draw-line {
          animation: draw-line 0.5s ease-out forwards;
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
