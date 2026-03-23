export interface BoltGradeData {
  grade: string;
  Fnv_N: number; // Nominal shear stress, threads included (ksi)
  Fnv_X: number; // Nominal shear stress, threads excluded (ksi)
  Fnt: number; // Nominal tensile stress (ksi)
}

export const boltGrades: BoltGradeData[] = [
  { grade: "A325", Fnv_N: 54, Fnv_X: 68, Fnt: 90 },
  { grade: "A490", Fnv_N: 68, Fnv_X: 84, Fnt: 113 },
];

export interface BoltDimensionData {
  diameter: number; // in
  label: string;
  nominalArea: number; // in² (Ab = pi/4 * d²)
  standardHole: number; // in
  oversizedHole: number; // in
  shortSlotWidth: number; // in
  shortSlotLength: number; // in
  longSlotWidth: number; // in
  longSlotLength: number; // in
  minEdgeDistance: number; // in (AISC Table J3.4)
  minPretension: number; // kips (AISC Table J3.1)
}

export const boltDimensions: BoltDimensionData[] = [
  {
    diameter: 0.5,
    label: '1/2"',
    nominalArea: 0.196,
    standardHole: 0.5625,
    oversizedHole: 0.625,
    shortSlotWidth: 0.5625,
    shortSlotLength: 0.6875,
    longSlotWidth: 0.5625,
    longSlotLength: 1.25,
    minEdgeDistance: 0.75,
    minPretension: 12,
  },
  {
    diameter: 0.625,
    label: '5/8"',
    nominalArea: 0.307,
    standardHole: 0.6875,
    oversizedHole: 0.8125,
    shortSlotWidth: 0.6875,
    shortSlotLength: 0.875,
    longSlotWidth: 0.6875,
    longSlotLength: 1.5625,
    minEdgeDistance: 0.875,
    minPretension: 19,
  },
  {
    diameter: 0.75,
    label: '3/4"',
    nominalArea: 0.442,
    standardHole: 0.8125,
    oversizedHole: 0.9375,
    shortSlotWidth: 0.8125,
    shortSlotLength: 1.0,
    longSlotWidth: 0.8125,
    longSlotLength: 1.875,
    minEdgeDistance: 1.0,
    minPretension: 28,
  },
  {
    diameter: 0.875,
    label: '7/8"',
    nominalArea: 0.601,
    standardHole: 0.9375,
    oversizedHole: 1.0625,
    shortSlotWidth: 0.9375,
    shortSlotLength: 1.125,
    longSlotWidth: 0.9375,
    longSlotLength: 2.1875,
    minEdgeDistance: 1.125,
    minPretension: 39,
  },
  {
    diameter: 1.0,
    label: '1"',
    nominalArea: 0.785,
    standardHole: 1.0625,
    oversizedHole: 1.25,
    shortSlotWidth: 1.0625,
    shortSlotLength: 1.3125,
    longSlotWidth: 1.0625,
    longSlotLength: 2.5,
    minEdgeDistance: 1.25,
    minPretension: 51,
  },
  {
    diameter: 1.125,
    label: '1-1/8"',
    nominalArea: 0.994,
    standardHole: 1.1875,
    oversizedHole: 1.4375,
    shortSlotWidth: 1.1875,
    shortSlotLength: 1.5,
    longSlotWidth: 1.1875,
    longSlotLength: 2.8125,
    minEdgeDistance: 1.5,
    minPretension: 64,
  },
  {
    diameter: 1.25,
    label: '1-1/4"',
    nominalArea: 1.227,
    standardHole: 1.375,
    oversizedHole: 1.5625,
    shortSlotWidth: 1.375,
    shortSlotLength: 1.625,
    longSlotWidth: 1.375,
    longSlotLength: 3.125,
    minEdgeDistance: 1.625,
    minPretension: 80,
  },
];

export function getBoltDimension(diameter: number) {
  return boltDimensions.find((b) => Math.abs(b.diameter - diameter) < 0.001);
}

export function getBoltGrade(grade: string) {
  return boltGrades.find((g) => g.grade === grade);
}
