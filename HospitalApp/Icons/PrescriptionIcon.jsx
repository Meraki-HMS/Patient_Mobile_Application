import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export default function PrescriptionIcon({ focused, size = 26 }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
    >
      {/* Pill 1 (horizontal capsule outline) */}
      <Rect
        x="3"
        y="9"
        rx="3"
        ry="3"
        width="10"
        height="6"
        stroke={focused ? '#2D9CDB' : '#FF6B6B'}
        strokeWidth="1.8"
      />

      {/* Pill 2 (diagonal capsule outline) */}
      <Path
        d="M14 6l4 4c1.2 1.2 1.2 3.2 0 4.4l-1.6 1.6c-1.2 1.2-3.2 1.2-4.4 0l-4-4c-1.2-1.2-1.2-3.2 0-4.4L9.6 6c1.2-1.2 3.2-1.2 4.4 0z"
        stroke={focused ? '#1DD1A1' : '#54A0FF'}
        strokeWidth="1.8"
      />
    </Svg>
  );
}
