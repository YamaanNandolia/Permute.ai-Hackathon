/**
 * Main Zustand store with persist middleware
 * Combines shapes, canvas, selection, and agent slices
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Shape, 
  CanvasConfig, 
  IAgent, 
  AgentConfig, 
  AgentState 
} from '../types';

/**
 * Store state interface
 */
interface CanvasStore {
  // ============ Shapes Slice ============
  shapes: Shape[];
  
  // Shape CRUD operations
  addShape: (shape: Omit<Shape, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  clearShapes: () => void;
  getShapeById: (id: string) => Shape | undefined;
  batchUpdateShapes: (updates: Array<{ id: string; changes: Partial<Shape> }>) => void;
  
  // ============ Canvas Slice ============
  canvas: CanvasConfig;
  
  // Canvas operations
  setZoom: (zoom: number) => void;
  setPan: (panX: number, panY: number) => void;
  setGridSize: (size: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  resetCanvas: () => void;
  
  // ============ Selection Slice ============
  selectedShapeIds: string[];
  
  // Selection operations
  selectShape: (id: string) => void;
  deselectShape: (id: string) => void;
  clearSelection: () => void;
  selectMultiple: (ids: string[]) => void;
  
  // ============ Agent Slice ============
  agents: IAgent[];
  agentConfig: AgentConfig;
  agentState: AgentState;
  
  // Agent operations
  registerAgent: (agent: IAgent) => void;
  unregisterAgent: (agentId: string) => void;
  triggerAgents: () => void;
  setAgentEnabled: (enabled: boolean) => void;
  setAgentAutoRun: (autoRun: boolean) => void;
}

/**
 * Default canvas configuration
 */
const defaultCanvasConfig: CanvasConfig = {
  width: 1200,
  height: 800,
  zoom: 1,
  panX: 0,
  panY: 0,
  gridSize: 20,
  snapToGrid: true,
};

/**
 * Default agent configuration
 */
const defaultAgentConfig: AgentConfig = {
  enabled: false,
  autoRun: false,
  intervalMs: 0,
  maxIterations: 10,
  conflictResolution: 'abort',
};

/**
 * Default agent state
 */
const defaultAgentState: AgentState = {
  isRunning: false,
  currentAgent: null,
  lastRun: null,
  error: null,
};

/**
 * Main Zustand store with persistence
 */
export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      // ============ Shapes Slice ============
      shapes: [],
      
      addShape: (shapeData) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        const newShape = {
          ...shapeData,
          id,
          createdAt: now,
          updatedAt: now,
        } as Shape;
        
        set((state) => ({
          shapes: [...state.shapes, newShape],
        }));
        
        return id;
      },
      
      updateShape: (id, updates) => {
        set((state) => ({
          shapes: state.shapes.map((shape) => {
            if (shape.id === id) {
              return { ...shape, ...updates, updatedAt: Date.now() } as Shape;
            }
            return shape;
          }),
        }));
      },
      
      deleteShape: (id) => {
        set((state) => ({
          shapes: state.shapes.filter((shape) => shape.id !== id),
          selectedShapeIds: state.selectedShapeIds.filter((sid) => sid !== id),
        }));
      },
      
      clearShapes: () => {
        set({
          shapes: [],
          selectedShapeIds: [],
        });
      },
      
      getShapeById: (id) => {
        return get().shapes.find((shape) => shape.id === id);
      },
      
      batchUpdateShapes: (updates) => {
        set((state) => {
          const now = Date.now();
          const shapeMap = new Map(state.shapes.map(s => [s.id, s]));
          
          // Apply all updates
          for (const { id, changes } of updates) {
            const shape = shapeMap.get(id);
            if (shape) {
              shapeMap.set(id, { ...shape, ...changes, updatedAt: now } as Shape);
            }
          }
          
          return {
            shapes: Array.from(shapeMap.values()),
          };
        });
      },
      
      // ============ Canvas Slice ============
      canvas: defaultCanvasConfig,
      
      setZoom: (zoom) => {
        set((state) => ({
          canvas: { ...state.canvas, zoom },
        }));
      },
      
      setPan: (panX, panY) => {
        set((state) => ({
          canvas: { ...state.canvas, panX, panY },
        }));
      },
      
      setGridSize: (size) => {
        set((state) => ({
          canvas: { ...state.canvas, gridSize: size },
        }));
      },
      
      setSnapToGrid: (snap) => {
        set((state) => ({
          canvas: { ...state.canvas, snapToGrid: snap },
        }));
      },
      
      resetCanvas: () => {
        set({ canvas: defaultCanvasConfig });
      },
      
      // ============ Selection Slice ============
      selectedShapeIds: [],
      
      selectShape: (id) => {
        set((state) => {
          // Toggle selection if already selected
          if (state.selectedShapeIds.includes(id)) {
            return {
              selectedShapeIds: state.selectedShapeIds.filter((sid) => sid !== id),
            };
          }
          return {
            selectedShapeIds: [...state.selectedShapeIds, id],
          };
        });
      },
      
      deselectShape: (id) => {
        set((state) => ({
          selectedShapeIds: state.selectedShapeIds.filter((sid) => sid !== id),
        }));
      },
      
      clearSelection: () => {
        set({ selectedShapeIds: [] });
      },
      
      selectMultiple: (ids) => {
        set({ selectedShapeIds: ids });
      },
      
      // ============ Agent Slice ============
      agents: [],
      agentConfig: defaultAgentConfig,
      agentState: defaultAgentState,
      
      registerAgent: (agent) => {
        set((state) => ({
          agents: [...state.agents, agent],
        }));
      },
      
      unregisterAgent: (agentId) => {
        set((state) => ({
          agents: state.agents.filter((agent) => agent.id !== agentId),
        }));
      },
      
      triggerAgents: () => {
        const state = get();
        
        // Check if agents are enabled and not already running
        if (!state.agentConfig.enabled || state.agentState.isRunning) {
          return;
        }
        
        // Set running state
        set((s) => ({
          agentState: { ...s.agentState, isRunning: true, error: null },
        }));
        
        try {
          // Sort agents by priority (higher priority runs first)
          const sortedAgents = [...state.agents].sort(
            (a, b) => b.priority - a.priority
          );
          
          // Execute each agent
          for (const agent of sortedAgents) {
            try {
              // Observe current state
              const observation = agent.observe(state);
              
              // Plan actions
              const actions = agent.plan(observation);
              
              if (actions.length === 0) {
                continue; // Nothing to do
              }
              
              // Act on the actions
              const context = {
                timestamp: Date.now(),
                previousState: state,
              };
              
              const result = agent.act(actions, context);
              
              if (!result.success) {
                console.error(`Agent ${agent.name} failed:`, result.errors);
                set((s) => ({
                  agentState: {
                    ...s.agentState,
                    error: `Agent ${agent.name} failed: ${result.errors.join(', ')}`,
                  },
                }));
              }
            } catch (error) {
              console.error(`Error executing agent ${agent.name}:`, error);
              set((s) => ({
                agentState: {
                  ...s.agentState,
                  error: error instanceof Error ? error.message : 'Unknown error',
                },
              }));
            }
          }
        } finally {
          // Clear running state
          set((s) => ({
            agentState: {
              ...s.agentState,
              isRunning: false,
              lastRun: Date.now(),
            },
          }));
        }
      },
      
      setAgentEnabled: (enabled) => {
        set((state) => ({
          agentConfig: { ...state.agentConfig, enabled },
        }));
      },
      
      setAgentAutoRun: (autoRun) => {
        set((state) => ({
          agentConfig: { ...state.agentConfig, autoRun },
        }));
      },
    }),
    {
      name: 'canvas-storage', // localStorage key
      version: 1, // Version for migration
      partialize: (state) => ({
        // Only persist these fields
        shapes: state.shapes,
        canvas: state.canvas,
        agentConfig: state.agentConfig,
      }),
    }
  )
);