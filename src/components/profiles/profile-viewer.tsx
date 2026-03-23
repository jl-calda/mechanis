"use client";

import type { ProfileShape } from "@/types/profile";

interface ProfileViewerProps {
  profile: ProfileShape;
}

const rows: { label: string; key: keyof ProfileShape; unit: string }[] = [
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

export function ProfileViewer({ profile }: ProfileViewerProps) {
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="border-b border-border bg-surface-alt px-4 py-2">
        <h3 className="text-xs font-medium text-muted uppercase tracking-wider">
          Section Properties
        </h3>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => {
          const val = profile[row.key];
          if (val === undefined || val === null) return null;
          return (
            <div
              key={row.key}
              className="flex items-center justify-between px-4 py-1.5 text-xs"
            >
              <span className="text-muted">{row.label}</span>
              <span className="font-mono text-foreground">
                {typeof val === "number" ? val.toLocaleString() : val}{" "}
                <span className="text-muted/60">{row.unit}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
