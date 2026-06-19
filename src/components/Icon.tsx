import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

interface Props {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2 }: Props) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'leaf':
      return (
        <Svg {...p}>
          <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <Path d="M2 21c0-3 1.85-5.36 5.08-6" />
        </Svg>
      );
    case 'scale':
      return (
        <Svg {...p}>
          <Path d="M12 3v18" />
          <Path d="M5 7h14" />
          <Path d="M7 7l-3 6h6Z" />
          <Path d="M17 7l3 6h-6Z" />
          <Path d="M7 21h10" />
        </Svg>
      );
    case 'activity':
      return (
        <Svg {...p}>
          <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </Svg>
      );
    case 'mic':
      return (
        <Svg {...p}>
          <Rect x="9" y="2" width="6" height="11" rx="3" />
          <Path d="M5 10a7 7 0 0 0 14 0" />
          <Path d="M12 19v3" />
          <Path d="M8 22h8" />
        </Svg>
      );
    case 'flame':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
          <Path d="M12 2c1 3 4 4.5 4 9a4 4 0 0 1-8 0c0-1 .3-1.7.5-2.2C7 10 6 11.5 6 14a6 6 0 0 0 12 0c0-5-4-8-6-12Z" />
        </Svg>
      );
    case 'refresh':
      return (
        <Svg {...p}>
          <Path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <Path d="M21 3v5h-5" />
          <Path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          <Path d="M3 21v-5h5" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...p}>
          <Path d="M20 6 9 17l-5-5" />
        </Svg>
      );
    case 'play':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
          <Path d="M6 4l14 8-14 8Z" />
        </Svg>
      );
    case 'lock':
      return (
        <Svg {...p}>
          <Rect x="4" y="11" width="16" height="10" rx="2" />
          <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </Svg>
      );
    case 'arrow-right':
      return (
        <Svg {...p}>
          <Path d="M5 12h14" />
          <Path d="m13 5 7 7-7 7" />
        </Svg>
      );
    case 'arrow-left':
      return (
        <Svg {...p}>
          <Path d="M19 12H5" />
          <Path d="m11 5-7 7 7 7" />
        </Svg>
      );
    case 'x':
      return (
        <Svg {...p}>
          <Path d="M18 6 6 18" />
          <Path d="M6 6l12 12" />
        </Svg>
      );
    case 'book':
      return (
        <Svg {...p}>
          <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </Svg>
      );
    case 'activity-nav':
      return (
        <Svg {...p}>
          <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </Svg>
      );
    case 'layers':
      return (
        <Svg {...p}>
          <Path d="m12 2 9 5-9 5-9-5 9-5Z" />
          <Path d="m3 12 9 5 9-5" />
          <Path d="m3 17 9 5 9-5" />
        </Svg>
      );
    case 'chevron-right':
      return (
        <Svg {...p}>
          <Path d="m9 18 6-6-6-6" />
        </Svg>
      );
    default:
      return (
        <Svg {...p}>
          <Circle cx="12" cy="12" r="9" />
        </Svg>
      );
  }
}
