/**
 * GridAlignmentAgent - Demonstrates programmatic canvas control
 * Automatically snaps shapes to grid when snap-to-grid is enabled
 */

import { BaseAgent } from './BaseAgent';
import type { AgentObservation, AgentAction, AgentContext, AgentResult } from '../types/agent';
import type { Shape } from '../types';
import { useCanvasStore } from '../state/useCanvasStore';

export class GridAlignmentAgent extends BaseAgent {
  id = 'grid-alignment';
  name = 'Grid Alignment';
  description = 'Automatically aligns shapes to grid when snap-to-grid is enabled';
  priority = 5; // Lower priority than layout optimization

  /**
   * Observe shapes that are not aligned to grid
   */
  observe(state: any): AgentObservation {
    const shapes = state.shapes as Shape[];
    const { snapToGrid, gridSize } = state.canvas;
    
    // Only run if snap-to-grid is enabled
    if (!snapToGrid) {
      this.log('Snap to grid disabled, no observation needed');
      return this.createObservation({
        snapToGrid: false,
        misalignedShapes: [],
      });
    }

    // Find shapes not aligned to grid
    const misalignedShapes: Array<{
      shape: Shape;
      currentX: number;
      currentY: number;
      snappedX: number;
      snappedY: number;
    }> = [];

    for (const shape of shapes) {
      const snappedX = this.snapToGrid(shape.x, gridSize);
      const snappedY = this.snapToGrid(shape.y, gridSize);

      // Check if shape is misaligned (tolerance of 1px for floating point errors)
      if (Math.abs(shape.x - snappedX) > 1 || Math.abs(shape.y - snappedY) > 1) {
        misalignedShapes.push({
          shape,
          currentX: shape.x,
          currentY: shape.y,
          snappedX,
          snappedY,
        });
      }
    }

    this.log(`Observed ${misalignedShapes.length} misaligned shapes (grid: ${gridSize}px)`);

    return this.createObservation({
      snapToGrid,
      gridSize,
      misalignedShapes,
      hasIssues: misalignedShapes.length > 0,
    });
  }

  /**
   * Plan actions to snap misaligned shapes to grid
   */
  plan(observation: AgentObservation): AgentAction[] {
    const { snapToGrid, misalignedShapes } = observation.data;
    const actions: AgentAction[] = [];

    if (!snapToGrid || !misalignedShapes || misalignedShapes.length === 0) {
      this.log('No grid alignment needed');
      return actions;
    }

    // Create update action for each misaligned shape
    for (const { shape, snappedX, snappedY, currentX, currentY } of misalignedShapes) {
      actions.push({
        type: 'update_shape',
        shapeId: shape.id,
        payload: {
          x: snappedX,
          y: snappedY,
        },
        reason: `Snapping to grid from (${currentX.toFixed(1)}, ${currentY.toFixed(1)}) to (${snappedX}, ${snappedY})`,
      });

      this.log(`Planning to snap shape ${shape.id} to grid`);
    }

    return actions;
  }

  /**
   * Execute grid snapping actions
   */
  act(actions: AgentAction[], context: AgentContext): AgentResult {
    if (actions.length === 0) {
      return this.createSuccessResult(0, { message: 'No alignment needed' });
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
        this.log(`Snapped ${applied} shapes to grid`);
      }

      return this.createSuccessResult(applied, {
        timestamp: context.timestamp,
        actionsProcessed: actions.length,
        message: `Aligned ${applied} shapes to grid`,
      });

    } catch (error) {
      this.logError('Failed to align shapes to grid', error);
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return this.createErrorResult(errors, applied);
    }
  }
}