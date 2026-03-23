"use client";

import { useReducer, useMemo } from "react";
import { cadReducer, initialCadState } from "@/lib/cad-reducer";
import { CadCanvas } from "@/components/cad/cad-canvas";
import { CadToolbar } from "@/components/cad/cad-toolbar";
import { CadProperties } from "@/components/cad/cad-properties";
import { CadResults } from "@/components/cad/cad-results";
import { distance } from "@/lib/cad/geometry";
import { autoDetectRegions } from "@/lib/cad/region-detect";

export default function CadPage() {
  const [state, dispatch] = useReducer(cadReducer, initialCadState);

  const selectedEntity = useMemo(() => {
    if (state.selectedIds.length !== 1) return null;
    return state.entities.find((e) => e.id === state.selectedIds[0]) ?? null;
  }, [state.selectedIds, state.entities]);

  function handleAnalyze() {
    const regions = autoDetectRegions(state.entities);
    dispatch({ type: "SET_REGIONS", regions });
  }

  function handleDeleteSelected() {
    dispatch({ type: "DELETE_ENTITIES", ids: state.selectedIds });
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] gap-3 pt-2">
      {/* Left toolbar */}
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
        onDeleteSelected={handleDeleteSelected}
      />

      {/* Canvas */}
      <CadCanvas state={state} dispatch={dispatch} />

      {/* Right panel */}
      <div className="flex w-64 flex-col gap-3 overflow-y-auto">
        {/* Properties */}
        {selectedEntity && (
          <div className="rounded-lg border border-border bg-surface p-3">
            <CadProperties
              entity={selectedEntity}
              onChange={(id, changes) =>
                dispatch({ type: "UPDATE_ENTITY", id, changes })
              }
            />
          </div>
        )}

        {/* Results */}
        <CadResults entities={state.entities} regions={state.regions} />

        {/* Entity list */}
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="border-b border-border bg-surface-alt px-3 py-1.5">
            <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
              Entities ({state.entities.length})
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-border">
            {state.entities.length === 0 ? (
              <div className="px-3 py-3 text-xs text-muted">
                Draw something to get started.
              </div>
            ) : (
              state.entities.map((e) => (
                <button
                  key={e.id}
                  onClick={() => dispatch({ type: "SELECT", ids: [e.id] })}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    state.selectedIds.includes(e.id)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-surface-alt"
                  }`}
                >
                  <span className="font-mono text-[10px] text-muted mr-1.5">
                    {e.type}
                  </span>
                  {e.type === "point" && `(${e.position.x}, ${e.position.y})`}
                  {e.type === "line" &&
                    `(${e.start.x},${e.start.y}) → (${e.end.x},${e.end.y})`}
                  {e.type === "rectangle" && `${e.width}×${e.height}`}
                  {e.type === "polyline" &&
                    `${e.points.length}pts${e.closed ? " closed" : ""}`}
                  {e.type === "circle" && `r=${e.radius.toFixed(2)}`}
                  {e.type === "ellipse" &&
                    `rx=${e.rx.toFixed(2)} ry=${e.ry.toFixed(2)}`}
                  {e.type === "dimension" &&
                    `${e.labelOverride ?? distance(e.startPt, e.endPt).toFixed(2)}″`}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
