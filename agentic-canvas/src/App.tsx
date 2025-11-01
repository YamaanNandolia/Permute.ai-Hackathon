import { useEffect, useState } from 'react';
import './App.css';
import { useCanvasStore } from './state/useCanvasStore';
import { ShapeType } from './types';
import { CanvasStage } from './canvas/CanvasStage';
import { useAgentEngine } from './agents/useAgentEngine';
import {
  GridAlignmentAgent,
  CollisionAvoidanceAgent,
  AutoArrangerAgent
} from './agents';

function App() {
  const {
    shapes,
    addShape,
    deleteShape,
    selectedShapeIds,
    clearSelection,
    canvas,
    setZoom,
    setPan,
    setSnapToGrid,
    agentConfig,
    setAgentEnabled,
    setAgentAutoRun,
  } = useCanvasStore();

  // Initialize agent engine
  const { registerAgent, triggerAgent, triggerAgents, getAgents } = useAgentEngine();
  
  // Track enabled agents
  const [enabledAgents, setEnabledAgents] = useState<Set<string>>(new Set());
  const [showAgentPanel, setShowAgentPanel] = useState(false);

  // Register all agents on mount
  useEffect(() => {
    registerAgent(new GridAlignmentAgent());
    registerAgent(new CollisionAvoidanceAgent());
    registerAgent(new AutoArrangerAgent());
    console.log('All agents registered');
  }, []);

  // Initialize with sample shapes on first load
  useEffect(() => {
    if (shapes.length === 0) {
      console.log('Initializing demo shapes...');
      
      // Add a zone (checkout area)
      addShape({
        type: ShapeType.ZONE,
        x: 50,
        y: 50,
        width: 300,
        height: 200,
        rotation: 0,
        fill: '#FFC107',
        stroke: '#F57C00',
        strokeWidth: 2,
        opacity: 0.2,
        draggable: true,
        selectable: true,
        layer: 0,
        metadata: {
          zoneType: 'checkout',
          capacity: 5,
        },
      });

      // Add walls
      addShape({
        type: ShapeType.WALL,
        x: 400,
        y: 100,
        width: 300,
        height: 20,
        rotation: 0,
        fill: '#888888',
        stroke: '#000000',
        strokeWidth: 2,
        opacity: 1,
        draggable: true,
        selectable: true,
        layer: 1,
        metadata: {
          isLoadBearing: false,
        },
      });

      addShape({
        type: ShapeType.WALL,
        x: 400,
        y: 100,
        width: 20,
        height: 200,
        rotation: 0,
        fill: '#888888',
        stroke: '#000000',
        strokeWidth: 2,
        opacity: 1,
        draggable: true,
        selectable: true,
        layer: 1,
        metadata: {
          isLoadBearing: true,
        },
      });

      // Add products
      addShape({
        type: ShapeType.PRODUCT,
        x: 500,
        y: 200,
        width: 80,
        height: 80,
        rotation: 0,
        fill: '#4CAF50',
        stroke: '#2E7D32',
        strokeWidth: 2,
        opacity: 1,
        draggable: true,
        selectable: true,
        layer: 2,
        metadata: {
          productId: 'PROD-001',
          name: 'Electronics',
          category: 'Tech',
          visibility: 85,
        },
      });

      addShape({
        type: ShapeType.PRODUCT,
        x: 600,
        y: 350,
        width: 70,
        height: 70,
        rotation: 15,
        fill: '#2196F3',
        stroke: '#1565C0',
        strokeWidth: 2,
        opacity: 1,
        draggable: true,
        selectable: true,
        layer: 2,
        metadata: {
          productId: 'PROD-002',
          name: 'Clothing',
          category: 'Fashion',
          visibility: 92,
        },
      });

      // Add a rectangle
      addShape({
        type: ShapeType.RECTANGLE,
        x: 150,
        y: 350,
        width: 100,
        height: 60,
        rotation: 0,
        fill: '#9C27B0',
        stroke: '#6A1B9A',
        strokeWidth: 2,
        opacity: 0.8,
        draggable: true,
        selectable: true,
        layer: 1,
        metadata: {},
      });

      console.log('Demo shapes initialized');
    }
  }, []);

  const handleAddProduct = () => {
    addShape({
      type: ShapeType.PRODUCT,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      width: 60,
      height: 60,
      rotation: 0,
      fill: '#FF5722',
      stroke: '#D84315',
      strokeWidth: 2,
      opacity: 1,
      draggable: true,
      selectable: true,
      layer: 2,
      metadata: {
        productId: `PROD-${Date.now()}`,
        name: `Product ${shapes.length + 1}`,
        category: 'New',
        visibility: Math.floor(Math.random() * 100),
      },
    });
  };

  const handleAddWall = () => {
    addShape({
      type: ShapeType.WALL,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      width: 150,
      height: 20,
      rotation: 0,
      fill: '#888888',
      stroke: '#000000',
      strokeWidth: 2,
      opacity: 1,
      draggable: true,
      selectable: true,
      layer: 1,
      metadata: {
        isLoadBearing: false,
      },
    });
  };

  const handleDeleteSelected = () => {
    selectedShapeIds.forEach((id) => deleteShape(id));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan(0, 0);
  };

  const handleToggleAgent = (agentId: string) => {
    setEnabledAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  const handleTriggerAgent = async (agentId: string) => {
    console.log(`Manually triggering agent: ${agentId}`);
    await triggerAgent(agentId);
  };

  const handleTriggerAllAgents = async () => {
    console.log('Manually triggering all agents');
    await triggerAgents();
  };

  const handleCreateTestScenario = (scenario: string) => {
    switch (scenario) {
      case 'grid-misalignment':
        // Create products at odd positions to test grid alignment
        addShape({
          type: ShapeType.PRODUCT,
          x: 123.5,
          y: 234.7,
          width: 60,
          height: 60,
          rotation: 0,
          fill: '#FF5722',
          stroke: '#D84315',
          strokeWidth: 2,
          opacity: 1,
          draggable: true,
          selectable: true,
          layer: 2,
          metadata: { productId: 'TEST-GRID-1' },
        });
        break;

      case 'wall-collision':
        // Create a product that overlaps with a wall
        const walls = shapes.filter(s => s.type === ShapeType.WALL);
        if (walls.length > 0) {
          const wall = walls[0];
          addShape({
            type: ShapeType.PRODUCT,
            x: wall.x + 10,
            y: wall.y - 30,
            width: 60,
            height: 60,
            rotation: 0,
            fill: '#E91E63',
            stroke: '#880E4F',
            strokeWidth: 2,
            opacity: 1,
            draggable: true,
            selectable: true,
            layer: 2,
            metadata: { productId: 'TEST-COLLISION-1' },
          });
        }
        break;

      case 'scattered-products':
        // Create multiple scattered products for auto-arranger
        for (let i = 0; i < 6; i++) {
          addShape({
            type: ShapeType.PRODUCT,
            x: Math.random() * 800 + 100,
            y: Math.random() * 500 + 100,
            width: 50 + Math.random() * 30,
            height: 50 + Math.random() * 30,
            rotation: Math.random() * 30 - 15,
            fill: `hsl(${Math.random() * 360}, 70%, 60%)`,
            stroke: '#333',
            strokeWidth: 2,
            opacity: 1,
            draggable: true,
            selectable: true,
            layer: 2,
            metadata: { productId: `SCATTERED-${i}` },
          });
        }
        break;
    }
  };

  const agents = getAgents();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Toolbar */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <h2 style={{ margin: 0, marginRight: '20px', fontSize: '18px' }}>
          React-Konva Floor Plan Designer
        </h2>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleAddProduct}
            style={{ padding: '6px 12px', cursor: 'pointer' }}
          >
            ➕ Add Product
          </button>
          <button 
            onClick={handleAddWall}
            style={{ padding: '6px 12px', cursor: 'pointer' }}
          >
            🧱 Add Wall
          </button>
          <button 
            onClick={handleDeleteSelected}
            disabled={selectedShapeIds.length === 0}
            style={{ 
              padding: '6px 12px', 
              cursor: selectedShapeIds.length > 0 ? 'pointer' : 'not-allowed',
              opacity: selectedShapeIds.length > 0 ? 1 : 0.5
            }}
          >
            🗑️ Delete Selected
          </button>
          <button 
            onClick={clearSelection}
            style={{ padding: '6px 12px', cursor: 'pointer' }}
          >
            Clear Selection
          </button>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={() => setZoom(Math.min(canvas.zoom * 1.2, 5))}
            style={{ padding: '6px 12px', cursor: 'pointer' }}
          >
            ➕ Zoom
          </button>
          <span style={{ fontSize: '14px', minWidth: '60px', textAlign: 'center' }}>
            {Math.round(canvas.zoom * 100)}%
          </span>
          <button 
            onClick={() => setZoom(Math.max(canvas.zoom / 1.2, 0.1))}
            style={{ padding: '6px 12px', cursor: 'pointer' }}
          >
            ➖ Zoom
          </button>
          <button 
            onClick={handleResetView}
            style={{ padding: '6px 12px', cursor: 'pointer' }}
          >
            🔄 Reset View
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={canvas.snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
            />
            Snap to Grid
          </label>
        </div>
      </div>

      {/* Status Bar */}
      <div style={{
        padding: '8px 20px',
        backgroundColor: '#fafafa',
        borderBottom: '1px solid #e0e0e0',
        fontSize: '13px',
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ marginRight: '20px' }}>📦 Shapes: {shapes.length}</span>
          <span style={{ marginRight: '20px' }}>✓ Selected: {selectedShapeIds.length}</span>
          <span style={{ marginRight: '20px' }}>📏 Grid: {canvas.gridSize}px</span>
          <span style={{ color: '#999' }}>
            💡 Tip: Drag shapes, scroll to zoom, Shift+drag to pan, Delete key to remove
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ marginRight: '10px' }}>
            🤖 Agents: {agents.length} registered
          </span>
          <button
            onClick={() => setShowAgentPanel(!showAgentPanel)}
            style={{
              padding: '4px 12px',
              cursor: 'pointer',
              backgroundColor: showAgentPanel ? '#e3f2fd' : '#fff',
              border: '1px solid #2196F3',
              borderRadius: '4px',
              color: '#2196F3',
              fontWeight: '500'
            }}
          >
            {showAgentPanel ? '▼' : '▶'} Agent Controls
          </button>
        </div>
      </div>

      {/* Agent Control Panel */}
      {showAgentPanel && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#f5f5f5',
          borderBottom: '2px solid #e0e0e0',
        }}>
          <div style={{ marginBottom: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', width: '100%' }}>
              🤖 Agent Controls
            </h3>
            
            {/* Global Agent Controls */}
            <div style={{
              padding: '10px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              border: '1px solid #ddd',
              flex: '1',
              minWidth: '250px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>Global Settings</h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '6px' }}>
                <input
                  type="checkbox"
                  checked={agentConfig.enabled}
                  onChange={(e) => setAgentEnabled(e.target.checked)}
                />
                Enable Agents System
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={agentConfig.autoRun}
                  onChange={(e) => setAgentAutoRun(e.target.checked)}
                  disabled={!agentConfig.enabled}
                />
                Auto-run on Changes
              </label>
              <button
                onClick={handleTriggerAllAgents}
                disabled={!agentConfig.enabled}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  cursor: agentConfig.enabled ? 'pointer' : 'not-allowed',
                  opacity: agentConfig.enabled ? 1 : 0.5,
                  width: '100%',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}
              >
                ▶️ Run All Agents
              </button>
            </div>

            {/* Individual Agent Controls */}
            {agents.map((agent) => (
              <div
                key={agent.id}
                style={{
                  padding: '10px',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  flex: '1',
                  minWidth: '200px'
                }}
              >
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ fontSize: '13px' }}>{agent.name}</strong>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                    {agent.description}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                    Priority: {agent.priority}
                  </div>
                </div>
                <button
                  onClick={() => handleTriggerAgent(agent.id)}
                  disabled={!agentConfig.enabled}
                  style={{
                    padding: '4px 10px',
                    cursor: agentConfig.enabled ? 'pointer' : 'not-allowed',
                    opacity: agentConfig.enabled ? 1 : 0.5,
                    width: '100%',
                    fontSize: '12px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px'
                  }}
                >
                  ▶️ Run {agent.name}
                </button>
              </div>
            ))}
          </div>

          {/* Test Scenarios */}
          <div style={{
            padding: '10px',
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            border: '1px solid #ffc107',
            marginTop: '10px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#856404' }}>
              🧪 Test Scenarios
            </h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleCreateTestScenario('grid-misalignment')}
                style={{ padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}
              >
                Add Misaligned Shape
              </button>
              <button
                onClick={() => handleCreateTestScenario('wall-collision')}
                style={{ padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}
              >
                Create Wall Collision
              </button>
              <button
                onClick={() => handleCreateTestScenario('scattered-products')}
                style={{ padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}
              >
                Add Scattered Products
              </button>
            </div>
            <div style={{ fontSize: '11px', color: '#856404', marginTop: '6px' }}>
              💡 Create test scenarios then run agents to see them in action!
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#ffffff'
      }}>
        <CanvasStage />
      </div>
    </div>
  );
}

export default App;
