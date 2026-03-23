"use client";

import type { ProfileShape, ProfileType } from "@/types/profile";
import { profiles, getProfilesByType } from "@/data/profiles";
import { useMemo } from "react";

interface ProfileFormProps {
  selectedType: ProfileType;
  selectedDesignation: string;
  onTypeChange: (type: ProfileType) => void;
  onDesignationChange: (designation: string) => void;
}

const profileTypes: { value: ProfileType; label: string }[] = [
  { value: "W", label: "W-Shape (Wide Flange)" },
  { value: "C", label: "C-Shape (Channel)" },
  { value: "L", label: "L-Shape (Angle)" },
  { value: "HSS", label: "HSS (Hollow Structural)" },
];

export function ProfileForm({
  selectedType,
  selectedDesignation,
  onTypeChange,
  onDesignationChange,
}: ProfileFormProps) {
  const filteredProfiles = useMemo(
    () => getProfilesByType(selectedType),
    [selectedType]
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Profile Type
        </label>
        <select
          value={selectedType}
          onChange={(e) => {
            const newType = e.target.value as ProfileType;
            onTypeChange(newType);
            const first = getProfilesByType(newType)[0];
            if (first) onDesignationChange(first.designation);
          }}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {profileTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Designation
        </label>
        <select
          value={selectedDesignation}
          onChange={(e) => onDesignationChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {filteredProfiles.map((p) => (
            <option key={p.designation} value={p.designation}>
              {p.designation}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
