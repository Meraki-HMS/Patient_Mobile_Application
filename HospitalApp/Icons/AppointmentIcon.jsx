import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function AppointmentIcon({ focused }) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke={focused ? '#2D9CDB' : 'gray'}
      width={24}
      height={24}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </Svg>
  );
}
