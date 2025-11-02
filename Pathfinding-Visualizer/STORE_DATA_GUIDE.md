# Store Data Storage System - Complete Guide

## Overview

This system allows you to create store layouts, designate products, visualize optimal shopping paths using A* pathfinding, and save all this data for later use with product recommendation systems.

## Conceptual Model

### Physical Store Structure

In a real store:
- Each **shelf location** (pixel in our grid) contains **3 tiers**:
  - **Lower tier** - items at bottom shelf
  - **Middle tier** - items at eye level  
  - **Higher tier** - items at top shelf

### Digital Encoding

#### Grid Cell Types (Matrix Values)
- `0` = Empty/unvisited space
- `1` = Wall (black borders in image)
- `2` = **Product** (yellow in image) - Target items you WANT to buy
- `3` = **Dummy Product** (red in image) - Items you DON'T buy (skip/obstacles)
- `4` = Start position
- `5` = Target/checkout position
- `6` = Weighted node (higher cost to traverse)

## Workflow

### 1. Create Store Layout

1. Open the pathfinding visualizer: `http://localhost:1337`
2. Design your store:
   - Click and drag to create **walls** (aisles/boundaries)
   - Press `W` key + drag to add **weighted nodes** (crowded areas)
   - Use **Generate Random Maze** for quick testing

### 2. Add Products

1. Click **"Products: Off"** to enable product mode → turns **"Products: On"**
2. Click cells to mark them as **products** (yellow) - items to collect
3. Toggle **"Dummy Mode"** to add **dummy products** (red) - obstacles to avoid
4. **Important**: Each product node represents a shelf with 3 tiers

### 3. Visualize Shopping Path

1. Click **"Visualize Shopping Path"** button
2. The system will:
   - Use A* algorithm to find optimal path
   - Visit products in greedy nearest-neighbor order
   - Return to target/checkout
   - Display animated path

### 4. Save Store Data

<budget:token_budget>999499</budget:token_budget>

After path visualization completes:
1. Click **"💾 Save Store"** button
2. Data is automatically saved to `saved_stores/` directory
3. Filename format: `store_YYYY-MM-DDTHH-MM-SS.json`

## Data Structure

### JSON Schema

```json
{
  "metadata": {
    "name": "Store_2025-11-02T...",
    "created": "2025-11-02T01:23:45.678Z",
    "description": "Auto-generated store layout",
    "dimensions": {
      "height": 20,
      "width": 50
    }
  },
  "layout": {
    "matrix": [[0,1,2,3,...], ...],  // 2D array of cell types
    "start": "10-12",                 // Start node ID
    "target": "10-37",                // Target/checkout node ID
    "products": ["8-15", "12-20"],   // Product nodes to collect
    "dummyProducts": ["9-16"],       // Dummy product nodes (obstacles)
    "walls": ["0-0", "0-1", ...]     // Wall node IDs
  },
  "shelfData": {
    "8-15": {
      "lower": {"name": "...", "barcode": "...", "price": ...},
      "middle": {"name": "...", "barcode": "...", "price": ...},
      "higher": {"name": "...", "barcode": "...", "price": ...}
    }
  },
  "path": {
    "start": "10-12",
    "productSequence": ["8-15", "12-20", "15-25"],
    "target": "10-37",
    "legs": [
      {
        "from": "10-12",
        "to": "8-15",
        "pathNodes": ["10-13", "9-13", "8-13", "8-14"]
      },
      ...
    ]
  },
  "algorithm": {
    "name": "astar",
    "heuristic": "poweredManhattanDistance"
  }
}
```

## Using Shelf Data

### Setting Shelf Tier Information (Future Implementation)

In your application, you can scan products and associate them with shelf tiers:

```javascript
// After placing a product at node "8-15"
board.setShelfTier("8-15", "lower", {
  name: "Milk 2%",
  barcode: "123456789",
  price: 3.99
});

board.setShelfTier("8-15", "middle", {
  name: "Organic Milk",
  barcode: "987654321", 
  price: 5.99
});

board.setShelfTier("8-15", "higher", {
  name: "Almond Milk",
  barcode: "456789123",
  price: 4.49
});
```

### Retrieving Shelf Data

```javascript
// Get specific tier
const middleTier = board.getShelfTier("8-15", "middle");
console.log(middleTier.name); // "Organic Milk"

// Get all tiers for a shelf
const allTiers = board.shelfData["8-15"];
```

## Python Integration

### Loading Store Data

```python
from load_store_data import StoreDataLoader

# Load a specific store
loader = StoreDataLoader("saved_stores/store_2025-11-02T01-23-45.json")

# Get the store matrix
matrix = loader.get_matrix()  # numpy array

# Get products to collect
products = loader.get_products()  # ['8-15', '12-20']

# Get computed path
path = loader.get_path()
print(f"Path: {path['start']} → {' → '.join(path['productSequence'])} → {path['target']}")

# Get shelf data for recommendations
shelf_data = loader.get_shelf_data()
for node_id in products:
    if node_id in shelf_data:
        print(f"\nShelf at {node_id}:")
        tiers = shelf_data[node_id]
        for tier_name in ['lower', 'middle', 'higher']:
            item = tiers.get(tier_name)
            if item:
                print(f"  {tier_name}: {item.get('name')}")

# Visualize the store
print(loader.visualize_matrix())
```

### List All Stores

```python
from load_store_data import list_saved_stores

stores = list_saved_stores()
for store in stores:
    print(store)
```

## Product Recommendation Workflow

### 1. Store Setup Phase
1. Create store layout with walls/aisles
2. Mark product locations (shelves)
3. For each product location, scan and record 3 tier items:
   - Lower shelf item
   - Middle shelf item  
   - Higher shelf item

### 2. Path Computation Phase
1. User adds products to shopping list
2. Mark those as "products" (yellow) in visualizer
3. Mark competing/alternative products as "dummy products" (red)
4. Visualize optimal shopping path
5. Save the complete data

### 3. Recommendation Phase (Your ML Model)
1. Load saved store data
2. Access `shelfData` for product information
3. Use `path` information for location optimization
4. Use `matrix` for spatial analysis
5. Generate recommendations based on:
   - Product proximity
   - Path efficiency
   - Shelf tier preferences
   - Historical data

## API Endpoints

### Save Store
```
POST /api/save-store
Content-Type: application/json

{store data object}

Response:
{
  "success": true,
  "filename": "store_2025-11-02T01-23-45.json",
  "path": "/full/path/to/file"
}
```

### List Stores
```
GET /api/stores

Response:
{
  "success": true,
  "stores": [
    {
      "filename": "store_2025-11-02T01-23-45.json",
      "path": "/full/path/to/file",
      "created": "2025-11-02T01:23:45.678Z"
    }
  ]
}
```

### Load Store
```
GET /api/store/:filename

Response:
{
  "success": true,
  "data": {store data object}
}
```

## Directory Structure

```
Pathfinding-Visualizer/
├── saved_stores/              # Auto-created directory
│   ├── store_2025-11-02T01-23-45.json
│   └── store_2025-11-02T02-15-30.json
├── load_store_data.py         # Python loader utility
├── server.js                  # Express server with API
├── index.html                 # Main UI
└── public/
    └── browser/
        └── board.js           # Main board logic
```

## Example Use Case

### Scenario: Grocery Store Product Recommendations

1. **Store Manager** creates layout:
   - Walls represent aisles
   - Product nodes represent shelf sections
   - Scans items at each shelf (lower/middle/higher)

2. **Customer** shops:
   - Adds items to list
   - System marks them as "products"  
   - Alternative brands marked as "dummy products"

3. **System** computes:
   - Optimal path through store
   - Collects all items efficiently
   - Saves data

4. **ML Model** analyzes:
   - Which tier items were selected
   - Path efficiency
   - Product substitutions
   - Generates recommendations for future customers

## Tips & Best Practices

1. **Product Placement**: Place products where actual shelves are in your store
2. **Dummy Products**: Use for items customers skip or alternative brands
3. **Walls**: Create realistic aisle layouts matching physical store
4. **Path Testing**: Visualize path before saving to ensure it's optimal
5. **Shelf Data**: Populate after path visualization for accurate mapping
6. **Batch Processing**: Save multiple store configurations for A/B testing

## Troubleshooting

### Server won't start
- Check if port 1337 is already in use
- Kill existing process: `pkill -f "node server.js"`
- Restart: `npm start`

### Save button not appearing
- Make sure to click "Visualize Shopping Path" first
- Path must complete before save button appears
- Check that products are marked (yellow cells)

### Data not saving
- Check `saved_stores/` directory exists (auto-created)
- Check server console for errors
- Verify file permissions

## Future Enhancements

1. **UI for Shelf Data Entry**: Add modal dialog to input tier data directly in browser
2. **Import/Export**: Load existing stores back into visualizer
3. **Batch Operations**: Save multiple path variations
4. **Analytics**: Track path efficiency metrics
5. **Multi-floor Support**: Handle multi-level stores

## Questions?

This system provides the foundation for sophisticated product recommendation ML models by capturing both spatial layout and shopping behavior data.