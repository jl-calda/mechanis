"use client";

import type { ProfileShape } from "@/types/profile";
import { getUnitSystem } from "@/types/profile";

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
    <g stroke="var(--svg-stroke)" strokeWidth={0.8} fill="none">
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
        fill="var(--svg-dim)"
        fontSize={9}
        fontFamily="var(--font-mono), monospace"
        dx={isH ? 0 : 12}
      >
        {label}
      </text>
    </g>
  );
}

/** Format a dimension value with the appropriate unit suffix */
function dimLabel(name: string, value: number, isMetric: boolean): string {
  if (isMetric) return `${name}=${value}`;
  return `${name}=${value}"`;
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
      <g fill="var(--svg-fill)" stroke="var(--svg-stroke)" strokeWidth={1.5}>
        {/* Top flange */}
        <rect x={left} y={top} width={sbf} height={stf} />
        {/* Web */}
        <rect x={webLeft} y={top + stf} width={stw} height={sd - 2 * stf} />
        {/* Bottom flange */}
        <rect x={left} y={bot - stf} width={sbf} height={stf} />
      </g>

      {/* Center axes */}
      <line x1={cx} y1={top - 15} x2={cx} y2={bot + 15} stroke="var(--svg-axis)" strokeWidth={0.5} strokeDasharray="4,3" />
      <line x1={left - 15} y1={cy} x2={right + 15} y2={cy} stroke="var(--svg-axis)" strokeWidth={0.5} strokeDasharray="4,3" />

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
      <g fill="var(--svg-fill)" stroke="var(--svg-stroke)" strokeWidth={1.5}>
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
      <path d={path} fill="var(--svg-fill)" stroke="var(--svg-stroke)" strokeWidth={1.5} />
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
      <rect x={outerX} y={outerY} width={sb} height={sd} rx={r} fill="var(--svg-fill)" stroke="var(--svg-stroke)" strokeWidth={1.5} />
      <rect x={innerX} y={innerY} width={sb - 2 * st} height={sd - 2 * st} rx={Math.max(r - st, 0)} fill="var(--svg-inner)" stroke="var(--svg-stroke)" strokeWidth={0.8} />

      <DimensionLine x1={outerX + sb + 20} y1={outerY} x2={outerX + sb + 20} y2={outerY + sd} label={`d=${d}"`} orientation="vertical" />
      <DimensionLine x1={outerX} y1={outerY + sd + 20} x2={outerX + sb} y2={outerY + sd + 20} label={`b=${b}"`} orientation="horizontal" />
      <DimensionLine x1={outerX - 20} y1={outerY} x2={outerX - 20} y2={outerY + st} label={`t=${t}"`} orientation="vertical" />
    </svg>
  );
}

// ---------- EN cold-formed SVG renderers ----------

/** SHS / RHS — same shape as HSS but with mm dimensions and corner radii */
function SHSRHSSvg({ profile, width = 300, height = 350 }: ProfileSvgProps) {
  const h = profile.d;
  const b = profile.B ?? profile.bf;
  const t = profile.tdes ?? profile.tf;
  const ri = profile.ri ?? t;
  const metric = getUnitSystem(profile.standard) === "metric";
  const scale = Math.min((width - 100) / b, (height - 100) / h);
  const cx = width / 2;
  const cy = height / 2;
  const sh = h * scale;
  const sb = b * scale;
  const st = t * scale;
  const sRo = Math.min((ri + t) * scale, 16);
  const sRi = Math.max(sRo - st, 0);

  const outerX = cx - sb / 2;
  const outerY = cy - sh / 2;
  const innerX = outerX + st;
  const innerY = outerY + st;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {/* Outer rect with rounded corners */}
      <rect x={outerX} y={outerY} width={sb} height={sh} rx={sRo} fill="var(--svg-fill)" stroke="var(--svg-stroke)" strokeWidth={1.5} />
      {/* Inner void */}
      <rect x={innerX} y={innerY} width={sb - 2 * st} height={sh - 2 * st} rx={sRi} fill="var(--svg-inner)" stroke="var(--svg-stroke)" strokeWidth={0.8} />

      {/* Center axes */}
      <line x1={cx} y1={outerY - 12} x2={cx} y2={outerY + sh + 12} stroke="var(--svg-axis)" strokeWidth={0.5} strokeDasharray="4,3" />
      <line x1={outerX - 12} y1={cy} x2={outerX + sb + 12} y2={cy} stroke="var(--svg-axis)" strokeWidth={0.5} strokeDasharray="4,3" />

      <DimensionLine x1={outerX + sb + 20} y1={outerY} x2={outerX + sb + 20} y2={outerY + sh} label={dimLabel("h", h, metric)} orientation="vertical" />
      <DimensionLine x1={outerX} y1={outerY + sh + 20} x2={outerX + sb} y2={outerY + sh + 20} label={dimLabel("b", b, metric)} orientation="horizontal" />
      <DimensionLine x1={outerX - 20} y1={outerY} x2={outerX - 20} y2={outerY + st} label={dimLabel("t", t, metric)} orientation="vertical" />
    </svg>
  );
}

/** CHS — Circular Hollow Section */
function CHSSvg({ profile, width = 300, height = 350 }: ProfileSvgProps) {
  const D = profile.D ?? profile.d;
  const t = profile.tdes ?? profile.tf;
  const metric = getUnitSystem(profile.standard) === "metric";
  const maxDim = D;
  const scale = Math.min((width - 100) / maxDim, (height - 100) / maxDim);
  const cx = width / 2;
  const cy = height / 2;
  const sR = (D / 2) * scale;
  const sRi = ((D / 2) - t) * scale;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={sR} fill="var(--svg-fill)" stroke="var(--svg-stroke)" strokeWidth={1.5} />
      {/* Inner circle (void) */}
      <circle cx={cx} cy={cy} r={sRi} fill="var(--svg-inner)" stroke="var(--svg-stroke)" strokeWidth={0.8} />

      {/* Center axes */}
      <line x1={cx} y1={cy - sR - 12} x2={cx} y2={cy + sR + 12} stroke="var(--svg-axis)" strokeWidth={0.5} strokeDasharray="4,3" />
      <line x1={cx - sR - 12} y1={cy} x2={cx + sR + 12} y2={cy} stroke="var(--svg-axis)" strokeWidth={0.5} strokeDasharray="4,3" />

      {/* Dimension: D (outer diameter) — drawn as horizontal across top */}
      <DimensionLine x1={cx - sR} y1={cy - sR - 20} x2={cx + sR} y2={cy - sR - 20} label={dimLabel("D", D, metric)} orientation="horizontal" />

      {/* Dimension: t (wall thickness) — right side */}
      <DimensionLine x1={cx + sRi + 2} y1={cy} x2={cx + sR - 2} y2={cy} label={dimLabel("t", t, metric)} orientation="horizontal" offset={-18} />
    </svg>
  );
}

/** CF-C — Cold-formed lipped channel */
function CFCSvg({ profile, width = 300, height = 350 }: ProfileSvgProps) {
  const { d: h, bf: b, tf: t } = profile;
  const c = profile.lip ?? 20;
  const ri = profile.ri ?? t * 2;
  const metric = getUnitSystem(profile.standard) === "metric";
  const scale = Math.min((width - 120) / (b + c), (height - 100) / h);
  const cx = width / 2;
  const cy = height / 2;
  const sh = h * scale;
  const sb = b * scale;
  const st = t * scale;
  const sc = c * scale;

  // Draw from top-left of web, going clockwise
  // Shape: web on the left, flanges extending right, lips folding inward (up/down)
  const x0 = cx - sb / 2;
  const top = cy - sh / 2;

  const path = [
    // Start at top-left inner corner (top lip end)
    `M ${x0 + sb} ${top + sc}`,
    // Top lip going up
    `L ${x0 + sb} ${top}`,
    // Top flange going left
    `L ${x0 + st} ${top}`,
    // Inner corner, down the web
    `L ${x0 + st} ${top + st}`,
    `L ${x0} ${top + st}`,
    // Web going down
    `L ${x0} ${top + sh - st}`,
    // Bottom inner corner
    `L ${x0 + st} ${top + sh - st}`,
    `L ${x0 + st} ${top + sh}`,
    // Bottom flange going right
    `L ${x0 + sb} ${top + sh}`,
    // Bottom lip going up
    `L ${x0 + sb} ${top + sh - sc}`,
    // Inner face of bottom lip
    `L ${x0 + sb - st} ${top + sh - sc}`,
    // Inner bottom flange
    `L ${x0 + sb - st} ${top + sh - st}`,
    // Inner web face
    `L ${x0 + st} ${top + sh - st}`,
    // Already covered inner web, let me redo this properly
  ].join(" ");

  // Actually, for thin-wall cold-formed, draw the outline as a single closed path
  // Outer perimeter clockwise, then done
  const outerPath = [
    `M ${x0} ${top}`,
    `L ${x0 + sb} ${top}`,           // top flange
    `L ${x0 + sb} ${top + sc}`,       // top lip down
    `L ${x0 + sb - st} ${top + sc}`,  // lip inner
    `L ${x0 + sb - st} ${top + st}`,  // inner top flange
    `L ${x0 + st} ${top + st}`,       // inner web top
    `L ${x0 + st} ${top + sh - st}`,  // inner web bottom
    `L ${x0 + sb - st} ${top + sh - st}`, // inner bottom flange
    `L ${x0 + sb - st} ${top + sh - sc}`, // lip inner bottom
    `L ${x0 + sb} ${top + sh - sc}`,  // lip outer bottom
    `L ${x0 + sb} ${top + sh}`,       // bottom flange end
    `L ${x0} ${top + sh}`,            // bottom of web
    `Z`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <path d={outerPath} fill="var(--svg-fill)" stroke="var(--svg-stroke)" strokeWidth={1.5} />

      {/* Center axes */}
      <line x1={cx} y1={top - 12} x2={cx} y2={top + sh + 12} stroke="var(--svg-axis)" strokeWidth={0.5} strokeDasharray="4,3" />
      <line x1={x0 - 12} y1={cy} x2={x0 + sb + 12} y2={cy} stroke="var(--svg-axis)" strokeWidth={0.5} strokeDasharray="4,3" />

      {/* Dimensions */}
      <DimensionLine x1={x0 - 25} y1={top} x2={x0 - 25} y2={top + sh} label={dimLabel("h", h, metric)} orientation="vertical" />
      <DimensionLine x1={x0} y1={top + sh + 20} x2={x0 + sb} y2={top + sh + 20} label={dimLabel("b", b, metric)} orientation="horizontal" />
      <DimensionLine x1={x0 + sb + 15} y1={top} x2={x0 + sb + 15} y2={top + sc} label={dimLabel("c", c, metric)} orientation="vertical" />
      <DimensionLine x1={x0 + sb - st - 3} y1={top - 12} x2={x0 + sb - 3} y2={top - 12} label={dimLabel("t", t, metric)} orientation="horizontal" />
    </svg>
  );
}

/** CF-Z — Cold-formed Z-section */
function CFZSvg({ profile, width = 300, height = 350 }: ProfileSvgProps) {
  const { d: h, bf: b, tf: t } = profile;
  const c = profile.lip ?? 15;
  const metric = getUnitSystem(profile.standard) === "metric";
  // Z-section: top flange goes right, bottom flange goes left (point-symmetric)
  const totalW = 2 * b; // flanges extend both sides
  const scale = Math.min((width - 120) / totalW, (height - 100) / h);
  const cx = width / 2;
  const cy = height / 2;
  const sh = h * scale;
  const sb = b * scale;
  const st = t * scale;
  const sc = c * scale;

  const top = cy - sh / 2;
  // Web centered at cx, top flange extends right, bottom flange extends left

  const outerPath = [
    // Start at top-right lip
    `M ${cx + sb} ${top + sc}`,
    `L ${cx + sb} ${top}`,             // top lip up
    `L ${cx + sb - st} ${top}`,        // lip inner top
    `L ${cx + sb - st} ${top + sc}`,   // lip inner
    // Wait, let me think about this differently. For a Z-purlin:
    // The web is vertical. Top flange goes to the right. Bottom flange goes to the left.
    // Lips: top lip folds down from right end of top flange, bottom lip folds up from left end of bottom flange.
  ].join(" ");

  // Cleaner approach: outline path
  const webL = cx - st / 2;
  const webR = cx + st / 2;

  const zPath = [
    // Top flange: from web going right
    `M ${webL} ${top}`,
    `L ${webR + sb - st} ${top}`,       // top flange right edge
    `L ${webR + sb - st} ${top + sc}`,  // top lip (folds down)
    `L ${webR + sb - 2 * st} ${top + sc}`, // lip inner
    `L ${webR + sb - 2 * st} ${top + st}`, // inner top flange
    `L ${webR} ${top + st}`,            // inner web top-right
    `L ${webR} ${top + sh - st}`,       // inner web bottom-right
    // Bottom flange: from web going left
    `L ${webL - sb + 2 * st} ${top + sh - st}`, // inner bottom flange
    `L ${webL - sb + 2 * st} ${top + sh - sc}`, // bottom lip inner
    `L ${webL - sb + st} ${top + sh - sc}`,     // lip outer
    `L ${webL - sb + st} ${top + sh}`,           // bottom flange left edge
    `L ${webR} ${top + sh}`,            // bottom of web right
    `L ${webR} ${top + sh}`,
    // Hmm, let me simplify
  ].join(" ");

  // Let me use a simpler, clearer outline approach
  // Web: vertical strip centered at cx
  // Top flange: horizontal strip from web-right to web-right + (b-t), at top
  // Bottom flange: horizontal strip from web-left - (b-t) to web-left, at bottom
  // Top lip: from top-flange right end, goes down by c
  // Bottom lip: from bottom-flange left end, goes up by c

  const path = [
    // Start at top-left of web
    `M ${webL} ${top}`,
    // Go right along top of top flange
    `L ${webR + sb - st} ${top}`,
    // Top lip: down
    `L ${webR + sb - st} ${top + sc}`,
    // Lip inner edge: left by t
    `L ${webR + sb - 2 * st} ${top + sc}`,
    // Up to inner top flange
    `L ${webR + sb - 2 * st} ${top + st}`,
    // Left along inner top flange to web
    `L ${webR} ${top + st}`,
    // Down along right side of web
    `L ${webR} ${top + sh}`,
    // Left along bottom to bottom flange left edge
    `L ${webL - sb + st} ${top + sh}`,
    // Bottom lip: up
    `L ${webL - sb + st} ${top + sh - sc}`,
    // Lip inner: right by t
    `L ${webL - sb + 2 * st} ${top + sh - sc}`,
    // Down to inner bottom flange
    `L ${webL - sb + 2 * st} ${top + sh - st}`,
    // Right along inner bottom flange to web
    `L ${webL} ${top + sh - st}`,
    // Up along left side of web back to start
    `Z`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <path d={path} fill="var(--svg-fill)" stroke="var(--svg-stroke)" strokeWidth={1.5} />

      {/* Center axes */}
      <line x1={cx} y1={top - 12} x2={cx} y2={top + sh + 12} stroke="var(--svg-axis)" strokeWidth={0.5} strokeDasharray="4,3" />
      <line x1={webL - sb} y1={cy} x2={webR + sb} y2={cy} stroke="var(--svg-axis)" strokeWidth={0.5} strokeDasharray="4,3" />

      {/* Dimensions */}
      <DimensionLine x1={webR + sb + 10} y1={top} x2={webR + sb + 10} y2={top + sh} label={dimLabel("h", h, metric)} orientation="vertical" />
      <DimensionLine x1={webR} y1={top - 15} x2={webR + sb - st} y2={top - 15} label={dimLabel("b", b, metric)} orientation="horizontal" />
      <DimensionLine x1={webR + sb} y1={top} x2={webR + sb} y2={top + sc} label={dimLabel("c", c, metric)} orientation="vertical" offset={18} />
      <DimensionLine x1={webL - 3} y1={top - 15} x2={webR + 3} y2={top - 15} label={dimLabel("t", t, metric)} orientation="horizontal" />
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
    case "SHS":
    case "RHS":
      return <SHSRHSSvg profile={profile} width={width} height={height} />;
    case "CHS":
      return <CHSSvg profile={profile} width={width} height={height} />;
    case "CF-C":
      return <CFCSvg profile={profile} width={width} height={height} />;
    case "CF-Z":
      return <CFZSvg profile={profile} width={width} height={height} />;
  }
}
