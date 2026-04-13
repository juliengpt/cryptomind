import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
  random,
  staticFile,
} from 'remotion';
import { COLORS, FONTS } from './styles';

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - 150;

  if (localFrame < -3 || localFrame > 93) return null;

  const fadeIn = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(localFrame, [75, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const textEntry = spring({
    frame: Math.max(0, localFrame - 20),
    fps,
    config: { damping: 14 },
  });

  // Slow zoom on background
  const bgScale = interpolate(localFrame, [0, 90], [1, 1.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      {/* Real neural network background */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `scale(${bgScale})`,
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile('ad-assets/scene3-neural.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={() => {}}
        />
      </div>

      {/* Fallback */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: COLORS.bg,
          zIndex: -1,
        }}
      />

      {/* Overlay for depth */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at 50% 40%, transparent 20%, ${COLORS.bg}80 70%, ${COLORS.bg}CC 100%)`,
        }}
      />

      {/* Floating data particles */}
      {Array.from({ length: 25 }).map((_, i) => {
        const x = random(`px${i}`) * 1080;
        const startY = random(`py${i}`) * 1350;
        const speed = 0.8 + random(`ps${i}`) * 2;
        const y = (startY + localFrame * speed) % 1350;
        const size = 1.5 + random(`psize${i}`) * 3;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: random(`pc${i}`) > 0.5 ? `${COLORS.neonBlue}50` : `${COLORS.neonPurple}40`,
              boxShadow: `0 0 ${size * 3}px ${COLORS.neonBlue}30`,
            }}
          />
        );
      })}

      {/* Text overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 140,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 60px',
          opacity: textEntry,
          transform: `translateY(${interpolate(textEntry, [0, 1], [30, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 48,
            fontWeight: 600,
            color: COLORS.white,
            textAlign: 'center',
            lineHeight: 1.4,
            textShadow: `0 0 40px ${COLORS.bg}, 0 4px 30px ${COLORS.bg}`,
          }}
        >
          Partout où la donnée compte,
          <br />
          <span
            style={{
              color: COLORS.neonBlue,
              textShadow: `0 0 30px ${COLORS.neonBlue}60`,
            }}
          >
            l'IA surpasse l'intuition.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
