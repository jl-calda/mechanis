"use client";

import { useReducer, useMemo, useState } from "react";
import { cadReducer, initialCadState } from "@/lib/cad-reducer";
import { CadCanvas } from "@/components/cad/cad-canvas";
import { CadToolbar } from "@/components/cad/cad-toolbar";
import { CadProperties } from "@/components/cad/cad-properties";
import { CadResults } from "@/components/cad/cad-results";
import { distance } from "@/lib/cad/geometry";
import { autoDetectRegions } from "@/lib/cad/region-detect";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function CadPage() {
  const [state, dispatch] = useReducer(cadReducer, initialCadState);
  const [panelOpen, setPanelOpen] = useState(false);

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

  function handleZoomToFit() {
    const svg = document.querySelector(".cad-svg");
    const w = svg?.clientWidth ?? 800;
    const h = svg?.clientHeight ?? 600;
    dispatch({ type: "ZOOM_TO_FIT", canvasWidth: w, canvasHeight: h });
  }

  const rightPanel = (
    <>
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
      <CadResults
        entities={state.entities}
        regions={state.regions}
        onToggleRegionSign={(id) => dispatch({ type: "TOGGLE_REGION_SIGN", id })}
        onRemoveRegion={(id) => dispatch({ type: "REMOVE_REGION", id })}
      />

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
                {e.type === "arc" && `r=${e.radius.toFixed(2)}`}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-3rem)] gap-2 md:gap-3 pt-1 md:pt-2 -mx-4 md:mx-0 px-2 md:px-0">
      {/* Toolbar: horizontal on mobile, vertical on desktop */}
      <div className="md:hidden">
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
          onZoomToFit={handleZoomToFit}
          horizontal
        />
      </div>
      <div className="hidden md:block">
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
          onZoomToFit={handleZoomToFit}
        />
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0">
        <CadCanvas state={state} dispatch={dispatch} />
      </div>

      {/* Right panel: sidebar on desktop, bottom sheet on mobile */}
      <div className="hidden md:flex w-64 flex-col gap-3 overflow-y-auto">
        {rightPanel}
      </div>

      {/* Mobile bottom panel */}
      <div className="md:hidden">
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="flex w-full items-center justify-center gap-1 rounded-t-lg border border-border bg-surface-alt py-1.5 text-[10px] font-medium text-muted"
        >
          {panelOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          {panelOpen ? "Hide Panel" : `Properties & Results${state.regions.length > 0 ? ` (${state.regions.length})` : ""}`}
        </button>
        {panelOpen && (
          <div className="flex flex-col gap-2 border-x border-b border-border bg-background p-2 max-h-64 overflow-y-auto rounded-b-lg">
            {rightPanel}
          </div>
        )}
      </div>
    </div>
  );
}
