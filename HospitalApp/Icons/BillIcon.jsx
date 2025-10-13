import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function BillIcon({ focused }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke={focused ? '#2D9CDB' : 'gray'}
      width={26}
      height={26}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 7.5h6m-6 3h6m-6 3h6m-7.5 3.75h9a1.5 1.5 0 0 0 
           1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5h-9a1.5 1.5 0 
           0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5z"
      />
    </Svg>
  );
}
