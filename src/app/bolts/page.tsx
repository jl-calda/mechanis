"use client";

import { useState, useMemo } from "react";
import type { BoltInput } from "@/types/bolt";
import { BoltForm } from "@/components/bolts/bolt-form";
import { BoltPatternSvg } from "@/components/bolts/bolt-pattern-svg";
import { BoltResults } from "@/components/bolts/bolt-results";
import { calcBoltGroup } from "@/lib/bolt-calc";
import { CadEmbed } from "@/components/cad/cad-embed";
import { ProjectActions } from "@/components/project-actions";

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

type Mode = "standard" | "custom";

export default function BoltsPage() {
  const [mode, setMode] = useState<Mode>("standard");
  const [input, setInput] = useState<BoltInput>(defaultInput);
  const result = useMemo(() => calcBoltGroup(input), [input]);

  return (
    <div className="pt-8 md:pt-4">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-foreground">
            Bolt Layout Calculator
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Calculate bolt group capacity per AISC 360 Chapter J3.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProjectActions
            type="bolts"
            getData={() => ({ mode, input })}
            onLoad={(data) => {
              if (data.mode) setMode(data.mode as Mode);
              if (data.input) setInput(data.input as BoltInput);
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
            <BoltForm input={input} onChange={setInput} />
          </div>
          <div className="flex items-center justify-center rounded-lg border border-border bg-surface p-6">
            <BoltPatternSvg input={input} result={result} />
          </div>
          <div>
            <BoltResults result={result} />
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-3 rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-muted">
            Place bolt locations using the Point tool. Draw plate outlines with Rectangle or Polyline.
            The Bolts tab in results shows group centroid, polar moment, and max distance.
          </div>
          <CadEmbed defaultTab="bolts" />
        </div>
      )}
    </div>
  );
}
