"use client";

import type { MaterialGrade } from "@/types/material";

interface MaterialDetailProps {
  material: MaterialGrade;
}

export function MaterialDetail({ material }: MaterialDetailProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Specification", value: material.specification },
    { label: "Grade", value: material.grade },
    { label: "Yield Strength (Fy)", value: `${material.Fy} ksi` },
    { label: "Tensile Strength (Fu)", value: `${material.Fu} ksi` },
    {
      label: "Modulus of Elasticity (E)",
      value: `${material.E.toLocaleString()} ksi`,
    },
    {
      label: "Shear Modulus (G)",
      value: `${material.G.toLocaleString()} ksi`,
    },
    { label: "Density", value: `${material.density} lb/in\u00B3` },
    { label: "Poisson's Ratio (\u03BD)", value: material.nu.toString() },
    {
      label: "Thermal Expansion (\u03B1)",
      value: `${material.alpha} \u00D710\u207B\u2076/\u00B0F`,
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="border-b border-border bg-primary px-4 py-2.5">
        <h3 className="text-xs font-medium text-black">
          {material.displayName}
        </h3>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-4 py-2 text-xs"
          >
            <span className="text-muted">{row.label}</span>
            <span className="font-mono text-foreground">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-4 py-2.5">
        <div className="mb-2">
          <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
            Applicable Shapes
          </span>
          <div className="mt-1 flex flex-wrap gap-1">
            {material.applicableShapes.map((s) => (
              <span
                key={s}
                className="inline-flex rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        {material.notes && (
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            {material.notes}
          </p>
        )}
      </div>
    </div>
  );
}
