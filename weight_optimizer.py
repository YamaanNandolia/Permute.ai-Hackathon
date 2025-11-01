"""
weight_optimizer.py
Optimizes visibility weights from actual sales data
"""

import numpy as np
from scipy.optimize import differential_evolution
import json
import math
from typing import Dict, List
from dataclasses import dataclass


@dataclass
class ProductObservation:
    """Data class for product placement observations"""
    shelf_height: float  # cm
    is_end_cap: bool
    traffic_level: str  # 'high', 'medium', 'low'
    num_facings: int
    horizontal_distance: float  # cm
    actual_metric: float  # actual sales, views, or engagement metric
    product_id: str = ""


class VisibilityWeightOptimizer:
    """Optimize visibility weights based on actual observations"""
    
    def __init__(self, average_eye_height: float = 160):
        self.eye_height = average_eye_height
        self.observations: List[ProductObservation] = []
        self.optimized_weights = None
        
    def add_observation(self, observation: ProductObservation):
        """Add a single observation"""
        self.observations.append(observation)
    
    def add_observations_batch(self, observations: List[ProductObservation]):
        """Add multiple observations at once"""
        self.observations.extend(observations)
    
    def get_shelf_category(self, shelf_height: float) -> int:
        """Return shelf category index: 0=floor, 1=waist, 2=eye, 3=top"""
        if shelf_height < 60:
            return 0  # floor
        elif shelf_height < 100:
            return 1  # waist
        elif shelf_height < 180:
            return 2  # eye
        else:
            return 3  # top
    
    def calculate_sightline_factor(self, shelf_height: float, 
                                   horizontal_distance: float) -> float:
        """Calculate sightline visibility factor"""
        height_diff = abs(shelf_height - self.eye_height)
        height_factor = max(0, 1 - (height_diff / 90))
        
        angle_diff = shelf_height - self.eye_height
        angle = math.atan2(angle_diff, horizontal_distance)
        angle_factor = math.cos(angle) ** 2
        
        return max(0.0, min(1.0, height_factor * 0.6 + angle_factor * 0.4))
    
    def calculate_predicted_visibility(self, observation: ProductObservation, 
                                      weights: np.ndarray) -> float:
        """
        Calculate predicted visibility given current weights
        
        weights array structure:
        [0-3]: shelf_weights (floor, waist, eye, top)
        [4-5]: aisle_multipliers (mid_aisle, end_cap)
        [6-8]: traffic_multipliers (low, medium, high)
        [9]: shelf_weight_contribution (0-1)
        [10]: sightline_contribution (0-1)
        """
        # Extract weights
        shelf_weights = weights[0:4]
        aisle_mults = weights[4:6]
        traffic_mults = weights[6:9]
        shelf_contrib = weights[9]
        sightline_contrib = weights[10]
        
        # Get shelf weight
        shelf_cat = self.get_shelf_category(observation.shelf_height)
        shelf_weight = shelf_weights[shelf_cat]
        
        # Get aisle multiplier
        aisle_mult = aisle_mults[1] if observation.is_end_cap else aisle_mults[0]
        
        # Get traffic multiplier
        traffic_map = {'low': 0, 'medium': 1, 'high': 2}
        traffic_mult = traffic_mults[traffic_map[observation.traffic_level]]
        
        # Calculate sightline factor
        sightline = self.calculate_sightline_factor(
            observation.shelf_height, 
            observation.horizontal_distance
        )
        
        # Combine factors
        base_score = (shelf_weight * shelf_contrib + 
                     sightline * sightline_contrib)
        
        # Facings factor: 1 facing = 0.7x, 2 facings = 1.0x, 4+ facings = 1.3x
        facings = observation.num_facings
        if facings == 1:
            facings_factor = 0.7
        elif facings == 2:
            facings_factor = 1.0
        elif facings == 3:
            facings_factor = 1.15
        else:  # 4 or more
            facings_factor = 1.3
        
        final_score = (base_score * aisle_mult * traffic_mult * facings_factor)
        
        return final_score
    
    def objective_function(self, weights: np.ndarray) -> float:
        """Objective function to minimize (Mean Squared Error)"""
        predictions = []
        actuals = []
        
        for obs in self.observations:
            pred = self.calculate_predicted_visibility(obs, weights)
            predictions.append(pred)
            actuals.append(obs.actual_metric)
        
        predictions = np.array(predictions)
        actuals = np.array(actuals)
        
        # Normalize both to 0-1 scale for fair comparison
        if actuals.max() > actuals.min():
            actuals_norm = (actuals - actuals.min()) / (actuals.max() - actuals.min())
        else:
            actuals_norm = actuals
            
        if predictions.max() > predictions.min():
            predictions_norm = (predictions - predictions.min()) / (predictions.max() - predictions.min())
        else:
            predictions_norm = predictions
        
        # Mean Squared Error
        mse = np.mean((predictions_norm - actuals_norm) ** 2)
        
        return mse
    
    def optimize_weights(self) -> Dict:
        """
        Optimize weights to minimize prediction error
        
        Returns:
            Dictionary with optimized weights and statistics
        """
        if len(self.observations) == 0:
            raise ValueError("No observations added. Add data before optimizing.")
        
        print(f"\n🔧 Optimizing weights using {len(self.observations)} observations...")
        print("   (This may take 10-30 seconds)")
        
        # Define bounds for weights
        bounds = [
            (0.1, 1.0),  # floor shelf weight
            (0.3, 1.0),  # waist shelf weight
            (0.5, 1.0),  # eye shelf weight
            (0.2, 0.8),  # top shelf weight
            (0.8, 1.2),  # mid-aisle multiplier (baseline)
            (2.0, 6.0),  # end-cap multiplier
            (0.5, 0.9),  # low traffic multiplier
            (0.9, 1.1),  # medium traffic multiplier
            (1.0, 1.5),  # high traffic multiplier
            (0.2, 0.8),  # shelf weight contribution
            (0.2, 0.8),  # sightline contribution
        ]
        
        # Global optimization
        result = differential_evolution(
            self.objective_function,
            bounds,
            seed=42,
            maxiter=1000,
            atol=1e-7,
            tol=1e-7,
            workers=-1
        )
        
        # Store optimized weights
        self.optimized_weights = result.x
        
        # Calculate fit statistics
        predictions = []
        actuals = []
        for obs in self.observations:
            pred = self.calculate_predicted_visibility(obs, self.optimized_weights)
            predictions.append(pred)
            actuals.append(obs.actual_metric)
        
        predictions = np.array(predictions)
        actuals = np.array(actuals)
        
        # Calculate R-squared
        ss_res = np.sum((actuals - predictions) ** 2)
        ss_tot = np.sum((actuals - np.mean(actuals)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        
        # Calculate RMSE
        rmse = np.sqrt(np.mean((predictions - actuals) ** 2))
        
        return {
            'optimized_weights': {
                'shelf_weights': {
                    'floor': round(self.optimized_weights[0], 3),
                    'waist': round(self.optimized_weights[1], 3),
                    'eye': round(self.optimized_weights[2], 3),
                    'top': round(self.optimized_weights[3], 3)
                },
                'aisle_multipliers': {
                    'mid_aisle': round(self.optimized_weights[4], 3),
                    'end_cap': round(self.optimized_weights[5], 3)
                },
                'traffic_multipliers': {
                    'low': round(self.optimized_weights[6], 3),
                    'medium': round(self.optimized_weights[7], 3),
                    'high': round(self.optimized_weights[8], 3)
                },
                'contribution_weights': {
                    'shelf_weight': round(self.optimized_weights[9], 3),
                    'sightline': round(self.optimized_weights[10], 3)
                }
            },
            'statistics': {
                'r_squared': round(r_squared, 4),
                'rmse': round(rmse, 4),
                'mse': round(result.fun, 6),
                'num_observations': len(self.observations),
                'optimization_success': result.success
            }
        }
    
    def save_weights(self, filepath: str):
        """Save optimized weights to JSON file"""
        if self.optimized_weights is None:
            raise ValueError("No optimized weights available. Run optimize_weights() first.")
        
        weights_dict = {
            'shelf_weights': {
                'floor': float(self.optimized_weights[0]),
                'waist': float(self.optimized_weights[1]),
                'eye': float(self.optimized_weights[2]),
                'top': float(self.optimized_weights[3])
            },
            'aisle_multipliers': {
                'mid_aisle': float(self.optimized_weights[4]),
                'end_cap': float(self.optimized_weights[5])
            },
            'traffic_multipliers': {
                'low': float(self.optimized_weights[6]),
                'medium': float(self.optimized_weights[7]),
                'high': float(self.optimized_weights[8])
            },
            'contribution_weights': {
                'shelf_weight': float(self.optimized_weights[9]),
                'sightline': float(self.optimized_weights[10])
            }
        }
        
        with open(filepath, 'w') as f:
            json.dump(weights_dict, f, indent=2)
        print(f"✓ Weights saved to {filepath}")