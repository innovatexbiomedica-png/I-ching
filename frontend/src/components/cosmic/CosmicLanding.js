import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote, Sparkles, Moon, Compass, BookOpen, Coins, ChevronRight } from 'lucide-react';
import Starfield from './Starfield';
import CosmicYinYang from './CosmicYinYang';
import { WILHELM_HEXAGRAMS_PREVIEW } from '../WilhelmWisdom';
import HexagramDrawing, { buildBinaryFromTrigrams } from '../HexagramDrawing';

/*
 * Landing "Cosmo Astrale" — tutto dinamico.
 * Dark indigo background, starfield animato, yin-yang luminoso,
 * esagrammi fluttuanti, glow neon oro/viola.
 * Contenuti (citazioni, sentenze) restano quelli autentici Wilhelm.
 */

// Reveal-on-scroll hook (IntersectionObserver)
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function CosmicLanding({ isAuthenticated }) {
  const [activeHex, setActiveHex] = useState(0);
  useReveal();
  const hex = WILHELM_HEXAGRAMS_PREVIEW[activeHex];

  return (
    <div className="cosmic-root">
      {/* ════════ HERO ════════ */}
      <section className="cosmic-hero">
        <div className="cosmic-stars">
          <Starfield density={180} />
        </div>
        <div className="cosmic-hero-glow" />

        <div className="cosmic-hero-inner">
          <div className="cosmic-hero-text" data-reveal>
            <div className="cosmic-eyebrow">
              <span className="cosmic-dot" />
              ANTICA SAGGEZZA · GUIDA MODERNA
            </div>
            <h1 className="cosmic-h1">
              I Ching<br />
              <span className="cosmic-h1-accent">del Benessere</span>
            </h1>
            <p className="cosmic-sub">
              Interroga l'oracolo millenario. Ricevi interpretazioni profonde,
              ancorate alla traduzione di Richard Wilhelm e illuminate dall'intelligenza artificiale.
            </p>
            <div className="cosmic-cta-row">
              <Link to={isAuthenticated ? '/consult' : '/register'} className="cosmic-btn-primary">
                Inizia il tuo viaggio
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/library" className="cosmic-btn-ghost">
                Esplora i 64 esagrammi
              </Link>
            </div>
          </div>

          <div className="cosmic-hero-orb" data-reveal>
            <CosmicYinYang size={340} />
          </div>
        </div>

        <div className="cosmic-scroll-hint">
          <span>scorri</span>
          <div className="cosmic-scroll-line" />
        </div>
      </section>

      {/* ════════ CITAZIONE WILHELM ════════ */}
      <section className="cosmic-quote-sec" data-reveal>
        <Quote className="cosmic-quote-icon" />
        <blockquote className="cosmic-quote">
          "Il Libro dei Mutamenti è senza dubbio uno dei libri più importanti
          della letteratura mondiale. Vi si presentano simboli nei quali i saggi
          cinesi hanno cercato il segreto dei mutamenti dell'universo."
        </blockquote>
        <p className="cosmic-quote-author">— Richard Wilhelm</p>
      </section>

      {/* ════════ 64 ESAGRAMMI ════════ */}
      <section className="cosmic-hex-sec">
        <div className="cosmic-sec-head" data-reveal>
          <p className="cosmic-kicker">Il Libro dei Mutamenti</p>
          <h2 className="cosmic-h2">64 esagrammi, una sola saggezza</h2>
          <p className="cosmic-sec-desc">
            Tocca un esagramma per ascoltare la sua Sentenza, come Wilhelm la tradusse.
          </p>
        </div>

        <div className="cosmic-hex-layout" data-reveal>
          <div className="cosmic-hex-grid">
            {WILHELM_HEXAGRAMS_PREVIEW.map((h, idx) => (
              <button
                key={h.number}
                className={`cosmic-hex-chip ${idx === activeHex ? 'active' : ''}`}
                onClick={() => setActiveHex(idx)}
              >
                <HexagramDrawing lines={h.binary} size="sm" color="#E6B859" />
                <span className="cosmic-hex-chip-n">#{h.number}</span>
              </button>
            ))}
          </div>

          <div className="cosmic-hex-detail">
            <div className="cosmic-hex-detail-head">
              <div>
                <div className="cosmic-hex-cn">{hex.chinese} <span>{hex.pinyin}</span></div>
                <div className="cosmic-hex-name">{hex.name}</div>
              </div>
              <HexagramDrawing lines={hex.binary} size="md" color="#E6B859" />
            </div>
            <div className="cosmic-hex-sentence">
              <span className="cosmic-mini-label">La Sentenza</span>
              «{hex.sentenza}»
            </div>
            <div className="cosmic-hex-image">
              <span className="cosmic-mini-label">L'Immagine</span>
              {hex.immagine}
            </div>
            <Link to="/library" className="cosmic-hex-link">
              Esplora tutti i 64 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ RITUALE / FEATURE ════════ */}
      <section className="cosmic-feat-sec">
        <div className="cosmic-sec-head" data-reveal>
          <p className="cosmic-kicker">Il rituale</p>
          <h2 className="cosmic-h2">Come si interroga l'oracolo</h2>
        </div>
        <div className="cosmic-feat-grid" data-reveal>
          {[
            { icon: <Compass />, t: 'Formula la domanda', d: 'Concentrati su una questione che ti tocca davvero, con mente aperta.' },
            { icon: <Coins />, t: 'Lancia le monete', d: 'Tre monete, sei volte. Ogni lancio genera una linea dell\'esagramma.' },
            { icon: <BookOpen />, t: 'Interpreta', d: 'Ricevi Sentenza, Immagine e — se vi sono linee mutevoli — l\'esagramma derivato.' },
            { icon: <Moon />, t: 'Medita', d: 'L\'oracolo non decide per te: illumina ciò che già sai nel profondo.' },
          ].map((f, i) => (
            <div key={i} className="cosmic-feat-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="cosmic-feat-icon">{f.icon}</div>
              <h3 className="cosmic-feat-title">{f.t}</h3>
              <p className="cosmic-feat-desc">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ CTA FINALE ════════ */}
      <section className="cosmic-final" data-reveal>
        <div className="cosmic-final-glow" />
        <Sparkles className="cosmic-final-icon" />
        <h2 className="cosmic-final-h">Lascia che le stelle e il Tao ti guidino</h2>
        <p className="cosmic-final-sub">
          Ogni consultazione è un dialogo con il profondo. Inizia ora.
        </p>
        <Link to={isAuthenticated ? '/consult' : '/register'} className="cosmic-btn-primary cosmic-btn-lg">
          Inizia il tuo viaggio
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <CosmicStyles />
    </div>
  );
}

function CosmicStyles() {
  return (
    <style>{`
      .cosmic-root {
        --indigo: #0A0F2C;
        --indigo-2: #11173d;
        --gold: #E6B859;
        --violet: #7C3AED;
        --violet-soft: #A878FF;
        --pearl: #F0EAFF;
        background: var(--indigo);
        color: var(--pearl);
        overflow-x: hidden;
      }
      [data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1); }
      [data-reveal].revealed { opacity: 1; transform: none; }
      @media (prefers-reduced-motion: reduce) {
        [data-reveal] { opacity: 1; transform: none; transition: none; }
      }

      /* HERO */
      .cosmic-hero {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        background:
          radial-gradient(1200px 700px at 70% 10%, #1a1f4d 0%, transparent 55%),
          radial-gradient(900px 600px at 20% 90%, #2a1a55 0%, transparent 50%),
          var(--indigo);
        overflow: hidden;
      }
      .cosmic-stars { position: absolute; inset: 0; z-index: 0; }
      .cosmic-hero-glow {
        position: absolute; inset: 0; z-index: 1; pointer-events: none;
        background: radial-gradient(600px 600px at 75% 35%, rgba(230,184,89,.10), transparent 70%);
      }
      .cosmic-hero-inner {
        position: relative; z-index: 2;
        max-width: 1200px; margin: 0 auto; padding: 100px 24px;
        display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; align-items: center; width: 100%;
      }
      @media (max-width: 900px) {
        .cosmic-hero-inner { grid-template-columns: 1fr; text-align: center; padding-top: 120px; }
        .cosmic-hero-orb { order: -1; display: flex; justify-content: center; }
      }
      .cosmic-eyebrow {
        display: inline-flex; align-items: center; gap: 10px;
        font-size: 12px; letter-spacing: .3em; color: var(--gold);
        margin-bottom: 24px; text-transform: uppercase;
      }
      .cosmic-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 12px var(--gold); animation: pulse-dot 2s infinite; }
      @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.3} }
      .cosmic-h1 {
        font-family: 'Cormorant Garamond', serif;
        font-size: clamp(48px, 8vw, 92px); line-height: 1; font-weight: 600;
        margin: 0 0 24px; letter-spacing: -.02em;
      }
      .cosmic-h1-accent {
        background: linear-gradient(120deg, var(--gold), var(--violet-soft));
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      }
      .cosmic-sub {
        font-size: clamp(16px, 2vw, 20px); color: #c8c2e0; line-height: 1.6;
        max-width: 540px; margin: 0 auto 36px;
      }
      .cosmic-cta-row { display: flex; gap: 16px; flex-wrap: wrap; }
      @media (max-width: 900px) { .cosmic-cta-row { justify-content: center; } }
      .cosmic-btn-primary {
        display: inline-flex; align-items: center; gap: 10px;
        padding: 15px 30px; border-radius: 999px; font-weight: 600; font-size: 16px;
        color: #1a1206; text-decoration: none;
        background: linear-gradient(120deg, #F7D98A, var(--gold));
        box-shadow: 0 0 30px rgba(230,184,89,.45), inset 0 1px 0 rgba(255,255,255,.5);
        transition: transform .25s, box-shadow .25s;
      }
      .cosmic-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 44px rgba(230,184,89,.7); }
      .cosmic-btn-lg { padding: 18px 40px; font-size: 18px; }
      .cosmic-btn-ghost {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 15px 28px; border-radius: 999px; font-size: 16px;
        color: var(--pearl); text-decoration: none;
        border: 1px solid rgba(168,120,255,.4);
        transition: border-color .25s, background .25s;
      }
      .cosmic-btn-ghost:hover { border-color: var(--violet-soft); background: rgba(124,58,237,.12); }
      .cosmic-hero-orb { display: flex; justify-content: center; }
      .cosmic-scroll-hint {
        position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
        z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 8px;
        font-size: 11px; letter-spacing: .25em; text-transform: uppercase; color: #8a85b0;
      }
      .cosmic-scroll-line { width: 1px; height: 40px; background: linear-gradient(var(--gold), transparent); animation: scroll-pulse 2s infinite; }
      @keyframes scroll-pulse { 0%{opacity:.2} 50%{opacity:1} 100%{opacity:.2} }

      /* QUOTE */
      .cosmic-quote-sec { max-width: 800px; margin: 0 auto; padding: 100px 24px; text-align: center; }
      .cosmic-quote-icon { width: 40px; height: 40px; color: var(--gold); opacity: .5; margin: 0 auto 24px; }
      .cosmic-quote { font-family: 'Cormorant Garamond', serif; font-size: clamp(22px, 3vw, 32px); font-style: italic; line-height: 1.5; color: var(--pearl); margin: 0 0 20px; }
      .cosmic-quote-author { color: var(--gold); letter-spacing: .1em; font-size: 14px; }

      /* SECTION HEADS */
      .cosmic-sec-head { text-align: center; max-width: 640px; margin: 0 auto 56px; }
      .cosmic-kicker { font-size: 12px; letter-spacing: .3em; text-transform: uppercase; color: var(--violet-soft); margin-bottom: 12px; }
      .cosmic-h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px, 5vw, 52px); margin: 0 0 16px; line-height: 1.1; }
      .cosmic-sec-desc { color: #c8c2e0; font-size: 16px; line-height: 1.6; }

      /* HEXAGRAMS */
      .cosmic-hex-sec { padding: 60px 24px 100px; max-width: 1100px; margin: 0 auto; }
      .cosmic-hex-layout { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 40px; align-items: start; }
      @media (max-width: 860px) { .cosmic-hex-layout { grid-template-columns: 1fr; } }
      .cosmic-hex-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
      .cosmic-hex-chip {
        display: flex; flex-direction: column; align-items: center; gap: 8px;
        padding: 16px 8px; border-radius: 14px; cursor: pointer;
        background: rgba(255,255,255,.03); border: 1px solid rgba(168,120,255,.15);
        transition: all .25s;
      }
      .cosmic-hex-chip:hover { border-color: rgba(230,184,89,.5); background: rgba(230,184,89,.06); transform: translateY(-3px); }
      .cosmic-hex-chip.active { border-color: var(--gold); background: rgba(230,184,89,.12); box-shadow: 0 0 24px rgba(230,184,89,.25); }
      .cosmic-hex-chip-n { font-size: 10px; color: #8a85b0; letter-spacing: .1em; }
      .cosmic-hex-detail {
        background: linear-gradient(160deg, rgba(124,58,237,.10), rgba(10,15,44,.4));
        border: 1px solid rgba(168,120,255,.2); border-radius: 22px; padding: 32px;
        backdrop-filter: blur(8px);
      }
      .cosmic-hex-detail-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; }
      .cosmic-hex-cn { font-family: 'Cormorant Garamond', serif; font-size: 38px; line-height: 1; }
      .cosmic-hex-cn span { font-size: 18px; color: #8a85b0; }
      .cosmic-hex-name { color: var(--gold); font-size: 20px; font-style: italic; margin-top: 6px; }
      .cosmic-mini-label { display: block; font-size: 10px; letter-spacing: .25em; text-transform: uppercase; color: var(--violet-soft); margin-bottom: 6px; }
      .cosmic-hex-sentence { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-style: italic; line-height: 1.4; margin-bottom: 20px; }
      .cosmic-hex-image { color: #c8c2e0; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
      .cosmic-hex-link { color: var(--gold); text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 4px; }
      .cosmic-hex-link:hover { text-decoration: underline; }

      /* FEATURES */
      .cosmic-feat-sec { padding: 60px 24px 100px; max-width: 1100px; margin: 0 auto; }
      .cosmic-feat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
      @media (max-width: 860px) { .cosmic-feat-grid { grid-template-columns: 1fr 1fr; } }
      @media (max-width: 520px) { .cosmic-feat-grid { grid-template-columns: 1fr; } }
      .cosmic-feat-card {
        padding: 28px 22px; border-radius: 20px;
        background: rgba(255,255,255,.03); border: 1px solid rgba(168,120,255,.15);
        transition: all .3s;
      }
      .cosmic-feat-card:hover { transform: translateY(-4px); border-color: rgba(230,184,89,.4); background: rgba(230,184,89,.05); }
      .cosmic-feat-icon {
        width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, rgba(230,184,89,.2), rgba(124,58,237,.2));
        color: var(--gold); margin-bottom: 18px;
      }
      .cosmic-feat-icon svg { width: 24px; height: 24px; }
      .cosmic-feat-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; margin: 0 0 10px; }
      .cosmic-feat-desc { color: #c8c2e0; font-size: 14px; line-height: 1.6; }

      /* FINAL CTA */
      .cosmic-final { position: relative; text-align: center; padding: 120px 24px; overflow: hidden; }
      .cosmic-final-glow { position: absolute; inset: 0; background: radial-gradient(600px 400px at 50% 50%, rgba(124,58,237,.18), transparent 70%); pointer-events: none; }
      .cosmic-final-icon { width: 44px; height: 44px; color: var(--gold); margin: 0 auto 20px; position: relative; }
      .cosmic-final-h { font-family: 'Cormorant Garamond', serif; font-size: clamp(30px, 5vw, 48px); margin: 0 0 16px; position: relative; }
      .cosmic-final-sub { color: #c8c2e0; margin: 0 0 36px; font-size: 17px; position: relative; }
    `}</style>
  );
}
