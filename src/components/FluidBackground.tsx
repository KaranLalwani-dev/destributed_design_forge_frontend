import { useEffect, useRef } from 'react';

export const FluidBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // ── Setup ────────────────────────────────────────────────────────────────
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    const resize = () => {
      // Save current image, resize, then restore (so strokes don't vanish on resize)
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = W();
      canvas.height = H();
      ctx.putImageData(img, 0, 0);
    };
    canvas.width = W();
    canvas.height = H();
    window.addEventListener('resize', resize);

    // ── State ────────────────────────────────────────────────────────────────
    const mouse = { x: W() / 2, y: H() / 2, px: W() / 2, py: H() / 2, vx: 0, vy: 0 };
    let painting = false;

    // ── Brush stroke helper ──────────────────────────────────────────────────
    // Each "stroke" is a cluster of overlapping soft ellipses at very low alpha.
    // Because the canvas is never cleared (just slowly faded), they accumulate
    // into the dense, swirling ink-smoke look of the reference.
    const stroke = (x: number, y: number, vx: number, vy: number) => {
      const speed = Math.sqrt(vx * vx + vy * vy);
      const angle = Math.atan2(vy, vx);
      
      // Number of brush dots: more when moving fast
      const count = Math.max(3, Math.min(12, Math.floor(speed * 0.8 + 3)));

      for (let i = 0; i < count; i++) {
        // Scatter each dot slightly around the cursor
        const scatter = speed * 0.4 + 8;
        const dx = (Math.random() - 0.5) * scatter;
        const dy = (Math.random() - 0.5) * scatter;
        const cx = x + dx;
        const cy = y + dy;

        // Alternate between large soft puffs and narrow tendrils
        const isTendril = Math.random() < 0.4;
        const baseR = isTendril
          ? Math.random() * 8 + 4         // thin tendril
          : Math.random() * 40 + 20;      // large puff

        // Tendril is a stretched ellipse along the direction of travel
        const rx = isTendril ? baseR * (3 + speed * 0.2) : baseR;
        const ry = baseR;

        // Very slight blue tint on ~35% of strokes
        const useBlue = Math.random() < 0.35;
        const alpha = (isTendril ? 0.04 : 0.025) + Math.random() * 0.015;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle + (Math.random() - 0.5) * 0.8);
        ctx.globalAlpha = alpha;

        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        if (useBlue) {
          g.addColorStop(0,   'rgba(30, 35, 60, 1)');
          g.addColorStop(0.5, 'rgba(20, 25, 50, 0.6)');
          g.addColorStop(1,   'rgba(10, 15, 40, 0)');
        } else {
          g.addColorStop(0,   'rgba(10, 10, 12, 1)');
          g.addColorStop(0.5, 'rgba(18, 18, 22, 0.6)');
          g.addColorStop(1,   'rgba(25, 25, 30, 0)');
        }

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    // ── Mouse events ─────────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mouse.px = mouse.x; mouse.py = mouse.y;
      mouse.x = e.clientX; mouse.y = e.clientY;
      mouse.vx = mouse.x - mouse.px;
      mouse.vy = mouse.y - mouse.py;
      painting = true;
    };
    const onLeave = () => { painting = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    // ── Animation loop ────────────────────────────────────────────────────────
    // KEY TECHNIQUE: Instead of clearRect, we draw the background color at very
    // low opacity each frame. This makes existing strokes FADE gradually while
    // new strokes ACCUMULATE — creating the dense, swirling ink effect.
    const BG = 'rgba(224, 214, 200, 0.018)'; // matches --background cream color, very low alpha
    
    let lastPaint = 0;
    const animate = (ts: number) => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Fade existing ink slightly toward the background
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W(), H());

      // Paint new strokes if mouse is moving
      if (painting && ts - lastPaint > 16) { // throttle to ~60fps
        stroke(mouse.x, mouse.y, mouse.vx, mouse.vy);
        // Also draw a couple interpolated strokes between prev and current pos
        // for smooth trails at high speeds
        if (Math.abs(mouse.vx) > 5 || Math.abs(mouse.vy) > 5) {
          stroke(
            (mouse.x + mouse.px) / 2,
            (mouse.y + mouse.py) / 2,
            mouse.vx, mouse.vy
          );
        }
        lastPaint = ts;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
