import React from 'react';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface Props {
  size?: number;
}

const ROWS = [
  { y: 86, opacity: 0.28 },
  { y: 66, opacity: 0.46 },
  { y: 46, opacity: 0.70 },
  { y: 26, opacity: 1.00 },
];

export default function AuroraMark({ size = 26 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 128 128">
      <Defs>
        <LinearGradient id="am" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#3FD9CE" />
          <Stop offset="0.5" stopColor="#6FA8FF" />
          <Stop offset="1" stopColor="#C9B6FF" />
        </LinearGradient>
      </Defs>
      {ROWS.map((r, i) => (
        <Rect
          key={i}
          x="26"
          y={r.y}
          width="76"
          height="14"
          rx="5"
          fill="url(#am)"
          opacity={r.opacity}
        />
      ))}
    </Svg>
  );
}
