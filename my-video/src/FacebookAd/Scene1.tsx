import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, random, staticFile } from 'remotion';
import { COLORS, FONTS } from './styles';

const GlitchText: React.FC<{ text: string; frame: number }> = ({ text, frame }) => {
  const glitchIntensity = interpolate(frame, [0, 15, 30, 45, 55], [0, 4, 1, 3, 0], {
    extrapolateRight: 'clamp',
  });

  const offsetX = Math.sin(frame * 0.8) * glitchIntensity;
  const offsetY = Math.cos(frame * 1.2) * glitchIntensity * 0.5;

  return (
    <div style={{ position: 'relative' }}>
      {glitchIntensity > 0.5 && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              color: 'rgba(255,0,50,0.4)',
              transform: `translate(${offsetX * 3}px, ${-offsetY}px)`,
              clipPath: `inset(${random(`r${frame}`) * 40}% 0 ${random(`r2${frame}`) * 40}% 0)`,
            }}
          >
            {text}
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              color: 'rgba(0,212,255,0.4)',
              transform: `translate(${-offsetX * 3}px, ${offsetY}px)`,
              clipPath: `inset(${random(`c${frame}`) * 40}% 0 ${random(`c2${frame}`) * 40}% 0)`,
            }}
          >
            {text}
          </div>
        </>
      )}
      <div style={{ position: 'relative', color: COLORS.white }}>{text}</div>
    </div>
  );
};

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20, 45, 60], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(frame, [0, 25], [0.92, 1], {
    extrapolateRight: 'clamp',
  });

  const scanlineOffset = (frame * 5) % 1350;

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Real background image */}
      <Img
        src={staticFile('ad-assets/scene1-bg.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onError={() => {}}
      />

      {/* Fallback dark bg if image not yet generated */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: COLORS.bg,
          zIndex: -1,
        }}
      />

      {/* Animated overlay effects */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at 50% 50%, transparent 30%, ${COLORS.bg}CC 100%)`,
        }}
      />

      {/* Scanline */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '3px',
          background: `linear-gradient(90deg, transparent, ${COLORS.neonBlue}40, transparent)`,
          top: scanlineOffset,
          filter: 'blur(1px)',
        }}
      />

      {/* Main text */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 700,
            fontSize: 110,
            textAlign: 'center',
            lineHeight: 1.15,
            padding: '0 60px',
            textShadow: `0 0 60px ${COLORS.bg}, 0 0 120px ${COLORS.bg}`,
          }}
        >
          <GlitchText text="L'IA a déjà" frame={frame} />
          <div style={{ height: 20 }} />
          <GlitchText text="tout changé." frame={frame} />
        </div>
      </div>

      {/* Accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: 250,
          left: '50%',
          transform: 'translateX(-50%)',
          width: interpolate(frame, [15, 35], [0, 200], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          height: 3,
          background: `linear-gradient(90deg, ${COLORS.neonBlue}, ${COLORS.neonPurple})`,
          borderRadius: 2,
          boxShadow: `0 0 20px ${COLORS.neonBlue}60`,
        }}
      />
    </AbsoluteFill>
  );
};
