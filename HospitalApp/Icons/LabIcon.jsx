import React from 'react';
import Svg, { Path, Line, Circle } from 'react-native-svg';

export default function LabIcon({ focused, size = 26 }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 64 64"
      strokeWidth={2.5}
      stroke={focused ? 'red' : 'red'} // keep red color
      width={size}
      height={size}
    >
      {/* ✅ Flask / Jar */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 8v18l-8 18c-2 4 1 8 6 8h20c5 0 8-4 6-8l-8-18V8"
      />

      {/* ✅ Neck line of flask */}
      <Line x1="18" y1="20" x2="30" y2="20" stroke="red" strokeWidth={2.5} />

      {/* ✅ Bubbles inside the jar */}
      <Circle cx="22" cy="36" r="2" fill="red" />
      <Circle cx="28" cy="42" r="2" fill="red" />
    </Svg>
  );
}
