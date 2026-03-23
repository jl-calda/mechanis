"use client";

import type { BoltResult } from "@/types/bolt";

interface BoltResultsProps {
  result: BoltResult;
}

function StatusBadge({ passes }: { passes: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        passes
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      {passes ? "OK" : "FAIL"}
    </span>
  );
}

export function BoltResults({ result }: BoltResultsProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <div className="border-b border-border bg-surface-alt px-4 py-2.5">
          <h3 className="text-sm font-semibold text-foreground">
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
        <div className="border-b border-border bg-surface-alt px-4 py-2.5">
          <h3 className="text-sm font-semibold text-foreground">
            Detailing Checks
          </h3>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-muted">
              Edge Distance (min {result.edgeDistanceCheck.minimum}&quot;,
              provided {result.edgeDistanceCheck.provided}&quot;)
            </span>
            <StatusBadge passes={result.edgeDistanceCheck.passes} />
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
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
