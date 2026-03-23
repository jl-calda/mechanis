"use client";

import { useState, useMemo } from "react";
import type { CadEntity, ClosedRegion } from "@/types/cad";
import { computeSectionProps } from "@/lib/cad/section-props";
import { computeWeldGroupProps } from "@/lib/cad/weld-line-props";
import { computeBoltGroupProps } from "@/lib/cad/bolt-group-props";

interface Props {
  entities: CadEntity[];
  regions: ClosedRegion[];
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

export function CadResults({ entities, regions }: Props) {
  const [tab, setTab] = useState<Tab>("section");

  const sectionResult = useMemo(() => {
    if (regions.length === 0) return null;
    // Use the first region for section props
    return computeSectionProps(regions[0].boundary);
  }, [regions]);

  const weldResult = useMemo(
    () => computeWeldGroupProps(entities),
    [entities]
  );

  const boltResult = useMemo(
    () => computeBoltGroupProps(entities),
    [entities]
  );

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

      <div className="px-3 py-2 divide-y divide-border">
        {tab === "section" && (
          <>
            {sectionResult ? (
              <>
                <Row label="Area" value={`${sectionResult.totalArea} in²`} />
                <Row
                  label="Centroid"
                  value={`(${sectionResult.centroid.x}, ${sectionResult.centroid.y})`}
                />
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
              </>
            ) : (
              <p className="py-3 text-xs text-muted">
                No regions detected. Draw a closed shape and click Analyze, or use
                Region Pick to select an enclosed area.
              </p>
            )}
            {regions.length > 1 && (
              <p className="pt-2 text-[10px] text-muted">
                Showing first of {regions.length} regions.
              </p>
            )}
          </>
        )}

        {tab === "welds" && (
          <>
            {weldResult ? (
              <>
                <Row label="Total Length" value={`${weldResult.totalLength} in`} />
                <Row
                  label="Centroid"
                  value={`(${weldResult.centroid.x}, ${weldResult.centroid.y})`}
                />
                <Row label="Ix" value={`${weldResult.Ix} in³`} />
                <Row label="Iy" value={`${weldResult.Iy} in³`} />
                <Row label="Ip" value={`${weldResult.Ip} in³`} />
                <Row label="Max Distance" value={`${weldResult.maxDistance} in`} />
              </>
            ) : (
              <p className="py-3 text-xs text-muted">
                No weld lines found. Draw lines or polylines and set their
                thickness &gt; 0 to define welds.
              </p>
            )}
          </>
        )}

        {tab === "bolts" && (
          <>
            {boltResult ? (
              <>
                <Row label="Bolt Count" value={`${boltResult.numBolts}`} />
                <Row
                  label="Centroid"
                  value={`(${boltResult.centroid.x}, ${boltResult.centroid.y})`}
                />
                <Row label="Ix" value={`${boltResult.Ix} in²`} />
                <Row label="Iy" value={`${boltResult.Iy} in²`} />
                <Row label="Ip" value={`${boltResult.Ip} in²`} />
                <Row label="Max Distance" value={`${boltResult.maxDistance} in`} />
              </>
            ) : (
              <p className="py-3 text-xs text-muted">
                No bolt points found. Use the Point tool to place bolt locations.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
