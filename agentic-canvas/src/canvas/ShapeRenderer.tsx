/**
 * ShapeRenderer Component
 * Generic shape renderer that handles all shape types
 */

import React from 'react';
import type { Shape } from '../types/shapes';
import { ShapeType } from '../types/shapes';
import { RectangleShape } from './RectangleShape';
import { WallShape } from './WallShape';
import { ProductShape } from './ProductShape';
import { ZoneShape } from './ZoneShape';

interface ShapeRendererProps {
  shape: Shape;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = React.memo(({ shape }) => {
  switch (shape.type) {
    case ShapeType.RECTANGLE:
      return <RectangleShape shape={shape} />;
    
    case ShapeType.WALL:
      return <WallShape shape={shape} />;
    
    case ShapeType.PRODUCT:
      return <ProductShape shape={shape} />;
    
    case ShapeType.ZONE:
      return <ZoneShape shape={shape} />;
    
    default:
      console.warn(`Unknown shape type: ${(shape as Shape).type}`);
      return null;
  }
});

ShapeRenderer.displayName = 'ShapeRenderer';