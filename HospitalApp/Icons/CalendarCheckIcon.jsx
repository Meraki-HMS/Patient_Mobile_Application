import React from 'react';
import Svg, { Path, Rect, Polyline } from 'react-native-svg';

export default function CalendarCheckIcon({
  size = 24,
  color = '#000',
  checkColor = '#4CAF50', // green check
}) {
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
      {/* Calendar outer box */}
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      {/* Calendar rings on top */}
      <Path d="M16 2v4M8 2v4M3 10h18" />
      {/* ✅ Check mark */}
      <Polyline points="9 16 11 18 15 14" stroke={checkColor} strokeWidth={2} />
    </Svg>
  );
}
