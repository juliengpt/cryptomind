import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from './styles';

interface SubtitleEntry {
  from: number;
  to: number;
  text: string;
}

const SUBTITLES: SubtitleEntry[] = [
  { from: 0, to: 55, text: "L'IA a déjà tout changé." },
  { from: 60, to: 82, text: 'Médecine : diagnostic amélioré de 30%.' },
  { from: 82, to: 104, text: 'Logistique : livraison 40% plus rapide.' },
  { from: 104, to: 126, text: 'Science : recherche accélérée.' },
  { from: 126, to: 148, text: 'Industrie : productivité doublée.' },
  { from: 150, to: 235, text: "Partout où la donnée compte, l'IA surpasse l'intuition." },
  { from: 240, to: 325, text: 'Et si votre plus grande décision quotidienne était prise par une IA ?' },
  { from: 330, to: 415, text: "L'intelligence artificielle au service de vos stratégies." },
  { from: 420, to: 450, text: 'Découvrir la plateforme.' },
];

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentSub = SUBTITLES.find((s) => frame >= s.from && frame <= s.to);
  if (!currentSub) return null;

  const localFrame = frame - currentSub.from;
  const fadeIn = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [currentSub.to - 4, currentSub.to], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.min(fadeIn, fadeOut);

  const slideUp = spring({
    frame: localFrame,
    fps,
    config: { damping: 20 },
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 40,
          right: 40,
          display: 'flex',
          justifyContent: 'center',
          opacity,
          transform: `translateY(${interpolate(slideUp, [0, 1], [8, 0])}px)`,
        }}
      >
        <div
          style={{
            background: 'rgba(10, 14, 26, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '12px 28px',
            borderRadius: 8,
            border: `1px solid ${COLORS.white}10`,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 26,
              fontWeight: 500,
              color: COLORS.white,
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            {currentSub.text}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
