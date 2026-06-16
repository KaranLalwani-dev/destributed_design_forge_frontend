import { useEffect, useRef } from 'react';
import webGLFluidEnhanced from 'webgl-fluid-enhanced';

export const FluidBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      webGLFluidEnhanced.simulation(canvasRef.current, {
        SIM_RESOLUTION: 256,
        DYE_RESOLUTION: 1024,
        CAPTURE_RESOLUTION: 512,
        DENSITY_DISSIPATION: 2.5, // Faster dissipation for a smoke-like effect
        VELOCITY_DISSIPATION: 1.5,
        PRESSURE: 0.1,
        PRESSURE_ITERATIONS: 20,
        CURL: 30,
        INITIAL: true,
        SPLAT_AMOUNT: 3,
        SPLAT_RADIUS: 0.25,
        SPLAT_FORCE: 6000,
        SHADING: true,
        COLORFUL: true,
        COLOR_UPDATE_SPEED: 10,
        // Mostly black and dark gray with a very slight hint of dark blue
        COLOR_PALETTE: ['#000000', '#080808', '#0f111a', '#000000', '#0a0d14'],
        HOVER: true,
        BACK_COLOR: '#000000',
        TRANSPARENT: true, // Transparent so it sits nicely behind the light theme
        BRIGHTNESS: 0.4,
        BLOOM: false, // Turn off bloom for a dense, inky smoke look
        SUNRAYS: false,
      });
    }

    return () => {
      // No explicit destroy method provided by webGLFluidEnhanced in its docs, 
      // but it binds to the canvas which is unmounted.
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-auto">
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-60 mix-blend-multiply" // Adding opacity and multiply blend to integrate well with light background
      />
    </div>
  );
};
