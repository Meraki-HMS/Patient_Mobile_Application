import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function NotificationIcon({ size = 24, color = '#333' }) {
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
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31
           A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75
           a8.967 8.967 0 0 1-2.312 6.022
           c1.733.64 3.56 1.085 5.455 1.31m5.714 0
           a24.255 24.255 0 0 1-5.714 0m5.714 0
           a3 3 0 1 1-5.714 0M3.124 7.5
           A8.969 8.969 0 0 1 5.292 3m13.416 0
           a8.969 8.969 0 0 1 2.168 4.5"
      />
    </Svg>
  );
}
