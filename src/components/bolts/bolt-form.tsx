"use client";

import type { BoltInput } from "@/types/bolt";
import { boltDimensions } from "@/data/bolt-standards";

interface BoltFormProps {
  input: BoltInput;
  onChange: (input: BoltInput) => void;
}

function Field({
  label,
  unit,
  children,
}: {
  label: string;
  unit?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
        {unit && <span className="ml-1 text-xs text-muted">({unit})</span>}
      </label>
      {children}
    </div>
  );
}

const selectClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export function BoltForm({ input, onChange }: BoltFormProps) {
  function set<K extends keyof BoltInput>(key: K, value: BoltInput[K]) {
    onChange({ ...input, [key]: value });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Bolt Parameters</h2>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Bolt Grade">
          <select
            className={selectClass}
            value={input.grade}
            onChange={(e) => set("grade", e.target.value as BoltInput["grade"])}
          >
            <option value="A325">A325 (Group A)</option>
            <option value="A490">A490 (Group B)</option>
          </select>
        </Field>

        <Field label="Diameter">
          <select
            className={selectClass}
            value={input.diameter}
            onChange={(e) => set("diameter", Number(e.target.value))}
          >
            {boltDimensions.map((b) => (
              <option key={b.diameter} value={b.diameter}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Connection Type">
          <select
            className={selectClass}
            value={input.connectionType}
            onChange={(e) =>
              set("connectionType", e.target.value as BoltInput["connectionType"])
            }
          >
            <option value="bearing">Bearing</option>
            <option value="slip-critical">Slip-Critical</option>
          </select>
        </Field>

        <Field label="Thread Condition">
          <select
            className={selectClass}
            value={input.threadCondition}
            onChange={(e) =>
              set(
                "threadCondition",
                e.target.value as BoltInput["threadCondition"]
              )
            }
          >
            <option value="included">Threads Included (N)</option>
            <option value="excluded">Threads Excluded (X)</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Hole Type">
          <select
            className={selectClass}
            value={input.holeType}
            onChange={(e) =>
              set("holeType", e.target.value as BoltInput["holeType"])
            }
          >
            <option value="standard">Standard</option>
            <option value="oversized">Oversized</option>
            <option value="short-slot">Short Slot</option>
            <option value="long-slot">Long Slot</option>
          </select>
        </Field>

        <Field label="Shear Planes">
          <select
            className={selectClass}
            value={input.numShearPlanes}
            onChange={(e) => set("numShearPlanes", Number(e.target.value))}
          >
            <option value={1}>Single Shear</option>
            <option value={2}>Double Shear</option>
          </select>
        </Field>
      </div>

      <h2 className="text-sm font-semibold text-foreground pt-2">
        Bolt Layout
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Rows">
          <input
            type="number"
            className={inputClass}
            value={input.numRows}
            min={1}
            max={20}
            onChange={(e) => set("numRows", Math.max(1, Number(e.target.value)))}
          />
        </Field>
        <Field label="Columns">
          <input
            type="number"
            className={inputClass}
            value={input.numCols}
            min={1}
            max={10}
            onChange={(e) => set("numCols", Math.max(1, Number(e.target.value)))}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Pitch (s)" unit="in">
          <input
            type="number"
            className={inputClass}
            value={input.pitch}
            step={0.25}
            min={0}
            onChange={(e) => set("pitch", Number(e.target.value))}
          />
        </Field>
        <Field label="Gage (g)" unit="in">
          <input
            type="number"
            className={inputClass}
            value={input.gage}
            step={0.25}
            min={0}
            onChange={(e) => set("gage", Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Edge Dist. (vert)" unit="in">
          <input
            type="number"
            className={inputClass}
            value={input.edgeDistVert}
            step={0.125}
            min={0}
            onChange={(e) => set("edgeDistVert", Number(e.target.value))}
          />
        </Field>
        <Field label="Edge Dist. (horiz)" unit="in">
          <input
            type="number"
            className={inputClass}
            value={input.edgeDistHoriz}
            step={0.125}
            min={0}
            onChange={(e) => set("edgeDistHoriz", Number(e.target.value))}
          />
        </Field>
      </div>

      <h2 className="text-sm font-semibold text-foreground pt-2">
        Connected Material
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Plate Thickness" unit="in">
          <input
            type="number"
            className={inputClass}
            value={input.plateThickness}
            step={0.0625}
            min={0}
            onChange={(e) => set("plateThickness", Number(e.target.value))}
          />
        </Field>
        <Field label="Plate Fu" unit="ksi">
          <input
            type="number"
            className={inputClass}
            value={input.plateFu}
            step={1}
            min={0}
            onChange={(e) => set("plateFu", Number(e.target.value))}
          />
        </Field>
      </div>
    </div>
  );
}
