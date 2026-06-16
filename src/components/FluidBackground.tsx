import { useEffect, useRef } from 'react';
import webGLFluidEnhanced from 'webgl-fluid-enhanced';

export const FluidBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let fluid: webGLFluidEnhanced | null = null;

    if (containerRef.current) {
      fluid = new webGLFluidEnhanced(containerRef.current);
      
      fluid.setConfig({
        simResolution: 256,
        dyeResolution: 1024,
        captureResolution: 512,
        densityDissipation: 2.5, // Faster dissipation for a smoke-like effect
        velocityDissipation: 1.5,
        pressure: 0.1,
        pressureIterations: 20,
        curl: 30,
        splatRadius: 0.25,
        splatForce: 6000,
        shading: true,
        colorful: true,
        colorUpdateSpeed: 10,
        // Mostly black and dark gray with a very slight hint of dark blue
        colorPalette: ['#000000', '#080808', '#0f111a', '#000000', '#0a0d14'],
        hover: true,
        backgroundColor: '#000000',
        transparent: true, // Transparent so it sits nicely behind the light theme
        brightness: 0.4,
        bloom: false, // Turn off bloom for a dense, inky smoke look
        sunrays: false,
      });

      fluid.start();
      
      // Simulate an initial splat for effect
      fluid.multipleSplats(3);
    }

    return () => {
      if (fluid) {
        fluid.stop();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-0 pointer-events-auto opacity-60 mix-blend-multiply" 
    />
  );
};
