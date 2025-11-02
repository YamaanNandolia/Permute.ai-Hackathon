# Store Layout & Product Recommendation System

## Quick Start

### 1. Start the Server
```bash
npm start
```
Server runs at `http://localhost:1337`

### 2. Create a Store Layout
1. Open browser to `http://localhost:1337`
2. Draw walls by clicking and dragging
3. Toggle "Products: On" to mark product locations (yellow)
4. Toggle "Dummy Mode: On" to mark obstacles (red)
5. Click "Visualize Shopping Path"
6. Click "💾 Save Store" when path completes

### 3. Use the Data
```python
python load_store_data.py
```

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Web Interface                         │
│  - Draw store layout                                    │
│  - Mark products (shelves with 3 tiers)                │
│  - Visualize A* pathfinding                            │
│  - Save complete store data                            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Express Server (Node.js)                   │
│  POST /api/save-store    - Save store layout           │
│  GET  /api/stores        - List all stores             │
│  GET  /api/store/:id     - Load specific store         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│           saved_stores/ Directory                       │
│  ├── store_2025-11-02T01-23-45.json                   │
│  ├── store_2025-11-02T02-15-30.json                   │
│  └── ...                                               │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│         Python Processing (load_store_data.py)          │
│  - Load and parse JSON data                            │
│  - Access matrix, path, shelf data                     │
│  - Integrate with ML models                            │
│  - Generate recommendations                            │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Store Creation
```
User → Web UI → Board.js → Store Layout in Memory
  ↓
  Product Placement
  ↓
  Wall/Obstacle Configuration
```

### 2. Path Computation
```
User clicks "Visualize Shopping Path"
  ↓
A* Algorithm (astar.js)
  ↓
Greedy Product Order (_computeGreedyOrder)
  ↓
Path Animation
  ↓
lastComputedPath stored in Board
```

### 3. Data Storage
```
User clicks "💾 Save Store"
  ↓
exportStoreData() → JSON object
  ↓
POST /api/save-store
  ↓
saved_stores/store_[timestamp].json
```

### 4. Data Retrieval
```
Python: load_store_data.py
  ↓
Load JSON from saved_stores/
  ↓
Parse into usable structures
  ↓
Your ML Model / Recommendation System
```

## Key Components

### Frontend (`public/browser/board.js`)

**New Properties:**
- `shelfData` - Stores 3-tier product info per shelf location
- `lastComputedPath` - Stores complete A* path after computation
- `storeMetadata` - Name, description, creation info

**New Methods:**
- `exportStoreData()` - Creates complete JSON export
- `saveStoreToServer()` - Sends data to server via API
- `setShelfTier(nodeId, tier, productInfo)` - Set product info
- `getShelfTier(nodeId, tier)` - Retrieve product info

### Backend (`server.js`)

**API Endpoints:**
- `POST /api/save-store` - Save store data to file
- `GET /api/stores` - List all saved stores
- `GET /api/store/:filename` - Load specific store

### Data Structure

Each saved store contains:
1. **Matrix** - 2D grid encoding store layout
2. **Products** - Yellow nodes (items to buy)
3. **Dummy Products** - Red nodes (obstacles/alternatives)
4. **Walls** - Black nodes (aisles/boundaries)
5. **Path** - Complete A* computed shopping route
6. **Shelf Data** - 3-tier product info (lower/middle/higher)
7. **Metadata** - Store name, dimensions, timestamp

## Shelf Tier Concept

Each product node represents a **shelf** with 3 tiers:

```
┌─────────────────────┐
│   Higher Shelf      │  ← Premium/specialty items
├─────────────────────┤
│   Middle Shelf      │  ← Eye-level, popular items
├─────────────────────┤
│   Lower Shelf       │  ← Budget/bulk items
└─────────────────────┘
```

**In your app's scanning phase:**
1. User places product nodes (yellow) on grid
2. For each node, scan 3 products (one per tier)
3. Store: `{ lower: {...}, middle: {...}, higher: {...} }`
4. Use for recommendations based on tier preferences

## Color Encoding

- 🟨 **Yellow (Product)** - Items you WANT to collect
- 🟥 **Red (Dummy Product)** - Items you DON'T buy (obstacles)
- ⬛ **Black (Wall)** - Store boundaries/aisles
- 🟢 **Green (Start)** - Entry point
- 🎯 **Target** - Checkout/exit

## Matrix Values

```javascript
0 = Empty space
1 = Wall
2 = Product (yellow - target to collect)
3 = Dummy Product (red - skip/obstacle)
4 = Start position
5 = Target/checkout
6 = Weighted node (high traffic area)
```

## Example Workflow

### Creating a Store for Milk Recommendations

1. **Layout Creation:**
   ```
   - Draw outer walls
   - Create aisles with walls
   - Mark dairy section locations as products
   ```

2. **Product Marking:**
   ```javascript
   // Mark shelf location as product
   Click on cell → turns yellow
   
   // Later, in scanning phase:
   board.setShelfTier("8-15", "lower", {
     name: "Store Brand Milk 2%",
     price: 2.99
   });
   board.setShelfTier("8-15", "middle", {
     name: "Organic Valley 2%",
     price: 4.99
   });
   board.setShelfTier("8-15", "higher", {
     name: "Horizon Organic",
     price: 5.49
   });
   ```

3. **Path Computation:**
   ```
   - Add milk + other items to list
   - Visualize optimal shopping path
   - Save complete data
   ```

4. **ML Processing:**
   ```python
   loader = StoreDataLoader("saved_stores/store_....json")
   
   # Get all milk locations
   products = loader.get_products()
   
   # Analyze tier preferences
   shelf_data = loader.get_shelf_data()
   
   # Recommend based on:
   # - Historical tier selection
   # - Path efficiency
   # - Price sensitivity
   ```

## Integration with Your ML Model

```python
import json
import numpy as np
from load_store_data import StoreDataLoader

# Load store data
loader = StoreDataLoader("saved_stores/latest_store.json")

# Get features for ML model
features = {
    'store_layout': loader.get_matrix(),
    'product_locations': loader.get_products(),
    'optimal_path': loader.get_path_sequence(),
    'shelf_tiers': loader.get_shelf_data()
}

# Your ML model
def recommend_products(customer_history, store_data):
    # Use path efficiency
    # Use tier preferences
    # Use proximity
    # Return recommendations
    pass

recommendations = recommend_products(customer_history, features)
```

## Files Reference

| File | Purpose |
|------|---------|
| `server.js` | Express server with save/load API |
| `public/browser/board.js` | Main UI logic, path computation, data export |
| `index.html` | Web interface |
| `load_store_data.py` | Python utility to load and process saved stores |
| `STORE_DATA_GUIDE.md` | Complete documentation |
| `saved_stores/*.json` | Saved store data files |

## Testing the System

1. **Start Server:**
   ```bash
   npm start
   ```

2. **Create Test Store:**
   - Open `http://localhost:1337`
   - Click "Generate Random Maze"
   - Click "Products: On"
   - Click a few cells to mark as products
   - Click "Visualize Shopping Path"
   - Click "💾 Save Store"

3. **Load in Python:**
   ```bash
   python load_store_data.py
   ```

4. **Verify Data:**
   - Check `saved_stores/` directory
   - Should see `store_[timestamp].json`
   - Python script should display store info

## Next Steps

1. **Implement Product Scanning UI:**
   - Add modal to input tier data
   - Barcode scanning integration
   - Price lookup

2. **Enhance ML Integration:**
   - Connect to your recommendation model
   - Add historical data tracking
   - Implement A/B testing

3. **Add Analytics:**
   - Path efficiency metrics
   - Popular product combinations
   - Traffic pattern analysis

## Support

See [`STORE_DATA_GUIDE.md`](STORE_DATA_GUIDE.md) for detailed documentation on:
- Complete API reference
- Data structure schemas
- Advanced usage examples
- Troubleshooting guide

## License

Part of Permute.ai Hackathon project