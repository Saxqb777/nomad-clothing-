"use client";

import { useId } from "react";
import type { PrintId } from "@/lib/data/types";
import { BAND_BY_ID } from "@/lib/data/bands";

export interface PrintProps {
  w: number;
  h: number;
  base: "dark" | "light";
  side: "front" | "back";
  mode: "ink" | "glow";
}

export type PrintComponent = (p: PrintProps) => React.ReactNode;

export const PHOSPHOR = "#c8ffb4";

export const F = {
  metal: "'Metal Mania', 'Impact', sans-serif",
  pirata: "'Pirata One', 'Georgia', serif",
  monoton: "'Monoton', 'Impact', sans-serif",
  rocksalt: "'Rock Salt', 'Comic Sans MS', cursive",
  bangers: "'Bangers', 'Impact', sans-serif",
  elite: "'Special Elite', 'Courier New', monospace",
  rye: "'Rye', 'Georgia', serif",
  abril: "'Abril Fatface', 'Georgia', serif",
  rubik: "'Rubik Mono One', 'Impact', sans-serif",
  cormorant: "'Cormorant Garamond', 'Georgia', serif",
  courier: "var(--font-courier), 'Courier New', monospace",
  archivo: "var(--font-archivo), 'Archivo', sans-serif",
  display: "var(--font-bricolage), 'Bricolage Grotesque', sans-serif",
};

export function usePid() {
  return useId().replace(/[:]/g, "");
}

/** Text on an arc. up = text bulges upward. */
export function Arc({
  cx,
  cy,
  r,
  text,
  up = true,
  font,
  size,
  fill,
  weight,
  spacing = 0,
  stroke,
  strokeWidth,
  style,
}: {
  cx: number;
  cy: number;
  r: number;
  text: string;
  up?: boolean;
  font: string;
  size: number;
  fill: string;
  weight?: number | string;
  spacing?: number;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  const id = usePid();
  const d = up
    ? `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
    : `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`;
  return (
    <>
      <defs>
        <path id={`arc${id}`} d={d} />
      </defs>
      <text
        fontFamily={font}
        fontSize={size}
        fill={fill}
        fontWeight={weight}
        letterSpacing={spacing}
        stroke={stroke}
        strokeWidth={strokeWidth}
        paintOrder="stroke"
        style={style}
      >
        <textPath href={`#arc${id}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
    </>
  );
}

/**
 * The back of a tour tee: tour name, year and the date list.
 * Each band passes its own face and ink so the backs feel period-correct.
 */
export function TourBack({
  w,
  h,
  print,
  ink,
  accent,
  titleFont,
  titleSize = 20,
  titleWeight,
  titleSpacing = 0,
  listFont = F.courier,
  listSize = 6.4,
  uppercase = true,
  rule = true,
  style,
}: {
  w: number;
  h: number;
  print: PrintId;
  ink: string;
  accent: string;
  titleFont: string;
  titleSize?: number;
  titleWeight?: number | string;
  titleSpacing?: number;
  listFont?: string;
  listSize?: number;
  uppercase?: boolean;
  rule?: boolean;
  style?: React.CSSProperties;
}) {
  const band = BAND_BY_ID[print];
  const title = uppercase ? band.tour.toUpperCase() : band.tour;
  const pair = listSize * 2.15;
  const listTop = 66;
  return (
    <g style={style}>
      <text x={w / 2} y={22} textAnchor="middle" fontFamily={F.courier} fontSize="7" fill={accent} letterSpacing="2.4">
        {band.name.toUpperCase()}
      </text>
      <text
        x={w / 2}
        y={44}
        textAnchor="middle"
        fontFamily={titleFont}
        fontSize={titleSize}
        fontWeight={titleWeight}
        fill={ink}
        letterSpacing={titleSpacing}
        textLength={Math.min(w - 4, title.length * titleSize * 0.62)}
        lengthAdjust="spacingAndGlyphs"
      >
        {title}
      </text>
      {rule && <line x1={10} x2={w - 10} y1={54} y2={54} stroke={accent} strokeWidth="1.2" />}
      {band.dates.map((d, i) => (
        <g key={i} fontFamily={listFont} fontSize={listSize} fill={ink}>
          <text x={10} y={listTop + i * pair}>
            {d.date}
          </text>
          <text x={46} y={listTop + i * pair} fontWeight="700">
            {d.city.toUpperCase()}
          </text>
          <text x={46} y={listTop + i * pair + listSize * 1.05} fontSize={listSize * 0.86} fill={accent} opacity="0.95">
            {d.venue.toUpperCase()}
          </text>
        </g>
      ))}
      <text x={w / 2} y={h - 6} textAnchor="middle" fontFamily={F.courier} fontSize="6.5" fill={accent} letterSpacing="1.6">
        {`${band.year} · CREW ONLY`}
      </text>
    </g>
  );
}

/** Trig rounded to a micro-unit so server and client serialise identically. */
export const cos = (a: number) => Math.round(Math.cos(a) * 1e6) / 1e6;
export const sin = (a: number) => Math.round(Math.sin(a) * 1e6) / 1e6;
