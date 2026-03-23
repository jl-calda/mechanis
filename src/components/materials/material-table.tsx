"use client";

import { useState, useMemo } from "react";
import type { MaterialGrade } from "@/types/material";
import { materials } from "@/data/materials";
import { MaterialDetail } from "./material-detail";

type SortKey = "displayName" | "Fy" | "Fu" | "E" | "specification";

export function MaterialTable() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("displayName");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = materials.filter(
      (m) =>
        m.displayName.toLowerCase().includes(q) ||
        m.specification.toLowerCase().includes(q) ||
        m.notes.toLowerCase().includes(q) ||
        m.applicableShapes.some((s) => s.toLowerCase().includes(q))
    );

    list.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return list;
  }, [search, sortKey, sortAsc]);

  const selectedMaterial = selectedId
    ? materials.find((m) => m.id === selectedId)
    : null;

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const thClass =
    "px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wider cursor-pointer hover:text-foreground select-none";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, specification, shape..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className={thClass} onClick={() => toggleSort("displayName")}>
                    Grade {sortKey === "displayName" ? (sortAsc ? "\u2191" : "\u2193") : ""}
                  </th>
                  <th className={thClass} onClick={() => toggleSort("specification")}>
                    Spec {sortKey === "specification" ? (sortAsc ? "\u2191" : "\u2193") : ""}
                  </th>
                  <th className={thClass} onClick={() => toggleSort("Fy")}>
                    Fy (ksi) {sortKey === "Fy" ? (sortAsc ? "\u2191" : "\u2193") : ""}
                  </th>
                  <th className={thClass} onClick={() => toggleSort("Fu")}>
                    Fu (ksi) {sortKey === "Fu" ? (sortAsc ? "\u2191" : "\u2193") : ""}
                  </th>
                  <th className={thClass} onClick={() => toggleSort("E")}>
                    E (ksi) {sortKey === "E" ? (sortAsc ? "\u2191" : "\u2193") : ""}
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    Shapes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedId(m.id === selectedId ? null : m.id)}
                    className={`cursor-pointer transition-colors ${
                      m.id === selectedId
                        ? "bg-primary/5"
                        : "hover:bg-surface-alt"
                    }`}
                  >
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      {m.displayName}
                    </td>
                    <td className="px-4 py-2.5 text-muted">{m.specification}</td>
                    <td className="px-4 py-2.5 font-mono">{m.Fy}</td>
                    <td className="px-4 py-2.5 font-mono">{m.Fu}</td>
                    <td className="px-4 py-2.5 font-mono">
                      {m.E.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {m.applicableShapes.map((s) => (
                          <span
                            key={s}
                            className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted">
              No materials match your search.
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div>
        {selectedMaterial ? (
          <MaterialDetail material={selectedMaterial} />
        ) : (
          <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
            Click a row to view full properties.
          </div>
        )}
      </div>
    </div>
  );
}
