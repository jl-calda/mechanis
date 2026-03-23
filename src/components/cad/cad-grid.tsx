"use client";

interface Props {
  gridSize: number;
  viewBox: { x: number; y: number; w: number; h: number };
}

export function CadGrid({ gridSize, viewBox }: Props) {
  const startX = Math.floor(viewBox.x / gridSize) * gridSize;
  const startY = Math.floor(viewBox.y / gridSize) * gridSize;
  const endX = viewBox.x + viewBox.w;
  const endY = viewBox.y + viewBox.h;

  const lines: React.ReactElement[] = [];
  let key = 0;

  // Grid lines (skip origin — drawn separately)
  for (let x = startX; x <= endX; x += gridSize) {
    if (Math.abs(x) < gridSize * 0.01) continue;
    lines.push(
      <line
        key={key++}
        x1={x}
        y1={startY}
        x2={x}
        y2={endY}
        stroke="var(--svg-axis)"
        strokeWidth={0.015}
        strokeOpacity={0.4}
      />
    );
  }

  for (let y = startY; y <= endY; y += gridSize) {
    if (Math.abs(y) < gridSize * 0.01) continue;
    lines.push(
      <line
        key={key++}
        x1={startX}
        y1={y}
        x2={endX}
        y2={y}
        stroke="var(--svg-axis)"
        strokeWidth={0.015}
        strokeOpacity={0.4}
      />
    );
  }

  // Font size scales with view to stay readable
  const labelSize = Math.min(0.4, viewBox.w * 0.012);
  const arrowSize = labelSize * 0.8;

  return (
    <g>
      {lines}

      {/* X axis (red) */}
      <line
        x1={startX}
        y1={0}
        x2={endX}
        y2={0}
        stroke="#ef4444"
        strokeWidth={0.04}
        strokeOpacity={0.7}
      />
      {/* X axis arrow */}
      <polygon
        points={`${endX - arrowSize * 2},${-arrowSize * 0.5} ${endX},0 ${endX - arrowSize * 2},${arrowSize * 0.5}`}
        fill="#ef4444"
        fillOpacity={0.7}
      />
      {/* X label */}
      <text
        x={endX - arrowSize * 3}
        y={-labelSize * 0.8}
        fill="#ef4444"
        fontSize={labelSize}
        fontFamily="var(--font-sans)"
        fontWeight="600"
        opacity={0.8}
      >
        X
      </text>

      {/* Y axis (blue-green) */}
      <line
        x1={0}
        y1={startY}
        x2={0}
        y2={endY}
        stroke="#3b82f6"
        strokeWidth={0.04}
        strokeOpacity={0.7}
      />
      {/* Y axis arrow */}
      <polygon
        points={`${-arrowSize * 0.5},${endY - arrowSize * 2} 0,${endY} ${arrowSize * 0.5},${endY - arrowSize * 2}`}
        fill="#3b82f6"
        fillOpacity={0.7}
      />
      {/* Y label */}
      <text
        x={labelSize * 0.5}
        y={endY - arrowSize * 2.5}
        fill="#3b82f6"
        fontSize={labelSize}
        fontFamily="var(--font-sans)"
        fontWeight="600"
        opacity={0.8}
      >
        Y
      </text>

      {/* Origin dot */}
      <circle
        cx={0}
        cy={0}
        r={0.12}
        fill="white"
        stroke="var(--svg-stroke)"
        strokeWidth={0.04}
      />
      <circle
        cx={0}
        cy={0}
        r={0.05}
        fill="var(--svg-stroke)"
      />
    </g>
  );
}
