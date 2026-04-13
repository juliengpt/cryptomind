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

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - 420;

  if (localFrame < -1 || localFrame > 30) return null;

  const fadeIn = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const logoScale = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const buttonEntry = spring({
    frame: Math.max(0, localFrame - 8),
    fps,
    config: { damping: 14 },
  });

  const buttonPulse = 0.6 + Math.sin(localFrame * 0.35) * 0.4;

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      {/* Premium background */}
      <Img
        src={staticFile('ad-assets/scene6-bg.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onError={() => {}}
      />

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

      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 50,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 28,
              background: `linear-gradient(135deg, ${COLORS.neonBlue}, ${COLORS.neonPurple})`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: `0 10px 50px ${COLORS.neonBlue}40, 0 0 80px ${COLORS.neonBlue}15`,
            }}
          >
            <svg viewBox="0 0 50 50" width={55} height={55}>
              <path
                d="M25 8 L40 18 L40 32 L25 42 L10 32 L10 18 Z"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              />
              <circle cx="25" cy="25" r="8" fill="white" opacity="0.9" />
            </svg>
          </div>

          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 54,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: '-1px',
              textShadow: `0 0 40px ${COLORS.bg}`,
            }}
          >
            [Logo Client]
          </div>
        </div>

        {/* CTA Button */}
        <div
          style={{
            opacity: buttonEntry,
            transform: `translateY(${interpolate(buttonEntry, [0, 1], [25, 0])}px)`,
          }}
        >
          <div
            style={{
              padding: '24px 56px',
              background: `linear-gradient(135deg, ${COLORS.neonBlue}, ${COLORS.neonPurple})`,
              borderRadius: 16,
              fontFamily: FONTS.heading,
              fontSize: 32,
              fontWeight: 700,
              color: COLORS.white,
              boxShadow: `0 0 ${35 * buttonPulse}px ${COLORS.neonBlue}${Math.round(buttonPulse * 70).toString(16).padStart(2, '0')}, 0 10px 40px rgba(0,0,0,0.4)`,
            }}
          >
            Découvrir la plateforme
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
