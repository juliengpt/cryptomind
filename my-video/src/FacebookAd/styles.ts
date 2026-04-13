// Design tokens for the Facebook Ad
export const COLORS = {
  bg: '#0A0E1A',
  bgLight: '#111827',
  white: '#FFFFFF',
  neonBlue: '#00D4FF',
  neonPurple: '#7B61FF',
  neonGreen: '#00FF94',
  neonPink: '#FF3D8E',
  neonOrange: '#FF8A3D',
  accent: '#00D4FF',
  textMuted: 'rgba(255,255,255,0.6)',
  overlay: 'rgba(10,14,26,0.7)',
};

export const FONTS = {
  heading: 'Inter, sans-serif',
  data: '"JetBrains Mono", monospace',
};

// Frame ranges at 30fps
export const SCENES = {
  scene1: { from: 0, duration: 60 },    // 0-2s
  scene2: { from: 60, duration: 90 },   // 2-5s
  scene3: { from: 150, duration: 90 },  // 5-8s
  scene4: { from: 240, duration: 90 },  // 8-11s
  scene5: { from: 330, duration: 90 },  // 11-14s
  scene6: { from: 420, duration: 30 },  // 14-15s
};

export const WIDTH = 1080;
export const HEIGHT = 1350;
export const FPS = 30;
export const DURATION = 450; // 15s * 30fps
