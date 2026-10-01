/**
 * Utility functions for professional paint calculation.
 */

export interface Wall {
  width: number;
  height: number;
}

export interface Opening {
  type: 'door' | 'window';
  count: number;
  width?: number;
  height?: number;
}

export interface CalculationResult {
  grossArea: number;
  deductions: number;
  netArea: number;
  totalLiters: number;
  suggestedCans: string;
  wasteAmount: number;
  primerLiters: number;
  primerCans: string;
  puttyKg: number;
  puttyCans: string;
  estimatedCost: number;
  suggestedTools: string[];
}

const DEFAULT_DOOR_AREA = 2.1;
const DEFAULT_WINDOW_AREA = 1.2;
const WASTE_FACTOR = 0.1;

export function calculatePaint(
  walls: Wall[],
  openings: Opening[],
  ceilingArea: number,
  coverage: number,
  coats: number
): CalculationResult {
  const grossArea = walls.reduce((sum, wall) => sum + (wall.width * wall.height), 0);

  const deductions = openings.reduce((sum, opening) => {
    const areaPerUnit = (opening.width && opening.height)
      ? (opening.width * opening.height)
      : (opening.type === 'door' ? DEFAULT_DOOR_AREA : DEFAULT_WINDOW_AREA);
    return sum + (opening.count * areaPerUnit);
  }, 0);

  const netArea = Math.max(0, grossArea - deductions) + ceilingArea;
  const theoreticalLiters = (netArea * coats / coverage);
  const totalLiters = theoreticalLiters * (1 + WASTE_FACTOR);
  const wasteAmount = totalLiters - theoreticalLiters;

  let remainingPaint = totalLiters;
  let cans18 = Math.floor(remainingPaint / 18);
  remainingPaint -= cans18 * 18;
  let cans36 = Math.ceil(remainingPaint / 3.6);
  const suggestedCans = [
    cans18 > 0 ? `${cans18}x 18L` : null,
    cans36 > 0 ? `${cans36}x 3.6L` : null
  ].filter(Boolean).join(" + ") || "Tinta não necessária";

  const primerLiters = (netArea * 1 / 300) * (1 + WASTE_FACTOR);
  let remPrimer = primerLiters;
  let p18 = Math.floor(remPrimer / 18);
  remPrimer -= p18 * 18;
  let p36 = Math.ceil(remPrimer / 3.6);
  const primerCans = [
    p18 > 0 ? `${p18}x 18L` : null,
    p36 > 0 ? `${p36}x 3.6L` : null
  ].filter(Boolean).join(" + ") || "Não necessário";

  const puttyKg = netArea * 1 * (1 + WASTE_FACTOR);
  const puttyCansCount = Math.ceil(puttyKg / 25);
  const puttyCans = puttyCansCount > 0 ? `${puttyCansCount}x 25kg` : "Não necessário";

  const paintCost = (cans18 * 260) + (cans36 * 60);
  const primerCost = (p18 * 140) + (p36 * 30);
  const puttyCost = puttyCansCount * 90;
  const estimatedCost = paintCost + primerCost + puttyCost;

  const suggestedTools = [];
  if (netArea > 0) {
    suggestedTools.push("Rolo de Lã 23cm");
    suggestedTools.push("Bandeja de Pintura");
    suggestedTools.push("Fita Crepe");
  }
  if (netArea > 50) {
    suggestedTools.push("Misturador de Tinta");
  }
  if (deductions > 0) {
    suggestedTools.push("Pincel para Recortes");
  }

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
    estimatedCost: Math.round(estimatedCost * 100) / 100,
    suggestedTools
  };
}
