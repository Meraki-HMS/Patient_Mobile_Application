import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function EmailIcon({ size = 24, color = '#333' }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke={color}
      width={size}
      height={size}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588
           L2.35 13.177a2.25 2.25 0 0 0-.1.661V18
           a2.25 2.25 0 0 0 2.25 2.25h15
           A2.25 2.25 0 0 0 21.75 18v-4.162
           c0-.224-.034-.447-.1-.661L19.24 5.338
           a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86
           a2.25 2.25 0 0 1 2.012 1.244l.256.512
           a2.25 2.25 0 0 0 2.013 1.244h3.218
           a2.25 2.25 0 0 0 2.013-1.244l.256-.512
           a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3"
      />
    </Svg>
  );
}
