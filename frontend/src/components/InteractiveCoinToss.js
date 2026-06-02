import React, { useCallback, useMemo, useRef, useState } from 'react';

/*
 * InteractiveCoinToss
 * --------------------
 * Modulo interattivo per il lancio delle 3 monete cinesi, ripetuto 6 volte
 * per costruire l'esagramma dal basso (linea 1) verso l'alto (linea 6).
 *
 *  Entropia
 *  --------
 *  Ogni faccia di moneta è decisa da `crypto.getRandomValues` (CSPRNG del
 *  browser): bit equiprobabili, non manipolabili, non ciclici come Math.random.
 *  Inoltre durante l'animazione disegniamo NUOVI bit casuali ad ogni frame
 *  (~60 fps), così visivamente la moneta "passa" per centinaia di stati prima
 *  di posarsi: il risultato finale è uno solo, ma estratto da un universo di
 *  4^6 = 4096 esagrammi (con linee mutevoli) — un singolo profilo di puri
 *  "vecchi" ha probabilità 1/8^6 = 1/262.144, esattamente come a mano.
 *
 *  Mapping tradizionale (Wilhelm):
 *    testa  (yang 陽) → 3 punti
 *    croce  (yin  陰) → 2 punti
 *    Somma 6  → vecchio yin   (spezzata, ●) — mutevole
 *    Somma 7  → giovane yang  (continua)
 *    Somma 8  → giovane yin   (spezzata)
 *    Somma 9  → vecchio yang  (continua, ●) — mutevole
 *
 *  Props
 *  -----
 *    lines           { line1: '6'|'7'|'8'|'9'|'', … line6: … }
 *    onLinesChange   (next) => void   — chiamata col nuovo oggetto lines
 *    language        'it' | 'en'
 *    disabled        bool
 */

// ─────────────────────────── randomness helpers ───────────────────────────
const _cryptoOk = typeof globalThis !== 'undefined'
  && globalThis.crypto
  && typeof globalThis.crypto.getRandomValues === 'function';

// One unbiased coin flip. Returns 'H' (testa/yang, 3) or 'T' (croce/yin, 2).
function secureCoin() {
  if (_cryptoOk) {
    const b = new Uint32Array(1);
    globalThis.crypto.getRandomValues(b);
    return (b[0] & 1) ? 'H' : 'T';
  }
  return Math.random() < 0.5 ? 'H' : 'T';
}

// Three independent coin flips → triplet of faces.
function tossThree() {
  return [secureCoin(), secureCoin(), secureCoin()];
}

// Sum of a triplet under the tradition: H=3, T=2.
function sumOf(triplet) {
  return triplet.reduce((s, f) => s + (f === 'H' ? 3 : 2), 0);
}

// Map sum to {value, type, moving, label}.
function lineFromSum(sum, language) {
  const it = language !== 'en';
  switch (sum) {
    case 6: return { value: '6', type: 'yin',  moving: true,  label: it ? 'Vecchio yin (mutevole)'  : 'Old yin (changing)'  };
    case 7: return { value: '7', type: 'yang', moving: false, label: it ? 'Giovane yang'            : 'Young yang'           };
    case 8: return { value: '8', type: 'yin',  moving: false, label: it ? 'Giovane yin'             : 'Young yin'            };
    case 9: return { value: '9', type: 'yang', moving: true,  label: it ? 'Vecchio yang (mutevole)' : 'Old yang (changing)'  };
    default: return { value: '', type: null,  moving: false, label: '' };
  }
}

// ────────────────────────────── coin visual ────────────────────────────────
function Coin({ face, spinning, delayMs }) {
  return (
    <div
      className="ict-coin-outer"
      style={{ animation: spinning ? `ict-toss 1.4s cubic-bezier(.4,.0,.2,1) ${delayMs}ms forwards` : undefined }}
    >
      <div className={`ict-coin ${face === 'T' ? 'is-yin' : 'is-yang'}`}>
        <div className="ict-face ict-face-yang">
          <span className="ict-symbol">陽</span>
          <span className="ict-hole" />
        </div>
        <div className="ict-face ict-face-yin">
          <span className="ict-symbol">陰</span>
          <span className="ict-hole" />
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── main component ──────────────────────────────
const LINE_KEYS = ['line1', 'line2', 'line3', 'line4', 'line5', 'line6'];

export default function InteractiveCoinToss({
  lines,
  onLinesChange,
  language = 'it',
  disabled = false,
}) {
  const it = language !== 'en';
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // Per ogni linea memorizziamo le 3 facce mostrate. Quando si sta lanciando
  // le facce vengono riscritte ad ogni frame con nuovi bit casuali; alla
  // fine, l'ultimo set di bit è quello "ufficiale" che decide la linea.
  const [coinFaces, setCoinFaces] = useState(() => LINE_KEYS.map(() => ['H', 'H', 'H']));
  const [tossingIdx, setTossingIdx] = useState(-1);  // -1 idle; 0-5 = linea in volo
  const [manualMode, setManualMode] = useState(false);
  const sequenceAbortRef = useRef(false);

  // Esegue il lancio interattivo di UNA linea (idx 0..5).
  const tossSingle = useCallback(async (idx) => {
    if (disabled || tossingIdx !== -1) return;
    setTossingIdx(idx);

    // Numero di re-disegni durante l'animazione. ~60 fps × 1.4s ≈ 84 frame:
    // a ogni frame estraiamo NUOVI 3 bit dall'entropia crittografica.
    const frames = reduceMotion ? 1 : 70;
    const frameMs = reduceMotion ? 0 : 20;

    for (let f = 0; f < frames; f++) {
      const triplet = tossThree();
      setCoinFaces((prev) => {
        const cp = prev.slice();
        cp[idx] = triplet;
        return cp;
      });
      if (frameMs) await new Promise((r) => setTimeout(r, frameMs));
    }

    // Estrazione finale (ufficiale): un ALTRO draw indipendente dai frame
    // di animazione — così l'animazione resta puro spettacolo e il risultato
    // resta non manipolabile / non predicibile dall'eye-of-the-user.
    const finalFaces = tossThree();
    setCoinFaces((prev) => {
      const cp = prev.slice();
      cp[idx] = finalFaces;
      return cp;
    });
    const sum = sumOf(finalFaces);
    const lineRes = lineFromSum(sum, language);
    onLinesChange({ ...lines, [LINE_KEYS[idx]]: lineRes.value });

    // piccolo respiro prima di liberare il lock
    await new Promise((r) => setTimeout(r, 250));
    setTossingIdx(-1);
  }, [disabled, tossingIdx, reduceMotion, language, lines, onLinesChange]);

  // Lancia in sequenza tutte le linee ancora vuote.
  const tossAll = useCallback(async () => {
    if (disabled || tossingIdx !== -1) return;
    sequenceAbortRef.current = false;
    // Lavoriamo su un oggetto locale per evitare di leggere stato stantio.
    let cursor = { ...lines };
    for (let i = 0; i < 6; i++) {
      if (sequenceAbortRef.current) break;
      if (cursor[LINE_KEYS[i]]) continue; // salta linee già fissate
      setTossingIdx(i);
      const frames = reduceMotion ? 1 : 70;
      const frameMs = reduceMotion ? 0 : 20;
      for (let f = 0; f < frames; f++) {
        const triplet = tossThree();
        setCoinFaces((prev) => {
          const cp = prev.slice();
          cp[i] = triplet;
          return cp;
        });
        if (frameMs) await new Promise((r) => setTimeout(r, frameMs));
      }
      const finalFaces = tossThree();
      setCoinFaces((prev) => {
        const cp = prev.slice();
        cp[i] = finalFaces;
        return cp;
      });
      const lineRes = lineFromSum(sumOf(finalFaces), language);
      cursor = { ...cursor, [LINE_KEYS[i]]: lineRes.value };
      onLinesChange(cursor);
      await new Promise((r) => setTimeout(r, 380));
    }
    setTossingIdx(-1);
  }, [disabled, tossingIdx, lines, language, reduceMotion, onLinesChange]);

  // Reset esagramma (cancella tutte le linee posate).
  const resetAll = useCallback(() => {
    if (disabled || tossingIdx !== -1) return;
    const empty = LINE_KEYS.reduce((o, k) => ({ ...o, [k]: '' }), {});
    onLinesChange(empty);
  }, [disabled, tossingIdx, onLinesChange]);

  const allFilled = useMemo(() => LINE_KEYS.every((k) => lines[k]), [lines]);
  const anyFilled = useMemo(() => LINE_KEYS.some((k) => lines[k]), [lines]);

  return (
    <div className="ict-root">
      {/* Banda di intestazione: cripto-entropia + azioni globali */}
      <div className="ict-toolbar">
        <div className="ict-entropy">
          <span className="ict-dot" aria-hidden />
          {it
            ? <>Entropia crittografica attiva <code>(crypto.getRandomValues)</code> — esiti equiprobabili come dal vivo.</>
            : <>Cryptographic entropy on <code>(crypto.getRandomValues)</code> — equiprobable outcomes, like the real ritual.</>}
        </div>
        <div className="ict-actions">
          <button
            type="button"
            className="ict-btn ict-btn-primary"
            onClick={tossAll}
            disabled={disabled || tossingIdx !== -1 || allFilled}
            data-testid="coin-toss-all"
          >
            {it
              ? (anyFilled ? 'Lancia le linee restanti' : 'Lancia tutte le 6 linee')
              : (anyFilled ? 'Toss remaining lines' : 'Toss all 6 lines')}
          </button>
          <button
            type="button"
            className="ict-btn ict-btn-ghost"
            onClick={resetAll}
            disabled={disabled || tossingIdx !== -1 || !anyFilled}
          >
            {it ? 'Azzera' : 'Reset'}
          </button>
          <button
            type="button"
            className="ict-btn ict-btn-ghost"
            onClick={() => setManualMode((m) => !m)}
            disabled={disabled || tossingIdx !== -1}
            aria-pressed={manualMode}
            title={it ? 'Inserimento manuale dei valori (accessibilità)' : 'Manual entry (accessibility)'}
          >
            {manualMode
              ? (it ? '← Lancio interattivo' : '← Interactive toss')
              : (it ? 'Inserisci manualmente' : 'Manual entry')}
          </button>
        </div>
      </div>

      {/* Sei righe, una per linea. Si costruiscono dal basso. */}
      <ul className="ict-rows">
        {LINE_KEYS.map((key, idx) => {
          const val = lines[key];
          const sum = val ? Number(val) : null;
          const info = sum ? lineFromSum(sum, language) : null;
          const isTossing = tossingIdx === idx;
          const isLocked = !!val && !isTossing;
          const pos = idx === 0
            ? (it ? '(basso · prima)' : '(bottom · first)')
            : idx === 5
              ? (it ? '(alto · ultima)' : '(top · last)')
              : '';
          return (
            <li key={key} className={`ict-row ${isTossing ? 'is-tossing' : ''} ${isLocked ? 'is-locked' : ''}`} data-testid={`ict-line-${idx + 1}`}>
              <div className="ict-row-label">
                <span className="ict-line-num">{idx + 1}</span>
                <span className="ict-line-pos">{pos}</span>
              </div>

              <div className="ict-row-coins">
                <Coin face={coinFaces[idx][0]} spinning={isTossing} delayMs={0}   />
                <Coin face={coinFaces[idx][1]} spinning={isTossing} delayMs={120} />
                <Coin face={coinFaces[idx][2]} spinning={isTossing} delayMs={240} />
              </div>

              <div className="ict-row-result">
                {isTossing && <span className="ict-result-spin">{it ? 'in volo…' : 'in flight…'}</span>}
                {!isTossing && info && (
                  <>
                    <span className={`ict-pill ict-pill-${info.type}${info.moving ? ' is-moving' : ''}`}>
                      {info.value} · {info.label}
                    </span>
                    {info.moving && <span className="ict-moving-dot" aria-label="moving line">●</span>}
                  </>
                )}
                {!isTossing && !info && !manualMode && (
                  <span className="ict-result-empty">{it ? 'in attesa del lancio' : 'awaiting toss'}</span>
                )}
                {manualMode && (
                  <select
                    className="ict-manual"
                    value={val || ''}
                    onChange={(e) => onLinesChange({ ...lines, [key]: e.target.value })}
                    disabled={disabled}
                    aria-label={it ? `Valore linea ${idx + 1}` : `Line ${idx + 1} value`}
                  >
                    <option value="">{it ? '— scegli —' : '— pick —'}</option>
                    <option value="6">6 — {it ? 'vecchio yin (mut.)' : 'old yin (chg)'}</option>
                    <option value="7">7 — {it ? 'giovane yang' : 'young yang'}</option>
                    <option value="8">8 — {it ? 'giovane yin'  : 'young yin'}</option>
                    <option value="9">9 — {it ? 'vecchio yang (mut.)' : 'old yang (chg)'}</option>
                  </select>
                )}
              </div>

              <div className="ict-row-action">
                <button
                  type="button"
                  className="ict-btn ict-btn-line"
                  onClick={() => tossSingle(idx)}
                  disabled={disabled || tossingIdx !== -1 || manualMode}
                  data-testid={`ict-toss-${idx + 1}`}
                >
                  {isLocked
                    ? (it ? 'Rilancia' : 'Re-toss')
                    : (it ? 'Lancia' : 'Toss')}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="ict-foot">
        {it
          ? <>Testa = 3 · Croce = 2 — somma 6/7/8/9. Probabilità per linea: <code>1/8 · 3/8 · 3/8 · 1/8</code>. Per un esagramma di sole linee mutevoli pure, <code>1 su 262.144</code>: esattamente come dal vivo.</>
          : <>Heads = 3 · Tails = 2 — sums 6/7/8/9. Per-line odds: <code>1/8 · 3/8 · 3/8 · 1/8</code>. A pure all-moving hexagram is <code>1 in 262,144</code>, just like the real ritual.</>}
      </p>

      <style>{`
        .ict-root { font-family: 'Manrope', sans-serif; }
        .ict-toolbar {
          display:flex; flex-wrap:wrap; gap:12px;
          align-items:center; justify-content:space-between;
          padding:12px 14px; margin-bottom:16px;
          background: rgba(196,77,56,0.04);
          border:1px solid rgba(196,77,56,0.18);
          border-radius:10px;
        }
        .ict-entropy { font-size:12px; color:#595959; display:flex; align-items:center; gap:8px; }
        .ict-entropy code { font-size:11px; background:rgba(0,0,0,0.05); padding:1px 6px; border-radius:4px; }
        .ict-dot {
          width:8px; height:8px; border-radius:50%;
          background:#8A9A5B;
          box-shadow:0 0 8px #8A9A5Bcc;
          animation: ict-pulse 1.6s ease-in-out infinite;
        }
        @keyframes ict-pulse { 0%,100% {opacity:.5} 50% {opacity:1} }
        .ict-actions { display:flex; flex-wrap:wrap; gap:8px; }

        .ict-btn {
          font-family:inherit; font-size:13px;
          padding:8px 14px; border-radius:6px;
          border:1px solid #D1CDC7; background:#F9F7F2;
          color:#2C2C2C; cursor:pointer;
          transition: all .2s ease;
        }
        .ict-btn:hover:not(:disabled) { border-color:#C44D38; color:#C44D38; }
        .ict-btn:disabled { opacity:.45; cursor:not-allowed; }
        .ict-btn-primary {
          background:#C44D38; color:#F9F7F2; border-color:#C44D38;
        }
        .ict-btn-primary:hover:not(:disabled) { background:#A63D2B; border-color:#A63D2B; color:#F9F7F2; }
        .ict-btn-ghost { background:transparent; }
        .ict-btn-line { padding:6px 12px; font-size:12px; }

        .ict-rows { list-style:none; padding:0; margin:0; display:flex; flex-direction:column-reverse; gap:8px; }
        .ict-row {
          display:grid;
          grid-template-columns: 110px 1fr 220px 110px;
          align-items:center; gap:12px;
          padding:10px 12px;
          background: rgba(249,247,242,0.6);
          border:1px solid #E5E0D8;
          border-radius:8px;
          transition: border-color .2s, background .2s;
        }
        .ict-row.is-tossing {
          border-color: rgba(196,77,56,0.55);
          background: rgba(196,77,56,0.04);
        }
        .ict-row.is-locked {
          background: rgba(138,154,91,0.06);
          border-color: rgba(138,154,91,0.35);
        }
        @media (max-width:720px) {
          .ict-row { grid-template-columns: 1fr; gap:8px; }
          .ict-row-action { justify-self:start; }
        }

        .ict-row-label { display:flex; align-items:baseline; gap:8px; }
        .ict-line-num {
          font-family:'Cormorant Garamond', serif;
          font-size:22px; color:#2C2C2C;
        }
        .ict-line-pos { font-size:10px; color:#7a6f63; letter-spacing:.08em; text-transform:uppercase; }

        .ict-row-coins { display:flex; gap:14px; perspective:800px; }
        .ict-coin-outer { width:52px; height:52px; transform-style:preserve-3d; }
        .ict-coin {
          width:100%; height:100%;
          position:relative;
          transform-style:preserve-3d;
          transition:transform .35s;
        }
        .ict-coin.is-yang { transform:rotateY(0deg); }
        .ict-coin.is-yin  { transform:rotateY(180deg); }
        .ict-face {
          position:absolute; inset:0;
          border-radius:50%;
          backface-visibility:hidden;
          display:flex; align-items:center; justify-content:center;
          font-family:'Cormorant Garamond', serif;
          font-size:18px; font-weight:700; color:#2C2C2C;
          background: radial-gradient(ellipse at 35% 30%, #f7d97a 0%, #d4a92f 55%, #a5811f 100%);
          box-shadow:
            inset 0 0 0 2px #8a6816,
            inset 0 3px 6px rgba(255,255,255,.35),
            inset 0 -2px 5px rgba(0,0,0,.35),
            0 3px 6px rgba(0,0,0,.25);
        }
        .ict-face-yang { transform: rotateY(0deg); }
        .ict-face-yin  { transform: rotateY(180deg); }
        .ict-symbol { z-index:2; }
        .ict-hole {
          position:absolute; width:10px; height:10px;
          background: rgba(0,0,0,.6);
          border-radius:2px;
          box-shadow: inset 0 0 0 1px #6e5512;
          z-index:1;
        }
        @keyframes ict-toss {
          0%   { transform: translateY(0)    rotateX(0deg)    rotateY(0deg);   }
          30%  { transform: translateY(-70px) rotateX(540deg)  rotateY(180deg); }
          60%  { transform: translateY(-50px) rotateX(900deg)  rotateY(360deg); }
          85%  { transform: translateY(-6px)  rotateX(1260deg) rotateY(540deg); }
          100% { transform: translateY(0)    rotateX(1440deg) rotateY(720deg); }
        }

        .ict-row-result { display:flex; align-items:center; gap:8px; font-size:13px; min-height:30px; }
        .ict-result-spin { color:#C44D38; font-style:italic; }
        .ict-result-empty { color:#9a9388; font-size:12px; }
        .ict-pill {
          display:inline-flex; align-items:center;
          padding:4px 10px; border-radius:999px;
          font-size:12px; font-weight:500;
          border:1px solid;
        }
        .ict-pill-yang { background: rgba(196,77,56,0.08); color:#A63D2B; border-color: rgba(196,77,56,0.35); }
        .ict-pill-yin  { background: rgba(43,46,68,0.06);  color:#2C2C2C; border-color: rgba(43,46,68,0.25); }
        .ict-pill.is-moving { box-shadow: 0 0 0 2px rgba(196,77,56,0.18); }
        .ict-moving-dot { color:#C44D38; font-size:10px; }

        .ict-manual {
          font-family:inherit; font-size:12px;
          padding:5px 8px; border:1px solid #D1CDC7; background:#EBE8E1;
          border-radius:6px; color:#2C2C2C;
        }

        .ict-row-action { justify-self:end; }
        .ict-foot {
          margin-top:14px; font-size:11px; color:#7a6f63; line-height:1.6;
        }
        .ict-foot code { background:rgba(0,0,0,0.05); padding:1px 5px; border-radius:4px; font-size:10px; }

        /* Night theme – glassy on dark background */
        html[data-bg-theme="night"] .ict-toolbar {
          background: rgba(168,120,255,0.06);
          border-color: rgba(168,120,255,0.22);
        }
        html[data-bg-theme="night"] .ict-entropy { color:#C9C3E8; }
        html[data-bg-theme="night"] .ict-entropy code {
          background: rgba(255,255,255,0.08); color:#E8E2FF;
        }
        html[data-bg-theme="night"] .ict-btn {
          background: rgba(255,255,255,0.05);
          border-color: rgba(168,120,255,0.3);
          color:#E8E2FF;
        }
        html[data-bg-theme="night"] .ict-btn-primary {
          background:#C44D38; color:#F9F7F2; border-color:#C44D38;
        }
        html[data-bg-theme="night"] .ict-row {
          background: rgba(16,21,54,0.55);
          border-color: rgba(168,120,255,0.22);
        }
        html[data-bg-theme="night"] .ict-row.is-locked {
          background: rgba(138,154,91,0.12);
          border-color: rgba(138,154,91,0.45);
        }
        html[data-bg-theme="night"] .ict-line-num { color:#F4EFFF; }
        html[data-bg-theme="night"] .ict-line-pos { color:#C9C3E8; }
        html[data-bg-theme="night"] .ict-pill-yin {
          background: rgba(168,120,255,0.10);
          color:#E8E2FF;
          border-color: rgba(168,120,255,0.35);
        }
        html[data-bg-theme="night"] .ict-foot,
        html[data-bg-theme="night"] .ict-result-empty { color:#9b94c0; }
        html[data-bg-theme="night"] .ict-manual {
          background: rgba(255,255,255,0.06); color:#F0EAFF;
          border-color: rgba(168,120,255,0.3);
        }
      `}</style>
    </div>
  );
}
