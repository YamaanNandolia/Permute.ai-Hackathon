"""
Store Data Loader and Processor
=================================
This script loads and processes store layout data saved by the pathfinding visualizer.
It demonstrates how to work with the store matrix, shelf data, and computed paths.
"""

import json
import os
from pathlib import Path
import numpy as np
from typing import Dict, List, Tuple, Optional


class StoreDataLoader:
    """Loads and processes store layout data from JSON files."""
    
    # Cell type constants matching the frontend encoding
    CELL_TYPES = {
        0: "empty",
        1: "wall",
        2: "product",      # Yellow - target product to buy
        3: "dummy_product", # Red - obstacle/skip product
        4: "start",
        5: "target",
        6: "weighted"
    }
    
    def __init__(self, store_file: str):
        """
        Initialize the loader with a store data file.
        
        Args:
            store_file: Path to the JSON file containing store data
        """
        self.store_file = store_file
        self.data = self._load_data()
        
    def _load_data(self) -> Dict:
        """Load the JSON data from file."""
        with open(self.store_file, 'r') as f:
            return json.load(f)
    
    def get_matrix(self) -> np.ndarray:
        """
        Get the store layout as a numpy array.
        
        Returns:
            2D numpy array representing the store layout
        """
        return np.array(self.data['layout']['matrix'])
    
    def get_metadata(self) -> Dict:
        """Get store metadata (name, created date, dimensions, etc.)"""
        return self.data['metadata']
    
    def get_products(self) -> List[str]:
        """
        Get list of product node IDs (items to collect).
        
        Returns:
            List of node IDs in format "row-col"
        """
        return self.data['layout']['products']
    
    def get_dummy_products(self) -> List[str]:
        """
        Get list of dummy product node IDs (obstacles to avoid).
        
        Returns:
            List of node IDs in format "row-col"
        """
        return self.data['layout']['dummyProducts']
    
    def get_walls(self) -> List[str]:
        """Get list of wall node IDs."""
        return self.data['layout']['walls']
    
    def get_shelf_data(self) -> Dict:
        """
        Get shelf tier information for product nodes.
        Each product node can have lower, middle, and higher tier items.
        
        Returns:
            Dictionary mapping node IDs to shelf tier data
        """
        return self.data.get('shelfData', {})
    
    def get_path(self) -> Optional[Dict]:
        """
        Get the computed A* shopping path.
        
        Returns:
            Dictionary containing path information or None if no path computed
        """
        return self.data.get('path')
    
    def get_algorithm_info(self) -> Dict:
        """Get information about the algorithm used."""
        return self.data.get('algorithm', {})
    
    def parse_node_id(self, node_id: str) -> Tuple[int, int]:
        """
        Parse a node ID string into row and column coordinates.
        
        Args:
            node_id: Node ID in format "row-col"
            
        Returns:
            Tuple of (row, col)
        """
        row, col = node_id.split('-')
        return int(row), int(col)
    
    def visualize_matrix(self, symbols: Optional[Dict] = None) -> str:
        """
        Create a text visualization of the store layout.
        
        Args:
            symbols: Optional dict mapping cell types to display symbols
            
        Returns:
            String representation of the store layout
        """
        if symbols is None:
            symbols = {
                0: '  ',  # empty
                1: '██',  # wall (black)
                2: '🟨',  # product (yellow)
                3: '🟥',  # dummy product (red)
                4: '🟢',  # start (green)
                5: '🎯',  # target
                6: '⚖️'   # weighted
            }
        
        matrix = self.get_matrix()
        lines = []
        for row in matrix:
            line = ''.join(symbols.get(cell, '??') for cell in row)
            lines.append(line)
        return '\n'.join(lines)
    
    def get_path_sequence(self) -> List[str]:
        """
        Get the sequence of nodes in the computed path.
        
        Returns:
            List of node IDs representing the shopping path
        """
        path = self.get_path()
        if not path:
            return []
        
        sequence = [path['start']]
        sequence.extend(path.get('productSequence', []))
        sequence.append(path['target'])
        return sequence
    
    def print_summary(self):
        """Print a summary of the store data."""
        metadata = self.get_metadata()
        matrix = self.get_matrix()
        products = self.get_products()
        path = self.get_path()
        
        print("=" * 60)
        print(f"Store: {metadata['name']}")
        print(f"Created: {metadata['created']}")
        print(f"Description: {metadata['description']}")
        print(f"Dimensions: {metadata['dimensions']['height']}x{metadata['dimensions']['width']}")
        print(f"Products to collect: {len(products)}")
        print(f"Dummy products (obstacles): {len(self.get_dummy_products())}")
        print(f"Walls: {len(self.get_walls())}")
        
        if path:
            print(f"\nPath computed: {path.get('start')} → ... → {path.get('target')}")
            print(f"Product sequence: {' → '.join(path.get('productSequence', []))}")
            print(f"Total legs: {len(path.get('legs', []))}")
        
        algo = self.get_algorithm_info()
        if algo:
            print(f"\nAlgorithm: {algo.get('name', 'N/A')}")
            print(f"Heuristic: {algo.get('heuristic', 'N/A')}")
        
        print("\nStore Layout:")
        print(self.visualize_matrix())
        print("=" * 60)


def list_saved_stores(stores_dir: str = "saved_stores") -> List[str]:
    """
    List all saved store files.
    
    Args:
        stores_dir: Directory containing saved stores
        
    Returns:
        List of store file paths
    """
    stores_path = Path(stores_dir)
    if not stores_path.exists():
        return []
    
    return sorted([str(f) for f in stores_path.glob("*.json")])


def load_latest_store(stores_dir: str = "saved_stores") -> Optional[StoreDataLoader]:
    """
    Load the most recently saved store.
    
    Args:
        stores_dir: Directory containing saved stores
        
    Returns:
        StoreDataLoader instance or None if no stores found
    """
    stores = list_saved_stores(stores_dir)
    if not stores:
        return None
    
    return StoreDataLoader(stores[-1])


# Example usage
if __name__ == "__main__":
    # List all saved stores
    print("Available stores:")
    stores = list_saved_stores()
    for i, store in enumerate(stores, 1):
        print(f"  {i}. {store}")
    
    if stores:
        # Load the latest store
        print("\n" + "=" * 60)
        print("Loading latest store...")
        print("=" * 60)
        
        loader = load_latest_store()
        if loader:
            loader.print_summary()
            
            # Example: Access shelf data
            shelf_data = loader.get_shelf_data()
            if shelf_data:
                print("\nShelf Data:")
                for node_id, tiers in shelf_data.items():
                    print(f"  Node {node_id}:")
                    for tier_name, info in tiers.items():
                        if info:
                            print(f"    {tier_name}: {info}")
    else:
        print("\nNo saved stores found.")
        print("Create a store layout in the visualizer and click 'Visualize Shopping Path',")
        print("then click '💾 Save Store' to save it.")