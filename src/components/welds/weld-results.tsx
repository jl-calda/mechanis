"use client";

import type { WeldResult } from "@/types/weld";

interface WeldResultsProps {
  result: WeldResult;
}

function StatusBadge({ passes }: { passes: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        passes ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {passes ? "OK" : "FAIL"}
    </span>
  );
}

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span
        className={`font-mono ${
          highlight ? "font-semibold text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function WeldResults({ result }: WeldResultsProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <div className="border-b border-border bg-surface-alt px-4 py-2.5">
          <h3 className="text-sm font-semibold text-foreground">
            Capacity Results
          </h3>
        </div>
        <div className="divide-y divide-border">
          <Row
            label="Effective Throat"
            value={`${result.effectiveThroat} in`}
          />
          <Row
            label="Weld Metal Capacity"
            value={`${result.weldMetalCapacity} kips`}
          />
          <Row
            label="Base Metal Capacity"
            value={`${result.baseMetalCapacity} kips`}
          />
          <Row
            label="Controlling Capacity"
            value={`${result.controllingCapacity} kips`}
            highlight
          />
          <Row label="Controlling Mode" value={result.controllingMode} />
          <Row
            label="Capacity per inch"
            value={`${result.capacityPerInch} kips/in`}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <div className="border-b border-border bg-surface-alt px-4 py-2.5">
          <h3 className="text-sm font-semibold text-foreground">
            Detailing Checks
          </h3>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-muted">
              Weld Size (min {result.minimumWeldSize}&quot;, max{" "}
              {result.maximumWeldSize}&quot;)
            </span>
            <StatusBadge passes={result.sizeCheck} />
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-muted">
              Min Length (4w = {(result.effectiveThroat / 0.707 * 4).toFixed(2)}&quot;)
            </span>
            <StatusBadge passes={result.lengthCheck} />
          </div>
        </div>
      </div>
    </div>
  );
}
