
# React-Konva Agentic Floor Plan Designer - Architecture Document

## Executive Summary

This document outlines the architecture for an interactive floor plan designer built with React, Vite, react-konva, and Zustand. The system implements an **agentic pattern** that allows both human interaction and programmatic control of canvas objects for optimal product placement and layout optimization in retail floor plans.

**Core Innovation**: The agentic pattern enables AI-driven layout optimization while maintaining full user control, integrating with a Python pathfinding backend for foot traffic analysis.

---

## 1. System Overview

### 1.1 Purpose
Build an interactive canvas application where users can:
- Design floor plans by placing walls, products, and zones
- Manually drag and position elements
- Allow agents to automatically optimize layouts based on goals (visibility, traffic flow, accessibility)
- Visualize pathfinding and heatmap data from the backend

### 1.2 Technology Stack
- **Frontend Framework**: React 18+ with Vite
- **Canvas Library**: react-konva + konva
- **State Management**: Zustand
- **Language**: TypeScript (strict mode)
- **Persistence**: localStorage
- **Backend Integration**: FastAPI (floor_plan_pathfinder.py)

### 1.3 Design Constraints
- Minimal dependencies
- No unnecessary UI frameworks (focus on canvas)
- Clean, extensible architecture
- Deterministic agent behavior
- Real-time synchronization between human and agent actions

---

## 2. File Structure

```
react-konva-agentic-floor-plan/
├── public/
│   └── sample-floorplan.png          # Sample floor plan for testing
├── src/
│   ├── agents/                       # Agent logic modules
│   │   ├── types.ts                  # Agent interface definitions
│   │   ├── AgentEngine.ts            # Core agent execution engine
│   │   ├── LayoutOptimizationAgent.ts # Layout optimization logic
│   │   └── PathfindingAgent.ts       # Pathfinding integration
│   │
│   ├── canvas/                       # Canvas components
│   │   ├── CanvasStage.tsx           # Main Konva Stage wrapper
│   │   ├── CanvasLayer.tsx           # Layer component
│   │   ├── shapes/                   # Shape components
│   │   │   ├── Rectangle.tsx         # Generic rectangle shape
│   │   │   ├── Wall.tsx              # Wall element
│   │   │   ├── Product.tsx           # Product placement marker
│   │   │   └── Zone.tsx              # Zone/area marker
│   │   └── overlays/                 # Visualization overlays
│   │       ├── PathOverlay.tsx       # Pathfinding visualization
│   │       └── HeatmapOverlay.tsx    # Traffic heatmap
│   │
│   ├── state/                        # State management
│   │   ├── store.ts                  # Main Zustand store
│   │   ├── types.ts                  # State type definitions
│   │   ├── slices/                   # Store slices
│   │   │   ├── shapesSlice.ts        # Shapes state & actions
│   │   │   ├── agentSlice.ts         # Agent state & control
│   │   │   └── canvasSlice.ts        # Canvas config state
│   │   └── persistence.ts            # localStorage middleware
│   │
│   ├── api/                          # Backend integration
│   │   └── floorplanApi.ts           # FastAPI client
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAgentSync.ts           # Agent-store synchronization
│   │   └── useCanvasEvents.ts        # Canvas event handlers
│   │
│   ├── types/                        # Shared TypeScript types
│   │   └── index.ts                  # Exported type definitions
│   │
│   ├── utils/                        # Utility functions
│   │   ├── geometry.ts               # Geometric calculations
│   │   └── validation.ts             # Shape validation
│   │
│   ├── App.tsx                       # Main application component
│   ├── main.tsx                      # Vite entry point
│   └── vite-env.d.ts                 # Vite type definitions
│
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### File Purpose Documentation

#### Core Files
- **`App.tsx`**: Main application component that orchestrates the canvas, agent engine, and UI controls
- **`main.tsx`**: Vite entry point, renders App component

#### Agent System (`src/agents/`)
- **`types.ts`**: Defines `IAgent` interface and agent-related types
- **`AgentEngine.ts`**: Central agent execution engine that manages observe-plan-act cycles
- **`LayoutOptimizationAgent.ts`**: Implements layout optimization strategies (spacing, visibility, accessibility)
- **`PathfindingAgent.ts`**: Integrates with backend pathfinding API for route visualization

#### Canvas Layer (`src/canvas/`)
- **`CanvasStage.tsx`**: Root Konva Stage component managing layers and event delegation
- **`CanvasLayer.tsx`**: Layer wrapper for organizing shapes by z-index
- **`shapes/Rectangle.tsx`**: Base rectangle component with drag/select handlers
- **`shapes/Wall.tsx`**: Wall element (obstacle in pathfinding)
- **`shapes/Product.tsx`**: Product placement marker with metadata
- **`shapes/Zone.tsx`**: Designated zones (checkout, entrance, etc.)
- **`overlays/PathOverlay.tsx`**: Renders pathfinding routes from backend
- **`overlays/HeatmapOverlay.tsx`**: Renders traffic heatmap visualization

#### State Management (`src/state/`)
- **`store.ts`**: Main Zustand store combining all slices with persistence
- **`types.ts`**: State type definitions and shapes
- **`slices/shapesSlice.ts`**: CRUD operations for shapes, selection, transforms
- **`slices/agentSlice.ts`**: Agent execution state, enabled agents, scheduling
- **`slices/canvasSlice.ts`**: Canvas configuration (viewport, grid, snap)
- **`persistence.ts`**: localStorage middleware for state persistence

#### Integration (`src/api/`)
- **`floorplanApi.ts`**: REST client for floor_plan_pathfinder.py backend

#### Hooks (`src/hooks/`)
- **`useAgentSync.ts`**: Syncs agent actions with store, handles observe-plan-act cycle
- **`useCanvasEvents.ts`**: Manages canvas event handlers (drag, select, transform)

---

## 3. State Management Architecture

### 3.1 State Shape (TypeScript)

```typescript
// src/state/types.ts

/** Core shape types */
export enum ShapeType {
  RECTANGLE = 'rectangle',
  WALL = 'wall',
  PRODUCT = 'product',
  ZONE = 'zone',
}

/** Base shape interface */
export interface BaseShape {
  id: string;                    // Unique identifier (UUID)
  type: ShapeType;               // Shape variant
  x: number;                     // X position (canvas coordinates)
  y: number;                     // Y position
  width: number;                 // Width in pixels
  height: number;                // Height in pixels
  rotation: number;              // Rotation in degrees
  fill: string;                  // Fill color (hex)
  stroke: string;                // Stroke color (hex)
  strokeWidth: number;           // Stroke width
  opacity: number;               // Opacity (0-1)
  draggable: boolean;            // Can be dragged by user
  selectable: boolean;           // Can be selected
  layer: number;                 // Z-index layer (0-10)
  metadata: Record<string, any>; // Custom metadata
  createdAt: number;             // Timestamp
  updatedAt: number;             // Timestamp
}

/** Product-specific shape */
export interface ProductShape extends BaseShape {
  type: ShapeType.PRODUCT;
  metadata: {
    productId: string;           // Product identifier
    name: string;                // Product name
    category: string;            // Product category
    visibility: number;          // Visibility score (0-100)
  };
}

/** Wall shape (obstacle) */
export interface WallShape extends BaseShape {
  type: ShapeType.WALL;
  metadata: {
    isLoadBearing: boolean;      // Cannot be moved by agents
  };
}

/** Zone shape */
export interface ZoneShape extends BaseShape {
  type: ShapeType.ZONE;
  metadata: {
    zoneType: 'entrance' | 'checkout' | 'display' | 'storage';
    capacity: number;            // Max items in zone
  };
}

/** Union type for all shapes */
export type Shape = BaseShape | ProductShape | WallShape | ZoneShape;

/** Canvas configuration */
export interface CanvasConfig {
  width: number;                 // Stage width
  height: number;                // Stage height
  scale: number;                 // Zoom level (0.1 - 5)
  offsetX: number;               // Pan offset X
  offsetY: number;               // Pan offset Y
  gridSize: number;              // Grid cell size (0 = no grid)
  snapToGrid: boolean;           // Snap shapes to grid
  backgroundColor: string;       // Canvas background color
  showGrid: boolean;             // Display grid overlay
}

/** Agent configuration */
export interface AgentConfig {
  enabled: boolean;              // Master enable/disable
  autoRun: boolean;              // Auto-run on state change
  intervalMs: number;            // Polling interval (event-driven if 0)
  maxIterations: number;         // Max optimization iterations
  conflictResolution: 'abort' | 'merge' | 'overwrite'; // Conflict handling
}

/** Agent execution state */
export interface AgentState {
  isRunning: boolean;            // Currently executing
  currentAgent: string | null;   // Active agent ID
  lastRun: number | null;        // Last execution timestamp
  error: string | null;          // Last error message
}

/** Complete application state */
export interface AppState {
  // Shape management
  shapes: Record<string, Shape>; // Shape dictionary by ID
  selectedIds: string[];         // Currently selected shape IDs
  
  // Canvas
  canvas: CanvasConfig;
  
  // Agent system
  agents: {
    config: AgentConfig;
    state: AgentState;
    enabledAgents: string[];     // IDs of enabled agents
  };
  
  // Pathfinding integration
  pathfinding: {
    occupancyGrid: number[][] | null; // Grid from backend
    currentPath: [number, number][] | null; // Active path
    heatmap: number[][] | null;  // Traffic heatmap
  };
}
```

### 3.2 Store Structure (Zustand)

```typescript
// src/state/store.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { shapesSlice } from './slices/shapesSlice';
import { agentSlice } from './slices/agentSlice';
import { canvasSlice } from './slices/canvasSlice';
import type { AppState } from './types';

/** Combined store with all slices */
export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Merge all slices
        ...shapesSlice(set, get),
        ...agentSlice(set, get),
        ...canvasSlice(set, get),
      }),
      {
        name: 'floor-plan-storage', // localStorage key
        partialize: (state) => ({
          // Only persist these fields
          shapes: state.shapes,
          canvas: state.canvas,
          agents: {
            config: state.agents.config,
            enabledAgents: state.agents.enabledAgents,
          },
        }),
      }
    )
  )
);
```

### 3.3 Shape Slice Actions

```typescript
// src/state/slices/shapesSlice.ts

export interface ShapesSlice {
  shapes: Record<string, Shape>;
  selectedIds: string[];
  
  // CRUD operations
  addShape: (shape: Omit<Shape, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  deleteShapes: (ids: string[]) => void;
  
  // Batch operations (for agent efficiency)
  batchUpdate: (updates: Array<{ id: string; changes: Partial<Shape> }>) => void;
  
  // Selection
  selectShape: (id: string) => void;
  selectShapes: (ids: string[]) => void;
  deselectAll: () => void;
  
  // Query helpers
  getShape: (id: string) => Shape | undefined;
  getAllShapes: () => Shape[];
  getShapesByType: (type: ShapeType) => Shape[];
  
  // Transform operations
  moveShape: (id: string, dx: number, dy: number) => void;
  rotateShape: (id: string, degrees: number) => void;
  scaleShape: (id: string, scaleX: number, scaleY: number) => void;
}

export const shapesSlice = (set, get): ShapesSlice => ({
  shapes: {},
  selectedIds: [],
  
  addShape: (shapeData) => {
    const id = crypto.randomUUID();
    const now = Date.now();
    const shape = {
      ...shapeData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      shapes: { ...state.shapes, [id]: shape },
    }));
    return id;
  },
  
  updateShape: (id, updates) => {
    set((state) => ({
      shapes: {
        ...state.shapes,
        [id]: {
          ...state.shapes[id],
          ...updates,
          updatedAt: Date.now(),
        },
      },
    }));
  },
  
  batchUpdate: (updates) => {
    set((state) => {
      const newShapes = { ...state.shapes };
      const now = Date.now();
      updates.forEach(({ id, changes }) => {
        if (newShapes[id]) {
          newShapes[id] = { ...newShapes[id], ...changes, updatedAt: now };
        }
      });
      return { shapes: newShapes };
    });
  },
  
  deleteShape: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.shapes;
      return {
        shapes: rest,
        selectedIds: state.selectedIds.filter((sid) => sid !== id),
      };
    });
  },
  
  // ... additional methods
});
```

---

## 4. Agentic Pattern Architecture

### 4.1 Agent Interface

```typescript
// src/agents/types.ts

/** Core agent interface - all agents must implement */
export interface IAgent {
  /** Unique agent identifier */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Agent description */
  description: string;
  
  /** Priority (higher = runs first) */
  priority: number;
  
  /**
   * Observe: Read current application state
   * @param state - Current app state (read-only)
   * @returns Agent's internal observation/understanding
   */
  observe(state: Readonly<AppState>): AgentObservation;
  
  /**
   * Plan: Generate list of actions based on observations
   * @param observation - Result from observe()
   * @returns Ordered list of actions to perform
   */
  plan(observation: AgentObservation): AgentAction[];
  
  /**
   * Act: Apply actions to the store
   * @param actions - Actions from plan()
   * @param context - Execution context (store, timestamp, etc.)
   * @returns Execution result
   */
  act(actions: AgentAction[], context: AgentContext): AgentResult;
}

/** Agent observation data structure */
export interface AgentObservation {
  timestamp: number;
  agentId: string;
  data: Record<string, any>; // Agent-specific observation data
}

/** Agent action types */
export enum AgentActionType {
  MOVE_SHAPE = 'move_shape',
  RESIZE_SHAPE = 'resize_shape',
  ADD_SHAPE = 'add_shape',
  DELETE_SHAPE = 'delete_shape',
  UPDATE_METADATA = 'update_metadata',
  BATCH_UPDATE = 'batch_update',
}

/** Agent action */
export interface AgentAction {
  type: AgentActionType;
  shapeId?: string;
  payload: Record<string, any>;
  reason?: string; // Optional explanation for logging
}

/** Agent execution context */
export interface AgentContext {
  store: typeof useStore; // Zustand store reference
  timestamp: number;
  previousState: Readonly<AppState>;
}

/** Agent execution result */
export interface AgentResult {
  success: boolean;
  actionsApplied: number;
  errors: string[];
  metadata: Record<string, any>;
}
```

### 4.2 Agent Engine

```typescript
// src/agents/AgentEngine.ts

/**
 * AgentEngine - Central coordinator for agent execution
 * Implements the observe-plan-act cycle with event-driven triggers
 */
export class AgentEngine {
  private agents: Map<string, IAgent> = new Map();
  private unsubscribe: (() => void) | null = null;
  
  constructor(private store: typeof useStore) {}
  
  /** Register an agent */
  registerAgent(agent: IAgent): void {
    this.agents.set(agent.id, agent);
    console.log(`[AgentEngine] Registered agent: ${agent.name}`);
  }
  
  /** Unregister an agent */
  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
  }
  
  /** Start event-driven agent execution */
  start(): void {
    // Subscribe to state changes
    this.unsubscribe = this.store.subscribe(
      (state) => state.shapes,
      (shapes, prevShapes) => {
        // Only trigger if shapes actually changed
        if (shapes !== prevShapes) {
          this.runAgents();
        }
      }
    );
    console.log('[AgentEngine] Started (event-driven mode)');
  }
  
  /** Stop agent execution */
  stop(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    console.log('[AgentEngine] Stopped');
  }
  
  /** Execute all enabled agents */
  private async runAgents(): Promise<void> {
    const state = this.store.getState();
    
    // Check if agents are enabled
    if (!state.agents.config.enabled || state.agents.state.isRunning) {
      return;
    }
    
    // Set running state
    this.store.setState((s) => ({
      agents: {
        ...s.agents,
        state: { ...s.agents.state, isRunning: true },
      },
    }));
    
    try {
      // Get enabled agents sorted by priority
      const enabledAgents = Array.from(this.agents.values())
        .filter((agent) => state.agents.enabledAgents.includes(agent.id))
        .sort((a, b) => b.priority - a.priority);
      
      for (const agent of enabledAgents) {
        await this.executeAgent(agent);
      }
    } finally {
      // Clear running state
      this.store.setState((s) => ({
        agents: {
          ...s.agents,
          state: {
            ...s.agents.state,
            isRunning: false,
            lastRun: Date.now(),
          },
        },
      }));
    }
  }
  
  /** Execute single agent through observe-plan-act cycle */
  private async executeAgent(agent: IAgent): Promise<void> {
    const state = this.store.getState();
    
    try {
      // OBSERVE: Agent reads current state
      const observation = agent.observe(state);
      
      // PLAN: Agent generates actions
      const actions = agent.plan(observation);
      
      if (actions.length === 0) {
        return; // Nothing to do
      }
      
      // ACT: Agent applies actions
      const context: AgentContext = {
        store: this.store,
        timestamp: Date.now(),
        previousState: state,
      };
      
      const result = agent.act(actions, context);
      
      if (!result.success) {
        console.error(`[AgentEngine] Agent ${agent.name} failed:`, result.errors);
      }
    } catch (error) {
      console.error(`[AgentEngine] Error executing agent ${agent.name}:`, error);
      this.store.setState((s) => ({
        agents: {
          ...s.agents,
          state: {
            ...s.agents.state,
            error: error.message,
          },
        },
      }));
    }
  }
  
  /** Manually trigger agent execution (for UI buttons) */
  async triggerAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    await this.executeAgent(agent);
  }
}
```

### 4.3 Example Agent: Layout Optimization

```typescript
// src/agents/LayoutOptimizationAgent.ts

/**
 * LayoutOptimizationAgent
 * Optimizes product placement for maximum visibility and accessibility
 */
export class LayoutOptimizationAgent implements IAgent {
  id = 'layout-optimization';
  name = 'Layout Optimizer';
  description = 'Optimizes product placement for visibility and flow';
  priority = 10;
  
  observe(state: Readonly<AppState>): AgentObservation {
    const products = Object.values(state.shapes).filter(
      (s) => s.type === ShapeType.PRODUCT
    ) as ProductShape[];
    
    const walls = Object.values(state.shapes).filter(
      (s) => s.type === ShapeType.WALL
    ) as WallShape[];
    
    // Calculate metrics
    const metrics = {
      productCount: products.length,
      averageSpacing: this.calculateAverageSpacing(products),
      wallProximity: this.calculateWallProximity(products, walls),
      overlaps: this.detectOverlaps(products),
    };
    
    return {
      timestamp: Date.now(),
      agentId: this.id,
      data: {
        products,
        walls,
        metrics,
      },
    };
  }
  
  plan(observation: AgentObservation): AgentAction[] {
    const { products, metrics } = observation.data;
    const actions: AgentAction[] = [];
    
    // Strategy 1: Fix overlapping products
    if (metrics.overlaps.length > 0) {
      metrics.overlaps.forEach(([id1, id2]) => {
        const product1 = products.find((p) => p.id === id1);
        const product2 = products.find((p) => p.id === id2);
        
        if (product1 && product2) {
          // Move product2 to avoid overlap
          const newPosition = this.findNonOverlappingPosition(
            product2,
            products.filter((p) => p.id !== id2)
          );
          
          actions.push({
            type: AgentActionType.MOVE_SHAPE,
            shapeId: id2,
            payload: { x: newPosition.x, y: newPosition.y },
            reason: `Resolving overlap with ${id1}`,
          });
        }
      });
    }
    
    // Strategy 2: Improve spacing
    if (metrics.averageSpacing < 50) {
      // Products too close, spread them out
      const gridLayout = this.calculateGridLayout(products, 80); // 80px spacing
      
      gridLayout.forEach(({ id, x, y }) => {
        actions.push({
          type: AgentActionType.MOVE_SHAPE,
          shapeId: id,
          payload: { x, y },
          reason: 'Improving spacing',
        });
      });
    }
    
    return actions;
  }
  
  act(actions: AgentAction[], context: AgentContext): AgentResult {
    const errors: string[] = [];
    let applied = 0;
    
    const batchUpdates = actions.map((action) => {
      if (action.type === AgentActionType.MOVE_SHAPE && action.shapeId) {
        applied++;
        return {
          id: action.shapeId,
          changes: {
            x: action.payload.x,
            y: action.payload.y,
          },
        };
      }
      return null;
    }).filter(Boolean);
    
    // Apply as batch for efficiency
    context.store.getState().batchUpdate(batchUpdates);
    
    return {
      success: errors.length === 0,
      actionsApplied: applied,
      errors,
      metadata: {
        timestamp: context.timestamp,
      },
    };
  }
  
  // Helper methods
  private calculateAverageSpacing(products: ProductShape[]): number {
    if (products.length < 2) return Infinity;
    
    let totalDistance = 0;
    let pairs = 0;
    
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        const dx = products[i].x - products[j].x;
        const dy = products[i].y - products[j].y;
        totalDistance += Math.sqrt(dx * dx + dy * dy);
        pairs++;
      }
    }
    
    return totalDistance / pairs;
  }
  
  private calculateWallProximity(
    products: ProductShape[],
    walls: WallShape[]
  ): number {
    // Implementation omitted for brevity
    return 0;
  }
  
  private detectOverlaps(
    products: ProductShape[]
  ): Array<[string, string]> {
    const overlaps: Array<[string, string]> = [];
    
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        if (this.shapesOverlap(products[i], products[j])) {
          overlaps.push([products[i].id, products[j].id]);
        }
      }
    }
    
    return overlaps;
  }
  
  private shapesOverlap(a: Shape, b: Shape): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }
  
  private findNonOverlappingPosition(
    shape: ProductShape,
    others: ProductShape[]
  ): { x: number; y: number } {
    // Simple strategy: move right until no overlap
    let x = shape.x;
    let y = shape.y;
    let attempts = 0;
    
    while (attempts < 100) {
      const testShape = { ...shape, x, y };
      const hasOverlap = others.some((other) =>
        this.shapesOverlap(testShape, other)
      );
      
      if (!hasOverlap) {
        return { x, y };
      }
      
      x += 10;
      attempts++;
    }
    
    return { x: shape.x + 100, y: shape.y };
  }
  
  private calculateGridLayout(
    products: ProductShape[],
    spacing: number
  ): Array<{ id: string; x: number; y: number }> {
    const cols = Math.ceil(Math.sqrt(products.length));
    
    return products.map((product, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      return {
        id: product.id,
        x: col * spacing + 100,
        y: row * spacing + 100,
      };
    });
  }
}
```

---

## 5. Component Architecture

### 5.1 Component Hierarchy

```
App
├── CanvasStage
│   ├── CanvasLayer (layer=0, background)
│   │   └── GridOverlay (optional)
│   │
│   ├── CanvasLayer (layer=1, walls)
│   │   └── Wall[] (multiple wall shapes)
│   │
│   ├── CanvasLayer (layer=2, zones)
│   │   └── Zone[] (zone markers)
│   │
│   ├── CanvasLayer (layer=3, products)
│   │   └── Product[] (product placement markers)
│   │
│   └── CanvasLayer (layer=4, overlays)
│       ├── PathOverlay (pathfinding visualization)
│       └── HeatmapOverlay (traffic heatmap)
│
└── ControlPanel (minimal UI)
    ├── AgentControls (enable/disable agents)
    └── CanvasControls (zoom, reset, save)
```

### 5.2 CanvasStage Component

```typescript
// src/canvas/CanvasStage.tsx

import { Stage, Layer } from 'react-konva';
import { useStore } from '../state/store';
import { useCanvasEvents } from '../hooks/useCanvasEvents';
import Wall from './shapes/Wall';
import Product from './shapes/Product';
import Zone from './shapes/Zone';
import PathOverlay from './overlays/PathOverlay';
import HeatmapOverlay from './overlays/HeatmapOverlay';

export const CanvasStage: React.FC = () => {
  const { canvas, shapes } = useStore();
  const { handleStageClick, handleDragEnd } = useCanvasEvents();
  
  // Group shapes by layer
  const walls = Object.values(shapes).filter((s) => s.type === 'wall');
  const zones = Object.values(shapes).filter((s) => s.type === 'zone');
  const products = Object.values(shapes).filter((s) => s.type === 'product');
  
  return (
    <Stage
      width={canvas.width}
      height={canvas.height}
      scale={{ x: canvas.scale, y: canvas.scale }}
      x={canvas.offsetX}
      y={canvas.offsetY}
      onClick={handleStageClick}
    >
      {/* Background layer */}
      <Layer>
        {canvas.showGrid && <GridOverlay />}
      </Layer>
      
      {/* Walls layer */}
      <Layer>
        {walls.map((wall) => (
          <Wall key={wall.id} shape={wall} onDragEnd={handleDragEnd} />
        ))}
      </Layer>
      
      {/* Zones layer */}
      <Layer>
        {zones.map((zone) => (
          <Zone key={zone.id} shape={zone} onDragEnd={handleDragEnd} />
        ))}
      </Layer>
      
      {/* Products layer */}
      <Layer>
        {products.map((product) => (
          <Product key={product.id} shape={product} onDragEnd={handleDragEnd} />
        ))}
      </Layer>
      
      {/* Visualization overlays */}
      <Layer>
        <PathOverlay />
        <HeatmapOverlay />
      </Layer>
    </Stage>
  );
};
```

### 5.3 Shape Component (Product Example)

```typescript
// src/canvas/shapes/Product.tsx

import { Rect, Text, Group } from 'react-konva';
import { useStore } from '../../state/store';
import type { ProductShape } from '../../state/types';

interface ProductProps {
  shape: ProductShape;
  onDragEnd: (id: string, x: number, y: number) => void;
}

export const Product: React.FC<ProductProps> = ({ shape, onDragEnd }) => {
  const { selectedIds, selectShape } = useStore();
  const isSelected = selectedIds.includes(shape.id);
  
  const handleDragEnd = (e: any) => {
    const node = e.target;
    onDragEnd(shape.id, node.x(), node.y());
  };
  
  return (
    <Group
      id={shape.id}
      x={shape.x}
      y={shape.y}
      draggable={shape.draggable}
      onClick={() => selectShape(shape.id)}
      onDragEnd={handleDragEnd}
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
        fill="#000"
        align="center"
        verticalAlign="middle"
        width={shape.width}
        height={shape.height}
      />
    </Group>
  );
};

export default Product;
```

---

## 6. Event Flow & Synchronization

### 6.1 Human Interaction Flow

```
User Action (Drag) → Konva Event → Event Handler Hook → Store Action → State Update
                                                                            ↓
                                                                Agent Trigger (if enabled)
                                                                            ↓
                                                               Agent Observes New State
                                                                            ↓
                                                                   Agent Plans Actions
                                                                            ↓
                                                                    Agent Acts on Store
                                                                            ↓
                                                                      State Update
                                                                            ↓
                                                                  React Re-render
```

### 6.2 Event Handler Hook

```typescript
// src/hooks/useCanvasEvents.ts

import { useStore } from '../state/store';

export const useCanvasEvents = () => {
  const { updateShape, selectShape, deselectAll } = useStore();
  
  /** Handle shape drag end - sync position to store */
  const handleDragEnd = (id: string, x: number, y: number) => {
    updateShape(id, { x, y });
  };
  
  /** Handle stage click - deselect all if clicking empty area */
  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      deselectAll();
    }
  };
  
  /** Handle shape transform - sync size/rotation to store */
  const handleTransformEnd = (id: string, attrs: any) => {
    updateShape(id, {
      x: attrs.x,
      y: attrs.y,
      width: attrs.width * attrs.scaleX,
      height: attrs.height * attrs.scaleY,
      rotation: attrs.rotation,
    });
  };
  
  return {
    handleDragEnd,
    handleStageClick,
    handleTransformEnd,
  };
};
```

### 6.3 Agent Synchronization Hook

```typescript
// src/hooks/useAgentSync.ts

import { useEffect, useRef } from 'react';
import { useStore } from '../state/store';
import { AgentEngine } from '../agents/AgentEngine';
import { LayoutOptimizationAgent } from '../agents/LayoutOptimizationAgent';

export const useAgentSync = () => {
  const store = useStore();
  const engineRef = useRef<AgentEngine | null>(null);
  
  useEffect(() => {
    // Initialize agent engine
    const engine = new AgentEngine(store);
    
    // Register agents
    engine.registerAgent(new LayoutOptimizationAgent());
    // engine.registerAgent(new PathfindingAgent()); // Future agent
    
    // Start event-driven execution
    if (store.getState().agents.config.enabled) {
      engine.start();
    }
    
    engineRef.current = engine;
    
    return () => {
      engine.stop();
    };
  }, []);
  
  // Expose manual trigger for UI
  const triggerAgent = (agentId: string) => {
    if (engineRef.current) {
      engineRef.current.triggerAgent(agentId);
    }
  };
  
  return { triggerAgent };
};
```

---

## 7. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                          │
│  ┌──────────────┐              ┌───────────────┐                │
│  │ Canvas Stage │              │ Control Panel │                │
│  │  (Konva.js)  │              │   (Minimal)   │                │
│  └──────┬───────┘              └───────┬───────┘                │
│         │                              │                         │
└─────────┼──────────────────────────────┼─────────────────────────┘
          │                              │
          │ User Drag/Click              │ Toggle Agents
          ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EVENT HANDLERS (Hooks)                      │
│  ┌──────────────────┐          ┌────────────────┐               │
│  │ useCanvasEvents  │          │ useAgentSync   │               │
│  └────────┬─────────┘          └────────┬───────┘               │
└───────────┼──────────────────────────────┼───────────────────────┘
            │                              │
            │ updateShape()                │ engine.start()
            ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ZUSTAND STORE (State)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐            │
│  │   shapes    │  │ agents.config│  │   canvas    │            │
│  │ selectedIds │  │ agents.state │  │
  │ pathfinding │            │
│  └─────┬───────┘  └──────┬───────┘  └──────┬──────┘            │
└────────┼───────────────────┼──────────────────┼──────────────────┘
         │                   │                  │
         │ State Change      │ Agent Enabled    │
         ▼                   ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AGENT ENGINE                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Observe-Plan-Act Cycle (Event-Driven)            │   │
│  │                                                            │   │
│  │  1. observe(state) → AgentObservation                    │   │
│  │  2. plan(observation) → AgentAction[]                    │   │
│  │  3. act(actions, context) → AgentResult                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Registered Agents:                                              │
│  ┌─────────────────────┐    ┌──────────────────────┐           │
│  │ LayoutOptimization  │    │  PathfindingAgent    │           │
│  │      Agent          │    │      (Future)        │           │
│  └─────────────────────┘    └──────────────────────┘           │
└──────────────────────┬────────────────────────────────────────────┘
                       │
                       │ batchUpdate()
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STATE PERSISTENCE                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  localStorage (shapes, canvas, agent config)            │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. localStorage Persistence Strategy

### 8.1 Persistence Middleware

```typescript
// src/state/persistence.ts

import { StateStorage } from 'zustand/middleware';

/** Custom storage implementation with versioning */
export const storageWithVersion: StateStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    if (!item) return null;
    
    try {
      const parsed = JSON.parse(item);
      
      // Check version for migrations
      if (parsed.version !== CURRENT_VERSION) {
        return migrateState(parsed);
      }
      
      return parsed.state;
    } catch (error) {
      console.error('Error parsing stored state:', error);
      return null;
    }
  },
  
  setItem: (name: string, value: string) => {
    const wrapped = {
      version: CURRENT_VERSION,
      timestamp: Date.now(),
      state: value,
    };
    localStorage.setItem(name, JSON.stringify(wrapped));
  },
  
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

const CURRENT_VERSION = 1;

/** Migrate state from older versions */
function migrateState(stored: any): string | null {
  // Add migration logic as schema evolves
  return stored.state;
}
```

### 8.2 What Gets Persisted

**Persisted:**
- All shapes and their properties
- Canvas configuration (zoom, pan, grid settings)
- Agent configuration (enabled agents, auto-run settings)

**NOT Persisted (Session-Only):**
- Selected shape IDs (cleared on reload)
- Agent execution state (isRunning, currentAgent)
- Pathfinding data (fetched fresh from backend)
- Error messages

### 8.3 Auto-Save Strategy

- **Trigger**: Automatic on every state change (Zustand middleware)
- **Debouncing**: Built into Zustand persist middleware
- **Manual Save**: Export button for downloading JSON backup
- **Recovery**: Automatic restore on app load

---

## 9. Extension Points for Future Development

### 9.1 New Agent Types

To add a new agent:

1. **Create agent class** implementing `IAgent` interface
2. **Implement observe-plan-act methods** with domain logic
3. **Register in AgentEngine** during initialization
4. **Add to enabled agents list** in store

Example future agents:
- **PathfindingAgent**: Integrates with Python backend for route visualization
- **CollisionDetectionAgent**: Prevents overlapping products in real-time
- **LayoutSuggestionAgent**: Provides UI hints for better placement
- **AnalyticsAgent**: Tracks layout changes and suggests improvements
- **SeasonalAgent**: Adjusts layouts based on seasonal products

### 9.2 New Shape Types

To add a new shape type:

1. **Define shape interface** extending `BaseShape`
2. **Add to `ShapeType` enum**
3. **Create shape component** in `src/canvas/shapes/`
4. **Add rendering logic** in `CanvasStage.tsx`

Example additions:
- **Text labels**: For signage
- **Circles**: For circular displays
- **Images**: For product photos
- **Lines**: For aisles/paths

### 9.3 Backend Integration Points

Current backend integration:
- Floor plan upload → occupancy grid generation
- Pathfinding requests → route visualization

Future integrations:
- **Real-time updates**: WebSocket for multi-user collaboration
- **ML optimization**: Send layout → receive optimized version
- **Analytics**: Upload layouts → get performance predictions

### 9.4 UI Extensions

Minimal UI controls can be extended:
- **Toolbar**: Add/delete shapes, layers panel
- **Properties panel**: Edit selected shape metadata
- **Agent dashboard**: View agent activity, logs, metrics
- **Export options**: PNG, PDF, JSON formats

---

## 10. Implementation Guidelines

### 10.1 Development Phases

**Phase 1: Foundation (MVP)**
1. Set up Vite + React + TypeScript project
2. Implement Zustand store with persistence
3. Create basic canvas with Rectangle shapes
4. Add drag-and-drop functionality

**Phase 2: Agentic Core**
5. Implement `IAgent` interface and `AgentEngine`
6. Create `LayoutOptimizationAgent`
7. Add event-driven agent triggering
8. Test observe-plan-act cycle

**Phase 3: Floor Plan Features**
9. Add Wall, Product, Zone shape types
10. Implement multi-layer rendering
11. Add grid and snap-to-grid
12. Integrate with Python backend

**Phase 4: Visualization**
13. Add PathOverlay component
14. Add HeatmapOverlay component
15. Polish UI controls
16. Add export functionality

### 10.2 Testing Strategy

```typescript
// Example test structure

describe('AgentEngine', () => {
  it('should execute agents in priority order', () => {
    // Test agent execution
  });
  
  it('should handle agent errors gracefully', () => {
    // Test error handling
  });
});

describe('LayoutOptimizationAgent', () => {
  it('should detect overlapping shapes', () => {
    // Test overlap detection
  });
  
  it('should generate valid movement actions', () => {
    // Test action generation
  });
});

describe('Store', () => {
  it('should persist shapes to localStorage', () => {
    // Test persistence
  });
  
  it('should batch update shapes efficiently', () => {
    // Test batch operations
  });
});
```

### 10.3 Performance Considerations

**Optimizations:**
- **Batch Updates**: Use `batchUpdate()` for multiple shape changes
- **Memoization**: Use React.memo for shape components
- **Virtualization**: Only render visible shapes (future enhancement)
- **Debounced Saves**: Zustand persist handles this automatically
- **Agent Throttling**: Limit agent execution frequency

**Monitoring:**
- Track render count per shape
- Measure agent execution time
- Monitor localStorage size
- Log action counts per cycle

---

## 11. Deterministic Behavior Guarantees

### 11.1 Conflict Resolution

When human and agent actions conflict:

```typescript
// In AgentEngine.act()
if (state.agents.config.conflictResolution === 'abort') {
  // Check if shape was modified since observation
  if (wasModifiedSinceObservation(shapeId, observationTime)) {
    return { success: false, error: 'Shape modified by user' };
  }
}
```

Resolution strategies:
- **abort**: Skip agent action if shape changed
- **merge**: Combine user + agent changes (average positions)
- **overwrite**: Agent always wins (use cautiously)

### 11.2 Action Ordering

Agents execute in priority order:
1. Higher priority agents run first
2. Within same priority, agents run in registration order
3. Each agent sees the state AFTER previous agent's actions

### 11.3 Concurrent Modification Prevention

```typescript
// Lock mechanism during agent execution
if (state.agents.state.isRunning) {
  // Block new agent runs
  return;
}
```

---

## 12. API Integration Specification

### 12.1 Backend Endpoints

```typescript
// src/api/floorplanApi.ts

export class FloorplanAPI {
  private baseUrl: string;
  
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }
  
  /** Upload floor plan image, get occupancy grid */
  async uploadFloorplan(file: File): Promise<OccupancyGrid> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/upload-floorplan`, {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  }
  
  /** Request pathfinding between waypoints */
  async findPath(
    grid: number[][],
    waypoints: Array<[number, number]>
  ): Promise<PathResult> {
    const response = await fetch(`${this.baseUrl}/find-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grid, waypoints }),
    });
    
    return response.json();
  }
  
  /** Generate heatmap from path data */
  async generateHeatmap(
    grid: number[][],
    paths: Array<Array<[number, number]>>
  ): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/generate-heatmap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grid, paths }),
    });
    
    return response.json();
  }
}
```

### 12.2 Integration with Agents

```typescript
// Future agent using backend
export class PathfindingAgent implements IAgent {
  constructor(private api: FloorplanAPI) {}
  
  observe(state: Readonly<AppState>): AgentObservation {
    // Observe product positions, walls, zones
    // Request pathfinding from backend
    return {
      timestamp: Date.now(),
      agentId: this.id,
      data: {
        paths: await this.api.findPath(state.pathfinding.occupancyGrid, waypoints),
      },
    };
  }
  
  plan(observation: AgentObservation): AgentAction[] {
    // Use pathfinding data to suggest product moves
    // that improve traffic flow
  }
}
```

---

## 13. Security & Error Handling

### 13.1 Input Validation

```typescript
// Validate shape data before adding to store
export function validateShape(shape: Partial<Shape>): boolean {
  if (!shape.type || !Object.values(ShapeType).includes(shape.type)) {
    throw new Error('Invalid shape type');
  }
  
  if (typeof shape.x !== 'number' || typeof shape.y !== 'number') {
    throw new Error('Invalid coordinates');
  }
  
  if (shape.width <= 0 || shape.height <= 0) {
    throw new Error('Invalid dimensions');
  }
  
  return true;
}
```

### 13.2 Error Boundaries

```typescript
// Wrap agent execution in try-catch
try {
  const result = agent.act(actions, context);
} catch (error) {
  console.error(`[AgentEngine] Agent ${agent.name} failed:`, error);
  
  // Store error in state for UI display
  store.setState((s) => ({
    agents: {
      ...s.agents,
      state: {
        ...s.agents.state,
        error: error.message,
      },
    },
  }));
  
  // Continue with other agents
}
```

### 13.3 localStorage Quota

```typescript
// Check localStorage size before saving
function checkStorageQuota(): boolean {
  const test = 'test';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.error('localStorage quota exceeded');
    return false;
  }
}
```

---

## 14. Development Environment Setup

### 14.1 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "konva": "^9.2.0",
    "react-konva": "^18.2.10",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

### 14.2 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 14.3 Vite Configuration

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

---

## 15. Deployment Considerations

### 15.1 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### 15.2 Environment Variables

```env
VITE_API_URL=http://localhost:8000
VITE_ENABLE_AGENTS=true
VITE_AUTO_SAVE=true
```

### 15.3 Backend Integration

- **Development**: Proxy through Vite dev server
- **Production**: NGINX reverse proxy or API Gateway
- **CORS**: Configure backend to allow frontend origin

---

## 16. Summary & Next Steps

### 16.1 Architecture Highlights

✅ **Clean Separation**: State, UI, and agent logic are decoupled  
✅ **Extensible**: Easy to add new shapes, agents, and features  
✅ **Performant**: Batch updates, memoization, event-driven  
✅ **Deterministic**: Clear conflict resolution and action ordering  
✅ **Persistent**: Auto-save to localStorage with versioning  
✅ **Integrated**: Seamless Python backend integration  

### 16.2 Core Innovations

1. **Agentic Pattern**: Observe-plan-act cycle for programmatic canvas control
2. **Dual Control**: Human drag-and-drop + AI optimization coexist
3. **Event-Driven Agents**: Automatic triggering on state changes
4. **Batch Operations**: Efficient multi-shape updates
5. **Backend Integration**: Pathfinding and heatmap visualization

### 16.3 Implementation Checklist

- [ ] Initialize Vite + React + TypeScript project
- [ ] Set up Zustand store with slices
- [ ] Implement base shape components (Rectangle, Wall, Product, Zone)
- [ ] Create CanvasStage with layer management
- [ ] Build IAgent interface and AgentEngine
- [ ] Implement LayoutOptimizationAgent
- [ ] Add drag-and-drop with store synchronization
- [ ] Integrate localStorage persistence
- [ ] Connect to Python backend API
- [ ] Add PathOverlay and HeatmapOverlay
- [ ] Create minimal UI controls
- [ ] Test agent execution and conflict resolution
- [ ] Optimize performance (batch updates, memoization)
- [ ] Document API and extension points

### 16.4 Success Metrics

**Functionality:**
- ✓ Users can manually place/drag floor plan elements
- ✓ Agents can automatically optimize layouts
- ✓ Human and agent actions sync correctly
- ✓ State persists across sessions

**Performance:**
- ✓ Canvas renders 100+ shapes at 60fps
- ✓ Agent execution completes in <500ms
- ✓ Drag interactions feel responsive (<16ms)

**Quality:**
- ✓ No data loss on reload
- ✓ Deterministic agent behavior
- ✓ Clean, documented code
- ✓ Extensible architecture

---

## 17. Appendix: Key Design Decisions

### 17.1 Why Zustand?
- **Minimal boilerplate** compared to Redux
- **Built-in persistence** middleware
- **TypeScript-first** design
- **No context providers** needed

### 17.2 Why react-konva?
- **Declarative** React-style API
- **High performance** canvas rendering
- **Rich event system** for interactions
- **Active maintenance** and community

### 17.3 Why TypeScript?
- **Type safety** prevents runtime errors
- **Better IDE support** with autocomplete
- **Self-documenting** code through types
- **Easier refactoring** with confidence

### 17.4 Why Event-Driven Agents?
- **Responsive** to user changes
- **Efficient** - only runs when needed
- **Scalable** - no polling overhead
- **Predictable** - clear trigger conditions

---

**End of Architecture Document**

*Version: 1.0*  
*Last Updated: 2025-11-01*  
*Author: AI Architect*