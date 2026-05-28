import React, { useRef, useEffect } from 'react';

/*
 * Campo stellare animato su <canvas> — usato dal tema di sfondo "notturno".
 * Leggero: stelle che pulsano, parallax al mouse, qualche stella cadente.
 * Si ferma quando la tab è nascosta e rispetta prefers-reduced-motion.
 */
export default function Starfield({ density = 140, className = '' }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let stars = [];
    let shooting = [];
    let planets = [];
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const buildPlanets = () => {
      // A few distant planets drifting very slowly with parallax.
      planets = [
        { rx: 0.16, ry: 0.22, r: Math.min(w, h) * 0.07, depth: 0.10,
          c1: '#E6B859', c2: '#8a5a1f', ring: false, drift: 0.04 },
        { rx: 0.84, ry: 0.30, r: Math.min(w, h) * 0.10, depth: 0.16,
          c1: '#7C3AED', c2: '#2a1a55', ring: true, drift: -0.03 },
        { rx: 0.72, ry: 0.78, r: Math.min(w, h) * 0.05, depth: 0.08,
          c1: '#5aa0ff', c2: '#16306b', ring: false, drift: 0.05 },
      ];
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
      buildPlanets();
    };
    const init = () => {
      const count = Math.round((w * h) / 9000 * (density / 140));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * 0.02 + 0.005,
        ph: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.6 + 0.2,
        hue: Math.random() < 0.15 ? 45 : (Math.random() < 0.3 ? 265 : 0),
      }));
    };
    let t = 0;
    const drawPlanet = (p, mx, my) => {
      const px = p.rx * w - mx * p.depth * 60 + Math.sin(t * 0.002) * (p.drift * 40);
      const py = p.ry * h - my * p.depth * 60;
      // soft glow halo
      const halo = ctx.createRadialGradient(px, py, p.r * 0.2, px, py, p.r * 2.2);
      halo.addColorStop(0, p.c1 + '22');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(px, py, p.r * 2.2, 0, Math.PI * 2); ctx.fill();
      // planet body with light gradient
      const g = ctx.createRadialGradient(px - p.r * 0.35, py - p.r * 0.35, p.r * 0.1, px, py, p.r);
      g.addColorStop(0, p.c1);
      g.addColorStop(1, p.c2);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2); ctx.fill();
      // optional ring
      if (p.ring) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(-0.5);
        ctx.scale(1, 0.32);
        ctx.strokeStyle = p.c1 + 'aa';
        ctx.lineWidth = Math.max(2, p.r * 0.10);
        ctx.beginPath(); ctx.arc(0, 0, p.r * 1.5, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t++;
      const mx = (mouseRef.current.x - w / 2) * 0.01;
      const my = (mouseRef.current.y - h / 2) * 0.01;
      // planets behind everything
      for (const p of planets) drawPlanet(p, mx, my);
      for (const s of stars) {
        const al = reduceMotion ? s.a : s.a + Math.sin(t * s.tw + s.ph) * 0.25;
        const px = s.x - mx * s.depth * 30;
        const py = s.y - my * s.depth * 30;
        let col;
        if (s.hue === 45) col = `rgba(230,184,89,${Math.max(0, al)})`;
        else if (s.hue === 265) col = `rgba(168,120,255,${Math.max(0, al)})`;
        else col = `rgba(240,234,255,${Math.max(0, al)})`;
        ctx.beginPath(); ctx.arc(px, py, s.r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      }
      if (!reduceMotion && Math.random() < 0.012 && shooting.length < 2) {
        const fromLeft = Math.random() < 0.5;
        shooting.push({ x: fromLeft ? -50 : w + 50, y: Math.random() * h * 0.5, vx: (fromLeft ? 1 : -1) * (Math.random() * 4 + 6), vy: Math.random() * 2 + 1.5, life: 1 });
      }
      shooting = shooting.filter((s) => s.life > 0);
      for (const s of shooting) {
        s.x += s.vx; s.y += s.vy; s.life -= 0.012;
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 6, s.y - s.vy * 6);
        g.addColorStop(0, `rgba(230,184,89,${s.life})`);
        g.addColorStop(1, 'rgba(230,184,89,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 6, s.y - s.vy * 6); ctx.stroke();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    const onMouse = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current);
      else rafRef.current = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouse, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden />;
}
