import type { ProfileShape } from "@/types/profile";

/**
 * EN 10219 Cold-formed welded structural hollow sections
 * All dimensions in mm, areas in mm², moments in mm⁴ (×10⁴), section moduli in mm³ (×10³)
 * Weight in kg/m
 *
 * Note: Values stored in raw units (mm, mm², mm⁴, mm³) for computation.
 * Display formatting handles ×10⁴ / ×10³ scaling.
 */

// Helper: compute SHS/RHS section properties from outer dimensions and wall thickness
function rhs(designation: string, type: "SHS" | "RHS", h: number, b: number, t: number, ri: number): ProfileShape {
  const ro = ri + t;
  // Corner deduction area
  const Ac = (4 - Math.PI) * (ro * ro - ri * ri);
  const A = 2 * t * (h + b - 2 * t) - Ac;
  const weight = A * 7850 / 1e6; // kg/m (steel density 7850 kg/m³)

  // Outer and inner second moments (approximate rectangular with corner correction)
  const Ix = (b * h * h * h - (b - 2 * t) * (h - 2 * t) ** 3) / 12
    - 2 * (ro ** 4 - ri ** 4) * (1 - Math.PI / 4) * 0.5; // corner correction
  const Iy = (h * b * b * b - (h - 2 * t) * (b - 2 * t) ** 3) / 12
    - 2 * (ro ** 4 - ri ** 4) * (1 - Math.PI / 4) * 0.5;

  const Sx = 2 * Ix / h;
  const Sy = 2 * Iy / b;

  // Plastic moduli (approximate)
  const Zx = (b * h * h / 4 - (b - 2 * t) * (h - 2 * t) ** 2 / 4);
  const Zy = (h * b * b / 4 - (h - 2 * t) * (b - 2 * t) ** 2 / 4);

  const rx = Math.sqrt(Ix / A);
  const ry = Math.sqrt(Iy / A);

  // Torsional constant for RHS (Bredt formula)
  const Am = (h - t) * (b - t); // enclosed area at midline
  const pm = 2 * ((h - t) + (b - t)); // midline perimeter
  const J = 4 * Am * Am * t / pm;

  return {
    designation,
    type,
    standard: "EN",
    weight: Math.round(weight * 100) / 100,
    area: Math.round(A),
    d: h,
    bf: b,
    tf: t,
    tw: t,
    Ix: Math.round(Ix),
    Iy: Math.round(Iy),
    Sx: Math.round(Sx),
    Sy: Math.round(Sy),
    Zx: Math.round(Zx),
    Zy: Math.round(Zy),
    rx: Math.round(rx * 10) / 10,
    ry: Math.round(ry * 10) / 10,
    J: Math.round(J),
    Cw: 0,
    B: b,
    tdes: t,
    ri,
  };
}

function chs(designation: string, D: number, t: number): ProfileShape {
  const Di = D - 2 * t;
  const A = Math.PI / 4 * (D * D - Di * Di);
  const weight = A * 7850 / 1e6;
  const Ix = Math.PI / 64 * (D ** 4 - Di ** 4);
  const Iy = Ix;
  const Sx = 2 * Ix / D;
  const Sy = Sx;
  const Zx = (D ** 3 - Di ** 3) / 6;
  const Zy = Zx;
  const rx = Math.sqrt(Ix / A);
  const ry = rx;
  const J = 2 * Ix; // polar = 2× for circle
  return {
    designation,
    type: "CHS",
    standard: "EN",
    weight: Math.round(weight * 100) / 100,
    area: Math.round(A),
    d: D,
    bf: D,
    tf: t,
    tw: t,
    Ix: Math.round(Ix),
    Iy: Math.round(Iy),
    Sx: Math.round(Sx),
    Sy: Math.round(Sy),
    Zx: Math.round(Zx),
    Zy: Math.round(Zy),
    rx: Math.round(rx * 10) / 10,
    ry: Math.round(ry * 10) / 10,
    J: Math.round(J),
    Cw: 0,
    D,
    tdes: t,
  };
}

// Cold-formed lipped channel (CF-C) — EN 10162 type
// h = overall height, b = flange width, c = lip depth, t = thickness
function cfC(designation: string, h: number, b: number, c: number, t: number, ri: number): ProfileShape {
  // Approximate properties for lipped channel using thin-wall theory
  const hw = h - 2 * t; // web clear height
  const bw = b - t; // flange clear width

  // Area (web + 2 flanges + 2 lips, minus corner material)
  const A = t * (hw + 2 * bw + 2 * c) - 4 * (4 - Math.PI) * ri * t;
  const weight = A * 7850 / 1e6;

  // Centroid from web (measured from back of web)
  const yCg = (2 * bw * t * bw / 2 + 2 * c * t * bw) / A; // approximate

  // Second moments using thin-wall theory
  const Ix = t * hw ** 3 / 12 + 2 * (bw * t ** 3 / 12 + bw * t * (hw / 2) ** 2)
    + 2 * (t * c ** 3 / 12);
  // This is a simplification; real value needs parallel axis for lips
  const Iy = 2 * (t * bw ** 3 / 12 + bw * t * (bw / 2 - yCg) ** 2)
    + hw * t * yCg ** 2
    + 2 * (c * t * (bw - yCg) ** 2);

  const Sx = 2 * Ix / h;
  const Sy = Iy / Math.max(yCg, b - yCg);
  const Zx = t * (h / 2) * (h / 2) + 2 * b * t * (h / 2 - t / 2) + 2 * c * t * (h / 2 - t / 2);
  // Approximate Zx
  const Zx2 = Sx * 1.15; // rough plastic/elastic ratio for channels
  const Zy = Sy * 1.15;
  const rx = Math.sqrt(Ix / A);
  const ry = Math.sqrt(Iy / A);

  // Torsional constant (thin-wall open section)
  const J = (1 / 3) * t ** 3 * (hw + 2 * bw + 2 * c);

  return {
    designation,
    type: "CF-C",
    standard: "EN",
    weight: Math.round(weight * 100) / 100,
    area: Math.round(A),
    d: h,
    bf: b,
    tf: t,
    tw: t,
    Ix: Math.round(Ix),
    Iy: Math.round(Iy),
    Sx: Math.round(Sx),
    Sy: Math.round(Sy),
    Zx: Math.round(Zx2),
    Zy: Math.round(Zy),
    rx: Math.round(rx * 10) / 10,
    ry: Math.round(ry * 10) / 10,
    J: Math.round(J),
    Cw: 0,
    ri,
    lip: c,
  };
}

// Cold-formed Z-section (CF-Z) — EN 10162 type
// h = overall height, b = flange width, c = lip depth, t = thickness
function cfZ(designation: string, h: number, b: number, c: number, t: number, ri: number): ProfileShape {
  const hw = h - 2 * t;
  const bw = b - t;

  const A = t * (hw + 2 * bw + 2 * c) - 4 * (4 - Math.PI) * ri * t;
  const weight = A * 7850 / 1e6;

  // Z-section is point-symmetric about centroid — centroid at mid-height, mid-width
  const Ix = t * hw ** 3 / 12 + 2 * (bw * t * (hw / 2) ** 2)
    + 2 * (t * c ** 3 / 12);
  // Iy for Z is same as C approximately (flanges extend both ways)
  const Iy = 2 * (t * bw ** 3 / 12) + 2 * (c * t * bw ** 2);

  const Sx = 2 * Ix / h;
  const Sy = 2 * Iy / (2 * b);
  const Zx = Sx * 1.15;
  const Zy = Sy * 1.15;
  const rx = Math.sqrt(Ix / A);
  const ry = Math.sqrt(Iy / A);

  const J = (1 / 3) * t ** 3 * (hw + 2 * bw + 2 * c);

  return {
    designation,
    type: "CF-Z",
    standard: "EN",
    weight: Math.round(weight * 100) / 100,
    area: Math.round(A),
    d: h,
    bf: b,
    tf: t,
    tw: t,
    Ix: Math.round(Ix),
    Iy: Math.round(Iy),
    Sx: Math.round(Sx),
    Sy: Math.round(Sy),
    Zx: Math.round(Zx),
    Zy: Math.round(Zy),
    rx: Math.round(rx * 10) / 10,
    ry: Math.round(ry * 10) / 10,
    J: Math.round(J),
    Cw: 0,
    ri,
    lip: c,
  };
}

// ---------- EN 10219 — SHS (Square Hollow Sections, cold-formed) ----------
const shsProfiles: ProfileShape[] = [
  rhs("SHS 40×40×3",   "SHS", 40,  40,  3,   3),
  rhs("SHS 40×40×4",   "SHS", 40,  40,  4,   4),
  rhs("SHS 50×50×3",   "SHS", 50,  50,  3,   3),
  rhs("SHS 50×50×4",   "SHS", 50,  50,  4,   4),
  rhs("SHS 50×50×5",   "SHS", 50,  50,  5,   5),
  rhs("SHS 60×60×3",   "SHS", 60,  60,  3,   3),
  rhs("SHS 60×60×4",   "SHS", 60,  60,  4,   4),
  rhs("SHS 60×60×5",   "SHS", 60,  60,  5,   5),
  rhs("SHS 70×70×3",   "SHS", 70,  70,  3,   3),
  rhs("SHS 70×70×4",   "SHS", 70,  70,  4,   4),
  rhs("SHS 70×70×5",   "SHS", 70,  70,  5,   5),
  rhs("SHS 80×80×3",   "SHS", 80,  80,  3,   3),
  rhs("SHS 80×80×4",   "SHS", 80,  80,  4,   4),
  rhs("SHS 80×80×5",   "SHS", 80,  80,  5,   5),
  rhs("SHS 80×80×6",   "SHS", 80,  80,  6,   6),
  rhs("SHS 90×90×4",   "SHS", 90,  90,  4,   4),
  rhs("SHS 90×90×5",   "SHS", 90,  90,  5,   5),
  rhs("SHS 100×100×3", "SHS", 100, 100, 3,   3),
  rhs("SHS 100×100×4", "SHS", 100, 100, 4,   4),
  rhs("SHS 100×100×5", "SHS", 100, 100, 5,   5),
  rhs("SHS 100×100×6", "SHS", 100, 100, 6,   6),
  rhs("SHS 100×100×8", "SHS", 100, 100, 8,   8),
  rhs("SHS 120×120×4", "SHS", 120, 120, 4,   4),
  rhs("SHS 120×120×5", "SHS", 120, 120, 5,   5),
  rhs("SHS 120×120×6", "SHS", 120, 120, 6,   6),
  rhs("SHS 120×120×8", "SHS", 120, 120, 8,   8),
  rhs("SHS 140×140×5", "SHS", 140, 140, 5,   5),
  rhs("SHS 140×140×6", "SHS", 140, 140, 6,   6),
  rhs("SHS 140×140×8", "SHS", 140, 140, 8,   8),
  rhs("SHS 150×150×5", "SHS", 150, 150, 5,   5),
  rhs("SHS 150×150×6", "SHS", 150, 150, 6,   6),
  rhs("SHS 150×150×8", "SHS", 150, 150, 8,   8),
  rhs("SHS 150×150×10","SHS", 150, 150, 10, 10),
  rhs("SHS 160×160×5", "SHS", 160, 160, 5,   5),
  rhs("SHS 160×160×6", "SHS", 160, 160, 6,   6),
  rhs("SHS 160×160×8", "SHS", 160, 160, 8,   8),
  rhs("SHS 180×180×5", "SHS", 180, 180, 5,   5),
  rhs("SHS 180×180×6", "SHS", 180, 180, 6,   6),
  rhs("SHS 180×180×8", "SHS", 180, 180, 8,   8),
  rhs("SHS 200×200×5", "SHS", 200, 200, 5,   5),
  rhs("SHS 200×200×6", "SHS", 200, 200, 6,   6),
  rhs("SHS 200×200×8", "SHS", 200, 200, 8,   8),
  rhs("SHS 200×200×10","SHS", 200, 200, 10, 10),
  rhs("SHS 250×250×6", "SHS", 250, 250, 6,   6),
  rhs("SHS 250×250×8", "SHS", 250, 250, 8,   8),
  rhs("SHS 250×250×10","SHS", 250, 250, 10, 10),
  rhs("SHS 300×300×8", "SHS", 300, 300, 8,   8),
  rhs("SHS 300×300×10","SHS", 300, 300, 10, 10),
  rhs("SHS 300×300×12","SHS", 300, 300, 12, 12),
];

// ---------- EN 10219 — RHS (Rectangular Hollow Sections, cold-formed) ----------
const rhsProfiles: ProfileShape[] = [
  rhs("RHS 60×40×3",   "RHS", 60,   40,  3,  3),
  rhs("RHS 60×40×4",   "RHS", 60,   40,  4,  4),
  rhs("RHS 80×40×3",   "RHS", 80,   40,  3,  3),
  rhs("RHS 80×40×4",   "RHS", 80,   40,  4,  4),
  rhs("RHS 80×40×5",   "RHS", 80,   40,  5,  5),
  rhs("RHS 80×60×4",   "RHS", 80,   60,  4,  4),
  rhs("RHS 80×60×5",   "RHS", 80,   60,  5,  5),
  rhs("RHS 100×50×3",  "RHS", 100,  50,  3,  3),
  rhs("RHS 100×50×4",  "RHS", 100,  50,  4,  4),
  rhs("RHS 100×50×5",  "RHS", 100,  50,  5,  5),
  rhs("RHS 100×60×4",  "RHS", 100,  60,  4,  4),
  rhs("RHS 100×60×5",  "RHS", 100,  60,  5,  5),
  rhs("RHS 100×80×4",  "RHS", 100,  80,  4,  4),
  rhs("RHS 100×80×5",  "RHS", 100,  80,  5,  5),
  rhs("RHS 120×60×4",  "RHS", 120,  60,  4,  4),
  rhs("RHS 120×60×5",  "RHS", 120,  60,  5,  5),
  rhs("RHS 120×60×6",  "RHS", 120,  60,  6,  6),
  rhs("RHS 120×80×4",  "RHS", 120,  80,  4,  4),
  rhs("RHS 120×80×5",  "RHS", 120,  80,  5,  5),
  rhs("RHS 120×80×6",  "RHS", 120,  80,  6,  6),
  rhs("RHS 140×80×4",  "RHS", 140,  80,  4,  4),
  rhs("RHS 140×80×5",  "RHS", 140,  80,  5,  5),
  rhs("RHS 140×80×6",  "RHS", 140,  80,  6,  6),
  rhs("RHS 150×100×4", "RHS", 150, 100,  4,  4),
  rhs("RHS 150×100×5", "RHS", 150, 100,  5,  5),
  rhs("RHS 150×100×6", "RHS", 150, 100,  6,  6),
  rhs("RHS 150×100×8", "RHS", 150, 100,  8,  8),
  rhs("RHS 160×80×4",  "RHS", 160,  80,  4,  4),
  rhs("RHS 160×80×5",  "RHS", 160,  80,  5,  5),
  rhs("RHS 160×80×6",  "RHS", 160,  80,  6,  6),
  rhs("RHS 200×100×4", "RHS", 200, 100,  4,  4),
  rhs("RHS 200×100×5", "RHS", 200, 100,  5,  5),
  rhs("RHS 200×100×6", "RHS", 200, 100,  6,  6),
  rhs("RHS 200×100×8", "RHS", 200, 100,  8,  8),
  rhs("RHS 200×120×5", "RHS", 200, 120,  5,  5),
  rhs("RHS 200×120×6", "RHS", 200, 120,  6,  6),
  rhs("RHS 200×120×8", "RHS", 200, 120,  8,  8),
  rhs("RHS 200×150×5", "RHS", 200, 150,  5,  5),
  rhs("RHS 200×150×6", "RHS", 200, 150,  6,  6),
  rhs("RHS 200×150×8", "RHS", 200, 150,  8,  8),
  rhs("RHS 250×150×5", "RHS", 250, 150,  5,  5),
  rhs("RHS 250×150×6", "RHS", 250, 150,  6,  6),
  rhs("RHS 250×150×8", "RHS", 250, 150,  8,  8),
  rhs("RHS 260×140×6", "RHS", 260, 140,  6,  6),
  rhs("RHS 260×140×8", "RHS", 260, 140,  8,  8),
  rhs("RHS 300×200×6", "RHS", 300, 200,  6,  6),
  rhs("RHS 300×200×8", "RHS", 300, 200,  8,  8),
  rhs("RHS 300×200×10","RHS", 300, 200, 10, 10),
  rhs("RHS 400×200×8", "RHS", 400, 200,  8,  8),
  rhs("RHS 400×200×10","RHS", 400, 200, 10, 10),
];

// ---------- EN 10219 — CHS (Circular Hollow Sections, cold-formed) ----------
const chsProfiles: ProfileShape[] = [
  chs("CHS 33.7×3.2",   33.7,  3.2),
  chs("CHS 42.4×3.2",   42.4,  3.2),
  chs("CHS 42.4×4",     42.4,  4),
  chs("CHS 48.3×3.2",   48.3,  3.2),
  chs("CHS 48.3×4",     48.3,  4),
  chs("CHS 48.3×5",     48.3,  5),
  chs("CHS 60.3×3.2",   60.3,  3.2),
  chs("CHS 60.3×4",     60.3,  4),
  chs("CHS 60.3×5",     60.3,  5),
  chs("CHS 76.1×3.2",   76.1,  3.2),
  chs("CHS 76.1×4",     76.1,  4),
  chs("CHS 76.1×5",     76.1,  5),
  chs("CHS 88.9×3.2",   88.9,  3.2),
  chs("CHS 88.9×4",     88.9,  4),
  chs("CHS 88.9×5",     88.9,  5),
  chs("CHS 88.9×6.3",   88.9,  6.3),
  chs("CHS 114.3×3.6",  114.3, 3.6),
  chs("CHS 114.3×4",    114.3, 4),
  chs("CHS 114.3×5",    114.3, 5),
  chs("CHS 114.3×6.3",  114.3, 6.3),
  chs("CHS 139.7×4",    139.7, 4),
  chs("CHS 139.7×5",    139.7, 5),
  chs("CHS 139.7×6.3",  139.7, 6.3),
  chs("CHS 139.7×8",    139.7, 8),
  chs("CHS 168.3×4",    168.3, 4),
  chs("CHS 168.3×5",    168.3, 5),
  chs("CHS 168.3×6.3",  168.3, 6.3),
  chs("CHS 168.3×8",    168.3, 8),
  chs("CHS 193.7×5",    193.7, 5),
  chs("CHS 193.7×6.3",  193.7, 6.3),
  chs("CHS 193.7×8",    193.7, 8),
  chs("CHS 219.1×5",    219.1, 5),
  chs("CHS 219.1×6.3",  219.1, 6.3),
  chs("CHS 219.1×8",    219.1, 8),
  chs("CHS 219.1×10",   219.1, 10),
  chs("CHS 244.5×5",    244.5, 5),
  chs("CHS 244.5×6.3",  244.5, 6.3),
  chs("CHS 244.5×8",    244.5, 8),
  chs("CHS 273×5",      273,   5),
  chs("CHS 273×6.3",    273,   6.3),
  chs("CHS 273×8",      273,   8),
  chs("CHS 273×10",     273,   10),
  chs("CHS 323.9×6.3",  323.9, 6.3),
  chs("CHS 323.9×8",    323.9, 8),
  chs("CHS 323.9×10",   323.9, 10),
  chs("CHS 355.6×6.3",  355.6, 6.3),
  chs("CHS 355.6×8",    355.6, 8),
  chs("CHS 355.6×10",   355.6, 10),
  chs("CHS 406.4×8",    406.4, 8),
  chs("CHS 406.4×10",   406.4, 10),
  chs("CHS 406.4×12.5", 406.4, 12.5),
];

// ---------- EN 10162 — Cold-formed lipped channels (CF-C) ----------
const cfCProfiles: ProfileShape[] = [
  cfC("CF-C 100×50×20×1.5", 100, 50, 20, 1.5, 3),
  cfC("CF-C 100×50×20×2",   100, 50, 20, 2,   4),
  cfC("CF-C 100×50×20×2.5", 100, 50, 20, 2.5, 5),
  cfC("CF-C 120×50×20×1.5", 120, 50, 20, 1.5, 3),
  cfC("CF-C 120×50×20×2",   120, 50, 20, 2,   4),
  cfC("CF-C 120×60×20×2",   120, 60, 20, 2,   4),
  cfC("CF-C 140×60×20×1.5", 140, 60, 20, 1.5, 3),
  cfC("CF-C 140×60×20×2",   140, 60, 20, 2,   4),
  cfC("CF-C 140×60×20×2.5", 140, 60, 20, 2.5, 5),
  cfC("CF-C 150×60×20×2",   150, 60, 20, 2,   4),
  cfC("CF-C 150×60×20×2.5", 150, 60, 20, 2.5, 5),
  cfC("CF-C 150×65×20×2",   150, 65, 20, 2,   4),
  cfC("CF-C 180×60×20×2",   180, 60, 20, 2,   4),
  cfC("CF-C 180×60×20×2.5", 180, 60, 20, 2.5, 5),
  cfC("CF-C 180×70×20×2",   180, 70, 20, 2,   4),
  cfC("CF-C 180×70×20×2.5", 180, 70, 20, 2.5, 5),
  cfC("CF-C 200×60×20×2",   200, 60, 20, 2,   4),
  cfC("CF-C 200×60×20×2.5", 200, 60, 20, 2.5, 5),
  cfC("CF-C 200×60×20×3",   200, 60, 20, 3,   6),
  cfC("CF-C 200×75×20×2",   200, 75, 20, 2,   4),
  cfC("CF-C 200×75×20×2.5", 200, 75, 20, 2.5, 5),
  cfC("CF-C 200×75×20×3",   200, 75, 20, 3,   6),
  cfC("CF-C 230×75×20×2.5", 230, 75, 20, 2.5, 5),
  cfC("CF-C 230×75×20×3",   230, 75, 20, 3,   6),
  cfC("CF-C 250×80×20×2.5", 250, 80, 20, 2.5, 5),
  cfC("CF-C 250×80×20×3",   250, 80, 20, 3,   6),
  cfC("CF-C 300×80×20×3",   300, 80, 20, 3,   6),
  cfC("CF-C 300×100×20×3",  300, 100,20, 3,   6),
];

// ---------- EN 10162 — Cold-formed Z-sections (CF-Z) ----------
const cfZProfiles: ProfileShape[] = [
  cfZ("CF-Z 120×50×15×1.5",  120, 50,  15, 1.5, 3),
  cfZ("CF-Z 120×50×15×2",    120, 50,  15, 2,   4),
  cfZ("CF-Z 140×60×20×1.5",  140, 60,  20, 1.5, 3),
  cfZ("CF-Z 140×60×20×2",    140, 60,  20, 2,   4),
  cfZ("CF-Z 150×60×20×2",    150, 60,  20, 2,   4),
  cfZ("CF-Z 150×60×20×2.5",  150, 60,  20, 2.5, 5),
  cfZ("CF-Z 180×60×20×2",    180, 60,  20, 2,   4),
  cfZ("CF-Z 180×60×20×2.5",  180, 60,  20, 2.5, 5),
  cfZ("CF-Z 200×60×20×2",    200, 60,  20, 2,   4),
  cfZ("CF-Z 200×60×20×2.5",  200, 60,  20, 2.5, 5),
  cfZ("CF-Z 200×60×20×3",    200, 60,  20, 3,   6),
  cfZ("CF-Z 200×75×20×2",    200, 75,  20, 2,   4),
  cfZ("CF-Z 200×75×20×2.5",  200, 75,  20, 2.5, 5),
  cfZ("CF-Z 230×65×20×2.5",  230, 65,  20, 2.5, 5),
  cfZ("CF-Z 230×65×20×3",    230, 65,  20, 3,   6),
  cfZ("CF-Z 250×75×20×2.5",  250, 75,  20, 2.5, 5),
  cfZ("CF-Z 250×75×20×3",    250, 75,  20, 3,   6),
  cfZ("CF-Z 300×80×20×3",    300, 80,  20, 3,   6),
];

export const enProfiles: ProfileShape[] = [
  ...shsProfiles,
  ...rhsProfiles,
  ...chsProfiles,
  ...cfCProfiles,
  ...cfZProfiles,
];
