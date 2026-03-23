"use client";

import type { CadEntity } from "@/types/cad";

interface Props {
  entity: CadEntity;
  selected: boolean;
}

const SEL_COLOR = "var(--primary)";

export function CadEntityRenderer({ entity, selected }: Props) {
  const stroke = selected ? SEL_COLOR : "var(--svg-stroke)";
  const sw = entity.strokeWidth;

  switch (entity.type) {
    case "point":
      return (
        <g>
          <circle
            cx={entity.position.x}
            cy={entity.position.y}
            r={0.15}
            fill={selected ? SEL_COLOR : "var(--svg-dim)"}
            stroke="none"
          />
          {selected && (
            <circle
              cx={entity.position.x}
              cy={entity.position.y}
              r={0.3}
              fill="none"
              stroke={SEL_COLOR}
              strokeWidth={0.05}
            />
          )}
        </g>
      );

    case "line":
      return (
        <line
          x1={entity.start.x}
          y1={entity.start.y}
          x2={entity.end.x}
          y2={entity.end.y}
          stroke={stroke}
          strokeWidth={entity.thickness > 0 ? entity.thickness : sw * 0.05}
          strokeLinecap="round"
          opacity={entity.thickness > 0 ? 0.7 : 1}
        />
      );

    case "rectangle":
      return (
        <rect
          x={entity.origin.x}
          y={entity.origin.y}
          width={entity.width}
          height={entity.height}
          fill="none"
          stroke={stroke}
          strokeWidth={sw * 0.05}
        />
      );

    case "polyline": {
      const d = entity.points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");
      return (
        <path
          d={entity.closed ? d + " Z" : d}
          fill="none"
          stroke={stroke}
          strokeWidth={entity.thickness > 0 ? entity.thickness : sw * 0.05}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={entity.thickness > 0 ? 0.7 : 1}
        />
      );
    }

    case "circle":
      return (
        <circle
          cx={entity.center.x}
          cy={entity.center.y}
          r={entity.radius}
          fill="none"
          stroke={stroke}
          strokeWidth={sw * 0.05}
        />
      );

    case "ellipse":
      return (
        <ellipse
          cx={entity.center.x}
          cy={entity.center.y}
          rx={entity.rx}
          ry={entity.ry}
          fill="none"
          stroke={stroke}
          strokeWidth={sw * 0.05}
        />
      );
  }
}
