import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function MeetingIcon({ size = 24, color = '#999' }) {
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
      <Path d="M8.25 6.75h7.5M12 3v6m-7.5 9h15a2.25 2.25 0 0 0 2.25-2.25V8.25A2.25 2.25 0 0 0 15.75 6H8.25A2.25 2.25 0 0 0 6 8.25v7.5A2.25 2.25 0 0 0 8.25 18z" />
    </Svg>
  );
}
