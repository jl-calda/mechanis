"use client";

import { useState, useMemo } from "react";
import type { CadEntity, ClosedRegion } from "@/types/cad";
import { computeSectionProps, computeCompositeSectionProps } from "@/lib/cad/section-props";
import { computeWeldGroupProps } from "@/lib/cad/weld-line-props";
import { computeBoltGroupProps } from "@/lib/cad/bolt-group-props";

interface Props {
  entities: CadEntity[];
  regions: ClosedRegion[];
  onToggleRegionSign: (id: string) => void;
  onRemoveRegion: (id: string) => void;
}

type Tab = "section" | "welds" | "bolts";

const tabClass = (active: boolean) =>
  `px-2.5 py-1 text-[11px] font-medium transition-colors rounded-md ${
    active ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground"
  }`;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="text-muted">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}

export function CadResults({ entities, regions, onToggleRegionSign, onRemoveRegion }: Props) {
  const [tab, setTab] = useState<Tab>("section");

  const sectionResult = useMemo(() => {
    if (regions.length === 0) return null;
    if (regions.length === 1) return computeSectionProps(regions[0].boundary);
    return computeCompositeSectionProps(regions);
  }, [regions]);

  const weldResult = useMemo(() => computeWeldGroupProps(entities), [entities]);
  const boltResult = useMemo(() => computeBoltGroupProps(entities), [entities]);

  const addCount = regions.filter((r) => r.sign === "add").length;
  const subCount = regions.filter((r) => r.sign === "subtract").length;

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="flex gap-1 border-b border-border bg-surface-alt px-2 py-1.5">
        <button className={tabClass(tab === "section")} onClick={() => setTab("section")}>
          Section
        </button>
        <button className={tabClass(tab === "welds")} onClick={() => setTab("welds")}>
          Welds
        </button>
        <button className={tabClass(tab === "bolts")} onClick={() => setTab("bolts")}>
          Bolts
        </button>
      </div>

      <div className="px-3 py-2">
        {tab === "section" && (
          <>
            {/* Region list with +/- toggles */}
            {regions.length > 0 && (
              <div className="mb-2">
                <div className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1">
                  Regions ({addCount} add{subCount > 0 ? `, ${subCount} subtract` : ""})
                </div>
                <div className="space-y-0.5 max-h-32 overflow-y-auto">
                  {regions.map((r, i) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-1.5 text-[11px] py-0.5"
                    >
                      <button
                        onClick={() => onToggleRegionSign(r.id)}
                        className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold transition-colors ${
                          r.sign === "add"
                            ? "bg-primary/20 text-primary"
                            : "bg-red-500/20 text-red-400"
                        }`}
                        title={r.sign === "add" ? "Click to subtract" : "Click to add"}
                      >
                        {r.sign === "add" ? "+" : "−"}
                      </button>
                      <span className="text-foreground font-mono flex-1">
                        {r.area.toFixed(2)} in²
                      </span>
                      <button
                        onClick={() => onRemoveRegion(r.id)}
                        className="text-muted/40 hover:text-danger text-[10px]"
                        title="Remove region"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-1 h-px bg-border" />
              </div>
            )}

            {/* Composite section properties */}
            {sectionResult ? (
              <div className="divide-y divide-border">
                <Row label="Area" value={`${sectionResult.totalArea} in²`} />
                <Row label="Centroid" value={`(${sectionResult.centroid.x}, ${sectionResult.centroid.y})`} />
                <Row label="Ix" value={`${sectionResult.Ix} in⁴`} />
                <Row label="Iy" value={`${sectionResult.Iy} in⁴`} />
                <Row label="Sx (top)" value={`${sectionResult.Sx_top} in³`} />
                <Row label="Sx (bot)" value={`${sectionResult.Sx_bot} in³`} />
                <Row label="Sy (left)" value={`${sectionResult.Sy_left} in³`} />
                <Row label="Sy (right)" value={`${sectionResult.Sy_right} in³`} />
                <Row label="Zx" value={`${sectionResult.Zx} in³`} />
                <Row label="Zy" value={`${sectionResult.Zy} in³`} />
                <Row label="rx" value={`${sectionResult.rx} in`} />
                <Row label="ry" value={`${sectionResult.ry} in`} />
              </div>
            ) : (
              <p className="py-3 text-xs text-muted">
                No regions detected. Draw shapes and click Analyze, or use
                Region Pick to select enclosed areas. Use +/− to add or subtract
                regions for custom sections.
              </p>
            )}
          </>
        )}

        {tab === "welds" && (
          <div className="divide-y divide-border">
            {weldResult ? (
              <>
                <Row label="Total Length" value={`${weldResult.totalLength} in`} />
                <Row label="Centroid" value={`(${weldResult.centroid.x}, ${weldResult.centroid.y})`} />
                <Row label="Ix" value={`${weldResult.Ix} in³`} />
                <Row label="Iy" value={`${weldResult.Iy} in³`} />
                <Row label="Ip" value={`${weldResult.Ip} in³`} />
                <Row label="Max Distance" value={`${weldResult.maxDistance} in`} />
              </>
            ) : (
              <p className="py-3 text-xs text-muted">
                No weld lines. Set line thickness &gt; 0 to define welds.
              </p>
            )}
          </div>
        )}

        {tab === "bolts" && (
          <div className="divide-y divide-border">
            {boltResult ? (
              <>
                <Row label="Bolt Count" value={`${boltResult.numBolts}`} />
                <Row label="Centroid" value={`(${boltResult.centroid.x}, ${boltResult.centroid.y})`} />
                <Row label="Ix" value={`${boltResult.Ix} in²`} />
                <Row label="Iy" value={`${boltResult.Iy} in²`} />
                <Row label="Ip" value={`${boltResult.Ip} in²`} />
                <Row label="Max Distance" value={`${boltResult.maxDistance} in`} />
              </>
            ) : (
              <p className="py-3 text-xs text-muted">
                No bolt points. Use Point tool to place bolts.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
