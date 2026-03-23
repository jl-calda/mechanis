"use client";

import type { CadEntity, Point2D } from "@/types/cad";
import { distance } from "@/lib/cad/geometry";

interface Props {
  entity: CadEntity;
  selected: boolean;
  trimHover?: boolean;
}

const SEL_COLOR = "var(--primary)";
const TRIM_HOVER_COLOR = "#f97316";
const LOCK_COLOR = "var(--danger)";
const ENTITY_COLOR = "#e2e2e2";
const ENTITY_COLOR_DARK = "var(--svg-stroke)";
const STROKE_W = 0.12;
const SEL_STROKE_W = 0.14;
const TRIM_HOVER_STROKE_W = 0.16;
const HANDLE_R = 0.16;
const NODE_R = 0.1;

function Handle({ x, y, index, entityId, isLocked }: { x: number; y: number; index: number; entityId: string; isLocked: boolean }) {
  return isLocked ? (
    <g>
      <rect
        x={x - HANDLE_R}
        y={y - HANDLE_R}
        width={HANDLE_R * 2}
        height={HANDLE_R * 2}
        fill={LOCK_COLOR}
        stroke="white"
        strokeWidth={0.03}
        data-handle-index={index}
        data-handle-entity={entityId}
        style={{ cursor: "not-allowed" }}
      />
      <line x1={x - HANDLE_R * 0.5} y1={y - HANDLE_R * 0.5} x2={x + HANDLE_R * 0.5} y2={y + HANDLE_R * 0.5} stroke="white" strokeWidth={0.04} />
      <line x1={x + HANDLE_R * 0.5} y1={y - HANDLE_R * 0.5} x2={x - HANDLE_R * 0.5} y2={y + HANDLE_R * 0.5} stroke="white" strokeWidth={0.04} />
    </g>
  ) : (
    <g>
      <rect
        x={x - HANDLE_R}
        y={y - HANDLE_R}
        width={HANDLE_R * 2}
        height={HANDLE_R * 2}
        fill={SEL_COLOR}
        stroke="white"
        strokeWidth={0.03}
        data-handle-index={index}
        data-handle-entity={entityId}
        style={{ cursor: "crosshair" }}
      />
    </g>
  );
}

/** Small dot shown at nodes even when not selected */
function NodeDot({ x, y }: { x: number; y: number }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={NODE_R}
      fill={ENTITY_COLOR_DARK}
      stroke="none"
      opacity={0.7}
    />
  );
}

export function CadEntityRenderer({ entity, selected, trimHover }: Props) {
  const stroke = trimHover ? TRIM_HOVER_COLOR : selected ? SEL_COLOR : ENTITY_COLOR_DARK;
  const sw = trimHover ? TRIM_HOVER_STROKE_W : selected ? SEL_STROKE_W : STROKE_W;
  const lh = entity.lockedHandles ?? [];
  const isHL = (i: number) => lh.includes(i);

  switch (entity.type) {
    case "point":
      return (
        <g>
          <circle
            cx={entity.position.x}
            cy={entity.position.y}
            r={0.2}
            fill={selected ? SEL_COLOR : ENTITY_COLOR_DARK}
            stroke="white"
            strokeWidth={0.03}
          />
          {/* Crosshair */}
          <line x1={entity.position.x - 0.3} y1={entity.position.y} x2={entity.position.x + 0.3} y2={entity.position.y} stroke={selected ? SEL_COLOR : ENTITY_COLOR_DARK} strokeWidth={0.04} opacity={0.5} />
          <line x1={entity.position.x} y1={entity.position.y - 0.3} x2={entity.position.x} y2={entity.position.y + 0.3} stroke={selected ? SEL_COLOR : ENTITY_COLOR_DARK} strokeWidth={0.04} opacity={0.5} />
          {selected && (
            <circle
              cx={entity.position.x}
              cy={entity.position.y}
              r={0.4}
              fill="none"
              stroke={SEL_COLOR}
              strokeWidth={0.05}
            />
          )}
        </g>
      );

    case "line":
      return (
        <g>
          <line
            x1={entity.start.x}
            y1={entity.start.y}
            x2={entity.end.x}
            y2={entity.end.y}
            stroke={stroke}
            strokeWidth={entity.thickness > 0 ? Math.max(entity.thickness, sw) : sw}
            strokeLinecap="round"
            opacity={entity.thickness > 0 ? 0.8 : 1}
          />
          {/* Always show endpoint nodes */}
          <NodeDot x={entity.start.x} y={entity.start.y} />
          <NodeDot x={entity.end.x} y={entity.end.y} />
          {selected && (
            <>
              <Handle x={entity.start.x} y={entity.start.y} index={0} entityId={entity.id} isLocked={isHL(0)} />
              <Handle x={entity.end.x} y={entity.end.y} index={1} entityId={entity.id} isLocked={isHL(1)} />
            </>
          )}
        </g>
      );

    case "rectangle":
      return (
        <g>
          <rect
            x={entity.origin.x}
            y={entity.origin.y}
            width={entity.width}
            height={entity.height}
            fill="var(--svg-fill)"
            fillOpacity={0.15}
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          {/* Corner nodes */}
          <NodeDot x={entity.origin.x} y={entity.origin.y} />
          <NodeDot x={entity.origin.x + entity.width} y={entity.origin.y} />
          <NodeDot x={entity.origin.x + entity.width} y={entity.origin.y + entity.height} />
          <NodeDot x={entity.origin.x} y={entity.origin.y + entity.height} />
          {selected && (
            <>
              <Handle x={entity.origin.x} y={entity.origin.y} index={0} entityId={entity.id} isLocked={isHL(0)} />
              <Handle x={entity.origin.x + entity.width} y={entity.origin.y} index={1} entityId={entity.id} isLocked={isHL(1)} />
              <Handle x={entity.origin.x + entity.width} y={entity.origin.y + entity.height} index={2} entityId={entity.id} isLocked={isHL(2)} />
              <Handle x={entity.origin.x} y={entity.origin.y + entity.height} index={3} entityId={entity.id} isLocked={isHL(3)} />
            </>
          )}
        </g>
      );

    case "polyline": {
      const d = entity.points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");
      return (
        <g>
          <path
            d={entity.closed ? d + " Z" : d}
            fill={entity.closed ? "var(--svg-fill)" : "none"}
            fillOpacity={entity.closed ? 0.15 : 0}
            stroke={stroke}
            strokeWidth={entity.thickness > 0 ? Math.max(entity.thickness, sw) : sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={entity.thickness > 0 ? 0.8 : 1}
          />
          {/* Vertex nodes */}
          {entity.points.map((p, i) => <NodeDot key={`n${i}`} x={p.x} y={p.y} />)}
          {selected &&
            entity.points.map((p, i) => <Handle key={i} x={p.x} y={p.y} index={i} entityId={entity.id} isLocked={isHL(i)} />)}
        </g>
      );
    }

    case "circle":
      return (
        <g>
          <circle
            cx={entity.center.x}
            cy={entity.center.y}
            r={entity.radius}
            fill="var(--svg-fill)"
            fillOpacity={0.15}
            stroke={stroke}
            strokeWidth={sw}
          />
          {/* Center + cardinal nodes */}
          <NodeDot x={entity.center.x} y={entity.center.y} />
          <NodeDot x={entity.center.x + entity.radius} y={entity.center.y} />
          <NodeDot x={entity.center.x - entity.radius} y={entity.center.y} />
          <NodeDot x={entity.center.x} y={entity.center.y + entity.radius} />
          <NodeDot x={entity.center.x} y={entity.center.y - entity.radius} />
          {selected && (
            <>
              <Handle x={entity.center.x} y={entity.center.y} index={0} entityId={entity.id} isLocked={isHL(0)} />
              <Handle x={entity.center.x + entity.radius} y={entity.center.y} index={1} entityId={entity.id} isLocked={isHL(1)} />
              <Handle x={entity.center.x} y={entity.center.y - entity.radius} index={2} entityId={entity.id} isLocked={isHL(2)} />
            </>
          )}
        </g>
      );

    case "ellipse":
      return (
        <g>
          <ellipse
            cx={entity.center.x}
            cy={entity.center.y}
            rx={entity.rx}
            ry={entity.ry}
            fill="var(--svg-fill)"
            fillOpacity={0.15}
            stroke={stroke}
            strokeWidth={sw}
          />
          {/* Center + axis nodes */}
          <NodeDot x={entity.center.x} y={entity.center.y} />
          <NodeDot x={entity.center.x + entity.rx} y={entity.center.y} />
          <NodeDot x={entity.center.x - entity.rx} y={entity.center.y} />
          <NodeDot x={entity.center.x} y={entity.center.y + entity.ry} />
          <NodeDot x={entity.center.x} y={entity.center.y - entity.ry} />
          {selected && (
            <>
              <Handle x={entity.center.x} y={entity.center.y} index={0} entityId={entity.id} isLocked={isHL(0)} />
              <Handle x={entity.center.x + entity.rx} y={entity.center.y} index={1} entityId={entity.id} isLocked={isHL(1)} />
              <Handle x={entity.center.x} y={entity.center.y - entity.ry} index={2} entityId={entity.id} isLocked={isHL(2)} />
            </>
          )}
        </g>
      );

    case "arc": {
      const { center, radius, startAngle, endAngle } = entity;
      // Always sweep counterclockwise (positive direction) from startAngle to endAngle
      let sweep = endAngle - startAngle;
      while (sweep < 0) sweep += 2 * Math.PI;
      while (sweep > 2 * Math.PI) sweep -= 2 * Math.PI;
      if (sweep === 0) sweep = 2 * Math.PI;
      const largeArc = sweep > Math.PI ? 1 : 0;
      const sweepFlag = 1; // always CCW
      const sx = center.x + radius * Math.cos(startAngle);
      const sy = center.y + radius * Math.sin(startAngle);
      const ex = center.x + radius * Math.cos(endAngle);
      const ey = center.y + radius * Math.sin(endAngle);
      return (
        <g>
          <path
            d={`M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} ${sweepFlag} ${ex} ${ey}`}
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <NodeDot x={sx} y={sy} />
          <NodeDot x={ex} y={ey} />
          {selected && (
            <>
              <Handle x={center.x} y={center.y} index={0} entityId={entity.id} isLocked={isHL(0)} />
              <Handle x={sx} y={sy} index={1} entityId={entity.id} isLocked={isHL(1)} />
              <Handle x={ex} y={ey} index={2} entityId={entity.id} isLocked={isHL(2)} />
            </>
          )}
        </g>
      );
    }

    case "dimension": {
      const { startPt, endPt, offset, labelOverride } = entity;
      const dx = endPt.x - startPt.x;
      const dy = endPt.y - startPt.y;
      const len = distance(startPt, endPt);
      if (len < 0.001) return null;

      const px = -dy / len;
      const py = dx / len;
      const off = offset;

      const ds = { x: startPt.x + px * off, y: startPt.y + py * off };
      const de = { x: endPt.x + px * off, y: endPt.y + py * off };
      const mx = (ds.x + de.x) / 2;
      const my = (ds.y + de.y) / 2;

      const label = labelOverride ?? len.toFixed(2);
      const arrowLen = Math.min(0.2, len * 0.15);
      const arrowW = arrowLen * 0.4;
      const ux = dx / len;
      const uy = dy / len;
      const gap = off > 0 ? 0.1 : -0.1;

      const dimColor = selected ? SEL_COLOR : "var(--svg-dim)";

      return (
        <g>
          <line x1={startPt.x + px * gap} y1={startPt.y + py * gap} x2={ds.x + px * 0.15} y2={ds.y + py * 0.15} stroke={dimColor} strokeWidth={0.025} />
          <line x1={endPt.x + px * gap} y1={endPt.y + py * gap} x2={de.x + px * 0.15} y2={de.y + py * 0.15} stroke={dimColor} strokeWidth={0.025} />
          <line x1={ds.x} y1={ds.y} x2={de.x} y2={de.y} stroke={dimColor} strokeWidth={0.03} />
          <polygon points={`${ds.x},${ds.y} ${ds.x + ux * arrowLen + px * arrowW},${ds.y + uy * arrowLen + py * arrowW} ${ds.x + ux * arrowLen - px * arrowW},${ds.y + uy * arrowLen - py * arrowW}`} fill={dimColor} />
          <polygon points={`${de.x},${de.y} ${de.x - ux * arrowLen + px * arrowW},${de.y - uy * arrowLen + py * arrowW} ${de.x - ux * arrowLen - px * arrowW},${de.y - uy * arrowLen - py * arrowW}`} fill={dimColor} />
          <rect x={mx - label.length * 0.11} y={my - 0.22} width={label.length * 0.22} height={0.4} fill="var(--surface)" rx={0.05} />
          <text x={mx} y={my + 0.08} fill={dimColor} fontSize={0.32} textAnchor="middle" fontFamily="var(--font-mono)" data-dimension-id={entity.id}>{label}</text>
          {/* Node dots at measurement points */}
          <NodeDot x={startPt.x} y={startPt.y} />
          <NodeDot x={endPt.x} y={endPt.y} />
          {selected && (
            <>
              <Handle x={startPt.x} y={startPt.y} index={0} entityId={entity.id} isLocked={isHL(0)} />
              <Handle x={endPt.x} y={endPt.y} index={1} entityId={entity.id} isLocked={isHL(1)} />
            </>
          )}
        </g>
      );
    }
  }
}
