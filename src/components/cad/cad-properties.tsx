"use client";

import type { CadEntity } from "@/types/cad";

interface Props {
  entity: CadEntity;
  onChange: (id: string, changes: Partial<CadEntity>) => void;
}

const inputClass =
  "w-full rounded-md border border-border bg-surface-alt px-2 py-1 text-xs font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

function NumField({
  label,
  value,
  onChange,
  step = 0.125,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-muted mb-0.5">
        {label}
      </label>
      <input
        type="number"
        className={inputClass}
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function CadProperties({ entity, onChange }: Props) {
  function set(changes: Partial<CadEntity>) {
    onChange(entity.id, changes);
  }

  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-medium text-muted uppercase tracking-wider">
        Properties — {entity.type}
      </h3>

      {entity.type === "point" && (
        <div className="grid grid-cols-2 gap-1.5">
          <NumField
            label="X"
            value={entity.position.x}
            onChange={(x) => set({ position: { ...entity.position, x } } as never)}
          />
          <NumField
            label="Y"
            value={entity.position.y}
            onChange={(y) => set({ position: { ...entity.position, y } } as never)}
          />
        </div>
      )}

      {entity.type === "line" && (
        <>
          <div className="grid grid-cols-2 gap-1.5">
            <NumField
              label="X1"
              value={entity.start.x}
              onChange={(x) => set({ start: { ...entity.start, x } } as never)}
            />
            <NumField
              label="Y1"
              value={entity.start.y}
              onChange={(y) => set({ start: { ...entity.start, y } } as never)}
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <NumField
              label="X2"
              value={entity.end.x}
              onChange={(x) => set({ end: { ...entity.end, x } } as never)}
            />
            <NumField
              label="Y2"
              value={entity.end.y}
              onChange={(y) => set({ end: { ...entity.end, y } } as never)}
            />
          </div>
          <NumField
            label="Thickness (in)"
            value={entity.thickness}
            onChange={(thickness) => set({ thickness } as never)}
            step={0.0625}
          />
        </>
      )}

      {entity.type === "rectangle" && (
        <>
          <div className="grid grid-cols-2 gap-1.5">
            <NumField
              label="Origin X"
              value={entity.origin.x}
              onChange={(x) => set({ origin: { ...entity.origin, x } } as never)}
            />
            <NumField
              label="Origin Y"
              value={entity.origin.y}
              onChange={(y) => set({ origin: { ...entity.origin, y } } as never)}
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <NumField
              label="Width"
              value={entity.width}
              onChange={(width) => set({ width } as never)}
            />
            <NumField
              label="Height"
              value={entity.height}
              onChange={(height) => set({ height } as never)}
            />
          </div>
        </>
      )}

      {entity.type === "polyline" && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-muted">Closed</label>
            <input
              type="checkbox"
              checked={entity.closed}
              onChange={(e) => set({ closed: e.target.checked } as never)}
              className="accent-primary"
            />
          </div>
          <NumField
            label="Thickness (in)"
            value={entity.thickness}
            onChange={(thickness) => set({ thickness } as never)}
            step={0.0625}
          />
          <div className="text-[10px] text-muted">
            {entity.points.length} vertices
          </div>
        </>
      )}

      {entity.type === "circle" && (
        <>
          <div className="grid grid-cols-2 gap-1.5">
            <NumField
              label="Center X"
              value={entity.center.x}
              onChange={(x) => set({ center: { ...entity.center, x } } as never)}
            />
            <NumField
              label="Center Y"
              value={entity.center.y}
              onChange={(y) => set({ center: { ...entity.center, y } } as never)}
            />
          </div>
          <NumField
            label="Radius"
            value={entity.radius}
            onChange={(radius) => set({ radius } as never)}
          />
        </>
      )}

      {entity.type === "ellipse" && (
        <>
          <div className="grid grid-cols-2 gap-1.5">
            <NumField
              label="Center X"
              value={entity.center.x}
              onChange={(x) => set({ center: { ...entity.center, x } } as never)}
            />
            <NumField
              label="Center Y"
              value={entity.center.y}
              onChange={(y) => set({ center: { ...entity.center, y } } as never)}
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <NumField
              label="RX"
              value={entity.rx}
              onChange={(rx) => set({ rx } as never)}
            />
            <NumField
              label="RY"
              value={entity.ry}
              onChange={(ry) => set({ ry } as never)}
            />
          </div>
        </>
      )}

      {entity.type === "dimension" && (
        <>
          <div className="grid grid-cols-2 gap-1.5">
            <NumField
              label="Start X"
              value={entity.startPt.x}
              onChange={(x) => set({ startPt: { ...entity.startPt, x } } as never)}
            />
            <NumField
              label="Start Y"
              value={entity.startPt.y}
              onChange={(y) => set({ startPt: { ...entity.startPt, y } } as never)}
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <NumField
              label="End X"
              value={entity.endPt.x}
              onChange={(x) => set({ endPt: { ...entity.endPt, x } } as never)}
            />
            <NumField
              label="End Y"
              value={entity.endPt.y}
              onChange={(y) => set({ endPt: { ...entity.endPt, y } } as never)}
            />
          </div>
          <NumField
            label="Offset"
            value={entity.offset}
            onChange={(offset) => set({ offset } as never)}
            step={0.1}
          />
        </>
      )}

      {entity.type === "arc" && (
        <>
          <div className="grid grid-cols-2 gap-1.5">
            <NumField
              label="Center X"
              value={entity.center.x}
              onChange={(x) => set({ center: { ...entity.center, x } } as never)}
            />
            <NumField
              label="Center Y"
              value={entity.center.y}
              onChange={(y) => set({ center: { ...entity.center, y } } as never)}
            />
          </div>
          <NumField
            label="Radius"
            value={entity.radius}
            onChange={(radius) => set({ radius } as never)}
          />
          <div className="grid grid-cols-2 gap-1.5">
            <NumField
              label="Start °"
              value={+(entity.startAngle * 180 / Math.PI).toFixed(1)}
              onChange={(deg) => set({ startAngle: deg * Math.PI / 180 } as never)}
              step={1}
            />
            <NumField
              label="End °"
              value={+(entity.endAngle * 180 / Math.PI).toFixed(1)}
              onChange={(deg) => set({ endAngle: deg * Math.PI / 180 } as never)}
              step={1}
            />
          </div>
        </>
      )}
    </div>
  );
}
