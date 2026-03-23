import type { ProfileShape } from "@/types/profile";
import { enProfiles } from "./en-profiles";

export const profiles: ProfileShape[] = [
  // W-Shapes (Wide Flange)
  { designation: "W8x31", type: "W", standard: "AISC", weight: 31, area: 9.13, d: 8.0, bf: 8.0, tf: 0.435, tw: 0.285, Ix: 110, Iy: 37.1, Sx: 27.5, Sy: 9.27, Zx: 30.4, Zy: 14.1, rx: 3.47, ry: 2.02, J: 0.536, Cw: 530 },
  { designation: "W10x33", type: "W", standard: "AISC", weight: 33, area: 9.71, d: 9.73, bf: 7.96, tf: 0.435, tw: 0.290, Ix: 171, Iy: 36.6, Sx: 35.0, Sy: 9.20, Zx: 38.8, Zy: 14.0, rx: 4.19, ry: 1.94, J: 0.583, Cw: 710 },
  { designation: "W10x49", type: "W", standard: "AISC", weight: 49, area: 14.4, d: 10.0, bf: 10.0, tf: 0.560, tw: 0.340, Ix: 272, Iy: 93.4, Sx: 54.6, Sy: 18.7, Zx: 60.4, Zy: 28.3, rx: 4.35, ry: 2.54, J: 1.39, Cw: 1710 },
  { designation: "W12x26", type: "W", standard: "AISC", weight: 26, area: 7.65, d: 12.2, bf: 6.49, tf: 0.380, tw: 0.230, Ix: 204, Iy: 17.3, Sx: 33.4, Sy: 5.34, Zx: 37.2, Zy: 8.17, rx: 5.17, ry: 1.51, J: 0.300, Cw: 607 },
  { designation: "W12x50", type: "W", standard: "AISC", weight: 50, area: 14.6, d: 12.2, bf: 8.08, tf: 0.640, tw: 0.370, Ix: 394, Iy: 56.3, Sx: 64.7, Sy: 13.9, Zx: 72.4, Zy: 21.4, rx: 5.18, ry: 1.96, J: 1.71, Cw: 1880 },
  { designation: "W12x65", type: "W", standard: "AISC", weight: 65, area: 19.1, d: 12.1, bf: 12.0, tf: 0.605, tw: 0.390, Ix: 533, Iy: 174, Sx: 87.9, Sy: 29.1, Zx: 96.8, Zy: 44.1, rx: 5.28, ry: 3.02, J: 2.18, Cw: 5780 },
  { designation: "W14x22", type: "W", standard: "AISC", weight: 22, area: 6.49, d: 13.7, bf: 5.00, tf: 0.335, tw: 0.230, Ix: 199, Iy: 7.00, Sx: 29.0, Sy: 2.80, Zx: 33.2, Zy: 4.39, rx: 5.54, ry: 1.04, J: 0.208, Cw: 314 },
  { designation: "W14x30", type: "W", standard: "AISC", weight: 30, area: 8.85, d: 13.8, bf: 6.73, tf: 0.385, tw: 0.270, Ix: 291, Iy: 19.6, Sx: 42.0, Sy: 5.82, Zx: 47.3, Zy: 8.99, rx: 5.73, ry: 1.49, J: 0.380, Cw: 887 },
  { designation: "W14x48", type: "W", standard: "AISC", weight: 48, area: 14.1, d: 13.8, bf: 8.03, tf: 0.595, tw: 0.340, Ix: 485, Iy: 51.4, Sx: 70.3, Sy: 12.8, Zx: 78.4, Zy: 19.6, rx: 5.85, ry: 1.91, J: 1.45, Cw: 2240 },
  { designation: "W14x90", type: "W", standard: "AISC", weight: 90, area: 26.5, d: 14.0, bf: 14.5, tf: 0.710, tw: 0.440, Ix: 999, Iy: 362, Sx: 143, Sy: 49.9, Zx: 157, Zy: 75.6, rx: 6.14, ry: 3.70, J: 4.06, Cw: 16000 },
  { designation: "W14x132", type: "W", standard: "AISC", weight: 132, area: 38.8, d: 14.7, bf: 14.7, tf: 1.03, tw: 0.645, Ix: 1530, Iy: 548, Sx: 209, Sy: 74.5, Zx: 234, Zy: 113, rx: 6.28, ry: 3.76, J: 12.3, Cw: 25500 },
  { designation: "W16x36", type: "W", standard: "AISC", weight: 36, area: 10.6, d: 15.9, bf: 6.99, tf: 0.430, tw: 0.295, Ix: 448, Iy: 24.5, Sx: 56.5, Sy: 7.00, Zx: 64.0, Zy: 10.8, rx: 6.51, ry: 1.52, J: 0.545, Cw: 1460 },
  { designation: "W16x57", type: "W", standard: "AISC", weight: 57, area: 16.8, d: 16.4, bf: 7.12, tf: 0.715, tw: 0.430, Ix: 758, Iy: 43.1, Sx: 92.2, Sy: 12.1, Zx: 105, Zy: 18.9, rx: 6.72, ry: 1.60, J: 2.22, Cw: 2680 },
  { designation: "W18x35", type: "W", standard: "AISC", weight: 35, area: 10.3, d: 17.7, bf: 6.00, tf: 0.425, tw: 0.300, Ix: 510, Iy: 15.3, Sx: 57.6, Sy: 5.12, Zx: 66.5, Zy: 8.06, rx: 7.04, ry: 1.22, J: 0.506, Cw: 1140 },
  { designation: "W18x50", type: "W", standard: "AISC", weight: 50, area: 14.7, d: 18.0, bf: 7.50, tf: 0.570, tw: 0.355, Ix: 800, Iy: 40.1, Sx: 88.9, Sy: 10.7, Zx: 101, Zy: 16.6, rx: 7.38, ry: 1.65, J: 1.24, Cw: 3040 },
  { designation: "W21x44", type: "W", standard: "AISC", weight: 44, area: 13.0, d: 20.7, bf: 6.50, tf: 0.450, tw: 0.350, Ix: 843, Iy: 20.7, Sx: 81.6, Sy: 6.36, Zx: 95.4, Zy: 10.2, rx: 8.06, ry: 1.26, J: 0.770, Cw: 1710 },
  { designation: "W21x62", type: "W", standard: "AISC", weight: 62, area: 18.3, d: 21.0, bf: 8.24, tf: 0.615, tw: 0.400, Ix: 1330, Iy: 57.5, Sx: 127, Sy: 13.9, Zx: 144, Zy: 21.7, rx: 8.54, ry: 1.77, J: 1.83, Cw: 5170 },
  { designation: "W24x55", type: "W", standard: "AISC", weight: 55, area: 16.2, d: 23.6, bf: 7.01, tf: 0.505, tw: 0.395, Ix: 1350, Iy: 29.1, Sx: 114, Sy: 8.30, Zx: 134, Zy: 13.3, rx: 9.11, ry: 1.34, J: 1.18, Cw: 3100 },
  { designation: "W24x84", type: "W", standard: "AISC", weight: 84, area: 24.7, d: 24.1, bf: 9.02, tf: 0.770, tw: 0.470, Ix: 2370, Iy: 94.4, Sx: 196, Sy: 20.9, Zx: 224, Zy: 32.6, rx: 9.79, ry: 1.95, J: 3.70, Cw: 9430 },

  // C-Shapes (Channels)
  { designation: "C6x8.2", type: "C", standard: "AISC", weight: 8.2, area: 2.40, d: 6.0, bf: 1.92, tf: 0.343, tw: 0.200, Ix: 13.1, Iy: 0.693, Sx: 4.38, Sy: 0.492, Zx: 5.16, Zy: 0.960, rx: 2.34, ry: 0.537, J: 0.0660, Cw: 4.58 },
  { designation: "C8x11.5", type: "C", standard: "AISC", weight: 11.5, area: 3.38, d: 8.0, bf: 2.26, tf: 0.390, tw: 0.220, Ix: 32.6, Iy: 1.32, Sx: 8.14, Sy: 0.781, Zx: 9.63, Zy: 1.53, rx: 3.11, ry: 0.625, J: 0.131, Cw: 11.0 },
  { designation: "C10x15.3", type: "C", standard: "AISC", weight: 15.3, area: 4.49, d: 10.0, bf: 2.60, tf: 0.436, tw: 0.240, Ix: 67.4, Iy: 2.28, Sx: 13.5, Sy: 1.16, Zx: 15.8, Zy: 2.27, rx: 3.87, ry: 0.713, J: 0.209, Cw: 22.1 },
  { designation: "C12x20.7", type: "C", standard: "AISC", weight: 20.7, area: 6.09, d: 12.0, bf: 2.94, tf: 0.501, tw: 0.282, Ix: 129, Iy: 3.88, Sx: 21.5, Sy: 1.73, Zx: 25.0, Zy: 3.42, rx: 4.61, ry: 0.799, J: 0.368, Cw: 43.0 },
  { designation: "C15x33.9", type: "C", standard: "AISC", weight: 33.9, area: 9.96, d: 15.0, bf: 3.40, tf: 0.650, tw: 0.400, Ix: 315, Iy: 8.13, Sx: 42.0, Sy: 3.11, Zx: 48.4, Zy: 6.19, rx: 5.62, ry: 0.904, J: 0.904, Cw: 116 },

  // L-Shapes (Angles) — equal legs
  { designation: "L3x3x1/4", type: "L", standard: "AISC", weight: 4.9, area: 1.44, d: 3.0, bf: 3.0, tf: 0.25, tw: 0.25, Ix: 1.24, Iy: 1.24, Sx: 0.577, Sy: 0.577, Zx: 1.04, Zy: 1.04, rx: 0.930, ry: 0.930, J: 0.0305, Cw: 0 },
  { designation: "L3x3x3/8", type: "L", standard: "AISC", weight: 7.2, area: 2.11, d: 3.0, bf: 3.0, tf: 0.375, tw: 0.375, Ix: 1.76, Iy: 1.76, Sx: 0.833, Sy: 0.833, Zx: 1.52, Zy: 1.52, rx: 0.913, ry: 0.913, J: 0.0977, Cw: 0 },
  { designation: "L4x4x1/4", type: "L", standard: "AISC", weight: 6.6, area: 1.94, d: 4.0, bf: 4.0, tf: 0.25, tw: 0.25, Ix: 3.04, Iy: 3.04, Sx: 1.05, Sy: 1.05, Zx: 1.89, Zy: 1.89, rx: 1.25, ry: 1.25, J: 0.0412, Cw: 0 },
  { designation: "L4x4x3/8", type: "L", standard: "AISC", weight: 9.8, area: 2.86, d: 4.0, bf: 4.0, tf: 0.375, tw: 0.375, Ix: 4.36, Iy: 4.36, Sx: 1.52, Sy: 1.52, Zx: 2.76, Zy: 2.76, rx: 1.23, ry: 1.23, J: 0.132, Cw: 0 },
  { designation: "L4x4x1/2", type: "L", standard: "AISC", weight: 12.8, area: 3.75, d: 4.0, bf: 4.0, tf: 0.50, tw: 0.50, Ix: 5.56, Iy: 5.56, Sx: 1.97, Sy: 1.97, Zx: 3.60, Zy: 3.60, rx: 1.22, ry: 1.22, J: 0.307, Cw: 0 },
  { designation: "L5x5x3/8", type: "L", standard: "AISC", weight: 12.3, area: 3.61, d: 5.0, bf: 5.0, tf: 0.375, tw: 0.375, Ix: 8.74, Iy: 8.74, Sx: 2.42, Sy: 2.42, Zx: 4.37, Zy: 4.37, rx: 1.56, ry: 1.56, J: 0.166, Cw: 0 },
  { designation: "L5x5x1/2", type: "L", standard: "AISC", weight: 16.2, area: 4.75, d: 5.0, bf: 5.0, tf: 0.50, tw: 0.50, Ix: 11.3, Iy: 11.3, Sx: 3.16, Sy: 3.16, Zx: 5.75, Zy: 5.75, rx: 1.54, ry: 1.54, J: 0.391, Cw: 0 },
  { designation: "L6x6x3/8", type: "L", standard: "AISC", weight: 14.9, area: 4.36, d: 6.0, bf: 6.0, tf: 0.375, tw: 0.375, Ix: 15.4, Iy: 15.4, Sx: 3.53, Sy: 3.53, Zx: 6.37, Zy: 6.37, rx: 1.88, ry: 1.88, J: 0.200, Cw: 0 },
  { designation: "L6x6x1/2", type: "L", standard: "AISC", weight: 19.6, area: 5.75, d: 6.0, bf: 6.0, tf: 0.50, tw: 0.50, Ix: 19.9, Iy: 19.9, Sx: 4.61, Sy: 4.61, Zx: 8.41, Zy: 8.41, rx: 1.86, ry: 1.86, J: 0.476, Cw: 0 },

  // HSS (Hollow Structural Sections) — rectangular
  { designation: "HSS4x4x1/4", type: "HSS", standard: "AISC", weight: 12.21, area: 3.37, d: 4.0, bf: 4.0, tf: 0.233, tw: 0.233, Ix: 8.97, Iy: 8.97, Sx: 4.49, Sy: 4.49, Zx: 5.39, Zy: 5.39, rx: 1.63, ry: 1.63, J: 14.7, Cw: 0, B: 4.0, tdes: 0.233 },
  { designation: "HSS4x4x3/8", type: "HSS", standard: "AISC", weight: 17.27, area: 4.78, d: 4.0, bf: 4.0, tf: 0.349, tw: 0.349, Ix: 11.9, Iy: 11.9, Sx: 5.97, Sy: 5.97, Zx: 7.38, Zy: 7.38, rx: 1.58, ry: 1.58, J: 19.9, Cw: 0, B: 4.0, tdes: 0.349 },
  { designation: "HSS6x4x1/4", type: "HSS", standard: "AISC", weight: 15.62, area: 4.30, d: 6.0, bf: 4.0, tf: 0.233, tw: 0.233, Ix: 22.1, Iy: 11.7, Sx: 7.36, Sy: 5.87, Zx: 8.67, Zy: 6.72, rx: 2.27, ry: 1.65, J: 24.3, Cw: 0, B: 4.0, tdes: 0.233 },
  { designation: "HSS6x6x1/4", type: "HSS", standard: "AISC", weight: 19.02, area: 5.24, d: 6.0, bf: 6.0, tf: 0.233, tw: 0.233, Ix: 25.6, Iy: 25.6, Sx: 8.53, Sy: 8.53, Zx: 9.97, Zy: 9.97, rx: 2.21, ry: 2.21, J: 40.9, Cw: 0, B: 6.0, tdes: 0.233 },
  { designation: "HSS6x6x3/8", type: "HSS", standard: "AISC", weight: 27.48, area: 7.58, d: 6.0, bf: 6.0, tf: 0.349, tw: 0.349, Ix: 35.1, Iy: 35.1, Sx: 11.7, Sy: 11.7, Zx: 14.0, Zy: 14.0, rx: 2.15, ry: 2.15, J: 57.1, Cw: 0, B: 6.0, tdes: 0.349 },
  { designation: "HSS6x6x1/2", type: "HSS", standard: "AISC", weight: 35.24, area: 9.74, d: 6.0, bf: 6.0, tf: 0.465, tw: 0.465, Ix: 42.5, Iy: 42.5, Sx: 14.2, Sy: 14.2, Zx: 17.5, Zy: 17.5, rx: 2.09, ry: 2.09, J: 70.4, Cw: 0, B: 6.0, tdes: 0.465 },
  { designation: "HSS8x4x1/4", type: "HSS", standard: "AISC", weight: 19.02, area: 5.24, d: 8.0, bf: 4.0, tf: 0.233, tw: 0.233, Ix: 41.6, Iy: 14.0, Sx: 10.4, Sy: 7.00, Zx: 12.5, Zy: 7.87, rx: 2.82, ry: 1.63, J: 34.7, Cw: 0, B: 4.0, tdes: 0.233 },
  { designation: "HSS8x8x3/8", type: "HSS", standard: "AISC", weight: 37.69, area: 10.4, d: 8.0, bf: 8.0, tf: 0.349, tw: 0.349, Ix: 88.1, Iy: 88.1, Sx: 22.0, Sy: 22.0, Zx: 25.8, Zy: 25.8, rx: 2.91, ry: 2.91, J: 139, Cw: 0, B: 8.0, tdes: 0.349 },
  { designation: "HSS8x8x1/2", type: "HSS", standard: "AISC", weight: 48.85, area: 13.5, d: 8.0, bf: 8.0, tf: 0.465, tw: 0.465, Ix: 109, Iy: 109, Sx: 27.2, Sy: 27.2, Zx: 32.8, Zy: 32.8, rx: 2.84, ry: 2.84, J: 175, Cw: 0, B: 8.0, tdes: 0.465 },

  // EN 10219 / EN 10162 — Cold-formed sections
  ...enProfiles,
];

export function getProfilesByType(type: ProfileShape["type"]) {
  return profiles.filter((p) => p.type === type);
}

export function getProfilesByStandard(standard: ProfileShape["standard"]) {
  return profiles.filter((p) => p.standard === standard);
}

export function getProfilesByStandardAndType(standard: ProfileShape["standard"], type: ProfileShape["type"]) {
  return profiles.filter((p) => p.standard === standard && p.type === type);
}
