# Zustand Store Usage Guide

This document explains how to use the Zustand state management system implemented in this project.

## Overview

The store is implemented in [`src/state/useCanvasStore.ts`](src/state/useCanvasStore.ts) and provides state management for:
- **Shapes**: Floor plan elements (walls, products, zones)
- **Canvas**: Viewport configuration (zoom, pan, grid)
- **Selection**: Currently selected shapes
- **Agents**: AI agents for layout optimization

## Type Definitions

All types are defined in [`src/types/`](src/types/) and exported through [`src/types/index.ts`](src/types/index.ts):

- **Shapes**: [`shapes.ts`](src/types/shapes.ts) - Shape types and interfaces
- **Agents**: [`agent.ts`](src/types/agent.ts) - Agent interfaces and action types
- **Canvas**: [`canvas.ts`](src/types/canvas.ts) - Canvas configuration types

## Basic Usage

### Importing the Store

```typescript
import { useCanvasStore } from './state/useCanvasStore';
```

### Using Store in Components

```typescript
function MyComponent() {
  // Select specific state slices
  const { shapes, addShape, updateShape } = useCanvasStore();
  
  // Or use selector for performance
  const shapeCount = useCanvasStore((state) => state.shapes.length);
  
  return (
    <div>
      <p>Total shapes: {shapeCount}</p>
      <button onClick={() => addShape({...})}>Add Shape</button>
    </div>
  );
}
```

## Store Slices

### 1. Shapes Slice

Manages all floor plan shapes with CRUD operations.

#### Available Actions:

**`addShape(shape)`** - Add a new shape
```typescript
const id = addShape({
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
    name: 'Test Product',
    category: 'Electronics',
    visibility: 85,
  },
});
```

**`updateShape(id, updates)`** - Update existing shape
```typescript
updateShape(shapeId, {
  x: 200,
  y: 200,
  fill: '#FF5722',
});
```

**`deleteShape(id)`** - Delete a shape
```typescript
deleteShape(shapeId);
```

**`clearShapes()`** - Remove all shapes
```typescript
clearShapes();
```

**`getShapeById(id)`** - Get shape by ID
```typescript
const shape = getShapeById(shapeId);
```

### 2. Canvas Slice

Manages viewport and canvas configuration.

#### Available Actions:

**`setZoom(zoom)`** - Set zoom level (0.1 - 5)
```typescript
setZoom(1.5); // 150% zoom
```

**`setPan(panX, panY)`** - Set pan offset
```typescript
setPan(100, 50);
```

**`setGridSize(size)`** - Set grid cell size
```typescript
setGridSize(20); // 20px grid
```

**`setSnapToGrid(snap)`** - Toggle snap to grid
```typescript
setSnapToGrid(true);
```

**`resetCanvas()`** - Reset to default configuration
```typescript
resetCanvas();
```

#### Default Canvas Config:
```typescript
{
  width: 1200,
  height: 800,
  zoom: 1,
  panX: 0,
  panY: 0,
  gridSize: 20,
  snapToGrid: true,
}
```

### 3. Selection Slice

Manages selected shapes for editing.

#### Available Actions:

**`selectShape(id)`** - Toggle shape selection
```typescript
selectShape(shapeId); // Toggles selection
```

**`deselectShape(id)`** - Deselect specific shape
```typescript
deselectShape(shapeId);
```

**`clearSelection()`** - Clear all selections
```typescript
clearSelection();
```

**`selectMultiple(ids)`** - Select multiple shapes
```typescript
selectMultiple([id1, id2, id3]);
```

### 4. Agent Slice

Manages AI agents for layout optimization.

#### Available Actions:

**`registerAgent(agent)`** - Register a new agent
```typescript
registerAgent(new LayoutOptimizationAgent());
```

**`unregisterAgent(agentId)`** - Remove an agent
```typescript
unregisterAgent('layout-optimization');
```

**`triggerAgents()`** - Manually trigger agent execution
```typescript
triggerAgents();
```

**`setAgentEnabled(enabled)`** - Enable/disable agents
```typescript
setAgentEnabled(true);
```

**`setAgentAutoRun(autoRun)`** - Toggle auto-run on state changes
```typescript
setAgentAutoRun(true);
```

## LocalStorage Persistence

The store automatically persists to localStorage with the following configuration:

- **Key**: `canvas-storage`
- **Version**: 1
- **Persisted Data**:
  - All shapes
  - Canvas configuration
  - Agent configuration
  
- **Not Persisted** (session-only):
  - Selected shape IDs
  - Agent execution state
  - Registered agents (must be re-registered on load)

### Testing Persistence

1. Add some shapes using the UI
2. Refresh the page
3. Shapes should persist automatically

### Clearing Storage

```typescript
// Clear from browser console
localStorage.removeItem('canvas-storage');
```

## Example: Complete Component

```typescript
import { useCanvasStore } from './state/useCanvasStore';
import { ShapeType } from './types';

function FloorPlanEditor() {
  const {
    shapes,
    addShape,
    updateShape,
    deleteShape,
    selectedShapeIds,
    selectShape,
    canvas,
    setZoom,
  } = useCanvasStore();

  const handleAddWall = () => {
    addShape({
      type: ShapeType.WALL,
      x: 100,
      y: 100,
      width: 200,
      height: 20,
      rotation: 0,
      fill: '#888888',
      stroke: '#000000',
      strokeWidth: 2,
      opacity: 1,
      draggable: true,
      selectable: true,
      layer: 1,
      metadata: {
        isLoadBearing: true,
      },
    });
  };

  const handleDeleteSelected = () => {
    selectedShapeIds.forEach(id => deleteShape(id));
  };

  return (
    <div>
      <div>
        <button onClick={handleAddWall}>Add Wall</button>
        <button onClick={handleDeleteSelected}>Delete Selected</button>
        <button onClick={() => setZoom(canvas.zoom + 0.1)}>Zoom In</button>
        <button onClick={() => setZoom(canvas.zoom - 0.1)}>Zoom Out</button>
      </div>
      
      <div>
        <h3>Shapes ({shapes.length})</h3>
        {shapes.map(shape => (
          <div 
            key={shape.id} 
            onClick={() => selectShape(shape.id)}
            style={{
              background: selectedShapeIds.includes(shape.id) ? '#e3f2fd' : 'white'
            }}
          >
            {shape.type} at ({shape.x}, {shape.y})
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Performance Tips

1. **Use selectors for derived state**:
   ```typescript
   const productCount = useCanvasStore(
     (state) => state.shapes.filter(s => s.type === 'product').length
   );
   ```

2. **Avoid selecting entire state**:
   ```typescript
   // ❌ Bad - re-renders on any state change
   const state = useCanvasStore();
   
   // ✅ Good - only re-renders when shapes change
   const shapes = useCanvasStore((state) => state.shapes);
   ```

3. **Batch updates when possible**:
   ```typescript
   // Multiple updates in sequence will trigger one re-render
   updateShape(id1, { x: 100 });
   updateShape(id2, { y: 200 });
   ```

## Type Safety

All store methods are fully typed. TypeScript will provide autocomplete for:
- Shape properties based on shape type
- Available actions
- State structure

```typescript
// TypeScript knows the metadata structure based on type
const product: Product = {
  type: 'product',
  metadata: {
    productId: 'PROD-001',  // ✓ Correct
    name: 'Product',        // ✓ Correct
    // isLoadBearing: true  // ❌ Error - not valid for Product
  }
};
```

## Testing

A test component is available in [`src/App.tsx`](src/App.tsx) that demonstrates:
- Adding shapes
- Updating positions
- Deleting shapes
- Selection management
- Canvas controls
- Persistence verification

Run the dev server to test:
```bash
npm run dev
```

Then open the browser console to see store logs.