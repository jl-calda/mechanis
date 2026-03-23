export type ProfileType = "W" | "C" | "L" | "HSS";

export interface ProfileShape {
  designation: string;
  type: ProfileType;
  weight: number; // lb/ft
  area: number; // in²
  d: number; // depth, in
  bf: number; // flange width, in
  tf: number; // flange thickness, in
  tw: number; // web thickness, in
  Ix: number; // moment of inertia x-x, in⁴
  Iy: number; // moment of inertia y-y, in⁴
  Sx: number; // section modulus x-x, in³
  Sy: number; // section modulus y-y, in³
  Zx: number; // plastic section modulus x-x, in³
  Zy: number; // plastic section modulus y-y, in³
  rx: number; // radius of gyration x-x, in
  ry: number; // radius of gyration y-y, in
  J: number; // torsional constant, in⁴
  Cw: number; // warping constant, in⁶
  // HSS-specific
  B?: number; // width for HSS
  tdes?: number; // design wall thickness
}
