/**
 * CanvasStage Component
 * Main Stage component with viewport controls, layer management, and event handling
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { Stage } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore } from '../state/useCanvasStore';
import { CanvasLayer } from './CanvasLayer';
import { GridBackground } from './GridBackground';
import { ShapeRenderer } from './ShapeRenderer';
import { ShapeType } from '../types/shapes';

export const CanvasStage: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const isPanning = useRef(false);
  const lastPointerPosition = useRef({ x: 0, y: 0 });

  // Store subscriptions
  const shapes = useCanvasStore((state) => state.shapes);
  const canvas = useCanvasStore((state) => state.canvas);
  const clearSelection = useCanvasStore((state) => state.clearSelection);
  const deleteShape = useCanvasStore((state) => state.deleteShape);
  const selectedShapeIds = useCanvasStore((state) => state.selectedShapeIds);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const setPan = useCanvasStore((state) => state.setPan);

  // Group shapes by type for layer management
  const zoneShapes = shapes.filter((s) => s.type === ShapeType.ZONE);
  const wallShapes = shapes.filter((s) => s.type === ShapeType.WALL);
  const productShapes = shapes.filter((s) => s.type === ShapeType.PRODUCT);
  const rectangleShapes = shapes.filter((s) => s.type === ShapeType.RECTANGLE);

  // Handle stage click - deselect when clicking empty area
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      clearSelection();
    }
  }, [clearSelection]);

  // Handle mouse wheel for zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = canvas.zoom;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - canvas.panX) / oldScale,
      y: (pointer.y - canvas.panY) / oldScale,
    };

    // Zoom in/out
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 
      ? Math.min(oldScale * scaleBy, 5) 
      : Math.max(oldScale / scaleBy, 0.1);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setZoom(newScale);
    setPan(newPos.x, newPos.y);
  }, [canvas.zoom, canvas.panX, canvas.panY, setZoom, setPan]);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Start panning with middle mouse button or space key
    if (e.evt.button === 1 || e.evt.shiftKey) {
      isPanning.current = true;
      const stage = stageRef.current;
      if (stage) {
        const pos = stage.getPointerPosition();
        if (pos) {
          lastPointerPosition.current = pos;
        }
      }
    }
  }, []);

  // Handle mouse move for panning
  const handleMouseMove = useCallback(() => {
    if (!isPanning.current) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const dx = pos.x - lastPointerPosition.current.x;
    const dy = pos.y - lastPointerPosition.current.y;

    setPan(canvas.panX + dx, canvas.panY + dy);
    lastPointerPosition.current = pos;
  }, [canvas.panX, canvas.panY, setPan]);

  // Handle mouse up for panning
  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key - remove selected shapes
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedShapeIds.forEach((id) => deleteShape(id));
      }

      // Zoom controls
      if (e.key === '+' || e.key === '=') {
        setZoom(Math.min(canvas.zoom * 1.1, 5));
      }
      if (e.key === '-' || e.key === '_') {
        setZoom(Math.max(canvas.zoom / 1.1, 0.1));
      }

      // Reset zoom
      if (e.key === '0' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setZoom(1);
        setPan(0, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedShapeIds, deleteShape, canvas.zoom, setZoom, setPan]);

  return (
    <Stage
      ref={stageRef}
      width={canvas.width}
      height={canvas.height}
      scaleX={canvas.zoom}
      scaleY={canvas.zoom}
      x={canvas.panX}
      y={canvas.panY}
      onClick={handleStageClick}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ 
        backgroundColor: '#ffffff',
        cursor: isPanning.current ? 'grabbing' : 'default'
      }}
    >
      {/* Background Grid Layer */}
      <CanvasLayer listening={false}>
        <GridBackground />
      </CanvasLayer>

      {/* Zones Layer (lowest - behind everything) */}
      <CanvasLayer>
        {zoneShapes.map((shape) => (
          <ShapeRenderer key={shape.id} shape={shape} />
        ))}
      </CanvasLayer>

      {/* Walls Layer */}
      <CanvasLayer>
        {wallShapes.map((shape) => (
          <ShapeRenderer key={shape.id} shape={shape} />
        ))}
      </CanvasLayer>

      {/* Rectangles Layer */}
      <CanvasLayer>
        {rectangleShapes.map((shape) => (
          <ShapeRenderer key={shape.id} shape={shape} />
        ))}
      </CanvasLayer>

      {/* Products Layer (highest - on top) */}
      <CanvasLayer>
        {productShapes.map((shape) => (
          <ShapeRenderer key={shape.id} shape={shape} />
        ))}
      </CanvasLayer>
    </Stage>
  );
};