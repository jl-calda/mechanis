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
