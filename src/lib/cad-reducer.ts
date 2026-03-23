import type {
  CadState,
  CadEntity,
  ToolType,
  Point2D,
  ClosedRegion,
  Viewport,
} from "@/types/cad";

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
  | { type: "CLEAR_REGIONS" }
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

    case "CLEAR_REGIONS":
      return { ...state, regions: [] };

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
