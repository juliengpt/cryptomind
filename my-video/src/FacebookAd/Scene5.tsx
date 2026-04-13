import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
  staticFile,
} from 'remotion';
import { COLORS, FONTS } from './styles';

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - 330;

  if (localFrame < -3 || localFrame > 93) return null;

  const fadeIn = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(localFrame, [75, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const laptopEntry = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const textEntry = spring({
    frame: Math.max(0, localFrame - 20),
    fps,
    config: { damping: 14 },
  });

  // Subtle float animation on laptop
  const floatY = Math.sin(localFrame * 0.06) * 5;

  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: COLORS.bg,
        }}
      />

      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at 50% 35%, ${COLORS.neonBlue}10, transparent 60%)`,
        }}
      />

      {/* Laptop image with entry animation */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: laptopEntry,
          transform: `translateY(${interpolate(laptopEntry, [0, 1], [60, 0]) + floatY}px) scale(${interpolate(laptopEntry, [0, 1], [0.85, 1])})`,
        }}
      >
        <div
          style={{
            width: 920,
            height: 720,
            position: 'relative',
          }}
        >
          <Img
            src={staticFile('ad-assets/scene5-laptop.png')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            onError={() => {}}
          />

          {/* Screen glow effect */}
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '15%',
              width: '70%',
              height: '55%',
              background: `radial-gradient(ellipse, ${COLORS.neonBlue}08, transparent)`,
              filter: 'blur(20px)',
            }}
          />
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '40%',
          bottom: 0,
          background: `linear-gradient(180deg, transparent, ${COLORS.bg} 50%)`,
        }}
      />

      {/* Text below */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 0,
          right: 0,
          padding: '0 60px',
          opacity: textEntry,
          transform: `translateY(${interpolate(textEntry, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 42,
            fontWeight: 600,
            color: COLORS.white,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          <span style={{ color: COLORS.neonBlue }}>[Nom produit]</span>
        </div>
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 34,
            fontWeight: 400,
            color: `${COLORS.white}B0`,
            textAlign: 'center',
            lineHeight: 1.5,
            marginTop: 12,
          }}
        >
          L'intelligence artificielle
          <br />
          au service de vos stratégies.
        </div>
      </div>
    </AbsoluteFill>
  );
};
