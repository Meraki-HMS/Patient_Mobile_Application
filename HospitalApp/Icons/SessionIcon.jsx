import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export default function SessionIcon({ size = 24, color = '#000' }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Left Person */}
      <Circle cx="16" cy="12" r="6" />
      <Rect x="8" y="20" width="16" height="20" rx="4" />
      <Path d="M12 40v10M20 40v10" />

      {/* Right Person */}
      <Circle cx="48" cy="12" r="6" />
      <Rect x="40" y="20" width="16" height="20" rx="4" />
      <Path d="M44 40v10M52 40v10" />

      {/* Chat Bubble */}
      <Rect x="24" y="18" width="16" height="12" rx="2" />
      <Circle cx="28" cy="24" r="1" />
      <Circle cx="32" cy="24" r="1" />
      <Circle cx="36" cy="24" r="1" />
    </Svg>
  );
}
