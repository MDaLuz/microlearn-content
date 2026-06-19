import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface Props {
  size?: number;
  colors?: [string, string, string, string];
}

// Four left-aligned, right-tapered bars. Bottom→top widths: 74/48/26/12 in a 128 frame.
const FRAME = 128;
const BAR_H = 14;
const LEFT = FRAME * 0.2;
const widths = [74, 48, 26, 12]; // bottom → top
const STACK_H = widths.length * BAR_H;
const TOP_Y = (FRAME - STACK_H) / 2;

export default function CompoundGlyph({
  size = 28,
  colors = ['#163031', '#2D6266', '#5BE0D8', '#A8F0F4'],
}: Props) {
  // widths/fills go bottom→top; render top→bottom so reverse both
  const wTopToBottom = [...widths].reverse();
  const fTopToBottom = [...colors].reverse();

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${FRAME} ${FRAME}`}>
      {wTopToBottom.map((w, i) => (
        <Rect
          key={i}
          x={LEFT}
          y={TOP_Y + i * BAR_H}
          width={w}
          height={BAR_H}
          rx={2}
          fill={fTopToBottom[i]}
        />
      ))}
    </Svg>
  );
}
