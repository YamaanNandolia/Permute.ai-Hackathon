# Randomized Shopper Algorithm

## Overview

The Randomized Shopper algorithm simulates suboptimal shopping behavior to contrast with the optimal A* pathfinding. This is useful for product placement analysis, as it shows how a typical, non-optimal shopper might navigate through a store.

## Key Features

### 1. **Two-Phase Behavior**
The randomized shopper operates in two distinct phases:

- **Exploration Phase (20-50 steps)**: The shopper wanders randomly, exploring the store before heading toward products
  - 70% chance of selecting a random node
  - 30% chance of selecting from the top 30% of optimal nodes
  
- **Target-Seeking Phase**: After exploration, the shopper becomes more focused but still suboptimal
  - 40% chance of selecting a random node
  - 60% chance of selecting from the top 50% of optimal nodes

### 2. **Randomized Heuristics**
The algorithm adds randomness to distance calculations:
- **During exploration**: Heuristic multiplied by 0.5x to 2.0x
- **During target-seeking**: Heuristic multiplied by 0.8x to 1.3x
- Movement costs randomized by 0.9x to 1.2x

### 3. **Shuffled Neighbor Exploration**
Unlike A* which explores neighbors in a fixed order, the randomized shopper shuffles the direction order, leading to more varied paths.

## Usage

### In the UI:
1. Click "Products: Off" to enable product placement mode
2. Click on the grid to place product nodes (yellow)
3. Click "Shopper: Optimal" to toggle to "Shopper: Randomized"
4. Click "Visualize Shopping Path" to see the randomized shopper in action

### Comparison:
- **Optimal (A*) Shopper**: Takes the most efficient path, minimal wandering
- **Randomized Shopper**: Explores more areas, takes longer paths, simulates realistic shopping behavior

## Implementation Details

### File: `randomizedShopper.js`
The algorithm is a modified version of A* with the following key differences:

1. **`closestNodeRandomized()`**: Instead of always picking the best node, it probabilistically chooses between random and optimal nodes
2. **`updateNodeRandomized()`**: Adds randomness to heuristic calculations
3. **`getNeighborsRandomized()`**: Shuffles neighbor order for variety
4. **`getDistanceRandomized()`**: Adds small random factors to movement costs

### Integration Points:
- [`weightedSearchAlgorithm.js`](public/browser/pathfindingAlgorithms/weightedSearchAlgorithm.js:2) - Import and routing
- [`board.js`](public/browser/board.js:60) - Toggle state and UI integration  
- [`index.html`](index.html:32) - UI button for mode switching

## Use Cases

1. **Heat Map Analysis**: Compare foot traffic patterns between optimal and suboptimal shoppers
2. **Product Placement**: Understand which areas get more exposure with realistic shopping behavior
3. **Store Layout Optimization**: Design layouts that account for exploration behavior
4. **Customer Journey Analysis**: Model realistic customer paths for better insights

## Parameters

You can adjust randomization levels by modifying these values in `randomizedShopper.js`:

```javascript
// Exploration phase duration (lines 21-22)
const explorationSteps = Math.floor(Math.random() * 30) + 20; // 20-50 steps

// Exploration phase randomness (lines 45-49)
if (Math.random() < 0.7) { // 70% random, 30% optimal
  
// Target-seeking phase randomness (lines 54-58)
if (Math.random() < 0.4) { // 40% random, 60% optimal

// Heuristic modifiers (lines 98-105)
heuristicModifier = 0.5 + Math.random() * 1.5; // Exploration: 0.5x-2.0x
heuristicModifier = 0.8 + Math.random() * 0.5;  // Target: 0.8x-1.3x

// Distance randomness (line 144)
const randomFactor = 0.9 + Math.random() * 0.3; // 0.9x-1.2x
```

## Behavior Characteristics

The randomized shopper will:
- ✓ Visit all product nodes (same as optimal)
- ✓ Reach the destination node (same as optimal)
- ✓ Respect walls and boundaries (same as optimal)
- ✗ Take a longer, less efficient path
- ✗ Explore areas not on the direct route
- ✗ Vary path significantly between runs

## Future Enhancements

Potential improvements:
- [ ] Add "browsing zones" where shoppers linger longer
- [ ] Implement "attraction points" for promotional displays
- [ ] Add shopping cart momentum (shoppers keep moving in same direction)
- [ ] Model shopping fatigue (slower, more direct later in journey)
- [ ] Add social influence (shoppers cluster in busy areas)