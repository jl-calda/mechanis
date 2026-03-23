import type { WeldInput, WeldResult } from "@/types/weld";

const PHI_WELD = 0.75;

const ELECTRODE_STRENGTH: Record<string, number> = {
  E70XX: 70,
  E80XX: 80,
  E90XX: 90,
};

// AISC Table J2.4: Minimum fillet weld size
const MIN_WELD_SIZE_TABLE: [number, number][] = [
  [0.25, 0.125], // t <= 1/4" -> 1/8"
  [0.5, 0.1875], // 1/4" < t <= 1/2" -> 3/16"
  [0.75, 0.25], // 1/2" < t <= 3/4" -> 1/4"
  [Infinity, 0.3125], // t > 3/4" -> 5/16"
];

export function calcEffectiveThroat(weldSize: number): number {
  return weldSize * 0.707; // equal-leg fillet: a = w * sin(45°)
}

export function calcMinWeldSize(thickness: number): number {
  for (const [maxT, minSize] of MIN_WELD_SIZE_TABLE) {
    if (thickness <= maxT) return minSize;
  }
  return 0.3125;
}

export function calcMaxWeldSize(edgeThickness: number): number {
  if (edgeThickness < 0.25) return edgeThickness;
  return edgeThickness - 1 / 16;
}

export function calcWeldGroup(input: WeldInput): WeldResult {
  const Fexx = ELECTRODE_STRENGTH[input.electrodeType] ?? 70;
  const throat = calcEffectiveThroat(input.weldSize);
  const angleRad = (input.angle * Math.PI) / 180;

  // AISC J2-5: Directional strength increase
  // Fnw = 0.60 * Fexx * (1.0 + 0.50 * sin^1.5(theta))
  const directionalFactor = 1.0 + 0.5 * Math.pow(Math.sin(angleRad), 1.5);
  const Fnw = 0.6 * Fexx * directionalFactor;

  // Weld metal capacity
  const weldMetalCapacity =
    PHI_WELD * Fnw * throat * input.weldLength * input.numberOfWelds;

  // Base metal checks (shear rupture: 0.60 * Fu * t)
  const bm1Capacity =
    PHI_WELD *
    0.6 *
    input.baseMetal1Fu *
    input.baseMetal1Thickness *
    input.weldLength *
    input.numberOfWelds;
  const bm2Capacity =
    PHI_WELD *
    0.6 *
    input.baseMetal2Fu *
    input.baseMetal2Thickness *
    input.weldLength *
    input.numberOfWelds;
  const baseMetalCapacity = Math.min(bm1Capacity, bm2Capacity);

  const controllingCapacity = Math.min(weldMetalCapacity, baseMetalCapacity);
  const controllingMode =
    controllingCapacity === weldMetalCapacity
      ? "Weld Metal"
      : "Base Metal";

  const thickerPart = Math.max(
    input.baseMetal1Thickness,
    input.baseMetal2Thickness
  );
  const thinnerEdge = Math.min(
    input.baseMetal1Thickness,
    input.baseMetal2Thickness
  );
  const minimumWeldSize = calcMinWeldSize(thickerPart);
  const maximumWeldSize = calcMaxWeldSize(thinnerEdge);

  const sizeCheck =
    input.weldSize >= minimumWeldSize && input.weldSize <= maximumWeldSize;
  const lengthCheck = input.weldLength >= 4 * input.weldSize;

  const totalLength = input.weldLength * input.numberOfWelds;
  const capacityPerInch = totalLength > 0 ? controllingCapacity / totalLength : 0;

  return {
    weldMetalCapacity: Math.round(weldMetalCapacity * 100) / 100,
    baseMetalCapacity: Math.round(baseMetalCapacity * 100) / 100,
    controllingCapacity: Math.round(controllingCapacity * 100) / 100,
    controllingMode,
    effectiveThroat: Math.round(throat * 1000) / 1000,
    capacityPerInch: Math.round(capacityPerInch * 100) / 100,
    minimumWeldSize,
    maximumWeldSize: Math.round(maximumWeldSize * 1000) / 1000,
    sizeCheck,
    lengthCheck,
  };
}
