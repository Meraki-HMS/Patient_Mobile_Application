import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function MedicalHistoryIcon({ focused, size = 26 }) {
  const strokeColor = focused ? '#2D9CDB' : 'gray';

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={strokeColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Clipboard outline */}
      <Path d="M7 3h10a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      {/* Clipboard top tab */}
      <Path d="M9 3v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3" />

      {/* Circle with medical cross */}
      <Circle cx="12" cy="11" r="3.5" />
      <Path d="M12 9.5v3M10.5 11h3" />

      {/* Bottom text lines */}
      <Path d="M8 16h8M8 19h8" />
    </Svg>
  );
}
