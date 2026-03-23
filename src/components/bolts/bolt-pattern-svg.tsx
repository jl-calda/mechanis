"use client";

import type { BoltInput, BoltResult } from "@/types/bolt";

interface BoltPatternSvgProps {
  input: BoltInput;
  result: BoltResult;
}

export function BoltPatternSvg({ input, result }: BoltPatternSvgProps) {
  const { numRows, numCols, pitch, gage, edgeDistVert, edgeDistHoriz } = input;

  const plateW = edgeDistHoriz * 2 + (numCols - 1) * gage;
  const plateH = edgeDistVert * 2 + (numRows - 1) * pitch;

  const scale = Math.min(280 / plateW, 280 / plateH, 50);
  const pad = 40;
  const svgW = plateW * scale + pad * 2;
  const svgH = plateH * scale + pad * 2;

  const boltR = (input.diameter / 2) * scale * 0.8;

  const bolts: { cx: number; cy: number }[] = [];
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      bolts.push({
        cx: pad + (edgeDistHoriz + c * gage) * scale,
        cy: pad + (edgeDistVert + r * pitch) * scale,
      });
    }
  }

  const edgeOk = result.edgeDistanceCheck.passes;
  const spacingOk = result.spacingCheck.passes;
  const boltColor = edgeOk && spacingOk ? "#3ECF8E" : "#f43f5e";

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="w-full h-full max-h-80"
    >
      {/* Plate */}
      <rect
        x={pad}
        y={pad}
        width={plateW * scale}
        height={plateH * scale}
        fill="var(--svg-fill)"
        stroke="var(--svg-stroke)"
        strokeWidth={1.5}
        rx={2}
      />

      {/* Bolts */}
      {bolts.map((b, i) => (
        <g key={i}>
          <circle
            cx={b.cx}
            cy={b.cy}
            r={boltR}
            fill={boltColor}
            fillOpacity={0.15}
            stroke={boltColor}
            strokeWidth={1.5}
          />
          <line
            x1={b.cx - boltR * 0.5}
            y1={b.cy - boltR * 0.5}
            x2={b.cx + boltR * 0.5}
            y2={b.cy + boltR * 0.5}
            stroke={boltColor}
            strokeWidth={1}
          />
          <line
            x1={b.cx + boltR * 0.5}
            y1={b.cy - boltR * 0.5}
            x2={b.cx - boltR * 0.5}
            y2={b.cy + boltR * 0.5}
            stroke={boltColor}
            strokeWidth={1}
          />
        </g>
      ))}

      {/* Dimension: pitch */}
      {numRows > 1 && (
        <>
          <line
            x1={pad + plateW * scale + 15}
            y1={bolts[0].cy}
            x2={pad + plateW * scale + 15}
            y2={bolts[numCols].cy}
            stroke="var(--svg-stroke)"
            strokeWidth={0.8}
          />
          <text
            x={pad + plateW * scale + 20}
            y={(bolts[0].cy + bolts[numCols].cy) / 2}
            fill="var(--svg-dim)"
            fontSize={9}
            fontFamily="monospace"
            dominantBaseline="middle"
          >
            s={pitch}&quot;
          </text>
        </>
      )}

      {/* Dimension: gage */}
      {numCols > 1 && (
        <>
          <line
            x1={bolts[0].cx}
            y1={pad - 10}
            x2={bolts[1].cx}
            y2={pad - 10}
            stroke="var(--svg-stroke)"
            strokeWidth={0.8}
          />
          <text
            x={(bolts[0].cx + bolts[1].cx) / 2}
            y={pad - 14}
            fill="var(--svg-dim)"
            fontSize={9}
            fontFamily="monospace"
            textAnchor="middle"
          >
            g={gage}&quot;
          </text>
        </>
      )}

      {/* Edge distance labels */}
      <text
        x={pad + 4}
        y={pad + edgeDistVert * scale / 2}
        fill="var(--svg-dim)"
        fontSize={8}
        fontFamily="monospace"
      >
        Le={edgeDistVert}&quot;
      </text>
    </svg>
  );
}
