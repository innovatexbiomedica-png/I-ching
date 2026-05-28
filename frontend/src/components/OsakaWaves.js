import React, { useRef, useEffect } from 'react';

/*
 * "Disegno Osaka" — onde dipinte ANIMATE in stile sumi-e / Hokusai.
 * Canvas che disegna più strati di onde sinusoidali che ondeggiano
 * dolcemente, con cresta di schiuma, in palette inchiostro + oro su
 * pergamena calda. Un sole/luna rosso terracotta sullo sfondo.
 *
 * Leggero: poche onde, requestAnimationFrame, si ferma se tab nascosta,
 * rispetta prefers-reduced-motion (mostra onde statiche).
 */
export default function OsakaWaves({ className = '' }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Full-viewport FIXED backdrop — size from the viewport directly to
      // avoid the width:0 collapse caused by a transformed ancestor.
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Strati di onde: ognuno con colore, ampiezza, lunghezza, velocità, base Y
    const layers = [
      { color: 'rgba(43,42,62,0.10)',  amp: 26, len: 0.0050, speed: 0.012, baseY: 0.62, foam: false },
      { color: 'rgba(124,90,40,0.14)', amp: 30, len: 0.0042, speed: 0.018, baseY: 0.70, foam: false },
      { color: 'rgba(201,162,75,0.22)',amp: 34, len: 0.0036, speed: 0.024, baseY: 0.78, foam: true  },
      { color: 'rgba(43,42,62,0.16)',  amp: 40, len: 0.0030, speed: 0.030, baseY: 0.88, foam: true  },
    ];

    let t = 0;
    const drawWave = (layer, phase) => {
      const baseY = h * layer.baseY;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, baseY);
      for (let x = 0; x <= w; x += 6) {
        const y =
          baseY +
          Math.sin(x * layer.len + phase) * layer.amp +
          Math.sin(x * layer.len * 2.3 + phase * 1.5) * (layer.amp * 0.35);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = layer.color;
      ctx.fill();

      // Cresta di schiuma (linea dorata sottile sul bordo dell'onda)
      if (layer.foam) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const y =
            baseY +
            Math.sin(x * layer.len + phase) * layer.amp +
            Math.sin(x * layer.len * 2.3 + phase * 1.5) * (layer.amp * 0.35);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255,240,200,0.5)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (!reduceMotion) t += 1;

      // Sole/luna rosso terracotta in alto a destra
      const sunX = w * 0.8, sunY = h * 0.22, sunR = Math.min(w, h) * 0.16;
      const g = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
      g.addColorStop(0, 'rgba(196,77,56,0.42)');
      g.addColorStop(0.6, 'rgba(196,77,56,0.16)');
      g.addColorStop(1, 'rgba(196,77,56,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();

      // Onde
      layers.forEach((layer, i) => {
        drawWave(layer, t * layer.speed + i * 1.2);
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current);
      else rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', display: 'block' }}
      aria-hidden
    />
  );
}
