"use client";

import type { BoltResult } from "@/types/bolt";

interface BoltResultsProps {
  result: BoltResult;
}

function StatusBadge({ passes }: { passes: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
        passes
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-red-500/10 text-red-400"
      }`}
    >
      {passes ? "OK" : "FAIL"}
    </span>
  );
}

export function BoltResults({ result }: BoltResultsProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <div className="border-b border-border bg-surface-alt px-4 py-2">
          <h3 className="text-xs font-medium text-muted uppercase tracking-wider">
            Capacity Results
          </h3>
        </div>
        <div className="divide-y divide-border">
          <Row label="Bolts" value={result.numBolts.toString()} />
          <Row
            label="Shear / bolt"
            value={`${result.shearCapacityPerBolt} kips`}
          />
          <Row
            label="Bearing / bolt"
            value={`${result.bearingCapacityPerBolt} kips`}
          />
          <Row
            label="Tearout / bolt"
            value={`${result.tearoutCapacityPerBolt} kips`}
          />
          <Row
            label="Controlling / bolt"
            value={`${result.controllingCapacity} kips`}
            highlight
          />
          <Row label="Controlling Mode" value={result.controllingMode} />
          <Row
            label="Group Capacity"
            value={`${result.groupCapacity} kips`}
            highlight
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <div className="border-b border-border bg-surface-alt px-4 py-2">
          <h3 className="text-xs font-medium text-muted uppercase tracking-wider">
            Detailing Checks
          </h3>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-2 text-xs">
            <span className="text-muted">
              Edge Distance (min {result.edgeDistanceCheck.minimum}&quot;,
              provided {result.edgeDistanceCheck.provided}&quot;)
            </span>
            <StatusBadge passes={result.edgeDistanceCheck.passes} />
          </div>
          <div className="flex items-center justify-between px-4 py-2 text-xs">
            <span className="text-muted">
              Spacing (min {result.spacingCheck.minimum.toFixed(2)}&quot;,
              provided {result.spacingCheck.provided}&quot;)
            </span>
            <StatusBadge passes={result.spacingCheck.passes} />
          </div>
        </div>
      </div>
    </div>
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
    <div className="flex items-center justify-between px-4 py-1.5 text-xs">
      <span className="text-muted">{label}</span>
      <span
        className={`font-mono ${
          highlight ? "font-medium text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
