import type { Point2D, SectionResult, ClosedRegion } from "@/types/cad";

/** Compute signed area of polygon using shoelace formula */
function signedArea(pts: Point2D[]): number {
  let sum = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    sum += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return sum / 2;
}

/** Compute centroid of polygon */
function centroid(pts: Point2D[], area: number): Point2D {
  let cx = 0;
  let cy = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const cross = pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    cx += (pts[i].x + pts[j].x) * cross;
    cy += (pts[i].y + pts[j].y) * cross;
  }
  cx /= 6 * area;
  cy /= 6 * area;
  return { x: cx, y: cy };
}

/** Compute second moments of area about centroid */
function secondMoments(
  pts: Point2D[],
  area: number,
  ctr: Point2D
): { Ix: number; Iy: number } {
  let Ix = 0;
  let Iy = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const cross = pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    Ix +=
      (pts[i].y * pts[i].y +
        pts[i].y * pts[j].y +
        pts[j].y * pts[j].y) *
      cross;
    Iy +=
      (pts[i].x * pts[i].x +
        pts[i].x * pts[j].x +
        pts[j].x * pts[j].x) *
      cross;
  }
  Ix = Math.abs(Ix / 12) - Math.abs(area) * ctr.y * ctr.y;
  Iy = Math.abs(Iy / 12) - Math.abs(area) * ctr.x * ctr.x;
  return { Ix: Math.abs(Ix), Iy: Math.abs(Iy) };
}

/** Bounding box extents relative to centroid */
function extents(
  pts: Point2D[],
  ctr: Point2D
): { yTop: number; yBot: number; xLeft: number; xRight: number } {
  let yMin = Infinity,
    yMax = -Infinity,
    xMin = Infinity,
    xMax = -Infinity;
  for (const p of pts) {
    yMin = Math.min(yMin, p.y);
    yMax = Math.max(yMax, p.y);
    xMin = Math.min(xMin, p.x);
    xMax = Math.max(xMax, p.x);
  }
  return {
    yTop: Math.abs(yMin - ctr.y),
    yBot: Math.abs(yMax - ctr.y),
    xLeft: Math.abs(xMin - ctr.x),
    xRight: Math.abs(xMax - ctr.x),
  };
}

/** Compute full section properties from a polygon */
export function computeSectionProps(pts: Point2D[]): SectionResult {
  if (pts.length < 3) {
    return {
      totalArea: 0,
      centroid: { x: 0, y: 0 },
      Ix: 0,
      Iy: 0,
      Sx_top: 0,
      Sx_bot: 0,
      Sy_left: 0,
      Sy_right: 0,
      Zx: 0,
      Zy: 0,
      rx: 0,
      ry: 0,
    };
  }

  const A = signedArea(pts);
  const absA = Math.abs(A);
  const ctr = centroid(pts, A);
  const { Ix, Iy } = secondMoments(pts, A, ctr);
  const ext = extents(pts, ctr);

  const Sx_top = ext.yTop > 0 ? Ix / ext.yTop : 0;
  const Sx_bot = ext.yBot > 0 ? Ix / ext.yBot : 0;
  const Sy_left = ext.xLeft > 0 ? Iy / ext.xLeft : 0;
  const Sy_right = ext.xRight > 0 ? Iy / ext.xRight : 0;

  // Approximate plastic section moduli (Zx ≈ Sx * shape factor ~1.5 for general shapes)
  // For exact: need to find plastic neutral axis. Use approximation for MVP.
  const Zx = absA > 0 ? (Ix / Math.max(ext.yTop, ext.yBot)) * 1.12 : 0;
  const Zy = absA > 0 ? (Iy / Math.max(ext.xLeft, ext.xRight)) * 1.12 : 0;

  const rx = absA > 0 ? Math.sqrt(Ix / absA) : 0;
  const ry = absA > 0 ? Math.sqrt(Iy / absA) : 0;

  return {
    totalArea: round(absA),
    centroid: { x: round(ctr.x), y: round(ctr.y) },
    Ix: round(Ix),
    Iy: round(Iy),
    Sx_top: round(Sx_top),
    Sx_bot: round(Sx_bot),
    Sy_left: round(Sy_left),
    Sy_right: round(Sy_right),
    Zx: round(Zx),
    Zy: round(Zy),
    rx: round(rx),
    ry: round(ry),
  };
}

/** Compute basic region properties for a polygon */
export function computeRegionProps(
  pts: Point2D[]
): Pick<ClosedRegion, "area" | "centroid" | "Ix" | "Iy"> {
  const A = signedArea(pts);
  const ctr = centroid(pts, A);
  const { Ix, Iy } = secondMoments(pts, A, ctr);
  return {
    area: round(Math.abs(A)),
    centroid: { x: round(ctr.x), y: round(ctr.y) },
    Ix: round(Ix),
    Iy: round(Iy),
  };
}

/**
 * Compute composite section properties from multiple regions.
 * Uses parallel axis theorem: positive regions add, negative regions subtract.
 * This enables custom sections like W-shapes (3 rects), channels, built-up
 * sections, and sections with holes.
 */
export function computeCompositeSectionProps(
  regions: import("@/types/cad").ClosedRegion[]
): SectionResult {
  if (regions.length === 0) {
    return { totalArea: 0, centroid: { x: 0, y: 0 }, Ix: 0, Iy: 0, Sx_top: 0, Sx_bot: 0, Sy_left: 0, Sy_right: 0, Zx: 0, Zy: 0, rx: 0, ry: 0 };
  }

  // Step 1: compute individual properties for each region
  const parts: { A: number; cx: number; cy: number; Ix: number; Iy: number; boundary: Point2D[]; sign: number }[] = [];
  for (const r of regions) {
    const s = r.sign === "subtract" ? -1 : 1;
    const A = signedArea(r.boundary);
    const absA = Math.abs(A);
    const ctr = centroid(r.boundary, A);
    const mom = secondMoments(r.boundary, A, ctr);
    parts.push({ A: absA * s, cx: ctr.x, cy: ctr.y, Ix: mom.Ix, Iy: mom.Iy, boundary: r.boundary, sign: s });
  }

  // Step 2: composite centroid
  let totalA = 0;
  let sumAx = 0;
  let sumAy = 0;
  for (const p of parts) {
    totalA += p.A;
    sumAx += p.A * p.cx;
    sumAy += p.A * p.cy;
  }
  if (Math.abs(totalA) < 1e-10) {
    return { totalArea: 0, centroid: { x: 0, y: 0 }, Ix: 0, Iy: 0, Sx_top: 0, Sx_bot: 0, Sy_left: 0, Sy_right: 0, Zx: 0, Zy: 0, rx: 0, ry: 0 };
  }
  const compCx = sumAx / totalA;
  const compCy = sumAy / totalA;

  // Step 3: parallel axis theorem for composite Ix, Iy
  let compIx = 0;
  let compIy = 0;
  for (const p of parts) {
    const dy = p.cy - compCy;
    const dx = p.cx - compCx;
    // I_composite = Σ(I_i + A_i * d²) with sign
    compIx += p.sign * (p.Ix + Math.abs(p.A) * dy * dy);
    compIy += p.sign * (p.Iy + Math.abs(p.A) * dx * dx);
  }
  compIx = Math.abs(compIx);
  compIy = Math.abs(compIy);
  const absTotal = Math.abs(totalA);

  // Step 4: bounding box extents from all add regions
  let yMin = Infinity, yMax = -Infinity, xMin = Infinity, xMax = -Infinity;
  for (const p of parts) {
    if (p.sign < 0) continue; // only positive regions define extents
    for (const pt of p.boundary) {
      yMin = Math.min(yMin, pt.y);
      yMax = Math.max(yMax, pt.y);
      xMin = Math.min(xMin, pt.x);
      xMax = Math.max(xMax, pt.x);
    }
  }
  const yTop = Math.abs(yMin - compCy);
  const yBot = Math.abs(yMax - compCy);
  const xLeft = Math.abs(xMin - compCx);
  const xRight = Math.abs(xMax - compCx);

  const Sx_top = yTop > 0 ? compIx / yTop : 0;
  const Sx_bot = yBot > 0 ? compIx / yBot : 0;
  const Sy_left = xLeft > 0 ? compIy / xLeft : 0;
  const Sy_right = xRight > 0 ? compIy / xRight : 0;

  const Zx = absTotal > 0 ? (compIx / Math.max(yTop, yBot)) * 1.12 : 0;
  const Zy = absTotal > 0 ? (compIy / Math.max(xLeft, xRight)) * 1.12 : 0;

  const rx = absTotal > 0 ? Math.sqrt(compIx / absTotal) : 0;
  const ry = absTotal > 0 ? Math.sqrt(compIy / absTotal) : 0;

  return {
    totalArea: round(absTotal),
    centroid: { x: round(compCx), y: round(compCy) },
    Ix: round(compIx),
    Iy: round(compIy),
    Sx_top: round(Sx_top),
    Sx_bot: round(Sx_bot),
    Sy_left: round(Sy_left),
    Sy_right: round(Sy_right),
    Zx: round(Zx),
    Zy: round(Zy),
    rx: round(rx),
    ry: round(ry),
  };
}

function round(v: number, decimals = 4): number {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}
