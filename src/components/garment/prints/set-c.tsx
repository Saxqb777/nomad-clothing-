"use client";

import { Arc, F, PHOSPHOR, TourBack, type PrintComponent, cos, sin } from "./common";

/* ── Glass Harbour · dream pop 1987 ────────────────────────── */
export const GlassHarbour: PrintComponent = ({ w, h, base, side, mode }) => {
  const pale = base === "dark" ? "#c4e5f5" : "#1c3a5a";
  const white = base === "dark" ? "#f6fbff" : "#4e86b0";
  const cx = w / 2;
  const top = h * 0.14;
  const baseY = h * 0.72;
  const beam = (fill: string, opacity = 1) => (
    <g fill={fill} opacity={opacity}>
      <path d={`M${cx - 6} ${top + 10} L${8} ${top - 6} L${8} ${top + 26} Z`} />
      <path d={`M${cx + 6} ${top + 10} L${w - 8} ${top - 6} L${w - 8} ${top + 26} Z`} />
    </g>
  );
  if (side === "back") {
    if (mode === "glow") return null;
    return <TourBack w={w} h={h} print="glass-harbour" ink={pale} accent={white} titleFont={F.archivo} titleSize={15} titleSpacing={3} style={{ fontVariationSettings: "'wdth' 125" }} />;
  }
  if (mode === "glow") return beam(PHOSPHOR, 0.9);
  return (
    <g>
      {beam(white, 0.35)}
      {/* lighthouse */}
      <path d={`M${cx - 11} ${baseY} L${cx - 7} ${top + 18} L${cx + 7} ${top + 18} L${cx + 11} ${baseY} Z`} fill={pale} />
      {[0.25, 0.5, 0.75].map((t) => (
        <path key={t} d={`M${cx - 11 + 4 * t} ${baseY - (baseY - top - 18) * t} h${22 - 8 * t} v6 h-${22 - 8 * t} Z`} fill={white} opacity="0.9" />
      ))}
      <rect x={cx - 9} y={top + 8} width="18" height="10" fill={white} />
      <rect x={cx - 6} y={top + 2} width="12" height="8" fill={pale} />
      <path d={`M${cx - 8} ${top + 2} L${cx} ${top - 6} L${cx + 8} ${top + 2} Z`} fill={pale} />
      {/* rocks + tideline */}
      <path d={`M${cx - 30} ${baseY} q10 -8 24 -3 q10 -6 20 0 q8 -5 16 3 Z`} fill={pale} />
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M6 ${baseY + 8 + k * 7} q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0`} fill="none" stroke={pale} strokeWidth="1.2" opacity={1 - k * 0.25} />
      ))}
      <text x={cx} y={h - 8} textAnchor="middle" fontFamily={F.archivo} fontSize="12" fill={pale} letterSpacing="4" style={{ fontVariationSettings: "'wdth' 125", fontWeight: 700 }} textLength={w - 6} lengthAdjust="spacingAndGlyphs">
        GLASS HARBOUR
      </text>
    </g>
  );
};

/* ── Copper Hymnal · gospel-soul rock 1972 ─────────────────── */
export const CopperHymnal: PrintComponent = ({ w, h, base, side, mode }) => {
  const copper = base === "dark" ? "#d08546" : "#8a4a1c";
  const cream = base === "dark" ? "#f4e6c8" : "#3b2416";
  if (mode === "glow") return null;
  if (side === "back") return <TourBack w={w} h={h} print="copper-hymnal" ink={cream} accent={copper} titleFont={F.abril} titleSize={22} uppercase={false} />;
  const cx = w / 2;
  const cy = h * 0.5;
  const r = w * 0.2;
  return (
    <g>
      {/* rays */}
      <g stroke={copper} strokeWidth="2" strokeLinecap="round">
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const r1 = r + 10;
          const r2 = r + 22 + (i % 2) * 10;
          return <line key={i} x1={cx + cos(a) * r1} y1={cy + sin(a) * r1} x2={cx + cos(a) * r2} y2={cy + sin(a) * r2} />;
        })}
      </g>
      {/* tambourine */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={copper} strokeWidth="5" />
      <circle cx={cx} cy={cy} r={r - 6} fill={cream} opacity="0.9" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.2;
        return <circle key={i} cx={cx + cos(a) * r} cy={cy + sin(a) * r} r="3.2" fill={cream} stroke={copper} strokeWidth="1" />;
      })}
      <text x={cx} y={cy + 4} textAnchor="middle" fontFamily={F.abril} fontSize="12" fill={copper}>
        1972
      </text>
      <Arc cx={cx} cy={cy + 2} r={w * 0.42} text="COPPER" font={F.abril} size={21} fill={cream} spacing={2} />
      <Arc cx={cx} cy={cy - 4} r={w * 0.42} text="HYMNAL" font={F.abril} size={21} fill={cream} up={false} spacing={2} />
      {/* banner */}
      <path d={`M${cx - 34} ${h - 18} l68 0 l-5 7 l5 7 l-68 0 l5 -7 Z`} fill={copper} />
      <text x={cx} y={h - 7} textAnchor="middle" fontFamily={F.courier} fontSize="7.5" fill={cream} letterSpacing="2.5">
        REVIVAL
      </text>
    </g>
  );
};

/* ── Lantern Youth · midwest emo 2002 ──────────────────────── */
export const LanternYouth: PrintComponent = ({ w, h, base, side, mode }) => {
  const ink = base === "dark" ? "#f0efe8" : "#1c1c1c";
  if (mode === "glow") return null;
  if (side === "back") return <TourBack w={w} h={h} print="lantern-youth" ink={ink} accent={ink} titleFont={F.courier} titleSize={16} uppercase={false} rule={false} listSize={6.8} />;
  const cx = w / 2;
  const cy = h * 0.4;
  return (
    <g fill="none" stroke={ink} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
      {/* hanging lantern */}
      <line x1={cx} y1={cy - 46} x2={cx} y2={cy - 30} />
      <path d={`M${cx - 10} ${cy - 30} h20`} />
      <path d={`M${cx - 14} ${cy - 22} h28 l-3 -8 h-22 Z`} />
      <path d={`M${cx - 13} ${cy - 22} l-2 30 h30 l-2 -30`} />
      <path d={`M${cx - 15} ${cy + 8} h30 l-3 6 h-24 Z`} />
      <line x1={cx - 6} y1={cy - 22} x2={cx - 7} y2={cy + 8} />
      <line x1={cx + 6} y1={cy - 22} x2={cx + 7} y2={cy + 8} />
      <path d={`M${cx} ${cy - 10} q-4 6 0 12 q4 -6 0 -12 Z`} fill={ink} stroke="none" />
      <text x={cx} y={h * 0.74} textAnchor="middle" fontFamily={F.courier} fontSize="13" fill={ink} stroke="none" letterSpacing="1">
        lantern youth
      </text>
      <text x={cx} y={h * 0.74 + 14} textAnchor="middle" fontFamily={F.courier} fontSize="7" fill={ink} stroke="none" letterSpacing="1.2" opacity="0.85">
        basement tour 2002
      </text>
    </g>
  );
};

/* ── Pale Radio · college rock 1989 ────────────────────────── */
export const PaleRadio: PrintComponent = ({ w, h, base, side, mode }) => {
  const grey = base === "dark" ? "#e2e0d8" : "#222";
  const orange = base === "dark" ? "#f4713a" : "#c6481a";
  if (mode === "glow") return null;
  if (side === "back") return <TourBack w={w} h={h} print="pale-radio" ink={grey} accent={orange} titleFont={F.rubik} titleSize={13} />;
  const cx = w / 2;
  const top = h * 0.12;
  const baseY = h * 0.62;
  return (
    <g>
      {/* broadcast arcs */}
      {[10, 18, 26].map((r, i) => (
        <path key={r} d={`M${cx - r} ${top + 2} a${r} ${r} 0 0 1 ${2 * r} 0`} fill="none" stroke={orange} strokeWidth="1.6" opacity={1 - i * 0.25} />
      ))}
      {/* tower lattice */}
      <g stroke={grey} strokeWidth="1.5" fill="none">
        <path d={`M${cx - 16} ${baseY} L${cx} ${top + 4} L${cx + 16} ${baseY}`} />
        {[0.2, 0.4, 0.6, 0.8].map((t) => {
          const y = top + 4 + (baseY - top - 4) * t;
          const half = 16 * t;
          return <line key={t} x1={cx - half} y1={y} x2={cx + half} y2={y} />;
        })}
        {[0.2, 0.4, 0.6].map((t) => {
          const y1 = top + 4 + (baseY - top - 4) * t;
          const y2 = top + 4 + (baseY - top - 4) * (t + 0.2);
          return <path key={t} d={`M${cx - 16 * t} ${y1} L${cx + 16 * (t + 0.2)} ${y2} M${cx + 16 * t} ${y1} L${cx - 16 * (t + 0.2)} ${y2}`} />;
        })}
      </g>
      <text x={cx} y={h * 0.78} textAnchor="middle" fontFamily={F.rubik} fontSize="20" fill={grey} textLength={w - 10} lengthAdjust="spacingAndGlyphs">
        PALE
      </text>
      <text x={cx} y={h * 0.78 + 22} textAnchor="middle" fontFamily={F.rubik} fontSize="20" fill={orange} textLength={w - 10} lengthAdjust="spacingAndGlyphs">
        RADIO
      </text>
      <text x={cx} y={h - 2} textAnchor="middle" fontFamily={F.courier} fontSize="6.5" fill={grey} letterSpacing="2.5">
        DEAD AIR · 1989
      </text>
    </g>
  );
};
