"use client";

import { useState, useMemo } from "react";
import type { BoltInput } from "@/types/bolt";
import { BoltForm } from "@/components/bolts/bolt-form";
import { BoltPatternSvg } from "@/components/bolts/bolt-pattern-svg";
import { BoltResults } from "@/components/bolts/bolt-results";
import { calcBoltGroup } from "@/lib/bolt-calc";

const defaultInput: BoltInput = {
  grade: "A325",
  diameter: 0.75,
  connectionType: "bearing",
  holeType: "standard",
  threadCondition: "included",
  numRows: 3,
  numCols: 2,
  gage: 3,
  pitch: 3,
  edgeDistVert: 1.5,
  edgeDistHoriz: 1.5,
  plateThickness: 0.5,
  plateFu: 65,
  numShearPlanes: 1,
};

export default function BoltsPage() {
  const [input, setInput] = useState<BoltInput>(defaultInput);
  const result = useMemo(() => calcBoltGroup(input), [input]);

  return (
    <div className="pt-8 md:pt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bolt Layout Calculator
        </h1>
        <p className="mt-1 text-sm text-muted">
          Calculate bolt group capacity per AISC 360 Chapter J3.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr_320px]">
        {/* Input Form */}
        <div className="rounded-xl border border-border bg-surface p-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <BoltForm input={input} onChange={setInput} />
        </div>

        {/* Bolt Pattern SVG */}
        <div className="flex items-center justify-center rounded-xl border border-border bg-surface p-6">
          <BoltPatternSvg input={input} result={result} />
        </div>

        {/* Results */}
        <div>
          <BoltResults result={result} />
        </div>
      </div>
    </div>
  );
}
