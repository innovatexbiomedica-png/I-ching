import React, { useState, useEffect, useCallback } from 'react';

// Traditional Chinese ink wash paintings for background
const BACKGROUND_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1647410756066-9ca581aa2955?w=1920&q=80',
    alt: 'Bambù tradizionale cinese'
  },
  {
    url: 'https://images.unsplash.com/photo-1651848311092-61785a5eb418?w=1920&q=80',
    alt: 'Montagne nella nebbia'
  },
  {
    url: 'https://images.unsplash.com/photo-1618342336667-9ed677ab6715?w=1920&q=80',
    alt: 'Catene montuose'
  },
  {
    url: 'https://images.unsplash.com/photo-1701194798554-5be6fce47a85?w=1920&q=80',
    alt: 'Paesaggio vallata'
  },
  {
    url: 'https://images.unsplash.com/photo-1632556906916-c1fd5dba4cec?w=1920&q=80',
    alt: 'Foresta di bambù'
  }
];

const AnimatedBackground = ({ opacity = 0.08, transitionDuration = 12000, children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [parallaxOffset, setParallaxOffset] = useState(0);

  // Preload images
  useEffect(() => {
    BACKGROUND_IMAGES.forEach((img, index) => {
      const image = new Image();
      image.src = img.url;
      image.onload = () => {
        setImagesLoaded(prev => ({ ...prev, [index]: true }));
      };
    });
  }, []);

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setParallaxOffset(scrollY * 0.3); // Slow parallax movement
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Image transition cycle
  useEffect(() => {
    const transitionInterval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setNextIndex((nextIndex + 1) % BACKGROUND_IMAGES.length);
        setIsTransitioning(false);
      }, 2000); // Crossfade duration
      
    }, transitionDuration);

    return () => clearInterval(transitionInterval);
  }, [nextIndex, transitionDuration]);

  // Subtle zoom animation
  const [zoomLevel, setZoomLevel] = useState(1);
  
  useEffect(() => {
    const zoomInterval = setInterval(() => {
      setZoomLevel(prev => prev === 1 ? 1.05 : 1);
    }, transitionDuration / 2);
    
    return () => clearInterval(zoomInterval);
  }, [transitionDuration]);

  return (
    <div className="relative min-h-screen">
      {/* Background Layer */}
      <div 
        className="fixed inset-0 z-0 overflow-hidden"
        style={{ 
          backgroundColor: '#F9F7F2' // Base color to maintain readability
        }}
      >
        {/* Current Image */}
        <div
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: `translateY(${-parallaxOffset}px) scale(${zoomLevel})`,
            transition: `opacity 2s ease-in-out, transform ${transitionDuration}ms ease-out`
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${BACKGROUND_IMAGES[currentIndex].url})`,
              filter: 'grayscale(100%) sepia(20%) contrast(0.9)',
              opacity: opacity,
            }}
          />
        </div>

        {/* Next Image (for crossfade) */}
        <div
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          style={{
            opacity: isTransitioning ? 1 : 0,
            transform: `translateY(${-parallaxOffset}px) scale(${zoomLevel})`,
            transition: `opacity 2s ease-in-out, transform ${transitionDuration}ms ease-out`
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${BACKGROUND_IMAGES[nextIndex].url})`,
              filter: 'grayscale(100%) sepia(20%) contrast(0.9)',
              opacity: opacity,
            }}
          />
        </div>

        {/* Gradient overlay for better text readability */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              180deg, 
              rgba(249, 247, 242, 0.7) 0%, 
              rgba(249, 247, 242, 0.5) 30%,
              rgba(249, 247, 242, 0.5) 70%,
              rgba(249, 247, 242, 0.8) 100%
            )`
          }}
        />

        {/* Vignette effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(
              ellipse at center, 
              transparent 0%, 
              rgba(249, 247, 242, 0.3) 70%,
              rgba(249, 247, 242, 0.6) 100%
            )`
          }}
        />

        {/* Subtle grain texture for traditional feel */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'multiply'
          }}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Floating ink particles animation component
export const InkParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate initial particles
    const initialParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.1 + 0.02,
      duration: Math.random() * 20 + 30,
      delay: Math.random() * 10
    }));
    setParticles(initialParticles);
  }, []);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-[#2C2C2C]"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animation: `float-particle ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(90deg);
          }
          50% {
            transform: translateY(-10px) translateX(-10px) rotate(180deg);
          }
          75% {
            transform: translateY(-30px) translateX(5px) rotate(270deg);
          }
        }
      `}</style>
    </div>
  );
};

// Mist/fog animation for mountain scenes
export const MistAnimation = ({ intensity = 0.3 }) => {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {/* Mist layer 1 - slow moving */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(249, 247, 242, ${intensity}) 50%, transparent 100%)`,
          animation: 'mist-drift 60s ease-in-out infinite',
          transform: 'translateX(-100%)'
        }}
      />
      {/* Mist layer 2 - medium speed */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(249, 247, 242, ${intensity * 0.7}) 30%, rgba(249, 247, 242, ${intensity * 0.5}) 70%, transparent 100%)`,
          animation: 'mist-drift 45s ease-in-out infinite',
          animationDelay: '-20s',
          transform: 'translateX(-100%)'
        }}
      />
      {/* Mist layer 3 - faster */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(249, 247, 242, ${intensity * 0.4}) 40%, transparent 100%)`,
          animation: 'mist-drift 30s ease-in-out infinite',
          animationDelay: '-10s',
          transform: 'translateX(-100%)'
        }}
      />
      <style jsx>{`
        @keyframes mist-drift {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
