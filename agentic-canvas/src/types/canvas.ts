/**
 * Canvas configuration and viewport types
 */

/** Canvas configuration */
export interface CanvasConfig {
  width: number;                 // Stage width
  height: number;                // Stage height
  zoom: number;                  // Zoom level (0.1 - 5)
  panX: number;                  // Pan offset X
  panY: number;                  // Pan offset Y
  gridSize: number;              // Grid cell size (0 = no grid)
  snapToGrid: boolean;           // Snap shapes to grid
}

/** Viewport state for canvas transforms */
export interface ViewportState {
  scale: number;                 // Current zoom scale
  offsetX: number;               // X offset for panning
  offsetY: number;               // Y offset for panning
}