"use client";

import type { ProfileShape } from "@/types/profile";
import { getUnitSystem } from "@/types/profile";

interface ProfileViewerProps {
  profile: ProfileShape;
}

const imperialRows: { label: string; key: keyof ProfileShape; unit: string }[] = [
  { label: "Weight", key: "weight", unit: "lb/ft" },
  { label: "Area (A)", key: "area", unit: "in\u00B2" },
  { label: "Depth (d)", key: "d", unit: "in" },
  { label: "Flange Width (bf)", key: "bf", unit: "in" },
  { label: "Flange Thickness (tf)", key: "tf", unit: "in" },
  { label: "Web Thickness (tw)", key: "tw", unit: "in" },
  { label: "Ix", key: "Ix", unit: "in\u2074" },
  { label: "Iy", key: "Iy", unit: "in\u2074" },
  { label: "Sx", key: "Sx", unit: "in\u00B3" },
  { label: "Sy", key: "Sy", unit: "in\u00B3" },
  { label: "Zx", key: "Zx", unit: "in\u00B3" },
  { label: "Zy", key: "Zy", unit: "in\u00B3" },
  { label: "rx", key: "rx", unit: "in" },
  { label: "ry", key: "ry", unit: "in" },
  { label: "J", key: "J", unit: "in\u2074" },
  { label: "Cw", key: "Cw", unit: "in\u2076" },
];

const metricRows: { label: string; key: keyof ProfileShape; unit: string; scale?: number }[] = [
  { label: "Weight", key: "weight", unit: "kg/m" },
  { label: "Area (A)", key: "area", unit: "mm\u00B2" },
  { label: "Height (h)", key: "d", unit: "mm" },
  { label: "Width (b)", key: "bf", unit: "mm" },
  { label: "Thickness (t)", key: "tf", unit: "mm" },
  { label: "Ix", key: "Ix", unit: "\u00D710\u2074 mm\u2074", scale: 1e-4 },
  { label: "Iy", key: "Iy", unit: "\u00D710\u2074 mm\u2074", scale: 1e-4 },
  { label: "Sx (Wel,x)", key: "Sx", unit: "\u00D710\u00B3 mm\u00B3", scale: 1e-3 },
  { label: "Sy (Wel,y)", key: "Sy", unit: "\u00D710\u00B3 mm\u00B3", scale: 1e-3 },
  { label: "Zx (Wpl,x)", key: "Zx", unit: "\u00D710\u00B3 mm\u00B3", scale: 1e-3 },
  { label: "Zy (Wpl,y)", key: "Zy", unit: "\u00D710\u00B3 mm\u00B3", scale: 1e-3 },
  { label: "ix", key: "rx", unit: "mm" },
  { label: "iy", key: "ry", unit: "mm" },
  { label: "It", key: "J", unit: "\u00D710\u2074 mm\u2074", scale: 1e-4 },
];

function formatVal(val: number, scale?: number): string {
  if (scale) {
    const scaled = val * scale;
    return scaled < 10 ? scaled.toFixed(2) : scaled < 1000 ? scaled.toFixed(1) : scaled.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  return typeof val === "number" && val >= 1000
    ? val.toLocaleString()
    : String(val);
}

export function ProfileViewer({ profile }: ProfileViewerProps) {
  const isMetric = getUnitSystem(profile.standard) === "metric";
  const rows = isMetric ? metricRows : imperialRows;

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="border-b border-border bg-surface-alt px-4 py-2">
        <h3 className="text-xs font-medium text-muted uppercase tracking-wider">
          Section Properties
        </h3>
        {isMetric && (
          <span className="text-[10px] text-muted/60">EN {profile.type === "CHS" || profile.type === "SHS" || profile.type === "RHS" ? "10219" : "10162"}</span>
        )}
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => {
          const val = profile[row.key];
          if (val === undefined || val === null) return null;
          return (
            <div
              key={row.key + row.label}
              className="flex items-center justify-between px-4 py-1.5 text-xs"
            >
              <span className="text-muted">{row.label}</span>
              <span className="font-mono text-foreground">
                {typeof val === "number" ? formatVal(val, (row as { scale?: number }).scale) : val}{" "}
                <span className="text-muted/60">{row.unit}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
