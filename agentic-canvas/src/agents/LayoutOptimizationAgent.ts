/**
 * LayoutOptimizationAgent - Example agent that optimizes shape layout
 * Prevents overlapping shapes and improves spacing
 */

import { BaseAgent } from './BaseAgent';
import type { AgentObservation, AgentAction, AgentContext, AgentResult } from '../types/agent';
import type { Shape } from '../types';
import { useCanvasStore } from '../state/useCanvasStore';

export class LayoutOptimizationAgent extends BaseAgent {
  id = 'layout-optimization';
  name = 'Layout Optimizer';
  description = 'Prevents overlapping shapes and optimizes spacing';
  priority = 10;

  /**
   * Observe current state and identify layout issues
   */
  observe(state: any): AgentObservation {
    const shapes = state.shapes as Shape[];
    
    // Find overlapping shapes
    const overlaps: Array<[string, string]> = [];
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        if (this.shapesOverlap(shapes[i], shapes[j])) {
          overlaps.push([shapes[i].id, shapes[j].id]);
        }
      }
    }

    // Calculate average spacing
    let totalDistance = 0;
    let pairs = 0;
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        totalDistance += this.shapeDistance(shapes[i], shapes[j]);
        pairs++;
      }
    }
    const averageSpacing = pairs > 0 ? totalDistance / pairs : Infinity;

    this.log(`Observed ${shapes.length} shapes, ${overlaps.length} overlaps, avg spacing: ${averageSpacing.toFixed(2)}`);

    return this.createObservation({
      shapes,
      overlaps,
      averageSpacing,
      hasIssues: overlaps.length > 0,
    });
  }

  /**
   * Plan actions to fix layout issues
   */
  plan(observation: AgentObservation): AgentAction[] {
    const { overlaps, shapes } = observation.data;
    const actions: AgentAction[] = [];

    if (!overlaps || overlaps.length === 0) {
      this.log('No overlaps detected, no actions needed');
      return actions;
    }

    // For each overlapping pair, move the second shape
    const movedShapes = new Set<string>();
    
    for (const [id1, id2] of overlaps) {
      // Skip if already moved this shape
      if (movedShapes.has(id2)) {
        continue;
      }

      const shape1 = shapes.find((s: Shape) => s.id === id1);
      const shape2 = shapes.find((s: Shape) => s.id === id2);

      if (!shape1 || !shape2) {
        continue;
      }

      // Calculate new position for shape2 to avoid overlap
      const newPosition = this.calculateNonOverlappingPosition(
        shape2,
        shapes.filter((s: Shape) => s.id !== id2)
      );

      actions.push({
        type: 'update_shape',
        shapeId: id2,
        payload: {
          x: newPosition.x,
          y: newPosition.y,
        },
        reason: `Resolving overlap with shape ${id1}`,
      });

      movedShapes.add(id2);
      this.log(`Planning to move shape ${id2} to (${newPosition.x}, ${newPosition.y})`);
    }

    return actions;
  }

  /**
   * Execute the planned actions
   */
  act(actions: AgentAction[], context: AgentContext): AgentResult {
    if (actions.length === 0) {
      return this.createSuccessResult(0, { message: 'No actions needed' });
    }

    const store = useCanvasStore.getState();
    const errors: string[] = [];
    let applied = 0;

    try {
      // Use batch update for efficiency
      const batchUpdates = actions
        .filter(action => action.type === 'update_shape' && action.shapeId)
        .map(action => ({
          id: action.shapeId!,
          changes: action.payload,
        }));

      if (batchUpdates.length > 0) {
        store.batchUpdateShapes(batchUpdates);
        applied = batchUpdates.length;
        this.log(`Applied ${applied} shape updates via batch operation`);
      }

      return this.createSuccessResult(applied, {
        timestamp: context.timestamp,
        actionsProcessed: actions.length,
      });

    } catch (error) {
      this.logError('Failed to apply actions', error);
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return this.createErrorResult(errors, applied);
    }
  }

  /**
   * Calculate a non-overlapping position for a shape
   */
  private calculateNonOverlappingPosition(
    shape: Shape,
    otherShapes: Shape[]
  ): { x: number; y: number } {
    const OFFSET = 20; // Pixels to move when resolving overlap
    const MAX_ATTEMPTS = 50;

    let x = shape.x;
    let y = shape.y;
    let attempts = 0;

    // Try moving right first, then down
    while (attempts < MAX_ATTEMPTS) {
      const testShape = { ...shape, x, y };
      const hasOverlap = otherShapes.some(other => this.shapesOverlap(testShape, other));

      if (!hasOverlap) {
        return { x, y };
      }

      // Try different positions
      if (attempts % 2 === 0) {
        x += OFFSET; // Move right
      } else {
        y += OFFSET; // Move down
      }

      attempts++;
    }

    // If we couldn't find a spot, just offset by a larger amount
    this.log(`Could not find non-overlapping position after ${MAX_ATTEMPTS} attempts, using fallback`);
    return {
      x: shape.x + OFFSET * 3,
      y: shape.y + OFFSET * 3,
    };
  }
}