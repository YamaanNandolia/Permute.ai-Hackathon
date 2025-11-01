import cv2
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
from fastapi import FastAPI, UploadFile
import uvicorn

# ================= FLOORPLAN PROCESSING =================

def load_image(path):
    return cv2.imread(path, cv2.IMREAD_GRAYSCALE)

def to_occupancy_grid(image, threshold=128):
    _, binary = cv2.threshold(image, threshold, 1, cv2.THRESH_BINARY_INV)
    return binary.astype(np.uint8)

def extract_nodes(image, max_corners=50):
    corners = cv2.goodFeaturesToTrack(
        image, maxCorners=max_corners, qualityLevel=0.01, minDistance=10
    )
    if corners is None:
        return []
    return [(int(c[0][0]), int(c[0][1])) for c in corners]

def manhattan(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def build_graph(nodes, grid):
    G = nx.grid_2d_graph(grid.shape[0], grid.shape[1])
    obstacles = [(i, j) for i in range(grid.shape[0]) for j in range(grid.shape[1]) if grid[i, j] == 1]
    G.remove_nodes_from(obstacles)
    return G

def a_star(grid, start, goal):
    if grid[start] == 1 or grid[goal] == 1:
        return []
    G = build_graph([], grid)
    try:
        return nx.astar_path(G, start, goal, heuristic=manhattan)
    except nx.NetworkXNoPath:
        return []

def find_path_with_waypoints(grid, waypoints):
    full_path = []
    for i in range(len(waypoints) - 1):
        segment = a_star(grid, waypoints[i], waypoints[i + 1])
        if not segment:
            return []
        if full_path:
            full_path.extend(segment[1:])
        else:
            full_path.extend(segment)
    return full_path

def simulate_npc_path(grid, item_locations, start=(0, 0)):
    waypoints = [start] + item_locations
    return find_path_with_waypoints(grid, waypoints)

def generate_heatmap(grid, path):
    heatmap = np.zeros_like(grid, dtype=float)
    for x, y in path:
        if 0 <= x < heatmap.shape[0] and 0 <= y < heatmap.shape[1]:
            heatmap[x, y] += 1
    plt.imshow(heatmap, cmap='hot', interpolation='nearest')
    plt.title('Visited Areas Heatmap')
    plt.colorbar()
    plt.show()

# ================= FASTAPI ENDPOINT =================

app = FastAPI()

@app.post("/upload-floorplan")
async def upload_floorplan(file: UploadFile):
    content = await file.read()
    image = cv2.imdecode(np.frombuffer(content, np.uint8), cv2.IMREAD_GRAYSCALE)

    if image is None:
        return {"error": "invalid image"}

    grid = to_occupancy_grid(image)

    return {
        "height": int(grid.shape[0]),
        "width": int(grid.shape[1]),
        "grid": grid.tolist()
    }

# ================= LOCAL TEST (optional) =================

if __name__ == "__main__":
    # Local simulation test mode
    test_image = load_image("current_plans.png")
    if test_image is None:
        print("Warning: current_plans.png not found. API mode only.")
    else:
        grid = to_occupancy_grid(test_image)
        nodes = extract_nodes(test_image)
        path = simulate_npc_path(grid, [(50,50),(100,100),(150,150)])

        if path:
            print(f"Path found. Length={len(path)}")
            generate_heatmap(grid, path)
        else:
            print("No path found.")

    # Start API
    uvicorn.run(app, host="0.0.0.0", port=8000)
