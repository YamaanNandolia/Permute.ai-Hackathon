/**
 * RectangleShape Component
 * Generic rectangle shape with drag, select, and transform capabilities
 */

import React, { useRef, useEffect } from 'react';
import { Rect, Transformer } from 'react-konva';
import type { Rectangle } from '../types/shapes';
import { useCanvasStore } from '../state/useCanvasStore';
import type Konva from 'konva';

interface RectangleShapeProps {
  shape: Rectangle;
}

export const RectangleShape: React.FC<RectangleShapeProps> = React.memo(({ shape }) => {
  const shapeRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  
  const selectedShapeIds = useCanvasStore((state) => state.selectedShapeIds);
  const selectShape = useCanvasStore((state) => state.selectShape);
  const updateShape = useCanvasStore((state) => state.updateShape);
  const canvas = useCanvasStore((state) => state.canvas);
  
  const isSelected = selectedShapeIds.includes(shape.id);

  // Attach transformer to shape when selected
  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    let x = node.x();
    let y = node.y();

    // Snap to grid if enabled
    if (canvas.snapToGrid && canvas.gridSize > 0) {
      x = Math.round(x / canvas.gridSize) * canvas.gridSize;
      y = Math.round(y / canvas.gridSize) * canvas.gridSize;
    }

    updateShape(shape.id, { x, y });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and apply to width/height
    node.scaleX(1);
    node.scaleY(1);

    updateShape(shape.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(10, node.width() * scaleX),
      height: Math.max(10, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!shape.selectable) return;
    
    e.cancelBubble = true;
    selectShape(shape.id);
  };

  return (
    <>
      <Rect
        ref={shapeRef}
        id={shape.id}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        fill={shape.fill}
        stroke={isSelected ? '#0066ff' : shape.stroke}
        strokeWidth={isSelected ? 3 : shape.strokeWidth}
        opacity={shape.opacity}
        rotation={shape.rotation}
        draggable={shape.draggable}
        onClick={handleClick}
        onTap={handleClick}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          borderStroke="#0066ff"
          borderStrokeWidth={2}
          anchorStroke="#0066ff"
          anchorFill="#ffffff"
          anchorSize={8}
        />
      )}
    </>
  );
});

RectangleShape.displayName = 'RectangleShape';