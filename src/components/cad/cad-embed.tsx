"use client";

import { useReducer, useMemo, useState } from "react";
import { cadReducer, initialCadState } from "@/lib/cad-reducer";
import { CadCanvas } from "./cad-canvas";
import { CadToolbar } from "./cad-toolbar";
import { CadProperties } from "./cad-properties";
import { CadResults } from "./cad-results";
import { autoDetectRegions } from "@/lib/cad/region-detect";
import type { CadState } from "@/types/cad";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Props {
  /** Which result tab to default to */
  defaultTab?: "section" | "welds" | "bolts";
  /** Callback when CAD state changes — parent can extract data */
  onStateChange?: (state: CadState) => void;
  /** Initial state to restore from saved project */
  initialState?: Partial<CadState>;
}

export function CadEmbed({ defaultTab, onStateChange, initialState }: Props) {
  const [state, dispatch] = useReducer(cadReducer, {
    ...initialCadState,
    ...initialState,
  });
  const [showResults, setShowResults] = useState(false);

  const selectedEntity = useMemo(() => {
    if (state.selectedIds.length !== 1) return null;
    return state.entities.find((e) => e.id === state.selectedIds[0]) ?? null;
  }, [state.selectedIds, state.entities]);

  function handleAnalyze() {
    const regions = autoDetectRegions(state.entities);
    dispatch({ type: "SET_REGIONS", regions });
  }

  // Notify parent of state changes
  if (onStateChange) {
    onStateChange(state);
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar + Canvas */}
      <div className="flex flex-col md:flex-row gap-2">
        <CadToolbar
          activeTool={state.activeTool}
          gridVisible={state.grid.visible}
          snapEnabled={state.grid.snap}
          canUndo={state.historyIndex > 0}
          canRedo={state.historyIndex < state.history.length - 1}
          hasSelection={state.selectedIds.length > 0}
          onSetTool={(tool) => dispatch({ type: "SET_TOOL", tool })}
          onToggleGrid={() => dispatch({ type: "TOGGLE_GRID" })}
          onToggleSnap={() => dispatch({ type: "TOGGLE_SNAP" })}
          onUndo={() => dispatch({ type: "UNDO" })}
          onRedo={() => dispatch({ type: "REDO" })}
          onAnalyze={handleAnalyze}
          onDeleteSelected={() =>
            dispatch({ type: "DELETE_ENTITIES", ids: state.selectedIds })
          }
          onZoomToFit={() => {
            const el = document.querySelector<HTMLElement>(".cad-embed-canvas");
            dispatch({
              type: "ZOOM_TO_FIT",
              canvasWidth: el?.clientWidth ?? 600,
              canvasHeight: el?.clientHeight ?? 400,
            });
          }}
          horizontal
        />
      </div>

      {/* Canvas — taller on mobile for usable touch area */}
      <div className="cad-embed-canvas h-[60vh] min-h-[280px] max-h-[500px] md:h-96">
        <CadCanvas state={state} dispatch={dispatch} />
      </div>

      {/* Collapsible results */}
      <button
        onClick={() => setShowResults(!showResults)}
        className="flex w-full items-center justify-center gap-1 rounded-lg border border-border bg-surface-alt py-1.5 text-[10px] font-medium text-muted"
      >
        {showResults ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        {showResults ? "Hide Results" : "Show CAD Results"}
      </button>

      {showResults && (
        <div className="flex flex-col md:flex-row gap-2">
          {selectedEntity && (
            <div className="rounded-lg border border-border bg-surface p-3 md:w-64">
              <CadProperties
                entity={selectedEntity}
                onChange={(id, changes) =>
                  dispatch({ type: "UPDATE_ENTITY", id, changes })
                }
              />
            </div>
          )}
          <div className="flex-1">
            <CadResults
              entities={state.entities}
              regions={state.regions}
              onToggleRegionSign={(id) =>
                dispatch({ type: "TOGGLE_REGION_SIGN", id })
              }
              onRemoveRegion={(id) =>
                dispatch({ type: "REMOVE_REGION", id })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
