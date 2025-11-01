"""
main.py
Main script to train visibility model and test on items
"""

import json
import math
from typing import Dict
from data_preparation import prepare_data
from weight_optimizer import VisibilityWeightOptimizer


class VisibilityCalculator:
    """Calculate product visibility using trained or default weights"""
    
    def __init__(self, weights_file: str = None, average_eye_height: float = 160):
        """
        Initialize calculator
        
        Args:
            weights_file: Path to JSON file with weights (uses defaults if None)
            average_eye_height: Average shopper eye height in cm
        """
        self.eye_height = average_eye_height
        
        # Default weights
        self.weights = {
            'shelf_weights': {
                'floor': 0.3,
                'waist': 0.7,
                'eye': 1.0,
                'top': 0.5
            },
            'aisle_multipliers': {
                'mid_aisle': 1.0,
                'end_cap': 4.0
            },
            'traffic_multipliers': {
                'low': 0.7,
                'medium': 1.0,
                'high': 1.2
            },
            'contribution_weights': {
                'shelf_weight': 0.4,
                'sightline': 0.6
            }
        }
        
        # Load weights from file if provided
        if weights_file:
            self.load_weights(weights_file)
    
    def load_weights(self, filepath: str):
        """Load weights from JSON file"""
        with open(filepath, 'r') as f:
            self.weights = json.load(f)
        print(f"✓ Loaded weights from {filepath}")
    
    def get_shelf_category(self, shelf_height: float) -> str:
        """Determine shelf category from height"""
        if shelf_height < 60:
            return 'floor'
        elif shelf_height < 100:
            return 'waist'
        elif shelf_height < 180:
            return 'eye'
        else:
            return 'top'
    
    def categorize_traffic(self, traffic_per_hour: float) -> str:
        """Categorize traffic into low/medium/high"""
        if traffic_per_hour < 150:
            return 'low'
        elif traffic_per_hour < 220:
            return 'medium'
        else:
            return 'high'
    
    def calculate_sightline_factor(self, shelf_height: float, 
                                   horizontal_distance: float) -> float:
        """Calculate visibility based on sightline geometry"""
        # Height difference factor
        height_diff = abs(shelf_height - self.eye_height)
        height_factor = max(0, 1 - (height_diff / 90))
        
        # Viewing angle factor
        angle_diff = shelf_height - self.eye_height
        angle = math.atan2(angle_diff, horizontal_distance)
        angle_factor = math.cos(angle) ** 2
        
        # Combine factors
        sightline = height_factor * 0.6 + angle_factor * 0.4
        return max(0.0, min(1.0, sightline))
    
    def get_visibility(self, 
                      shelf_height_cm: float,
                      endcap: int,  # 0 or 1
                      facings: int,
                      traffic_per_hour: float,
                      distance_from_aisle_center: float = 2.5) -> Dict[str, float]:
        """
        Calculate visibility score for a product
        
        Args:
            shelf_height_cm: Height of shelf from floor in cm
            endcap: 0 for mid-aisle, 1 for end cap
            facings: Number of product facings
            traffic_per_hour: Foot traffic past the product
            distance_from_aisle_center: Distance from aisle center in meters
            
        Returns:
            Dictionary with visibility score and breakdown
        """
        # Convert inputs
        is_end_cap = bool(endcap)
        traffic_level = self.categorize_traffic(traffic_per_hour)
        shelf_category = self.get_shelf_category(shelf_height_cm)
        
        # Calculate horizontal distance (convert from aisle center distance)
        horizontal_distance = 80 + (distance_from_aisle_center * 10)
        
        # Get weights
        shelf_weight = self.weights['shelf_weights'][shelf_category]
        aisle_mult = self.weights['aisle_multipliers']['end_cap' if is_end_cap else 'mid_aisle']
        traffic_mult = self.weights['traffic_multipliers'][traffic_level]
        shelf_contrib = self.weights['contribution_weights']['shelf_weight']
        sightline_contrib = self.weights['contribution_weights']['sightline']
        
        # Calculate sightline factor
        sightline = self.calculate_sightline_factor(shelf_height_cm, horizontal_distance)
        
        # Calculate viewing angle for reference
        angle_diff = shelf_height_cm - self.eye_height
        viewing_angle = math.degrees(math.atan2(angle_diff, horizontal_distance))
        
        # Combine factors
        base_score = (shelf_weight * shelf_contrib + sightline * sightline_contrib)
        raw_score = base_score * aisle_mult * traffic_mult * math.sqrt(facings)
        
        # Normalize to 0-100 scale
        max_possible = 1.0 * 6.0 * 1.5 * 3  # max theoretical score
        visibility_score = (raw_score / max_possible) * 100
        
        return {
            'visibility_score': round(visibility_score, 2),
            'interpretation': self._interpret_score(visibility_score),
            'breakdown': {
                'shelf_category': shelf_category,
                'shelf_weight': round(shelf_weight, 3),
                'sightline_factor': round(sightline, 3),
                'viewing_angle_degrees': round(viewing_angle, 2),
                'is_end_cap': is_end_cap,
                'aisle_multiplier': round(aisle_mult, 2),
                'traffic_level': traffic_level,
                'traffic_multiplier': round(traffic_mult, 2),
                'facings': facings,
                'facings_boost': round(math.sqrt(facings), 2),
                'raw_score': round(raw_score, 3)
            }
        }
    
    def _interpret_score(self, score: float) -> str:
        """Provide interpretation of visibility score"""
        if score >= 80:
            return "Excellent - Premium visibility location"
        elif score >= 60:
            return "Good - Strong visibility"
        elif score >= 40:
            return "Moderate - Average visibility"
        elif score >= 20:
            return "Poor - Limited visibility"
        else:
            return "Very Poor - Minimal visibility"


def train_model(csv_path: str, metric: str = 'sales_units_week', 
                output_file: str = 'optimized_weights.json'):
    """
    Train visibility model from dataset
    
    Args:
        csv_path: Path to retail dataset CSV
        metric: Column name for performance metric
        output_file: Path to save optimized weights
        
    Returns:
        Dictionary with optimization results
    """
    print("=" * 70)
    print("TRAINING VISIBILITY MODEL")
    print("=" * 70)
    
    # Step 1: Prepare data
    observations = prepare_data(csv_path, metric=metric, filter_zero_sales=True, analyze=True)
    
    # Step 2: Optimize weights
    print("\n" + "=" * 70)
    print("OPTIMIZING WEIGHTS")
    print("=" * 70)
    
    optimizer = VisibilityWeightOptimizer()
    optimizer.add_observations_batch(observations)
    results = optimizer.optimize_weights()
    
    # Step 3: Display results
    print("\n" + "=" * 70)
    print("OPTIMIZATION RESULTS")
    print("=" * 70)
    
    print("\n📈 Model Performance:")
    print("-" * 70)
    for key, value in results['statistics'].items():
        print(f"  {key.replace('_', ' ').title()}: {value}")
    
    print("\n⚖️  Optimized Weights:")
    print("-" * 70)
    
    print("\n  Shelf Weights:")
    for shelf, weight in results['optimized_weights']['shelf_weights'].items():
        print(f"    {shelf.capitalize()}: {weight}")
    
    print("\n  Aisle Multipliers:")
    for aisle, mult in results['optimized_weights']['aisle_multipliers'].items():
        print(f"    {aisle.replace('_', ' ').title()}: {mult}x")
    
    print("\n  Traffic Multipliers:")
    for traffic, mult in results['optimized_weights']['traffic_multipliers'].items():
        print(f"    {traffic.capitalize()}: {mult}x")
    
    print("\n  Contribution Weights:")
    for contrib, weight in results['optimized_weights']['contribution_weights'].items():
        print(f"    {contrib.replace('_', ' ').title()}: {weight}")
    
    # Step 4: Save weights
    optimizer.save_weights(output_file)
    
    return results


def test_visibility(item: Dict, weights_file: str = None):
    """
    Test visibility calculation on a single item
    
    Args:
        item: Dictionary with item properties
        weights_file: Path to weights file (uses defaults if None)
    """
    print("\n" + "=" * 70)
    print("TESTING VISIBILITY")
    print("=" * 70)
    
    # Create calculator
    calc = VisibilityCalculator(weights_file)
    
    # Calculate visibility
    result = calc.get_visibility(**item)
    
    # Display results
    print(f"\n📦 Product Information:")
    for key, value in item.items():
        print(f"  {key}: {value}")
    
    print(f"\n🎯 Visibility Score: {result['visibility_score']}/100")
    print(f"📊 Assessment: {result['interpretation']}")
    
    print(f"\n🔍 Detailed Breakdown:")
    for key, value in result['breakdown'].items():
        print(f"  {key}: {value}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("=" * 70)
        print("RETAIL VISIBILITY CALCULATOR")
        print("=" * 70)
        print("\nUsage:")
        print("  1. Train model:  python main.py train <csv_path> [metric]")
        print("  2. Test item:    python main.py test")
        print("\nExamples:")
        print("  python main.py train retail_data.csv")
        print("  python main.py train retail_data.csv conversion_rate")
        print("  python main.py test")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == 'train':
        # Training mode
        if len(sys.argv) < 3:
            print("Error: CSV path required for training")
            print("Usage: python main.py train <csv_path> [metric]")
            sys.exit(1)
        
        csv_path = sys.argv[2]
        metric = sys.argv[3] if len(sys.argv) > 3 else 'sales_units_week'
        
        results = train_model(csv_path, metric=metric)
        
        print("\n" + "=" * 70)
        print("✓ TRAINING COMPLETE")
        print("=" * 70)
        print("\nYou can now test items using:")
        print("  python main.py test")
        
    elif command == 'test':
        # Testing mode
        print("=" * 70)
        print("RETAIL VISIBILITY CALCULATOR - TEST MODE")
        print("=" * 70)
        
        # Dummy test items
        test_items = [
            {
                'name': 'Toilet Paper (Premium) - Mid Aisle',
                'item': {
                    'shelf_height_cm': 84.7,
                    'endcap': 0,
                    'facings': 4,
                    'traffic_per_hour': 139.5,
                    'distance_from_aisle_center': 2.5
                }
            },
            {
                'name': 'Snacks - End Cap at Eye Level',
                'item': {
                    'shelf_height_cm': 155.0,
                    'endcap': 1,
                    'facings': 5,
                    'traffic_per_hour': 250.0,
                    'distance_from_aisle_center': 0.5
                }
            },
            {
                'name': 'Cereal - Bottom Shelf',
                'item': {
                    'shelf_height_cm': 35.0,
                    'endcap': 0,
                    'facings': 2,
                    'traffic_per_hour': 100.0,
                    'distance_from_aisle_center': 4.0
                }
            }
        ]
        
        # Check if optimized weights exist
        import os
        weights_file = 'optimized_weights.json' if os.path.exists('optimized_weights.json') else None
        
        if weights_file:
            print("\n✓ Using optimized weights from training")
        else:
            print("\n⚠️  No trained model found. Using default weights.")
            print("   Run 'python main.py train <csv_path>' to train first.")
        
        # Test each item
        for test_item in test_items:
            print("\n" + "=" * 70)
            print(f"TEST: {test_item['name']}")
            print("=" * 70)
            test_visibility(test_item['item'], weights_file)
        
        print("\n" + "=" * 70)
        print("✓ TESTING COMPLETE")
        print("=" * 70)
    
    else:
        print(f"Unknown command: {command}")
        print("Use 'train' or 'test'")
        sys.exit(1)