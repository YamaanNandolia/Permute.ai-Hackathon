# Heatmap Feature Testing Guide

## Overview

The heatmap visualization system provides a visual representation of how frequently different areas of the grid are visited during pathfinding operations. It uses a **white → light blue → dark blue** gradient where:
- **White**: Unvisited or rarely visited areas
- **Light Blue**: Moderately visited areas (e.g., nodes in vision cone)
- **Dark Blue**: Heavily visited areas (e.g., nodes on the final path)

This feature is particularly useful for:
- Analyzing pathfinding efficiency
- Visualizing coverage patterns
- Understanding vision cone behavior
- Identifying frequently traversed routes

---

## How It Works

### Visit Tracking
The heatmap tracks two types of visits:

1. **Vision Cone Visits** (`visionVisitCount`)
   - Incremented when a node is within the vision cone during pathfinding
   - Weighted by `visionConeWeight` (default: 1.0)

2. **Path Visits** (`pathVisitCount`)
   - Incremented when a node is part of the algorithm's exploration
   - Gets a bonus (+3) when on the final shortest path
   - Weighted by `directPathWeight` (default: 2.0)

### Intensity Calculation
```
totalVisitCount = (visionVisitCount × visionConeWeight) + (pathVisitCount × directPathWeight)
heatmapIntensity = min(1.0, totalVisitCount / maxThreshold)
```
- `maxThreshold`: Default is 15 visits
- `heatmapIntensity`: Normalized value from 0.0 to 1.0

### Color Gradient
The system uses 6 gradient stops:
- `0.00` → White (255, 255, 255)
- `0.20` → Very light blue (230, 242, 255)
- `0.47` → Light blue (153, 204, 255)
- `0.73` → Medium blue (51, 153, 255)
- `0.87` → Dark blue (0, 102, 204)
- `1.00` → Darkest blue (0, 61, 122)

---

## Quick Start

### Enabling the Heatmap

**Method 1: Browser Console (Recommended for Testing)**
1. Open the application in your browser
2. Open Browser DevTools (F12 or Right-click → Inspect)
3. Go to the Console tab
4. Run:
```javascript
board.initializeHeatmap()
```

**Method 2: Manual Configuration**
```javascript
// Enable heatmap
board.heatmapConfig.enabled = true;

// Optional: Adjust configuration
board.heatmapConfig.maxThreshold = 20;       // Increase threshold
board.heatmapConfig.visionConeWeight = 1.5;  // Increase vision cone impact
board.heatmapConfig.directPathWeight = 3.0;  // Increase path weight impact
```

### Disabling the Heatmap
```javascript
board.heatmapConfig.enabled = false;
board.clearHeatmapVisualization();
```

---

## Browser Console Commands

### Essential Commands

```javascript
// Initialize heatmap (creates vision cone and enables tracking)
board.initializeHeatmap();

// Check current configuration
board.heatmapConfig;

// Manually render heatmap visualization
board.renderHeatmap();

// Clear heatmap visualization (keeps data)
board.clearHeatmapVisualization();

// Disable heatmap tracking
board.heatmapConfig.enabled = false;

// Inspect specific node's heatmap data
board.nodes["10-15"].visionVisitCount;
board.nodes["10-15"].pathVisitCount;
board.nodes["10-15"].totalVisitCount;
board.nodes["10-15"].heatmapIntensity;

// View vision cone configuration
board.visionCone;
```

### Advanced Commands

```javascript
// Adjust heatmap sensitivity
board.heatmapConfig.maxThreshold = 10;  // Lower = more sensitive (darker faster)
board.heatmapConfig.maxThreshold = 30;  // Higher = less sensitive

// Adjust visit type weights
board.heatmapConfig.visionConeWeight = 0.5;  // Reduce vision cone impact
board.heatmapConfig.directPathWeight = 5.0;  // Emphasize direct path

// Reconfigure vision cone
const { VisionCone, Vec2 } = require("./visionCone");
board.visionCone = new VisionCone(120, 15, new Vec2(1, 0)); // 120°, 15 units range

// Export heatmap data for analysis
const heatmapData = Object.keys(board.nodes).map(id => {
  const node = board.nodes[id];
  return {
    id: id,
    visionVisits: node.visionVisitCount,
    pathVisits: node.pathVisitCount,
    totalVisits: node.totalVisitCount,
    intensity: node.heatmapIntensity
  };
}).filter(n => n.totalVisits > 0);
console.table(heatmapData);
```

---

## Testing Scenarios

### Scenario 1: Simple Straight Path

**Purpose**: Verify basic heatmap functionality with a simple path.

**Steps**:
1. Clear the board: Click "Clear Board" or run `board.clearBoard()`
2. Enable heatmap: `board.initializeHeatmap()`
3. Run pathfinding: Click "Visualize!"
4. Wait for animation to complete
5. Render heatmap: `board.renderHeatmap()`

**Expected Results**:
- Nodes on the direct path should be **darkest blue**
- Nodes immediately adjacent to the path should be **medium blue** (from vision cone)
- Nodes further away should be **light blue** or **white**
- The gradient should transition smoothly from dark to light

**Verification**:
```javascript
// Check a path node (e.g., middle of path)
const midNode = board.nodes["12-30"];
console.log("Path node intensity:", midNode.heatmapIntensity); // Should be close to 1.0

// Check an adjacent node
const adjacentNode = board.nodes["13-30"];
console.log("Adjacent node intensity:", adjacentNode.heatmapIntensity); // Should be 0.2-0.6

// Check a far node
const farNode = board.nodes["5-5"];
console.log("Far node intensity:", farNode.heatmapIntensity); // Should be near 0 or undefined
```

---

### Scenario 2: Path with Multiple Turns

**Purpose**: Test heatmap with a more complex path requiring turns.

**Steps**:
1. Clear the board
2. Add walls to force path to turn:
   - Draw vertical walls to create obstacles
   - Leave gaps for the path to navigate through
3. Enable heatmap: `board.initializeHeatmap()`
4. Run pathfinding: Click "Visualize!"
5. Render heatmap: `board.renderHeatmap()`

**Expected Results**:
- Path nodes show **darkest blue**
- Corner/turning nodes may show **higher intensity** (explored multiple directions)
- Vision cone creates **blue halos** around the path
- Areas between path segments show varying intensities

**Verification**:
```javascript
// Identify turning points in the path
// These should have high intensity due to multiple visits
board.shortestPathNodesToAnimate.forEach(node => {
  console.log(`${node.id}: intensity ${node.heatmapIntensity}`);
});
```

---

### Scenario 3: Path Through Dummy Products

**Purpose**: Verify heatmap doesn't interfere with product visualization.

**Steps**:
1. Clear the board
2. Enable Product mode: Click "Products: Off" to turn it on
3. Enable Dummy mode: Click "Dummy Mode: Off" to turn it on
4. Place several dummy products (red nodes) on the grid
5. Enable heatmap: `board.initializeHeatmap()`
6. Run pathfinding: Click "Visualize!"
7. Render heatmap: `board.renderHeatmap()`

**Expected Results**:
- Heatmap colors should **NOT** appear on:
  - Start node (green triangle)
  - Target node (red target)
  - Dummy product nodes (red squares)
  - Wall nodes
- Heatmap colors **SHOULD** appear on:
  - Regular unvisited nodes that were visited
  - Nodes around products (if in vision cone)

**Verification**:
```javascript
// Check that special nodes don't have heatmap styling
const startEl = document.getElementById(board.start);
console.log("Start bg color:", startEl.style.backgroundColor); // Should be empty

const dummyProduct = board.dummyProducts[0];
const dummyEl = document.getElementById(dummyProduct);
console.log("Dummy bg color:", dummyEl.style.backgroundColor); // Should be empty
```

---

### Scenario 4: Shopping List Pathfinding

**Purpose**: Test heatmap with multi-target pathfinding (shopping route).

**Steps**:
1. Clear the board
2. Enable Product mode: Click "Products: Off"
3. Place 3-5 products (yellow nodes) on the grid
4. Enable heatmap: `board.initializeHeatmap()`
5. Run shopping path: Click "Run Shopping Path"
6. Wait for all legs to complete
7. Render heatmap: `board.renderHeatmap()`

**Expected Results**:
- **Multiple path segments** all show in dark blue
- **Overlapping segments** (if any) show **darkest blue** (highest intensity)
- Each product pickup point shows high intensity
- Vision cone creates blue gradients along the entire route
- Start and end points remain their original colors

**Verification**:
```javascript
// Check if multi-leg path accumulated properly
const pathData = board.lastComputedPath;
console.log("Shopping route:", pathData);

// Find nodes that are on multiple path legs
const nodeVisitMap = {};
pathData.legs.forEach(leg => {
  leg.pathNodes.forEach(nodeId => {
    nodeVisitMap[nodeId] = (nodeVisitMap[nodeId] || 0) + 1;
  });
});

// Show nodes visited in multiple legs
Object.entries(nodeVisitMap)
  .filter(([id, count]) => count > 1)
  .forEach(([id, count]) => {
    const node = board.nodes[id];
    console.log(`${id}: visited ${count} times, intensity ${node.heatmapIntensity}`);
  });
```

---

### Scenario 5: Gradient Transition Test

**Purpose**: Verify smooth color gradient transitions.

**Steps**:
1. Clear the board
2. Create a long straight path (move target far right)
3. Enable heatmap: `board.initializeHeatmap()`
4. Run pathfinding
5. Render heatmap: `board.renderHeatmap()`
6. Visually inspect the gradient

**Expected Results**:
- **No sudden color jumps** - transitions should be smooth
- Path nodes (center) should be darkest
- Nodes 1 unit away should be lighter
- Nodes 2-3 units away should be even lighter
- Gradient should fade to white at edges

**Verification**:
```javascript
// Sample nodes at various distances from path
const pathNode = board.nodes["12-30"];
const dist1 = board.nodes["13-30"];
const dist2 = board.nodes["14-30"];
const dist3 = board.nodes["15-30"];

console.log("Path node:", pathNode.heatmapIntensity);
console.log("1 unit away:", dist1.heatmapIntensity);
console.log("2 units away:", dist2.heatmapIntensity);
console.log("3 units away:", dist3.heatmapIntensity);
// Intensities should decrease progressively
```

---

## Interpreting Heatmap Colors

### Color Meanings

| Color | Intensity Range | Typical Meaning |
|-------|----------------|-----------------|
| White | 0.0 - 0.20 | Unvisited or barely in vision range |
| Very Light Blue | 0.20 - 0.47 | Periphery of vision cone, rarely visited |
| Light Blue | 0.47 - 0.73 | Edge of explored areas or secondary paths |
| Medium Blue | 0.73 - 0.87 | Frequently visited or close to path |
| Dark Blue | 0.87 - 1.00 | Core path nodes or highly explored |

### Common Patterns

**Centerline Path**:
- Darkest blue line = final shortest path
- Medium blue halo = vision cone during pathfinding
- Light blue fade = periphery of exploration

**Branching Exploration**:
- Multiple blue branches indicate algorithm explored different directions
- Darker branches = more thoroughly explored
- Fainter branches = briefly considered then abandoned

**Dense Blue Clusters**:
- Areas where algorithm spent more time
- May indicate complex navigation (turns, obstacles)
- Could show inefficient exploration if far from final path

---

## Troubleshooting

### Problem: Heatmap Not Showing

**Possible Causes**:
1. Heatmap not enabled
   - **Fix**: Run `board.initializeHeatmap()`

2. Heatmap enabled but not rendered
   - **Fix**: Run `board.renderHeatmap()`

3. Pathfinding not run yet
   - **Fix**: Click "Visualize!" to run pathfinding first

4. All nodes have zero visits
   - **Fix**: Enable heatmap BEFORE running pathfinding

**Verification**:
```javascript
console.log("Enabled?", board.heatmapConfig.enabled);
console.log("Vision cone?", board.visionCone !== null);

// Check if any node has visits
const anyVisits = Object.values(board.nodes).some(n => n.totalVisitCount > 0);
console.log("Any visits recorded?", anyVisits);
```

---

### Problem: All Nodes Same Color

**Possible Causes**:
1. Threshold too high
   - **Fix**: Lower `board.heatmapConfig.maxThreshold` to 5-10

2. All nodes have similar visit counts
   - **Fix**: This may be normal for very simple paths

**Verification**:
```javascript
// Check visit count distribution
const visits = Object.values(board.nodes)
  .filter(n => n.totalVisitCount > 0)
  .map(n => n.totalVisitCount);

console.log("Min visits:", Math.min(...visits));
console.log("Max visits:", Math.max(...visits));
console.log("Threshold:", board.heatmapConfig.maxThreshold);
```

---

### Problem: Colors Look Wrong

**Possible Causes**:
1. Heatmap rendered before pathfinding complete
   - **Fix**: Wait for "Algorithm complete" message, then render

2. Visualization cleared
   - **Fix**: Re-render with `board.renderHeatmap()`

3. Nodes have other styling (visited, path, etc.)
   - **Fix**: Heatmap intentionally skips special nodes (start, target, walls, products)

**Verification**:
```javascript
// Check if element has heatmap class
const element = document.getElementById("12-30");
console.log("Has heatmap class?", element.classList.contains('heatmap-node'));
console.log("Background color:", element.style.backgroundColor);
```

---

### Problem: Heatmap Persists After Clear

**Possible Cause**:
- Visualization not cleared properly

**Fix**:
```javascript
// Fully clear heatmap
board.clearHeatmapVisualization();

// Reset visit counts
Object.values(board.nodes).forEach(node => {
  node.visionVisitCount = 0;
  node.pathVisitCount = 0;
  node.totalVisitCount = 0;
  node.heatmapIntensity = 0;
});
```

---

## Advanced Usage

### Custom Heatmap Configuration

```javascript
// High sensitivity heatmap (darker faster)
board.heatmapConfig.maxThreshold = 8;
board.heatmapConfig.visionConeWeight = 1.5;
board.heatmapConfig.directPathWeight = 3.0;

// Low sensitivity heatmap (only darkest on path)
board.heatmapConfig.maxThreshold = 25;
board.heatmapConfig.visionConeWeight = 0.3;
board.heatmapConfig.directPathWeight = 5.0;

// Vision cone only heatmap (ignore path visits)
board.heatmapConfig.visionConeWeight = 2.0;
board.heatmapConfig.directPathWeight = 0.0;

// Path only heatmap (ignore vision cone)
board.heatmapConfig.visionConeWeight = 0.0;
board.heatmapConfig.directPathWeight = 3.0;
```

### Exporting Heatmap Data

```javascript
// Export to CSV-like format
function exportHeatmapCSV() {
  const data = Object.keys(board.nodes)
    .filter(id => board.nodes[id].totalVisitCount > 0)
    .map(id => {
      const node = board.nodes[id];
      const [r, c] = id.split('-');
      return `${r},${c},${node.visionVisitCount},${node.pathVisitCount},${node.totalVisitCount},${node.heatmapIntensity}`;
    });
  
  const csv = "row,col,visionVisits,pathVisits,totalVisits,intensity\n" + data.join('\n');
  console.log(csv);
  return csv;
}

// Run after pathfinding
const csvData = exportHeatmapCSV();
```

### Analyzing Heatmap Statistics

```javascript
function analyzeHeatmap() {
  const nodes = Object.values(board.nodes)
    .filter(n => n.totalVisitCount > 0);
  
  const stats = {
    totalNodes: nodes.length,
    avgVisits: nodes.reduce((sum, n) => sum + n.totalVisitCount, 0) / nodes.length,
    maxVisits: Math.max(...nodes.map(n => n.totalVisitCount)),
    avgIntensity: nodes.reduce((sum, n) => sum + n.heatmapIntensity, 0) / nodes.length,
    pathNodes: board.shortestPathNodesToAnimate.length,
    pathCoverage: (board.shortestPathNodesToAnimate.length / nodes.length * 100).toFixed(2) + '%'
  };
  
  console.table(stats);
  return stats;
}

// Run after pathfinding and heatmap rendering
analyzeHeatmap();
```

---

## Integration with Other Features

### With Shopping Path
The heatmap works with multi-target shopping paths. Each leg accumulates visits:
```javascript
board.initializeHeatmap();
// Add products
// Click "Run Shopping Path"
// After completion:
board.renderHeatmap();
// Nodes used in multiple legs will be darkest
```

### With Different Algorithms
Heatmap works with all pathfinding algorithms. Different algorithms may show different patterns:
- **A***: Efficient, focused exploration
- **Dijkstra**: Broader exploration pattern
- **BFS**: Uniform exploration from start

### With Weighted Nodes
Weighted nodes (shown with darker circles) can be visited and will show heatmap colors:
```javascript
board.initializeHeatmap();
// Create weighted maze
document.getElementById("startButtonCreateMazeOne").click();
// Run pathfinding
// Render heatmap
```

---

## Performance Notes

- Heatmap tracking adds minimal overhead during pathfinding
- Rendering the heatmap is fast (typically <50ms for full grid)
- Large grids (>100x100) may show slight rendering delay
- Vision cone ray casting is optimized with Bresenham's algorithm

---

## Summary Checklist

Before testing, ensure:
- [ ] Board is loaded and interactive
- [ ] `board.initializeHeatmap()` has been called
- [ ] Pathfinding has been run
- [ ] `board.renderHeatmap()` has been called

For each test scenario:
- [ ] Clear the board between tests
- [ ] Re-initialize heatmap after clearing
- [ ] Run pathfinding algorithm
- [ ] Render and verify results
- [ ] Check console for any errors

Expected outcomes:
- [ ] Smooth color gradients (no sharp transitions)
- [ ] Darkest colors on final path
- [ ] Medium colors from vision cone
- [ ] Light/white colors on unvisited areas
- [ ] Special nodes (start, target, products, walls) maintain their styling

---

## Additional Resources

- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical implementation details
- [README.md](README.md) - General application usage
- Browser Console - Use F12 to access developer tools and console

For questions or issues, check the browser console for errors and verify the configuration with `board.heatmapConfig`.