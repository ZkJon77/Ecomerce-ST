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
  width?: number;  // Optional: custom width
  height?: number; // Optional: custom height
}

/**
 * The result of a paint calculation, providing area and material requirements.
 */
export interface CalculationResult {
  grossArea: number;      // Sum of all walls
  deductions: number;     // Total subtracted area
  netArea: number;       // Final area to be painted
  totalLiters: number;    // Total liters required (including waste)
  suggestedCans: string;  // Friendly string: "1x 18L + 2x 3.6L"
  wasteAmount: number;    // How many liters were added as waste
  primerLiters: number;   // Liters of primer required
  primerCans: string;     // Suggested cans of primer
  puttyKg: number;        // Kilograms of putty required
  puttyCans: string;      // Suggested cans of putty
  estimatedCost: number;  // Rough cost estimate
}

// Constants for standard area deductions and safety margins
const DEFAULT_DOOR_AREA = 2.1;    // Average standard door area in m2
const DEFAULT_WINDOW_AREA = 1.2;  // Average standard window area in m2
const WASTE_FACTOR = 0.1;         // 10% extra paint suggested for safety

/**
 * Calculates the required paint for a given set of walls and openings.
 */
export function calculatePaint(
  walls: Wall[],
  openings: Opening[],
  ceilingArea: number,
  coverage: number,
  coats: number
): CalculationResult {
  // 1. Calculate gross wall area
  const grossArea = walls.reduce((sum, wall) => sum + (wall.width * wall.height), 0);

  // 2. Calculate deductions (using custom dimensions if provided, else defaults)
  const deductions = openings.reduce((sum, opening) => {
    const areaPerUnit = (opening.width && opening.height)
      ? (opening.width * opening.height)
      : (opening.type === 'door' ? DEFAULT_DOOR_AREA : DEFAULT_WINDOW_AREA);
    return sum + (opening.count * areaPerUnit);
  }, 0);

  // 3. Net Area = (Gross - Deductions) + Ceiling
  const netArea = Math.max(0, grossArea - deductions) + ceilingArea;

  // 4. Total Paint Liters = (Net Area * Coats / Coverage) * (1 + Waste)
  const theoreticalLiters = (netArea * coats / coverage);
  const totalLiters = theoreticalLiters * (1 + WASTE_FACTOR);
  const wasteAmount = totalLiters - theoreticalLiters;

  // 5. Optimize paint can combination (18L and 3.6L)
  let remainingPaint = totalLiters;
  let cans18 = Math.floor(remainingPaint / 18);
  remainingPaint -= cans18 * 18;
  let cans36 = Math.ceil(remainingPaint / 3.6);
  const suggestedCans = [
    cans18 > 0 ? `${cans18}x 18L` : null,
    cans36 > 0 ? `${cans36}x 3.6L` : null
  ].filter(Boolean).join(" + ") || "Tinta não necessária";

  // 6. Primer (Selador) Calculation - 1 coat, approx 300m2/L
  const primerLiters = (netArea * 1 / 300) * (1 + WASTE_FACTOR);
  let remPrimer = primerLiters;
  let p18 = Math.floor(remPrimer / 18);
  remPrimer -= p18 * 18;
  let p36 = Math.ceil(remPrimer / 3.6);
  const primerCans = [
    p18 > 0 ? `${p18}x 18L` : null,
    p36 > 0 ? `${p36}x 3.6L` : null
  ].filter(Boolean).join(" + ") || "Não necessário";

  // 7. Putty (Massa Corrida) Calculation - approx 1kg/m2
  const puttyKg = netArea * 1 * (1 + WASTE_FACTOR);
  const puttyCansCount = Math.ceil(puttyKg / 25);
  const puttyCans = puttyCansCount > 0 ? `${puttyCansCount}x 25kg` : "Não necessário";

  // 8. Estimated Cost
  const paintCost = (cans18 * 260) + (cans36 * 60);
  const primerCost = (p18 * 140) + (p36 * 30);
  const puttyCost = puttyCansCount * 90;
  const estimatedCost = paintCost + primerCost + puttyCost;

  return {
    grossArea: Math.round(grossArea * 100) / 100,
    deductions: Math.round(deductions * 100) / 100,
    netArea: Math.round(netArea * 100) / 100,
    totalLiters: Math.round(totalLiters * 100) / 100,
    wasteAmount: Math.round(wasteAmount * 100) / 100,
    suggestedCans,
    primerLiters: Math.round(primerLiters * 100) / 100,
    primerCans,
    puttyKg: Math.round(puttyKg * 100) / 100,
    puttyCans,
    estimatedCost: Math.round(estimatedCost * 100) / 100
  };
}
