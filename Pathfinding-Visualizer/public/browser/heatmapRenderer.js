/**
 * Heatmap color interpolation renderer
 * Generates blue gradient colors based on visit intensity
 */

// Gradient stops for blue-to-purple heatmap
const GRADIENT_STOPS = [
  { intensity: 0.00, color: { r: 255, g: 255, b: 255 } }, // White
  { intensity: 0.20, color: { r: 230, g: 242, b: 255 } }, // Very light blue
  { intensity: 0.47, color: { r: 153, g: 204, b: 255 } }, // Light blue
  { intensity: 0.73, color: { r: 102, g: 102, b: 255 } }, // Medium blue-purple
  { intensity: 0.87, color: { r: 128, g: 0, b: 204 } },   // Purple
  { intensity: 1.00, color: { r: 102, g: 0, b: 153 } }    // Dark purple (distinct from navy walls)
];

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Get heatmap color based on intensity value
 * @param {number} intensity - Intensity value between 0 and 1
 * @returns {string} RGB color string in format "rgb(r, g, b)"
 */
function getHeatmapColor(intensity) {
  // Clamp intensity to valid range
  intensity = Math.max(0, Math.min(1, intensity));
  
  // Find the two gradient stops to interpolate between
  let lowerStop = GRADIENT_STOPS[0];
  let upperStop = GRADIENT_STOPS[GRADIENT_STOPS.length - 1];
  
  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    if (intensity >= GRADIENT_STOPS[i].intensity && 
        intensity <= GRADIENT_STOPS[i + 1].intensity) {
      lowerStop = GRADIENT_STOPS[i];
      upperStop = GRADIENT_STOPS[i + 1];
      break;
    }
  }
  
  // Calculate interpolation factor
  const range = upperStop.intensity - lowerStop.intensity;
  const t = range === 0 ? 0 : (intensity - lowerStop.intensity) / range;
  
  // Interpolate RGB values
  const r = Math.round(lerp(lowerStop.color.r, upperStop.color.r, t));
  const g = Math.round(lerp(lowerStop.color.g, upperStop.color.g, t));
  const b = Math.round(lerp(lowerStop.color.b, upperStop.color.b, t));
  
  return `rgb(${r}, ${g}, ${b})`;
}

module.exports = getHeatmapColor;