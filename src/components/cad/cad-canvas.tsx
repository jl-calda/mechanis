"use client";

import { useRef, useCallback, useState } from "react";
import type { CadState, Point2D, ToolType, CadEntity } from "@/types/cad";
import type { CadAction } from "@/lib/cad-reducer";
import { snapToGrid, generateId, distance, pointNearSegment, pointNearCircle, pointNearEllipse } from "@/lib/cad/geometry";
import { manualPickRegion } from "@/lib/cad/region-detect";
import { CadGrid } from "./cad-grid";
import { CadEntityRenderer } from "./cad-entity-renderer";
import { CadRegionOverlay } from "./cad-region-overlay";

interface Props {
  state: CadState;
  dispatch: React.Dispatch<CadAction>;
}

function defaultEntity(type: string): Partial<CadEntity> {
  return {
    stroke: "",
    strokeWidth: 1,
    locked: false,
  };
}

export function CadCanvas({ state, dispatch }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursorPos, setCursorPos] = useState<Point2D>({ x: 0, y: 0 });
  const [previewPt, setPreviewPt] = useState<Point2D | null>(null);
  const isPanning = useRef(false);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  const { viewport, grid, entities, selectedIds, activeTool, drawState, regions } = state;

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

  const snap = useCallback(
    (p: Point2D): Point2D => {
      return grid.snap ? snapToGrid(p, grid.size) : p;
    },
    [grid]
  );

  // Hit test: find entity near a world point
  const hitTest = useCallback(
    (p: Point2D): string | null => {
      const tol = 0.3 / viewport.zoom;
      // Reverse iterate for top-most entity
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
            break;
          }
          case "polyline":
            for (let j = 0; j < e.points.length - 1; j++) {
              if (pointNearSegment(p, e.points[j], e.points[j + 1], tol))
                return e.id;
            }
            if (e.closed && e.points.length >= 3) {
              if (
                pointNearSegment(
                  p,
                  e.points[e.points.length - 1],
                  e.points[0],
                  tol
                )
              )
                return e.id;
            }
            break;
          case "circle":
            if (pointNearCircle(p, e.center, e.radius, tol)) return e.id;
            break;
          case "ellipse":
            if (pointNearEllipse(p, e.center, e.rx, e.ry, tol)) return e.id;
            break;
        }
      }
      return null;
    },
    [entities, viewport.zoom]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const world = screenToWorld(e.clientX, e.clientY);
      const pt = snap(world);

      // Pan mode
      if (activeTool === "pan" || e.button === 1) {
        isPanning.current = true;
        panStart.current = {
          x: e.clientX,
          y: e.clientY,
          panX: viewport.panX,
          panY: viewport.panY,
        };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        return;
      }

      // Select mode
      if (activeTool === "select") {
        const hitId = hitTest(world);
        if (hitId) {
          if (e.shiftKey) {
            dispatch({ type: "TOGGLE_SELECT", id: hitId });
          } else {
            dispatch({ type: "SELECT", ids: [hitId] });
          }
        } else {
          dispatch({ type: "CLEAR_SELECTION" });
        }
        return;
      }

      // Region pick
      if (activeTool === "region-pick") {
        const region = manualPickRegion(world, entities);
        if (region) {
          dispatch({ type: "ADD_REGION", region });
        }
        return;
      }

      // Drawing tools
      if (activeTool === "point") {
        dispatch({
          type: "ADD_ENTITY",
          entity: {
            ...defaultEntity("point"),
            id: generateId(),
            type: "point",
            position: pt,
            stroke: "",
            strokeWidth: 1,
            locked: false,
          },
        });
        return;
      }

      if (activeTool === "line") {
        if (!drawState) {
          dispatch({ type: "SET_DRAW_STATE", points: [pt] });
        } else {
          dispatch({
            type: "ADD_ENTITY",
            entity: {
              id: generateId(),
              type: "line",
              start: drawState.points[0],
              end: pt,
              thickness: 0,
              stroke: "",
              strokeWidth: 1,
              locked: false,
            },
          });
          dispatch({ type: "SET_DRAW_STATE", points: null });
        }
        return;
      }

      if (activeTool === "rectangle") {
        if (!drawState) {
          dispatch({ type: "SET_DRAW_STATE", points: [pt] });
        } else {
          const origin = drawState.points[0];
          const w = pt.x - origin.x;
          const h = pt.y - origin.y;
          dispatch({
            type: "ADD_ENTITY",
            entity: {
              id: generateId(),
              type: "rectangle",
              origin: { x: Math.min(origin.x, pt.x), y: Math.min(origin.y, pt.y) },
              width: Math.abs(w),
              height: Math.abs(h),
              stroke: "",
              strokeWidth: 1,
              locked: false,
            },
          });
          dispatch({ type: "SET_DRAW_STATE", points: null });
        }
        return;
      }

      if (activeTool === "polyline") {
        if (!drawState) {
          dispatch({ type: "SET_DRAW_STATE", points: [pt] });
        } else {
          dispatch({
            type: "SET_DRAW_STATE",
            points: [...drawState.points, pt],
          });
        }
        return;
      }

      if (activeTool === "circle") {
        if (!drawState) {
          dispatch({ type: "SET_DRAW_STATE", points: [pt] });
        } else {
          const r = distance(drawState.points[0], pt);
          dispatch({
            type: "ADD_ENTITY",
            entity: {
              id: generateId(),
              type: "circle",
              center: drawState.points[0],
              radius: r,
              stroke: "",
              strokeWidth: 1,
              locked: false,
            },
          });
          dispatch({ type: "SET_DRAW_STATE", points: null });
        }
        return;
      }

      if (activeTool === "ellipse") {
        if (!drawState) {
          dispatch({ type: "SET_DRAW_STATE", points: [pt] });
        } else {
          const center = drawState.points[0];
          dispatch({
            type: "ADD_ENTITY",
            entity: {
              id: generateId(),
              type: "ellipse",
              center,
              rx: Math.abs(pt.x - center.x),
              ry: Math.abs(pt.y - center.y),
              stroke: "",
              strokeWidth: 1,
              locked: false,
            },
          });
          dispatch({ type: "SET_DRAW_STATE", points: null });
        }
        return;
      }
    },
    [activeTool, drawState, screenToWorld, snap, hitTest, dispatch, entities, viewport]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const world = screenToWorld(e.clientX, e.clientY);
      setCursorPos(snap(world));
      setPreviewPt(snap(world));

      if (isPanning.current) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        dispatch({
          type: "SET_VIEWPORT",
          viewport: {
            ...viewport,
            panX: panStart.current.panX + dx,
            panY: panStart.current.panY + dy,
          },
        });
      }
    },
    [screenToWorld, snap, viewport, dispatch]
  );

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      dispatch({
        type: "ZOOM",
        delta,
        center: { x: e.clientX - (svgRef.current?.getBoundingClientRect().left ?? 0), y: e.clientY - (svgRef.current?.getBoundingClientRect().top ?? 0) },
      });
    },
    [dispatch]
  );

  const handleDoubleClick = useCallback(() => {
    // Finish polyline on double-click
    if (activeTool === "polyline" && drawState && drawState.points.length >= 2) {
      dispatch({
        type: "ADD_ENTITY",
        entity: {
          id: generateId(),
          type: "polyline",
          points: drawState.points,
          closed: false,
          thickness: 0,
          stroke: "",
          strokeWidth: 1,
          locked: false,
        },
      });
      dispatch({ type: "SET_DRAW_STATE", points: null });
    }
  }, [activeTool, drawState, dispatch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch({ type: "SET_DRAW_STATE", points: null });
        dispatch({ type: "SET_TOOL", tool: "select" });
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length > 0) {
          dispatch({ type: "DELETE_ENTITIES", ids: selectedIds });
        }
      }
      if (e.ctrlKey && e.key === "z") {
        dispatch({ type: "UNDO" });
      }
      if (e.ctrlKey && e.key === "y") {
        dispatch({ type: "REDO" });
      }
      // Close polyline
      if (e.key === "c" && activeTool === "polyline" && drawState && drawState.points.length >= 3) {
        dispatch({
          type: "ADD_ENTITY",
          entity: {
            id: generateId(),
            type: "polyline",
            points: drawState.points,
            closed: true,
            thickness: 0,
            stroke: "",
            strokeWidth: 1,
            locked: false,
          },
        });
        dispatch({ type: "SET_DRAW_STATE", points: null });
      }
    },
    [activeTool, drawState, selectedIds, dispatch]
  );

  // Compute viewBox
  const svgEl = svgRef.current;
  const svgW = svgEl?.clientWidth ?? 800;
  const svgH = svgEl?.clientHeight ?? 600;
  const viewW = svgW / viewport.zoom;
  const viewH = svgH / viewport.zoom;
  const viewX = -viewport.panX / viewport.zoom;
  const viewY = -viewport.panY / viewport.zoom;

  const cursorStyle =
    activeTool === "pan"
      ? "grab"
      : activeTool === "select"
        ? "default"
        : "crosshair";

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
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Grid */}
        {grid.visible && (
          <CadGrid
            gridSize={grid.size}
            viewBox={{ x: viewX, y: viewY, w: viewW, h: viewH }}
          />
        )}

        {/* Regions */}
        <CadRegionOverlay regions={regions} />

        {/* Entities */}
        {entities.map((e) => (
          <CadEntityRenderer
            key={e.id}
            entity={e}
            selected={selectedIds.includes(e.id)}
          />
        ))}

        {/* Draw preview */}
        {drawState && previewPt && (
          <g opacity={0.5}>
            {activeTool === "line" && drawState.points.length === 1 && (
              <line
                x1={drawState.points[0].x}
                y1={drawState.points[0].y}
                x2={previewPt.x}
                y2={previewPt.y}
                stroke="var(--primary)"
                strokeWidth={0.04}
                strokeDasharray="0.1 0.06"
              />
            )}
            {activeTool === "rectangle" && drawState.points.length === 1 && (
              <rect
                x={Math.min(drawState.points[0].x, previewPt.x)}
                y={Math.min(drawState.points[0].y, previewPt.y)}
                width={Math.abs(previewPt.x - drawState.points[0].x)}
                height={Math.abs(previewPt.y - drawState.points[0].y)}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={0.04}
                strokeDasharray="0.1 0.06"
              />
            )}
            {activeTool === "polyline" && drawState.points.length >= 1 && (
              <>
                {drawState.points.map((p, i) => {
                  const next = drawState.points[i + 1] ?? previewPt;
                  return (
                    <line
                      key={i}
                      x1={p.x}
                      y1={p.y}
                      x2={next.x}
                      y2={next.y}
                      stroke="var(--primary)"
                      strokeWidth={0.04}
                      strokeDasharray="0.1 0.06"
                    />
                  );
                })}
              </>
            )}
            {activeTool === "circle" && drawState.points.length === 1 && (
              <circle
                cx={drawState.points[0].x}
                cy={drawState.points[0].y}
                r={distance(drawState.points[0], previewPt)}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={0.04}
                strokeDasharray="0.1 0.06"
              />
            )}
            {activeTool === "ellipse" && drawState.points.length === 1 && (
              <ellipse
                cx={drawState.points[0].x}
                cy={drawState.points[0].y}
                rx={Math.abs(previewPt.x - drawState.points[0].x)}
                ry={Math.abs(previewPt.y - drawState.points[0].y)}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={0.04}
                strokeDasharray="0.1 0.06"
              />
            )}
          </g>
        )}

        {/* Cursor crosshair */}
        {activeTool !== "select" && activeTool !== "pan" && (
          <g opacity={0.3}>
            <line
              x1={cursorPos.x - 0.3}
              y1={cursorPos.y}
              x2={cursorPos.x + 0.3}
              y2={cursorPos.y}
              stroke="var(--primary)"
              strokeWidth={0.02}
            />
            <line
              x1={cursorPos.x}
              y1={cursorPos.y - 0.3}
              x2={cursorPos.x}
              y2={cursorPos.y + 0.3}
              stroke="var(--primary)"
              strokeWidth={0.02}
            />
          </g>
        )}
      </svg>

      {/* Coordinate display */}
      <div className="absolute bottom-2 left-2 rounded bg-surface/80 px-2 py-0.5 text-[10px] font-mono text-muted backdrop-blur-sm">
        {cursorPos.x.toFixed(2)}, {cursorPos.y.toFixed(2)}
      </div>

      {/* Active tool hint */}
      <div className="absolute top-2 left-2 rounded bg-surface/80 px-2 py-0.5 text-[10px] text-muted backdrop-blur-sm">
        {activeTool === "polyline" && drawState
          ? "Click to add points · Double-click to finish · C to close"
          : activeTool === "select"
            ? "Click to select · Shift+click multi-select"
            : activeTool === "region-pick"
              ? "Click inside a closed shape to detect region"
              : drawState
                ? "Click to set second point · Esc to cancel"
                : "Click to start drawing · Esc to cancel"}
      </div>
    </div>
  );
}
