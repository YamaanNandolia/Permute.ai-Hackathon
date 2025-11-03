function unweightedSearchAlgorithm(nodes, start, target, nodesToAnimate, boardArray, name, board) {
  if (!start || !target || start === target) {
    return false;
  }
  let structure = [nodes[start]];
  let exploredNodes = {start: true};
  while (structure.length) {
    let currentNode = name === "bfs" ? structure.shift() : structure.pop();
    
    // Don't cast vision during exploration - only during actual path traversal
    // Vision will be cast in board._animatePathNodes() as the agent actually moves
    
    nodesToAnimate.push(currentNode);
    if (name === "dfs") exploredNodes[currentNode.id] = true;
    currentNode.status = "visited";
    if (currentNode.id === target) {
      return "success";
    }
    let currentNeighbors = getNeighbors(currentNode.id, nodes, boardArray, name);
    currentNeighbors.forEach(neighbor => {
      if (!exploredNodes[neighbor]) {
        if (name === "bfs") exploredNodes[neighbor] = true;
        nodes[neighbor].previousNode = currentNode.id;
        structure.push(nodes[neighbor]);
      }
    });
  }
  return false;
}

// Helper function to calculate direction vector from node movement
function calculateDirection(currentNode, nodes) {
  const { Vec2 } = require("../visionCone");
  
  if (!currentNode.previousNode) {
    // Default to right if no previous node
    return new Vec2(1, 0);
  }
  
  const prevNode = nodes[currentNode.previousNode];
  const [currR, currC] = currentNode.id.split('-').map(Number);
  const [prevR, prevC] = prevNode.id.split('-').map(Number);
  
  // Calculate direction vector
  const dx = currC - prevC;
  const dy = currR - prevR;
  
  // Normalize
  const magnitude = Math.sqrt(dx * dx + dy * dy);
  if (magnitude === 0) {
    return new Vec2(1, 0); // Default to right
  }
  
  return new Vec2(dx / magnitude, dy / magnitude);
}

function getNeighbors(id, nodes, boardArray, name) {
  let coordinates = id.split("-");
  let x = parseInt(coordinates[0]);
  let y = parseInt(coordinates[1]);
  let neighbors = [];
  let potentialNeighbor;
  if (boardArray[x - 1] && boardArray[x - 1][y]) {
    potentialNeighbor = `${(x - 1).toString()}-${y.toString()}`
    if (nodes[potentialNeighbor].status !== "wall" && nodes[potentialNeighbor].status !== "dummy-product") {
      if (name === "bfs") {
        neighbors.push(potentialNeighbor);
      } else {
        neighbors.unshift(potentialNeighbor);
      }
    }
  }
  if (boardArray[x][y + 1]) {
    potentialNeighbor = `${x.toString()}-${(y + 1).toString()}`
    if (nodes[potentialNeighbor].status !== "wall" && nodes[potentialNeighbor].status !== "dummy-product") {
      if (name === "bfs") {
        neighbors.push(potentialNeighbor);
      } else {
        neighbors.unshift(potentialNeighbor);
      }
    }
  }
  if (boardArray[x + 1] && boardArray[x + 1][y]) {
    potentialNeighbor = `${(x + 1).toString()}-${y.toString()}`
    if (nodes[potentialNeighbor].status !== "wall" && nodes[potentialNeighbor].status !== "dummy-product") {
      if (name === "bfs") {
        neighbors.push(potentialNeighbor);
      } else {
        neighbors.unshift(potentialNeighbor);
      }
    }
  }
  if (boardArray[x][y - 1]) {
    potentialNeighbor = `${x.toString()}-${(y - 1).toString()}`
    if (nodes[potentialNeighbor].status !== "wall" && nodes[potentialNeighbor].status !== "dummy-product") {
      if (name === "bfs") {
        neighbors.push(potentialNeighbor);
      } else {
        neighbors.unshift(potentialNeighbor);
      }
    }
  }
  return neighbors;
}

module.exports = unweightedSearchAlgorithm;
