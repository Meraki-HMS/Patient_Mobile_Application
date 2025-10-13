import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function ComplaintIcon({ size = 24, color = '#999' }) {
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
      <Path d="M9 12h6M9 16h6M8.25 21h7.5A2.25 2.25 0 0 0 18 18.75v-13.5A2.25 2.25 0 0 0 15.75 3h-7.5A2.25 2.25 0 0 0 6 5.25v13.5A2.25 2.25 0 0 0 8.25 21z" />
    </Svg>
  );
}
