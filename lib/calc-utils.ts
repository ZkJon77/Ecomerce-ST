/**
 * Utility functions for professional paint calculation.
 * This module provides the mathematical foundation for estimating the amount of paint
 * needed based on wall dimensions, openings (doors/windows), and paint coverage.
 */

/**
 * Represents a single wall's dimensions.
 */
export interface Wall {
  width: number;
  height: number;
}

/**
 * Represents a type of opening in the wall to be subtracted from the total area.
 */
export interface Opening {
  type: 'door' | 'window';
  count: number;
}

/**
 * The result of a paint calculation, providing area and material requirements.
 */
export interface CalculationResult {
  netArea: number;    // The final area to be painted in m2
  totalLiters: number; // Total liters of paint required, including waste factor
  cans18L: number;    // Number of 18L cans needed
  cans36L: number;    // Number of 3.6L cans needed
}

// Constants for standard area deductions and safety margins
const DOOR_AREA = 2.1;    // Average standard door area in m2
const WINDOW_AREA = 1.2;  // Average standard window area in m2
const WASTE_FACTOR = 0.1;  // 10% extra paint suggested for safety and touch-ups

/**
 * Calculates the required paint for a given set of walls and openings.
 *
 * The formula used is:
 * 1. Sum of all (wall width * wall height)
 * 2. Subtract (opening count * average opening area)
 * 3. Add optional ceiling area
 * 4. Multiply by number of coats
 * 5. Divide by coverage (m2/L)
 * 6. Apply 10% waste factor
 *
 * @param walls - Array of wall dimensions {width, height}
 * @param openings - Array of opening types and counts
 * @param ceilingArea - Optional area of the ceiling in m2
 * @param coverage - Paint coverage in m2 per liter (e.g., 400 for high-end acrylic)
 * @param coats - Number of coats of paint to be applied
 * @returns CalculationResult containing the detailed material estimation
 */
export function calculatePaint(
  walls: Wall[],
  openings: Opening[],
  ceilingArea: number,
  coverage: number,
  coats: number
): CalculationResult {
  // 1. Calculate the gross wall area (sum of all rectangles)
  const totalWallArea = walls.reduce((sum, wall) => sum + (wall.width * wall.height), 0);

  // 2. Calculate the total area to be subtracted for doors and windows
  const deductions = openings.reduce((sum, opening) => {
    const areaPerUnit = opening.type === 'door' ? DOOR_AREA : WINDOW_AREA;
    return sum + (opening.count * areaPerUnit);
  }, 0);

  // 3. Net Area = (Gross Wall Area - Deductions) + Optional Ceiling Area
  // Math.max(0, ...) ensures we don't have negative areas if openings exceed wall area
  const netArea = Math.max(0, totalWallArea - deductions) + ceilingArea;

  // 4. Total Liters = (Net Area * Coats / Coverage) * (1 + Waste Factor)
  // This calculates the theoretical volume and adds a 10% safety margin.
  const totalLiters = (netArea * coats / coverage) * (1 + WASTE_FACTOR);

  // 5. Calculate the number of standard container sizes needed
  // We use Math.ceil because you cannot buy a fraction of a can.
  const cans18L = Math.ceil(totalLiters / 18);
  const cans36L = Math.ceil(totalLiters / 3.6);

  return {
    netArea: Math.round(netArea * 100) / 100,    // Rounded to 2 decimal places
    totalLiters: Math.round(totalLiters * 100) / 100, // Rounded to 2 decimal places
    cans18L,
    cans36L
  };
}
