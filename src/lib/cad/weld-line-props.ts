import type { CadEntity, Point2D, WeldGroupResult } from "@/types/cad";
import { lineLength } from "./geometry";

interface WeldSegment {
  start: Point2D;
  end: Point2D;
  length: number;
  thickness: number;
}

function collectWeldSegments(entities: CadEntity[]): WeldSegment[] {
  const segments: WeldSegment[] = [];

  for (const e of entities) {
    if (e.type === "line" && e.thickness > 0) {
      const len = lineLength(e.start, e.end);
      if (len > 0) segments.push({ start: e.start, end: e.end, length: len, thickness: e.thickness });
    }
    if (e.type === "polyline" && e.thickness > 0 && e.points.length >= 2) {
      for (let i = 0; i < e.points.length - 1; i++) {
        const len = lineLength(e.points[i], e.points[i + 1]);
        if (len > 0) {
          segments.push({
            start: e.points[i],
            end: e.points[i + 1],
            length: len,
            thickness: e.thickness,
          });
        }
      }
      if (e.closed && e.points.length >= 3) {
        const last = e.points[e.points.length - 1];
        const first = e.points[0];
        const len = lineLength(last, first);
        if (len > 0) segments.push({ start: last, end: first, length: len, thickness: e.thickness });
      }
    }
  }

  return segments;
}

export function computeWeldGroupProps(entities: CadEntity[]): WeldGroupResult | null {
  const segs = collectWeldSegments(entities);
  if (segs.length === 0) return null;

  let totalLength = 0;
  let sumX = 0;
  let sumY = 0;

  for (const s of segs) {
    const mx = (s.start.x + s.end.x) / 2;
    const my = (s.start.y + s.end.y) / 2;
    sumX += mx * s.length;
    sumY += my * s.length;
    totalLength += s.length;
  }

  const cx = sumX / totalLength;
  const cy = sumY / totalLength;

  // Compute Ix, Iy of weld line group about centroid
  // For each segment, use parallel axis theorem:
  // I_seg = L³sin²θ/12 + L*(ȳ-cy)² for Ix (about x-axis through centroid)
  let Ix = 0;
  let Iy = 0;
  let maxDist = 0;

  for (const s of segs) {
    const dx = s.end.x - s.start.x;
    const dy = s.end.y - s.start.y;
    const L = s.length;
    const mx = (s.start.x + s.end.x) / 2;
    const my = (s.start.y + s.end.y) / 2;

    // Moment of inertia of line segment about its own centroid
    // Ix_self = L³sin²θ / 12, Iy_self = L³cos²θ / 12
    const sinT = dy / L;
    const cosT = dx / L;
    const Ix_self = (L * L * L * sinT * sinT) / 12;
    const Iy_self = (L * L * L * cosT * cosT) / 12;

    // Parallel axis
    Ix += Ix_self + L * (my - cy) * (my - cy);
    Iy += Iy_self + L * (mx - cx) * (mx - cx);

    // Track max distance from centroid to segment endpoints
    const d1 = Math.sqrt((s.start.x - cx) ** 2 + (s.start.y - cy) ** 2);
    const d2 = Math.sqrt((s.end.x - cx) ** 2 + (s.end.y - cy) ** 2);
    maxDist = Math.max(maxDist, d1, d2);
  }

  const r = (v: number) => Math.round(v * 1000) / 1000;

  return {
    totalLength: r(totalLength),
    centroid: { x: r(cx), y: r(cy) },
    Ix: r(Ix),
    Iy: r(Iy),
    Ip: r(Ix + Iy),
    maxDistance: r(maxDist),
  };
}
