import { useEffect, useRef, useCallback } from 'react';

// ── Simplex-like noise for turbulence ──────────────────────────────────────
function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
function grad(hash: number, x: number, y: number): number {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}
const perm = new Uint8Array(512);
for (let i = 0; i < 256; i++) perm[i] = perm[i + 256] = Math.floor(Math.random() * 256);
function noise2D(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);
  const aa = perm[perm[X] + Y];
  const ab = perm[perm[X] + Y + 1];
  const ba = perm[perm[X + 1] + Y];
  const bb = perm[perm[X + 1] + Y + 1];
  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v
  );
}
// Fractal Brownian Motion — stacks multiple noise octaves for organic texture
function fbm(x: number, y: number, octaves = 5): number {
  let value = 0, amplitude = 0.5, frequency = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise2D(x * frequency, y * frequency) * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2.1;
  }
  return value / max;
}
// ───────────────────────────────────────────────────────────────────────────

interface SmokeCloud {
  x: number;
  y: number;
  vx: number;
  vy: number;
  // base radius grows over time
  radius: number;
  maxRadius: number;
  opacity: number;
  life: number;
  maxLife: number;
  // noise offset gives each cloud unique turbulence
  nx: number;
  ny: number;
  // 0 = dark grey/black, 1 = dark navy blue
  blueTint: number;
  // twist direction
  twist: number;
}

export const FluidBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cloudsRef = useRef<SmokeCloud[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, prevX: -9999, prevY: -9999, vx: 0, vy: 0 });
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const createCloud = useCallback((x: number, y: number, vx: number, vy: number): SmokeCloud => {
    const speed = Math.sqrt(vx * vx + vy * vy);
    return {
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      // inherit cursor momentum + some random drift + slight upward rise
      vx: vx * 0.08 + (Math.random() - 0.5) * 1.5,
      vy: vy * 0.08 + (Math.random() - 0.5) * 1.5 - Math.random() * 0.6,
      radius: Math.random() * 20 + 15,
      maxRadius: Math.random() * 120 + 80 + speed * 2,
      opacity: Math.random() * 0.45 + 0.35,
      life: 0,
      maxLife: Math.random() * 150 + 120,
      nx: Math.random() * 100,
      ny: Math.random() * 100,
      blueTint: Math.random() < 0.45 ? Math.random() : 0,
      twist: (Math.random() - 0.5) * 0.025,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // ── Resize ──────────────────────────────────────────────────────────────
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Mouse tracking ───────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const m = mouseRef.current;
      m.prevX = m.x; m.prevY = m.y;
      m.x = e.clientX; m.y = e.clientY;
      m.vx = m.x - m.prevX; m.vy = m.y - m.prevY;

      const speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
      // Spawn 2-10 clouds per frame depending on speed
      const count = Math.max(2, Math.min(10, Math.floor(speed / 4)));
      for (let i = 0; i < count; i++) {
        const t = i / count;
        cloudsRef.current.push(createCloud(
          m.prevX + (m.x - m.prevX) * t,
          m.prevY + (m.y - m.prevY) * t,
          m.vx, m.vy
        ));
      }
      // Hard cap to prevent runaway
      if (cloudsRef.current.length > 600) cloudsRef.current.splice(0, cloudsRef.current.length - 600);
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Draw a single volumetric smoke cloud using FBM-warped radial layers ──
    const drawCloud = (cloud: SmokeCloud, t: number) => {
      const { x, y, radius, opacity, nx, ny, blueTint, twist } = cloud;
      const lifeRatio = cloud.life / cloud.maxLife;

      // Fade envelope: ramp in fast, sustain, fade out slowly
      let alpha: number;
      if (lifeRatio < 0.08) alpha = opacity * (lifeRatio / 0.08);
      else if (lifeRatio > 0.55) alpha = opacity * (1 - (lifeRatio - 0.55) / 0.45);
      else alpha = opacity;

      if (alpha <= 0.001) return;

      // Multiple noise-warped layers give volume and texture
      const layerCount = 7;
      for (let l = 0; l < layerCount; l++) {
        const layerT = l / layerCount;
        const angle = twist * cloud.life + layerT * Math.PI * 2;
        const noiseScale = 0.006 + layerT * 0.003;
        const noiseT = t * 0.0003 + cloud.nx;
        const n = fbm(
          (x + Math.cos(angle) * radius * 0.5) * noiseScale + noiseT,
          (y + Math.sin(angle) * radius * 0.5) * noiseScale + cloud.ny,
        );
        // Noise displaces the cloud center slightly for turbulence
        const dx = n * radius * 0.45;
        const dy = fbm(x * noiseScale + cloud.ny + 3.7, y * noiseScale + noiseT) * radius * 0.45;
        const lx = x + dx;
        const ly = y + dy;
        const lRadius = radius * (0.6 + layerT * 0.7);
        const lAlpha = alpha * (1 - layerT * 0.6) / layerCount * 4;

        ctx.save();
        ctx.globalAlpha = Math.min(lAlpha, 0.55);
        ctx.globalCompositeOperation = 'multiply';

        const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lRadius);
        if (blueTint > 0.5) {
          // Dark navy / slate-blue smoke
          const sat = Math.round(blueTint * 25);
          grad.addColorStop(0,   `hsl(220, ${sat}%, 12%)`);
          grad.addColorStop(0.35,`hsl(220, ${sat - 5}%, 18%)`);
          grad.addColorStop(0.7, `hsl(215, ${sat - 8}%, 30%)`);
          grad.addColorStop(1,   `hsl(215, 10%, 55%)`);
        } else {
          // Pure dark charcoal/near-black smoke
          grad.addColorStop(0,   'hsl(0, 0%, 8%)');
          grad.addColorStop(0.35,'hsl(0, 0%, 15%)');
          grad.addColorStop(0.7, 'hsl(0, 0%, 30%)');
          grad.addColorStop(1,   'hsl(0, 0%, 60%)');
        }

        // Draw an ellipse slightly elongated by noise for tendril shapes
        ctx.beginPath();
        ctx.ellipse(lx, ly, lRadius, lRadius * (0.75 + n * 0.5), angle, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }
    };

    // ── Animation loop ───────────────────────────────────────────────────────
    const animate = (timestamp: number) => {
      timeRef.current = timestamp;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const clouds = cloudsRef.current;
      for (let i = clouds.length - 1; i >= 0; i--) {
        const c = clouds[i];
        c.life++;
        if (c.life >= c.maxLife) { clouds.splice(i, 1); continue; }

        // Physics: position, friction, grow
        c.x += c.vx;
        c.y += c.vy;
        c.vx *= 0.96;
        c.vy *= 0.96;
        c.radius += (c.maxRadius - c.radius) * 0.025; // easing growth

        drawCloud(c, timestamp);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [createCloud]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
