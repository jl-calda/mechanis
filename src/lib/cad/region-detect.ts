import type { CadEntity, ClosedRegion, Point2D } from "@/types/cad";
import {
  circleToPolygon,
  ellipseToPolygon,
  rectToPolygon,
  generateId,
  pointInPolygon,
} from "./geometry";
import { computeRegionProps } from "./section-props";

/**
 * Auto-detect closed regions from entities.
 * Finds: closed polylines, rectangles, circles, ellipses.
 * Does NOT do planar graph subdivision (MVP scope).
 */
export function autoDetectRegions(entities: CadEntity[]): ClosedRegion[] {
  const regions: ClosedRegion[] = [];

  for (const e of entities) {
    let polygon: Point2D[] | null = null;

    switch (e.type) {
      case "rectangle":
        polygon = rectToPolygon(e.origin, e.width, e.height);
        break;
      case "polyline":
        if (e.closed && e.points.length >= 3) {
          polygon = e.points;
        }
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
      regions.push({
        id: generateId(),
        boundary: polygon,
        ...props,
        source: "auto",
      });
    }
  }

  return regions;
}

/**
 * Manual region pick: given a click point, try to find enclosed
 * regions among closed shapes that contain the point.
 */
export function manualPickRegion(
  clickPt: Point2D,
  entities: CadEntity[]
): ClosedRegion | null {
  // Check each closed shape to see if click is inside
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
      return {
        id: generateId(),
        boundary: polygon,
        ...props,
        source: "manual",
      };
    }
  }

  return null;
}
