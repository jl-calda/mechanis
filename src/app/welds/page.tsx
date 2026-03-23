"use client";

import { useState, useMemo } from "react";
import type { WeldInput } from "@/types/weld";
import { WeldForm } from "@/components/welds/weld-form";
import { WeldDiagramSvg } from "@/components/welds/weld-diagram-svg";
import { WeldResults } from "@/components/welds/weld-results";
import { calcWeldGroup } from "@/lib/weld-calc";

const defaultInput: WeldInput = {
  weldType: "fillet",
  electrodeType: "E70XX",
  weldSize: 0.25,
  weldLength: 8,
  numberOfWelds: 2,
  angle: 0,
  baseMetal1Fu: 65,
  baseMetal1Thickness: 0.5,
  baseMetal2Fu: 65,
  baseMetal2Thickness: 0.375,
};

export default function WeldsPage() {
  const [input, setInput] = useState<WeldInput>(defaultInput);
  const result = useMemo(() => calcWeldGroup(input), [input]);

  return (
    <div className="pt-8 md:pt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Weld Layout Calculator
        </h1>
        <p className="mt-1 text-sm text-muted">
          Calculate weld capacity per AISC 360 Chapter J2 with directional
          strength increase.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr_320px]">
        {/* Input Form */}
        <div className="rounded-xl border border-border bg-surface p-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <WeldForm input={input} onChange={setInput} />
        </div>

        {/* Weld Diagram */}
        <div className="flex items-center justify-center rounded-xl border border-border bg-surface p-6">
          <WeldDiagramSvg input={input} result={result} />
        </div>

        {/* Results */}
        <div>
          <WeldResults result={result} />
        </div>
      </div>
    </div>
  );
}
