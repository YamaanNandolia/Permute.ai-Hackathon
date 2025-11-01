/**
 * BaseAgent - Abstract base class implementing IAgent interface
 * Provides common functionality for all agents
 */

import type { IAgent, AgentObservation, AgentAction, AgentContext, AgentResult } from '../types/agent';
import type { Shape, CanvasConfig } from '../types';

/**
 * Abstract base class for agents
 * Subclasses must implement observe, plan, and act methods
 */
export abstract class BaseAgent implements IAgent {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract priority: number;

  /**
   * Observe the current state and extract relevant information
   * @param state - Current application state
   */
  abstract observe(state: any): AgentObservation;

  /**
   * Plan actions based on observations
   * @param observation - Agent's observation of current state
   */
  abstract plan(observation: AgentObservation): AgentAction[];

  /**
   * Execute actions on the store
   * @param actions - Planned actions to execute
   * @param context - Execution context with store reference
   */
  abstract act(actions: AgentAction[], context: AgentContext): AgentResult;

  /**
   * Helper method to create an observation
   */
  protected createObservation(data: Record<string, any>): AgentObservation {
    return {
      timestamp: Date.now(),
      agentId: this.id,
      data,
    };
  }

  /**
   * Helper method to create a successful result
   */
  protected createSuccessResult(
    actionsApplied: number,
    metadata: Record<string, any> = {}
  ): AgentResult {
    return {
      success: true,
      actionsApplied,
      errors: [],
      metadata,
    };
  }

  /**
   * Helper method to create an error result
   */
  protected createErrorResult(
    errors: string[],
    actionsApplied: number = 0,
    metadata: Record<string, any> = {}
  ): AgentResult {
    return {
      success: false,
      actionsApplied,
      errors,
      metadata,
    };
  }

  /**
   * Helper to check if two shapes overlap
   */
  protected shapesOverlap(a: Shape, b: Shape): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }

  /**
   * Helper to calculate distance between two shapes
   */
  protected shapeDistance(a: Shape, b: Shape): number {
    const dx = (a.x + a.width / 2) - (b.x + b.width / 2);
    const dy = (a.y + a.height / 2) - (b.y + b.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Helper to snap position to grid
   */
  protected snapToGrid(value: number, gridSize: number): number {
    return Math.round(value / gridSize) * gridSize;
  }

  /**
   * Helper to check if shape is within canvas bounds
   */
  protected isInBounds(shape: Shape, canvas: CanvasConfig): boolean {
    return (
      shape.x >= 0 &&
      shape.y >= 0 &&
      shape.x + shape.width <= canvas.width &&
      shape.y + shape.height <= canvas.height
    );
  }

  /**
   * Log agent activity for debugging
   */
  protected log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.name}] ${message}`, data || '');
  }

  /**
   * Log agent errors
   */
  protected logError(message: string, error?: any): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${this.name}] ERROR: ${message}`, error || '');
  }
}