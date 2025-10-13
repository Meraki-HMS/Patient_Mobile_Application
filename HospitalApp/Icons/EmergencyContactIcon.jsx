import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function EmergencyContactIcon({ size = 24, color = '#333' }) {
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
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25
           a2.25 2.25 0 0 0 2.25-2.25v-1.372
           c0-.516-.351-.966-.852-1.091l-4.423-1.106
           c-.44-.11-.902.055-1.173.417l-.97 1.293
           c-.282.376-.769.542-1.21.38
           a12.035 12.035 0 0 1-7.143-7.143
           c-.162-.441.004-.928.38-1.21l1.293-.97
           c.363-.271.527-.734.417-1.173L6.963 3.102
           a1.125 1.125 0 0 0-1.091-.852H4.5
           A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </Svg>
  );
}
