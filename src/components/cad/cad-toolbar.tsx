"use client";

import type { ToolType } from "@/types/cad";
import {
  MousePointer2,
  Dot,
  Minus,
  Square,
  Spline,
  Circle,
  Ellipsis,
  Move,
  Ruler,
  ScanSearch,
  Grid3x3,
  Magnet,
  Undo2,
  Redo2,
  Sparkles,
  Trash2,
  Maximize2,
  Scissors,
} from "lucide-react";

interface Props {
  activeTool: ToolType;
  gridVisible: boolean;
  snapEnabled: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  onSetTool: (tool: ToolType) => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAnalyze: () => void;
  onDeleteSelected: () => void;
  onZoomToFit: () => void;
}

const tools: { tool: ToolType; icon: typeof MousePointer2; label: string }[] = [
  { tool: "select", icon: MousePointer2, label: "Select" },
  { tool: "pan", icon: Move, label: "Pan" },
  { tool: "point", icon: Dot, label: "Point (bolt)" },
  { tool: "line", icon: Minus, label: "Line" },
  { tool: "rectangle", icon: Square, label: "Rectangle" },
  { tool: "polyline", icon: Spline, label: "Polyline" },
  { tool: "circle", icon: Circle, label: "Circle" },
  { tool: "ellipse", icon: Ellipsis, label: "Ellipse" },
  { tool: "dimension", icon: Ruler, label: "Dimension" },
  { tool: "trim", icon: Scissors, label: "Trim" },
  { tool: "region-pick", icon: ScanSearch, label: "Pick Region" },
];

const btnBase =
  "flex h-8 w-8 items-center justify-center rounded-md transition-colors";
const btnActive = "bg-primary/20 text-primary";
const btnInactive = "text-muted hover:bg-surface-alt hover:text-foreground";

export function CadToolbar({
  activeTool,
  gridVisible,
  snapEnabled,
  canUndo,
  canRedo,
  hasSelection,
  onSetTool,
  onToggleGrid,
  onToggleSnap,
  onUndo,
  onRedo,
  onAnalyze,
  onDeleteSelected,
  onZoomToFit,
}: Props) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-1.5">
      {/* Drawing tools */}
      {tools.map(({ tool, icon: Icon, label }) => (
        <button
          key={tool}
          onClick={() => onSetTool(tool)}
          className={`${btnBase} ${activeTool === tool ? btnActive : btnInactive}`}
          title={label}
        >
          <Icon size={15} />
        </button>
      ))}

      <div className="my-1 h-px bg-border" />

      {/* Grid & Snap */}
      <button
        onClick={onToggleGrid}
        className={`${btnBase} ${gridVisible ? btnActive : btnInactive}`}
        title="Toggle Grid"
      >
        <Grid3x3 size={15} />
      </button>
      <button
        onClick={onToggleSnap}
        className={`${btnBase} ${snapEnabled ? btnActive : btnInactive}`}
        title="Snap to Grid"
      >
        <Magnet size={15} />
      </button>

      <div className="my-1 h-px bg-border" />

      {/* Undo / Redo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`${btnBase} ${canUndo ? btnInactive : "text-muted/30 cursor-not-allowed"}`}
        title="Undo"
      >
        <Undo2 size={15} />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`${btnBase} ${canRedo ? btnInactive : "text-muted/30 cursor-not-allowed"}`}
        title="Redo"
      >
        <Redo2 size={15} />
      </button>

      <div className="my-1 h-px bg-border" />

      {/* Delete */}
      {hasSelection && (
        <button
          onClick={onDeleteSelected}
          className={`${btnBase} text-danger hover:bg-danger/10`}
          title="Delete Selected"
        >
          <Trash2 size={15} />
        </button>
      )}

      {/* Zoom to Fit */}
      <button
        onClick={onZoomToFit}
        className={`${btnBase} ${btnInactive}`}
        title="Zoom to Fit"
      >
        <Maximize2 size={15} />
      </button>

      {/* Analyze */}
      <button
        onClick={onAnalyze}
        className={`${btnBase} text-primary hover:bg-primary/10`}
        title="Detect Regions & Analyze"
      >
        <Sparkles size={15} />
      </button>
    </div>
  );
}
