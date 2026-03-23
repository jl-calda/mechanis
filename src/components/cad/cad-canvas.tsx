"use client";

import { useRef, useCallback, useState, useMemo, useEffect } from "react";
import type { CadState, Point2D, CadEntity } from "@/types/cad";
import type { CadAction } from "@/lib/cad-reducer";
import { snapToGrid, generateId, distance, midpoint, pointNearSegment, pointNearCircle, pointNearEllipse, getEntitySnapPoints, getEntityBounds, trimEntityAtPoint, getTrimPreview, getEntitySegments, hitTestEdge, computeFilletFromEdges, getFilletPreviewFromEdges, arcToPoints } from "@/lib/cad/geometry";
import type { FilletEdge } from "@/lib/cad/geometry";
import { manualPickRegion } from "@/lib/cad/region-detect";
import { CadGrid } from "./cad-grid";
import { CadEntityRenderer } from "./cad-entity-renderer";
import { CadRegionOverlay } from "./cad-region-overlay";

interface Props {
  state: CadState;
  dispatch: React.Dispatch<CadAction>;
}

/** Find nearest snap point to cursor within a radius */
function findNearestSnap(
  cursor: Point2D,
  entities: CadEntity[],
  snapRadius: number
): Point2D | null {
  let best: Point2D | null = null;
  let bestDist = snapRadius;
  for (const e of entities) {
    for (const sp of getEntitySnapPoints(e)) {
      const d = distance(cursor, sp);
      if (d < bestDist) {
        bestDist = d;
        best = sp;
      }
    }
  }
  return best;
}

/** Check if entity bounding box intersects a selection rectangle */
function entityInRect(
  e: CadEntity,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  const b = getEntityBounds(e);
  if (!b) return false;
  return !(b.maxX < rx || b.minX > rx + rw || b.maxY < ry || b.minY > ry + rh);
}

/** Get handle positions for a selected entity */
function getHandlePositions(e: CadEntity): Point2D[] {
  switch (e.type) {
    case "line": return [e.start, e.end];
    case "rectangle": return [
      e.origin,
      { x: e.origin.x + e.width, y: e.origin.y },
      { x: e.origin.x + e.width, y: e.origin.y + e.height },
      { x: e.origin.x, y: e.origin.y + e.height },
    ];
    case "polyline": return e.points;
    case "circle": return [e.center, { x: e.center.x + e.radius, y: e.center.y }, { x: e.center.x, y: e.center.y - e.radius }];
    case "ellipse": return [e.center, { x: e.center.x + e.rx, y: e.center.y }, { x: e.center.x, y: e.center.y - e.ry }];
    case "dimension": return [e.startPt, e.endPt];
    case "arc": return [
      e.center,
      { x: e.center.x + e.radius * Math.cos(e.startAngle), y: e.center.y + e.radius * Math.sin(e.startAngle) },
      { x: e.center.x + e.radius * Math.cos(e.endAngle), y: e.center.y + e.radius * Math.sin(e.endAngle) },
    ];
    default: return [];
  }
}

export function CadCanvas({ state, dispatch }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursorPos, setCursorPos] = useState<Point2D>({ x: 0, y: 0 });
  const [previewPt, setPreviewPt] = useState<Point2D | null>(null);
  const [snapPt, setSnapPt] = useState<Point2D | null>(null);
  const [snapType, setSnapType] = useState<"grid" | "node" | null>(null);

  // Trim hover state
  const [trimHover, setTrimHover] = useState<{
    entityId: string;
    removedSegment: [Point2D, Point2D];
    removedArc?: { center: Point2D; radius: number; startAngle: number; endAngle: number };
  } | null>(null);

  // Fillet state
  const [filletFirstEdge, setFilletFirstEdge] = useState<FilletEdge | null>(null);
  const [filletRadius, setFilletRadius] = useState(0.25);
  const [filletPreview, setFilletPreview] = useState<{
    arcPoints: Point2D[];
    tangentA: Point2D;
    tangentB: Point2D;
  } | null>(null);
  const [filletHoverEdge, setFilletHoverEdge] = useState<FilletEdge | null>(null);

  // Pan state
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Drag-to-move state
  const isDragging = useRef(false);
  const dragStart = useRef<Point2D>({ x: 0, y: 0 });
  const dragEntityIds = useRef<string[]>([]);
  const dragCommitted = useRef(false);

  // Resize handle drag state
  const isResizing = useRef(false);
  const resizeEntityId = useRef<string>("");
  const resizeHandleIndex = useRef<number>(-1);

  // Rectangle selection state
  const [selRect, setSelRect] = useState<{ start: Point2D; current: Point2D } | null>(null);
  const isSelecting = useRef(false);
  const selStartWorld = useRef<Point2D>({ x: 0, y: 0 });

  // Cursor tooltip input state — multi-field
  const [tooltipFields, setTooltipFields] = useState<{ labels: string[]; values: string[]; placeholders: string[] }>({ labels: [], values: [], placeholders: [] });
  const [tooltipActiveField, setTooltipActiveField] = useState(0);
  const [showTooltipInput, setShowTooltipInput] = useState(false);
  const tooltipInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const tooltipCommitRef = useRef<() => void>(() => {});
  const [mouseScreenPos, setMouseScreenPos] = useState({ x: 0, y: 0 });

  // Editable dimension state
  const [editingDim, setEditingDim] = useState<{
    id: string;
    value: string;
    screenX: number;
    screenY: number;
  } | null>(null);

  const { viewport, grid, entities, selectedIds, activeTool, drawState, regions } = state;

  // Center origin on mount
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
      const svg = svgRef.current;
      if (svg && svg.clientWidth > 0) {
        hasInitialized.current = true;
        dispatch({
          type: "SET_VIEWPORT",
          viewport: {
            panX: svg.clientWidth / 2,
            panY: svg.clientHeight / 2,
            zoom: 40,
          },
        });
      }
    }
  }, [dispatch]);


  // Convert screen coords to SVG world coords
  const screenToWorld = useCallback(
    (clientX: number, clientY: number): Point2D => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const svgX = clientX - rect.left;
      const svgY = clientY - rect.top;
      const viewW = rect.width / viewport.zoom;
      const viewH = rect.height / viewport.zoom;
      const worldX = -viewport.panX / viewport.zoom + (svgX / rect.width) * viewW;
      const worldY = -viewport.panY / viewport.zoom + (svgY / rect.height) * viewH;
      return { x: worldX, y: worldY };
    },
    [viewport]
  );

  const worldToScreen = useCallback(
    (wx: number, wy: number): { x: number; y: number } => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const viewW = rect.width / viewport.zoom;
      const viewH = rect.height / viewport.zoom;
      const viewX = -viewport.panX / viewport.zoom;
      const viewY = -viewport.panY / viewport.zoom;
      const sx = ((wx - viewX) / viewW) * rect.width;
      const sy = ((wy - viewY) / viewH) * rect.height;
      return { x: sx, y: sy };
    },
    [viewport]
  );

  const snapRadius = 0.5;

  const doSnap = useCallback(
    (raw: Point2D): { pt: Point2D; type: "grid" | "node" | null } => {
      // First try entity snap points
      const nearest = findNearestSnap(raw, entities, snapRadius);
      if (nearest) return { pt: nearest, type: "node" };
      // Fall back to grid snap
      if (grid.snap) return { pt: snapToGrid(raw, grid.size), type: "grid" };
      return { pt: raw, type: null };
    },
    [entities, grid]
  );

  // Hit test
  const hitTest = useCallback(
    (p: Point2D): string | null => {
      const tol = 0.5 / viewport.zoom;
      for (let i = entities.length - 1; i >= 0; i--) {
        const e = entities[i];
        switch (e.type) {
          case "point":
            if (distance(p, e.position) < tol * 2) return e.id;
            break;
          case "line":
            if (pointNearSegment(p, e.start, e.end, tol)) return e.id;
            break;
          case "rectangle": {
            const corners = [
              e.origin,
              { x: e.origin.x + e.width, y: e.origin.y },
              { x: e.origin.x + e.width, y: e.origin.y + e.height },
              { x: e.origin.x, y: e.origin.y + e.height },
            ];
            for (let j = 0; j < 4; j++) {
              if (pointNearSegment(p, corners[j], corners[(j + 1) % 4], tol))
                return e.id;
            }
            if (p.x >= e.origin.x && p.x <= e.origin.x + e.width && p.y >= e.origin.y && p.y <= e.origin.y + e.height)
              return e.id;
            break;
          }
          case "polyline":
            for (let j = 0; j < e.points.length - 1; j++) {
              if (pointNearSegment(p, e.points[j], e.points[j + 1], tol)) return e.id;
            }
            if (e.closed && e.points.length >= 3 && pointNearSegment(p, e.points[e.points.length - 1], e.points[0], tol))
              return e.id;
            break;
          case "circle":
            if (pointNearCircle(p, e.center, e.radius, tol) || distance(p, e.center) < e.radius) return e.id;
            break;
          case "ellipse":
            if (pointNearEllipse(p, e.center, e.rx, e.ry, tol)) return e.id;
            break;
          case "dimension": {
            const dx = e.endPt.x - e.startPt.x;
            const dy = e.endPt.y - e.startPt.y;
            const len = distance(e.startPt, e.endPt);
            if (len < 0.001) break;
            const px = -dy / len;
            const py = dx / len;
            const ds = { x: e.startPt.x + px * e.offset, y: e.startPt.y + py * e.offset };
            const de = { x: e.endPt.x + px * e.offset, y: e.endPt.y + py * e.offset };
            if (pointNearSegment(p, ds, de, tol * 2)) return e.id;
            break;
          }
          case "arc": {
            const pts = arcToPoints(e.center, e.radius, e.startAngle, e.endAngle, 16);
            for (let j = 0; j < pts.length - 1; j++) {
              if (pointNearSegment(p, pts[j], pts[j + 1], tol)) return e.id;
            }
            break;
          }
        }
      }
      return null;
    },
    [entities, viewport.zoom]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (editingDim) return;

      const world = screenToWorld(e.clientX, e.clientY);
      const { pt } = doSnap(world);

      // Right-click on handle → toggle lock
      if (e.button === 2) {
        const handleTol = 0.2;
        for (const selId of selectedIds) {
          const selEntity = entities.find((ent) => ent.id === selId);
          if (!selEntity) continue;
          const handles = getHandlePositions(selEntity);
          for (let hi = 0; hi < handles.length; hi++) {
            if (distance(world, handles[hi]) < handleTol) {
              dispatch({ type: "TOGGLE_HANDLE_LOCK", id: selId, handleIndex: hi });
              return;
            }
          }
        }
        return;
      }

      // Pan
      if (activeTool === "pan" || e.button === 1) {
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY, panX: viewport.panX, panY: viewport.panY };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        return;
      }

      // Trim mode — works on lines, rectangles, polylines
      if (activeTool === "trim") {
        const hitId = hitTest(world);
        if (hitId) {
          const entity = entities.find((ent) => ent.id === hitId);
          if (entity) {
            const result = trimEntityAtPoint(entity, world, entities);
            if (result !== null) {
              dispatch({ type: "REPLACE_ENTITY", id: hitId, newEntities: result });
            }
          }
        }
        return;
      }

      // Fillet mode — two-click: first edge, then second edge
      if (activeTool === "fillet") {
        const tol = 0.5 / viewport.zoom;
        const edge = hitTestEdge(world, entities, tol);
        if (edge) {
          if (!filletFirstEdge) {
            // First click — select first edge
            setFilletFirstEdge(edge);
          } else {
            // Second click — compute fillet (allow same entity if different edge)
            const sameEdge = edge.entityId === filletFirstEdge.entityId && edge.segmentIndex === filletFirstEdge.segmentIndex;
            if (!sameEdge) {
              const result = computeFilletFromEdges(filletFirstEdge, edge, entities, filletRadius);
              if (result) {
                dispatch({ type: "REPLACE_ENTITIES", ids: result.removedIds, newEntities: result.newEntities });
              }
            }
            setFilletFirstEdge(null);
            setFilletPreview(null);
            setFilletHoverEdge(null);
          }
        }
        return;
      }

      // Select mode
      if (activeTool === "select") {
        // Check if clicking on a resize handle of an already-selected entity
        const handleTol = 0.2;
        for (const selId of selectedIds) {
          const selEntity = entities.find((ent) => ent.id === selId);
          if (!selEntity) continue;
          const handles = getHandlePositions(selEntity);
          for (let hi = 0; hi < handles.length; hi++) {
            if (distance(world, handles[hi]) < handleTol) {
              // Don't resize locked handles
              if (selEntity.lockedHandles?.includes(hi)) return;
              // Start resize drag
              isResizing.current = true;
              resizeEntityId.current = selId;
              resizeHandleIndex.current = hi;
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              return;
            }
          }
        }

        const hitId = hitTest(world);
        if (hitId) {
          if (!selectedIds.includes(hitId)) {
            if (e.shiftKey) {
              dispatch({ type: "TOGGLE_SELECT", id: hitId });
            } else {
              dispatch({ type: "SELECT", ids: [hitId] });
            }
          }
          // Begin drag-to-move
          isDragging.current = true;
          dragCommitted.current = false;
          dragStart.current = { x: world.x, y: world.y };
          dragEntityIds.current = selectedIds.includes(hitId) ? [...selectedIds] : [hitId];
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        } else {
          // Begin rectangle selection
          if (!e.shiftKey) dispatch({ type: "CLEAR_SELECTION" });
          isSelecting.current = true;
          selStartWorld.current = world;
          setSelRect({ start: world, current: world });
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }
        return;
      }

      // Region pick
      if (activeTool === "region-pick") {
        const region = manualPickRegion(world, entities);
        if (region) dispatch({ type: "ADD_REGION", region });
        return;
      }

      // If tooltip is showing, a click on canvas commits it and places the entity
      if (showTooltipInput) {
        tooltipCommitRef.current();
        return;
      }

      // In drawing modes, clicking on an existing entity selects it (if not mid-draw)
      if (!drawState && activeTool !== "point") {
        const hitId = hitTest(world);
        if (hitId) {
          if (e.shiftKey) {
            dispatch({ type: "TOGGLE_SELECT", id: hitId });
          } else {
            dispatch({ type: "SELECT", ids: [hitId] });
          }
          return;
        }
        // Clicking empty space clears selection
        if (selectedIds.length > 0 && !e.shiftKey) {
          dispatch({ type: "CLEAR_SELECTION" });
        }
      }

      // Drawing tools
      if (activeTool === "point") {
        dispatch({ type: "ADD_ENTITY", entity: { id: generateId(), type: "point", position: pt, stroke: "", strokeWidth: 1, locked: false } });
        return;
      }
      if (activeTool === "line") {
        if (!drawState) {
          dispatch({ type: "SET_DRAW_STATE", points: [pt] });
        } else {
          dispatch({ type: "ADD_ENTITY", entity: { id: generateId(), type: "line", start: drawState.points[0], end: pt, thickness: 0, stroke: "", strokeWidth: 1, locked: false } });
          dispatch({ type: "SET_DRAW_STATE", points: null });
        }
        return;
      }
      if (activeTool === "rectangle") {
        if (!drawState) {
          dispatch({ type: "SET_DRAW_STATE", points: [pt] });
        } else {
          const origin = drawState.points[0];
          dispatch({ type: "ADD_ENTITY", entity: { id: generateId(), type: "rectangle", origin: { x: Math.min(origin.x, pt.x), y: Math.min(origin.y, pt.y) }, width: Math.abs(pt.x - origin.x), height: Math.abs(pt.y - origin.y), stroke: "", strokeWidth: 1, locked: false } });
          dispatch({ type: "SET_DRAW_STATE", points: null });
        }
        return;
      }
      if (activeTool === "polyline") {
        if (!drawState) {
          dispatch({ type: "SET_DRAW_STATE", points: [pt] });
        } else {
          dispatch({ type: "SET_DRAW_STATE", points: [...drawState.points, pt] });
        }
        return;
      }
      if (activeTool === "circle") {
        if (!drawState) {
          dispatch({ type: "SET_DRAW_STATE", points: [pt] });
        } else {
          dispatch({ type: "ADD_ENTITY", entity: { id: generateId(), type: "circle", center: drawState.points[0], radius: distance(drawState.points[0], pt), stroke: "", strokeWidth: 1, locked: false } });
          dispatch({ type: "SET_DRAW_STATE", points: null });
        }
        return;
      }
      if (activeTool === "ellipse") {
        if (!drawState) {
          dispatch({ type: "SET_DRAW_STATE", points: [pt] });
        } else {
          const center = drawState.points[0];
          dispatch({ type: "ADD_ENTITY", entity: { id: generateId(), type: "ellipse", center, rx: Math.abs(pt.x - center.x), ry: Math.abs(pt.y - center.y), stroke: "", strokeWidth: 1, locked: false } });
          dispatch({ type: "SET_DRAW_STATE", points: null });
        }
        return;
      }
      if (activeTool === "dimension") {
        if (!drawState) {
          dispatch({ type: "SET_DRAW_STATE", points: [pt] });
        } else if (drawState.points.length === 1) {
          dispatch({ type: "SET_DRAW_STATE", points: [...drawState.points, pt] });
        } else if (drawState.points.length === 2) {
          const p1 = drawState.points[0];
          const p2 = drawState.points[1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          let offset = 0.8;
          if (len > 0.001) {
            const nx = -dy / len;
            const ny = dx / len;
            offset = (world.x - p1.x) * nx + (world.y - p1.y) * ny;
            if (Math.abs(offset) < 0.2) offset = offset >= 0 ? 0.5 : -0.5;
          }
          dispatch({ type: "ADD_ENTITY", entity: { id: generateId(), type: "dimension", startPt: p1, endPt: p2, offset, labelOverride: null, stroke: "", strokeWidth: 1, locked: false } });
          dispatch({ type: "SET_DRAW_STATE", points: null });
        }
        return;
      }
    },
    [activeTool, drawState, screenToWorld, doSnap, hitTest, dispatch, entities, viewport, selectedIds, editingDim, filletFirstEdge, filletRadius, showTooltipInput]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const world = screenToWorld(e.clientX, e.clientY);
      const noSnap = activeTool === "trim" || activeTool === "fillet" || activeTool === "region-pick";
      const snapResult = noSnap ? { pt: world, type: null as "grid" | "node" | null } : doSnap(world);
      setCursorPos(snapResult.pt);
      setPreviewPt(snapResult.pt);
      setSnapType(snapResult.type);

      // Track screen position for tooltip
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (svgRect) {
        setMouseScreenPos({ x: e.clientX - svgRect.left, y: e.clientY - svgRect.top });
      }

      // Compute snap indicator point
      const nearest = noSnap ? null : findNearestSnap(world, entities, snapRadius);
      setSnapPt(nearest && distance(world, nearest) < snapRadius ? nearest : null);

      // Resize handle drag
      if (isResizing.current) {
        dispatch({
          type: "RESIZE_HANDLE",
          id: resizeEntityId.current,
          handleIndex: resizeHandleIndex.current,
          newPos: snapResult.pt,
        });
        return;
      }

      // Rectangle selection
      if (isSelecting.current) {
        setSelRect({ start: selStartWorld.current, current: world });
        return;
      }

      // Drag-to-move
      if (isDragging.current) {
        const dx = world.x - dragStart.current.x;
        const dy = world.y - dragStart.current.y;
        const sdx = grid.snap ? Math.round(dx / grid.size) * grid.size : dx;
        const sdy = grid.snap ? Math.round(dy / grid.size) * grid.size : dy;
        if (Math.abs(sdx) > 0.001 || Math.abs(sdy) > 0.001) {
          dispatch({ type: "MOVE_ENTITIES", ids: dragEntityIds.current, dx: sdx, dy: sdy });
          dragStart.current = { x: dragStart.current.x + sdx, y: dragStart.current.y + sdy };
          dragCommitted.current = true;
        }
        return;
      }

      // Pan
      if (isPanning.current) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        dispatch({ type: "SET_VIEWPORT", viewport: { ...viewport, panX: panStart.current.panX + dx, panY: panStart.current.panY + dy } });
      }

      // Trim hover preview
      if (activeTool === "trim") {
        const hitId = hitTest(world);
        if (hitId) {
          const entity = entities.find((ent) => ent.id === hitId);
          if (entity) {
            const preview = getTrimPreview(entity, world, entities);
            setTrimHover(preview);
          } else {
            setTrimHover(null);
          }
        } else {
          setTrimHover(null);
        }
      } else if (trimHover) {
        setTrimHover(null);
      }

      // Fillet hover preview
      if (activeTool === "fillet") {
        const tol = 0.5 / viewport.zoom;
        const edge = hitTestEdge(world, entities, tol);
        if (edge) {
          setFilletHoverEdge(edge);
          if (filletFirstEdge) {
            const sameEdge = edge.entityId === filletFirstEdge.entityId && edge.segmentIndex === filletFirstEdge.segmentIndex;
            if (!sameEdge) {
              const preview = getFilletPreviewFromEdges(filletFirstEdge, edge, filletRadius);
              setFilletPreview(preview);
            } else {
              setFilletPreview(null);
            }
          } else {
            setFilletPreview(null);
          }
        } else {
          setFilletHoverEdge(null);
          setFilletPreview(null);
        }
      } else {
        if (filletHoverEdge) setFilletHoverEdge(null);
        if (filletPreview) setFilletPreview(null);
        if (filletFirstEdge) setFilletFirstEdge(null);
      }
    },
    [screenToWorld, doSnap, viewport, dispatch, grid, entities, activeTool, hitTest, trimHover, filletFirstEdge, filletRadius, filletHoverEdge, filletPreview]
  );

  const handlePointerUp = useCallback(() => {
    // Finish rectangle selection
    if (isSelecting.current && selRect) {
      const rx = Math.min(selRect.start.x, selRect.current.x);
      const ry = Math.min(selRect.start.y, selRect.current.y);
      const rw = Math.abs(selRect.current.x - selRect.start.x);
      const rh = Math.abs(selRect.current.y - selRect.start.y);
      if (rw > 0.05 || rh > 0.05) {
        const ids = entities.filter((e) => entityInRect(e, rx, ry, rw, rh)).map((e) => e.id);
        if (ids.length > 0) dispatch({ type: "SELECT", ids });
      }
      setSelRect(null);
      isSelecting.current = false;
    }
    isPanning.current = false;
    isDragging.current = false;
    isResizing.current = false;
  }, [selRect, entities, dispatch]);

  // Use a ref-based wheel handler so we can attach it as non-passive
  // (React's onWheel is passive and cannot preventDefault)
  const wheelDispatchRef = useRef(dispatch);
  wheelDispatchRef.current = dispatch;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      wheelDispatchRef.current({
        type: "ZOOM",
        delta,
        center: {
          x: e.clientX - (svg.getBoundingClientRect().left ?? 0),
          y: e.clientY - (svg.getBoundingClientRect().top ?? 0),
        },
      });
    };
    svg.addEventListener("wheel", handler, { passive: false });
    return () => svg.removeEventListener("wheel", handler);
  }, []);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const world = screenToWorld(e.clientX, e.clientY);
      const hitId = hitTest(world);
      if (hitId) {
        const entity = entities.find((ent) => ent.id === hitId);
        if (entity?.type === "dimension") {
          const len = distance(entity.startPt, entity.endPt);
          const label = entity.labelOverride ?? len.toFixed(2);
          const dx = entity.endPt.x - entity.startPt.x;
          const dy = entity.endPt.y - entity.startPt.y;
          const dLen = distance(entity.startPt, entity.endPt);
          const px = dLen > 0 ? -dy / dLen : 0;
          const py = dLen > 0 ? dx / dLen : 0;
          const mx = (entity.startPt.x + entity.endPt.x) / 2 + px * entity.offset;
          const my = (entity.startPt.y + entity.endPt.y) / 2 + py * entity.offset;
          const screen = worldToScreen(mx, my);
          setEditingDim({ id: entity.id, value: label, screenX: screen.x, screenY: screen.y });
          return;
        }
      }
      if (activeTool === "polyline" && drawState && drawState.points.length >= 2) {
        dispatch({ type: "ADD_ENTITY", entity: { id: generateId(), type: "polyline", points: drawState.points, closed: false, thickness: 0, stroke: "", strokeWidth: 1, locked: false } });
        dispatch({ type: "SET_DRAW_STATE", points: null });
      }
    },
    [activeTool, drawState, dispatch, screenToWorld, worldToScreen, hitTest, entities]
  );

  const handleDimEditCommit = useCallback(() => {
    if (!editingDim) return;
    const entity = entities.find((e) => e.id === editingDim.id);
    if (!entity || entity.type !== "dimension") { setEditingDim(null); return; }
    const newVal = parseFloat(editingDim.value);
    if (isNaN(newVal) || newVal <= 0) { setEditingDim(null); return; }
    const currentLen = distance(entity.startPt, entity.endPt);
    if (Math.abs(currentLen - newVal) < 0.001) { setEditingDim(null); return; }
    const scale = newVal / currentLen;
    const dx = entity.endPt.x - entity.startPt.x;
    const dy = entity.endPt.y - entity.startPt.y;
    const locked = entity.lockedHandles ?? [];
    const startLocked = locked.includes(0);
    const endLocked = locked.includes(1);

    if (startLocked && endLocked) {
      // Both locked — just override the label
      dispatch({ type: "UPDATE_ENTITY", id: entity.id, changes: { labelOverride: editingDim.value } as never });
    } else if (endLocked) {
      // End is locked — move start
      const newStart = { x: entity.endPt.x - dx * scale, y: entity.endPt.y - dy * scale };
      dispatch({ type: "UPDATE_ENTITY", id: entity.id, changes: { startPt: newStart, labelOverride: null } as never });
    } else {
      // Default or start locked — move end
      const newEnd = { x: entity.startPt.x + dx * scale, y: entity.startPt.y + dy * scale };
      dispatch({ type: "UPDATE_ENTITY", id: entity.id, changes: { endPt: newEnd, labelOverride: null } as never });
    }
    setEditingDim(null);
  }, [editingDim, entities, dispatch]);

  // Handle tooltip input commit: parse value and apply to current drawing
  /** Get tooltip field config for the current tool and draw state */
  const getTooltipConfig = useCallback((tool: string, ds: typeof drawState): { labels: string[]; placeholders: string[]; defaults: string[] } | null => {
    if (tool === "fillet") return { labels: ["r:"], placeholders: [filletRadius.toFixed(2)], defaults: [filletRadius.toFixed(2)] };
    if (!ds || ds.points.length < 1) return null;
    if (tool === "line" || tool === "polyline") {
      const refPt = tool === "polyline" ? ds.points[ds.points.length - 1] : ds.points[0];
      const d = distance(refPt, cursorPos);
      const ang = Math.atan2(cursorPos.y - refPt.y, cursorPos.x - refPt.x) * 180 / Math.PI;
      return { labels: ["len:", "ang:"], placeholders: [d.toFixed(2), ang.toFixed(1)], defaults: ["", ang.toFixed(1)] };
    }
    if (tool === "rectangle") return { labels: ["w:", "h:"], placeholders: ["1.00", "1.00"], defaults: ["", ""] };
    if (tool === "circle") return { labels: ["r:"], placeholders: ["1.00"], defaults: [""] };
    if (tool === "ellipse") return { labels: ["rx:", "ry:"], placeholders: ["1.00", "1.00"], defaults: ["", ""] };
    if (tool === "dimension" && ds.points.length >= 2) return { labels: ["len:"], placeholders: [distance(ds.points[0], ds.points[1]).toFixed(2)], defaults: [""] };
    return null;
  }, [cursorPos, filletRadius]);

  /** Open the tooltip input with appropriate fields */
  const openTooltipInput = useCallback((tool: string, ds: typeof drawState) => {
    const cfg = getTooltipConfig(tool, ds);
    if (!cfg) return;
    setTooltipFields({ labels: cfg.labels, values: cfg.defaults, placeholders: cfg.placeholders });
    setTooltipActiveField(0);
    setShowTooltipInput(true);
    setTimeout(() => {
      tooltipInputRefs.current[0]?.focus();
      tooltipInputRefs.current[0]?.select();
    }, 10);
  }, [getTooltipConfig]);

  /** Close the tooltip and reset */
  const closeTooltip = useCallback(() => {
    setShowTooltipInput(false);
    setTooltipFields({ labels: [], values: [], placeholders: [] });
    setTooltipActiveField(0);
  }, []);

  /** Commit the current tooltip values */
  const handleTooltipCommit = useCallback(() => {
    const vals = tooltipFields.values;
    const phs = tooltipFields.placeholders;

    // Fillet radius — update radius state
    if (activeTool === "fillet") {
      const r = parseFloat(vals[0] || phs[0]);
      if (!isNaN(r) && r > 0) setFilletRadius(r);
      closeTooltip();
      return;
    }

    if (!drawState) { closeTooltip(); return; }
    const start = drawState.points[0];

    if (activeTool === "line") {
      const len = parseFloat(vals[0] || phs[0]);
      if (isNaN(len) || len <= 0) { closeTooltip(); return; }
      const angDeg = parseFloat(vals[1] || phs[1]);
      const ang = isNaN(angDeg) ? 0 : angDeg * Math.PI / 180;
      const endPt = { x: start.x + Math.cos(ang) * len, y: start.y + Math.sin(ang) * len };
      dispatch({ type: "ADD_ENTITY", entity: { id: generateId(), type: "line", start, end: endPt, thickness: 0, stroke: "", strokeWidth: 1, locked: false } });
      dispatch({ type: "SET_DRAW_STATE", points: null });
    } else if (activeTool === "polyline") {
      const lastPt = drawState.points[drawState.points.length - 1];
      const len = parseFloat(vals[0] || phs[0]);
      if (isNaN(len) || len <= 0) { closeTooltip(); return; }
      const angDeg = parseFloat(vals[1] || phs[1]);
      const ang = isNaN(angDeg) ? 0 : angDeg * Math.PI / 180;
      const newPt = { x: lastPt.x + Math.cos(ang) * len, y: lastPt.y + Math.sin(ang) * len };
      dispatch({ type: "SET_DRAW_STATE", points: [...drawState.points, newPt] });
    } else if (activeTool === "rectangle") {
      const w = parseFloat(vals[0] || phs[0]);
      const h = parseFloat(vals[1] || phs[1] || vals[0] || phs[0]);
      if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) { closeTooltip(); return; }
      dispatch({ type: "ADD_ENTITY", entity: { id: generateId(), type: "rectangle", origin: start, width: w, height: h, stroke: "", strokeWidth: 1, locked: false } });
      dispatch({ type: "SET_DRAW_STATE", points: null });
    } else if (activeTool === "circle") {
      const r = parseFloat(vals[0] || phs[0]);
      if (isNaN(r) || r <= 0) { closeTooltip(); return; }
      dispatch({ type: "ADD_ENTITY", entity: { id: generateId(), type: "circle", center: start, radius: r, stroke: "", strokeWidth: 1, locked: false } });
      dispatch({ type: "SET_DRAW_STATE", points: null });
    } else if (activeTool === "ellipse") {
      const rx = parseFloat(vals[0] || phs[0]);
      const ry = parseFloat(vals[1] || phs[1] || vals[0] || phs[0]);
      if (isNaN(rx) || rx <= 0 || isNaN(ry) || ry <= 0) { closeTooltip(); return; }
      dispatch({ type: "ADD_ENTITY", entity: { id: generateId(), type: "ellipse", center: start, rx, ry, stroke: "", strokeWidth: 1, locked: false } });
      dispatch({ type: "SET_DRAW_STATE", points: null });
    }

    closeTooltip();
  }, [drawState, tooltipFields, activeTool, cursorPos, dispatch, closeTooltip]);

  // Keep ref in sync so handlePointerDown can call it without circular dependency
  tooltipCommitRef.current = handleTooltipCommit;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (editingDim) return;

      // When tooltip is open, only handle Escape and Tab to cycle fields
      if (showTooltipInput) {
        // These are handled by the input fields' own onKeyDown
        return;
      }

      // Tab opens tooltip input when drawing (or fillet mode)
      if (e.key === "Tab") {
        e.preventDefault();
        const hasDrawing = drawState && drawState.points.length >= 1;
        if (hasDrawing || activeTool === "fillet") {
          openTooltipInput(activeTool, drawState);
        }
        return;
      }

      // Number keys / minus / dot auto-open tooltip input and start typing
      const isNumKey = /^[0-9.\-]$/.test(e.key);
      if (isNumKey && !e.ctrlKey && !e.metaKey) {
        const hasDrawing = drawState && drawState.points.length >= 1;
        if (hasDrawing || activeTool === "fillet") {
          e.preventDefault();
          const cfg = getTooltipConfig(activeTool, drawState);
          if (cfg) {
            setTooltipFields({ labels: cfg.labels, values: [e.key, ...cfg.defaults.slice(1)], placeholders: cfg.placeholders });
            setTooltipActiveField(0);
            setShowTooltipInput(true);
            setTimeout(() => {
              const inp = tooltipInputRefs.current[0];
              if (inp) { inp.focus(); inp.selectionStart = inp.selectionEnd = 1; }
            }, 10);
          }
          return;
        }
      }

      if (e.key === "Escape") {
        if (activeTool === "fillet" && filletFirstEdge) {
          setFilletFirstEdge(null);
          setFilletPreview(null);
        } else {
          dispatch({ type: "SET_DRAW_STATE", points: null });
          dispatch({ type: "SET_TOOL", tool: "select" });
        }
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        dispatch({ type: "DELETE_ENTITIES", ids: selectedIds });
      }
      if (e.ctrlKey && e.key === "z") dispatch({ type: "UNDO" });
      if (e.ctrlKey && e.key === "y") dispatch({ type: "REDO" });
      if (e.key === "f") {
        const svg = svgRef.current;
        if (svg) dispatch({ type: "ZOOM_TO_FIT", canvasWidth: svg.clientWidth, canvasHeight: svg.clientHeight });
      }
      if (e.key === "c" && activeTool === "polyline" && drawState && drawState.points.length >= 3) {
        dispatch({ type: "ADD_ENTITY", entity: { id: generateId(), type: "polyline", points: drawState.points, closed: true, thickness: 0, stroke: "", strokeWidth: 1, locked: false } });
        dispatch({ type: "SET_DRAW_STATE", points: null });
      }
    },
    [activeTool, drawState, selectedIds, dispatch, editingDim, showTooltipInput, filletFirstEdge, openTooltipInput, getTooltipConfig]
  );

  // Compute viewBox
  const svgEl = svgRef.current;
  const svgW = svgEl?.clientWidth ?? 800;
  const svgH = svgEl?.clientHeight ?? 600;
  const viewW = svgW / viewport.zoom;
  const viewH = svgH / viewport.zoom;
  const viewX = -viewport.panX / viewport.zoom;
  const viewY = -viewport.panY / viewport.zoom;

  let cursorStyle = "crosshair";
  if (activeTool === "pan") cursorStyle = "grab";
  else if (activeTool === "select") cursorStyle = isDragging.current ? "grabbing" : "default";
  else if (activeTool === "trim") cursorStyle = trimHover ? "pointer" : "crosshair";
  else if (activeTool === "fillet") cursorStyle = filletHoverEdge ? "pointer" : "crosshair";

  // Collect nearby snap points for rendering (only the visible ones near cursor)
  const visibleSnaps = useMemo(() => {
    if (activeTool === "select" || activeTool === "pan") return [];
    const pts: Point2D[] = [];
    const radius = snapRadius;
    for (const e of entities) {
      for (const sp of getEntitySnapPoints(e)) {
        if (distance(cursorPos, sp) < radius * 2) {
          pts.push(sp);
        }
      }
    }
    return pts;
  }, [entities, cursorPos, activeTool]);

  return (
    <div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-surface">
      <svg
        ref={svgRef}
        className="h-full w-full"
        viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}
        style={{ cursor: cursorStyle }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        onContextMenu={(e) => e.preventDefault()}
        tabIndex={0}
      >
        {/* Grid */}
        {grid.visible && (
          <CadGrid gridSize={grid.size} viewBox={{ x: viewX, y: viewY, w: viewW, h: viewH }} />
        )}

        {/* Regions */}
        <CadRegionOverlay regions={regions} />

        {/* Entities */}
        {entities.map((e) => (
          <CadEntityRenderer
            key={e.id}
            entity={e}
            selected={selectedIds.includes(e.id) || (activeTool === "fillet" && filletFirstEdge?.entityId === e.id)}
            trimHover={
              (activeTool === "trim" && trimHover?.entityId === e.id) ||
              (activeTool === "fillet" && filletHoverEdge?.entityId === e.id && filletFirstEdge?.entityId !== e.id)
            }
          />
        ))}

        {/* Trim preview — show segment that would be removed */}
        {activeTool === "trim" && trimHover && (
          trimHover.removedArc ? (() => {
            const { center, radius, startAngle, endAngle } = trimHover.removedArc;
            const pts = arcToPoints(center, radius, startAngle, endAngle, 32);
            return (
              <polyline
                points={pts.map(p => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="var(--danger)"
                strokeWidth={0.18}
                strokeLinecap="round"
                strokeDasharray="0.15 0.1"
                opacity={0.7}
              />
            );
          })() : (
            <line
              x1={trimHover.removedSegment[0].x}
              y1={trimHover.removedSegment[0].y}
              x2={trimHover.removedSegment[1].x}
              y2={trimHover.removedSegment[1].y}
              stroke="var(--danger)"
              strokeWidth={0.18}
              strokeLinecap="round"
              strokeDasharray="0.15 0.1"
              opacity={0.7}
            />
          )
        )}

        {/* Fillet preview — show arc that would be created */}
        {activeTool === "fillet" && filletPreview && (
          <g>
            <polyline
              points={filletPreview.arcPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={0.14}
              strokeLinecap="round"
              opacity={0.8}
            />
            {/* Tangent point markers */}
            <circle cx={filletPreview.tangentA.x} cy={filletPreview.tangentA.y} r={0.1} fill="var(--primary)" opacity={0.6} />
            <circle cx={filletPreview.tangentB.x} cy={filletPreview.tangentB.y} r={0.1} fill="var(--primary)" opacity={0.6} />
          </g>
        )}

        {/* Snap point indicators */}
        {visibleSnaps.map((sp, i) => (
          <g key={i}>
            <circle cx={sp.x} cy={sp.y} r={0.1} fill="none" stroke="var(--primary)" strokeWidth={0.025} opacity={0.5} />
            {/* Small diamond shape */}
            <polygon
              points={`${sp.x},${sp.y - 0.08} ${sp.x + 0.08},${sp.y} ${sp.x},${sp.y + 0.08} ${sp.x - 0.08},${sp.y}`}
              fill="var(--primary)"
              fillOpacity={0.3}
              stroke="none"
            />
          </g>
        ))}

        {/* Active snap highlight */}
        {snapType === "node" && snapPt && activeTool !== "select" && activeTool !== "pan" && (
          <g>
            <circle cx={snapPt.x} cy={snapPt.y} r={0.18} fill="none" stroke="var(--primary)" strokeWidth={0.05} />
            <line x1={snapPt.x - 0.15} y1={snapPt.y} x2={snapPt.x + 0.15} y2={snapPt.y} stroke="var(--primary)" strokeWidth={0.04} />
            <line x1={snapPt.x} y1={snapPt.y - 0.15} x2={snapPt.x} y2={snapPt.y + 0.15} stroke="var(--primary)" strokeWidth={0.04} />
          </g>
        )}
        {snapType === "grid" && activeTool !== "select" && activeTool !== "pan" && (
          <g>
            <circle cx={cursorPos.x} cy={cursorPos.y} r={0.1} fill="#38bdf8" fillOpacity={0.5} stroke="#38bdf8" strokeWidth={0.03} />
          </g>
        )}

        {/* Rectangle selection box */}
        {selRect && (
          <rect
            x={Math.min(selRect.start.x, selRect.current.x)}
            y={Math.min(selRect.start.y, selRect.current.y)}
            width={Math.abs(selRect.current.x - selRect.start.x)}
            height={Math.abs(selRect.current.y - selRect.start.y)}
            fill="var(--primary)"
            fillOpacity={0.08}
            stroke="var(--primary)"
            strokeWidth={0.03}
            strokeDasharray="0.12 0.06"
          />
        )}

        {/* Draw preview */}
        {drawState && previewPt && (
          <g opacity={0.5}>
            {activeTool === "line" && drawState.points.length === 1 && (
              <line x1={drawState.points[0].x} y1={drawState.points[0].y} x2={previewPt.x} y2={previewPt.y} stroke="var(--primary)" strokeWidth={0.06} strokeDasharray="0.12 0.08" />
            )}
            {activeTool === "rectangle" && drawState.points.length === 1 && (
              <rect x={Math.min(drawState.points[0].x, previewPt.x)} y={Math.min(drawState.points[0].y, previewPt.y)} width={Math.abs(previewPt.x - drawState.points[0].x)} height={Math.abs(previewPt.y - drawState.points[0].y)} fill="var(--primary)" fillOpacity={0.05} stroke="var(--primary)" strokeWidth={0.06} strokeDasharray="0.12 0.08" />
            )}
            {activeTool === "polyline" && drawState.points.length >= 1 && (
              <>{drawState.points.map((p, i) => {
                const next = drawState.points[i + 1] ?? previewPt;
                return <line key={i} x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke="var(--primary)" strokeWidth={0.06} strokeDasharray="0.12 0.08" />;
              })}</>
            )}
            {activeTool === "circle" && drawState.points.length === 1 && (
              <circle cx={drawState.points[0].x} cy={drawState.points[0].y} r={distance(drawState.points[0], previewPt)} fill="var(--primary)" fillOpacity={0.05} stroke="var(--primary)" strokeWidth={0.06} strokeDasharray="0.12 0.08" />
            )}
            {activeTool === "ellipse" && drawState.points.length === 1 && (
              <ellipse cx={drawState.points[0].x} cy={drawState.points[0].y} rx={Math.abs(previewPt.x - drawState.points[0].x)} ry={Math.abs(previewPt.y - drawState.points[0].y)} fill="var(--primary)" fillOpacity={0.05} stroke="var(--primary)" strokeWidth={0.06} strokeDasharray="0.12 0.08" />
            )}
            {/* Dimension: step 1 — line from node 1 to cursor */}
            {activeTool === "dimension" && drawState.points.length === 1 && (
              <>
                <line x1={drawState.points[0].x} y1={drawState.points[0].y} x2={previewPt.x} y2={previewPt.y} stroke="var(--svg-dim)" strokeWidth={0.03} strokeDasharray="0.1 0.06" />
                <text x={(drawState.points[0].x + previewPt.x) / 2} y={(drawState.points[0].y + previewPt.y) / 2 - 0.3} fill="var(--svg-dim)" fontSize={0.3} textAnchor="middle" fontFamily="var(--font-mono)">{distance(drawState.points[0], previewPt).toFixed(2)}</text>
              </>
            )}
            {/* Dimension: step 2 — show dimension line preview with offset from cursor */}
            {activeTool === "dimension" && drawState.points.length === 2 && (() => {
              const p1 = drawState.points[0];
              const p2 = drawState.points[1];
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const len = distance(p1, p2);
              if (len < 0.001) return null;
              const nx = -dy / len;
              const ny = dx / len;
              const off = (previewPt.x - p1.x) * nx + (previewPt.y - p1.y) * ny;
              const ds = { x: p1.x + nx * off, y: p1.y + ny * off };
              const de = { x: p2.x + nx * off, y: p2.y + ny * off };
              const mx = (ds.x + de.x) / 2;
              const my = (ds.y + de.y) / 2;
              return (
                <>
                  {/* Extension lines */}
                  <line x1={p1.x} y1={p1.y} x2={ds.x} y2={ds.y} stroke="var(--svg-dim)" strokeWidth={0.02} strokeDasharray="0.08 0.04" />
                  <line x1={p2.x} y1={p2.y} x2={de.x} y2={de.y} stroke="var(--svg-dim)" strokeWidth={0.02} strokeDasharray="0.08 0.04" />
                  {/* Dimension line */}
                  <line x1={ds.x} y1={ds.y} x2={de.x} y2={de.y} stroke="var(--svg-dim)" strokeWidth={0.03} />
                  {/* Label */}
                  <text x={mx} y={my - 0.15} fill="var(--svg-dim)" fontSize={0.3} textAnchor="middle" fontFamily="var(--font-mono)">{len.toFixed(2)}</text>
                  {/* Node markers */}
                  <circle cx={p1.x} cy={p1.y} r={0.1} fill="var(--primary)" fillOpacity={0.5} />
                  <circle cx={p2.x} cy={p2.y} r={0.1} fill="var(--primary)" fillOpacity={0.5} />
                </>
              );
            })()}
          </g>
        )}

        {/* Cursor crosshair */}
        {activeTool !== "select" && activeTool !== "pan" && (
          <g opacity={0.3}>
            <line x1={cursorPos.x - 0.3} y1={cursorPos.y} x2={cursorPos.x + 0.3} y2={cursorPos.y} stroke="var(--primary)" strokeWidth={0.02} />
            <line x1={cursorPos.x} y1={cursorPos.y - 0.3} x2={cursorPos.x} y2={cursorPos.y + 0.3} stroke="var(--primary)" strokeWidth={0.02} />
          </g>
        )}
      </svg>

      {/* Cursor tooltip — shows snap state + live measurements */}
      {!showTooltipInput && activeTool !== "pan" && (
        <div
          className="pointer-events-none absolute z-10 rounded bg-surface/90 border border-border px-2 py-1 text-[10px] font-mono text-foreground backdrop-blur-sm whitespace-nowrap"
          style={{ left: mouseScreenPos.x + 16, top: mouseScreenPos.y + 16 }}
        >
          {/* Snap indicator */}
          {snapType === "node" && <span className="text-primary mr-1.5">● Node</span>}
          {snapType === "grid" && <span className="text-sky-400 mr-1.5">▦ Grid</span>}
          {!snapType && <span className="text-muted/40 mr-1.5">○ Free</span>}

          {/* Coordinates */}
          <span className="text-muted">{cursorPos.x.toFixed(2)}, {cursorPos.y.toFixed(2)}</span>

          {/* Measurement when drawing */}
          {drawState && drawState.points.length >= 1 && previewPt && activeTool !== "select" && (() => {
            const start = drawState.points[0];
            if (activeTool === "line") {
              const d = distance(start, previewPt);
              const ang = Math.atan2(previewPt.y - start.y, previewPt.x - start.x) * 180 / Math.PI;
              return <><span className="text-border mx-1">|</span><span className="text-primary">{d.toFixed(2)}</span> <span className="text-muted">@ {ang.toFixed(1)}°</span> <span className="text-muted/40 ml-1">[Tab] or type</span></>;
            }
            if (activeTool === "dimension") {
              if (drawState.points.length === 1) {
                const d = distance(start, previewPt);
                return <><span className="text-border mx-1">|</span><span className="text-primary">{d.toFixed(2)}</span> <span className="text-muted/40 ml-1">click node 2</span></>;
              }
              if (drawState.points.length === 2) {
                const p1 = drawState.points[0], p2 = drawState.points[1];
                const d = distance(p1, p2);
                const dx = p2.x - p1.x, dy = p2.y - p1.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const nx = len > 0 ? -dy / len : 0, ny = len > 0 ? dx / len : 0;
                const off = (previewPt.x - p1.x) * nx + (previewPt.y - p1.y) * ny;
                return <><span className="text-border mx-1">|</span><span className="text-primary">{d.toFixed(2)}</span> <span className="text-muted">off={off.toFixed(2)}</span></>;
              }
              return null;
            }
            if (activeTool === "rectangle") {
              const w = Math.abs(previewPt.x - start.x), h = Math.abs(previewPt.y - start.y);
              return <><span className="text-border mx-1">|</span><span className="text-primary">{w.toFixed(2)}</span><span className="text-muted">×</span><span className="text-primary">{h.toFixed(2)}</span> <span className="text-muted/40 ml-1">[Tab] or type</span></>;
            }
            if (activeTool === "circle") {
              const r = distance(start, previewPt);
              return <><span className="text-border mx-1">|</span><span className="text-muted">r=</span><span className="text-primary">{r.toFixed(2)}</span> <span className="text-muted/40 ml-1">[Tab] or type</span></>;
            }
            if (activeTool === "ellipse") {
              const rx = Math.abs(previewPt.x - start.x), ry = Math.abs(previewPt.y - start.y);
              return <><span className="text-border mx-1">|</span><span className="text-primary">{rx.toFixed(2)}</span><span className="text-muted">×</span><span className="text-primary">{ry.toFixed(2)}</span> <span className="text-muted/40 ml-1">[Tab] or type</span></>;
            }
            if (activeTool === "polyline") {
              const lastPt = drawState.points[drawState.points.length - 1];
              const d = distance(lastPt, previewPt);
              const ang = Math.atan2(previewPt.y - lastPt.y, previewPt.x - lastPt.x) * 180 / Math.PI;
              return <><span className="text-border mx-1">|</span><span className="text-primary">{d.toFixed(2)}</span> <span className="text-muted">@ {ang.toFixed(1)}°</span> <span className="text-muted/40 ml-1">[Tab] or type</span></>;
            }
            return null;
          })()}

          {/* Fillet radius display */}
          {activeTool === "fillet" && (
            <><span className="text-border mx-1">|</span><span className="text-muted">r=</span><span className="text-primary">{filletRadius.toFixed(2)}</span> <span className="text-muted/40 ml-1">[Tab] to edit</span></>
          )}
        </div>
      )}

      {/* Multi-field tooltip input — appears when Tab or number key is pressed during drawing */}
      {showTooltipInput && (
        <div
          className="absolute z-20"
          style={{ left: mouseScreenPos.x + 16, top: mouseScreenPos.y + 16 }}
        >
          <div className="flex items-center gap-1.5 rounded bg-surface border border-primary px-1.5 py-1 shadow-lg">
            {tooltipFields.labels.map((label, i) => (
              <div key={label} className="flex items-center gap-0.5">
                {i > 0 && <span className="text-border text-[10px]">|</span>}
                <span className="text-[10px] text-muted">{label}</span>
                <input
                  ref={(el) => { tooltipInputRefs.current[i] = el; }}
                  type="text"
                  value={tooltipFields.values[i]}
                  onChange={(ev) => {
                    const newVals = [...tooltipFields.values];
                    newVals[i] = ev.target.value;
                    setTooltipFields({ ...tooltipFields, values: newVals });
                  }}
                  onFocus={() => setTooltipActiveField(i)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") { handleTooltipCommit(); }
                    else if (ev.key === "Tab") {
                      ev.preventDefault();
                      const next = ev.shiftKey
                        ? (i - 1 + tooltipFields.labels.length) % tooltipFields.labels.length
                        : (i + 1) % tooltipFields.labels.length;
                      // If Tab forward past last field, commit
                      if (!ev.shiftKey && i === tooltipFields.labels.length - 1) {
                        handleTooltipCommit();
                      } else {
                        setTooltipActiveField(next);
                        setTimeout(() => { tooltipInputRefs.current[next]?.focus(); tooltipInputRefs.current[next]?.select(); }, 0);
                      }
                    }
                    else if (ev.key === "Escape") { closeTooltip(); }
                    ev.stopPropagation();
                  }}
                  onBlur={(ev) => {
                    // Only close if focus left ALL tooltip inputs
                    const related = ev.relatedTarget as HTMLElement | null;
                    const isTooltipInput = tooltipInputRefs.current.some((r) => r === related);
                    if (!isTooltipInput) setTimeout(() => closeTooltip(), 100);
                  }}
                  placeholder={tooltipFields.placeholders[i]}
                  className={`w-14 bg-transparent text-xs font-mono text-foreground placeholder:text-muted/40 focus:outline-none ${i === tooltipActiveField ? "border-b border-primary" : ""}`}
                />
              </div>
            ))}
            <span className="text-[9px] text-muted/40 ml-0.5">↵</span>
          </div>
        </div>
      )}

      {/* Coordinate display */}
      <div className="absolute bottom-2 left-2 rounded bg-surface/80 px-2 py-0.5 text-[10px] font-mono text-muted backdrop-blur-sm">
        {cursorPos.x.toFixed(2)}, {cursorPos.y.toFixed(2)}
        {snapType === "node" && <span className="ml-1.5 text-primary">● Node</span>}
        {snapType === "grid" && <span className="ml-1.5 text-sky-400">▦ Grid</span>}
      </div>

      {/* Active tool hint */}
      <div className="absolute top-2 left-2 rounded bg-surface/80 px-2 py-0.5 text-[10px] text-muted backdrop-blur-sm">
        {activeTool === "polyline" && drawState
          ? "Click to add · Double-click to finish · C to close · Type to enter length,angle"
          : activeTool === "select"
            ? "Click to select · Drag to move · Drag handle to resize"
            : activeTool === "dimension"
              ? !drawState ? "Click first node" : drawState.points.length === 1 ? "Click second node" : "Click to set offset"
              : activeTool === "trim"
                ? "Hover to highlight · Click to trim"
                : activeTool === "fillet"
                  ? !filletFirstEdge ? `Click first edge · Tab to set r=${filletRadius}` : "Click second edge to fillet"
                  : activeTool === "region-pick"
                    ? "Click inside a closed shape"
                    : activeTool === "line"
                      ? !drawState ? "Click to start · Esc to cancel" : "Click or type length · Tab for length,angle"
                      : activeTool === "rectangle"
                        ? !drawState ? "Click origin · Esc to cancel" : "Click or type w,h · Tab for width,height"
                        : activeTool === "circle"
                          ? !drawState ? "Click center · Esc to cancel" : "Click or type radius"
                          : activeTool === "ellipse"
                            ? !drawState ? "Click center · Esc to cancel" : "Click or type rx,ry"
                            : drawState ? "Click or type to set value · Esc to cancel" : "Click to start · Esc to cancel · F to zoom fit"}
      </div>

      {/* Editable dimension input overlay */}
      {editingDim && (
        <div className="absolute z-10" style={{ left: editingDim.screenX - 40, top: editingDim.screenY - 14 }}>
          <input
            autoFocus
            type="text"
            value={editingDim.value}
            onChange={(e) => setEditingDim({ ...editingDim, value: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") handleDimEditCommit(); if (e.key === "Escape") setEditingDim(null); e.stopPropagation(); }}
            onBlur={handleDimEditCommit}
            className="w-20 rounded border border-primary bg-surface px-1.5 py-0.5 text-xs font-mono text-foreground text-center focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}
    </div>
  );
}
