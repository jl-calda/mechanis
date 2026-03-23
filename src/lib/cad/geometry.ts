import type { Point2D } from "@/types/cad";

export function distance(a: Point2D, b: Point2D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function midpoint(a: Point2D, b: Point2D): Point2D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function snapToGrid(p: Point2D, gridSize: number): Point2D {
  return {
    x: Math.round(p.x / gridSize) * gridSize,
    y: Math.round(p.y / gridSize) * gridSize,
  };
}

export function lineLength(a: Point2D, b: Point2D): number {
  return distance(a, b);
}

/** Check if point p is within `tolerance` of line segment (a, b) */
export function pointNearSegment(
  p: Point2D,
  a: Point2D,
  b: Point2D,
  tolerance: number
): boolean {
  const lenSq = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  if (lenSq === 0) return distance(p, a) <= tolerance;
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
  return distance(p, proj) <= tolerance;
}

/** Check if point is inside a polygon (ray casting) */
export function pointInPolygon(p: Point2D, polygon: Point2D[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;
    if (yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Check if point is near a circle outline */
export function pointNearCircle(
  p: Point2D,
  center: Point2D,
  radius: number,
  tolerance: number
): boolean {
  const d = distance(p, center);
  return Math.abs(d - radius) <= tolerance;
}

/** Check if point is near an ellipse outline */
export function pointNearEllipse(
  p: Point2D,
  center: Point2D,
  rx: number,
  ry: number,
  tolerance: number
): boolean {
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  const v = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
  // v=1 is on ellipse, check how far off we are
  return Math.abs(Math.sqrt(v) - 1) * Math.min(rx, ry) <= tolerance;
}

/** Generate polygon points approximating a circle */
export function circleToPolygon(
  center: Point2D,
  radius: number,
  segments: number = 64
): Point2D[] {
  const pts: Point2D[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (2 * Math.PI * i) / segments;
    pts.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }
  return pts;
}

/** Generate polygon points approximating an ellipse */
export function ellipseToPolygon(
  center: Point2D,
  rx: number,
  ry: number,
  segments: number = 64
): Point2D[] {
  const pts: Point2D[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (2 * Math.PI * i) / segments;
    pts.push({
      x: center.x + rx * Math.cos(angle),
      y: center.y + ry * Math.sin(angle),
    });
  }
  return pts;
}

/** Convert rectangle to polygon vertices */
export function rectToPolygon(
  origin: Point2D,
  width: number,
  height: number
): Point2D[] {
  return [
    { x: origin.x, y: origin.y },
    { x: origin.x + width, y: origin.y },
    { x: origin.x + width, y: origin.y + height },
    { x: origin.x, y: origin.y + height },
  ];
}

/** Segment-segment intersection. Returns the intersection point or null if parallel/no intersection. */
export function segmentIntersection(
  a1: Point2D, a2: Point2D,
  b1: Point2D, b2: Point2D
): Point2D | null {
  const dx1 = a2.x - a1.x, dy1 = a2.y - a1.y;
  const dx2 = b2.x - b1.x, dy2 = b2.y - b1.y;
  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-10) return null;
  const t = ((b1.x - a1.x) * dy2 - (b1.y - a1.y) * dx2) / denom;
  const u = ((b1.x - a1.x) * dy1 - (b1.y - a1.y) * dx1) / denom;
  if (t < 1e-10 || t > 1 - 1e-10 || u < 1e-10 || u > 1 - 1e-10) return null;
  return { x: a1.x + t * dx1, y: a1.y + t * dy1 };
}

/** Get all line segments from an entity */
export function getEntitySegments(e: import("@/types/cad").CadEntity): [Point2D, Point2D][] {
  switch (e.type) {
    case "line":
      return [[e.start, e.end]];
    case "rectangle": {
      const c = [
        e.origin,
        { x: e.origin.x + e.width, y: e.origin.y },
        { x: e.origin.x + e.width, y: e.origin.y + e.height },
        { x: e.origin.x, y: e.origin.y + e.height },
      ];
      return [[c[0], c[1]], [c[1], c[2]], [c[2], c[3]], [c[3], c[0]]];
    }
    case "polyline": {
      const segs: [Point2D, Point2D][] = [];
      for (let i = 0; i < e.points.length - 1; i++) segs.push([e.points[i], e.points[i + 1]]);
      if (e.closed && e.points.length >= 3) segs.push([e.points[e.points.length - 1], e.points[0]]);
      return segs;
    }
    default:
      return [];
  }
}

/**
 * Check if a point lies on a segment (within tolerance).
 * Returns the parameter t (0-1) along the segment, or null if not on segment.
 */
function pointOnSegment(pt: Point2D, a: Point2D, b: Point2D, tol: number = 0.05): number | null {
  const dx = b.x - a.x, dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-10) return null;
  const t = ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / lenSq;
  if (t < 0.001 || t > 0.999) return null;
  const proj = { x: a.x + t * dx, y: a.y + t * dy };
  const d = distance(pt, proj);
  return d < tol ? t : null;
}

/**
 * Find all trim boundaries (intersections + endpoint contacts) on a segment
 * from other entities. Returns sorted array of { t, pt } along the segment.
 */
function findTrimBoundaries(
  segStart: Point2D,
  segEnd: Point2D,
  allEntities: import("@/types/cad").CadEntity[],
  sourceId: string
): { t: number; pt: Point2D }[] {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1e-10) return [];
  const lenSq = len * len;

  const seen = new Set<string>();
  const intersections: { t: number; pt: Point2D }[] = [];

  const addPoint = (pt: Point2D, t: number) => {
    if (t <= 0.001 || t >= 0.999) return;
    // Deduplicate by rounding
    const key = `${pt.x.toFixed(6)},${pt.y.toFixed(6)}`;
    if (seen.has(key)) return;
    seen.add(key);
    intersections.push({ t, pt });
  };

  for (const other of allEntities) {
    if (other.id === sourceId) continue;
    const otherSegs = getEntitySegments(other);

    // Check segment-segment intersections
    for (const otherSeg of otherSegs) {
      const ip = segmentIntersection(segStart, segEnd, otherSeg[0], otherSeg[1]);
      if (ip) {
        const t = ((ip.x - segStart.x) * dx + (ip.y - segStart.y) * dy) / lenSq;
        addPoint(ip, t);
      }
    }

    // Check if other entity's endpoints lie on our segment
    // (e.g., a line starts/ends on the trimmed line)
    const endpoints = getEntityEndpoints(other);
    for (const ep of endpoints) {
      const t = pointOnSegment(ep, segStart, segEnd);
      if (t !== null) {
        const proj = { x: segStart.x + t * dx, y: segStart.y + t * dy };
        addPoint(proj, t);
      }
    }
  }

  intersections.sort((a, b) => a.t - b.t);
  return intersections;
}

/** Get all unique endpoints/vertices from an entity */
function getEntityEndpoints(e: import("@/types/cad").CadEntity): Point2D[] {
  switch (e.type) {
    case "line":
      return [e.start, e.end];
    case "rectangle": {
      return [
        e.origin,
        { x: e.origin.x + e.width, y: e.origin.y },
        { x: e.origin.x + e.width, y: e.origin.y + e.height },
        { x: e.origin.x, y: e.origin.y + e.height },
      ];
    }
    case "polyline":
      return [...e.points];
    case "circle":
      return [
        { x: e.center.x + e.radius, y: e.center.y },
        { x: e.center.x - e.radius, y: e.center.y },
        { x: e.center.x, y: e.center.y + e.radius },
        { x: e.center.x, y: e.center.y - e.radius },
      ];
    case "point":
      return [e.position];
    default:
      return [];
  }
}

/**
 * Trim a single segment at intersections/contacts with other entities.
 * Returns 0, 1, or 2 line segments (the parts outside the click point).
 */
function trimSegmentAtPoint(
  segStart: Point2D,
  segEnd: Point2D,
  clickPt: Point2D,
  allEntities: import("@/types/cad").CadEntity[],
  sourceId: string,
  base: { stroke: string; strokeWidth: number; locked: boolean; thickness: number }
): import("@/types/cad").CadEntity[] {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1e-10) return [];

  const clickT = ((clickPt.x - segStart.x) * dx + (clickPt.y - segStart.y) * dy) / (len * len);
  const intersections = findTrimBoundaries(segStart, segEnd, allEntities, sourceId);

  if (intersections.length === 0) return [];

  let before: { t: number; pt: Point2D } | null = null;
  let after: { t: number; pt: Point2D } | null = null;
  for (const ix of intersections) {
    if (ix.t < clickT) before = ix;
    if (ix.t > clickT && !after) after = ix;
  }

  const result: import("@/types/cad").CadEntity[] = [];
  if (before) {
    result.push({ ...base, id: generateId(), type: "line", start: segStart, end: before.pt });
  }
  if (after) {
    result.push({ ...base, id: generateId(), type: "line", start: after.pt, end: segEnd });
  }
  return result;
}

/**
 * Trim a line entity at the nearest intersection with other entities.
 */
export function trimLineAtPoint(
  line: import("@/types/cad").LineEntity,
  clickPt: Point2D,
  allEntities: import("@/types/cad").CadEntity[]
): import("@/types/cad").CadEntity[] {
  const base = { stroke: line.stroke, strokeWidth: line.strokeWidth, locked: line.locked, thickness: line.thickness };
  return trimSegmentAtPoint(line.start, line.end, clickPt, allEntities, line.id, base);
}

/**
 * Trim any entity that has segments (line, rectangle, polyline).
 * For rectangles/polylines, finds the clicked segment, trims it,
 * and returns remaining segments as individual lines.
 */
export function trimEntityAtPoint(
  entity: import("@/types/cad").CadEntity,
  clickPt: Point2D,
  allEntities: import("@/types/cad").CadEntity[]
): import("@/types/cad").CadEntity[] | null {
  if (entity.type === "line") {
    return trimLineAtPoint(entity, clickPt, allEntities);
  }

  const segments = getEntitySegments(entity);
  if (segments.length === 0) return null;

  // Find which segment the click is nearest to
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < segments.length; i++) {
    const [a, b] = segments[i];
    // Project click onto segment
    const dx = b.x - a.x, dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) continue;
    let t = ((clickPt.x - a.x) * dx + (clickPt.y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const proj = { x: a.x + t * dx, y: a.y + t * dy };
    const d = distance(clickPt, proj);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  }

  const base = { stroke: entity.stroke, strokeWidth: entity.strokeWidth, locked: entity.locked, thickness: (entity as { thickness?: number }).thickness ?? 0 };
  const result: import("@/types/cad").CadEntity[] = [];

  // Convert all segments to individual lines
  for (let i = 0; i < segments.length; i++) {
    const [a, b] = segments[i];
    if (i === bestIdx) {
      // Trim this segment
      const trimmed = trimSegmentAtPoint(a, b, clickPt, allEntities, entity.id, base);
      result.push(...trimmed);
    } else {
      // Keep this segment as a line
      result.push({ ...base, id: generateId(), type: "line", start: a, end: b });
    }
  }

  return result;
}

/**
 * Preview what a trim operation would remove.
 * Returns the segment that would be deleted (between the two nearest boundaries
 * surrounding the click point), plus the entity id for hover highlight.
 */
export function getTrimPreview(
  entity: import("@/types/cad").CadEntity,
  clickPt: Point2D,
  allEntities: import("@/types/cad").CadEntity[]
): { removedSegment: [Point2D, Point2D]; entityId: string } | null {
  const segments = getEntitySegments(entity);
  if (segments.length === 0) return null;

  // Find which segment the click is nearest to
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < segments.length; i++) {
    const [a, b] = segments[i];
    const dx = b.x - a.x, dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) continue;
    let t = ((clickPt.x - a.x) * dx + (clickPt.y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const proj = { x: a.x + t * dx, y: a.y + t * dy };
    const d = distance(clickPt, proj);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  }

  const [segStart, segEnd] = segments[bestIdx];
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1e-10) return null;

  const clickT = ((clickPt.x - segStart.x) * dx + (clickPt.y - segStart.y) * dy) / (len * len);
  const intersections = findTrimBoundaries(segStart, segEnd, allEntities, entity.id);

  if (intersections.length === 0) return null;

  let before: { t: number; pt: Point2D } | null = null;
  let after: { t: number; pt: Point2D } | null = null;
  for (const ix of intersections) {
    if (ix.t < clickT) before = ix;
    if (ix.t > clickT && !after) after = ix;
  }

  const removeStart = before ? before.pt : segStart;
  const removeEnd = after ? after.pt : segEnd;

  return { removedSegment: [removeStart, removeEnd], entityId: entity.id };
}

/** Collect snap points (endpoints + midpoints) from an entity */
export function getEntitySnapPoints(e: import("@/types/cad").CadEntity): Point2D[] {
  const pts: Point2D[] = [];
  switch (e.type) {
    case "point":
      pts.push(e.position);
      break;
    case "line":
      pts.push(e.start, e.end, midpoint(e.start, e.end));
      break;
    case "rectangle": {
      const c0 = e.origin;
      const c1 = { x: e.origin.x + e.width, y: e.origin.y };
      const c2 = { x: e.origin.x + e.width, y: e.origin.y + e.height };
      const c3 = { x: e.origin.x, y: e.origin.y + e.height };
      pts.push(c0, c1, c2, c3, midpoint(c0, c1), midpoint(c1, c2), midpoint(c2, c3), midpoint(c3, c0));
      // center
      pts.push({ x: e.origin.x + e.width / 2, y: e.origin.y + e.height / 2 });
      break;
    }
    case "polyline":
      for (const p of e.points) pts.push(p);
      for (let i = 0; i < e.points.length - 1; i++) {
        pts.push(midpoint(e.points[i], e.points[i + 1]));
      }
      if (e.closed && e.points.length >= 2) {
        pts.push(midpoint(e.points[e.points.length - 1], e.points[0]));
      }
      break;
    case "circle":
      pts.push(
        e.center,
        { x: e.center.x + e.radius, y: e.center.y },
        { x: e.center.x - e.radius, y: e.center.y },
        { x: e.center.x, y: e.center.y + e.radius },
        { x: e.center.x, y: e.center.y - e.radius }
      );
      break;
    case "ellipse":
      pts.push(
        e.center,
        { x: e.center.x + e.rx, y: e.center.y },
        { x: e.center.x - e.rx, y: e.center.y },
        { x: e.center.x, y: e.center.y + e.ry },
        { x: e.center.x, y: e.center.y - e.ry }
      );
      break;
    case "dimension":
      pts.push(e.startPt, e.endPt);
      break;
  }
  return pts;
}

/** Get bounding box of an entity: { minX, minY, maxX, maxY } */
export function getEntityBounds(e: import("@/types/cad").CadEntity): { minX: number; minY: number; maxX: number; maxY: number } | null {
  switch (e.type) {
    case "point":
      return { minX: e.position.x, minY: e.position.y, maxX: e.position.x, maxY: e.position.y };
    case "line":
      return { minX: Math.min(e.start.x, e.end.x), minY: Math.min(e.start.y, e.end.y), maxX: Math.max(e.start.x, e.end.x), maxY: Math.max(e.start.y, e.end.y) };
    case "rectangle":
      return { minX: e.origin.x, minY: e.origin.y, maxX: e.origin.x + e.width, maxY: e.origin.y + e.height };
    case "polyline": {
      if (e.points.length === 0) return null;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of e.points) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
      return { minX, minY, maxX, maxY };
    }
    case "circle":
      return { minX: e.center.x - e.radius, minY: e.center.y - e.radius, maxX: e.center.x + e.radius, maxY: e.center.y + e.radius };
    case "ellipse":
      return { minX: e.center.x - e.rx, minY: e.center.y - e.ry, maxX: e.center.x + e.rx, maxY: e.center.y + e.ry };
    case "dimension": {
      const dx = e.endPt.x - e.startPt.x;
      const dy = e.endPt.y - e.startPt.y;
      const len = distance(e.startPt, e.endPt);
      if (len < 0.001) return null;
      const px = -dy / len * e.offset;
      const py = dx / len * e.offset;
      const pts = [e.startPt, e.endPt, { x: e.startPt.x + px, y: e.startPt.y + py }, { x: e.endPt.x + px, y: e.endPt.y + py }];
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of pts) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
      return { minX, minY, maxX, maxY };
    }
  }
}

let _idCounter = 0;
export function generateId(): string {
  return `cad_${Date.now()}_${++_idCounter}`;
}

// ---- Fillet ----

/** Find the infinite-line intersection of two line segments (ignoring segment bounds). */
function lineLineIntersection(
  a1: Point2D, a2: Point2D,
  b1: Point2D, b2: Point2D
): Point2D | null {
  const dx1 = a2.x - a1.x, dy1 = a2.y - a1.y;
  const dx2 = b2.x - b1.x, dy2 = b2.y - b1.y;
  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-10) return null; // parallel
  const t = ((b1.x - a1.x) * dy2 - (b1.y - a1.y) * dx2) / denom;
  return { x: a1.x + t * dx1, y: a1.y + t * dy1 };
}

/**
 * Compute fillet between two line entities.
 * Returns the modified lines (shortened) and an arc polyline,
 * or null if a fillet can't be computed.
 */
export function computeFillet(
  lineA: import("@/types/cad").LineEntity,
  lineB: import("@/types/cad").LineEntity,
  radius: number
): { newEntities: import("@/types/cad").CadEntity[]; removedIds: string[] } | null {
  // Find intersection of the two lines (extended infinitely)
  const corner = lineLineIntersection(lineA.start, lineA.end, lineB.start, lineB.end);
  if (!corner) return null; // parallel lines

  // Determine which endpoint of each line is closest to the corner
  const dAs = distance(lineA.start, corner);
  const dAe = distance(lineA.end, corner);
  const dBs = distance(lineB.start, corner);
  const dBe = distance(lineB.end, corner);

  // Direction vectors pointing away from corner
  const aEndNear = dAe < dAs;
  const aPt = aEndNear ? lineA.start : lineA.end; // far point
  const bEndNear = dBe < dBs;
  const bPt = bEndNear ? lineB.start : lineB.end; // far point

  // Unit vectors from corner along each line
  const lenA = distance(corner, aPt);
  const lenB = distance(corner, bPt);
  if (lenA < 0.01 || lenB < 0.01) return null;

  const uA = { x: (aPt.x - corner.x) / lenA, y: (aPt.y - corner.y) / lenA };
  const uB = { x: (bPt.x - corner.x) / lenB, y: (bPt.y - corner.y) / lenB };

  // Half-angle between the two lines
  const dot = uA.x * uB.x + uA.y * uB.y;
  const halfAngle = Math.acos(Math.max(-1, Math.min(1, dot))) / 2;
  if (Math.abs(Math.sin(halfAngle)) < 1e-10) return null; // lines are coincident

  // Distance from corner to tangent points
  const tangentDist = radius / Math.tan(halfAngle);
  if (tangentDist > lenA * 0.99 || tangentDist > lenB * 0.99) return null; // radius too large

  // Tangent points on each line
  const tA = { x: corner.x + uA.x * tangentDist, y: corner.y + uA.y * tangentDist };
  const tB = { x: corner.x + uB.x * tangentDist, y: corner.y + uB.y * tangentDist };

  // Arc center: move from corner along bisector
  const bisector = { x: uA.x + uB.x, y: uA.y + uB.y };
  const bisLen = Math.sqrt(bisector.x ** 2 + bisector.y ** 2);
  if (bisLen < 1e-10) return null;
  const centerDist = radius / Math.sin(halfAngle);
  const center = {
    x: corner.x + (bisector.x / bisLen) * centerDist,
    y: corner.y + (bisector.y / bisLen) * centerDist,
  };

  // Generate arc points from tA to tB around center
  const startAngle = Math.atan2(tA.y - center.y, tA.x - center.x);
  const endAngle = Math.atan2(tB.y - center.y, tB.x - center.x);

  // Determine arc sweep direction (should be the short arc)
  let sweep = endAngle - startAngle;
  if (sweep > Math.PI) sweep -= 2 * Math.PI;
  if (sweep < -Math.PI) sweep += 2 * Math.PI;

  const numPts = Math.max(8, Math.round(Math.abs(sweep) / (Math.PI / 16)));
  const arcPoints: Point2D[] = [];
  for (let i = 0; i <= numPts; i++) {
    const t = i / numPts;
    const angle = startAngle + sweep * t;
    arcPoints.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }

  const base = { stroke: lineA.stroke, strokeWidth: lineA.strokeWidth, locked: false, thickness: 0 };

  // Shortened line A: from far point to tangent point
  const newLineA: import("@/types/cad").LineEntity = {
    ...base,
    id: generateId(),
    type: "line",
    start: aPt,
    end: tA,
    thickness: lineA.thickness,
  };

  // Shortened line B: from far point to tangent point
  const newLineB: import("@/types/cad").LineEntity = {
    ...base,
    id: generateId(),
    type: "line",
    start: bPt,
    end: tB,
    thickness: lineB.thickness,
  };

  // Arc as a polyline
  const arc: import("@/types/cad").PolylineEntity = {
    ...base,
    id: generateId(),
    type: "polyline",
    points: arcPoints,
    closed: false,
    thickness: 0,
  };

  return {
    newEntities: [newLineA, arc, newLineB],
    removedIds: [lineA.id, lineB.id],
  };
}

/**
 * Preview fillet: returns the arc points and tangent points for rendering.
 */
export function getFilletPreview(
  lineA: import("@/types/cad").LineEntity,
  lineB: import("@/types/cad").LineEntity,
  radius: number
): { arcPoints: Point2D[]; tangentA: Point2D; tangentB: Point2D; corner: Point2D } | null {
  const corner = lineLineIntersection(lineA.start, lineA.end, lineB.start, lineB.end);
  if (!corner) return null;

  const dAs = distance(lineA.start, corner);
  const dAe = distance(lineA.end, corner);
  const dBs = distance(lineB.start, corner);
  const dBe = distance(lineB.end, corner);

  const aEndNear = dAe < dAs;
  const aPt = aEndNear ? lineA.start : lineA.end;
  const bEndNear = dBe < dBs;
  const bPt = bEndNear ? lineB.start : lineB.end;

  const lenA = distance(corner, aPt);
  const lenB = distance(corner, bPt);
  if (lenA < 0.01 || lenB < 0.01) return null;

  const uA = { x: (aPt.x - corner.x) / lenA, y: (aPt.y - corner.y) / lenA };
  const uB = { x: (bPt.x - corner.x) / lenB, y: (bPt.y - corner.y) / lenB };

  const dot = uA.x * uB.x + uA.y * uB.y;
  const halfAngle = Math.acos(Math.max(-1, Math.min(1, dot))) / 2;
  if (Math.abs(Math.sin(halfAngle)) < 1e-10) return null;

  const tangentDist = radius / Math.tan(halfAngle);
  if (tangentDist > lenA * 0.99 || tangentDist > lenB * 0.99) return null;

  const tA = { x: corner.x + uA.x * tangentDist, y: corner.y + uA.y * tangentDist };
  const tB = { x: corner.x + uB.x * tangentDist, y: corner.y + uB.y * tangentDist };

  const bisector = { x: uA.x + uB.x, y: uA.y + uB.y };
  const bisLen = Math.sqrt(bisector.x ** 2 + bisector.y ** 2);
  if (bisLen < 1e-10) return null;
  const centerDist = radius / Math.sin(halfAngle);
  const center = {
    x: corner.x + (bisector.x / bisLen) * centerDist,
    y: corner.y + (bisector.y / bisLen) * centerDist,
  };

  const startAngle = Math.atan2(tA.y - center.y, tA.x - center.x);
  const endAngle = Math.atan2(tB.y - center.y, tB.x - center.x);
  let sweep = endAngle - startAngle;
  if (sweep > Math.PI) sweep -= 2 * Math.PI;
  if (sweep < -Math.PI) sweep += 2 * Math.PI;

  const numPts = Math.max(8, Math.round(Math.abs(sweep) / (Math.PI / 16)));
  const arcPoints: Point2D[] = [];
  for (let i = 0; i <= numPts; i++) {
    const t = i / numPts;
    const angle = startAngle + sweep * t;
    arcPoints.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }

  return { arcPoints, tangentA: tA, tangentB: tB, corner };
}
