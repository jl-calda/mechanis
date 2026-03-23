"use client";

import { useEffect, useRef, useState } from "react";
import type { CadEntity } from "@/types/cad";
import { distance } from "@/lib/cad/geometry";

interface Props {
  entity: CadEntity;
  screenPos: { x: number; y: number };
  containerRect: { width: number; height: number };
  onChange: (id: string, changes: Partial<CadEntity>) => void;
}

function InlineNum({
  label,
  value,
  locked,
  onChange,
  step = 0.125,
}: {
  label: string;
  value: number;
  locked: boolean;
  onChange: (v: number) => void;
  step?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value.toFixed(3));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value.toFixed(3));
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (locked || !editing) {
    return (
      <div
        className={`flex items-center gap-1 ${locked ? "" : "cursor-text"}`}
        onClick={(e) => {
          if (!locked) { e.stopPropagation(); setEditing(true); }
        }}
      >
        <span className="text-muted text-[9px] w-5 text-right shrink-0">{label}</span>
        <span className={`text-[10px] font-mono ${locked ? "text-muted/60" : "text-foreground"}`}>
          {value.toFixed(3)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <span className="text-muted text-[9px] w-5 text-right shrink-0">{label}</span>
      <input
        ref={inputRef}
        type="number"
        step={step}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const n = parseFloat(draft);
            if (!isNaN(n)) onChange(n);
            setEditing(false);
          }
          if (e.key === "Escape") setEditing(false);
          e.stopPropagation();
        }}
        onBlur={() => {
          const n = parseFloat(draft);
          if (!isNaN(n)) onChange(n);
          setEditing(false);
        }}
        className="w-16 bg-surface-alt rounded border border-border px-1 py-0 text-[10px] font-mono text-foreground focus:border-primary focus:outline-none"
      />
    </div>
  );
}

export function CadEntityPopup({ entity, screenPos, containerRect, onChange }: Props) {
  const locked = !!entity.locked;

  function set(changes: Partial<CadEntity>) {
    onChange(entity.id, changes);
  }

  // Clamp position so popup stays within canvas
  const popW = 180;
  const popH = 160;
  let px = screenPos.x + 20;
  let py = screenPos.y - popH / 2;
  if (px + popW > containerRect.width - 8) px = screenPos.x - popW - 20;
  if (py < 8) py = 8;
  if (py + popH > containerRect.height - 8) py = containerRect.height - popH - 8;

  return (
    <div
      className="absolute z-30 rounded-lg border border-border bg-surface/95 backdrop-blur-md shadow-lg px-2.5 py-2 text-[10px] select-none"
      style={{ left: px, top: py, width: popW }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="uppercase tracking-wider font-medium text-muted text-[9px]">{entity.type}</span>
        {locked && <span className="text-[8px] text-warning bg-warning/10 px-1 rounded">locked</span>}
      </div>

      {entity.type === "point" && (
        <div className="space-y-0.5">
          <InlineNum label="X" value={entity.position.x} locked={locked} onChange={(x) => set({ position: { ...entity.position, x } } as never)} />
          <InlineNum label="Y" value={entity.position.y} locked={locked} onChange={(y) => set({ position: { ...entity.position, y } } as never)} />
        </div>
      )}

      {entity.type === "line" && (() => {
        const len = distance(entity.start, entity.end);
        const ang = Math.atan2(entity.end.y - entity.start.y, entity.end.x - entity.start.x) * 180 / Math.PI;
        return (
          <div className="space-y-0.5">
            <div className="text-[9px] text-muted/60 mb-0.5">Start</div>
            <InlineNum label="X" value={entity.start.x} locked={locked} onChange={(x) => set({ start: { ...entity.start, x } } as never)} />
            <InlineNum label="Y" value={entity.start.y} locked={locked} onChange={(y) => set({ start: { ...entity.start, y } } as never)} />
            <div className="text-[9px] text-muted/60 mt-1 mb-0.5">End</div>
            <InlineNum label="X" value={entity.end.x} locked={locked} onChange={(x) => set({ end: { ...entity.end, x } } as never)} />
            <InlineNum label="Y" value={entity.end.y} locked={locked} onChange={(y) => set({ end: { ...entity.end, y } } as never)} />
            <div className="h-px bg-border my-1" />
            <div className="flex gap-3">
              <span className="text-muted text-[9px]">L <span className="text-foreground font-mono">{len.toFixed(3)}</span></span>
              <span className="text-muted text-[9px]">∠ <span className="text-foreground font-mono">{ang.toFixed(1)}°</span></span>
            </div>
            <InlineNum label="t" value={entity.thickness} locked={locked} onChange={(thickness) => set({ thickness } as never)} step={0.0625} />
          </div>
        );
      })()}

      {entity.type === "rectangle" && (
        <div className="space-y-0.5">
          <div className="text-[9px] text-muted/60 mb-0.5">Origin</div>
          <InlineNum label="X" value={entity.origin.x} locked={locked} onChange={(x) => set({ origin: { ...entity.origin, x } } as never)} />
          <InlineNum label="Y" value={entity.origin.y} locked={locked} onChange={(y) => set({ origin: { ...entity.origin, y } } as never)} />
          <div className="h-px bg-border my-1" />
          <InlineNum label="W" value={entity.width} locked={locked} onChange={(width) => set({ width } as never)} />
          <InlineNum label="H" value={entity.height} locked={locked} onChange={(height) => set({ height } as never)} />
          <div className="text-muted text-[9px] mt-0.5">A <span className="text-foreground font-mono">{(entity.width * entity.height).toFixed(3)}</span></div>
        </div>
      )}

      {entity.type === "circle" && (
        <div className="space-y-0.5">
          <div className="text-[9px] text-muted/60 mb-0.5">Center</div>
          <InlineNum label="X" value={entity.center.x} locked={locked} onChange={(x) => set({ center: { ...entity.center, x } } as never)} />
          <InlineNum label="Y" value={entity.center.y} locked={locked} onChange={(y) => set({ center: { ...entity.center, y } } as never)} />
          <div className="h-px bg-border my-1" />
          <InlineNum label="R" value={entity.radius} locked={locked} onChange={(radius) => set({ radius } as never)} />
          <div className="flex gap-3 mt-0.5">
            <span className="text-muted text-[9px]">D <span className="text-foreground font-mono">{(entity.radius * 2).toFixed(3)}</span></span>
            <span className="text-muted text-[9px]">A <span className="text-foreground font-mono">{(Math.PI * entity.radius ** 2).toFixed(3)}</span></span>
          </div>
        </div>
      )}

      {entity.type === "ellipse" && (
        <div className="space-y-0.5">
          <div className="text-[9px] text-muted/60 mb-0.5">Center</div>
          <InlineNum label="X" value={entity.center.x} locked={locked} onChange={(x) => set({ center: { ...entity.center, x } } as never)} />
          <InlineNum label="Y" value={entity.center.y} locked={locked} onChange={(y) => set({ center: { ...entity.center, y } } as never)} />
          <div className="h-px bg-border my-1" />
          <InlineNum label="RX" value={entity.rx} locked={locked} onChange={(rx) => set({ rx } as never)} />
          <InlineNum label="RY" value={entity.ry} locked={locked} onChange={(ry) => set({ ry } as never)} />
        </div>
      )}

      {entity.type === "arc" && (() => {
        let sweep = entity.endAngle - entity.startAngle;
        while (sweep < 0) sweep += 2 * Math.PI;
        if (sweep === 0) sweep = 2 * Math.PI;
        const arcLen = entity.radius * sweep;
        return (
          <div className="space-y-0.5">
            <div className="text-[9px] text-muted/60 mb-0.5">Center</div>
            <InlineNum label="X" value={entity.center.x} locked={locked} onChange={(x) => set({ center: { ...entity.center, x } } as never)} />
            <InlineNum label="Y" value={entity.center.y} locked={locked} onChange={(y) => set({ center: { ...entity.center, y } } as never)} />
            <div className="h-px bg-border my-1" />
            <InlineNum label="R" value={entity.radius} locked={locked} onChange={(radius) => set({ radius } as never)} />
            <InlineNum label="S°" value={+(entity.startAngle * 180 / Math.PI).toFixed(1)} locked={locked} onChange={(deg) => set({ startAngle: deg * Math.PI / 180 } as never)} step={1} />
            <InlineNum label="E°" value={+(entity.endAngle * 180 / Math.PI).toFixed(1)} locked={locked} onChange={(deg) => set({ endAngle: deg * Math.PI / 180 } as never)} step={1} />
            <div className="text-muted text-[9px] mt-0.5">L <span className="text-foreground font-mono">{arcLen.toFixed(3)}</span></div>
          </div>
        );
      })()}

      {entity.type === "polyline" && (
        <div className="space-y-0.5">
          <div className="flex gap-3">
            <span className="text-muted text-[9px]">Vertices <span className="text-foreground font-mono">{entity.points.length}</span></span>
            <span className="text-muted text-[9px]">{entity.closed ? "Closed" : "Open"}</span>
          </div>
          <InlineNum label="t" value={entity.thickness} locked={locked} onChange={(thickness) => set({ thickness } as never)} step={0.0625} />
          {entity.closed && (() => {
            let area = 0;
            const pts = entity.points;
            for (let i = 0; i < pts.length; i++) {
              const j = (i + 1) % pts.length;
              area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
            }
            area = Math.abs(area) / 2;
            return <div className="text-muted text-[9px] mt-0.5">A <span className="text-foreground font-mono">{area.toFixed(3)}</span></div>;
          })()}
          {(() => {
            let peri = 0;
            const pts = entity.points;
            const n = entity.closed ? pts.length : pts.length - 1;
            for (let i = 0; i < n; i++) {
              const j = (i + 1) % pts.length;
              peri += distance(pts[i], pts[j]);
            }
            return <div className="text-muted text-[9px]">P <span className="text-foreground font-mono">{peri.toFixed(3)}</span></div>;
          })()}
        </div>
      )}

      {entity.type === "dimension" && (() => {
        const dt = entity.dimType ?? "linear";
        if (dt === "radius") {
          const r = distance(entity.startPt, entity.endPt);
          return (
            <div className="space-y-0.5">
              <div className="text-[9px] text-muted/60">Radius Dimension</div>
              <div className="text-foreground font-mono text-[10px]">R = {r.toFixed(3)}</div>
              <InlineNum label="off" value={entity.offset} locked={locked} onChange={(offset) => set({ offset } as never)} step={0.1} />
            </div>
          );
        }
        if (dt === "arc-length" || dt === "angle") {
          let sweep = (entity.arcEndAngle ?? 0) - (entity.arcStartAngle ?? 0);
          while (sweep < 0) sweep += 2 * Math.PI;
          if (sweep === 0) sweep = 2 * Math.PI;
          const arcLen = (entity.arcRadius ?? 0) * sweep;
          return (
            <div className="space-y-0.5">
              <div className="text-[9px] text-muted/60">Arc Dimension</div>
              <div className="text-foreground font-mono text-[10px]">∠ {(sweep * 180 / Math.PI).toFixed(1)}° · L = {arcLen.toFixed(3)}</div>
              <InlineNum label="off" value={entity.offset} locked={locked} onChange={(offset) => set({ offset } as never)} step={0.1} />
            </div>
          );
        }
        const d = distance(entity.startPt, entity.endPt);
        return (
          <div className="space-y-0.5">
            <div className="text-[9px] text-muted/60">Linear Dimension</div>
            <div className="text-foreground font-mono text-[10px]">D = {d.toFixed(3)}</div>
            <InlineNum label="off" value={entity.offset} locked={locked} onChange={(offset) => set({ offset } as never)} step={0.1} />
          </div>
        );
      })()}
    </div>
  );
}
