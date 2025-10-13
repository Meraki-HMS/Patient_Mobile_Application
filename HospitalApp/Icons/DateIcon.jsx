import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function DateIcon({ size = 24, color = '#999' }) {
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
      <Path d="M6.75 3v2.25" />
      <Path d="M17.25 3v2.25" />
      <Path d="M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      <Path d="M12 .008v.008M12 15h.008v.008H12V15ZM9.75 15h.008v.008H9.75V15ZM7.5 15h.008v.008H7.5V15ZM16.5 15h.008v.008H16.5V15Z" />
      <Path d="M12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008Zm2.25-4.5h.008v.008H14.25v-.008Zm2.25 0h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </Svg>
  );
}
