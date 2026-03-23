import type {
  CadState,
  CadEntity,
  ToolType,
  Point2D,
  ClosedRegion,
  Viewport,
} from "@/types/cad";
import { getEntityBounds } from "@/lib/cad/geometry";

export type CadAction =
  | { type: "SET_TOOL"; tool: ToolType }
  | { type: "ADD_ENTITY"; entity: CadEntity }
  | { type: "UPDATE_ENTITY"; id: string; changes: Partial<CadEntity> }
  | { type: "DELETE_ENTITIES"; ids: string[] }
  | { type: "SELECT"; ids: string[] }
  | { type: "TOGGLE_SELECT"; id: string }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_DRAW_STATE"; points: Point2D[] | null }
  | { type: "SET_VIEWPORT"; viewport: Viewport }
  | { type: "ZOOM"; delta: number; center: Point2D }
  | { type: "TOGGLE_GRID" }
  | { type: "TOGGLE_SNAP" }
  | { type: "SET_REGIONS"; regions: ClosedRegion[] }
  | { type: "ADD_REGION"; region: ClosedRegion }
  | { type: "TOGGLE_REGION_SIGN"; id: string }
  | { type: "REMOVE_REGION"; id: string }
  | { type: "CLEAR_REGIONS" }
  | { type: "MOVE_ENTITIES"; ids: string[]; dx: number; dy: number }
  | { type: "RESIZE_HANDLE"; id: string; handleIndex: number; newPos: Point2D }
  | { type: "TOGGLE_HANDLE_LOCK"; id: string; handleIndex: number }
  | { type: "REPLACE_ENTITY"; id: string; newEntities: CadEntity[] }
  | { type: "REPLACE_ENTITIES"; ids: string[]; newEntities: CadEntity[] }
  | { type: "ZOOM_TO_FIT"; canvasWidth: number; canvasHeight: number }
  | { type: "UNDO" }
  | { type: "REDO" };

export const initialCadState: CadState = {
  entities: [],
  selectedIds: [],
  activeTool: "select",
  history: [[]],
  historyIndex: 0,
  viewport: { panX: 0, panY: 0, zoom: 1 },
  grid: { size: 1, snap: true, visible: true },
  regions: [],
  drawState: null,
};

function pushHistory(state: CadState, entities: CadEntity[]): CadState {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(entities);
  // keep max 50 undo steps
  if (newHistory.length > 50) newHistory.shift();
  return {
    ...state,
    entities,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

export function cadReducer(state: CadState, action: CadAction): CadState {
  switch (action.type) {
    case "SET_TOOL":
      return {
        ...state,
        activeTool: action.tool,
        drawState: null,
      };

    case "ADD_ENTITY": {
      const newEntities = [...state.entities, action.entity];
      return pushHistory(state, newEntities);
    }

    case "UPDATE_ENTITY": {
      const newEntities = state.entities.map((e) =>
        e.id === action.id ? ({ ...e, ...action.changes } as CadEntity) : e
      );
      return pushHistory(state, newEntities);
    }

    case "DELETE_ENTITIES": {
      const idSet = new Set(action.ids);
      const newEntities = state.entities.filter((e) => !idSet.has(e.id));
      return {
        ...pushHistory(state, newEntities),
        selectedIds: state.selectedIds.filter((id) => !idSet.has(id)),
        regions: [],
      };
    }

    case "SELECT":
      return { ...state, selectedIds: action.ids };

    case "TOGGLE_SELECT": {
      const has = state.selectedIds.includes(action.id);
      return {
        ...state,
        selectedIds: has
          ? state.selectedIds.filter((id) => id !== action.id)
          : [...state.selectedIds, action.id],
      };
    }

    case "CLEAR_SELECTION":
      return { ...state, selectedIds: [] };

    case "SET_DRAW_STATE":
      return {
        ...state,
        drawState: action.points ? { points: action.points } : null,
      };

    case "SET_VIEWPORT":
      return { ...state, viewport: action.viewport };

    case "ZOOM": {
      const oldZoom = state.viewport.zoom;
      const newZoom = Math.max(0.1, Math.min(20, oldZoom * (1 + action.delta)));
      const ratio = newZoom / oldZoom;
      return {
        ...state,
        viewport: {
          zoom: newZoom,
          panX: action.center.x - (action.center.x - state.viewport.panX) * ratio,
          panY: action.center.y - (action.center.y - state.viewport.panY) * ratio,
        },
      };
    }

    case "TOGGLE_GRID":
      return { ...state, grid: { ...state.grid, visible: !state.grid.visible } };

    case "TOGGLE_SNAP":
      return { ...state, grid: { ...state.grid, snap: !state.grid.snap } };

    case "SET_REGIONS":
      return { ...state, regions: action.regions };

    case "ADD_REGION":
      return { ...state, regions: [...state.regions, action.region] };

    case "TOGGLE_REGION_SIGN":
      return {
        ...state,
        regions: state.regions.map((r) =>
          r.id === action.id
            ? { ...r, sign: r.sign === "add" ? "subtract" as const : "add" as const }
            : r
        ),
      };

    case "REMOVE_REGION":
      return { ...state, regions: state.regions.filter((r) => r.id !== action.id) };

    case "CLEAR_REGIONS":
      return { ...state, regions: [] };

    case "TOGGLE_HANDLE_LOCK": {
      const newEntities = state.entities.map((e) => {
        if (e.id !== action.id) return e;
        const current = e.lockedHandles ?? [];
        const has = current.includes(action.handleIndex);
        const lockedHandles = has
          ? current.filter((i) => i !== action.handleIndex)
          : [...current, action.handleIndex];
        return { ...e, lockedHandles } as CadEntity;
      });
      return pushHistory(state, newEntities);
    }

    case "RESIZE_HANDLE": {
      const { id, handleIndex, newPos } = action;
      // Block if handle is locked
      const target = state.entities.find((e) => e.id === id);
      if (target?.lockedHandles?.includes(handleIndex)) return state;
      const newEntities = state.entities.map((e) => {
        if (e.id !== id) return e;
        switch (e.type) {
          case "line":
            return handleIndex === 0
              ? { ...e, start: newPos }
              : { ...e, end: newPos };
          case "rectangle": {
            // Handles: 0=TL, 1=TR, 2=BR, 3=BL
            const corners = [
              e.origin,
              { x: e.origin.x + e.width, y: e.origin.y },
              { x: e.origin.x + e.width, y: e.origin.y + e.height },
              { x: e.origin.x, y: e.origin.y + e.height },
            ];
            corners[handleIndex] = newPos;
            // Derive opposing corner to compute new origin/width/height
            const opp = corners[(handleIndex + 2) % 4];
            const minX = Math.min(newPos.x, opp.x);
            const minY = Math.min(newPos.y, opp.y);
            const maxX = Math.max(newPos.x, opp.x);
            const maxY = Math.max(newPos.y, opp.y);
            return {
              ...e,
              origin: { x: minX, y: minY },
              width: Math.max(0.01, maxX - minX),
              height: Math.max(0.01, maxY - minY),
            };
          }
          case "polyline":
            if (handleIndex >= 0 && handleIndex < e.points.length) {
              const pts = [...e.points];
              pts[handleIndex] = newPos;
              return { ...e, points: pts };
            }
            return e;
          case "circle": {
            if (handleIndex === 0) return { ...e, center: newPos };
            // Handle 1 or 2 = radius handle
            const r = Math.sqrt((newPos.x - e.center.x) ** 2 + (newPos.y - e.center.y) ** 2);
            return { ...e, radius: Math.max(0.01, r) };
          }
          case "ellipse": {
            if (handleIndex === 0) return { ...e, center: newPos };
            if (handleIndex === 1) return { ...e, rx: Math.max(0.01, Math.abs(newPos.x - e.center.x)) };
            return { ...e, ry: Math.max(0.01, Math.abs(newPos.y - e.center.y)) };
          }
          case "dimension":
            return handleIndex === 0
              ? { ...e, startPt: newPos }
              : { ...e, endPt: newPos };
          case "arc": {
            if (handleIndex === 0) return { ...e, center: newPos };
            // Handles 1,2 are start/end of arc — adjust angle to match new position
            const ang = Math.atan2(newPos.y - e.center.y, newPos.x - e.center.x);
            const r = Math.sqrt((newPos.x - e.center.x) ** 2 + (newPos.y - e.center.y) ** 2);
            if (handleIndex === 1) return { ...e, startAngle: ang, radius: Math.max(0.01, r) };
            return { ...e, endAngle: ang, radius: Math.max(0.01, r) };
          }
          default:
            return e;
        }
      });
      return pushHistory(state, newEntities);
    }

    case "REPLACE_ENTITY": {
      const newEntities: CadEntity[] = [];
      for (const e of state.entities) {
        if (e.id === action.id) {
          newEntities.push(...action.newEntities);
        } else {
          newEntities.push(e);
        }
      }
      return {
        ...pushHistory(state, newEntities),
        selectedIds: state.selectedIds.filter((sid) => sid !== action.id),
        regions: [],
      };
    }

    case "REPLACE_ENTITIES": {
      const removeSet = new Set(action.ids);
      const newEntities = state.entities.filter((e) => !removeSet.has(e.id));
      newEntities.push(...action.newEntities);
      return {
        ...pushHistory(state, newEntities),
        selectedIds: state.selectedIds.filter((sid) => !removeSet.has(sid)),
        regions: [],
      };
    }

    case "MOVE_ENTITIES": {
      const idSet = new Set(action.ids);
      const { dx, dy } = action;
      const newEntities = state.entities.map((e) => {
        if (!idSet.has(e.id)) return e;
        switch (e.type) {
          case "point":
            return { ...e, position: { x: e.position.x + dx, y: e.position.y + dy } };
          case "line":
            return {
              ...e,
              start: { x: e.start.x + dx, y: e.start.y + dy },
              end: { x: e.end.x + dx, y: e.end.y + dy },
            };
          case "rectangle":
            return { ...e, origin: { x: e.origin.x + dx, y: e.origin.y + dy } };
          case "polyline":
            return { ...e, points: e.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
          case "circle":
            return { ...e, center: { x: e.center.x + dx, y: e.center.y + dy } };
          case "ellipse":
            return { ...e, center: { x: e.center.x + dx, y: e.center.y + dy } };
          case "dimension":
            return {
              ...e,
              startPt: { x: e.startPt.x + dx, y: e.startPt.y + dy },
              endPt: { x: e.endPt.x + dx, y: e.endPt.y + dy },
            };
          case "arc":
            return { ...e, center: { x: e.center.x + dx, y: e.center.y + dy } };
          default:
            return e;
        }
      });
      return pushHistory(state, newEntities);
    }

    case "ZOOM_TO_FIT": {
      if (state.entities.length === 0) {
        // No entities: center on origin
        const { canvasWidth: cw, canvasHeight: ch } = action;
        return { ...state, viewport: { panX: cw / 2, panY: ch / 2, zoom: 40 } };
      }
      // Include origin in bounding box
      let minX = 0, minY = 0, maxX = 0, maxY = 0;
      for (const e of state.entities) {
        const b = getEntityBounds(e);
        if (!b) continue;
        minX = Math.min(minX, b.minX);
        minY = Math.min(minY, b.minY);
        maxX = Math.max(maxX, b.maxX);
        maxY = Math.max(maxY, b.maxY);
      }
      const pad = 2; // world units padding
      const bw = maxX - minX + pad * 2;
      const bh = maxY - minY + pad * 2;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const { canvasWidth, canvasHeight } = action;
      const zoom = Math.min(canvasWidth / bw, canvasHeight / bh, 20);
      const panX = canvasWidth / 2 - cx * zoom;
      const panY = canvasHeight / 2 - cy * zoom;
      return { ...state, viewport: { zoom, panX, panY } };
    }

    case "UNDO": {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state,
        entities: state.history[newIndex],
        historyIndex: newIndex,
        selectedIds: [],
      };
    }

    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state,
        entities: state.history[newIndex],
        historyIndex: newIndex,
        selectedIds: [],
      };
    }

    default:
      return state;
  }
}
