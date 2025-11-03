"""
TSP Solver for product placement optimization
Implements nearest neighbor approximation for TSP
"""

import numpy as np
from typing import List, Tuple, Dict
import math


class TSPSolver:
    """Traveling Salesman Problem solver using nearest neighbor approximation"""

    def __init__(self, distance_matrix: np.ndarray = None):
        """
        Initialize TSP solver

        Args:
            distance_matrix: Pre-computed distance matrix (optional)
        """
        self.distance_matrix = distance_matrix
        self.cache = {}  # Cache for computed tours

    def set_distance_matrix(self, distance_matrix: np.ndarray):
        """Set or update the distance matrix"""
        self.distance_matrix = distance_matrix
        self.cache = {}  # Clear cache when matrix changes

    def calculate_distance(self, point1: Tuple[float, float], point2: Tuple[float, float]) -> float:
        """Calculate Euclidean distance between two points"""
        return math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2)

    def build_distance_matrix(self, points: List[Tuple[float, float]]) -> np.ndarray:
        """Build distance matrix from list of points"""
        n = len(points)
        matrix = np.zeros((n, n))

        for i in range(n):
            for j in range(n):
                if i != j:
                    matrix[i, j] = self.calculate_distance(points[i], points[j])

        self.distance_matrix = matrix
        return matrix

    def solve_nearest_neighbor(self, start_idx: int = 0) -> Tuple[List[int], float]:
        """
        Solve TSP using nearest neighbor heuristic

        Args:
            start_idx: Starting point index

        Returns:
            Tuple of (tour_indices, total_distance)
        """
        if self.distance_matrix is None:
            raise ValueError("Distance matrix not set")

        n = len(self.distance_matrix)
        if n <= 1:
            return [0], 0.0

        # Check cache first
        cache_key = f"nn_{start_idx}_{n}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        visited = [False] * n
        tour = [start_idx]
        visited[start_idx] = True
        total_distance = 0.0

        current = start_idx
        for _ in range(n - 1):
            min_dist = float('inf')
            next_city = -1

            for j in range(n):
                if not visited[j] and self.distance_matrix[current, j] < min_dist:
                    min_dist = self.distance_matrix[current, j]
                    next_city = j

            if next_city == -1:
                break

            tour.append(next_city)
            visited[next_city] = True
            total_distance += min_dist
            current = next_city

        # Return to start
        if len(tour) > 1:
            total_distance += self.distance_matrix[tour[-1], tour[0]]

        result = (tour, total_distance)
        self.cache[cache_key] = result
        return result

    def solve_multiple_starts(self, num_starts: int = None) -> Tuple[List[int], float]:
        """
        Solve TSP trying multiple starting points

        Args:
            num_starts: Number of different starts to try (default: all points)

        Returns:
            Best tour found
        """
        if self.distance_matrix is None:
            raise ValueError("Distance matrix not set")

        n = len(self.distance_matrix)
        if num_starts is None:
            num_starts = min(n, 10)  # Try up to 10 starts or all points

        best_tour = None
        best_distance = float('inf')

        starts_to_try = np.random.choice(n, size=min(num_starts, n), replace=False)

        for start in starts_to_try:
            tour, distance = self.solve_nearest_neighbor(start)
            if distance < best_distance:
                best_distance = distance
                best_tour = tour

        return best_tour, best_distance

    def get_tour_distance(self, tour: List[int]) -> float:
        """Calculate total distance of a given tour"""
        if not tour or len(tour) <= 1:
            return 0.0

        distance = 0.0
        for i in range(len(tour)):
            j = (i + 1) % len(tour)
            distance += self.distance_matrix[tour[i], tour[j]]

        return distance

    def clear_cache(self):
        """Clear the computation cache"""
        self.cache = {}