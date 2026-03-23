"use client";

import { useState, useMemo } from "react";
import type { ProfileType } from "@/types/profile";
import { profiles } from "@/data/profiles";
import { ProfileForm } from "@/components/profiles/profile-form";
import { ProfileSvg } from "@/components/profiles/profile-svg";
import { ProfileViewer } from "@/components/profiles/profile-viewer";

export default function ProfilesPage() {
  const [selectedType, setSelectedType] = useState<ProfileType>("W");
  const [selectedDesignation, setSelectedDesignation] = useState("W14x30");

  const profile = useMemo(
    () => profiles.find((p) => p.designation === selectedDesignation),
    [selectedDesignation]
  );

  return (
    <div className="pt-8 md:pt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Profile Drawer
        </h1>
        <p className="mt-1 text-sm text-muted">
          View steel cross-sections with annotated dimensions and section
          properties.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
        {/* Selector */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Select Profile
          </h2>
          <ProfileForm
            selectedType={selectedType}
            selectedDesignation={selectedDesignation}
            onTypeChange={setSelectedType}
            onDesignationChange={setSelectedDesignation}
          />
        </div>

        {/* SVG Drawing */}
        <div className="flex items-center justify-center rounded-xl border border-border bg-surface p-6">
          {profile ? (
            <div className="w-full max-w-md">
              <div className="mb-2 text-center">
                <span className="font-mono text-lg font-semibold text-primary">
                  {profile.designation}
                </span>
              </div>
              <ProfileSvg profile={profile} width={400} height={400} />
            </div>
          ) : (
            <p className="text-muted">Select a profile to view.</p>
          )}
        </div>

        {/* Properties Table */}
        {profile && <ProfileViewer profile={profile} />}
      </div>
    </div>
  );
}
