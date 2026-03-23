"use client";

import type { WeldInput, WeldResult } from "@/types/weld";

interface WeldDiagramSvgProps {
  input: WeldInput;
  result: WeldResult;
}

export function WeldDiagramSvg({ input, result }: WeldDiagramSvgProps) {
  const w = 300;
  const h = 250;
  const plateH = 60;
  const plateW = 180;
  const weldSize = Math.min(input.weldSize * 80, 30);

  // Draw two plates meeting at 90 degrees (T-joint)
  const baseY = h - 60;
  const baseX = w / 2;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full max-h-64">
      {/* Horizontal base plate */}
      <rect
        x={(w - plateW) / 2}
        y={baseY}
        width={plateW}
        height={plateH * 0.4}
        fill="var(--svg-fill)"
        stroke="var(--svg-stroke)"
        strokeWidth={1.5}
      />

      {/* Vertical plate (stem) */}
      <rect
        x={baseX - 8}
        y={baseY - plateH * 1.2}
        width={16}
        height={plateH * 1.2}
        fill="var(--svg-fill)"
        stroke="var(--svg-stroke)"
        strokeWidth={1.5}
      />

      {/* Left fillet weld */}
      {input.numberOfWelds >= 1 && (
        <polygon
          points={`${baseX - 8},${baseY} ${baseX - 8 - weldSize},${baseY} ${baseX - 8},${baseY - weldSize}`}
          fill={result.sizeCheck ? "#3ECF8E" : "#f43f5e"}
          fillOpacity={0.25}
          stroke={result.sizeCheck ? "#3ECF8E" : "#f43f5e"}
          strokeWidth={1.5}
        />
      )}

      {/* Right fillet weld */}
      {input.numberOfWelds >= 2 && (
        <polygon
          points={`${baseX + 8},${baseY} ${baseX + 8 + weldSize},${baseY} ${baseX + 8},${baseY - weldSize}`}
          fill={result.sizeCheck ? "#3ECF8E" : "#f43f5e"}
          fillOpacity={0.25}
          stroke={result.sizeCheck ? "#3ECF8E" : "#f43f5e"}
          strokeWidth={1.5}
        />
      )}

      {/* Weld size label */}
      <text
        x={baseX - 8 - weldSize - 5}
        y={baseY - weldSize / 2}
        fill="var(--svg-dim)"
        fontSize={9}
        fontFamily="monospace"
        textAnchor="end"
      >
        w={input.weldSize}&quot;
      </text>

      {/* Load angle indicator */}
      {input.angle > 0 && (
        <g>
          <line
            x1={baseX}
            y1={baseY - plateH * 1.2 - 10}
            x2={baseX}
            y2={baseY - plateH * 1.2 - 35}
            stroke="#f59e0b"
            strokeWidth={1.5}
            markerEnd="url(#arrowAmber)"
          />
          <text
            x={baseX + 10}
            y={baseY - plateH * 1.2 - 20}
            fill="#f59e0b"
            fontSize={9}
            fontFamily="monospace"
          >
            {input.angle > 0 ? `θ=${input.angle}°` : "longitudinal"}
          </text>
        </g>
      )}

      {/* Arrow marker */}
      <defs>
        <marker
          id="arrowAmber"
          viewBox="0 0 10 10"
          refX={5}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
        </marker>
      </defs>

      {/* Length label */}
      <text
        x={w / 2}
        y={h - 15}
        fill="var(--svg-dim)"
        fontSize={9}
        fontFamily="monospace"
        textAnchor="middle"
      >
        L={input.weldLength}&quot;{" "}
        {input.numberOfWelds > 1 ? `× ${input.numberOfWelds} welds` : ""}
      </text>
    </svg>
  );
}
