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

const DOMAIN_DURATION = 22; // ~0.75s at 30fps

interface DomainSlide {
  startFrame: number;
  image: string;
  label: string;
  stat: string;
  color: string;
}

const DOMAINS: DomainSlide[] = [
  {
    startFrame: 60,
    image: 'ad-assets/scene2-medical.png',
    label: 'Médecine',
    stat: 'Diagnostic +30% précision',
    color: COLORS.neonGreen,
  },
  {
    startFrame: 82,
    image: 'ad-assets/scene2-logistics.png',
    label: 'Logistique',
    stat: 'Livraison -40% temps',
    color: COLORS.neonBlue,
  },
  {
    startFrame: 104,
    image: 'ad-assets/scene2-science.png',
    label: 'Science',
    stat: 'R&D accélérée',
    color: COLORS.neonPurple,
  },
  {
    startFrame: 126,
    image: 'ad-assets/scene2-industry.png',
    label: 'Industrie',
    stat: 'Productivité x2',
    color: COLORS.neonOrange,
  },
];

const DomainCard: React.FC<{ domain: DomainSlide }> = ({ domain }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - domain.startFrame;

  if (localFrame < -3 || localFrame > DOMAIN_DURATION + 5) return null;

  const enter = spring({ frame: Math.max(0, localFrame), fps, config: { damping: 14 } });
  const exit = interpolate(localFrame, [DOMAIN_DURATION - 5, DOMAIN_DURATION], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.min(enter, exit);
  const scale = interpolate(enter, [0, 1], [1.08, 1]);

  const labelProgress = spring({
    frame: Math.max(0, localFrame - 6),
    fps,
    config: { damping: 12 },
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Full-bleed background image */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `scale(${scale})`,
          overflow: 'hidden',
        }}
      >
        <Img
          src={staticFile(domain.image)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={() => {}}
        />
      </div>

      {/* Dark gradient overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `linear-gradient(180deg, ${COLORS.bg}40 0%, ${COLORS.bg}20 40%, ${COLORS.bg}90 80%, ${COLORS.bg}DD 100%)`,
        }}
      />

      {/* Color tint overlay */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at 50% 40%, ${domain.color}10, transparent 70%)`,
        }}
      />

      {/* Label bar at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 180,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: labelProgress,
          transform: `translateY(${interpolate(labelProgress, [0, 1], [25, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 40,
            color: COLORS.white,
            fontWeight: 600,
            marginBottom: 16,
            textShadow: `0 2px 20px ${COLORS.bg}`,
          }}
        >
          {domain.label}
        </div>
        <div
          style={{
            fontFamily: FONTS.data,
            fontSize: 38,
            color: domain.color,
            fontWeight: 700,
            padding: '10px 36px',
            background: `${COLORS.bg}B0`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${domain.color}50`,
            borderRadius: 10,
            boxShadow: `0 0 25px ${domain.color}20`,
          }}
        >
          {domain.stat}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();

  // Only render during scene 2 timeframe
  if (frame < 57 || frame > 152) return null;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {DOMAINS.map((domain) => (
        <DomainCard key={domain.label} domain={domain} />
      ))}
    </AbsoluteFill>
  );
};
