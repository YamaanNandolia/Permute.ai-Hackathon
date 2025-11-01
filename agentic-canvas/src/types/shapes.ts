/**
 * Shape type definitions for the floor plan designer
 */

/** Core shape types */
export const ShapeType = {
  RECTANGLE: 'rectangle',
  WALL: 'wall',
  PRODUCT: 'product',
  ZONE: 'zone',
} as const;

export type ShapeType = typeof ShapeType[keyof typeof ShapeType];

/** Base shape interface - all shapes extend this */
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

/** Rectangle shape (generic) */
export interface Rectangle extends BaseShape {
  type: 'rectangle';
}

/** Wall shape (obstacle) */
export interface Wall extends BaseShape {
  type: 'wall';
  metadata: {
    isLoadBearing: boolean;      // Cannot be moved by agents
  };
}

/** Product-specific shape */
export interface Product extends BaseShape {
  type: 'product';
  metadata: {
    productId: string;           // Product identifier
    name: string;                // Product name
    category: string;            // Product category
    visibility: number;          // Visibility score (0-100)
  };
}

/** Zone shape */
export interface Zone extends BaseShape {
  type: 'zone';
  metadata: {
    zoneType: 'entrance' | 'checkout' | 'display' | 'storage';
    capacity: number;            // Max items in zone
  };
}

/** Union type for all shapes */
export type Shape = Rectangle | Wall | Product | Zone;