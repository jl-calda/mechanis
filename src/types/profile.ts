export type ProfileType = "W" | "C" | "L" | "HSS" | "SHS" | "RHS" | "CHS" | "CF-C" | "CF-Z";

export type ProfileStandard = "AISC" | "EN";
export type UnitSystem = "imperial" | "metric";

export interface ProfileShape {
  designation: string;
  type: ProfileType;
  standard: ProfileStandard;
  weight: number; // lb/ft (AISC) or kg/m (EN)
  area: number; // in² (AISC) or mm² (EN) — gross cross-section area
  d: number; // depth / height, in or mm
  bf: number; // flange width / width, in or mm
  tf: number; // flange thickness / wall thickness, in or mm
  tw: number; // web thickness / wall thickness, in or mm
  Ix: number; // moment of inertia x-x, in⁴ or mm⁴ (×10⁴ for EN display)
  Iy: number; // moment of inertia y-y, in⁴ or mm⁴
  Sx: number; // section modulus x-x, in³ or mm³ (×10³ for EN display)
  Sy: number; // section modulus y-y, in³ or mm³
  Zx: number; // plastic section modulus x-x, in³ or mm³
  Zy: number; // plastic section modulus y-y, in³ or mm³
  rx: number; // radius of gyration x-x, in or mm
  ry: number; // radius of gyration y-y, in or mm
  J: number; // torsional constant, in⁴ or mm⁴
  Cw: number; // warping constant, in⁶ or mm⁶
  // HSS / RHS / SHS specific
  B?: number; // width for HSS/RHS/SHS
  tdes?: number; // design wall thickness
  // CHS specific
  D?: number; // outer diameter for CHS
  // Cold-formed specific
  ri?: number; // inner corner radius
  lip?: number; // lip depth for CF-C, CF-Z
}

export function getUnitSystem(standard: ProfileStandard): UnitSystem {
  return standard === "EN" ? "metric" : "imperial";
}
