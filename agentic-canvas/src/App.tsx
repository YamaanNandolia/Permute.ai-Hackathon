import { useEffect } from 'react';
import './App.css';
import { useCanvasStore } from './state/useCanvasStore';
import { ShapeType } from './types';
import { CanvasStage } from './canvas/CanvasStage';

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
  } = useCanvasStore();

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
        color: '#666'
      }}>
        <span style={{ marginRight: '20px' }}>📦 Shapes: {shapes.length}</span>
        <span style={{ marginRight: '20px' }}>✓ Selected: {selectedShapeIds.length}</span>
        <span style={{ marginRight: '20px' }}>📏 Grid: {canvas.gridSize}px</span>
        <span style={{ color: '#999' }}>
          💡 Tip: Drag shapes, scroll to zoom, Shift+drag to pan, Delete key to remove
        </span>
      </div>

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
