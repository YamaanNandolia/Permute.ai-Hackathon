// Vec2 class for 2D vectors
class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // Add two vectors
  add(other) {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  // Subtract two vectors
  sub(other) {
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  // Multiply by scalar
  mul(scalar) {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  // Dot product
  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  // Magnitude
  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // Normalize
  normalize() {
    const m = this.mag();
    if (m === 0) return new Vec2(0, 0);
    return new Vec2(this.x / m, this.y / m);
  }

  // Rotate by angle in radians
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  // Convert to string for debugging
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

// Bresenham's line algorithm to get grid points from start to end
function bresenhamLine(startX, startY, endX, endY) {
  const points = [];
  let x = startX;
  let y = startY;
  const dx = Math.abs(endX - startX);
  const dy = Math.abs(endY - startY);
  const sx = startX < endX ? 1 : -1;
  const sy = startY < endY ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push({ x, y });
    if (x === endX && y === endY) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  return points;
}

// VisionCone class
class VisionCone {
  constructor(angle, range, direction) {
    this.angle = angle; // in degrees
    this.range = range; // in grid units
    this.direction = direction; // Vec2, normalized
    this.visibilityHeatmap = {}; // key: "r-c", value: count
  }

  // Cast rays and accumulate visibility
  // board: the Board instance
  // agentPos: string like "5-10"
  castRays(board, agentPos) {
    const [agentR, agentC] = agentPos.split('-').map(Number);
    const halfAngle = this.angle / 2;
    const angleStep = 1; // degrees per ray, adjust for resolution

    const visibleProducts = new Set();

    // Cast rays from -halfAngle to +halfAngle
    for (let offset = -halfAngle; offset <= halfAngle; offset += angleStep) {
      const rayAngle = Math.atan2(this.direction.y, this.direction.x) + (offset * Math.PI / 180);
      const rayDir = new Vec2(Math.cos(rayAngle), Math.sin(rayAngle));

      // Endpoint at range
      const endX = agentC + rayDir.x * this.range;
      const endY = agentR + rayDir.y * this.range;

      // Get Bresenham points
      const points = bresenhamLine(agentC, agentR, Math.round(endX), Math.round(endY));

      let hitWall = false;
      for (const point of points) {
        const nodeId = `${point.y}-${point.x}`;
        const node = board.nodes[nodeId];
        if (!node) continue; // out of bounds

        // Accumulate heatmap
        if (!this.visibilityHeatmap[nodeId]) {
          this.visibilityHeatmap[nodeId] = 0;
        }
        this.visibilityHeatmap[nodeId]++;

        // Update node visit counts if heatmap is enabled
        if (board.heatmapConfig && board.heatmapConfig.enabled) {
          if (node.status !== 'wall') {
            // Increment vision visit count
            node.visionVisitCount++;
            
            // Calculate total visit count using weights
            node.totalVisitCount = (node.visionVisitCount * board.heatmapConfig.visionConeWeight) +
                                   (node.pathVisitCount * board.heatmapConfig.directPathWeight);
            
            // Calculate heatmap intensity (0 to 1)
            node.heatmapIntensity = Math.min(1, node.totalVisitCount / board.heatmapConfig.maxThreshold);
          }
        }

        if (node.status === 'wall') {
          hitWall = true;
          break; // stop at wall
        }

        // Track products
        if (node.status === 'product' || node.status === 'dummy-product') {
          visibleProducts.add(nodeId);
        }
      }

      // If hit wall, only accumulate up to wall, but since we break, it's fine
    }

    return Array.from(visibleProducts);
  }

  // Get heatmap as 2D array (for visualization if needed)
  getHeatmapArray(height, width) {
    const heatmap = Array.from({ length: height }, () => Array(width).fill(0));
    for (const [id, count] of Object.entries(this.visibilityHeatmap)) {
      const [r, c] = id.split('-').map(Number);
      if (r >= 0 && r < height && c >= 0 && c < width) {
        heatmap[r][c] = count;
      }
    }
    return heatmap;
  }
}

module.exports = { Vec2, VisionCone };