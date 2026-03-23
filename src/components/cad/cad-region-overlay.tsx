"use client";

import type { ClosedRegion } from "@/types/cad";

interface Props {
  regions: ClosedRegion[];
}

export function CadRegionOverlay({ regions }: Props) {
  return (
    <g>
      {regions.map((region) => {
        const d =
          region.boundary
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
            .join(" ") + " Z";

        const isAdd = region.sign === "add";
        const color = isAdd ? "var(--primary)" : "#f43f5e";

        return (
          <g key={region.id}>
            <path
              d={d}
              fill={color}
              fillOpacity={isAdd ? 0.1 : 0.12}
              stroke={color}
              strokeWidth={0.04}
              strokeDasharray="0.15 0.08"
            />
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
            <line
              x1={region.centroid.x}
              y1={region.centroid.y - 0.2}
              x2={region.centroid.x}
              y2={region.centroid.y + 0.2}
              stroke={color}
              strokeWidth={0.02}
            />
            {/* Sign + Area label */}
            <text
              x={region.centroid.x}
              y={region.centroid.y + 0.5}
              fill={color}
              fontSize={0.32}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              {isAdd ? "+" : "−"}{region.area.toFixed(2)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
