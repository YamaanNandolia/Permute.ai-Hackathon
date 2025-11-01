/**
 * CollisionAvoidanceAgent - Demonstrates reactive behavior
 * Prevents products from overlapping with walls by pushing them away
 */

import { BaseAgent } from './BaseAgent';
import type { AgentObservation, AgentAction, AgentContext, AgentResult } from '../types/agent';
import type { Shape } from '../types';
import { ShapeType } from '../types';
import { useCanvasStore } from '../state/useCanvasStore';

export class CollisionAvoidanceAgent extends BaseAgent {
  id = 'collision-avoidance';
  name = 'Collision Avoidance';
  description = 'Prevents products from overlapping with walls';
  priority = 8; // Higher priority than layout optimization

  /**
   * Observe when products overlap with walls
   */
  observe(state: any): AgentObservation {
    const shapes = state.shapes as Shape[];
    
    // Separate shapes by type
    const walls = shapes.filter(s => s.type === ShapeType.WALL);
    const products = shapes.filter(s => s.type === ShapeType.PRODUCT);
    
    // Find collisions (products overlapping with walls)
    const collisions: Array<{
      product: Shape;
      wall: Shape;
      overlapArea: number;
    }> = [];

    for (const product of products) {
      for (const wall of walls) {
        if (this.shapesOverlap(product, wall)) {
          const overlapArea = this.calculateOverlapArea(product, wall);
          collisions.push({
            product,
            wall,
            overlapArea,
          });
        }
      }
    }

    this.log(`Observed ${collisions.length} product-wall collisions`);

    return this.createObservation({
      walls,
      products,
      collisions,
      hasIssues: collisions.length > 0,
    });
  }

  /**
   * Plan actions to move products away from walls
   */
  plan(observation: AgentObservation): AgentAction[] {
    const { collisions } = observation.data;
    const actions: AgentAction[] = [];

    if (!collisions || collisions.length === 0) {
      this.log('No collisions detected');
      return actions;
    }

    // Group collisions by product (a product might collide with multiple walls)
    const productCollisions = new Map<string, Array<{ wall: Shape; overlapArea: number }>>();
    
    for (const { product, wall, overlapArea } of collisions) {
      if (!productCollisions.has(product.id)) {
        productCollisions.set(product.id, []);
      }
      productCollisions.get(product.id)!.push({ wall, overlapArea });
    }

    // For each colliding product, calculate best escape direction
    for (const [productId, wallCollisions] of productCollisions) {
      const product = collisions.find((c: { product: Shape; wall: Shape; overlapArea: number }) => c.product.id === productId)!.product;
      
      // Calculate aggregate push direction from all colliding walls
      let pushX = 0;
      let pushY = 0;

      for (const { wall, overlapArea } of wallCollisions) {
        const direction = this.calculatePushDirection(product, wall);
        // Weight by overlap area (stronger push for larger overlaps)
        const weight = overlapArea / 1000;
        pushX += direction.x * weight;
        pushY += direction.y * weight;
      }

      // Normalize and apply minimum push distance
      const magnitude = Math.sqrt(pushX * pushX + pushY * pushY);
      if (magnitude > 0) {
        const MIN_PUSH = 30; // Minimum push distance
        pushX = (pushX / magnitude) * Math.max(magnitude * 10, MIN_PUSH);
        pushY = (pushY / magnitude) * Math.max(magnitude * 10, MIN_PUSH);
      }

      const newX = product.x + pushX;
      const newY = product.y + pushY;

      actions.push({
        type: 'update_shape',
        shapeId: productId,
        payload: {
          x: Math.max(0, newX), // Keep within bounds
          y: Math.max(0, newY),
        },
        reason: `Pushing product away from ${wallCollisions.length} wall(s)`,
      });

      this.log(`Planning to push product ${productId} by (${pushX.toFixed(1)}, ${pushY.toFixed(1)})`);
    }

    return actions;
  }

  /**
   * Execute collision avoidance actions
   */
  act(actions: AgentAction[], context: AgentContext): AgentResult {
    if (actions.length === 0) {
      return this.createSuccessResult(0, { message: 'No collisions to resolve' });
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
        this.log(`Resolved ${applied} collisions`);
      }

      return this.createSuccessResult(applied, {
        timestamp: context.timestamp,
        actionsProcessed: actions.length,
        message: `Resolved ${applied} product-wall collisions`,
      });

    } catch (error) {
      this.logError('Failed to resolve collisions', error);
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return this.createErrorResult(errors, applied);
    }
  }

  /**
   * Calculate the overlap area between two shapes
   */
  private calculateOverlapArea(a: Shape, b: Shape): number {
    const left = Math.max(a.x, b.x);
    const right = Math.min(a.x + a.width, b.x + b.width);
    const top = Math.max(a.y, b.y);
    const bottom = Math.min(a.y + a.height, b.y + b.height);

    if (left < right && top < bottom) {
      return (right - left) * (bottom - top);
    }
    return 0;
  }

  /**
   * Calculate direction to push product away from wall
   */
  private calculatePushDirection(product: Shape, wall: Shape): { x: number; y: number } {
    // Calculate centers
    const productCenterX = product.x + product.width / 2;
    const productCenterY = product.y + product.height / 2;
    const wallCenterX = wall.x + wall.width / 2;
    const wallCenterY = wall.y + wall.height / 2;

    // Vector from wall center to product center
    const dx = productCenterX - wallCenterX;
    const dy = productCenterY - wallCenterY;

    // Normalize
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude === 0) {
      // If centers are exactly overlapping, push in random direction
      return { x: Math.random() - 0.5, y: Math.random() - 0.5 };
    }

    return {
      x: dx / magnitude,
      y: dy / magnitude,
    };
  }
}