import Balatro from './Balatro';

export const FluidBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ opacity: 0.18 }} // Subtle — patterns come and go without dominating
    >
      <Balatro
        isRotate={true}
        mouseInteraction={true}
        spinSpeed={3.5}
        spinRotation={-1.5}
        spinAmount={0.2}
        spinEase={1.0}
        pixelFilter={1200}
        contrast={3.0}
        lighting={0.3}
        // Near-black monochrome palette — very subtle on the light cream background
        color1="#0a0a0a"
        color2="#1a1a2e"
        color3="#0d0d18"
      />
    </div>
  );
};
