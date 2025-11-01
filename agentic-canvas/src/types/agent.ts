/**
 * Agent type definitions for the agentic pattern
 */

/** Agent action types */
export const AgentActionType = {
  CREATE_SHAPE: 'create_shape',
  UPDATE_SHAPE: 'update_shape',
  DELETE_SHAPE: 'delete_shape',
  SELECT_SHAPE: 'select_shape',
  UPDATE_CANVAS: 'update_canvas',
  // Legacy aliases for backward compatibility
  MOVE_SHAPE: 'update_shape',
  RESIZE_SHAPE: 'update_shape',
  ADD_SHAPE: 'create_shape',
  UPDATE_METADATA: 'update_shape',
  BATCH_UPDATE: 'batch_update',
} as const;

export type AgentActionType = typeof AgentActionType[keyof typeof AgentActionType];

/** Agent action */
export interface AgentAction {
  type: AgentActionType;
  shapeId?: string;
  payload: Record<string, any>;
  reason?: string; // Optional explanation for logging
}

/** Agent observation data structure */
export interface AgentObservation {
  timestamp: number;
  agentId: string;
  data: Record<string, any>; // Agent-specific observation data
}

/** Agent execution result */
export interface AgentResult {
  success: boolean;
  actionsApplied: number;
  errors: string[];
  metadata: Record<string, any>;
}

/** Agent execution context */
export interface AgentContext {
  timestamp: number;
  previousState: any; // Will be typed as AppState when needed
}

/**
 * Core agent interface - all agents must implement
 * This defines the observe-plan-act cycle
 */
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
  observe(state: any): AgentObservation;
  
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