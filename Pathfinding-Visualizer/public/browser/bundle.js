(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const weightedSearchAlgorithm = require("../pathfindingAlgorithms/weightedSearchAlgorithm");
const unweightedSearchAlgorithm = require("../pathfindingAlgorithms/unweightedSearchAlgorithm");

function launchAnimations(board, success, type, object, algorithm, heuristic) {
  let nodes = object ? board.objectNodesToAnimate.slice(0) : board.nodesToAnimate.slice(0);
  let speed = board.speed === "fast" ?
    0 : board.speed === "average" ?
      100 : 500;
  let shortestNodes;
  function timeout(index) {
    setTimeout(function () {
      if (index === nodes.length) {
        if (object) {
          board.objectNodesToAnimate = [];
          if (success) {
            board.addShortestPath(board.object, board.start, "object");
            board.clearNodeStatuses();
            let newSuccess;
            if (board.currentAlgorithm === "bidirectional") {

            } else {
              if (type === "weighted") {
                newSuccess = weightedSearchAlgorithm(board.nodes, board.object, board.target, board.nodesToAnimate, board.boardArray, algorithm, heuristic, board);
              } else {
                newSuccess = unweightedSearchAlgorithm(board.nodes, board.object, board.target, board.nodesToAnimate, board.boardArray, algorithm, board);
              }
            }
            document.getElementById(board.object).className = "visitedObjectNode";
            launchAnimations(board, newSuccess, type);
            return;
          } else {
            console.log("Failure.");
            board.reset();
            return;
          }
        } else {
          board.nodesToAnimate = [];
          if (success) {
            if (document.getElementById(board.target).className !== "visitedTargetNodeBlue") {
              document.getElementById(board.target).className = "visitedTargetNodeBlue";
            }
            if (board.isObject) {
              board.addShortestPath(board.target, board.object);
              board.drawShortestPathTimeout(board.target, board.object, type, "object");
              board.objectShortestPathNodesToAnimate = [];
              board.shortestPathNodesToAnimate = [];
              board.reset("objectNotTransparent");
            } else {
              board.drawShortestPathTimeout(board.target, board.start, type);
              board.objectShortestPathNodesToAnimate = [];
              board.shortestPathNodesToAnimate = [];
            }
            shortestNodes = board.objectShortestPathNodesToAnimate.concat(board.shortestPathNodesToAnimate);
            shortestPathTimeout(0);
            return;
          } else {
            console.log("Failure.");
            board.reset();
            return;
          }
        }
      } else if (index === 0) {
        if (object) {
          document.getElementById(board.start).className = "visitedStartNodePurple";
        } else {
          if (document.getElementById(board.start).className !== "visitedStartNodePurple") {
            document.getElementById(board.start).className = "visitedStartNodeBlue";
          }
        }
        if (board.currentAlgorithm === "bidirectional") {
          document.getElementById(board.target).className = "visitedTargetNodeBlue";
        }
        change(nodes[index])
      } else if (index === nodes.length - 1 && board.currentAlgorithm === "bidirectional") {
        change(nodes[index], nodes[index - 1], "bidirectional");
      } else {
        change(nodes[index], nodes[index - 1]);
      }
      timeout(index + 1);
    }, speed);
  }

  function change(currentNode, previousNode, bidirectional) {
    let currentHTMLNode = document.getElementById(currentNode.id);
    let relevantClassNames = ["start", "target", "object", "visitedStartNodeBlue", "visitedStartNodePurple", "visitedObjectNode", "visitedTargetNodePurple", "visitedTargetNodeBlue"];
    if (!relevantClassNames.includes(currentHTMLNode.className)) {
      currentHTMLNode.className = !bidirectional ?
        "current" : currentNode.weight === 15 ?
          "visited weight" : "visited";
    }
    if (currentHTMLNode.className === "visitedStartNodePurple" && !object) {
      currentHTMLNode.className = "visitedStartNodeBlue";
    }
    if (currentHTMLNode.className === "target" && object) {
      currentHTMLNode.className = "visitedTargetNodePurple";
    }
    if (previousNode) {
      let previousHTMLNode = document.getElementById(previousNode.id);
      if (!relevantClassNames.includes(previousHTMLNode.className)) {
        if (object) {
          previousHTMLNode.className = previousNode.weight === 15 ? "visitedobject weight" : "visitedobject";
        } else {
          previousHTMLNode.className = previousNode.weight === 15 ? "visited weight" : "visited";
        }
      }
    }
    
    // Render heatmap after each animation step if enabled
    if (board.heatmapConfig && board.heatmapConfig.enabled) {
      board.renderHeatmap();
    }
  }

  function shortestPathTimeout(index) {
    setTimeout(function () {
      if (index === shortestNodes.length){
        board.reset();
        if (object) {
          shortestPathChange(board.nodes[board.target], shortestNodes[index - 1]);
          board.objectShortestPathNodesToAnimate = [];
          board.shortestPathNodesToAnimate = [];
          board.clearNodeStatuses();
          let newSuccess;
          if (type === "weighted") {
            newSuccess = weightedSearchAlgorithm(board.nodes, board.object, board.target, board.nodesToAnimate, board.boardArray, algorithm);
          } else {
            newSuccess = unweightedSearchAlgorithm(board.nodes, board.object, board.target, board.nodesToAnimate, board.boardArray, algorithm);
          }
          launchAnimations(board, newSuccess, type);
          return;
        } else {
          shortestPathChange(board.nodes[board.target], shortestNodes[index - 1]);
          board.objectShortestPathNodesToAnimate = [];
          board.shortestPathNodesToAnimate = [];
          board.complete();
          return;
        }
      } else if (index === 0) {
        shortestPathChange(shortestNodes[index])
      } else {
        shortestPathChange(shortestNodes[index], shortestNodes[index - 1]);
      }
      shortestPathTimeout(index + 1);
    }, 40);
  }

  function shortestPathChange(currentNode, previousNode) {
    let currentHTMLNode = document.getElementById(currentNode.id);
    if (type === "unweighted") {
      currentHTMLNode.className = "shortest-path-unweighted";
    } else {
      if (currentNode.direction === "up") {
        currentHTMLNode.className = "shortest-path-up";
      } else if (currentNode.direction === "down") {
        currentHTMLNode.className = "shortest-path-down";
      } else if (currentNode.direction === "right") {
        currentHTMLNode.className = "shortest-path-right";
      } else if (currentNode.direction === "left") {
        currentHTMLNode.className = "shortest-path-left";
      } else if (currentNode.direction = "down-right") {
        currentHTMLNode.className = "wall"
      }
    }
    if (previousNode) {
      let previousHTMLNode = document.getElementById(previousNode.id);
      previousHTMLNode.className = "shortest-path";
    } else {
      let element = document.getElementById(board.start);
      element.className = "shortest-path";
      element.removeAttribute("style");
    }
  }

  timeout(0);

};

module.exports = launchAnimations;

},{"../pathfindingAlgorithms/unweightedSearchAlgorithm":9,"../pathfindingAlgorithms/weightedSearchAlgorithm":10}],2:[function(require,module,exports){
const weightedSearchAlgorithm = require("../pathfindingAlgorithms/weightedSearchAlgorithm");
const unweightedSearchAlgorithm = require("../pathfindingAlgorithms/unweightedSearchAlgorithm");

function launchInstantAnimations(board, success, type, object, algorithm, heuristic) {
  let nodes = object ? board.objectNodesToAnimate.slice(0) : board.nodesToAnimate.slice(0);
  let shortestNodes;
  for (let i = 0; i < nodes.length; i++) {
    if (i === 0) {
      change(nodes[i]);
    } else {
      change(nodes[i], nodes[i - 1]);
    }
  }
  if (object) {
    board.objectNodesToAnimate = [];
    if (success) {
      board.drawShortestPath(board.object, board.start, "object");
      board.clearNodeStatuses();
      let newSuccess;
      if (type === "weighted") {
        newSuccess = weightedSearchAlgorithm(board.nodes, board.object, board.target, board.nodesToAnimate, board.boardArray, algorithm, heuristic);
      } else {
        newSuccess = unweightedSearchAlgorithm(board.nodes, board.object, board.target, board.nodesToAnimate, board.boardArray, algorithm);
      }
      launchInstantAnimations(board, newSuccess, type);
      shortestNodes = board.objectShortestPathNodesToAnimate.concat(board.shortestPathNodesToAnimate);
    } else {
      console.log("Failure.");
      board.reset();
      return;
    }
  } else {
    board.nodesToAnimate = [];
    if (success) {
      if (board.isObject) {
        board.drawShortestPath(board.target, board.object);
      } else {
        board.drawShortestPath(board.target, board.start);
      }
      shortestNodes = board.objectShortestPathNodesToAnimate.concat(board.shortestPathNodesToAnimate);
    } else {
      console.log("Failure");
      board.reset();
      return;
    }
  }

  let j;
  for (j = 0; j < shortestNodes.length; j++) {
    if (j === 0) {
      shortestPathChange(shortestNodes[j]);
    } else {
      shortestPathChange(shortestNodes[j], shortestNodes[j - 1]);
    }
  }
  board.reset();
  if (object) {
    shortestPathChange(board.nodes[board.target], shortestNodes[j - 1]);
    board.objectShortestPathNodesToAnimate = [];
    board.shortestPathNodesToAnimate = [];
    board.clearNodeStatuses();
    let newSuccess;
    if (type === "weighted") {
      newSuccess = weightedSearchAlgorithm(board.nodes, board.object, board.target, board.nodesToAnimate, board.boardArray, algorithm);
    } else {
      newSuccess = unweightedSearchAlgorithm(board.nodes, board.object, board.target, board.nodesToAnimate, board.boardArray, algorithm);
    }
    launchInstantAnimations(board, newSuccess, type);
  } else {
    shortestPathChange(board.nodes[board.target], shortestNodes[j - 1]);
    board.objectShortestPathNodesToAnimate = [];
    board.shortestPathNodesToAnimate = [];
  }

  function change(currentNode, previousNode) {
    let currentHTMLNode = document.getElementById(currentNode.id);
    let relevantClassNames = ["start", "shortest-path", "instantshortest-path", "instantshortest-path weight"];
    if (previousNode) {
      let previousHTMLNode = document.getElementById(previousNode.id);
      if (!relevantClassNames.includes(previousHTMLNode.className)) {
        if (object) {
          previousHTMLNode.className = previousNode.weight === 15 ? "instantvisitedobject weight" : "instantvisitedobject";
        } else {
          previousHTMLNode.className = previousNode.weight === 15 ? "instantvisited weight" : "instantvisited";
        }
      }
    }
  }

  function shortestPathChange(currentNode, previousNode) {
    let currentHTMLNode = document.getElementById(currentNode.id);
    if (type === "unweighted") {
      currentHTMLNode.className = "shortest-path-unweighted";
    } else {
      if (currentNode.direction === "up") {
        currentHTMLNode.className = "shortest-path-up";
      } else if (currentNode.direction === "down") {
        currentHTMLNode.className = "shortest-path-down";
      } else if (currentNode.direction === "right") {
        currentHTMLNode.className = "shortest-path-right";
      } else if (currentNode.direction === "left") {
        currentHTMLNode.className = "shortest-path-left";
      }
    }
    if (previousNode) {
      let previousHTMLNode = document.getElementById(previousNode.id);
      previousHTMLNode.className = previousNode.weight === 15 ? "instantshortest-path weight" : "instantshortest-path";
    } else {
      let element = document.getElementById(board.start);
      element.className = "startTransparent";
    }
  }

};

module.exports = launchInstantAnimations;

},{"../pathfindingAlgorithms/unweightedSearchAlgorithm":9,"../pathfindingAlgorithms/weightedSearchAlgorithm":10}],3:[function(require,module,exports){
function mazeGenerationAnimations(board) {
  let nodes = board.wallsToAnimate.slice(0);
  let speed = board.speed === "fast" ?
    5 : board.speed === "average" ?
      25 : 75;
  function timeout(index) {
    setTimeout(function () {
        if (index === nodes.length){
          board.wallsToAnimate = [];
          board.toggleButtons();
          return;
        }
        nodes[index].className = board.nodes[nodes[index].id].weight === 15 ? "unvisited weight" : "wall";
        timeout(index + 1);
    }, speed);
  }

  timeout(0);
};

module.exports = mazeGenerationAnimations;

},{}],4:[function(require,module,exports){
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

},{"./animations/launchAnimations":1,"./animations/launchInstantAnimations":2,"./animations/mazeGenerationAnimations":3,"./getDistance":5,"./heatmapRenderer":6,"./node":7,"./pathfindingAlgorithms/unweightedSearchAlgorithm":9,"./pathfindingAlgorithms/weightedSearchAlgorithm":10,"./visionCone":11}],5:[function(require,module,exports){
function getDistance(nodeOne, nodeTwo) {
  let currentCoordinates = nodeOne.id.split("-");
  let targetCoordinates = nodeTwo.id.split("-");
  let x1 = parseInt(currentCoordinates[0]);
  let y1 = parseInt(currentCoordinates[1]);
  let x2 = parseInt(targetCoordinates[0]);
  let y2 = parseInt(targetCoordinates[1]);
  if (x2 < x1) {
    if (nodeOne.direction === "up") {
      return [1, ["f"], "up"];
    } else if (nodeOne.direction === "right") {
      return [2, ["l", "f"], "up"];
    } else if (nodeOne.direction === "left") {
      return [2, ["r", "f"], "up"];
    } else if (nodeOne.direction === "down") {
      return [3, ["r", "r", "f"], "up"];
    }
  } else if (x2 > x1) {
    if (nodeOne.direction === "up") {
      return [3, ["r", "r", "f"], "down"];
    } else if (nodeOne.direction === "right") {
      return [2, ["r", "f"], "down"];
    } else if (nodeOne.direction === "left") {
      return [2, ["l", "f"], "down"];
    } else if (nodeOne.direction === "down") {
      return [1, ["f"], "down"];
    }
  }
  if (y2 < y1) {
    if (nodeOne.direction === "up") {
      return [2, ["l", "f"], "left"];
    } else if (nodeOne.direction === "right") {
      return [3, ["l", "l", "f"], "left"];
    } else if (nodeOne.direction === "left") {
      return [1, ["f"], "left"];
    } else if (nodeOne.direction === "down") {
      return [2, ["r", "f"], "left"];
    }
  } else if (y2 > y1) {
    if (nodeOne.direction === "up") {
      return [2, ["r", "f"], "right"];
    } else if (nodeOne.direction === "right") {
      return [1, ["f"], "right"];
    } else if (nodeOne.direction === "left") {
      return [3, ["r", "r", "f"], "right"];
    } else if (nodeOne.direction === "down") {
      return [2, ["l", "f"], "right"];
    }
  }
}

module.exports = getDistance;

},{}],6:[function(require,module,exports){
/**
 * Heatmap color interpolation renderer
 * Generates blue gradient colors based on visit intensity
 */

// Gradient stops for blue-to-purple heatmap
const GRADIENT_STOPS = [
  { intensity: 0.00, color: { r: 255, g: 255, b: 255 } }, // White
  { intensity: 0.20, color: { r: 230, g: 242, b: 255 } }, // Very light blue
  { intensity: 0.47, color: { r: 153, g: 204, b: 255 } }, // Light blue
  { intensity: 0.73, color: { r: 102, g: 102, b: 255 } }, // Medium blue-purple
  { intensity: 0.87, color: { r: 128, g: 0, b: 204 } },   // Purple
  { intensity: 1.00, color: { r: 102, g: 0, b: 153 } }    // Dark purple (distinct from navy walls)
];

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Get heatmap color based on intensity value
 * @param {number} intensity - Intensity value between 0 and 1
 * @returns {string} RGB color string in format "rgb(r, g, b)"
 */
function getHeatmapColor(intensity) {
  // Clamp intensity to valid range
  intensity = Math.max(0, Math.min(1, intensity));
  
  // Find the two gradient stops to interpolate between
  let lowerStop = GRADIENT_STOPS[0];
  let upperStop = GRADIENT_STOPS[GRADIENT_STOPS.length - 1];
  
  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    if (intensity >= GRADIENT_STOPS[i].intensity && 
        intensity <= GRADIENT_STOPS[i + 1].intensity) {
      lowerStop = GRADIENT_STOPS[i];
      upperStop = GRADIENT_STOPS[i + 1];
      break;
    }
  }
  
  // Calculate interpolation factor
  const range = upperStop.intensity - lowerStop.intensity;
  const t = range === 0 ? 0 : (intensity - lowerStop.intensity) / range;
  
  // Interpolate RGB values
  const r = Math.round(lerp(lowerStop.color.r, upperStop.color.r, t));
  const g = Math.round(lerp(lowerStop.color.g, upperStop.color.g, t));
  const b = Math.round(lerp(lowerStop.color.b, upperStop.color.b, t));
  
  return `rgb(${r}, ${g}, ${b})`;
}

module.exports = getHeatmapColor;
},{}],7:[function(require,module,exports){
function Node(id, status) {
  this.id = id;
  this.status = status;
  this.previousNode = null;
  this.path = null;
  this.direction = null;
  this.storedDirection = null;
  this.distance = Infinity;
  this.totalDistance = Infinity;
  this.heuristicDistance = null;
  this.weight = 0;
  this.relatesToObject = false;
  this.overwriteObjectRelation = false;

  // Heatmap tracking properties
  this.visionVisitCount = 0;
  this.pathVisitCount = 0;
  this.totalVisitCount = 0;
  this.heatmapIntensity = 0;

  this.otherid = id;
  this.otherstatus = status;
  this.otherpreviousNode = null;
  this.otherpath = null;
  this.otherdirection = null;
  this.otherstoredDirection = null;
  this.otherdistance = Infinity;
  this.otherweight = 0;
  this.otherrelatesToObject = false;
  this.otheroverwriteObjectRelation = false;
}

module.exports = Node;

},{}],8:[function(require,module,exports){
function astar(nodes, start, target, nodesToAnimate, boardArray, name, heuristic, board) {
  if (!start || !target || start === target) {
    return false;
  }
  nodes[start].distance = 0;
  nodes[start].totalDistance = 0;
  nodes[start].direction = "up";
  let unvisitedNodes = Object.keys(nodes);
  while (unvisitedNodes.length) {
    let currentNode = closestNode(nodes, unvisitedNodes);
    while (currentNode.status === "wall" && unvisitedNodes.length) {
      currentNode = closestNode(nodes, unvisitedNodes)
    }
    if (currentNode.distance === Infinity) return false;
    
    // Don't cast vision during exploration - only during actual path traversal
    // Vision will be cast in board._animatePathNodes() as the agent actually moves
    
    nodesToAnimate.push(currentNode);
    currentNode.status = "visited";
    if (currentNode.id === target) {
      return "success!";
    }
    updateNeighbors(nodes, currentNode, boardArray, target, name, start, heuristic);
  }
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

function closestNode(nodes, unvisitedNodes) {
  let currentClosest, index;
  for (let i = 0; i < unvisitedNodes.length; i++) {
    if (!currentClosest || currentClosest.totalDistance > nodes[unvisitedNodes[i]].totalDistance) {
      currentClosest = nodes[unvisitedNodes[i]];
      index = i;
    } else if (currentClosest.totalDistance === nodes[unvisitedNodes[i]].totalDistance) {
      if (currentClosest.heuristicDistance > nodes[unvisitedNodes[i]].heuristicDistance) {
        currentClosest = nodes[unvisitedNodes[i]];
        index = i;
      }
    }
  }
  unvisitedNodes.splice(index, 1);
  return currentClosest;
}

function updateNeighbors(nodes, node, boardArray, target, name, start, heuristic) {
  let neighbors = getNeighbors(node.id, nodes, boardArray);
  for (let neighbor of neighbors) {
    if (target) {
      updateNode(node, nodes[neighbor], nodes[target], name, nodes, nodes[start], heuristic, boardArray);
    } else {
      updateNode(node, nodes[neighbor]);
    }
  }
}

function updateNode(currentNode, targetNode, actualTargetNode, name, nodes, actualStartNode, heuristic, boardArray) {
  let distance = getDistance(currentNode, targetNode);
  if (!targetNode.heuristicDistance) targetNode.heuristicDistance = manhattanDistance(targetNode, actualTargetNode);
  let distanceToCompare = currentNode.distance + targetNode.weight + distance[0];
  if (distanceToCompare < targetNode.distance) {
    targetNode.distance = distanceToCompare;
    targetNode.totalDistance = targetNode.distance + targetNode.heuristicDistance;
    targetNode.previousNode = currentNode.id;
    targetNode.path = distance[1];
    targetNode.direction = distance[2];
  }
}

function getNeighbors(id, nodes, boardArray) {
  let coordinates = id.split("-");
  let x = parseInt(coordinates[0]);
  let y = parseInt(coordinates[1]);
  let neighbors = [];
  let potentialNeighbor;
  if (boardArray[x - 1] && boardArray[x - 1][y]) {
    potentialNeighbor = `${(x - 1).toString()}-${y.toString()}`
    if (nodes[potentialNeighbor].status !== "wall" && nodes[potentialNeighbor].status !== "dummy-product") neighbors.push(potentialNeighbor);
  }
  if (boardArray[x + 1] && boardArray[x + 1][y]) {
    potentialNeighbor = `${(x + 1).toString()}-${y.toString()}`
    if (nodes[potentialNeighbor].status !== "wall" && nodes[potentialNeighbor].status !== "dummy-product") neighbors.push(potentialNeighbor);
  }
  if (boardArray[x][y - 1]) {
    potentialNeighbor = `${x.toString()}-${(y - 1).toString()}`
    if (nodes[potentialNeighbor].status !== "wall" && nodes[potentialNeighbor].status !== "dummy-product") neighbors.push(potentialNeighbor);
  }
  if (boardArray[x][y + 1]) {
    potentialNeighbor = `${x.toString()}-${(y + 1).toString()}`
    if (nodes[potentialNeighbor].status !== "wall" && nodes[potentialNeighbor].status !== "dummy-product") neighbors.push(potentialNeighbor);
  }
  // if (boardArray[x - 1] && boardArray[x - 1][y - 1]) {
  //   potentialNeighbor = `${(x - 1).toString()}-${(y - 1).toString()}`
  //   let potentialWallOne = `${(x - 1).toString()}-${y.toString()}`
  //   let potentialWallTwo = `${x.toString()}-${(y - 1).toString()}`
  //   if (nodes[potentialNeighbor].status !== "wall" && !(nodes[potentialWallOne].status === "wall" && nodes[potentialWallTwo].status === "wall")) neighbors.push(potentialNeighbor);
  // }
  // if (boardArray[x + 1] && boardArray[x + 1][y - 1]) {
  //   potentialNeighbor = `${(x + 1).toString()}-${(y - 1).toString()}`
  //   let potentialWallOne = `${(x + 1).toString()}-${y.toString()}`
  //   let potentialWallTwo = `${x.toString()}-${(y - 1).toString()}`
  //   if (nodes[potentialNeighbor].status !== "wall" && !(nodes[potentialWallOne].status === "wall" && nodes[potentialWallTwo].status === "wall")) neighbors.push(potentialNeighbor);
  // }
  // if (boardArray[x - 1] && boardArray[x - 1][y + 1]) {
  //   potentialNeighbor = `${(x - 1).toString()}-${(y + 1).toString()}`
  //   let potentialWallOne = `${(x - 1).toString()}-${y.toString()}`
  //   let potentialWallTwo = `${x.toString()}-${(y + 1).toString()}`
  //   if (nodes[potentialNeighbor].status !== "wall" && !(nodes[potentialWallOne].status === "wall" && nodes[potentialWallTwo].status === "wall")) neighbors.push(potentialNeighbor);
  // }
  // if (boardArray[x + 1] && boardArray[x + 1][y + 1]) {
  //   potentialNeighbor = `${(x + 1).toString()}-${(y + 1).toString()}`
  //   let potentialWallOne = `${(x + 1).toString()}-${y.toString()}`
  //   let potentialWallTwo = `${x.toString()}-${(y + 1).toString()}`
  //   if (nodes[potentialNeighbor].status !== "wall" && !(nodes[potentialWallOne].status === "wall" && nodes[potentialWallTwo].status === "wall")) neighbors.push(potentialNeighbor);
  // }
  return neighbors;
}


function getDistance(nodeOne, nodeTwo) {
  let currentCoordinates = nodeOne.id.split("-");
  let targetCoordinates = nodeTwo.id.split("-");
  let x1 = parseInt(currentCoordinates[0]);
  let y1 = parseInt(currentCoordinates[1]);
  let x2 = parseInt(targetCoordinates[0]);
  let y2 = parseInt(targetCoordinates[1]);
  if (x2 < x1 && y1 === y2) {
    if (nodeOne.direction === "up") {
      return [1, ["f"], "up"];
    } else if (nodeOne.direction === "right") {
      return [2, ["l", "f"], "up"];
    } else if (nodeOne.direction === "left") {
      return [2, ["r", "f"], "up"];
    } else if (nodeOne.direction === "down") {
      return [3, ["r", "r", "f"], "up"];
    } else if (nodeOne.direction === "up-right") {
      return [1.5, null, "up"];
    } else if (nodeOne.direction === "down-right") {
      return [2.5, null, "up"];
    } else if (nodeOne.direction === "up-left") {
      return [1.5, null, "up"];
    } else if (nodeOne.direction === "down-left") {
      return [2.5, null, "up"];
    }
  } else if (x2 > x1 && y1 === y2) {
    if (nodeOne.direction === "up") {
      return [3, ["r", "r", "f"], "down"];
    } else if (nodeOne.direction === "right") {
      return [2, ["r", "f"], "down"];
    } else if (nodeOne.direction === "left") {
      return [2, ["l", "f"], "down"];
    } else if (nodeOne.direction === "down") {
      return [1, ["f"], "down"];
    } else if (nodeOne.direction === "up-right") {
      return [2.5, null, "down"];
    } else if (nodeOne.direction === "down-right") {
      return [1.5, null, "down"];
    } else if (nodeOne.direction === "up-left") {
      return [2.5, null, "down"];
    } else if (nodeOne.direction === "down-left") {
      return [1.5, null, "down"];
    }
  }
  if (y2 < y1 && x1 === x2) {
    if (nodeOne.direction === "up") {
      return [2, ["l", "f"], "left"];
    } else if (nodeOne.direction === "right") {
      return [3, ["l", "l", "f"], "left"];
    } else if (nodeOne.direction === "left") {
      return [1, ["f"], "left"];
    } else if (nodeOne.direction === "down") {
      return [2, ["r", "f"], "left"];
    } else if (nodeOne.direction === "up-right") {
      return [2.5, null, "left"];
    } else if (nodeOne.direction === "down-right") {
      return [2.5, null, "left"];
    } else if (nodeOne.direction === "up-left") {
      return [1.5, null, "left"];
    } else if (nodeOne.direction === "down-left") {
      return [1.5, null, "left"];
    }
  } else if (y2 > y1 && x1 === x2) {
    if (nodeOne.direction === "up") {
      return [2, ["r", "f"], "right"];
    } else if (nodeOne.direction === "right") {
      return [1, ["f"], "right"];
    } else if (nodeOne.direction === "left") {
      return [3, ["r", "r", "f"], "right"];
    } else if (nodeOne.direction === "down") {
      return [2, ["l", "f"], "right"];
    } else if (nodeOne.direction === "up-right") {
      return [1.5, null, "right"];
    } else if (nodeOne.direction === "down-right") {
      return [1.5, null, "right"];
    } else if (nodeOne.direction === "up-left") {
      return [2.5, null, "right"];
    } else if (nodeOne.direction === "down-left") {
      return [2.5, null, "right"];
    }
  } /*else if (x2 < x1 && y2 < y1) {
    if (nodeOne.direction === "up") {
      return [1.5, ["f"], "up-left"];
    } else if (nodeOne.direction === "right") {
      return [2.5, ["l", "f"], "up-left"];
    } else if (nodeOne.direction === "left") {
      return [1.5, ["r", "f"], "up-left"];
    } else if (nodeOne.direction === "down") {
      return [2.5, ["r", "r", "f"], "up-left"];
    } else if (nodeOne.direction === "up-right") {
      return [2, null, "up-left"];
    } else if (nodeOne.direction === "down-right") {
      return [3, null, "up-left"];
    } else if (nodeOne.direction === "up-left") {
      return [1, null, "up-left"];
    } else if (nodeOne.direction === "down-left") {
      return [2, null, "up-left"];
    }
  } else if (x2 < x1 && y2 > y1) {
    if (nodeOne.direction === "up") {
      return [1.5, ["f"], "up-right"];
    } else if (nodeOne.direction === "right") {
      return [1.5, ["l", "f"], "up-right"];
    } else if (nodeOne.direction === "left") {
      return [2.5, ["r", "f"], "up-right"];
    } else if (nodeOne.direction === "down") {
      return [2.5, ["r", "r", "f"], "up-right"];
    } else if (nodeOne.direction === "up-right") {
      return [1, null, "up-right"];
    } else if (nodeOne.direction === "down-right") {
      return [2, null, "up-right"];
    } else if (nodeOne.direction === "up-left") {
      return [2, null, "up-right"];
    } else if (nodeOne.direction === "down-left") {
      return [3, null, "up-right"];
    }
  } else if (x2 > x1 && y2 > y1) {
    if (nodeOne.direction === "up") {
      return [2.5, ["f"], "down-right"];
    } else if (nodeOne.direction === "right") {
      return [1.5, ["l", "f"], "down-right"];
    } else if (nodeOne.direction === "left") {
      return [2.5, ["r", "f"], "down-right"];
    } else if (nodeOne.direction === "down") {
      return [1.5, ["r", "r", "f"], "down-right"];
    } else if (nodeOne.direction === "up-right") {
      return [2, null, "down-right"];
    } else if (nodeOne.direction === "down-right") {
      return [1, null, "down-right"];
    } else if (nodeOne.direction === "up-left") {
      return [3, null, "down-right"];
    } else if (nodeOne.direction === "down-left") {
      return [2, null, "down-right"];
    }
  } else if (x2 > x1 && y2 < y1) {
    if (nodeOne.direction === "up") {
      return [2.5, ["f"], "down-left"];
    } else if (nodeOne.direction === "right") {
      return [2.5, ["l", "f"], "down-left"];
    } else if (nodeOne.direction === "left") {
      return [1.5, ["r", "f"], "down-left"];
    } else if (nodeOne.direction === "down") {
      return [1.5, ["r", "r", "f"], "down-left"];
    } else if (nodeOne.direction === "up-right") {
      return [3, null, "down-left"];
    } else if (nodeOne.direction === "down-right") {
      return [2, null, "down-left"];
    } else if (nodeOne.direction === "up-left") {
      return [2, null, "down-left"];
    } else if (nodeOne.direction === "down-left") {
      return [1, null, "down-left"];
    }
  }*/
}

function manhattanDistance(nodeOne, nodeTwo) {
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



module.exports = astar;

},{"../visionCone":11}],9:[function(require,module,exports){
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

},{"../visionCone":11}],10:[function(require,module,exports){
const astar = require("./astar");

function weightedSearchAlgorithm(nodes, start, target, nodesToAnimate, boardArray, name, heuristic, board) {
  if (name === "astar") return astar(nodes, start, target, nodesToAnimate, boardArray, name, heuristic, board)
  if (!start || !target || start === target) {
    return false;
  }
  nodes[start].distance = 0;
  nodes[start].direction = "right";
  let unvisitedNodes = Object.keys(nodes);
  while (unvisitedNodes.length) {
    let currentNode = closestNode(nodes, unvisitedNodes);
    while ((currentNode.status === "wall" || currentNode.status === "dummy-product") && unvisitedNodes.length) {
      currentNode = closestNode(nodes, unvisitedNodes)
    }
    if (currentNode.distance === Infinity) {
      return false;
    }
    
    // Don't cast vision during exploration - only during actual path traversal
    // Vision will be cast in board._animatePathNodes() as the agent actually moves
    
    nodesToAnimate.push(currentNode);
    currentNode.status = "visited";
    if (currentNode.id === target) return "success!";
    if (name === "CLA" || name === "greedy") {
      updateNeighbors(nodes, currentNode, boardArray, target, name, start, heuristic);
    } else if (name === "dijkstra") {
      updateNeighbors(nodes, currentNode, boardArray);
    }
  }
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

function closestNode(nodes, unvisitedNodes) {
  let currentClosest, index;
  for (let i = 0; i < unvisitedNodes.length; i++) {
    if (!currentClosest || currentClosest.distance > nodes[unvisitedNodes[i]].distance) {
      currentClosest = nodes[unvisitedNodes[i]];
      index = i;
    }
  }
  unvisitedNodes.splice(index, 1);
  return currentClosest;
}

function updateNeighbors(nodes, node, boardArray, target, name, start, heuristic) {
  let neighbors = getNeighbors(node.id, nodes, boardArray);
  for (let neighbor of neighbors) {
    if (target) {
      updateNode(node, nodes[neighbor], nodes[target], name, nodes, nodes[start], heuristic, boardArray);
    } else {
      updateNode(node, nodes[neighbor]);
    }
  }
}

function averageNumberOfNodesBetween(currentNode) {
  let num = 0;
  while (currentNode.previousNode) {
    num++;
    currentNode = currentNode.previousNode;
  }
  return num;
}


function updateNode(currentNode, targetNode, actualTargetNode, name, nodes, actualStartNode, heuristic, boardArray) {
  let distance = getDistance(currentNode, targetNode);
  let distanceToCompare;
  if (actualTargetNode && name === "CLA") {
    let weight = targetNode.weight === 15 ? 15 : 1;
    if (heuristic === "manhattanDistance") {
      distanceToCompare = currentNode.distance + (distance[0] + weight) * manhattanDistance(targetNode, actualTargetNode);
    } else if (heuristic === "poweredManhattanDistance") {
      distanceToCompare = currentNode.distance + targetNode.weight + distance[0] + Math.pow(manhattanDistance(targetNode, actualTargetNode), 2);
    } else if (heuristic === "extraPoweredManhattanDistance") {
      distanceToCompare = currentNode.distance + (distance[0] + weight) * Math.pow(manhattanDistance(targetNode, actualTargetNode), 7);
    }
    let startNodeManhattanDistance = manhattanDistance(actualStartNode, actualTargetNode);
  } else if (actualTargetNode && name === "greedy") {
    distanceToCompare = targetNode.weight + distance[0] + manhattanDistance(targetNode, actualTargetNode);
  } else {
    distanceToCompare = currentNode.distance + targetNode.weight + distance[0];
  }
  if (distanceToCompare < targetNode.distance) {
    targetNode.distance = distanceToCompare;
    targetNode.previousNode = currentNode.id;
    targetNode.path = distance[1];
    targetNode.direction = distance[2];
  }
}

function getNeighbors(id, nodes, boardArray) {
  let coordinates = id.split("-");
  let x = parseInt(coordinates[0]);
  let y = parseInt(coordinates[1]);
  let neighbors = [];
  let potentialNeighbor;
  if (boardArray[x - 1] && boardArray[x - 1][y]) {
    potentialNeighbor = `${(x - 1).toString()}-${y.toString()}`
    if (nodes[potentialNeighbor].status !== "wall" && nodes[potentialNeighbor].status !== "dummy-product") neighbors.push(potentialNeighbor);
  }
  if (boardArray[x + 1] && boardArray[x + 1][y]) {
    potentialNeighbor = `${(x + 1).toString()}-${y.toString()}`
    if (nodes[potentialNeighbor].status !== "wall" && nodes[potentialNeighbor].status !== "dummy-product") neighbors.push(potentialNeighbor);
  }
  if (boardArray[x][y - 1]) {
    potentialNeighbor = `${x.toString()}-${(y - 1).toString()}`
    if (nodes[potentialNeighbor].status !== "wall" && nodes[potentialNeighbor].status !== "dummy-product") neighbors.push(potentialNeighbor);
  }
  if (boardArray[x][y + 1]) {
    potentialNeighbor = `${x.toString()}-${(y + 1).toString()}`
    if (nodes[potentialNeighbor].status !== "wall" && nodes[potentialNeighbor].status !== "dummy-product") neighbors.push(potentialNeighbor);
  }
  return neighbors;
}


function getDistance(nodeOne, nodeTwo) {
  let currentCoordinates = nodeOne.id.split("-");
  let targetCoordinates = nodeTwo.id.split("-");
  let x1 = parseInt(currentCoordinates[0]);
  let y1 = parseInt(currentCoordinates[1]);
  let x2 = parseInt(targetCoordinates[0]);
  let y2 = parseInt(targetCoordinates[1]);
  if (x2 < x1) {
    if (nodeOne.direction === "up") {
      return [1, ["f"], "up"];
    } else if (nodeOne.direction === "right") {
      return [2, ["l", "f"], "up"];
    } else if (nodeOne.direction === "left") {
      return [2, ["r", "f"], "up"];
    } else if (nodeOne.direction === "down") {
      return [3, ["r", "r", "f"], "up"];
    }
  } else if (x2 > x1) {
    if (nodeOne.direction === "up") {
      return [3, ["r", "r", "f"], "down"];
    } else if (nodeOne.direction === "right") {
      return [2, ["r", "f"], "down"];
    } else if (nodeOne.direction === "left") {
      return [2, ["l", "f"], "down"];
    } else if (nodeOne.direction === "down") {
      return [1, ["f"], "down"];
    }
  }
  if (y2 < y1) {
    if (nodeOne.direction === "up") {
      return [2, ["l", "f"], "left"];
    } else if (nodeOne.direction === "right") {
      return [3, ["l", "l", "f"], "left"];
    } else if (nodeOne.direction === "left") {
      return [1, ["f"], "left"];
    } else if (nodeOne.direction === "down") {
      return [2, ["r", "f"], "left"];
    }
  } else if (y2 > y1) {
    if (nodeOne.direction === "up") {
      return [2, ["r", "f"], "right"];
    } else if (nodeOne.direction === "right") {
      return [1, ["f"], "right"];
    } else if (nodeOne.direction === "left") {
      return [3, ["r", "r", "f"], "right"];
    } else if (nodeOne.direction === "down") {
      return [2, ["l", "f"], "right"];
    }
  }
}

function manhattanDistance(nodeOne, nodeTwo) {
  let nodeOneCoordinates = nodeOne.id.split("-").map(ele => parseInt(ele));
  let nodeTwoCoordinates = nodeTwo.id.split("-").map(ele => parseInt(ele));
  let xChange = Math.abs(nodeOneCoordinates[0] - nodeTwoCoordinates[0]);
  let yChange = Math.abs(nodeOneCoordinates[1] - nodeTwoCoordinates[1]);
  return (xChange + yChange);
}

function weightedManhattanDistance(nodeOne, nodeTwo, nodes) {
  let nodeOneCoordinates = nodeOne.id.split("-").map(ele => parseInt(ele));
  let nodeTwoCoordinates = nodeTwo.id.split("-").map(ele => parseInt(ele));
  let xChange = Math.abs(nodeOneCoordinates[0] - nodeTwoCoordinates[0]);
  let yChange = Math.abs(nodeOneCoordinates[1] - nodeTwoCoordinates[1]);

  if (nodeOneCoordinates[0] < nodeTwoCoordinates[0] && nodeOneCoordinates[1] < nodeTwoCoordinates[1]) {
    let additionalxChange = 0,
        additionalyChange = 0;
    for (let currentx = nodeOneCoordinates[0]; currentx <= nodeTwoCoordinates[0]; currentx++) {
      let currentId = `${currentx}-${nodeOne.id.split("-")[1]}`;
      let currentNode = nodes[currentId];
      additionalxChange += currentNode.weight;
    }
    for (let currenty = nodeOneCoordinates[1]; currenty <= nodeTwoCoordinates[1]; currenty++) {
      let currentId = `${nodeTwoCoordinates[0]}-${currenty}`;
      let currentNode = nodes[currentId];
      additionalyChange += currentNode.weight;
    }

    let otherAdditionalxChange = 0,
        otherAdditionalyChange = 0;
    for (let currenty = nodeOneCoordinates[1]; currenty <= nodeTwoCoordinates[1]; currenty++) {
      let currentId = `${nodeOne.id.split("-")[0]}-${currenty}`;
      let currentNode = nodes[currentId];
      additionalyChange += currentNode.weight;
    }
    for (let currentx = nodeOneCoordinates[0]; currentx <= nodeTwoCoordinates[0]; currentx++) {
      let currentId = `${currentx}-${nodeTwoCoordinates[1]}`;
      let currentNode = nodes[currentId];
      additionalxChange += currentNode.weight;
    }

    if (additionalxChange + additionalyChange < otherAdditionalxChange + otherAdditionalyChange) {
      xChange += additionalxChange;
      yChange += additionalyChange;
    } else {
      xChange += otherAdditionalxChange;
      yChange += otherAdditionalyChange;
    }
  } else if (nodeOneCoordinates[0] < nodeTwoCoordinates[0] && nodeOneCoordinates[1] >= nodeTwoCoordinates[1]) {
    let additionalxChange = 0,
        additionalyChange = 0;
    for (let currentx = nodeOneCoordinates[0]; currentx <= nodeTwoCoordinates[0]; currentx++) {
      let currentId = `${currentx}-${nodeOne.id.split("-")[1]}`;
      let currentNode = nodes[currentId];
      additionalxChange += currentNode.weight;
    }
    for (let currenty = nodeOneCoordinates[1]; currenty >= nodeTwoCoordinates[1]; currenty--) {
      let currentId = `${nodeTwoCoordinates[0]}-${currenty}`;
      let currentNode = nodes[currentId];
      additionalyChange += currentNode.weight;
    }

    let otherAdditionalxChange = 0,
        otherAdditionalyChange = 0;
    for (let currenty = nodeOneCoordinates[1]; currenty >= nodeTwoCoordinates[1]; currenty--) {
      let currentId = `${nodeOne.id.split("-")[0]}-${currenty}`;
      let currentNode = nodes[currentId];
      additionalyChange += currentNode.weight;
    }
    for (let currentx = nodeOneCoordinates[0]; currentx <= nodeTwoCoordinates[0]; currentx++) {
      let currentId = `${currentx}-${nodeTwoCoordinates[1]}`;
      let currentNode = nodes[currentId];
      additionalxChange += currentNode.weight;
    }

    if (additionalxChange + additionalyChange < otherAdditionalxChange + otherAdditionalyChange) {
      xChange += additionalxChange;
      yChange += additionalyChange;
    } else {
      xChange += otherAdditionalxChange;
      yChange += otherAdditionalyChange;
    }
  } else if (nodeOneCoordinates[0] >= nodeTwoCoordinates[0] && nodeOneCoordinates[1] < nodeTwoCoordinates[1]) {
    let additionalxChange = 0,
        additionalyChange = 0;
    for (let currentx = nodeOneCoordinates[0]; currentx >= nodeTwoCoordinates[0]; currentx--) {
      let currentId = `${currentx}-${nodeOne.id.split("-")[1]}`;
      let currentNode = nodes[currentId];
      additionalxChange += currentNode.weight;
    }
    for (let currenty = nodeOneCoordinates[1]; currenty <= nodeTwoCoordinates[1]; currenty++) {
      let currentId = `${nodeTwoCoordinates[0]}-${currenty}`;
      let currentNode = nodes[currentId];
      additionalyChange += currentNode.weight;
    }

    let otherAdditionalxChange = 0,
        otherAdditionalyChange = 0;
    for (let currenty = nodeOneCoordinates[1]; currenty <= nodeTwoCoordinates[1]; currenty++) {
      let currentId = `${nodeOne.id.split("-")[0]}-${currenty}`;
      let currentNode = nodes[currentId];
      additionalyChange += currentNode.weight;
    }
    for (let currentx = nodeOneCoordinates[0]; currentx >= nodeTwoCoordinates[0]; currentx--) {
      let currentId = `${currentx}-${nodeTwoCoordinates[1]}`;
      let currentNode = nodes[currentId];
      additionalxChange += currentNode.weight;
    }

    if (additionalxChange + additionalyChange < otherAdditionalxChange + otherAdditionalyChange) {
      xChange += additionalxChange;
      yChange += additionalyChange;
    } else {
      xChange += otherAdditionalxChange;
      yChange += otherAdditionalyChange;
    }
  } else if (nodeOneCoordinates[0] >= nodeTwoCoordinates[0] && nodeOneCoordinates[1] >= nodeTwoCoordinates[1]) {
      let additionalxChange = 0,
          additionalyChange = 0;
      for (let currentx = nodeOneCoordinates[0]; currentx >= nodeTwoCoordinates[0]; currentx--) {
        let currentId = `${currentx}-${nodeOne.id.split("-")[1]}`;
        let currentNode = nodes[currentId];
        additionalxChange += currentNode.weight;
      }
      for (let currenty = nodeOneCoordinates[1]; currenty >= nodeTwoCoordinates[1]; currenty--) {
        let currentId = `${nodeTwoCoordinates[0]}-${currenty}`;
        let currentNode = nodes[currentId];
        additionalyChange += currentNode.weight;
      }

      let otherAdditionalxChange = 0,
          otherAdditionalyChange = 0;
      for (let currenty = nodeOneCoordinates[1]; currenty >= nodeTwoCoordinates[1]; currenty--) {
        let currentId = `${nodeOne.id.split("-")[0]}-${currenty}`;
        let currentNode = nodes[currentId];
        additionalyChange += currentNode.weight;
      }
      for (let currentx = nodeOneCoordinates[0]; currentx >= nodeTwoCoordinates[0]; currentx--) {
        let currentId = `${currentx}-${nodeTwoCoordinates[1]}`;
        let currentNode = nodes[currentId];
        additionalxChange += currentNode.weight;
      }

      if (additionalxChange + additionalyChange < otherAdditionalxChange + otherAdditionalyChange) {
        xChange += additionalxChange;
        yChange += additionalyChange;
      } else {
        xChange += otherAdditionalxChange;
        yChange += otherAdditionalyChange;
      }
    }

  return xChange + yChange;


}

module.exports = weightedSearchAlgorithm;

},{"../visionCone":11,"./astar":8}],11:[function(require,module,exports){
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
},{}]},{},[4]);
