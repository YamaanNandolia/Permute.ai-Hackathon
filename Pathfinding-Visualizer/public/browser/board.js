const Node = require("./node");
const launchAnimations = require("./animations/launchAnimations");
const launchInstantAnimations = require("./animations/launchInstantAnimations");
const mazeGenerationAnimations = require("./animations/mazeGenerationAnimations");
const weightedSearchAlgorithm = require("./pathfindingAlgorithms/weightedSearchAlgorithm");
const unweightedSearchAlgorithm = require("./pathfindingAlgorithms/unweightedSearchAlgorithm");
const getDistance = require("./getDistance");
const getHeatmapColor = require("./heatmapRenderer");

function Board(height, width) {
  this.height = height;
  this.width = width;
  this.start = null;
  this.target = null;
  this.object = null;
  this.boardArray = [];
  this.nodes = {};
  this.nodesToAnimate = [];
  this.objectNodesToAnimate = [];
  this.shortestPathNodesToAnimate = [];
  this.objectShortestPathNodesToAnimate = [];
  this.wallsToAnimate = [];
  this.mouseDown = false;
  this.pressedNodeStatus = "normal";
  this.previouslyPressedNodeStatus = null;
  this.previouslySwitchedNode = null;
  this.previouslySwitchedNodeWeight = 0;
  this.keyDown = false;
  this.algoDone = false;
  this.currentAlgorithm = null;
  this.currentHeuristic = null;
  this.numberOfObjects = 0;
  this.isObject = false;
  this.buttonsOn = false;
  this.speed = "fast";
  // Heatmap configuration
  this.heatmapConfig = {
    maxThreshold: 75,
    enabled: false,
    visionConeWeight: 0.20,
    directPathWeight: 0.15
  };
  this.visionCone = null;
  // Store-layout MVP extensions
  this.productMode = false;
  this.dummyProductMode = false;
  this.products = [];
  this.dummyProducts = [];
  this.productDragAction = null;
  this.dragAction = null;
  this.multiTargetRunning = false;
  // Store layout data
  this.shelfData = {}; // Stores shelf tier information for each product node
  this.lastComputedPath = null; // Stores the last A* path computed
  this.storeMetadata = {
    name: "",
    created: null,
    description: ""
  };
}

Board.prototype.initialise = function() {
  this.createGrid();
  this.addEventListeners();
  // Set A* as the default algorithm
  this.currentAlgorithm = "astar";
  this.currentHeuristic = "poweredManhattanDistance";
  this.toggleButtons();
  // Auto-enable heatmap
  this.initializeHeatmap();
};

Board.prototype.createGrid = function() {
  let tableHTML = "";
  for (let r = 0; r < this.height; r++) {
    let currentArrayRow = [];
    let currentHTMLRow = `<tr id="row ${r}">`;
    for (let c = 0; c < this.width; c++) {
      let newNodeId = `${r}-${c}`, newNodeClass, newNode;
      if (r === Math.floor(this.height / 2) && c === Math.floor(this.width / 4)) {
        newNodeClass = "start";
        this.start = `${newNodeId}`;
      } else if (r === Math.floor(this.height / 2) && c === Math.floor(3 * this.width / 4)) {
        newNodeClass = "target";
        this.target = `${newNodeId}`;
      } else {
        newNodeClass = "unvisited";
      }
      newNode = new Node(newNodeId, newNodeClass);
      currentArrayRow.push(newNode);
      currentHTMLRow += `<td id="${newNodeId}" class="${newNodeClass}"></td>`;
      this.nodes[`${newNodeId}`] = newNode;
    }
    this.boardArray.push(currentArrayRow);
    tableHTML += `${currentHTMLRow}</tr>`;
  }
  let board = document.getElementById("board");
  board.innerHTML = tableHTML;
};

Board.prototype.addEventListeners = function() {
  let board = this;
  for (let r = 0; r < board.height; r++) {
    for (let c = 0; c < board.width; c++) {
      let currentId = `${r}-${c}`;
      let currentNode = board.getNode(currentId);
      let currentElement = document.getElementById(currentId);
      currentElement.onmousedown = (e) => {
        e.preventDefault();
        if (this.buttonsOn) {
          board.mouseDown = true;
          if (board.productMode && currentNode.status !== "start" && currentNode.status !== "target" && currentNode.status !== "object") {
            board.pressedNodeStatus = "product-mode";
            const currentType = board.dummyProductMode ? "dummy-product" : "product";
            board.productDragAction = currentNode.status === currentType ? "remove" : "add";
            board.toggleProductAtNode(currentNode);
          } else if (currentNode.status === "start" || currentNode.status === "target" || currentNode.status === "object") {
            board.pressedNodeStatus = currentNode.status;
          } else {
            board.pressedNodeStatus = "normal";
            if (!board.keyDown) {
              board.dragAction = currentNode.status === "wall" ? "eraseWall" : "addWall";
            } else if (board.keyDown === 87) {
              board.dragAction = currentNode.weight === 15 ? "eraseWeight" : "addWeight";
            }
            board.applyDragAction(currentNode);
          }
        }
      }
      currentElement.onmouseup = () => {
        if (this.buttonsOn) {
          board.mouseDown = false;
          if (board.pressedNodeStatus === "target") {
            board.target = currentId;
          } else if (board.pressedNodeStatus === "start") {
            board.start = currentId;
          } else if (board.pressedNodeStatus === "object") {
            board.object = currentId;
          }
          board.pressedNodeStatus = "normal";
          board.dragAction = null;
          board.productDragAction = null;
        }
      }
      currentElement.onmouseenter = () => {
        if (this.buttonsOn) {
          if (board.mouseDown && board.pressedNodeStatus === "product-mode") {
            board.toggleProductAtNode(currentNode);
          } else if (board.mouseDown && board.pressedNodeStatus !== "normal") {
            board.changeSpecialNode(currentNode);
            if (board.pressedNodeStatus === "target") {
              board.target = currentId;
              if (board.algoDone) {
                board.redoAlgorithm();
              }
            } else if (board.pressedNodeStatus === "start") {
              board.start = currentId;
              if (board.algoDone) {
                board.redoAlgorithm();
              }
            } else if (board.pressedNodeStatus === "object") {
              board.object = currentId;
              if (board.algoDone) {
                board.redoAlgorithm();
              }
            }
          } else if (board.mouseDown) {
            board.applyDragAction(currentNode);
          }
        }
      }
      currentElement.onmouseleave = () => {
        if (this.buttonsOn) {
          if (board.mouseDown && board.pressedNodeStatus !== "normal") {
            board.changeSpecialNode(currentNode);
          }
        }
      }
    }
  }
};

Board.prototype.getNode = function(id) {
  let coordinates = id.split("-");
  let r = parseInt(coordinates[0]);
  let c = parseInt(coordinates[1]);
  return this.boardArray[r][c];
};

Board.prototype.changeSpecialNode = function(currentNode) {
  let element = document.getElementById(currentNode.id), previousElement;
  if (this.previouslySwitchedNode) previousElement = document.getElementById(this.previouslySwitchedNode.id);
  if (currentNode.status !== "target" && currentNode.status !== "start" && currentNode.status !== "object") {
    if (this.previouslySwitchedNode) {
      this.previouslySwitchedNode.status = this.previouslyPressedNodeStatus;
      previousElement.className = this.previouslySwitchedNodeWeight === 15 ?
      "unvisited weight" : this.previouslyPressedNodeStatus;
      this.previouslySwitchedNode.weight = this.previouslySwitchedNodeWeight === 15 ?
      15 : 0;
      this.previouslySwitchedNode = null;
      this.previouslySwitchedNodeWeight = currentNode.weight;

      this.previouslyPressedNodeStatus = currentNode.status;
      element.className = this.pressedNodeStatus;
      currentNode.status = this.pressedNodeStatus;

      currentNode.weight = 0;
    }
  } else if (currentNode.status !== this.pressedNodeStatus && !this.algoDone) {
    this.previouslySwitchedNode.status = this.pressedNodeStatus;
    previousElement.className = this.pressedNodeStatus;
  } else if (currentNode.status === this.pressedNodeStatus) {
    this.previouslySwitchedNode = currentNode;
    element.className = this.previouslyPressedNodeStatus;
    currentNode.status = this.previouslyPressedNodeStatus;
  }
};

Board.prototype.applyDragAction = function(currentNode) {
  let element = document.getElementById(currentNode.id);
  let relevantStatuses = ["start", "target", "object", "product", "dummy-product"];
  if (relevantStatuses.includes(currentNode.status)) return;
  if (!this.keyDown) {
    if (this.dragAction === "addWall") {
      currentNode.status = "wall";
      currentNode.weight = 0;
      element.className = "wall";
    } else if (this.dragAction === "eraseWall") {
      currentNode.status = "unvisited";
      element.className = "unvisited";
    }
  } else if (this.keyDown === 87) {
    if (this.dragAction === "addWeight") {
      currentNode.status = "unvisited";
      currentNode.weight = 15;
      element.className = "unvisited weight";
    } else if (this.dragAction === "eraseWeight") {
      currentNode.status = "unvisited";
      currentNode.weight = 0;
      element.className = "unvisited";
    }
  }
};

Board.prototype.toggleProductAtNode = function(currentNode) {
  let element = document.getElementById(currentNode.id);
  let special = ["start", "target", "object", "wall"];
  if (special.includes(currentNode.status)) return;
  
  const isDummy = this.dummyProductMode;
  const targetStatus = isDummy ? "dummy-product" : "product";
  const otherStatus = isDummy ? "product" : "dummy-product";
  
  if (!this.productDragAction) {
    this.productDragAction = currentNode.status === targetStatus ? "remove" : "add";
  }
  
  if (this.productDragAction === "add") {
    if (currentNode.status !== targetStatus) {
      if (currentNode.status === otherStatus) {
        if (isDummy) {
          const idx = this.products.indexOf(currentNode.id);
          if (idx > -1) this.products.splice(idx, 1);
        } else {
          const idx = this.dummyProducts.indexOf(currentNode.id);
          if (idx > -1) this.dummyProducts.splice(idx, 1);
        }
      }
      currentNode.status = targetStatus;
      currentNode.weight = currentNode.weight || 0;
      element.className = targetStatus;
      if (isDummy) {
        if (!this.dummyProducts.includes(currentNode.id)) this.dummyProducts.push(currentNode.id);
      } else {
        if (!this.products.includes(currentNode.id)) this.products.push(currentNode.id);
      }
    }
  } else if (this.productDragAction === "remove") {
    if (currentNode.status === targetStatus) {
      currentNode.status = "unvisited";
      element.className = currentNode.weight === 15 ? "unvisited weight" : "unvisited";
      if (isDummy) {
        const idx = this.dummyProducts.indexOf(currentNode.id);
        if (idx > -1) this.dummyProducts.splice(idx, 1);
      } else {
        const idx = this.products.indexOf(currentNode.id);
        if (idx > -1) this.products.splice(idx, 1);
      }
    }
  }
};

Board.prototype.clearProducts = function() {
  this.products.forEach(id => {
    const node = this.nodes[id];
    if (!node) return;
    node.status = "unvisited";
    const el = document.getElementById(id);
    if (el) {
      el.className = node.weight === 15 ? "unvisited weight" : "unvisited";
    }
  });
  this.products = [];
  
  this.dummyProducts.forEach(id => {
    const node = this.nodes[id];
    if (!node) return;
    node.status = "unvisited";
    const el = document.getElementById(id);
    if (el) {
      el.className = node.weight === 15 ? "unvisited weight" : "unvisited";
    }
  });
  this.dummyProducts = [];
};

Board.prototype._manhattan = function(a, b) {
  let [ax, ay] = a.split("-").map(n => parseInt(n));
  let [bx, by] = b.split("-").map(n => parseInt(n));
  return Math.abs(ax - bx) + Math.abs(ay - by);
};

Board.prototype._computeGreedyOrder = function(start, products) {
  let remaining = products.slice();
  let order = [];
  let current = start;
  while (remaining.length) {
    let bestIdx = 0, bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = this._manhattan(current, remaining[i]);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    order.push(next);
    current = next;
  }
  return order;
};

Board.prototype._animatePathNodes = function(pathNodes, onDone, type) {
  let board = this;
  function step(i) {
    if (i >= pathNodes.length) {
      if (onDone) onDone();
      return;
    }
    const node = pathNodes[i];
    const el = document.getElementById(node.id);
    
    // Cast vision rays as the agent actually moves along the path
    if (board.heatmapConfig && board.heatmapConfig.enabled && board.visionCone) {
      // Calculate direction from previous node
      const { Vec2 } = require("./visionCone");
      let direction;
      
      if (i > 0) {
        const prevNode = pathNodes[i - 1];
        const [currR, currC] = node.id.split('-').map(Number);
        const [prevR, prevC] = prevNode.id.split('-').map(Number);
        const dx = currC - prevC;
        const dy = currR - prevR;
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        direction = magnitude === 0 ? new Vec2(1, 0) : new Vec2(dx / magnitude, dy / magnitude);
      } else {
        direction = new Vec2(1, 0); // Default right
      }
      
      board.visionCone.direction = direction;
      board.visionCone.castRays(board, node.id);
      
      // Increment path visit count for actual path nodes
      node.pathVisitCount++;
      node.totalVisitCount = (node.visionVisitCount * board.heatmapConfig.visionConeWeight) +
                             (node.pathVisitCount * board.heatmapConfig.directPathWeight);
      node.heatmapIntensity = Math.min(1, node.totalVisitCount / board.heatmapConfig.maxThreshold);
    }
    
    if (type === "unweighted") {
      el.className = "shortest-path-unweighted";
    } else {
      el.className = "shortest-path";
    }
    setTimeout(() => step(i + 1), 40);
  }
  step(0);
};

Board.prototype.runShoppingPath = function() {
  if (this.multiTargetRunning) return;
  
  const weightedAlgorithms = ["dijkstra", "CLA", "greedy", "astar"];
  const type = weightedAlgorithms.includes(this.currentAlgorithm) ? "weighted" : "unweighted";

  const products = this.products.slice();
  const sequence = this._computeGreedyOrder(this.start, products);
  const stops = sequence.concat([this.target]);

  const legs = [];
  let from = this.start;
  for (const to of stops) {
    legs.push({ from, to });
    from = to;
  }

  this.multiTargetRunning = true;
  
  // Store the full path for export
  const fullPath = {
    start: this.start,
    productSequence: sequence,
    target: this.target,
    legs: []
  };

  const runLeg = (idx) => {
    if (idx >= legs.length) {
      this.multiTargetRunning = false;
      const summary = ["Start: " + this.start].concat(sequence.map((p, i) => `P${i + 1}: ${p}`)).concat(["End: " + this.target]).join("  ->  ");
      document.getElementById("algorithmDescriptor").innerHTML = `Shopping route (greedy): ${summary}`;
      this.algoDone = true;
      this.lastComputedPath = fullPath; // Store the path
      this.ensureButtonsOn();
      this.updateClearButtons();
      return;
    }

    const { from, to } = legs[idx];
    this.clearPath();
    this.clearNodeStatuses();
    this.start = from;
    this.target = to;
    this.nodesToAnimate = [];

    let success = false;
    if (type === "weighted") {
      success = weightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic, this);
    } else {
      success = unweightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this);
    }
    if (!success) {
      console.log("Leg failed from", from, "to", to);
      this.multiTargetRunning = false;
      this.toggleButtons();
      return;
    }

    let pathNodes = [];
    let cur = this.nodes[this.nodes[to].previousNode];
    while (cur && cur.id !== from) {
      pathNodes.unshift(cur);
      cur = this.nodes[cur.previousNode];
    }
    
    // Record this leg in the full path
    fullPath.legs.push({
      from: from,
      to: to,
      pathNodes: pathNodes.map(n => n.id)
    });
    
    document.getElementById(from).className = "startTransparent";
    document.getElementById(to).className = "visitedTargetNodeBlue";

    this._animatePathNodes(pathNodes, () => {
      // Render heatmap after this leg completes
      if (this.heatmapConfig && this.heatmapConfig.enabled) {
        this.renderHeatmap();
      }
      
      if (this.products.includes(to)) {
        this.products = this.products.filter(id => id !== to);
      }
      runLeg(idx + 1);
    }, type);
  };

  runLeg(0);
};

Board.prototype.createMazeOne = function(type) {
  Object.keys(this.nodes).forEach(node => {
    let random = Math.random();
    let currentHTMLNode = document.getElementById(node);
    let relevantClassNames = ["start", "target", "object", "product", "dummy-product"]
    let randomTwo = type === "wall" ? 0.25 : 0.35;
    if (random < randomTwo && !relevantClassNames.includes(currentHTMLNode.className)) {
      if (type === "wall") {
        currentHTMLNode.className = "wall";
        this.nodes[node].status = "wall";
        this.nodes[node].weight = 0;
      } else if (type === "weight") {
        currentHTMLNode.className = "unvisited weight";
        this.nodes[node].status = "unvisited";
        this.nodes[node].weight = 15;
      }
    }
  });
};

Board.prototype.clearPath = function(clickedButton) {
  if (clickedButton) {
    let start = this.nodes[this.start];
    let target = this.nodes[this.target];
    let object = this.numberOfObjects ? this.nodes[this.object] : null;
    start.status = "start";
    document.getElementById(start.id).className = "start";
    target.status = "target";
    document.getElementById(target.id).className = "target";
    if (object) {
      object.status = "object";
      document.getElementById(object.id).className = "object";
    }
    this.products.forEach(id => {
      if (this.nodes[id]) {
        this.nodes[id].status = "product";
        const el = document.getElementById(id);
        if (el) el.className = "product";
      }
    });
    this.dummyProducts.forEach(id => {
      if (this.nodes[id]) {
        this.nodes[id].status = "dummy-product";
        const el = document.getElementById(id);
        if (el) el.className = "dummy-product";
      }
    });
  }

  this.algoDone = false;
  Object.keys(this.nodes).forEach(id => {
    let currentNode = this.nodes[id];
    currentNode.previousNode = null;
    currentNode.distance = Infinity;
    currentNode.totalDistance = Infinity;
    currentNode.heuristicDistance = null;
    currentNode.direction = null;
    currentNode.storedDirection = null;
    currentNode.relatesToObject = false;
    currentNode.overwriteObjectRelation = false;
    let currentHTMLNode = document.getElementById(id);
    let relevantStatuses = ["wall", "start", "target", "object", "product", "dummy-product"];
    if ((!relevantStatuses.includes(currentNode.status) || currentHTMLNode.className === "visitedobject") && currentNode.weight !== 15) {
      currentNode.status = "unvisited";
      currentHTMLNode.className = "unvisited";
    } else if (currentNode.weight === 15) {
      currentNode.status = "unvisited";
      currentHTMLNode.className = "unvisited weight";
    } else if (currentNode.status === "product") {
      currentHTMLNode.className = "product";
    } else if (currentNode.status === "dummy-product") {
      currentHTMLNode.className = "dummy-product";
    }
  });
};

Board.prototype.clearWalls = function() {
  this.clearPath("clickedButton");
  Object.keys(this.nodes).forEach(id => {
    let currentNode = this.nodes[id];
    let currentHTMLNode = document.getElementById(id);
    if (currentNode.status === "wall" || currentNode.weight === 15) {
      currentNode.status = "unvisited";
      currentNode.weight = 0;
      currentHTMLNode.className = "unvisited";
    }
  });
}

Board.prototype.clearNodeStatuses = function() {
  Object.keys(this.nodes).forEach(id => {
    let currentNode = this.nodes[id];
    currentNode.previousNode = null;
    currentNode.distance = Infinity;
    currentNode.totalDistance = Infinity;
    currentNode.heuristicDistance = null;
    currentNode.storedDirection = currentNode.direction;
    currentNode.direction = null;
    let relevantStatuses = ["wall", "start", "target", "object", "product", "dummy-product"];
    if (!relevantStatuses.includes(currentNode.status)) {
      currentNode.status = "unvisited";
    }
  })
};

Board.prototype.instantAlgorithm = function() {
  let success;
  if (!this.numberOfObjects) {
    success = weightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic, this);
    launchInstantAnimations(this, success, "weighted");
  } else {
    this.isObject = true;
    success = weightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic, this);
    launchInstantAnimations(this, success, "weighted", "object", this.currentAlgorithm);
  }
  this.algoDone = true;
};

Board.prototype.redoAlgorithm = function() {
  this.clearPath();
  this.instantAlgorithm();
};

Board.prototype.reset = function(objectNotTransparent) {
  // Ensure controls are enabled after animations complete
  this.ensureButtonsOn();
};

Board.prototype.complete = function() {
  this.algoDone = true;
  this.ensureButtonsOn();
  this.updateClearButtons();
}

Board.prototype.addShortestPath = function(targetNode, startNode, type) {
  let currentNode = this.nodes[targetNode];
  let nodes = [];
  while (currentNode.id !== startNode) {
    nodes.unshift(currentNode);
    
    // Add bonus to path visit count for final shortest path nodes
    if (this.heatmapConfig && this.heatmapConfig.enabled) {
      currentNode.pathVisitCount += 3; // Bonus for being on final path
      
      // Recalculate total visit count and intensity
      currentNode.totalVisitCount = (currentNode.visionVisitCount * this.heatmapConfig.visionConeWeight) +
                                     (currentNode.pathVisitCount * this.heatmapConfig.directPathWeight);
      currentNode.heatmapIntensity = Math.min(1, currentNode.totalVisitCount / this.heatmapConfig.maxThreshold);
    }
    
    currentNode = this.nodes[currentNode.previousNode];
  }
  if (type === "object") {
    this.objectShortestPathNodesToAnimate = nodes;
  } else {
    this.shortestPathNodesToAnimate = nodes;
  }
};

Board.prototype.drawShortestPathTimeout = function(targetNode, startNode, type, objectType) {
  let currentNode = this.nodes[targetNode];
  let nodes = [];
  while (currentNode.id !== startNode) {
    nodes.unshift(currentNode);
    currentNode = this.nodes[currentNode.previousNode];
  }
  if (objectType === "object") {
    this.objectShortestPathNodesToAnimate = nodes;
  } else {
    this.shortestPathNodesToAnimate = nodes;
  }
};

Board.prototype.ensureButtonsOn = function() {
  if (!this.buttonsOn) {
    this.toggleButtons();
  }
};

Board.prototype.updateClearButtons = function() {
  if (this.algoDone) {
    // Hide clear buttons that start with "clear"
    document.getElementById("startButtonClearBoard").style.display = "none";
    document.getElementById("startButtonClearWalls").style.display = "none";
    document.getElementById("startButtonClearPath").style.display = "none";
    document.getElementById("startButtonClearProducts").style.display = "none";
    // Show Reset and Save Store buttons
    document.getElementById("startButtonReset").style.display = "block";
    document.getElementById("startButtonSaveStore").style.display = "block";
  } else {
    // Show clear buttons
    document.getElementById("startButtonClearBoard").style.display = "block";
    document.getElementById("startButtonClearWalls").style.display = "block";
    document.getElementById("startButtonClearPath").style.display = "block";
    document.getElementById("startButtonClearProducts").style.display = "block";
    // Hide Reset and Save Store buttons
    document.getElementById("startButtonReset").style.display = "none";
    document.getElementById("startButtonSaveStore").style.display = "none";
  }
};

Board.prototype.clearBoard = function() {
  document.getElementById("startButtonAddObject").innerHTML = '<a href="#">Add Bomb</a></li>';

  let navbarHeight = document.getElementById("navbarDiv").clientHeight;
  let textHeight = document.getElementById("mainText").clientHeight + document.getElementById("algorithmDescriptor").clientHeight;
  let height = Math.floor((document.documentElement.clientHeight - navbarHeight - textHeight) / 28);
  let width = Math.floor(document.documentElement.clientWidth / 25);
  let start = Math.floor(height / 2).toString() + "-" + Math.floor(width / 4).toString();
  let target = Math.floor(height / 2).toString() + "-" + Math.floor(3 * width / 4).toString();

  Object.keys(this.nodes).forEach(id => {
    let currentNode = this.nodes[id];
    let currentHTMLNode = document.getElementById(id);
    if (id === start) {
      currentHTMLNode.className = "start";
      currentNode.status = "start";
    } else if (id === target) {
      currentHTMLNode.className = "target";
      currentNode.status = "target"
    } else {
      currentHTMLNode.className = "unvisited";
      currentNode.status = "unvisited";
    }
    currentNode.previousNode = null;
    currentNode.path = null;
    currentNode.direction = null;
    currentNode.storedDirection = null;
    currentNode.distance = Infinity;
    currentNode.totalDistance = Infinity;
    currentNode.heuristicDistance = null;
    currentNode.weight = 0;
    currentNode.relatesToObject = false;
    currentNode.overwriteObjectRelation = false;
  });
  this.start = start;
  this.target = target;
  this.object = null;
  this.nodesToAnimate = [];
  this.objectNodesToAnimate = [];
  this.shortestPathNodesToAnimate = [];
  this.objectShortestPathNodesToAnimate = [];
  this.wallsToAnimate = [];
  this.mouseDown = false;
  this.pressedNodeStatus = "normal";
  this.previouslyPressedNodeStatus = null;
  this.previouslySwitchedNode = null;
  this.previouslySwitchedNodeWeight = 0;
  this.keyDown = false;
  this.algoDone = false;
  this.numberOfObjects = 0;
  this.isObject = false;
  this.clearProducts();
  this.products = [];
  this.dummyProducts = [];
  this.productMode = false;
  this.dummyProductMode = false;
  document.getElementById("startButtonToggleProducts").innerHTML = '<a href="#">Products: Off</a>';
  document.getElementById("startButtonToggleDummy").innerHTML = '<a href="#">Dummy Mode: Off</a>';
  this.updateClearButtons();
};

Board.prototype.exportStoreData = function() {
  // Create a matrix representation of the board
  const matrix = [];
  for (let r = 0; r < this.height; r++) {
    const row = [];
    for (let c = 0; c < this.width; c++) {
      const node = this.boardArray[r][c];
      let cellValue = 0; // 0 = unvisited/empty
      
      if (node.status === "wall") cellValue = 1; // wall
      else if (node.status === "product") cellValue = 2; // product (yellow/target)
      else if (node.status === "dummy-product") cellValue = 3; // dummy product (red/obstacle)
      else if (node.status === "start") cellValue = 4; // start
      else if (node.status === "target") cellValue = 5; // target
      else if (node.weight === 15) cellValue = 6; // weighted node
      
      row.push(cellValue);
    }
    matrix.push(row);
  }
  
  // Create the complete store data structure
  const storeData = {
    metadata: {
      name: this.storeMetadata.name || `Store_${new Date().toISOString()}`,
      created: new Date().toISOString(),
      description: this.storeMetadata.description || "Auto-generated store layout",
      dimensions: {
        height: this.height,
        width: this.width
      }
    },
    layout: {
      matrix: matrix,
      start: this.start,
      target: this.target,
      products: this.products.slice(),
      dummyProducts: this.dummyProducts.slice(),
      walls: Object.keys(this.nodes).filter(id => this.nodes[id].status === "wall")
    },
    shelfData: this.shelfData, // Shelf tier information for each product
    path: this.lastComputedPath, // The A* computed path
    algorithm: {
      name: this.currentAlgorithm,
      heuristic: this.currentHeuristic
    }
  };
  
  return storeData;
};

Board.prototype.saveStoreToServer = async function() {
  const storeData = this.exportStoreData();
  
  try {
    const response = await fetch('/api/save-store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(storeData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(`Store saved successfully!\nFile: ${result.filename}\nPath: ${result.path}`);
      console.log("Store data saved:", result);
    } else {
      alert(`Failed to save store: ${result.message}`);
      console.error("Save failed:", result);
    }
    
    return result;
  } catch (error) {
    alert(`Error saving store: ${error.message}`);
    console.error("Error saving store:", error);
    return { success: false, error: error.message };
  }
};

Board.prototype.setShelfTier = function(nodeId, tier, productInfo) {
  // tier: 'lower', 'middle', 'higher'
  // productInfo: { name, barcode, price, etc. }
  if (!this.shelfData[nodeId]) {
    this.shelfData[nodeId] = {
      lower: null,
      middle: null,
      higher: null
    };
  }
  this.shelfData[nodeId][tier] = productInfo;
};

Board.prototype.getShelfTier = function(nodeId, tier) {
  if (this.shelfData[nodeId]) {
    return this.shelfData[nodeId][tier];
  }
  return null;
};

Board.prototype.renderHeatmap = function() {
  // Return early if heatmap is not enabled
  if (!this.heatmapConfig.enabled) {
    return;
  }
  
  // Iterate through all nodes
  Object.keys(this.nodes).forEach(id => {
    const node = this.nodes[id];
    const element = document.getElementById(id);
    
    if (!element) return;
    
    // Skip special nodes
    const skipStatuses = ['start', 'target', 'wall', 'object', 'product', 'dummy-product'];
    if (skipStatuses.includes(node.status)) {
      return;
    }
    
    // Only render if node has heatmap intensity
    if (node.heatmapIntensity && node.heatmapIntensity > 0) {
      const color = getHeatmapColor(node.heatmapIntensity);
      element.style.backgroundColor = color;
      element.classList.add('heatmap-node');
    }
  });
};

Board.prototype.clearHeatmapVisualization = function() {
  // Iterate through all nodes
  Object.keys(this.nodes).forEach(id => {
    const node = this.nodes[id];
    const element = document.getElementById(id);
    
    if (!element) return;
    
    // Reset background color
    element.style.backgroundColor = '';
    
    // Remove heatmap class
    element.classList.remove('heatmap-node');
  });
};

Board.prototype.initializeHeatmap = function() {
  const { VisionCone, Vec2 } = require("./visionCone");
  
  // Create a vision cone instance with default settings
  // 90 degree cone, 10 unit range, facing right initially
  this.visionCone = new VisionCone(90, 10, new Vec2(1, 0));
  
  // Enable heatmap
  this.heatmapConfig.enabled = true;
  
  // Reset all node heatmap counters
  Object.keys(this.nodes).forEach(id => {
    const node = this.nodes[id];
    node.visionVisitCount = 0;
    node.pathVisitCount = 0;
    node.totalVisitCount = 0;
    node.heatmapIntensity = 0;
  });
};

Board.prototype.toggleButtons = function() {
  document.getElementById("refreshButton").onclick = () => {
    window.location.reload(true);
  }

  if (!this.buttonsOn) {
    this.buttonsOn = true;
    this.updateClearButtons();

    // Visualize button - always uses A*
    document.getElementById("startButtonStart").onclick = () => {
      this.clearPath("clickedButton");
      this.toggleButtons();
      let success;
      if (!this.numberOfObjects) {
        success = weightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
        launchAnimations(this, success, "weighted");
      } else {
        this.isObject = true;
        success = weightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
        launchAnimations(this, success, "weighted", "object", this.currentAlgorithm);
      }
      this.algoDone = true;
    }

    // Speed controls
    document.getElementById("adjustFast").onclick = () => {
      this.speed = "fast";
      document.getElementById("adjustSpeed").innerHTML = 'Speed: Fast<span class="caret"></span>';
    }

    document.getElementById("adjustAverage").onclick = () => {
      this.speed = "average";
      document.getElementById("adjustSpeed").innerHTML = 'Speed: Average<span class="caret"></span>';
    }

    document.getElementById("adjustSlow").onclick = () => {
      this.speed = "slow";
      document.getElementById("adjustSpeed").innerHTML = 'Speed: Slow<span class="caret"></span>';
    }

    // Product controls
    document.getElementById("startButtonToggleProducts").onclick = () => {
      this.productMode = !this.productMode;
      document.getElementById("startButtonToggleProducts").innerHTML =
        `<a href="#">Products: ${this.productMode ? "On" : "Off"}</a>`;
    }

    document.getElementById("startButtonToggleDummy").onclick = () => {
      this.dummyProductMode = !this.dummyProductMode;
      document.getElementById("startButtonToggleDummy").innerHTML =
        `<a href="#">Dummy Mode: ${this.dummyProductMode ? "On" : "Off"}</a>`;
    }

    document.getElementById("startButtonClearProducts").onclick = () => {
      this.clearProducts();
    }

    document.getElementById("startButtonRunShopping").onclick = () => {
      if (!this.products || this.products.length === 0) return;
      this.clearPath("clickedButton");
      this.toggleButtons();
      this.runShoppingPath();
    }

    // Maze generation - only random maze
    document.getElementById("startButtonCreateMazeOne").onclick = () => {
      this.clearWalls();
      this.clearPath("clickedButton");
      this.createMazeOne("wall");
    }

    // Clear controls
    document.querySelector("#startButtonClearBoard a").onclick = (e) => {
      e.preventDefault();
      this.clearBoard();
    }

    document.querySelector("#startButtonReset a").onclick = (e) => {
      e.preventDefault();
      this.clearBoard();
    }
    
    document.querySelector("#startButtonSaveStore a").onclick = (e) => {
      e.preventDefault();
      this.saveStoreToServer();
    }

    document.querySelector("#startButtonClearWalls a").onclick = (e) => {
      e.preventDefault();
      this.clearWalls();
    }

    document.querySelector("#startButtonClearPath a").onclick = (e) => {
      e.preventDefault();
      this.clearPath("clickedButton");
    }

    // Bomb control
    document.getElementById("startButtonAddObject").onclick = () => {
      let innerHTML = document.getElementById("startButtonAddObject").innerHTML;
      if (innerHTML.includes("Add")) {
        let r = Math.floor(this.height / 2);
        let c = Math.floor(2 * this.width / 4);
        let objectNodeId = `${r}-${c}`;
        if (this.target === objectNodeId || this.start === objectNodeId || this.numberOfObjects === 1) {
          console.log("Failure to place object.");
        } else {
          document.getElementById("startButtonAddObject").innerHTML = '<a href="#">Remove Bomb</a></li>';
          this.clearPath("clickedButton");
          this.object = objectNodeId;
          this.numberOfObjects = 1;
          this.nodes[objectNodeId].status = "object";
          document.getElementById(objectNodeId).className = "object";
        }
      } else {
        let objectNodeId = this.object;
        document.getElementById("startButtonAddObject").innerHTML = '<a href="#">Add Bomb</a></li>';
        document.getElementById(objectNodeId).className = "unvisited";
        this.object = null;
        this.numberOfObjects = 0;
        this.nodes[objectNodeId].status = "unvisited";
        this.isObject = false;
        this.clearPath("clickedButton");
      }
    }

    // Enable all nav items
    document.getElementById("startButtonClearPath").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonClearWalls").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonClearBoard").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonReset").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonAddObject").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonCreateMazeOne").className = "navbar-inverse navbar-nav";
    document.getElementById("adjustFast").className = "navbar-inverse navbar-nav";
    document.getElementById("adjustAverage").className = "navbar-inverse navbar-nav";
    document.getElementById("adjustSlow").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonToggleProducts").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonToggleDummy").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonRunShopping").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonClearProducts").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonSaveStore").className = "navbar-inverse navbar-nav";
    document.getElementById("actualStartButton").style.backgroundColor = "";

  } else {
    this.buttonsOn = false;
    document.getElementById("startButtonAddObject").onclick = null;
    document.getElementById("startButtonCreateMazeOne").onclick = null;
    document.getElementById("startButtonClearPath").onclick = null;
    document.getElementById("startButtonClearWalls").onclick = null;
    document.getElementById("startButtonClearBoard").onclick = null;
    document.getElementById("startButtonStart").onclick = null;
    document.getElementById("startButtonSaveStore").onclick = null;
    document.getElementById("adjustFast").onclick = null;
    document.getElementById("adjustAverage").onclick = null;
    document.getElementById("adjustSlow").onclick = null;

    document.getElementById("adjustFast").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("adjustAverage").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("adjustSlow").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonClearPath").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonClearWalls").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonClearBoard").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonReset").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonSaveStore").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonAddObject").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonToggleProducts").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonToggleDummy").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonRunShopping").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonClearProducts").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonCreateMazeOne").className = "navbar-inverse navbar-nav disabledA";

    document.getElementById("actualStartButton").style.backgroundColor = "rgb(185, 15, 15)";
  }
}

let navbarHeight = $("#navbarDiv").height();
let textHeight = $("#mainText").height() + $("#algorithmDescriptor").height();
let height = Math.floor(($(document).height() - navbarHeight - textHeight) / 28);
let width = Math.floor($(document).width() / 25);
let newBoard = new Board(height, width)
newBoard.initialise();

window.onkeydown = (e) => {
  newBoard.keyDown = e.keyCode;
}

window.onkeyup = (e) => {
  newBoard.keyDown = false;
}
