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

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - 240;

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
    frame: Math.max(0, localFrame - 25),
    fps,
    config: { damping: 14 },
  });

  // Slow zoom + slight pan for cinematic feel
  const bgScale = interpolate(localFrame, [0, 90], [1, 1.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bgTranslateY = interpolate(localFrame, [0, 90], [0, -20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Glow pulse (climax moment)
  const glowPulse = interpolate(localFrame, [20, 45, 65, 85], [0.2, 0.8, 0.6, 0.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      {/* Real data visualization background */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `scale(${bgScale}) translateY(${bgTranslateY}px)`,
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile('ad-assets/scene4-data.png')}
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

      {/* Climax glow overlay */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at 50% 40%, ${COLORS.neonBlue}${Math.round(glowPulse * 25).toString(16).padStart(2, '0')}, transparent 60%)`,
        }}
      />

      {/* Bottom gradient for text */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '50%',
          bottom: 0,
          background: `linear-gradient(180deg, transparent, ${COLORS.bg}CC 60%, ${COLORS.bg}EE 100%)`,
        }}
      />

      {/* Text overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          padding: '0 60px',
          opacity: textEntry,
          transform: `translateY(${interpolate(textEntry, [0, 1], [30, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 44,
            fontWeight: 600,
            color: COLORS.white,
            textAlign: 'center',
            lineHeight: 1.4,
            textShadow: `0 0 40px ${COLORS.bg}`,
          }}
        >
          Et si votre plus grande
          <br />
          décision quotidienne était
          <br />
          <span
            style={{
              color: COLORS.neonBlue,
              textShadow: `0 0 30px ${COLORS.neonBlue}60`,
            }}
          >
            prise par une IA ?
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
