import React, { useRef, useEffect } from 'react';

/*
 * Campo stellare animato su <canvas>.
 * - parallax leggero al movimento del mouse
 * - stelle che pulsano (twinkle)
 * - qualche "stella cadente" occasionale
 * Leggero: ~150 punti, requestAnimationFrame, si ferma se la tab è nascosta.
 */
export default function Starfield({ density = 150, className = '' }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let stars = [];
    let shootingStars = [];

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    };

    const initStars = () => {
      const count = Math.round((w * h) / 9000 * (density / 150));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.2,
        twinkle: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.6 + 0.2, // for parallax
        hue: Math.random() < 0.15 ? 45 : (Math.random() < 0.3 ? 265 : 0), // gold/violet/white
      }));
    };

    const spawnShootingStar = () => {
      if (reduceMotion) return;
      if (Math.random() < 0.012 && shootingStars.length < 2) {
        const fromLeft = Math.random() < 0.5;
        shootingStars.push({
          x: fromLeft ? -50 : w + 50,
          y: Math.random() * h * 0.5,
          vx: (fromLeft ? 1 : -1) * (Math.random() * 4 + 6),
          vy: Math.random() * 2 + 1.5,
          life: 1,
        });
      }
    };

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 1;

      const mx = (mouseRef.current.x - w / 2) * 0.01;
      const my = (mouseRef.current.y - h / 2) * 0.01;

      // Stars
      for (const s of stars) {
        const alpha = reduceMotion
          ? s.baseAlpha
          : s.baseAlpha + Math.sin(t * s.twinkle + s.phase) * 0.25;
        const px = s.x - mx * s.depth * 30;
        const py = s.y - my * s.depth * 30;
        let col;
        if (s.hue === 45) col = `rgba(230,184,89,${Math.max(0, alpha)})`;       // gold
        else if (s.hue === 265) col = `rgba(168,120,255,${Math.max(0, alpha)})`; // violet
        else col = `rgba(240,234,255,${Math.max(0, alpha)})`;                    // white
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      }

      // Shooting stars
      spawnShootingStar();
      shootingStars = shootingStars.filter((ss) => ss.life > 0);
      for (const ss of shootingStars) {
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= 0.012;
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * 6, ss.y - ss.vy * 6);
        grad.addColorStop(0, `rgba(230,184,89,${ss.life})`);
        grad.addColorStop(1, 'rgba(230,184,89,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * 6, ss.y - ss.vy * 6);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const onMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouse, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden
    />
  );
}
