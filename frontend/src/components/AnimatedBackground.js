import React, { useState, useEffect, useRef } from 'react';

// Traditional Chinese ink wash paintings for background (smaller resolution for speed)
const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1647410756066-9ca581aa2955?w=1280&q=70&auto=format',
  'https://images.unsplash.com/photo-1651848311092-61785a5eb418?w=1280&q=70&auto=format',
  'https://images.unsplash.com/photo-1618342336667-9ed677ab6715?w=1280&q=70&auto=format',
];

const AnimatedBackground = ({ opacity = 0.08, transitionDuration = 12000, children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const parallaxRef = useRef(null);
  const nextParallaxRef = useRef(null);
  const rafIdRef = useRef(null);

  // Preload first image only (others lazy)
  useEffect(() => {
    const img = new Image();
    img.src = BACKGROUND_IMAGES[0];
  }, []);

  // Throttled parallax via requestAnimationFrame (much smoother than setState on scroll)
  useEffect(() => {
    let scrollY = 0;
    let ticking = false;

    const updateTransform = () => {
      const offset = -scrollY * 0.15;
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
      }
      if (nextParallaxRef.current) {
        nextParallaxRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
      }
      ticking = false;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
      if (!ticking) {
        rafIdRef.current = requestAnimationFrame(updateTransform);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Image transition cycle (skip if user prefers reduced motion)
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const transitionInterval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((idx) => (idx + 1) % BACKGROUND_IMAGES.length);
        setNextIndex((idx) => (idx + 2) % BACKGROUND_IMAGES.length);
        setIsTransitioning(false);
      }, 2000);
    }, transitionDuration);
    return () => clearInterval(transitionInterval);
  }, [transitionDuration]);

  return (
    <div className="relative min-h-screen">
      {/* Background Layer */}
      <div
        className="fixed inset-0 z-0 overflow-hidden"
        style={{ backgroundColor: '#F9F7F2' }}
      >
        {/* Current Image */}
        <div
          ref={parallaxRef}
          className="absolute inset-0"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 2s ease-in-out',
            willChange: 'transform, opacity',
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${BACKGROUND_IMAGES[currentIndex]})`,
              filter: 'grayscale(100%) sepia(20%) contrast(0.9)',
              opacity,
            }}
          />
        </div>

        {/* Next Image (for crossfade) */}
        <div
          ref={nextParallaxRef}
          className="absolute inset-0"
          style={{
            opacity: isTransitioning ? 1 : 0,
            transition: 'opacity 2s ease-in-out',
            willChange: 'transform, opacity',
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${BACKGROUND_IMAGES[nextIndex]})`,
              filter: 'grayscale(100%) sepia(20%) contrast(0.9)',
              opacity,
            }}
          />
        </div>

        {/* Gradient overlay for better text readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(249, 247, 242, 0.7) 0%, rgba(249, 247, 242, 0.5) 30%, rgba(249, 247, 242, 0.5) 70%, rgba(249, 247, 242, 0.8) 100%)',
          }}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Simplified ink particles - CSS only, no React state
export const InkParticles = () => null;

// Simplified mist - lightweight CSS only
export const MistAnimation = ({ intensity = 0.3 }) => (
  <div
    className="fixed inset-0 z-[1] pointer-events-none overflow-hidden"
    style={{ willChange: 'transform' }}
    aria-hidden
  >
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(90deg, transparent 0%, rgba(249, 247, 242, ${intensity}) 50%, transparent 100%)`,
        animation: 'mist-drift 60s ease-in-out infinite',
      }}
    />
    <style>{`
      @keyframes mist-drift {
        0% { transform: translate3d(-100%, 0, 0); }
        100% { transform: translate3d(100%, 0, 0); }
      }
    `}</style>
  </div>
);

export default AnimatedBackground;
