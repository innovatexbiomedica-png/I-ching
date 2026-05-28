import React, { useRef, useEffect } from 'react';

/*
 * Cielo notturno cosmico e interattivo:
 *  - campo stellare che pulsa (twinkle)
 *  - LUNA con crateri e alone
 *  - PIANETI alla deriva (uno con anelli)
 *  - GALASSIE a spirale che ruotano lentamente
 *  - COSTELLAZIONI disegnate (stelle connesse da linee)
 *  - COMETE con nucleo e coda lunga
 *  - parallax al movimento del mouse
 * Performante: requestAnimationFrame, pausa su tab nascosta,
 * fallback statico per prefers-reduced-motion.
 */
export default function Starfield({ density = 200, className = '' }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let stars = [];
    let shooting = [];
    let planets = [];
    let galaxies = [];
    let constellations = [];
    let comets = [];

    const rand = (a, b) => a + Math.random() * (b - a);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      // This is a full-viewport FIXED backdrop. An ancestor with a CSS
      // transform/will-change can establish a containing block that
      // collapses the layout width of inset:0 children to 0. So we size
      // straight from the viewport instead of trusting layout metrics.
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildAll();
    };

    const buildAll = () => {
      const minD = Math.min(w, h);

      // Stars
      const count = Math.round((w * h) / 9000 * (density / 200));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * 0.02 + 0.005,
        ph: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.6 + 0.2,
        hue: Math.random() < 0.15 ? 45 : (Math.random() < 0.3 ? 265 : 0),
      }));

      // Moon (top-left area)
      moon = {
        x: w * 0.14, y: h * 0.18, r: minD * 0.085, depth: 0.06,
        craters: Array.from({ length: 7 }, () => ({
          dx: rand(-0.5, 0.5), dy: rand(-0.5, 0.5), cr: rand(0.06, 0.2),
        })),
      };

      // Planets
      planets = [
        { rx: 0.86, ry: 0.32, r: minD * 0.06, depth: 0.16, c1: '#E6B859', c2: '#8a5a1f', ring: true, drift: -0.03 },
        { rx: 0.70, ry: 0.80, r: minD * 0.04, depth: 0.10, c1: '#5aa0ff', c2: '#16306b', ring: false, drift: 0.05 },
      ];

      // Galaxies (spiral) — particles on logarithmic spiral arms
      const makeGalaxy = (cx, cy, radius, arms, tint, rotSpeed) => {
        const pts = [];
        const perArm = 70;
        for (let a = 0; a < arms; a++) {
          const armOffset = (a / arms) * Math.PI * 2;
          for (let i = 0; i < perArm; i++) {
            const tt = i / perArm;
            const ang = armOffset + tt * Math.PI * 3.2;
            const rr = tt * radius;
            const jitter = (Math.random() - 0.5) * radius * 0.06;
            pts.push({
              ang, rr: rr + jitter,
              size: rand(0.4, 1.4),
              alpha: (1 - tt) * 0.8 + 0.1,
            });
          }
        }
        return { cx, cy, radius, pts, tint, rot: Math.random() * Math.PI * 2, rotSpeed };
      };
      galaxies = [
        makeGalaxy(w * 0.78, h * 0.62, minD * 0.16, 2, '#A878FF', 0.0008),
        makeGalaxy(w * 0.30, h * 0.85, minD * 0.11, 3, '#E6B859', -0.0011),
      ];

      // Constellations — clusters of bright stars connected by faint lines
      const makeConstellation = (cx, cy, scale) => {
        const n = Math.floor(rand(4, 6));
        const nodes = [];
        let px = cx, py = cy;
        for (let i = 0; i < n; i++) {
          px += rand(-scale, scale);
          py += rand(-scale, scale);
          nodes.push({ x: px, y: py, r: rand(1.2, 2.4) });
        }
        return { nodes, depth: rand(0.15, 0.4), pulse: Math.random() * Math.PI * 2 };
      };
      constellations = [
        makeConstellation(w * 0.5, h * 0.3, minD * 0.05),
        makeConstellation(w * 0.22, h * 0.55, minD * 0.045),
        makeConstellation(w * 0.62, h * 0.2, minD * 0.04),
      ];

      comets = [];
    };

    let moon = null;
    let t = 0;

    const drawMoon = (mx, my) => {
      if (!moon) return;
      const x = moon.x - mx * moon.depth * 40;
      const y = moon.y - my * moon.depth * 40;
      const r = moon.r;
      // halo
      const halo = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 2.6);
      halo.addColorStop(0, 'rgba(240,238,255,0.18)');
      halo.addColorStop(1, 'rgba(240,238,255,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, Math.PI * 2); ctx.fill();
      // body
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
      g.addColorStop(0, '#FBFAF4');
      g.addColorStop(1, '#C9C7D8');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      // craters
      ctx.fillStyle = 'rgba(150,148,170,0.4)';
      for (const c of moon.craters) {
        ctx.beginPath();
        ctx.arc(x + c.dx * r, y + c.dy * r, c.cr * r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawPlanet = (p, mx, my) => {
      const px = p.rx * w - mx * p.depth * 60 + Math.sin(t * 0.002) * (p.drift * 40);
      const py = p.ry * h - my * p.depth * 60;
      const halo = ctx.createRadialGradient(px, py, p.r * 0.2, px, py, p.r * 2.2);
      halo.addColorStop(0, p.c1 + '22'); halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(px, py, p.r * 2.2, 0, Math.PI * 2); ctx.fill();
      const g = ctx.createRadialGradient(px - p.r * 0.35, py - p.r * 0.35, p.r * 0.1, px, py, p.r);
      g.addColorStop(0, p.c1); g.addColorStop(1, p.c2);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2); ctx.fill();
      if (p.ring) {
        ctx.save(); ctx.translate(px, py); ctx.rotate(-0.5); ctx.scale(1, 0.32);
        ctx.strokeStyle = p.c1 + 'aa'; ctx.lineWidth = Math.max(2, p.r * 0.1);
        ctx.beginPath(); ctx.arc(0, 0, p.r * 1.5, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
    };

    const drawGalaxy = (gx, mx, my) => {
      if (!reduceMotion) gx.rot += gx.rotSpeed;
      const cx = gx.cx - mx * 0.08 * 40;
      const cy = gx.cy - my * 0.08 * 40;
      // core glow
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, gx.radius * 0.9);
      core.addColorStop(0, gx.tint + '55');
      core.addColorStop(0.4, gx.tint + '18');
      core.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx, cy, gx.radius * 0.9, 0, Math.PI * 2); ctx.fill();
      // spiral particles
      for (const pt of gx.pts) {
        const a = pt.ang + gx.rot;
        const x = cx + Math.cos(a) * pt.rr;
        const y = cy + Math.sin(a) * pt.rr * 0.55; // tilt
        ctx.fillStyle = gx.tint;
        ctx.globalAlpha = pt.alpha * 0.7;
        ctx.beginPath(); ctx.arc(x, y, pt.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const drawConstellation = (c, mx, my) => {
      const ox = -mx * c.depth * 40;
      const oy = -my * c.depth * 40;
      const tw = reduceMotion ? 0.7 : 0.5 + Math.sin(t * 0.01 + c.pulse) * 0.3;
      // lines
      ctx.strokeStyle = `rgba(200,190,255,${0.12 + tw * 0.1})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      c.nodes.forEach((n, i) => {
        const x = n.x + ox, y = n.y + oy;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      // node stars
      for (const n of c.nodes) {
        const x = n.x + ox, y = n.y + oy;
        ctx.fillStyle = `rgba(245,240,255,${0.6 + tw * 0.4})`;
        ctx.beginPath(); ctx.arc(x, y, n.r, 0, Math.PI * 2); ctx.fill();
        // tiny cross glint
        ctx.strokeStyle = `rgba(230,184,89,${tw * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - n.r * 2, y); ctx.lineTo(x + n.r * 2, y);
        ctx.moveTo(x, y - n.r * 2); ctx.lineTo(x, y + n.r * 2);
        ctx.stroke();
      }
    };

    const spawnComet = () => {
      if (reduceMotion) return;
      if (Math.random() < 0.004 && comets.length < 1) {
        const fromLeft = Math.random() < 0.5;
        comets.push({
          x: fromLeft ? -80 : w + 80,
          y: rand(0, h * 0.4),
          vx: (fromLeft ? 1 : -1) * rand(2.2, 3.4),
          vy: rand(0.6, 1.2),
          life: 1, len: rand(120, 200),
        });
      }
    };

    const drawComets = () => {
      spawnComet();
      comets = comets.filter((c) => c.life > 0 && c.x > -200 && c.x < w + 200);
      for (const c of comets) {
        c.x += c.vx; c.y += c.vy; c.life -= 0.0025;
        const tailX = c.x - c.vx / Math.hypot(c.vx, c.vy) * c.len;
        const tailY = c.y - c.vy / Math.hypot(c.vx, c.vy) * c.len;
        const g = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
        g.addColorStop(0, `rgba(255,245,220,${c.life})`);
        g.addColorStop(0.4, `rgba(230,184,89,${c.life * 0.5})`);
        g.addColorStop(1, 'rgba(230,184,89,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(tailX, tailY); ctx.stroke();
        // glowing head
        const hg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 6);
        hg.addColorStop(0, `rgba(255,250,235,${c.life})`);
        hg.addColorStop(1, 'rgba(255,250,235,0)');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(c.x, c.y, 6, 0, Math.PI * 2); ctx.fill();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t++;
      const mx = (mouseRef.current.x - w / 2) * 0.01;
      const my = (mouseRef.current.y - h / 2) * 0.01;

      // Layer order: galaxies (deep) -> planets -> moon -> stars -> constellations -> comets
      for (const gx of galaxies) drawGalaxy(gx, mx, my);
      for (const p of planets) drawPlanet(p, mx, my);
      drawMoon(mx, my);

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

      for (const c of constellations) drawConstellation(c, mx, my);
      drawComets();

      // small fast meteors (keep the originals too)
      if (!reduceMotion && Math.random() < 0.012 && shooting.length < 2) {
        const fl = Math.random() < 0.5;
        shooting.push({ x: fl ? -50 : w + 50, y: Math.random() * h * 0.5, vx: (fl ? 1 : -1) * (Math.random() * 4 + 6), vy: Math.random() * 2 + 1.5, life: 1 });
      }
      shooting = shooting.filter((s) => s.life > 0);
      for (const s of shooting) {
        s.x += s.vx; s.y += s.vy; s.life -= 0.012;
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 6, s.y - s.vy * 6);
        g.addColorStop(0, `rgba(240,234,255,${s.life})`);
        g.addColorStop(1, 'rgba(240,234,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.4;
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

    resize();
    draw();
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

  return <canvas ref={canvasRef} className={className} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', display: 'block' }} aria-hidden />;
}
