/**
 * AutoArrangerAgent - Demonstrates complex planning
 * Arranges all products on canvas in an organized grid layout
 * This agent is designed to be manually triggered, not auto-run
 */

import { BaseAgent } from './BaseAgent';
import type { AgentObservation, AgentAction, AgentContext, AgentResult } from '../types/agent';
import type { Shape } from '../types';
import { ShapeType } from '../types';
import { useCanvasStore } from '../state/useCanvasStore';

export class AutoArrangerAgent extends BaseAgent {
  id = 'auto-arranger';
  name = 'Auto Arranger';
  description = 'Arranges products in organized rows and columns';
  priority = 3; // Lower priority - only runs when manually triggered

  // Configuration for arrangement
  private readonly MARGIN = 40; // Space between items
  private readonly START_X = 100; // Starting X position
  private readonly START_Y = 100; // Starting Y position
  private readonly ITEMS_PER_ROW = 4; // Number of items per row

  /**
   * Observe all products and their current positions
   */
  observe(state: any): AgentObservation {
    const shapes = state.shapes as Shape[];
    const { gridSize } = state.canvas;
    
    // Get all products
    const products = shapes.filter(s => s.type === ShapeType.PRODUCT);
    
    // Calculate bounding box of all products
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (const product of products) {
      minX = Math.min(minX, product.x);
      minY = Math.min(minY, product.y);
      maxX = Math.max(maxX, product.x + product.width);
      maxY = Math.max(maxY, product.y + product.height);
    }

    const boundingBox = products.length > 0 ? {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    } : null;

    // Calculate if arrangement is needed (products are scattered)
    const needsArrangement = this.isScattered(products);

    this.log(`Observed ${products.length} products, needs arrangement: ${needsArrangement}`);

    return this.createObservation({
      products,
      gridSize,
      boundingBox,
      needsArrangement,
      hasIssues: needsArrangement,
    });
  }

  /**
   * Plan optimal arrangement in rows and columns
   */
  plan(observation: AgentObservation): AgentAction[] {
    const { products, gridSize } = observation.data;
    const actions: AgentAction[] = [];

    if (!products || products.length === 0) {
      this.log('No products to arrange');
      return actions;
    }

    // Sort products by their current position (top-to-bottom, left-to-right)
    // This maintains relative ordering when arranging
    const sortedProducts = [...products].sort((a: Shape, b: Shape) => {
      const rowA = Math.floor(a.y / 200);
      const rowB = Math.floor(b.y / 200);
      if (rowA !== rowB) return rowA - rowB;
      return a.x - b.x;
    });

    // Calculate maximum width for consistent spacing
    const maxWidth = Math.max(...sortedProducts.map((p: Shape) => p.width));
    const maxHeight = Math.max(...sortedProducts.map((p: Shape) => p.height));

    // Arrange in grid
    let currentX = this.START_X;
    let currentY = this.START_Y;
    let itemsInRow = 0;

    for (const product of sortedProducts) {
      // Calculate position (centered in cell)
      const cellX = currentX + (maxWidth - product.width) / 2;
      const cellY = currentY + (maxHeight - product.height) / 2;

      // Snap to grid if enabled
      const finalX = gridSize > 0 ? this.snapToGrid(cellX, gridSize) : cellX;
      const finalY = gridSize > 0 ? this.snapToGrid(cellY, gridSize) : cellY;

      // Only create action if position changed significantly
      if (Math.abs(product.x - finalX) > 5 || Math.abs(product.y - finalY) > 5) {
        actions.push({
          type: 'update_shape',
          shapeId: product.id,
          payload: {
            x: finalX,
            y: finalY,
          },
          reason: `Arranging in grid position (row ${Math.floor(itemsInRow / this.ITEMS_PER_ROW)}, col ${itemsInRow % this.ITEMS_PER_ROW})`,
        });
      }

      // Move to next position
      itemsInRow++;
      if (itemsInRow >= this.ITEMS_PER_ROW) {
        // New row
        currentX = this.START_X;
        currentY += maxHeight + this.MARGIN;
        itemsInRow = 0;
      } else {
        // Next column
        currentX += maxWidth + this.MARGIN;
      }
    }

    this.log(`Planning to arrange ${actions.length} products in ${Math.ceil(sortedProducts.length / this.ITEMS_PER_ROW)} rows`);

    return actions;
  }

  /**
   * Execute arrangement actions
   */
  act(actions: AgentAction[], context: AgentContext): AgentResult {
    if (actions.length === 0) {
      return this.createSuccessResult(0, { message: 'Products already well-arranged' });
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
        this.log(`Arranged ${applied} products in grid layout`);
      }

      return this.createSuccessResult(applied, {
        timestamp: context.timestamp,
        actionsProcessed: actions.length,
        message: `Arranged ${applied} products in organized grid`,
        itemsPerRow: this.ITEMS_PER_ROW,
        rows: Math.ceil(applied / this.ITEMS_PER_ROW),
      });

    } catch (error) {
      this.logError('Failed to arrange products', error);
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return this.createErrorResult(errors, applied);
    }
  }

  /**
   * Check if products are scattered (not in organized arrangement)
   */
  private isScattered(products: Shape[]): boolean {
    if (products.length < 2) return false;

    // Calculate average distance between consecutive products
    let totalDistance = 0;
    let comparisons = 0;

    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < Math.min(i + 4, products.length); j++) {
        totalDistance += this.shapeDistance(products[i], products[j]);
        comparisons++;
      }
    }

    const avgDistance = comparisons > 0 ? totalDistance / comparisons : 0;
    
    // If average distance is too large or too varied, products are scattered
    const SCATTERED_THRESHOLD = 200;
    return avgDistance > SCATTERED_THRESHOLD;
  }
}