import type { CadEntity, BoltGroupResult, Point2D } from "@/types/cad";

export function computeBoltGroupProps(
  entities: CadEntity[]
): BoltGroupResult | null {
  const points: Point2D[] = [];

  for (const e of entities) {
    if (e.type === "point") {
      points.push(e.position);
    }
  }

  if (points.length === 0) return null;

  const n = points.length;
  const cx = points.reduce((s, p) => s + p.x, 0) / n;
  const cy = points.reduce((s, p) => s + p.y, 0) / n;

  let Ix = 0;
  let Iy = 0;
  let maxDist = 0;

  for (const p of points) {
    const dx = p.x - cx;
    const dy = p.y - cy;
    Ix += dy * dy;
    Iy += dx * dx;
    maxDist = Math.max(maxDist, Math.sqrt(dx * dx + dy * dy));
  }

  const r = (v: number) => Math.round(v * 1000) / 1000;

  return {
    numBolts: n,
    centroid: { x: r(cx), y: r(cy) },
    Ix: r(Ix),
    Iy: r(Iy),
    Ip: r(Ix + Iy),
    maxDistance: r(maxDist),
  };
}
