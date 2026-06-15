import React, { useEffect, useRef } from 'react';

export const ParticleAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const particles: Particle[] = [];
        let animationFrameId: number;
        let oldWidth = window.innerWidth;
        let oldHeight = window.innerHeight;

        // Configuration
        const forceMultiplier = 10;
        const returnSpeed = 0.05; // How fast particles spring back
        const baseRadius = 1.2;

        const mouse = {
            x: -1000,
            y: -1000
        };

        const getParticleCount = (width: number, height: number) => {
            const area = width * height;
            // Base area: 1920 * 1080 = ~2,000,000 pixels.
            // Scale linearly, with a limit between 200 and 1500.
            const calculatedCount = Math.floor(area / 1380);
            return Math.max(200, Math.min(1500, calculatedCount));
        };

        const getMaxRepelDistance = () => {
            return window.innerWidth < 640 ? 100 : 150;
        };

        const resizeCanvas = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;

            if (newWidth === oldWidth && newHeight === oldHeight) return;

            canvas.width = newWidth;
            canvas.height = newHeight;

            const targetCount = getParticleCount(newWidth, newHeight);

            if (particles.length === 0) {
                // Initial creation
                for (let i = 0; i < targetCount; i++) {
                    const x = Math.random() * newWidth;
                    const y = Math.random() * newHeight;
                    particles.push(new Particle(x, y));
                }
            } else {
                // Rescale coordinates of existing particles
                const scaleX = newWidth / oldWidth;
                const scaleY = newHeight / oldHeight;

                for (let i = 0; i < particles.length; i++) {
                    particles[i].x *= scaleX;
                    particles[i].y *= scaleY;
                    particles[i].baseX *= scaleX;
                    particles[i].baseY *= scaleY;
                }

                // Adjust count
                if (particles.length < targetCount) {
                    const diff = targetCount - particles.length;
                    for (let i = 0; i < diff; i++) {
                        const x = Math.random() * newWidth;
                        const y = Math.random() * newHeight;
                        particles.push(new Particle(x, y));
                    }
                } else if (particles.length > targetCount) {
                    particles.length = targetCount;
                }
            }

            oldWidth = newWidth;
            oldHeight = newHeight;
        };

        class Particle {
            x: number;
            y: number;
            baseX: number;
            baseY: number;
            density: number;
            radius: number;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.density = (Math.random() * 30) + 1;
                this.radius = Math.random() * baseRadius + 0.5;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fillStyle = '#000000'; // Black particles as requested
                ctx.fill();
            }

            update() {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;

                const maxDistance = getMaxRepelDistance();
                const force = (maxDistance - distance) / maxDistance;
                
                const directionX = forceDirectionX * force * this.density * forceMultiplier;
                const directionY = forceDirectionY * force * this.density * forceMultiplier;

                if (distance < maxDistance) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Spring back to base position
                    if (this.x !== this.baseX) {
                        const dx = this.x - this.baseX;
                        this.x -= dx * returnSpeed;
                    }
                    if (this.y !== this.baseY) {
                        const dy = this.y - this.baseY;
                        this.y -= dy * returnSpeed;
                    }
                }
                this.draw();
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resizeCanvas);
        
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        };

        const handleTouchEnd = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        // Run initial setup directly (without checking oldWidth/Height)
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const targetCount = getParticleCount(canvas.width, canvas.height);
        for (let i = 0; i < targetCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            particles.push(new Particle(x, y));
        }
        
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ 
                zIndex: 0,
                width: '100vw',
                height: '100vh',
                position: 'absolute',
                top: 0,
                left: 0
            }}
        />
    );
};
