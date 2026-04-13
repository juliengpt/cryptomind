import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS } from './styles';
import { Scene1 } from './Scene1';
import { Scene2 } from './Scene2';
import { Scene3 } from './Scene3';
import { Scene4 } from './Scene4';
import { Scene5 } from './Scene5';
import { Scene6 } from './Scene6';
import { Subtitles } from './Subtitles';

export const FacebookAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* All scenes use absolute frame numbers and handle their own fade in/out */}
      <Scene1 />
      <Scene2 />
      <Scene3 />
      <Scene4 />
      <Scene5 />
      <Scene6 />
      <Subtitles />
    </AbsoluteFill>
  );
};
