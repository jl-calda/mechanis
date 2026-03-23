"use client";

import type { ClosedRegion } from "@/types/cad";

interface Props {
  regions: ClosedRegion[];
}

export function CadRegionOverlay({ regions }: Props) {
  return (
    <g>
      {/* Hatch pattern for subtracted regions */}
      <defs>
        <pattern id="hatch-subtract" patternUnits="userSpaceOnUse" width="0.3" height="0.3" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="0.3" stroke="#f43f5e" strokeWidth="0.06" opacity="0.5" />
        </pattern>
        <pattern id="hatch-add" patternUnits="userSpaceOnUse" width="0.4" height="0.4">
          <rect width="0.4" height="0.4" fill="var(--primary)" opacity="0.08" />
        </pattern>
      </defs>
      {regions.map((region) => {
        const d =
          region.boundary
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
            .join(" ") + " Z";

        const isAdd = region.sign === "add";
        const color = isAdd ? "var(--primary)" : "#f43f5e";

        return (
          <g key={region.id}>
            {/* Solid fill */}
            <path
              d={d}
              fill={isAdd ? "var(--primary)" : "#f43f5e"}
              fillOpacity={isAdd ? 0.08 : 0.06}
              stroke={color}
              strokeWidth={isAdd ? 0.04 : 0.05}
              strokeDasharray={isAdd ? "0.15 0.08" : "0.12 0.06"}
            />
            {/* Hatch overlay for subtract regions */}
            {!isAdd && (
              <path
                d={d}
                fill="url(#hatch-subtract)"
                stroke="none"
              />
            )}
            {/* Centroid marker */}
            <circle
              cx={region.centroid.x}
              cy={region.centroid.y}
              r={0.12}
              fill="none"
              stroke={color}
              strokeWidth={0.03}
            />
            <line
              x1={region.centroid.x - 0.2}
              y1={region.centroid.y}
              x2={region.centroid.x + 0.2}
              y2={region.centroid.y}
              stroke={color}
              strokeWidth={0.02}
            />
            {isAdd && (
              <line
                x1={region.centroid.x}
                y1={region.centroid.y - 0.2}
                x2={region.centroid.x}
                y2={region.centroid.y + 0.2}
                stroke={color}
                strokeWidth={0.02}
              />
            )}
            {/* Background for label */}
            <rect
              x={region.centroid.x - (isAdd ? "+" : "\u2212").length * 0.05 - region.area.toFixed(2).length * 0.1 - 0.3}
              y={region.centroid.y + 0.28}
              width={region.area.toFixed(2).length * 0.2 + 1.0}
              height={0.45}
              rx={0.08}
              fill="var(--surface)"
              fillOpacity={0.85}
              stroke={color}
              strokeWidth={0.02}
            />
            {/* Sign + Area label */}
            <text
              x={region.centroid.x}
              y={region.centroid.y + 0.6}
              fill={color}
              fontSize={0.32}
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              {isAdd ? "+" : "\u2212"}{region.area.toFixed(2)} in\u00B2
            </text>
          </g>
        );
      })}
    </g>
  );
}
