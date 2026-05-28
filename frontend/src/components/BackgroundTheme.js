import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Starfield from './Starfield';
import OsakaWaves from './OsakaWaves';

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

// 🌙 NIGHT — starry sky (denser, more visible)
function NightBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(1200px 800px at 70% 0%, #1f2659 0%, transparent 55%), ' +
            'radial-gradient(900px 700px at 15% 100%, #34206b 0%, transparent 50%), ' +
            '#070B22',
        }}
      />
      <Starfield density={200} />
      {/* faint glow nebulae for depth */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background:
            'radial-gradient(500px 500px at 78% 30%, rgba(230,184,89,0.07), transparent 70%), ' +
            'radial-gradient(450px 450px at 22% 70%, rgba(124,58,237,0.10), transparent 70%)',
        }}
      />
    </div>
  );
}

// 🎴 OSAKA — animated painted waves (sumi-e / Hokusai style)
function OsakaBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* warm parchment base */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(1000px 700px at 50% -10%, #F8EFDC 0%, transparent 60%), ' +
            'linear-gradient(180deg, #F4E8CF 0%, #E7D6B4 100%)',
        }}
      />
      {/* paper grain */}
      <div
        style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* ANIMATED painted waves */}
      <OsakaWaves />
    </div>
  );
}

export default BackgroundThemeProvider;
