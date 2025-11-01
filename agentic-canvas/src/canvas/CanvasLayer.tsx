/**
 * CanvasLayer Component
 * Wrapper for Konva Layer with automatic layer management
 */

import React from 'react';
import { Layer } from 'react-konva';

interface CanvasLayerProps {
  children?: React.ReactNode;
  listening?: boolean;
}

export const CanvasLayer: React.FC<CanvasLayerProps> = ({ 
  children, 
  listening = true 
}) => {
  return (
    <Layer listening={listening}>
      {children}
    </Layer>
  );
};