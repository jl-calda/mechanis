"use client";

import type { WeldInput } from "@/types/weld";

interface WeldFormProps {
  input: WeldInput;
  onChange: (input: WeldInput) => void;
}

const selectClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

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

export function WeldForm({ input, onChange }: WeldFormProps) {
  function set<K extends keyof WeldInput>(key: K, value: WeldInput[K]) {
    onChange({ ...input, [key]: value });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Weld Parameters</h2>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Weld Type">
          <select
            className={selectClass}
            value={input.weldType}
            onChange={(e) =>
              set("weldType", e.target.value as WeldInput["weldType"])
            }
          >
            <option value="fillet">Fillet</option>
            <option value="CJP">CJP (Complete Joint Pen.)</option>
            <option value="PJP">PJP (Partial Joint Pen.)</option>
          </select>
        </Field>

        <Field label="Electrode">
          <select
            className={selectClass}
            value={input.electrodeType}
            onChange={(e) =>
              set("electrodeType", e.target.value as WeldInput["electrodeType"])
            }
          >
            <option value="E70XX">E70XX (70 ksi)</option>
            <option value="E80XX">E80XX (80 ksi)</option>
            <option value="E90XX">E90XX (90 ksi)</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Weld Size (leg)" unit="in">
          <input
            type="number"
            className={inputClass}
            value={input.weldSize}
            step={0.0625}
            min={0.0625}
            onChange={(e) => set("weldSize", Number(e.target.value))}
          />
        </Field>

        <Field label="Weld Length" unit="in">
          <input
            type="number"
            className={inputClass}
            value={input.weldLength}
            step={0.5}
            min={0}
            onChange={(e) => set("weldLength", Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Number of Welds">
          <select
            className={selectClass}
            value={input.numberOfWelds}
            onChange={(e) => set("numberOfWelds", Number(e.target.value))}
          >
            <option value={1}>1 (one side)</option>
            <option value={2}>2 (both sides)</option>
          </select>
        </Field>

        <Field label="Load Angle" unit="deg">
          <input
            type="number"
            className={inputClass}
            value={input.angle}
            step={5}
            min={0}
            max={90}
            onChange={(e) => set("angle", Number(e.target.value))}
          />
        </Field>
      </div>

      <h2 className="text-sm font-semibold text-foreground pt-2">
        Base Metal 1
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fu" unit="ksi">
          <input
            type="number"
            className={inputClass}
            value={input.baseMetal1Fu}
            step={1}
            onChange={(e) => set("baseMetal1Fu", Number(e.target.value))}
          />
        </Field>
        <Field label="Thickness" unit="in">
          <input
            type="number"
            className={inputClass}
            value={input.baseMetal1Thickness}
            step={0.0625}
            onChange={(e) =>
              set("baseMetal1Thickness", Number(e.target.value))
            }
          />
        </Field>
      </div>

      <h2 className="text-sm font-semibold text-foreground pt-2">
        Base Metal 2
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fu" unit="ksi">
          <input
            type="number"
            className={inputClass}
            value={input.baseMetal2Fu}
            step={1}
            onChange={(e) => set("baseMetal2Fu", Number(e.target.value))}
          />
        </Field>
        <Field label="Thickness" unit="in">
          <input
            type="number"
            className={inputClass}
            value={input.baseMetal2Thickness}
            step={0.0625}
            onChange={(e) =>
              set("baseMetal2Thickness", Number(e.target.value))
            }
          />
        </Field>
      </div>
    </div>
  );
}
