/**
 * ProductShape Component
 * Product placement marker with metadata display
 */

import React, { useRef, useEffect } from 'react';
import { Rect, Text, Group, Transformer } from 'react-konva';
import type { Product } from '../types/shapes';
import { useCanvasStore } from '../state/useCanvasStore';
import type Konva from 'konva';

interface ProductShapeProps {
  shape: Product;
}

export const ProductShape: React.FC<ProductShapeProps> = React.memo(({ shape }) => {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  
  const selectedShapeIds = useCanvasStore((state) => state.selectedShapeIds);
  const selectShape = useCanvasStore((state) => state.selectShape);
  const updateShape = useCanvasStore((state) => state.updateShape);
  const canvas = useCanvasStore((state) => state.canvas);
  
  const isSelected = selectedShapeIds.includes(shape.id);

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    let x = node.x();
    let y = node.y();

    if (canvas.snapToGrid && canvas.gridSize > 0) {
      x = Math.round(x / canvas.gridSize) * canvas.gridSize;
      y = Math.round(y / canvas.gridSize) * canvas.gridSize;
    }

    updateShape(shape.id, { x, y });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

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
      <Group
        ref={groupRef}
        id={shape.id}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        rotation={shape.rotation}
        draggable={shape.draggable}
        onClick={handleClick}
        onTap={handleClick}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={shape.width}
          height={shape.height}
          fill={shape.fill}
          stroke={isSelected ? '#0066ff' : shape.stroke}
          strokeWidth={isSelected ? 3 : shape.strokeWidth}
          opacity={shape.opacity}
          cornerRadius={4}
        />
        <Text
          text={shape.metadata.name}
          fontSize={12}
          fontFamily="Arial"
          fill="#000000"
          align="center"
          verticalAlign="middle"
          width={shape.width}
          height={shape.height}
          padding={4}
          wrap="word"
        />
        {/* Visibility indicator */}
        {shape.metadata.visibility !== undefined && (
          <Text
            text={`${shape.metadata.visibility}%`}
            fontSize={10}
            fontFamily="Arial"
            fill="#666666"
            x={2}
            y={shape.height - 14}
            width={shape.width - 4}
            align="right"
          />
        )}
      </Group>
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

ProductShape.displayName = 'ProductShape';