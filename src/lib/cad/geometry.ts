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

let _idCounter = 0;
export function generateId(): string {
  return `cad_${Date.now()}_${++_idCounter}`;
}
