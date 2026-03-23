"use client";

import type { ProfileShape, ProfileType, ProfileStandard } from "@/types/profile";
import { getProfilesByStandardAndType } from "@/data/profiles";
import { useMemo } from "react";

interface ProfileFormProps {
  selectedStandard: ProfileStandard;
  selectedType: ProfileType;
  selectedDesignation: string;
  onStandardChange: (standard: ProfileStandard) => void;
  onTypeChange: (type: ProfileType) => void;
  onDesignationChange: (designation: string) => void;
}

const aiscTypes: { value: ProfileType; label: string }[] = [
  { value: "W", label: "W-Shape (Wide Flange)" },
  { value: "C", label: "C-Shape (Channel)" },
  { value: "L", label: "L-Shape (Angle)" },
  { value: "HSS", label: "HSS (Hollow Structural)" },
];

const enTypes: { value: ProfileType; label: string }[] = [
  { value: "SHS", label: "SHS (Square Hollow)" },
  { value: "RHS", label: "RHS (Rectangular Hollow)" },
  { value: "CHS", label: "CHS (Circular Hollow)" },
  { value: "CF-C", label: "CF-C (Cold-formed Channel)" },
  { value: "CF-Z", label: "CF-Z (Cold-formed Z)" },
];

function getTypesForStandard(standard: ProfileStandard) {
  return standard === "EN" ? enTypes : aiscTypes;
}

export function ProfileForm({
  selectedStandard,
  selectedType,
  selectedDesignation,
  onStandardChange,
  onTypeChange,
  onDesignationChange,
}: ProfileFormProps) {
  const profileTypes = useMemo(() => getTypesForStandard(selectedStandard), [selectedStandard]);
  const filteredProfiles = useMemo(
    () => getProfilesByStandardAndType(selectedStandard, selectedType),
    [selectedStandard, selectedType]
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          Standard
        </label>
        <div className="flex rounded-md border border-border bg-surface-alt overflow-hidden">
          <button
            onClick={() => {
              onStandardChange("AISC");
              const first = getProfilesByStandardAndType("AISC", "W")[0];
              onTypeChange("W");
              if (first) onDesignationChange(first.designation);
            }}
            className={`flex-1 px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              selectedStandard === "AISC" ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground"
            }`}
          >
            AISC
          </button>
          <button
            onClick={() => {
              onStandardChange("EN");
              const first = getProfilesByStandardAndType("EN", "SHS")[0];
              onTypeChange("SHS");
              if (first) onDesignationChange(first.designation);
            }}
            className={`flex-1 px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              selectedStandard === "EN" ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground"
            }`}
          >
            EN (Cold-formed)
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          Profile Type
        </label>
        <select
          value={selectedType}
          onChange={(e) => {
            const newType = e.target.value as ProfileType;
            onTypeChange(newType);
            const first = getProfilesByStandardAndType(selectedStandard, newType)[0];
            if (first) onDesignationChange(first.designation);
          }}
          className="w-full rounded-md border border-border bg-surface-alt px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {profileTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          Designation
        </label>
        <select
          value={selectedDesignation}
          onChange={(e) => onDesignationChange(e.target.value)}
          className="w-full rounded-md border border-border bg-surface-alt px-2.5 py-1.5 text-xs font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {filteredProfiles.map((p) => (
            <option key={p.designation} value={p.designation}>
              {p.designation}
            </option>
          ))}
        </select>
      </div>

      {selectedStandard === "EN" && (
        <div className="text-[10px] text-muted/70 leading-relaxed pt-1">
          EN 10219 (SHS/RHS/CHS) &middot; EN 10162 (CF-C/CF-Z)
          <br />
          Cold-formed welded structural hollow sections
        </div>
      )}
    </div>
  );
}
