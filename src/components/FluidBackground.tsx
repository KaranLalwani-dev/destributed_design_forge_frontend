import { useEffect, useRef, useCallback } from 'react';

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  hue: number; // slight blue tint variation
}

export const FluidBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SmokeParticle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, prevX: -1000, prevY: -1000 });
  const animFrameRef = useRef<number>(0);

  const createSmokeParticle = useCallback((x: number, y: number, vx: number, vy: number): SmokeParticle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1.5 + 0.3;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed + vx * 0.15,
      vy: Math.sin(angle) * speed + vy * 0.15 - Math.random() * 0.8, // slight upward drift
      size: Math.random() * 25 + 15,
      opacity: Math.random() * 0.35 + 0.15,
      life: 0,
      maxLife: Math.random() * 80 + 60,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      hue: Math.random() > 0.6 ? 220 + Math.random() * 20 : 0, // 40% chance of subtle dark blue
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      // Calculate velocity
      const vx = mouseRef.current.x - mouseRef.current.prevX;
      const vy = mouseRef.current.y - mouseRef.current.prevY;
      const speed = Math.sqrt(vx * vx + vy * vy);

      // Emit particles proportional to mouse speed
      const count = Math.min(Math.floor(speed / 3) + 1, 8);
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const px = mouseRef.current.prevX + (mouseRef.current.x - mouseRef.current.prevX) * t;
        const py = mouseRef.current.prevY + (mouseRef.current.y - mouseRef.current.prevY) * t;
        particlesRef.current.push(
          createSmokeParticle(
            px + (Math.random() - 0.5) * 10,
            py + (Math.random() - 0.5) * 10,
            vx,
            vy
          )
        );
      }

      // Cap total particles
      if (particlesRef.current.length > 500) {
        particlesRef.current = particlesRef.current.slice(-500);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMouseMove({
          clientX: touch.clientX,
          clientY: touch.clientY,
        } as MouseEvent);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const particles = particlesRef.current;
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97; // friction
        p.vy *= 0.97;
        p.rotation += p.rotationSpeed;
        p.size += 0.4; // smoke expands over time

        // Fade curve: fade in quickly, sustain, then fade out
        const lifeRatio = p.life / p.maxLife;
        let alpha: number;
        if (lifeRatio < 0.1) {
          alpha = p.opacity * (lifeRatio / 0.1); // fade in
        } else if (lifeRatio > 0.5) {
          alpha = p.opacity * (1 - (lifeRatio - 0.5) / 0.5); // fade out
        } else {
          alpha = p.opacity;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;

        // Draw a soft, blurry smoke puff using radial gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        if (p.hue > 0) {
          // Dark blue tinted smoke
          gradient.addColorStop(0, `hsla(${p.hue}, 30%, 12%, 0.6)`);
          gradient.addColorStop(0.4, `hsla(${p.hue}, 25%, 15%, 0.3)`);
          gradient.addColorStop(1, `hsla(${p.hue}, 20%, 18%, 0)`);
        } else {
          // Pure dark/black smoke
          gradient.addColorStop(0, 'rgba(15, 15, 15, 0.5)');
          gradient.addColorStop(0.4, 'rgba(25, 25, 25, 0.25)');
          gradient.addColorStop(1, 'rgba(35, 35, 35, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [createSmokeParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
