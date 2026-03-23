"use client";

import { Suspense, useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import type { ProfileType, ProfileStandard } from "@/types/profile";
import { profiles } from "@/data/profiles";
import { ProfileForm } from "@/components/profiles/profile-form";
import { ProfileSvg } from "@/components/profiles/profile-svg";
import { ProfileViewer } from "@/components/profiles/profile-viewer";
import { CadEmbed } from "@/components/cad/cad-embed";
import { ProjectActions } from "@/components/project-actions";
import { useAuth } from "@/components/auth-provider";
import { getFavorites, addFavorite, removeFavorite, type Favorite } from "@/lib/supabase/favorites";

type Mode = "standard" | "custom";

export default function ProfilesPage() {
  return (
    <Suspense>
      <ProfilesPageInner />
    </Suspense>
  );
}

function ProfilesPageInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("standard");
  const [selectedStandard, setSelectedStandard] = useState<ProfileStandard>("AISC");
  const [selectedType, setSelectedType] = useState<ProfileType>("W");
  const [selectedDesignation, setSelectedDesignation] = useState("W14x30");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favLoading, setFavLoading] = useState(false);

  // Handle ?d= query param (e.g. from dashboard favorite cards)
  useEffect(() => {
    const d = searchParams.get("d");
    if (!d) return;
    const p = profiles.find((pr) => pr.designation === d);
    if (p) {
      setSelectedDesignation(p.designation);
      setSelectedType(p.type);
      setSelectedStandard(p.standard ?? "AISC");
      setMode("standard");
    }
  }, [searchParams]);

  const profile = useMemo(
    () => profiles.find((p) => p.designation === selectedDesignation),
    [selectedDesignation]
  );

  // Load favorites on mount
  useEffect(() => {
    if (!user) return;
    getFavorites().then(setFavorites);
  }, [user]);

  const isFavorited = useMemo(
    () => favorites.some((f) => f.designation === selectedDesignation),
    [favorites, selectedDesignation]
  );

  const toggleFavorite = useCallback(async () => {
    if (!profile || favLoading) return;
    setFavLoading(true);
    try {
      const existing = favorites.find((f) => f.designation === profile.designation);
      if (existing) {
        await removeFavorite(existing.id);
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
      } else {
        const fav = await addFavorite(
          profile.designation,
          profile.type,
          profile.standard ?? "AISC"
        );
        if (fav) setFavorites((prev) => [fav, ...prev]);
      }
    } finally {
      setFavLoading(false);
    }
  }, [profile, favorites, favLoading]);

  return (
    <div className="pt-8 md:pt-4">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
            getData={() => ({ mode, selectedStandard, selectedType, selectedDesignation })}
            onLoad={(data) => {
              if (data.mode) setMode(data.mode as Mode);
              if (data.selectedStandard) setSelectedStandard(data.selectedStandard as ProfileStandard);
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
              selectedStandard={selectedStandard}
              selectedType={selectedType}
              selectedDesignation={selectedDesignation}
              onStandardChange={setSelectedStandard}
              onTypeChange={setSelectedType}
              onDesignationChange={setSelectedDesignation}
            />
          </div>
          <div className="flex items-center justify-center rounded-lg border border-border bg-surface p-6 relative">
            {profile ? (
              <div className="w-full max-w-md">
                <div className="mb-2 text-center">
                  <span className="font-mono text-sm font-medium text-primary">
                    {profile.designation}
                  </span>
                  {profile.standard === "EN" && (
                    <span className="ml-2 text-[10px] text-muted bg-surface-alt px-1.5 py-0.5 rounded">
                      EN {profile.type === "CHS" || profile.type === "SHS" || profile.type === "RHS" ? "10219" : "10162"}
                    </span>
                  )}
                </div>
                <ProfileSvg profile={profile} width={400} height={400} />
              </div>
            ) : (
              <p className="text-xs text-muted">Select a profile to view.</p>
            )}
            {/* Favorite button */}
            {user && profile && (
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                className={`absolute top-3 right-3 p-1.5 rounded-md border transition-colors ${
                  isFavorited
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                    : "border-border bg-surface-alt text-muted hover:text-foreground hover:border-[#333]"
                } ${favLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Star size={14} fill={isFavorited ? "currentColor" : "none"} />
              </button>
            )}
          </div>
          {profile && <ProfileViewer profile={profile} />}
        </div>
      ) : (
        <div>
          <div className="mb-3 rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-muted">
            Draw a custom cross-section. Use closed shapes (rectangle, circle, polyline with C to close) then click Analyze to compute section properties.
            Toggle regions +/- to add or subtract areas.
          </div>
          <CadEmbed defaultTab="section" />
        </div>
      )}
    </div>
  );
}
