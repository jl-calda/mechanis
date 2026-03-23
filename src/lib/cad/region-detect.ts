import type { CadEntity, ClosedRegion, Point2D } from "@/types/cad";
import {
  circleToPolygon,
  ellipseToPolygon,
  rectToPolygon,
  generateId,
  pointInPolygon,
  segmentIntersection,
  distance,
} from "./geometry";
import { computeRegionProps } from "./section-props";

const EPS = 1e-6;

/** Round to avoid floating point duplicates */
function snapKey(p: Point2D): string {
  return `${Math.round(p.x * 10000)},${Math.round(p.y * 10000)}`;
}

/** Get all line segments from all entities (circles/ellipses approximated) */
function collectAllSegments(entities: CadEntity[]): [Point2D, Point2D][] {
  const segs: [Point2D, Point2D][] = [];
  for (const e of entities) {
    switch (e.type) {
      case "line":
        segs.push([e.start, e.end]);
        break;
      case "rectangle": {
        const c = rectToPolygon(e.origin, e.width, e.height);
        for (let i = 0; i < c.length; i++) segs.push([c[i], c[(i + 1) % c.length]]);
        break;
      }
      case "polyline":
        for (let i = 0; i < e.points.length - 1; i++) segs.push([e.points[i], e.points[i + 1]]);
        if (e.closed && e.points.length >= 3) segs.push([e.points[e.points.length - 1], e.points[0]]);
        break;
      case "circle": {
        const pts = circleToPolygon(e.center, e.radius, 48);
        for (let i = 0; i < pts.length; i++) segs.push([pts[i], pts[(i + 1) % pts.length]]);
        break;
      }
      case "ellipse": {
        const pts = ellipseToPolygon(e.center, e.rx, e.ry, 48);
        for (let i = 0; i < pts.length; i++) segs.push([pts[i], pts[(i + 1) % pts.length]]);
        break;
      }
    }
  }
  return segs;
}

/** Find all intersections and split segments at intersection points */
function splitSegmentsAtIntersections(
  segs: [Point2D, Point2D][]
): [Point2D, Point2D][] {
  // For each segment, collect all split points (including endpoints)
  const splitPts: Point2D[][] = segs.map((s) => [s[0], s[1]]);

  for (let i = 0; i < segs.length; i++) {
    for (let j = i + 1; j < segs.length; j++) {
      const ip = segmentIntersection(segs[i][0], segs[i][1], segs[j][0], segs[j][1]);
      if (ip) {
        splitPts[i].push(ip);
        splitPts[j].push(ip);
      }
    }
  }

  // Sort each segment's split points along the segment direction and create sub-segments
  const result: [Point2D, Point2D][] = [];
  for (let i = 0; i < segs.length; i++) {
    const [a, b] = segs[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 < EPS * EPS) continue;

    // Project each split point onto segment as parameter t
    const pts = splitPts[i].map((p) => ({
      pt: p,
      t: ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2,
    }));
    pts.sort((a, b) => a.t - b.t);

    // Deduplicate nearby points
    const unique: Point2D[] = [pts[0].pt];
    for (let k = 1; k < pts.length; k++) {
      if (distance(pts[k].pt, unique[unique.length - 1]) > EPS) {
        unique.push(pts[k].pt);
      }
    }

    for (let k = 0; k < unique.length - 1; k++) {
      if (distance(unique[k], unique[k + 1]) > EPS) {
        result.push([unique[k], unique[k + 1]]);
      }
    }
  }

  return result;
}

interface GraphNode {
  key: string;
  pt: Point2D;
  edges: { toKey: string; angle: number }[];
}

/** Build a planar graph from split segments */
function buildGraph(segs: [Point2D, Point2D][]): Map<string, GraphNode> {
  const nodes = new Map<string, GraphNode>();

  function getOrCreate(p: Point2D): GraphNode {
    const key = snapKey(p);
    if (!nodes.has(key)) {
      nodes.set(key, { key, pt: p, edges: [] });
    }
    return nodes.get(key)!;
  }

  for (const [a, b] of segs) {
    const na = getOrCreate(a);
    const nb = getOrCreate(b);
    if (na.key === nb.key) continue;

    const angleAB = Math.atan2(b.y - a.y, b.x - a.x);
    const angleBA = Math.atan2(a.y - b.y, a.x - b.x);

    // Avoid duplicate edges
    if (!na.edges.some((e) => e.toKey === nb.key)) {
      na.edges.push({ toKey: nb.key, angle: angleAB });
    }
    if (!nb.edges.some((e) => e.toKey === na.key)) {
      nb.edges.push({ toKey: na.key, angle: angleBA });
    }
  }

  // Sort edges at each node by angle
  for (const node of nodes.values()) {
    node.edges.sort((a, b) => a.angle - b.angle);
  }

  return nodes;
}

/**
 * Find minimal faces using the "next edge by turning right" algorithm.
 * For each directed edge, follow the next clockwise edge at each node
 * to trace a face boundary.
 */
function findFaces(graph: Map<string, GraphNode>): Point2D[][] {
  // Track which directed edges have been visited
  const visited = new Set<string>();
  const faces: Point2D[][] = [];

  function directedKey(from: string, to: string) {
    return `${from}→${to}`;
  }

  for (const node of graph.values()) {
    for (const edge of node.edges) {
      const startDirKey = directedKey(node.key, edge.toKey);
      if (visited.has(startDirKey)) continue;

      // Trace face
      const boundary: Point2D[] = [];
      let currentKey = node.key;
      let nextKey = edge.toKey;
      let safe = 0;
      const maxSteps = 500;

      while (safe++ < maxSteps) {
        const dk = directedKey(currentKey, nextKey);
        if (visited.has(dk)) break;
        visited.add(dk);

        const currentNode = graph.get(currentKey)!;
        boundary.push(currentNode.pt);

        const nextNode = graph.get(nextKey);
        if (!nextNode || nextNode.edges.length === 0) break;

        // Find the edge we arrived from in nextNode's edge list
        const incomingAngle = Math.atan2(
          currentNode.pt.y - nextNode.pt.y,
          currentNode.pt.x - nextNode.pt.x
        );

        // Find next edge by turning right (next clockwise after incoming)
        // We look for the edge just after incomingAngle in sorted order
        let bestIdx = -1;
        let bestDiff = Infinity;
        for (let i = 0; i < nextNode.edges.length; i++) {
          if (nextNode.edges[i].toKey === currentKey && nextNode.edges.length > 1) continue;
          let diff = nextNode.edges[i].angle - incomingAngle;
          if (diff <= EPS) diff += Math.PI * 2;
          if (diff < bestDiff) {
            bestDiff = diff;
            bestIdx = i;
          }
        }

        if (bestIdx < 0) break;

        currentKey = nextKey;
        nextKey = nextNode.edges[bestIdx].toKey;

        // Check if we've completed the loop
        if (currentKey === node.key && nextKey === edge.toKey) {
          break;
        }
      }

      if (boundary.length >= 3) {
        faces.push(boundary);
      }
    }
  }

  return faces;
}

/** Compute signed area to filter out the outer (unbounded) face */
function signedArea(pts: Point2D[]): number {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    sum += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return sum / 2;
}

/**
 * Full planar graph region detection.
 * Collects all segments from all entities, finds intersections,
 * builds a planar graph, and finds all minimal enclosed faces.
 */
export function autoDetectRegions(entities: CadEntity[]): ClosedRegion[] {
  const rawSegs = collectAllSegments(entities);
  if (rawSegs.length < 2) {
    // Fall back to simple closed-shape detection
    return simpleDetect(entities);
  }

  const splitSegs = splitSegmentsAtIntersections(rawSegs);
  if (splitSegs.length < 3) return simpleDetect(entities);

  const graph = buildGraph(splitSegs);
  const faces = findFaces(graph);

  const regions: ClosedRegion[] = [];
  for (const face of faces) {
    const area = signedArea(face);
    // Skip the outer (unbounded) face — it has the largest absolute area
    // Also skip very tiny faces (numerical noise)
    const absArea = Math.abs(area);
    if (absArea < 0.01) continue;

    const props = computeRegionProps(face);
    regions.push({
      id: generateId(),
      boundary: face,
      ...props,
      source: "auto", sign: "add",
    });
  }

  // Sort by area ascending so smallest faces come first (inner regions)
  regions.sort((a, b) => a.area - b.area);

  // Remove the largest face (likely the outer boundary)
  if (regions.length > 1) {
    const maxArea = Math.max(...regions.map((r) => r.area));
    const filtered = regions.filter((r) => r.area < maxArea * 0.95);
    if (filtered.length > 0) return filtered;
  }

  return regions;
}

/** Simple detection for single closed shapes (fallback) */
function simpleDetect(entities: CadEntity[]): ClosedRegion[] {
  const regions: ClosedRegion[] = [];
  for (const e of entities) {
    let polygon: Point2D[] | null = null;
    switch (e.type) {
      case "rectangle":
        polygon = rectToPolygon(e.origin, e.width, e.height);
        break;
      case "polyline":
        if (e.closed && e.points.length >= 3) polygon = e.points;
        break;
      case "circle":
        polygon = circleToPolygon(e.center, e.radius);
        break;
      case "ellipse":
        polygon = ellipseToPolygon(e.center, e.rx, e.ry);
        break;
    }
    if (polygon && polygon.length >= 3) {
      const props = computeRegionProps(polygon);
      regions.push({ id: generateId(), boundary: polygon, ...props, source: "auto", sign: "add" });
    }
  }
  return regions;
}

/**
 * Manual region pick using the planar graph.
 * Given a click point, finds the smallest face that contains it.
 */
export function manualPickRegion(
  clickPt: Point2D,
  entities: CadEntity[]
): ClosedRegion | null {
  const rawSegs = collectAllSegments(entities);

  if (rawSegs.length >= 2) {
    // Use planar graph approach
    const splitSegs = splitSegmentsAtIntersections(rawSegs);
    if (splitSegs.length >= 3) {
      const graph = buildGraph(splitSegs);
      const faces = findFaces(graph);

      // Find all faces containing the click point, pick the smallest
      let bestRegion: ClosedRegion | null = null;
      let bestArea = Infinity;

      for (const face of faces) {
        const absArea = Math.abs(signedArea(face));
        if (absArea < 0.01) continue;
        if (pointInPolygon(clickPt, face) && absArea < bestArea) {
          bestArea = absArea;
          const props = computeRegionProps(face);
          bestRegion = {
            id: generateId(),
            boundary: face,
            ...props,
            source: "manual", sign: "add",
          };
        }
      }

      if (bestRegion) return bestRegion;
    }
  }

  // Fallback: check simple closed shapes
  for (const e of entities) {
    let polygon: Point2D[] | null = null;
    switch (e.type) {
      case "rectangle":
        polygon = rectToPolygon(e.origin, e.width, e.height);
        break;
      case "polyline":
        if (e.closed && e.points.length >= 3) polygon = e.points;
        break;
      case "circle":
        polygon = circleToPolygon(e.center, e.radius);
        break;
      case "ellipse":
        polygon = ellipseToPolygon(e.center, e.rx, e.ry);
        break;
    }
    if (polygon && pointInPolygon(clickPt, polygon)) {
      const props = computeRegionProps(polygon);
      return { id: generateId(), boundary: polygon, ...props, source: "manual", sign: "add" };
    }
  }

  return null;
}
