"use client";

import { useState, useMemo } from "react";
import type { WeldInput } from "@/types/weld";
import { WeldForm } from "@/components/welds/weld-form";
import { WeldDiagramSvg } from "@/components/welds/weld-diagram-svg";
import { WeldResults } from "@/components/welds/weld-results";
import { calcWeldGroup } from "@/lib/weld-calc";
import { CadEmbed } from "@/components/cad/cad-embed";
import { ProjectActions } from "@/components/project-actions";

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

type Mode = "standard" | "custom";

export default function WeldsPage() {
  const [mode, setMode] = useState<Mode>("standard");
  const [input, setInput] = useState<WeldInput>(defaultInput);
  const result = useMemo(() => calcWeldGroup(input), [input]);

  return (
    <div className="pt-8 md:pt-4">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-foreground">
            Weld Layout Calculator
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Calculate weld capacity per AISC 360 Chapter J2 with directional strength increase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProjectActions
            type="welds"
            getData={() => ({ mode, input })}
            onLoad={(data) => {
              if (data.mode) setMode(data.mode as Mode);
              if (data.input) setInput(data.input as WeldInput);
            }}
          />
          <div className="flex rounded-md border border-border bg-surface overflow-hidden">
            <button
              onClick={() => setMode("standard")}
              className={`px-3 py-1 text-[11px] font-medium transition-colors ${
                mode === "standard" ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`px-3 py-1 text-[11px] font-medium transition-colors ${
                mode === "custom" ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground"
              }`}
            >
              Custom
            </button>
          </div>
        </div>
      </div>

      {mode === "standard" ? (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr_300px]">
          <div className="rounded-lg border border-border bg-surface p-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
            <WeldForm input={input} onChange={setInput} />
          </div>
          <div className="flex items-center justify-center rounded-lg border border-border bg-surface p-6">
            <WeldDiagramSvg input={input} result={result} />
          </div>
          <div>
            <WeldResults result={result} />
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-3 rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-muted">
            Draw weld lines and set their thickness in the properties panel (select a line, set Thickness &gt; 0).
            The Welds tab in results shows group Ix, Iy, Ip, and total length.
          </div>
          <CadEmbed defaultTab="welds" />
        </div>
      )}
    </div>
  );
}
