"use client";

import { useState, useMemo } from "react";
import type { ProfileType } from "@/types/profile";
import { profiles } from "@/data/profiles";
import { ProfileForm } from "@/components/profiles/profile-form";
import { ProfileSvg } from "@/components/profiles/profile-svg";
import { ProfileViewer } from "@/components/profiles/profile-viewer";
import { CadEmbed } from "@/components/cad/cad-embed";
import { ProjectActions } from "@/components/project-actions";

type Mode = "standard" | "custom";

export default function ProfilesPage() {
  const [mode, setMode] = useState<Mode>("standard");
  const [selectedType, setSelectedType] = useState<ProfileType>("W");
  const [selectedDesignation, setSelectedDesignation] = useState("W14x30");

  const profile = useMemo(
    () => profiles.find((p) => p.designation === selectedDesignation),
    [selectedDesignation]
  );

  return (
    <div className="pt-8 md:pt-4">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-foreground">
            Section Builder
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            View steel cross-sections with annotated dimensions and section properties.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProjectActions
            type="profiles"
            getData={() => ({ mode, selectedType, selectedDesignation })}
            onLoad={(data) => {
              if (data.mode) setMode(data.mode as Mode);
              if (data.selectedType) setSelectedType(data.selectedType as ProfileType);
              if (data.selectedDesignation) setSelectedDesignation(data.selectedDesignation as string);
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
        <div className="grid gap-4 lg:grid-cols-[260px_1fr_300px]">
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="mb-3 text-xs font-medium text-muted uppercase tracking-wider">
              Select Profile
            </h2>
            <ProfileForm
              selectedType={selectedType}
              selectedDesignation={selectedDesignation}
              onTypeChange={setSelectedType}
              onDesignationChange={setSelectedDesignation}
            />
          </div>
          <div className="flex items-center justify-center rounded-lg border border-border bg-surface p-6">
            {profile ? (
              <div className="w-full max-w-md">
                <div className="mb-2 text-center">
                  <span className="font-mono text-sm font-medium text-primary">
                    {profile.designation}
                  </span>
                </div>
                <ProfileSvg profile={profile} width={400} height={400} />
              </div>
            ) : (
              <p className="text-xs text-muted">Select a profile to view.</p>
            )}
          </div>
          {profile && <ProfileViewer profile={profile} />}
        </div>
      ) : (
        <div>
          <div className="mb-3 rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-muted">
            Draw a custom cross-section. Use closed shapes (rectangle, circle, polyline with C to close) then click Analyze to compute section properties.
            Toggle regions +/− to add or subtract areas.
          </div>
          <CadEmbed defaultTab="section" />
        </div>
      )}
    </div>
  );
}
