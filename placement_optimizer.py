"""
Product Placement Optimizer with TSP Integration
Optimizes blue product placement by evaluating TSP tour costs for each candidate position
"""

import numpy as np
from typing import List, Tuple, Dict, Optional, Any
from dataclasses import dataclass
from tsp_solver import TSPSolver
import time


@dataclass
class Product:
    """Represents a product with position and type"""
    id: str
    position: Tuple[float, float]  # (x, y) coordinates
    product_type: str  # 'yellow' (fixed) or 'blue' (optimizable)


@dataclass
class PlacementCandidate:
    """Candidate placement for blue product"""
    position: Tuple[float, float]
    visibility_score: float
    tsp_cost: float
    total_score: float


class PlacementOptimizer:
    """
    Optimizes product placement by evaluating TSP costs for different blue product positions.
    Yellow products are fixed, blue product position is optimized.
    """

    def __init__(self, yellow_products: List[Tuple[float, float]],
                 blue_product_candidates: List[Tuple[float, float]],
                 visibility_calculator: Any = None):
        """
        Initialize optimizer

        Args:
            yellow_products: List of (x,y) positions for fixed yellow products
            blue_product_candidates: List of candidate (x,y) positions for blue product
            visibility_calculator: Optional visibility scoring function/class
        """
        self.yellow_products = [Product(f"yellow_{i}", pos, "yellow")
                               for i, pos in enumerate(yellow_products)]
        self.blue_candidates = blue_product_candidates
        self.visibility_calculator = visibility_calculator

        # TSP solver
        self.tsp_solver = TSPSolver()

        # Caching
        self.distance_cache = {}
        self.tsp_cache = {}

        # Results
        self.best_placement = None
        self.all_candidates_evaluated = []

    def _get_distance_key(self, pos1: Tuple[float, float], pos2: Tuple[float, float]) -> str:
        """Generate cache key for distance between two positions"""
        return f"{pos1[0]},{pos1[1]}_{pos2[0]},{pos2[1]}"

    def _calculate_distance(self, pos1: Tuple[float, float], pos2: Tuple[float, float]) -> float:
        """Calculate Euclidean distance with caching"""
        key = self._get_distance_key(pos1, pos2)
        if key not in self.distance_cache:
            dx = pos1[0] - pos2[0]
            dy = pos1[1] - pos2[1]
            self.distance_cache[key] = (dx**2 + dy**2) ** 0.5
        return self.distance_cache[key]

    def _build_distance_matrix_for_placement(self, blue_position: Tuple[float, float]) -> np.ndarray:
        """
        Build distance matrix for TSP calculation with blue product at given position

        Args:
            blue_position: Position of blue product

        Returns:
            Distance matrix including start, all yellow products, blue product, and end
        """
        # All points: start (0,0), yellow products, blue product, end (same as start)
        all_points = [(0.0, 0.0)]  # Start position

        # Add yellow products
        for prod in self.yellow_products:
            all_points.append(prod.position)

        # Add blue product at candidate position
        all_points.append(blue_position)

        # End position (same as start for closed tour)
        all_points.append((0.0, 0.0))

        # Build distance matrix
        n = len(all_points)
        matrix = np.zeros((n, n))

        for i in range(n):
            for j in range(n):
                if i != j:
                    matrix[i, j] = self._calculate_distance(all_points[i], all_points[j])

        return matrix

    def _calculate_visibility_score(self, position: Tuple[float, float]) -> float:
        """
        Calculate visibility score for a product at given position

        Args:
            position: (x, y) position

        Returns:
            Visibility score (higher is better)
        """
        if self.visibility_calculator is None:
            # Default: simple distance-based score (closer to center is better)
            x, y = position
            distance_from_center = (x**2 + y**2) ** 0.5
            return max(0, 100 - distance_from_center * 10)  # Arbitrary scoring

        # Use provided calculator
        # This would need to be adapted based on the actual visibility calculator interface
        return self.visibility_calculator.get_visibility_score(position)

    def _evaluate_placement(self, blue_position: Tuple[float, float]) -> PlacementCandidate:
        """
        Evaluate a single blue product placement

        Args:
            blue_position: Candidate position for blue product

        Returns:
            PlacementCandidate with scores
        """
        # Calculate visibility score
        visibility_score = self._calculate_visibility_score(blue_position)

        # Build distance matrix and solve TSP
        distance_matrix = self._build_distance_matrix_for_placement(blue_position)
        self.tsp_solver.set_distance_matrix(distance_matrix)

        # Solve TSP (try multiple starts for better approximation)
        tour, tsp_cost = self.tsp_solver.solve_multiple_starts(num_starts=5)

        # Combine scores (higher visibility is better, lower TSP cost is better)
        # Normalize and combine: we want to maximize visibility while minimizing TSP cost
        normalized_visibility = visibility_score / 100.0  # Assume 0-100 scale
        # For TSP cost, lower is better, so we use 1/(1+tsp_cost) to make higher better
        normalized_tsp = 1.0 / (1.0 + tsp_cost)

        # Weighted combination (adjust weights as needed)
        visibility_weight = 0.7
        tsp_weight = 0.3
        total_score = visibility_weight * normalized_visibility + tsp_weight * normalized_tsp

        return PlacementCandidate(
            position=blue_position,
            visibility_score=visibility_score,
            tsp_cost=tsp_cost,
            total_score=total_score
        )

    def optimize_placement(self, top_k: int = 5) -> Dict[str, Any]:
        """
        Find optimal placement for blue product by evaluating all candidates

        Args:
            top_k: Number of top placements to return

        Returns:
            Dictionary with optimization results
        """
        start_time = time.time()

        print(f"🔍 Evaluating {len(self.blue_candidates)} candidate placements...")
        print("   (TSP will be solved for each candidate position)")

        candidates = []
        for i, position in enumerate(self.blue_candidates):
            if (i + 1) % 10 == 0:
                print(f"   Evaluated {i+1}/{len(self.blue_candidates)} candidates...")

            candidate = self._evaluate_placement(position)
            candidates.append(candidate)

        # Sort by total score (descending)
        candidates.sort(key=lambda x: x.total_score, reverse=True)

        self.all_candidates_evaluated = candidates
        self.best_placement = candidates[0] if candidates else None

        optimization_time = time.time() - start_time

        # Performance stats
        cache_stats = {
            'distance_cache_size': len(self.distance_cache),
            'tsp_cache_size': len(self.tsp_solver.cache)
        }

        result = {
            'best_placement': self.best_placement,
            'top_k_placements': candidates[:top_k],
            'total_candidates_evaluated': len(candidates),
            'optimization_time_seconds': round(optimization_time, 2),
            'cache_performance': cache_stats,
            'average_tsp_cost': round(np.mean([c.tsp_cost for c in candidates]), 2),
            'average_visibility_score': round(np.mean([c.visibility_score for c in candidates]), 2)
        }

        return result

    def get_placement_summary(self) -> str:
        """Generate summary of optimization results"""
        if not self.best_placement:
            return "No optimization performed yet."

        summary = f"""
🎯 PRODUCT PLACEMENT OPTIMIZATION COMPLETE

📍 Best Blue Product Position: {self.best_placement.position}
🎨 Visibility Score: {self.best_placement.visibility_score:.2f}/100
🛣️  TSP Tour Cost: {self.best_placement.tsp_cost:.2f}
⭐ Total Score: {self.best_placement.total_score:.4f}

📊 Performance Summary:
• Candidates Evaluated: {len(self.all_candidates_evaluated)}
• Distance Calculations Cached: {len(self.distance_cache)}
• TSP Solutions Cached: {len(self.tsp_solver.cache)}

🔧 Optimizations Applied:
• Distance caching between product positions
• TSP solution caching for repeated subproblems
• Multiple start points for TSP approximation
• Efficient matrix operations with NumPy

The blue product should be placed at {self.best_placement.position} for optimal
shopping path efficiency and product visibility.
"""

        return summary.strip()