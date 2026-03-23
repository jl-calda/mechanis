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
  Scissors,
  CornerDownRight,
  CopyPlus,
  ScanSearch,
  Grid3x3,
  Magnet,
  Undo2,
  Redo2,
  Sparkles,
  Trash2,
  Maximize2,
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
  horizontal?: boolean;
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
  { tool: "fillet", icon: CornerDownRight, label: "Fillet" },
  { tool: "offset", icon: CopyPlus, label: "Offset" },
  { tool: "region-pick", icon: ScanSearch, label: "Pick Region" },
];

const btnBase =
  "flex items-center justify-center rounded-md transition-colors";
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
  horizontal = false,
}: Props) {
  const size = horizontal ? "h-7 w-7" : "h-8 w-8";
  const iconSize = horizontal ? 13 : 15;
  const sep = horizontal
    ? "mx-0.5 w-px h-5 bg-border self-center"
    : "my-1 h-px bg-border";

  const wrapperClass = horizontal
    ? "flex items-center gap-0.5 rounded-lg border border-border bg-surface p-1 overflow-x-auto"
    : "flex flex-col gap-1 rounded-lg border border-border bg-surface p-1.5";

  return (
    <div className={wrapperClass}>
      {/* Drawing tools */}
      {tools.map(({ tool, icon: Icon, label }) => (
        <button
          key={tool}
          onClick={() => onSetTool(tool)}
          className={`${btnBase} ${size} ${activeTool === tool ? btnActive : btnInactive}`}
          title={label}
        >
          <Icon size={iconSize} />
        </button>
      ))}

      <div className={sep} />

      {/* Grid & Snap */}
      <button
        onClick={onToggleGrid}
        className={`${btnBase} ${size} ${gridVisible ? btnActive : btnInactive}`}
        title="Toggle Grid"
      >
        <Grid3x3 size={iconSize} />
      </button>
      <button
        onClick={onToggleSnap}
        className={`${btnBase} ${size} ${snapEnabled ? btnActive : btnInactive}`}
        title="Snap to Grid"
      >
        <Magnet size={iconSize} />
      </button>

      <div className={sep} />

      {/* Undo / Redo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`${btnBase} ${size} ${canUndo ? btnInactive : "text-muted/30 cursor-not-allowed"}`}
        title="Undo"
      >
        <Undo2 size={iconSize} />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`${btnBase} ${size} ${canRedo ? btnInactive : "text-muted/30 cursor-not-allowed"}`}
        title="Redo"
      >
        <Redo2 size={iconSize} />
      </button>

      <div className={sep} />

      {/* Delete */}
      {hasSelection && (
        <button
          onClick={onDeleteSelected}
          className={`${btnBase} ${size} text-danger hover:bg-danger/10`}
          title="Delete Selected"
        >
          <Trash2 size={iconSize} />
        </button>
      )}

      {/* Zoom to Fit */}
      <button
        onClick={onZoomToFit}
        className={`${btnBase} ${size} ${btnInactive}`}
        title="Zoom to Fit"
      >
        <Maximize2 size={iconSize} />
      </button>

      {/* Analyze */}
      <button
        onClick={onAnalyze}
        className={`${btnBase} ${size} text-primary hover:bg-primary/10`}
        title="Detect Regions & Analyze"
      >
        <Sparkles size={iconSize} />
      </button>
    </div>
  );
}
