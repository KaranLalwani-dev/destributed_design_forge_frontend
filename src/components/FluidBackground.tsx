import Balatro from './Balatro';

// Each spot has its own position, size, timing, and slight color variation
const SPOTS = [
  {
    x: '10%', y: '15%',
    w: '55vw', h: '50vw',
    delay: '0s', duration: '14s',
    color1: '#8B1A1A', color2: '#1B3F6E', color3: '#0e1b2a',
    spinOffset: 0,
  },
  {
    x: '82%', y: '28%',
    w: '45vw', h: '40vw',
    delay: '5s', duration: '11s',
    color1: '#6B2020', color2: '#0d2d52', color3: '#12151f',
    spinOffset: 1.5,
  },
  {
    x: '55%', y: '82%',
    w: '50vw', h: '45vw',
    delay: '9s', duration: '13s',
    color1: '#7a1818', color2: '#163358', color3: '#0f1922',
    spinOffset: 3,
  },
];

export const FluidBackground: React.FC = () => {
  return (
    <>
      <style>{`
        @keyframes spotAppear {
          0%, 100%  { opacity: 0; }
          15%, 85%  { opacity: 1; }
        }
      `}</style>

      {SPOTS.map((spot, i) => (
        <div
          key={i}
          className="fixed z-[1] pointer-events-none overflow-hidden"
          style={{
            left: spot.x,
            top: spot.y,
            width: spot.w,
            height: spot.h,
            transform: 'translate(-50%, -50%)',
            // Soft circular vignette — only the center of each spot is visible
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, rgba(0,0,0,0.4) 45%, transparent 70%)',
            maskImage: 'radial-gradient(ellipse at center, black 10%, rgba(0,0,0,0.4) 45%, transparent 70%)',
            // Fade in/out at staggered times
            animation: `spotAppear ${spot.duration} ease-in-out ${spot.delay} infinite`,
            opacity: 0,
          }}
        >
          <div style={{ opacity: 0.22, width: '100%', height: '100%' }}>
            <Balatro
              isRotate={true}
              mouseInteraction={false}
              spinSpeed={2.5}
              spinRotation={-1.5 - spot.spinOffset}
              spinAmount={0.25}
              spinEase={1.2}
              pixelFilter={700}
              contrast={3.8}
              lighting={0.45}
              color1={spot.color1}
              color2={spot.color2}
              color3={spot.color3}
            />
          </div>
        </div>
      ))}
    </>
  );
};
