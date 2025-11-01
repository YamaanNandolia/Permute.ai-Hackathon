# Canvas Components Usage Guide

This document explains how to use the react-konva canvas components in the floor plan designer.

## Component Overview

### 1. CanvasStage
Main canvas component that manages the entire Konva stage with layers, viewport controls, and event handling.

**Features:**
- ✅ Grid background with configurable size
- ✅ Multi-layer rendering (Zones → Walls → Rectangles → Products)
- ✅ Zoom controls (mouse wheel, +/- keys)
- ✅ Pan controls (Shift+drag or middle mouse button)
- ✅ Click to select/deselect shapes
- ✅ Delete key to remove selected shapes
- ✅ Snap to grid support
- ✅ Transform handles for selected shapes

**Usage:**
```tsx
import { CanvasStage } from './canvas/CanvasStage';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <CanvasStage />
    </div>
  );
}
```

### 2. Shape Components

#### RectangleShape
Generic rectangle component with drag, select, and transform capabilities.

**Props:**
- `shape: Rectangle` - Rectangle shape data from store

**Features:**
- Draggable with snap-to-grid
- Selectable with visual highlight
- Transformable (resize, rotate)
- Updates store on drag/transform end

#### WallShape
Specialized rectangle for walls (obstacles in pathfinding).

**Props:**
- `shape: Wall` - Wall shape data from store

**Features:**
- All rectangle features
- Load-bearing walls cannot be moved
- Visual shadow effect for load-bearing walls

#### ProductShape
Product placement marker with metadata display.

**Props:**
- `shape: Product` - Product shape data from store

**Features:**
- Displays product name
- Shows visibility percentage
- Rounded corners
- Color-coded by category

#### ZoneShape
Zone marker component for designated areas.

**Props:**
- `shape: Zone` - Zone shape data from store

**Features:**
- Semi-transparent overlay
- Dashed border
- Displays zone type and capacity
- Behind other shapes (lowest layer)

### 3. ShapeRenderer
Generic renderer that automatically selects the correct shape component based on type.

**Usage:**
```tsx
import { ShapeRenderer } from './canvas/ShapeRenderer';

shapes.map((shape) => (
  <ShapeRenderer key={shape.id} shape={shape} />
))
```

### 4. GridBackground
Visual grid overlay component.

**Features:**
- Configurable grid size from store
- Automatic hiding when gridSize = 0
- Non-interactive (listening={false})

### 5. CanvasLayer
Simple wrapper around Konva Layer for organizing shapes.

**Props:**
- `children?: ReactNode` - Child components
- `listening?: boolean` - Enable/disable event handling (default: true)

## Store Integration

All canvas components are integrated with the Zustand store:

```tsx
// Store subscriptions in components
const selectedShapeIds = useCanvasStore((state) => state.selectedShapeIds);
const selectShape = useCanvasStore((state) => state.selectShape);
const updateShape = useCanvasStore((state) => state.updateShape);
const canvas = useCanvasStore((state) => state.canvas);
```

### Key Store Actions Used:
- `selectShape(id)` - Toggle shape selection
- `clearSelection()` - Deselect all shapes
- `updateShape(id, updates)` - Update shape properties
- `deleteShape(id)` - Remove shape
- `setZoom(zoom)` - Set canvas zoom level
- `setPan(x, y)` - Set canvas pan offset
- `setSnapToGrid(enabled)` - Toggle snap-to-grid

## Keyboard Shortcuts

- **Delete/Backspace** - Remove selected shapes
- **+/=** - Zoom in
- **-/_** - Zoom out
- **Cmd/Ctrl+0** - Reset zoom and pan
- **Shift+Drag** - Pan canvas

## Mouse Controls

- **Click** - Select/deselect shape
- **Drag shape** - Move shape (updates store on release)
- **Mouse wheel** - Zoom in/out at cursor position
- **Shift+Drag** or **Middle Mouse Drag** - Pan canvas
- **Drag transform handles** - Resize or rotate selected shape

## Layer Hierarchy (bottom to top)

1. **Grid Layer** (non-interactive)
   - GridBackground component

2. **Zones Layer** 
   - Zone shapes (semi-transparent areas)

3. **Walls Layer**
   - Wall shapes (obstacles)

4. **Rectangles Layer**
   - Generic rectangle shapes

5. **Products Layer** (top-most)
   - Product shapes (always visible on top)

## Performance Optimizations

- All shape components use `React.memo` to prevent unnecessary re-renders
- Store selectors are optimized to only trigger updates when relevant data changes
- Transform operations update store only on dragEnd/transformEnd (not during drag)
- Grid lines are generated once and cached

## Adding New Shapes

To add a new shape type:

1. **Define shape type** in `src/types/shapes.ts`:
```ts
export interface CustomShape extends BaseShape {
  type: 'custom';
  metadata: {
    customField: string;
  };
}
```

2. **Create component** in `src/canvas/CustomShape.tsx`:
```tsx
export const CustomShape: React.FC<{ shape: CustomShape }> = ({ shape }) => {
  // Similar to RectangleShape implementation
};
```

3. **Update ShapeRenderer** in `src/canvas/ShapeRenderer.tsx`:
```tsx
case ShapeType.CUSTOM:
  return <CustomShape shape={shape} />;
```

4. **Add to appropriate layer** in `CanvasStage.tsx`

## Troubleshooting

### Shapes not rendering
- Check that shapes array in store is populated
- Verify shape type matches ShapeType enum
- Check console for errors

### Drag not working
- Ensure `draggable: true` in shape data
- Verify store updateShape action is called on dragEnd

### Selection not working
- Ensure `selectable: true` in shape data
- Check that selectShape action is triggered on click
- Verify selectedShapeIds is being updated in store

### Transform not working
- Only works on selected shapes
- Check that Transformer component is rendering
- Verify useEffect is attaching transformer to shape ref

## Example: Complete Usage

```tsx
import { useEffect } from 'react';
import { CanvasStage } from './canvas/CanvasStage';
import { useCanvasStore } from './state/useCanvasStore';
import { ShapeType } from './types';

function App() {
  const { addShape, setZoom, setSnapToGrid } = useCanvasStore();

  // Add demo shapes on mount
  useEffect(() => {
    addShape({
      type: ShapeType.PRODUCT,
      x: 100,
      y: 100,
      width: 80,
      height: 80,
      rotation: 0,
      fill: '#4CAF50',
      stroke: '#2E7D32',
      strokeWidth: 2,
      opacity: 1,
      draggable: true,
      selectable: true,
      layer: 2,
      metadata: {
        productId: 'PROD-001',
        name: 'Product 1',
        category: 'Electronics',
        visibility: 85,
      },
    });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Toolbar */}
      <div style={{ padding: '10px' }}>
        <button onClick={() => setZoom(1.5)}>Zoom In</button>
        <button onClick={() => setSnapToGrid(true)}>Enable Grid</button>
      </div>

      {/* Canvas */}
      <CanvasStage />
    </div>
  );
}
```

## Architecture Compliance

All components follow the architecture defined in [`ARCHITECTURE.md`](../ARCHITECTURE.md):

- ✅ Component hierarchy matches Section 5.1
- ✅ Event handling follows Section 6.1 and 6.2
- ✅ Store integration follows Section 3
- ✅ Layer management follows Section 5.2
- ✅ Performance optimizations from Section 10.3

## Next Steps

1. **Add Overlay Components** - PathOverlay and HeatmapOverlay for visualization
2. **Implement Agent System** - Connect agents to automatically optimize layouts
3. **Add Backend Integration** - Connect to pathfinding API
4. **Create Control Panel** - UI for canvas configuration and agent controls