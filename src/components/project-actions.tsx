"use client";

import { useState } from "react";
import { Save, FolderOpen } from "lucide-react";
import { saveProject, loadProjects } from "@/lib/supabase/projects";
import type { Project } from "@/types/project";

interface Props {
  type: Project["type"];
  getData: () => Record<string, unknown>;
  onLoad: (data: Record<string, unknown>) => void;
}

export function ProjectActions({ type, getData, onLoad }: Props) {
  const [saving, setSaving] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSave, setShowSave] = useState(false);

  async function handleSave() {
    if (!saveName.trim()) return;
    setSaving(true);
    await saveProject(saveName.trim(), type, getData());
    setSaving(false);
    setShowSave(false);
    setSaveName("");
  }

  async function handleOpenLoad() {
    setShowLoad(true);
    setLoadingList(true);
    const list = await loadProjects(type);
    setProjects(list);
    setLoadingList(false);
  }

  return (
    <div className="flex items-center gap-1">
      {/* Save button */}
      <div className="relative">
        <button
          onClick={() => setShowSave(!showSave)}
          className="flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-[11px] text-muted hover:text-foreground transition-colors"
          title="Save project"
        >
          <Save size={12} />
          Save
        </button>
        {showSave && (
          <div className="absolute right-0 top-8 z-20 w-52 rounded-md border border-border bg-surface p-2 shadow-lg">
            <input
              autoFocus
              type="text"
              placeholder="Project name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="w-full rounded border border-border bg-surface-alt px-2 py-1 text-xs text-foreground placeholder:text-muted/40 focus:border-primary focus:outline-none"
            />
            <div className="mt-1.5 flex justify-end gap-1">
              <button
                onClick={() => setShowSave(false)}
                className="rounded px-2 py-0.5 text-[10px] text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !saveName.trim()}
                className="rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-black disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Load button */}
      <div className="relative">
        <button
          onClick={handleOpenLoad}
          className="flex h-7 items-center gap-1 rounded-md border border-border bg-surface px-2 text-[11px] text-muted hover:text-foreground transition-colors"
          title="Load project"
        >
          <FolderOpen size={12} />
          Load
        </button>
        {showLoad && (
          <div className="absolute right-0 top-8 z-20 w-60 rounded-md border border-border bg-surface p-2 shadow-lg">
            {loadingList ? (
              <div className="py-3 text-center text-xs text-muted">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="py-3 text-center text-xs text-muted">No saved projects</div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onLoad(p.data);
                      setShowLoad(false);
                    }}
                    className="w-full text-left rounded px-2 py-1.5 text-xs text-foreground hover:bg-surface-alt transition-colors"
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-[10px] text-muted">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-1 flex justify-end">
              <button
                onClick={() => setShowLoad(false)}
                className="rounded px-2 py-0.5 text-[10px] text-muted hover:text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
