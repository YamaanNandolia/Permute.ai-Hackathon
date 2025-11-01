"""
data_preparation.py
Prepares retail dataset for visibility optimization
"""

import pandas as pd
from typing import List
from weight_optimizer import ProductObservation


def categorize_traffic(traffic_per_hour: float, 
                      low_threshold: float = 150, 
                      high_threshold: float = 220) -> str:
    """
    Categorize traffic into low/medium/high
    
    Args:
        traffic_per_hour: Number of people passing per hour
        low_threshold: Threshold for low traffic
        high_threshold: Threshold for high traffic
        
    Returns:
        'low', 'medium', or 'high'
    """
    if traffic_per_hour < low_threshold:
        return 'low'
    elif traffic_per_hour < high_threshold:
        return 'medium'
    else:
        return 'high'


def load_dataset(csv_path: str, sales_column: str = 'sales_units_week') -> pd.DataFrame:
    """
    Load retail dataset from CSV
    
    Args:
        csv_path: Path to CSV file
        sales_column: Name of column with sales/performance metric
        
    Returns:
        DataFrame with loaded data
    """
    print(f"📁 Loading data from: {csv_path}")
    df = pd.read_csv(csv_path)
    
    # Required columns
    required_cols = ['shelf_height_cm', 'endcap', 'facings', 
                    'traffic_per_hour', 'distance_from_aisle_center', sales_column]
    
    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
    
    print(f"✓ Loaded {len(df)} products")
    return df


def analyze_dataset(df: pd.DataFrame, sales_column: str = 'sales_units_week'):
    """
    Analyze and print dataset characteristics
    
    Args:
        df: DataFrame to analyze
        sales_column: Name of sales column
    """
    print("\n" + "=" * 70)
    print("DATASET CHARACTERISTICS")
    print("=" * 70)
    
    # Shelf height distribution
    print("\n📏 Shelf Height Distribution:")
    print(f"  Min: {df['shelf_height_cm'].min():.1f} cm")
    print(f"  Max: {df['shelf_height_cm'].max():.1f} cm")
    print(f"  Mean: {df['shelf_height_cm'].mean():.1f} cm")
    print(f"  Median: {df['shelf_height_cm'].median():.1f} cm")
    
    # Categorize shelves
    floor_level = (df['shelf_height_cm'] < 60).sum()
    waist_level = ((df['shelf_height_cm'] >= 60) & (df['shelf_height_cm'] < 100)).sum()
    eye_level = ((df['shelf_height_cm'] >= 100) & (df['shelf_height_cm'] < 180)).sum()
    top_level = (df['shelf_height_cm'] >= 180).sum()
    
    print(f"\n  Floor level (< 60cm): {floor_level} ({floor_level/len(df)*100:.1f}%)")
    print(f"  Waist level (60-100cm): {waist_level} ({waist_level/len(df)*100:.1f}%)")
    print(f"  Eye level (100-180cm): {eye_level} ({eye_level/len(df)*100:.1f}%)")
    print(f"  Top level (> 180cm): {top_level} ({top_level/len(df)*100:.1f}%)")
    
    # Endcap analysis
    print("\n📍 Placement Distribution:")
    endcap_count = df['endcap'].sum()
    print(f"  End caps: {endcap_count} ({endcap_count/len(df)*100:.1f}%)")
    print(f"  Mid-aisle: {len(df) - endcap_count} ({(len(df)-endcap_count)/len(df)*100:.1f}%)")
    
    # Traffic analysis
    print("\n🚶 Traffic Analysis:")
    print(f"  Min: {df['traffic_per_hour'].min():.1f} people/hour")
    print(f"  Max: {df['traffic_per_hour'].max():.1f} people/hour")
    print(f"  Mean: {df['traffic_per_hour'].mean():.1f} people/hour")
    
    # Facings analysis
    print("\n👁️  Facings Distribution:")
    print(f"  Min: {df['facings'].min()}")
    print(f"  Max: {df['facings'].max()}")
    print(f"  Mean: {df['facings'].mean():.1f}")
    
    # Sales performance
    print(f"\n💰 Sales Performance ({sales_column}):")
    print(f"  Total sales: {df[sales_column].sum():.0f}")
    print(f"  Mean sales per product: {df[sales_column].mean():.1f}")
    print(f"  Products with zero sales: {(df[sales_column] == 0).sum()} ({(df[sales_column] == 0).sum()/len(df)*100:.1f}%)")
    
    # Correlation analysis
    print(f"\n📊 Correlations with {sales_column}:")
    correlations = df[['shelf_height_cm', 'endcap', 'facings', 'traffic_per_hour', 
                       sales_column]].corr()[sales_column].sort_values(ascending=False)
    for var, corr in correlations.items():
        if var != sales_column:
            print(f"  {var}: {corr:.3f}")


def convert_to_observations(df: pd.DataFrame, 
                           metric_column: str = 'sales_units_week',
                           distance_default: float = 80.0) -> List[ProductObservation]:
    """
    Convert DataFrame to ProductObservation objects
    
    Args:
        df: Input DataFrame
        metric_column: Column to use as actual_metric 
        distance_default: Default horizontal distance baseline
        
    Returns:
        List of ProductObservation objects
    """
    observations = []
    
    for idx, row in df.iterrows():
        # Categorize traffic
        traffic = categorize_traffic(row['traffic_per_hour'])
        
        # Convert endcap (0/1) to boolean
        is_end_cap = bool(row['endcap'])
        
        # Estimate horizontal distance from aisle center distance
        # Typical aisle width is ~1.5m, so distance from center maps to viewing distance
        horizontal_dist = distance_default + (row['distance_from_aisle_center'] * 10)
        
        obs = ProductObservation(
            shelf_height=row['shelf_height_cm'],
            is_end_cap=is_end_cap,
            traffic_level=traffic,
            num_facings=row['facings'],
            horizontal_distance=horizontal_dist,
            actual_metric=row[metric_column],
            product_id=str(row['product_id']) if 'product_id' in df.columns else str(idx)
        )
        observations.append(obs)
    
    return observations


def prepare_data(csv_path: str, 
                metric: str = 'sales_units_week',
                filter_zero_sales: bool = True,
                analyze: bool = True) -> List[ProductObservation]:
    """
    Complete data preparation pipeline
    
    Args:
        csv_path: Path to CSV file
        metric: Column to use as performance metric
        filter_zero_sales: Whether to exclude products with zero sales
        analyze: Whether to print analysis
        
    Returns:
        List of ProductObservation objects ready for optimization
    """
    # Load data
    df = load_dataset(csv_path, sales_column=metric)
    
    # Analyze if requested
    if analyze:
        analyze_dataset(df, sales_column=metric)
    
    # Filter zero sales if requested
    if filter_zero_sales:
        original_size = len(df)
        df = df[df[metric] > 0].copy()
        removed = original_size - len(df)
        if removed > 0:
            print(f"\n🔍 Filtered out {removed} products with zero {metric}")
            print(f"   Working with {len(df)} products")
    
    # Convert to observations
    print(f"\n🔄 Converting to observations using metric: {metric}")
    observations = convert_to_observations(df, metric_column=metric)
    print(f"✓ Created {len(observations)} observations")
    
    return observations


if __name__ == "__main__":
    # Example usage
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python data_preparation.py <csv_path> [metric]")
        print("\nExample:")
        print("  python data_preparation.py retail_data.csv")
        print("  python data_preparation.py retail_data.csv conversion_rate")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    metric = sys.argv[2] if len(sys.argv) > 2 else 'sales_units_week'
    
    print("=" * 70)
    print("DATA PREPARATION")
    print("=" * 70)
    
    observations = prepare_data(csv_path, metric=metric, analyze=True)
    
    print(f"\n✓ Data preparation complete!")
    print(f"  Ready for optimization with {len(observations)} observations")