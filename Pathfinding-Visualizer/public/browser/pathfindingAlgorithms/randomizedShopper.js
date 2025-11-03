/**
 * Randomized Shopper Algorithm
 * Simulates a suboptimal shopper who wanders around before reaching targets.
 * Still visits all products and the destination, but takes a less efficient path.
 */

function randomizedShopper(nodes, start, target, nodesToAnimate, boardArray, name, heuristic, board) {
  if (!start || !target || start === target) {
    return false;
  }
  
  nodes[start].distance = 0;
  nodes[start].totalDistance = 0;
  nodes[start].direction = "up";
  
  let unvisitedNodes = Object.keys(nodes);
  let explorationPhase = true;
  let explorationCounter = 0;
  const explorationSteps = Math.floor(Math.random() * 30) + 20; // Random exploration: 20-50 steps
  
  while (unvisitedNodes.length) {
    let currentNode = closestNodeRandomized(nodes, unvisitedNodes, explorationPhase, target);
    
    while (currentNode.status === "wall" && unvisitedNodes.length) {
      currentNode = closestNodeRandomized(nodes, unvisitedNodes, explorationPhase, target);
    }
    
    if (currentNode.distance === Infinity) return false;
    
    nodesToAnimate.push(currentNode);
    currentNode.status = "visited";
    
    // Count exploration steps
    if (explorationPhase) {
      explorationCounter++;
      if (explorationCounter >= explorationSteps) {
        explorationPhase = false; // Switch to target-seeking
      }
    }
    
    if (currentNode.id === target) {
      return "success!";
    }
    
    updateNeighborsRandomized(nodes, currentNode, boardArray, target, name, start, heuristic, explorationPhase);
  }
}

/**
 * Modified closest node selection with randomization
 * During exploration phase: heavily randomized selection
 * During target-seeking phase: still somewhat randomized but biased toward target
 */
function closestNodeRandomized(nodes, unvisitedNodes, explorationPhase, target) {
  let candidates = [];
  
  // Collect all candidates with their scores
  for (let i = 0; i < unvisitedNodes.length; i++) {
    const node = nodes[unvisitedNodes[i]];
    if (node.totalDistance !== Infinity) {
      candidates.push({ node, index: i, distance: node.totalDistance });
    }
  }
  
  if (candidates.length === 0) {
    // Fallback to first available
    const idx = 0;
    const node = nodes[unvisitedNodes[idx]];
    unvisitedNodes.splice(idx, 1);
    return node;
  }
  
  let selectedCandidate;
  
  if (explorationPhase) {
    // Heavy randomization during exploration
    // 60% chance of picking a random node, 30% chance of picking a good one
    if (Math.random() < 0.6) {
      selectedCandidate = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      // Pick from top 30% of candidates
      candidates.sort((a, b) => a.distance - b.distance);
      const topN = Math.max(1, Math.floor(candidates.length * 0.4));
      selectedCandidate = candidates[Math.floor(Math.random() * topN)];
    }
  } else {
    // Less randomization when seeking target
    // 40% chance of random, 60% chance of good path
    if (Math.random() < 0.4) {
      selectedCandidate = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      // Pick from top 50% of candidates
      candidates.sort((a, b) => a.distance - b.distance);
      const topN = Math.max(1, Math.floor(candidates.length * 0.5));
      selectedCandidate = candidates[Math.floor(Math.random() * topN)];
    }
  }
  
  unvisitedNodes.splice(selectedCandidate.index, 1);
  return selectedCandidate.node;
}

function updateNeighborsRandomized(nodes, node, boardArray, target, name, start, heuristic, explorationPhase) {
  let neighbors = getNeighborsRandomized(node.id, nodes, boardArray);
  
  for (let neighbor of neighbors) {
    if (target) {
      updateNodeRandomized(node, nodes[neighbor], nodes[target], name, nodes, nodes[start], heuristic, boardArray, explorationPhase);
    } else {
      updateNodeRandomized(node, nodes[neighbor]);
    }
  }
}

function updateNodeRandomized(currentNode, targetNode, actualTargetNode, name, nodes, actualStartNode, heuristic, boardArray, explorationPhase) {
  let distance = getDistanceRandomized(currentNode, targetNode);
  
  if (!targetNode.heuristicDistance) {
    targetNode.heuristicDistance = manhattanDistanceRandomized(targetNode, actualTargetNode);
  }
  
  // Add randomness to the heuristic during exploration
  let heuristicModifier = 1.0;
  if (explorationPhase) {
    // Add significant randomness to heuristic (0.5x to 2.0x)
    heuristicModifier = 0.5 + Math.random() * 1.5;
  } else {
    // Add mild randomness (0.8x to 1.3x)
    heuristicModifier = 0.8 + Math.random() * 0.7;
  }
  
  const randomizedHeuristic = targetNode.heuristicDistance * heuristicModifier;
  let distanceToCompare = currentNode.distance + targetNode.weight + distance[0];
  
  if (distanceToCompare < targetNode.distance) {
    targetNode.distance = distanceToCompare;
    targetNode.totalDistance = targetNode.distance + randomizedHeuristic;
    targetNode.previousNode = currentNode.id;
    targetNode.path = distance[1];
    targetNode.direction = distance[2];
  }
}

function getNeighborsRandomized(id, nodes, boardArray) {
  let coordinates = id.split("-");
  let x = parseInt(coordinates[0]);
  let y = parseInt(coordinates[1]);
  let neighbors = [];
  let potentialNeighbor;
  
  // Get all four directions
  const directions = [
    { dx: -1, dy: 0 }, // up
    { dx: 1, dy: 0 },  // down
    { dx: 0, dy: -1 }, // left
    { dx: 0, dy: 1 }   // right
  ];
  
  // Shuffle directions for more randomness
  for (let i = directions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [directions[i], directions[j]] = [directions[j], directions[i]];
  }
  
  for (const dir of directions) {
    const newX = x + dir.dx;
    const newY = y + dir.dy;
    
    if (boardArray[newX] && boardArray[newX][newY]) {
      potentialNeighbor = `${newX}-${newY}`;
      if (nodes[potentialNeighbor].status !== "wall" && nodes[potentialNeighbor].status !== "dummy-product") {
        neighbors.push(potentialNeighbor);
      }
    }
  }
  
  return neighbors;
}

function getDistanceRandomized(nodeOne, nodeTwo) {
  let currentCoordinates = nodeOne.id.split("-");
  let targetCoordinates = nodeTwo.id.split("-");
  let x1 = parseInt(currentCoordinates[0]);
  let y1 = parseInt(currentCoordinates[1]);
  let x2 = parseInt(targetCoordinates[0]);
  let y2 = parseInt(targetCoordinates[1]);
  
  // Add slight randomness to distance (0.9 to 1.2)
  const randomFactor = 0.9 + Math.random() * 0.3;
  
  if (x2 < x1 && y1 === y2) {
    if (nodeOne.direction === "up") {
      return [1 * randomFactor, ["f"], "up"];
    } else if (nodeOne.direction === "right") {
      return [2 * randomFactor, ["l", "f"], "up"];
    } else if (nodeOne.direction === "left") {
      return [2 * randomFactor, ["r", "f"], "up"];
    } else if (nodeOne.direction === "down") {
      return [3 * randomFactor, ["r", "r", "f"], "up"];
    } else {
      return [1.5 * randomFactor, null, "up"];
    }
  } else if (x2 > x1 && y1 === y2) {
    if (nodeOne.direction === "up") {
      return [3 * randomFactor, ["r", "r", "f"], "down"];
    } else if (nodeOne.direction === "right") {
      return [2 * randomFactor, ["r", "f"], "down"];
    } else if (nodeOne.direction === "left") {
      return [2 * randomFactor, ["l", "f"], "down"];
    } else if (nodeOne.direction === "down") {
      return [1 * randomFactor, ["f"], "down"];
    } else {
      return [1.5 * randomFactor, null, "down"];
    }
  }
  if (y2 < y1 && x1 === x2) {
    if (nodeOne.direction === "up") {
      return [2 * randomFactor, ["l", "f"], "left"];
    } else if (nodeOne.direction === "right") {
      return [3 * randomFactor, ["l", "l", "f"], "left"];
    } else if (nodeOne.direction === "left") {
      return [1 * randomFactor, ["f"], "left"];
    } else if (nodeOne.direction === "down") {
      return [2 * randomFactor, ["r", "f"], "left"];
    } else {
      return [1.5 * randomFactor, null, "left"];
    }
  } else if (y2 > y1 && x1 === x2) {
    if (nodeOne.direction === "up") {
      return [2 * randomFactor, ["r", "f"], "right"];
    } else if (nodeOne.direction === "right") {
      return [1 * randomFactor, ["f"], "right"];
    } else if (nodeOne.direction === "left") {
      return [3 * randomFactor, ["r", "r", "f"], "right"];
    } else if (nodeOne.direction === "down") {
      return [2 * randomFactor, ["l", "f"], "right"];
    } else {
      return [1.5 * randomFactor, null, "right"];
    }
  }
}

function manhattanDistanceRandomized(nodeOne, nodeTwo) {
  let nodeOneCoordinates = nodeOne.id.split("-").map(ele => parseInt(ele));
  let nodeTwoCoordinates = nodeTwo.id.split("-").map(ele => parseInt(ele));
  let xOne = nodeOneCoordinates[0];
  let xTwo = nodeTwoCoordinates[0];
  let yOne = nodeOneCoordinates[1];
  let yTwo = nodeTwoCoordinates[1];

  let xChange = Math.abs(xOne - xTwo);
  let yChange = Math.abs(yOne - yTwo);

  return (xChange + yChange);
}

module.exports = randomizedShopper;