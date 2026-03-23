import type { BoltInput, BoltResult } from "@/types/bolt";
import { getBoltDimension, getBoltGrade } from "@/data/bolt-standards";

const PHI_SHEAR = 0.75;
const PHI_BEARING = 0.75;
const MU_CLASS_A = 0.3;
const DU = 1.13;

export function calcBoltArea(diameter: number): number {
  return (Math.PI / 4) * diameter * diameter;
}

export function getHoleDiameter(
  diameter: number,
  holeType: BoltInput["holeType"]
): number {
  const dim = getBoltDimension(diameter);
  if (!dim) return diameter + 1 / 16;
  switch (holeType) {
    case "standard":
      return dim.standardHole;
    case "oversized":
      return dim.oversizedHole;
    case "short-slot":
      return dim.shortSlotWidth;
    case "long-slot":
      return dim.longSlotWidth;
  }
}

export function calcShearCapacity(input: BoltInput): number {
  const gradeData = getBoltGrade(input.grade);
  if (!gradeData) return 0;
  const Fnv =
    input.threadCondition === "excluded" ? gradeData.Fnv_X : gradeData.Fnv_N;
  const Ab = calcBoltArea(input.diameter);
  return PHI_SHEAR * Fnv * Ab * input.numShearPlanes;
}

export function calcBearingCapacity(input: BoltInput): number {
  // AISC J3-6a: phi * 2.4 * d * t * Fu (deformation at service load considered)
  return PHI_BEARING * 2.4 * input.diameter * input.plateThickness * input.plateFu;
}

export function calcTearoutCapacity(input: BoltInput): number {
  // AISC J3-6c: phi * 1.2 * Lc * t * Fu
  const holeDia = getHoleDiameter(input.diameter, input.holeType);
  const Lc = input.edgeDistVert - holeDia / 2;
  if (Lc <= 0) return 0;
  return PHI_BEARING * 1.2 * Lc * input.plateThickness * input.plateFu;
}

export function calcSlipCapacity(input: BoltInput): number {
  const dim = getBoltDimension(input.diameter);
  if (!dim) return 0;
  // AISC J3-4: phi * mu * Du * hf * Tb * ns
  const phi = 1.0; // serviceability limit state
  const hf = 1.0; // filler factor, no fillers
  return phi * MU_CLASS_A * DU * hf * dim.minPretension * input.numShearPlanes;
}

export function checkEdgeDistance(
  diameter: number,
  edgeDist: number
): { passes: boolean; minimum: number; provided: number } {
  const dim = getBoltDimension(diameter);
  const minimum = dim?.minEdgeDistance ?? diameter;
  return { passes: edgeDist >= minimum, minimum, provided: edgeDist };
}

export function checkSpacing(
  diameter: number,
  spacing: number
): { passes: boolean; minimum: number; provided: number } {
  const minimum = 2.667 * diameter; // 2-2/3 d
  return { passes: spacing >= minimum, minimum, provided: spacing };
}

export function calcBoltGroup(input: BoltInput): BoltResult {
  const numBolts = input.numRows * input.numCols;
  const shearCap = calcShearCapacity(input);
  const bearingCap = calcBearingCapacity(input);
  const tearoutCap = calcTearoutCapacity(input);

  let capacityPerBolt: number;
  let controllingMode: string;

  if (input.connectionType === "slip-critical") {
    const slipCap = calcSlipCapacity(input);
    capacityPerBolt = Math.min(slipCap, shearCap, bearingCap, tearoutCap);
    if (capacityPerBolt === slipCap) controllingMode = "Slip";
    else if (capacityPerBolt === shearCap) controllingMode = "Bolt Shear";
    else if (capacityPerBolt === tearoutCap) controllingMode = "Tearout";
    else controllingMode = "Bearing";
  } else {
    capacityPerBolt = Math.min(shearCap, bearingCap, tearoutCap);
    if (capacityPerBolt === shearCap) controllingMode = "Bolt Shear";
    else if (capacityPerBolt === tearoutCap) controllingMode = "Tearout";
    else controllingMode = "Bearing";
  }

  const edgeCheck = checkEdgeDistance(input.diameter, Math.min(input.edgeDistVert, input.edgeDistHoriz));
  const spacingCheck = checkSpacing(input.diameter, Math.min(input.pitch, input.gage));

  return {
    shearCapacityPerBolt: Math.round(shearCap * 100) / 100,
    bearingCapacityPerBolt: Math.round(bearingCap * 100) / 100,
    tearoutCapacityPerBolt: Math.round(tearoutCap * 100) / 100,
    groupCapacity: Math.round(capacityPerBolt * numBolts * 100) / 100,
    controllingCapacity: Math.round(capacityPerBolt * 100) / 100,
    controllingMode,
    edgeDistanceCheck: edgeCheck,
    spacingCheck,
    numBolts,
  };
}
