import React, { useEffect, useRef, useState } from 'react';

/*
 * Animazione 3D delle 3 monete cinesi che vengono lanciate per costruire
 * un esagramma. Pure CSS3D, nessuna libreria. Ogni lancio costruisce
 * UNA linea (yin spezzata o yang continua); 6 lanci → esagramma completo.
 *
 * Mostra anche, accanto alle monete, l'esagramma che si costruisce dal
 * basso verso l'alto (come nel rituale tradizionale).
 *
 * I valori delle monete seguono la convenzione I Ching:
 *   testa (yang 陽)  = 3 punti
 *   croce (yin 陰)   = 2 punti
 *   Somma 6 → vecchio yin   (linea spezzata mutevole)
 *   Somma 7 → giovane yang  (linea continua statica)
 *   Somma 8 → giovane yin   (linea spezzata statica)
 *   Somma 9 → vecchio yang  (linea continua mutevole)
 */

// Singola moneta con due facce. Le tre rotazioni "spin"
// vengono applicate via inline-style perché variano per moneta.
function Coin({ face, spinning, delayMs }) {
  // face: 'yang' (testa, 3 punti) or 'yin' (croce, 2 punti)
  return (
    <div
      className="coin-outer"
      style={{
        animation: spinning
          ? `coin-toss 1.2s cubic-bezier(.4,.0,.2,1) ${delayMs}ms forwards`
          : undefined,
      }}
    >
      <div className={`coin ${face === 'yin' ? 'is-yin' : 'is-yang'}`}>
        {/* Faccia "yang" - testa */}
        <div className="coin-face coin-face-yang">
          <span className="coin-symbol">陽</span>
          <span className="coin-hole" />
        </div>
        {/* Faccia "yin" - croce */}
        <div className="coin-face coin-face-yin">
          <span className="coin-symbol">陰</span>
          <span className="coin-hole" />
        </div>
      </div>
    </div>
  );
}

function HexagramBuilder({ lines, currentLineIndex }) {
  // Visualizza linee dal BASSO (line 1) verso l'ALTO (line 6).
  // 'lines' è un array di 6 elementi: null (non ancora), o
  //   { type: 'yang'|'yin', moving: bool }.
  return (
    <div className="hexagram-builder">
      {[5, 4, 3, 2, 1, 0].map((idx) => {
        const ln = lines[idx];
        const isActive = idx === currentLineIndex;
        if (!ln) {
          return (
            <div key={idx} className={`hex-line hex-empty ${isActive ? 'is-active' : ''}`}>
              <span className="line-num">{idx + 1}</span>
              <div className="line-placeholder" />
            </div>
          );
        }
        const isYang = ln.type === 'yang';
        return (
          <div
            key={idx}
            className={`hex-line hex-${ln.type} ${ln.moving ? 'is-moving' : ''}`}
          >
            <span className="line-num">{idx + 1}</span>
            <div className="line-shape">
              {isYang ? (
                <div className="bar full" />
              ) : (
                <>
                  <div className="bar half" />
                  <div className="bar-gap" />
                  <div className="bar half" />
                </>
              )}
              {ln.moving && <div className="moving-dot" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}


const CoinTossAnimation = ({ autoplay = true, height = 380 }) => {
  // 6 linee dell'esagramma. Inizia tutto null.
  const [lines, setLines] = useState([null, null, null, null, null, null]);
  // Indice della linea che stiamo costruendo (0-5). -1 = non in lancio.
  const [currentLine, setCurrentLine] = useState(-1);
  // Le 3 facce mostrate al momento sulle monete: ['yang','yin','yang'] ecc.
  const [coinFaces, setCoinFaces] = useState(['yang', 'yang', 'yang']);
  const [spinning, setSpinning] = useState(false);
  const timersRef = useRef([]);

  // Genera UN tiro di 3 monete e ricava la linea corrispondente.
  const tossOnce = (lineIdx) => {
    return new Promise((resolve) => {
      // Risultato random delle 3 monete (yang=3, yin=2)
      const c1 = Math.random() < 0.5 ? 'yang' : 'yin';
      const c2 = Math.random() < 0.5 ? 'yang' : 'yin';
      const c3 = Math.random() < 0.5 ? 'yang' : 'yin';
      const total = [c1, c2, c3].reduce((s, c) => s + (c === 'yang' ? 3 : 2), 0);
      // 6 = vecchio yin (mut, spezzata)
      // 7 = giovane yang (statica, continua)
      // 8 = giovane yin (statica, spezzata)
      // 9 = vecchio yang (mut, continua)
      let type, moving;
      if (total === 6) { type = 'yin';  moving = true;  }
      else if (total === 7) { type = 'yang'; moving = false; }
      else if (total === 8) { type = 'yin';  moving = false; }
      else { type = 'yang'; moving = true;  }

      setCurrentLine(lineIdx);
      setSpinning(true);
      // Cambia le facce delle monete a metà animazione per dare
      // l'illusione che si stiano girando in volo.
      const flipT = setTimeout(() => setCoinFaces([c1, c2, c3]), 600);
      timersRef.current.push(flipT);
      // Finita l'animazione, scrivi la linea sul builder.
      const settleT = setTimeout(() => {
        setSpinning(false);
        setLines((prev) => {
          const cp = [...prev];
          cp[lineIdx] = { type, moving };
          return cp;
        });
        resolve({ type, moving });
      }, 1300);
      timersRef.current.push(settleT);
    });
  };

  const runFullSequence = async () => {
    // Reset
    setLines([null, null, null, null, null, null]);
    setCurrentLine(-1);
    await new Promise((r) => setTimeout(r, 300));
    for (let i = 0; i < 6; i++) {
      await tossOnce(i);
      await new Promise((r) => setTimeout(r, 400)); // pausa tra un lancio e il prossimo
    }
    // Pausa di contemplazione, poi ripeti se autoplay
    if (autoplay) {
      const t = setTimeout(() => runFullSequence(), 3500);
      timersRef.current.push(t);
    } else {
      setCurrentLine(-1);
    }
  };

  useEffect(() => {
    runFullSequence();
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  return (
    <div className="coin-toss-stage" style={{ minHeight: height }}>
      {/* Monete a sinistra */}
      <div className="coins-area">
        <Coin face={coinFaces[0]} spinning={spinning} delayMs={0} />
        <Coin face={coinFaces[1]} spinning={spinning} delayMs={120} />
        <Coin face={coinFaces[2]} spinning={spinning} delayMs={240} />
      </div>

      {/* Esagramma in costruzione a destra */}
      <div className="builder-area">
        <div className="builder-label">L'esagramma si costruisce dal basso</div>
        <HexagramBuilder lines={lines} currentLineIndex={currentLine} />
      </div>

      <style>{`
        .coin-toss-stage {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: center;
          justify-items: center;
          padding: 24px;
          border-radius: 16px;
          background: linear-gradient(180deg, rgba(249,247,242,0.6), rgba(235,232,225,0.6));
          border: 1px solid #E5E0D8;
        }
        @media (max-width: 720px) {
          .coin-toss-stage { grid-template-columns: 1fr; gap: 24px; padding: 16px; }
        }

        .coins-area {
          display: flex;
          gap: 18px;
          perspective: 800px;
        }
        .coin-outer {
          width: 64px; height: 64px;
          transform-style: preserve-3d;
        }
        .coin {
          width: 100%; height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.4s;
        }
        .coin.is-yin   { transform: rotateY(180deg); }
        .coin.is-yang  { transform: rotateY(0deg);   }

        .coin-face {
          position: absolute; inset: 0;
          border-radius: 50%;
          backface-visibility: hidden;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 700;
          color: #2C2C2C;
          background:
            radial-gradient(ellipse at 35% 30%, #f7d97a 0%, #d4a92f 55%, #a5811f 100%);
          box-shadow:
            inset 0 0 0 2px #8a6816,
            inset 0 4px 8px rgba(255,255,255,.35),
            inset 0 -3px 6px rgba(0,0,0,.35),
            0 4px 8px rgba(0,0,0,.25);
        }
        .coin-face-yang { transform: rotateY(0deg);   }
        .coin-face-yin  { transform: rotateY(180deg); }
        .coin-symbol { z-index: 2; }
        .coin-hole {
          position: absolute;
          width: 14px; height: 14px;
          background: rgba(0,0,0,.65);
          border-radius: 2px;
          box-shadow: inset 0 0 0 1px #6e5512;
          z-index: 1;
        }

        @keyframes coin-toss {
          0%   { transform: translateY(0)    rotateX(0deg)   rotateY(0deg);   }
          30%  { transform: translateY(-90px) rotateX(540deg) rotateY(180deg); }
          60%  { transform: translateY(-70px) rotateX(900deg) rotateY(360deg); }
          80%  { transform: translateY(-8px)  rotateX(1200deg) rotateY(540deg); }
          100% { transform: translateY(0)    rotateX(1440deg) rotateY(720deg); }
        }

        .builder-area {
          width: 100%; max-width: 220px;
        }
        .builder-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #7a6f63;
          text-align: center;
          margin-bottom: 12px;
        }
        .hexagram-builder {
          display: flex; flex-direction: column; gap: 8px;
        }
        .hex-line {
          display: flex; align-items: center; gap: 12px;
          opacity: 0; transform: translateX(-8px);
          animation: line-appear 0.6s ease-out forwards;
          position: relative;
        }
        .hex-empty { opacity: 0.35; animation: none; transform: none; }
        .hex-empty.is-active {
          opacity: 0.85;
          animation: pulse 1s ease-in-out infinite;
        }
        @keyframes line-appear {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
        .line-num {
          font-size: 9px; color: #7a6f63;
          width: 12px; text-align: right;
          font-family: 'JetBrains Mono', monospace;
        }
        .line-shape {
          display: flex; align-items: center; gap: 4px;
          flex: 1; min-height: 16px;
          position: relative;
        }
        .line-placeholder {
          flex: 1; height: 4px; border-radius: 2px;
          background: rgba(44,44,44,.12);
        }
        .bar {
          height: 6px;
          background: linear-gradient(180deg, #2c2c2c, #4a4a4a);
          border-radius: 2px;
        }
        .bar.full { flex: 1; }
        .bar.half { flex: 1; }
        .bar-gap { width: 8px; }
        .hex-moving .moving-dot,
        .is-moving .moving-dot {
          position: absolute;
          right: -14px; top: 50%; transform: translateY(-50%);
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #C44D38;
          box-shadow: 0 0 8px #C44D38aa;
          animation: pulse 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CoinTossAnimation;
