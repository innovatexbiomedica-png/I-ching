import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Starfield from './Starfield';

/*
 * Sistema di sfondi commutabili applicato a TUTTO il sito.
 *
 * Temi:
 *   - 'day'    ☀️  Carta di riso chiara (default, look originale)
 *   - 'night'  🌙  Cielo stellato (indigo + starfield animato)
 *   - 'osaka'  🎴  Pattern tradizionale a onde (Seigaiha) giapponese/cinese
 *
 * Lo sfondo è un layer fixed dietro tutto il contenuto. Il contenuto
 * resta in card chiare quindi rimane leggibile su ogni tema. In 'night'
 * applichiamo anche una classe sul <html> per piccoli aggiustamenti.
 *
 * La scelta è salvata in localStorage ('bgTheme').
 */

const BackgroundThemeContext = createContext(null);

export const useBackgroundTheme = () => {
  const ctx = useContext(BackgroundThemeContext);
  return ctx || { theme: 'day', setTheme: () => {} };
};

const VALID = ['day', 'night', 'osaka'];

export function BackgroundThemeProvider({ children }) {
  const [theme, setThemeState] = useState('day');

  useEffect(() => {
    const saved = localStorage.getItem('bgTheme');
    if (saved && VALID.includes(saved)) setThemeState(saved);
  }, []);

  const setTheme = useCallback((t) => {
    if (!VALID.includes(t)) return;
    setThemeState(t);
    localStorage.setItem('bgTheme', t);
  }, []);

  // Reflect the theme on <html data-bg-theme="..."> for global CSS tweaks
  useEffect(() => {
    document.documentElement.setAttribute('data-bg-theme', theme);
  }, [theme]);

  return (
    <BackgroundThemeContext.Provider value={{ theme, setTheme }}>
      <BackgroundLayer theme={theme} />
      {children}
    </BackgroundThemeContext.Provider>
  );
}

// The actual fixed background behind everything (z-index: -1)
function BackgroundLayer({ theme }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {theme === 'day' && <DayBackground />}
      {theme === 'night' && <NightBackground />}
      {theme === 'osaka' && <OsakaBackground />}
    </div>
  );
}

// ☀️ DAY — rice paper (original)
function DayBackground() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(900px 600px at 80% -5%, #FBF7EE 0%, transparent 55%), ' +
          'radial-gradient(800px 600px at 10% 105%, #EFE9DC 0%, transparent 50%), ' +
          '#F9F7F2',
      }}
    >
      {/* subtle paper grain */}
      <div
        style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

// 🌙 NIGHT — starry sky
function NightBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(1200px 800px at 70% 0%, #1a1f4d 0%, transparent 55%), ' +
            'radial-gradient(900px 700px at 15% 100%, #2a1a55 0%, transparent 50%), ' +
            '#0A0F2C',
        }}
      />
      <Starfield density={120} />
      {/* gentle veil so light content cards still read well */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,15,44,0.35) 100%)',
        }}
      />
    </div>
  );
}

// 🎴 OSAKA — traditional Seigaiha (wave) pattern
function OsakaBackground() {
  // Seigaiha = "blue sea and waves" — overlapping arcs, classic Japanese/Chinese motif.
  const wave = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='120' height='60' viewBox='0 0 120 60'>
  <g fill='none' stroke='#C9A24B' stroke-width='1.4' opacity='0.5'>
    <path d='M0 60 A30 30 0 0 1 60 60 A30 30 0 0 1 120 60'/>
    <path d='M0 60 A22 22 0 0 1 60 60 A22 22 0 0 1 120 60'/>
    <path d='M0 60 A14 14 0 0 1 60 60 A14 14 0 0 1 120 60'/>
    <path d='M0 60 A6 6 0 0 1 60 60 A6 6 0 0 1 120 60'/>
    <path d='M-60 60 A30 30 0 0 1 0 60 A30 30 0 0 1 60 60' transform='translate(0,0)'/>
  </g>
</svg>`);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* warm parchment base */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(1000px 700px at 50% -10%, #F6ECD8 0%, transparent 60%), ' +
            'linear-gradient(180deg, #F3E7CE 0%, #EADBBE 100%)',
        }}
      />
      {/* repeating wave motif */}
      <div
        style={{
          position: 'absolute', inset: 0, opacity: 0.5,
          backgroundImage: `url("data:image/svg+xml,${wave}")`,
          backgroundSize: '120px 60px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.7))',
          WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.7))',
        }}
      />
      {/* soft sun disc top-right (rising-sun nod) */}
      <div
        style={{
          position: 'absolute', top: '-120px', right: '-80px',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,77,56,0.18) 0%, rgba(196,77,56,0.06) 45%, transparent 70%)',
        }}
      />
    </div>
  );
}

export default BackgroundThemeProvider;
