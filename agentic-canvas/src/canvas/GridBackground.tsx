/**
 * GridBackground Component
 * Renders a visual grid overlay on the canvas
 */

import React from 'react';
import { Line } from 'react-konva';
import { useCanvasStore } from '../state/useCanvasStore';

export const GridBackground: React.FC = React.memo(() => {
  const canvas = useCanvasStore((state) => state.canvas);
  const { width, height, gridSize } = canvas;

  if (gridSize <= 0) {
    return null;
  }

  const lines: React.ReactElement[] = [];

  // Vertical lines
  for (let i = 0; i <= width / gridSize; i++) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i * gridSize, 0, i * gridSize, height]}
        stroke="#e0e0e0"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  // Horizontal lines
  for (let i = 0; i <= height / gridSize; i++) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i * gridSize, width, i * gridSize]}
        stroke="#e0e0e0"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
});

GridBackground.displayName = 'GridBackground';