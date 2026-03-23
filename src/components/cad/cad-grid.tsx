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

  for (let x = startX; x <= endX; x += gridSize) {
    const isOrigin = Math.abs(x) < gridSize * 0.01;
    lines.push(
      <line
        key={key++}
        x1={x}
        y1={startY}
        x2={x}
        y2={endY}
        stroke={isOrigin ? "var(--svg-stroke)" : "var(--svg-axis)"}
        strokeWidth={isOrigin ? 0.03 : 0.015}
        strokeOpacity={isOrigin ? 0.6 : 0.4}
      />
    );
  }

  for (let y = startY; y <= endY; y += gridSize) {
    const isOrigin = Math.abs(y) < gridSize * 0.01;
    lines.push(
      <line
        key={key++}
        x1={startX}
        y1={y}
        x2={endX}
        y2={y}
        stroke={isOrigin ? "var(--svg-stroke)" : "var(--svg-axis)"}
        strokeWidth={isOrigin ? 0.03 : 0.015}
        strokeOpacity={isOrigin ? 0.6 : 0.4}
      />
    );
  }

  return <g>{lines}</g>;
}
