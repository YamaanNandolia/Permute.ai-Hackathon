/**
 * Central export for all type definitions
 */

// Shape types
export { ShapeType } from './shapes';
export type { 
  BaseShape,
  Rectangle,
  Wall,
  Product,
  Zone,
  Shape
} from './shapes';

// Agent types
export { AgentActionType } from './agent';
export type {
  AgentAction,
  AgentObservation,
  AgentResult,
  AgentContext,
  IAgent,
  AgentConfig,
  AgentState
} from './agent';

// Canvas types
export type {
  CanvasConfig,
  ViewportState
} from './canvas';