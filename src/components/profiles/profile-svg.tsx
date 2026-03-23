"use client";

import type { ProfileShape } from "@/types/profile";

interface DimensionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  offset?: number;
  orientation: "horizontal" | "vertical";
}

function DimensionLine({
  x1,
  y1,
  x2,
  y2,
  label,
  offset = 0,
  orientation,
}: DimensionLineProps) {
  const tickSize = 4;
  const isH = orientation === "horizontal";
  const ox = isH ? 0 : offset;
  const oy = isH ? offset : 0;
  const mx = (x1 + x2) / 2 + ox;
  const my = (y1 + y2) / 2 + oy;

  return (
    <g stroke="#555" strokeWidth={0.8} fill="none">
      {/* Extension lines */}
      <line
        x1={x1}
        y1={y1}
        x2={x1 + ox}
        y2={y1 + oy}
        strokeDasharray="2,2"
        strokeWidth={0.5}
      />
      <line
        x1={x2}
        y1={y2}
        x2={x2 + ox}
        y2={y2 + oy}
        strokeDasharray="2,2"
        strokeWidth={0.5}
      />
      {/* Dimension line */}
      <line
        x1={x1 + ox}
        y1={y1 + oy}
        x2={x2 + ox}
        y2={y2 + oy}
      />
      {/* Ticks */}
      {isH ? (
        <>
          <line x1={x1 + ox} y1={y1 + oy - tickSize} x2={x1 + ox} y2={y1 + oy + tickSize} />
          <line x1={x2 + ox} y1={y2 + oy - tickSize} x2={x2 + ox} y2={y2 + oy + tickSize} />
        </>
      ) : (
        <>
          <line x1={x1 + ox - tickSize} y1={y1 + oy} x2={x1 + ox + tickSize} y2={y1 + oy} />
          <line x1={x2 + ox - tickSize} y1={y2 + oy} x2={x2 + ox + tickSize} y2={y2 + oy} />
        </>
      )}
      {/* Label */}
      <text
        x={mx}
        y={my + (isH ? -4 : 0)}
        textAnchor="middle"
        dominantBaseline={isH ? "auto" : "middle"}
        fill="#888"
        fontSize={9}
        fontFamily="var(--font-mono), monospace"
        dx={isH ? 0 : 12}
      >
        {label}
      </text>
    </g>
  );
}

interface ProfileSvgProps {
  profile: ProfileShape;
  width?: number;
  height?: number;
}

function WShapeSvg({ profile, width = 300, height = 350 }: ProfileSvgProps) {
  const { d, bf, tf, tw } = profile;
  const scale = Math.min((width - 100) / bf, (height - 100) / d);
  const cx = width / 2;
  const cy = height / 2;
  const sd = d * scale;
  const sbf = bf * scale;
  const stf = tf * scale;
  const stw = tw * scale;

  const top = cy - sd / 2;
  const bot = cy + sd / 2;
  const left = cx - sbf / 2;
  const right = cx + sbf / 2;
  const webLeft = cx - stw / 2;
  const webRight = cx + stw / 2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {/* Cross-section */}
      <g fill="#2a2a2a" stroke="#555" strokeWidth={1.5}>
        {/* Top flange */}
        <rect x={left} y={top} width={sbf} height={stf} />
        {/* Web */}
        <rect x={webLeft} y={top + stf} width={stw} height={sd - 2 * stf} />
        {/* Bottom flange */}
        <rect x={left} y={bot - stf} width={sbf} height={stf} />
      </g>

      {/* Center axes */}
      <line x1={cx} y1={top - 15} x2={cx} y2={bot + 15} stroke="#333" strokeWidth={0.5} strokeDasharray="4,3" />
      <line x1={left - 15} y1={cy} x2={right + 15} y2={cy} stroke="#333" strokeWidth={0.5} strokeDasharray="4,3" />

      {/* Dimension: d (depth) */}
      <DimensionLine x1={right + 20} y1={top} x2={right + 20} y2={bot} label={`d=${d}"`} orientation="vertical" />

      {/* Dimension: bf (flange width) */}
      <DimensionLine x1={left} y1={bot + 20} x2={right} y2={bot + 20} label={`bf=${bf}"`} orientation="horizontal" />

      {/* Dimension: tf (flange thickness) */}
      <DimensionLine x1={left - 20} y1={top} x2={left - 20} y2={top + stf} label={`tf=${tf}"`} orientation="vertical" />

      {/* Dimension: tw (web thickness) */}
      <DimensionLine x1={webLeft} y1={top - 15} x2={webRight} y2={top - 15} label={`tw=${tw}"`} orientation="horizontal" />
    </svg>
  );
}

function CShapeSvg({ profile, width = 300, height = 350 }: ProfileSvgProps) {
  const { d, bf, tf, tw } = profile;
  const scale = Math.min((width - 100) / bf, (height - 100) / d);
  const cx = width / 2;
  const cy = height / 2;
  const sd = d * scale;
  const sbf = bf * scale;
  const stf = tf * scale;
  const stw = tw * scale;

  const top = cy - sd / 2;
  const bot = cy + sd / 2;
  const left = cx - sbf / 3;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <g fill="#2a2a2a" stroke="#555" strokeWidth={1.5}>
        {/* Top flange */}
        <rect x={left} y={top} width={sbf} height={stf} />
        {/* Web */}
        <rect x={left} y={top + stf} width={stw} height={sd - 2 * stf} />
        {/* Bottom flange */}
        <rect x={left} y={bot - stf} width={sbf} height={stf} />
      </g>

      <DimensionLine x1={left + sbf + 20} y1={top} x2={left + sbf + 20} y2={bot} label={`d=${d}"`} orientation="vertical" />
      <DimensionLine x1={left} y1={bot + 20} x2={left + sbf} y2={bot + 20} label={`bf=${bf}"`} orientation="horizontal" />
      <DimensionLine x1={left - 20} y1={top} x2={left - 20} y2={top + stf} label={`tf=${tf}"`} orientation="vertical" />
    </svg>
  );
}

function LShapeSvg({ profile, width = 300, height = 350 }: ProfileSvgProps) {
  const { d, bf, tf } = profile;
  const t = tf;
  const scale = Math.min((width - 100) / bf, (height - 100) / d);
  const cx = width / 2;
  const cy = height / 2;
  const sd = d * scale;
  const sbf = bf * scale;
  const st = t * scale;

  const originX = cx - sbf / 3;
  const originY = cy + sd / 2;

  const path = `
    M ${originX} ${originY}
    L ${originX} ${originY - sd}
    L ${originX + st} ${originY - sd}
    L ${originX + st} ${originY - st}
    L ${originX + sbf} ${originY - st}
    L ${originX + sbf} ${originY}
    Z
  `;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <path d={path} fill="#2a2a2a" stroke="#555" strokeWidth={1.5} />
      <DimensionLine x1={originX - 20} y1={originY} x2={originX - 20} y2={originY - sd} label={`d=${d}"`} orientation="vertical" />
      <DimensionLine x1={originX} y1={originY + 20} x2={originX + sbf} y2={originY + 20} label={`bf=${bf}"`} orientation="horizontal" />
      <DimensionLine x1={originX + st + 5} y1={originY - sd} x2={originX + st + 5} y2={originY - sd + st} label={`t=${t}"`} orientation="vertical" offset={15} />
    </svg>
  );
}

function HSSShapeSvg({ profile, width = 300, height = 350 }: ProfileSvgProps) {
  const d = profile.d;
  const b = profile.B ?? profile.bf;
  const t = profile.tdes ?? profile.tf;
  const scale = Math.min((width - 100) / b, (height - 100) / d);
  const cx = width / 2;
  const cy = height / 2;
  const sd = d * scale;
  const sb = b * scale;
  const st = t * scale;
  const r = Math.min(st * 2, 8);

  const outerX = cx - sb / 2;
  const outerY = cy - sd / 2;
  const innerX = outerX + st;
  const innerY = outerY + st;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <rect x={outerX} y={outerY} width={sb} height={sd} rx={r} fill="#2a2a2a" stroke="#555" strokeWidth={1.5} />
      <rect x={innerX} y={innerY} width={sb - 2 * st} height={sd - 2 * st} rx={Math.max(r - st, 0)} fill="#171717" stroke="#555" strokeWidth={0.8} />

      <DimensionLine x1={outerX + sb + 20} y1={outerY} x2={outerX + sb + 20} y2={outerY + sd} label={`d=${d}"`} orientation="vertical" />
      <DimensionLine x1={outerX} y1={outerY + sd + 20} x2={outerX + sb} y2={outerY + sd + 20} label={`b=${b}"`} orientation="horizontal" />
      <DimensionLine x1={outerX - 20} y1={outerY} x2={outerX - 20} y2={outerY + st} label={`t=${t}"`} orientation="vertical" />
    </svg>
  );
}

export function ProfileSvg({ profile, width, height }: ProfileSvgProps) {
  switch (profile.type) {
    case "W":
      return <WShapeSvg profile={profile} width={width} height={height} />;
    case "C":
      return <CShapeSvg profile={profile} width={width} height={height} />;
    case "L":
      return <LShapeSvg profile={profile} width={width} height={height} />;
    case "HSS":
      return <HSSShapeSvg profile={profile} width={width} height={height} />;
  }
}
