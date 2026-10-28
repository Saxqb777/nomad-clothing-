"use client";

import { memo, useId, useMemo } from "react";
import type { ColourwayId, GarmentType, PrintId } from "@/lib/data/types";
import { COLOURWAYS } from "@/lib/data/colourways";
import { SHAPES, HANGER, VIEW_W, VIEW_H, cubic } from "./shapes";
import { mixHex, rng } from "@/lib/utils";
import { PRINTS } from "./prints";

export type PrintMode = "ink" | "glow";

export interface GarmentProps {
  garment: GarmentType;
  colourway: ColourwayId;
  print: PrintId;
  side?: "front" | "back";
  /** 0..1 ageing factor (see ageFactor). */
  age?: number;
  /** Lower-cost render for the rail: fewer filter octaves. */
  quality?: "rail" | "full";
  seed?: number;
  mode?: PrintMode;
  className?: string;
  style?: React.CSSProperties;
  /** Hide the hanger (for the merch table flat-lay). */
  noHanger?: boolean;
}

/** Table for feComponentTransfer: 1 everywhere, with a dip near 0.5 that widens with age. */
function crackTable(age: number, n = 49) {
  const half = Math.max(0, Math.round(age * 2.4 - 0.3));
  const centre = (n - 1) / 2;
  const vals: number[] = [];
  for (let i = 0; i < n; i++) {
    const d = Math.abs(i - centre);
    vals.push(age > 0.06 && d <= half ? 0 : 1);
  }
  return vals.join(" ");
}

function GarmentImpl({
  garment,
  colourway,
  print,
  side = "front",
  age = 0,
  quality = "full",
  seed = 1,
  mode = "ink",
  className,
  style,
  noHanger,
}: GarmentProps) {
  const uid = useId().replace(/[:]/g, "");
  const shape = SHAPES[garment];
  const cw = COLOURWAYS[colourway];
  const Print = PRINTS[print];

  const fabric = mixHex(cw.fresh, cw.washed, age);
  const fabricEdge = mixHex(fabric, "#000000", 0.28);
  const isDark = cw.base === "dark";

  // Wear details, deterministic per garment.
  const wear = useMemo(() => {
    const r = rng(seed * 7919 + 13);
    const threads = Array.from({ length: 16 }, () => {
      const t = r();
      const [x, y] = cubic(shape.neckline, t);
      const ang = -Math.PI / 2 + (r() - 0.5) * 2.2;
      const len = 2.5 + r() * 4.5;
      return { x, y, ang, len, at: r() };
    });
    const hemThreads = Array.from({ length: 6 }, () => {
      const x = 90 + r() * 120;
      return { x, y: 350 + (r() - 0.5) * 2, len: 2 + r() * 4, ang: Math.PI / 2 + (r() - 0.5) * 1.2, at: r() };
    });
    const pinholes = [
      { x: 110 + r() * 80, y: 190 + r() * 120, r: 1.5 + r() * 0.8, at: 0.35 },
      { x: 90 + r() * 120, y: 170 + r() * 150, r: 1.3 + r() * 0.8, at: 0.62 },
      { x: 100 + r() * 100, y: 260 + r() * 70, r: 2.2 + r() * 0.9, at: 0.84 },
    ];
    return { threads, hemThreads, pinholes, seedA: Math.floor(r() * 999), seedB: Math.floor(r() * 999) };
  }, [seed, shape]);

  const box = side === "front" ? shape.front : shape.back;
  const printOpacity = 1 - age * 0.38;
  const flakeThreshold = age < 0.12 ? 1.2 : 0.8 - (age - 0.12) * 0.2; // keep where noise alpha < threshold; lower = more flaking
  const octaves = quality === "rail" ? 2 : 3;

  const ids = {
    clip: `c${uid}`,
    grain: `g${uid}`,
    soft: `s${uid}`,
    softer: `ss${uid}`,
    crack: `k${uid}`,
    mask: `m${uid}`,
    side: `sd${uid}`,
    chest: `ch${uid}`,
    chrome: `cr${uid}`,
    glow: `gl${uid}`,
  };

  const glowOnly = mode === "glow";

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      height="100%"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={ids.clip}>
          <path d={shape.body} />
        </clipPath>
        {!glowOnly && (
          <>
            <filter id={ids.grain} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="1.6 0.35" numOctaves={octaves} seed={wear.seedA} result="n" />
              <feColorMatrix in="n" type="saturate" values="0" result="g" />
              <feComponentTransfer in="g">
                <feFuncA type="linear" slope={0.42 + age * 0.3} intercept={-0.08} />
              </feComponentTransfer>
            </filter>
            <filter id={ids.soft} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <filter id={ids.softer} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
            <filter id={ids.crack} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.11 0.13" numOctaves={octaves} seed={wear.seedB} result="cr" />
              <feComponentTransfer in="cr" result="crack">
                <feFuncR type="table" tableValues="1 1" />
                <feFuncG type="table" tableValues="1 1" />
                <feFuncB type="table" tableValues="1 1" />
                <feFuncA type="table" tableValues={crackTable(age)} />
              </feComponentTransfer>
              <feTurbulence type="fractalNoise" baseFrequency="0.08 0.1" numOctaves={2} seed={wear.seedA + 7} result="fl" />
              <feComponentTransfer in="fl" result="flake">
                <feFuncR type="table" tableValues="1 1" />
                <feFuncG type="table" tableValues="1 1" />
                <feFuncB type="table" tableValues="1 1" />
                <feFuncA type="linear" slope={-26} intercept={26 * flakeThreshold} />
              </feComponentTransfer>
              <feComposite in="crack" in2="flake" operator="in" />
            </filter>
            <mask id={ids.mask} maskUnits="userSpaceOnUse" x={box.x - 4} y={box.y - 4} width={box.w + 8} height={box.h + 8}>
              <rect x={box.x - 4} y={box.y - 4} width={box.w + 8} height={box.h + 8} fill="#fff" filter={`url(#${ids.crack})`} />
            </mask>
            <linearGradient id={ids.side} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity={isDark ? 0.14 : 0.3} />
              <stop offset="0.32" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.7" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity={isDark ? 0.22 : 0.16} />
            </linearGradient>
            <radialGradient id={ids.chest} cx="0.5" cy="0.32" r="0.55">
              <stop offset="0" stopColor="#fff" stopOpacity={isDark ? 0.1 : 0.22} />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={ids.chrome} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#f2f2f2" />
              <stop offset="0.45" stopColor="#9c9c9c" />
              <stop offset="0.55" stopColor="#6f6f6f" />
              <stop offset="1" stopColor="#c9c9c9" />
            </linearGradient>
          </>
        )}
        {glowOnly && (
          <filter id={ids.glow} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {glowOnly ? (
        <g filter={`url(#${ids.glow})`} opacity={0.95 - age * 0.35}>
          <g transform={`translate(${box.x} ${box.y})`}>
            <Print w={box.w} h={box.h} base={cw.base} side={side} mode="glow" />
          </g>
        </g>
      ) : (
        <>
          {/* soft cast shadow on the backdrop */}
          <path d={shape.body} fill="#000" opacity="0.16" transform="translate(3 7)" filter={`url(#${ids.softer})`} />

          {/* hanger: shoulders sit inside the garment */}
          {!noHanger && (
            <g fill="none" stroke={`url(#${ids.chrome})`} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d={HANGER.shoulders} strokeWidth="2.2" />
              <path d={HANGER.hook} />
              <circle cx="150" cy="32" r="2.4" fill="#8a8a8a" stroke="none" />
            </g>
          )}

          {/* fabric */}
          <path d={shape.body} fill={fabric} style={{ transition: "fill 420ms ease" }} />

          <g clipPath={`url(#${ids.clip})`}>
            <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill={`url(#${ids.side})`} />
            <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill={`url(#${ids.chest})`} />

            {/* folds & occlusion, blurred once as a group */}
            <g filter={`url(#${ids.soft})`}>
              {shape.folds.map((f, i) => (
                <rect
                  key={i}
                  x={f.x - f.w / 2}
                  y={f.y0}
                  width={f.w}
                  height={f.y1 - f.y0}
                  fill={f.dark ? "#000" : "#fff"}
                  opacity={f.dark ? (isDark ? 0.16 : 0.08) : isDark ? 0.07 : 0.14}
                />
              ))}
              {/* under the collar */}
              <ellipse cx="150" cy="84" rx="52" ry="11" fill="#000" opacity={isDark ? 0.22 : 0.12} />
              {/* armpits */}
              <ellipse cx="92" cy="146" rx="18" ry="9" fill="#000" opacity={isDark ? 0.24 : 0.14} />
              <ellipse cx="208" cy="146" rx="18" ry="9" fill="#000" opacity={isDark ? 0.24 : 0.14} />
              {/* hanger shoulder ridge showing through the fabric */}
              <path d="M62 70 L150 36 L238 70" fill="none" stroke="#fff" strokeWidth="5" opacity={isDark ? 0.08 : 0.16} />
              <path d="M62 76 L150 42 L238 76" fill="none" stroke="#000" strokeWidth="6" opacity={isDark ? 0.12 : 0.07} />
              {/* hem roll */}
              <path d={shape.hem} fill="none" stroke="#000" strokeWidth="6" opacity={isDark ? 0.14 : 0.08} />
            </g>

            {/* the print */}
            <g mask={`url(#${ids.mask})`} opacity={printOpacity} style={{ transition: "opacity 300ms ease" }}>
              <g transform={`translate(${box.x} ${box.y})`}>
                <Print w={box.w} h={box.h} base={cw.base} side={side} mode="ink" />
              </g>
            </g>

            {/* jersey grain over everything, including the ink */}
            <rect
              x="0"
              y="0"
              width={VIEW_W}
              height={VIEW_H}
              filter={`url(#${ids.grain})`}
              style={{ mixBlendMode: "soft-light" }}
              opacity={0.8 + age * 0.2}
            />

            {/* inner edge occlusion */}
            <path d={shape.body} fill="none" stroke="#000" strokeWidth="7" opacity={isDark ? 0.3 : 0.18} filter={`url(#${ids.soft})`} />

            {/* pinholes */}
            {wear.pinholes
              .filter((p) => age >= p.at)
              .map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={p.r + 0.8} fill="#000" opacity="0.35" />
                  <circle cx={p.x} cy={p.y} r={p.r} style={{ fill: "var(--pinhole, #f1f0ec)" }} />
                </g>
              ))}
          </g>

          {/* collar: back inside, then the ribbed band */}
          <path d={shape.collarBack} fill={mixHex(fabric, isDark ? "#ffffff" : "#000000", 0.14)} style={{ transition: "fill 420ms ease" }} />
          <path d={shape.collarBand} fill={mixHex(fabric, "#000000", isDark ? 0.18 : 0.08)} style={{ transition: "fill 420ms ease" }} />
          <path
            d={shape.collarBand}
            fill="none"
            stroke={isDark ? "#fff" : "#000"}
            strokeWidth="0.6"
            strokeDasharray="1 2.2"
            opacity={0.25}
          />

          {/* seams */}
          <g fill="none" stroke={cw.thread} strokeWidth="0.9" strokeDasharray="2.2 1.6" opacity="0.65">
            {shape.seams.map((d, i) => (
              <path key={i} d={d} />
            ))}
            <path d={shape.hem} />
          </g>

          {/* fray: loose threads at the neckline and hem */}
          {age > 0.08 && (
            <g stroke={mixHex(fabric, isDark ? "#ffffff" : "#000000", 0.35)} strokeWidth="0.8" strokeLinecap="round" opacity="0.9">
              {wear.threads
                .filter((t) => t.at < age * 1.1)
                .map((t, i) => (
                  <path key={i} d={`M${t.x} ${t.y} l${Math.round(Math.cos(t.ang) * 1e4) / 1e4 * t.len} ${Math.round(Math.sin(t.ang) * 1e4) / 1e4 * t.len}`} />
                ))}
              {wear.hemThreads
                .filter((t) => t.at < age * 0.9)
                .map((t, i) => (
                  <path key={`h${i}`} d={`M${t.x} ${t.y} l${Math.round(Math.cos(t.ang) * 1e4) / 1e4 * t.len} ${Math.round(Math.sin(t.ang) * 1e4) / 1e4 * t.len}`} />
                ))}
            </g>
          )}
          {/* fabric edge thickness hint */}
          <path d={shape.body} fill="none" stroke={fabricEdge} strokeWidth="0.8" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

export const Garment = memo(GarmentImpl);
