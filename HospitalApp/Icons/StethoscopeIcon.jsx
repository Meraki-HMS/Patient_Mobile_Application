import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function StethoscopeIcon({ size = 24, color = '#999' }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Ear tubes */}
      <Path d="M6 2v4a6 6 0 0 0 12 0V2" />
      {/* Chest piece curve */}
      <Path d="M6 10v1a6 6 0 0 0 12 0v-1" />
      {/* Tube going down */}
      <Path d="M12 17v2a3 3 0 0 0 6 0v-2" />
      {/* Chest piece circle */}
      <Circle cx="18" cy="17" r="2" />
    </Svg>
  );
}
