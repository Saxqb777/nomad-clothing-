"use client";

import { Arc, F, PHOSPHOR, TourBack, usePid, type PrintComponent, cos, sin } from "./common";

/* ── Velvet Static · shoegaze 1993 ─────────────────────────── */
export const VelvetStatic: PrintComponent = ({ w, h, base, side, mode }) => {
  const id = usePid();
  const ink = base === "dark" ? "#efe9dc" : "#262433";
  const accent = base === "dark" ? "#8fc4c0" : "#3f7f7b";
  if (mode === "glow") return null;
  if (side === "back")
    return (
      <TourBack w={w} h={h} print="velvet-static" ink={ink} accent={accent} titleFont={F.cormorant} titleSize={24} titleWeight={600} titleSpacing={1} uppercase={false} style={{ fontStyle: "italic" }} />
    );
  const cx = w / 2;
  return (
    <g>
      <defs>
        <filter id={`haze${id}`} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
        <filter id={`static${id}`} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.08" numOctaves="2" seed="21" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="1.4" intercept="-0.45" />
          </feComponentTransfer>
        </filter>
        <clipPath id={`band${id}`}>
          <rect x={6} y={h * 0.42} width={w - 12} height={h * 0.2} />
        </clipPath>
      </defs>
      <rect x={6} y={6} width={w - 12} height={h - 12} fill="none" stroke={ink} strokeWidth="0.8" opacity="0.7" />
      <g clipPath={`url(#band${id})`}>
        <rect x={6} y={h * 0.42} width={w - 12} height={h * 0.2} fill={accent} opacity="0.55" />
        <rect x={6} y={h * 0.42} width={w - 12} height={h * 0.2} fill={ink} filter={`url(#static${id})`} opacity="0.9" />
      </g>
      <text x={cx} y={h * 0.36} textAnchor="middle" fontFamily={F.cormorant} fontStyle="italic" fontWeight="600" fontSize="34" fill={ink} filter={`url(#haze${id})`} opacity="0.75">
        velvet
      </text>
      <text x={cx} y={h * 0.36} textAnchor="middle" fontFamily={F.cormorant} fontStyle="italic" fontWeight="600" fontSize="34" fill={ink}>
        velvet
      </text>
      <text x={cx} y={h * 0.78} textAnchor="middle" fontFamily={F.cormorant} fontStyle="italic" fontWeight="600" fontSize="34" fill={ink} filter={`url(#haze${id})`} opacity="0.75">
        static
      </text>
      <text x={cx} y={h * 0.78} textAnchor="middle" fontFamily={F.cormorant} fontStyle="italic" fontWeight="600" fontSize="34" fill={ink}>
        static
      </text>
      <text x={cx} y={h - 14} textAnchor="middle" fontFamily={F.courier} fontSize="6.5" fill={accent} letterSpacing="3">
        LOW SIGNAL · 1993
      </text>
    </g>
  );
};

/* ── Dust Coyote · desert rock 1988 ────────────────────────── */
const COYOTE =
  "M6 70 C2 62 4 54 12 50 C14 42 20 36 30 36 L52 30 L60 20 L66 12 L78 4 L82 8 L74 16 L76 22 L70 26 L66 24 L60 40 L58 72 L52 72 L52 46 L40 48 L36 72 L28 72 L30 58 L18 62 L14 72 L8 72 Z";

export const DustCoyote: PrintComponent = ({ w, h, base, side, mode }) => {
  const id = usePid();
  const rust = base === "dark" ? "#d2672c" : "#a9471a";
  const cream = base === "dark" ? "#f1dfb6" : "#2e1c10";
  const line = base === "dark" ? "#1a120c" : "#2e1c10";
  if (mode === "glow") return null;
  if (side === "back") return <TourBack w={w} h={h} print="dust-coyote" ink={cream} accent={rust} titleFont={F.rye} titleSize={17} />;
  const cx = w / 2;
  const sunR = w * 0.3;
  const sunY = h * 0.5;
  return (
    <g>
      <defs>
        <clipPath id={`sun${id}`}>
          <circle cx={cx} cy={sunY} r={sunR} />
        </clipPath>
      </defs>
      {/* rays */}
      <g stroke={rust} strokeWidth="1.6" opacity="0.9">
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const r1 = sunR + 4;
          const r2 = sunR + 10 + (i % 2) * 8;
          return <line key={i} x1={cx + cos(a) * r1} y1={sunY + sin(a) * r1} x2={cx + cos(a) * r2} y2={sunY + sin(a) * r2} />;
        })}
      </g>
      <circle cx={cx} cy={sunY} r={sunR} fill={rust} />
      <circle cx={cx} cy={sunY} r={sunR} fill="none" stroke={cream} strokeWidth="1.4" />
      {/* mesa horizon inside the sun */}
      <g clipPath={`url(#sun${id})`}>
        <path d={`M${cx - sunR} ${sunY + 10} L${cx - sunR + 14} ${sunY + 8} L${cx - 10} ${sunY + 8} L${cx - 4} ${sunY + 2} L${cx + 10} ${sunY + 2} L${cx + 16} ${sunY + 8} L${cx + sunR} ${sunY + 8} L${cx + sunR} ${sunY + sunR} L${cx - sunR} ${sunY + sunR} Z`} fill={line} />
        <g transform={`translate(${cx - 22} ${sunY - 30}) scale(0.5)`}>
          <path d={COYOTE} fill={line} />
        </g>
      </g>
      <Arc cx={cx} cy={sunY + 4} r={sunR + 24} text="DUST COYOTE" font={F.rye} size={17} fill={cream} spacing={1} />
      <Arc cx={cx} cy={sunY - 6} r={sunR + 24} text="MOJAVE NIGHTS" font={F.rye} size={11} fill={cream} up={false} spacing={2} />
      <text x={cx} y={h - 6} textAnchor="middle" fontFamily={F.courier} fontSize="7" fill={cream} letterSpacing="2">
        1988
      </text>
    </g>
  );
};

/* ── The Paper Saints · post-punk 1981 ─────────────────────── */
export const PaperSaints: PrintComponent = ({ w, h, base, side, mode }) => {
  const scrap = base === "dark" ? "#efe9d9" : "#161616";
  const letter = base === "dark" ? "#161616" : "#efe9d9";
  const ink = base === "dark" ? "#efe9d9" : "#161616";
  if (mode === "glow") return null;
  if (side === "back") return <TourBack w={w} h={h} print="paper-saints" ink={ink} accent={ink} titleFont={F.elite} titleSize={17} listFont={F.elite} />;
  const cx = w / 2;
  const word1 = "THE PAPER";
  const word2 = "SAINTS";
  const cell = w / 10;
  const tilt = [-6, 4, -3, 7, -5, 2, 6, -4, 3, -7, 5, -2];
  const row = (text: string, y: number, i0: number) => (
    <g>
      {text.split("").map((ch, i) => {
        if (ch === " ") return null;
        const x = cx - (text.length * cell) / 2 + i * cell + cell / 2;
        const t = tilt[(i + i0) % tilt.length];
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${t})`}>
            <path d={`M${-cell / 2 + 1} -9 L${cell / 2 - 1} -8 L${cell / 2 - 2} 9 L${-cell / 2 + 2} 8 Z`} fill={scrap} />
            <text x="0" y="5" textAnchor="middle" fontFamily={F.elite} fontSize="14" fill={letter}>
              {ch}
            </text>
          </g>
        );
      })}
    </g>
  );
  return (
    <g>
      {/* halo: dashed concentric rings */}
      {[14, 22, 30].map((r, i) => (
        <circle key={r} cx={cx} cy={h * 0.4} r={r} fill="none" stroke={ink} strokeWidth="1" strokeDasharray={i === 1 ? "2 3" : "1 2"} opacity="0.8" />
      ))}
      {/* the saint: a tall figure, circle head */}
      <circle cx={cx} cy={h * 0.4} r="6" fill={ink} />
      <rect x={cx - 3} y={h * 0.4 + 8} width="6" height="26" fill={ink} />
      <path d={`M${cx - 12} ${h * 0.4 + 36} L${cx + 12} ${h * 0.4 + 36} L${cx + 9} ${h * 0.4 + 12} L${cx - 9} ${h * 0.4 + 12} Z`} fill={ink} opacity="0.85" />
      {row(word1, h * 0.14, 0)}
      {row(word2, h * 0.82, 5)}
      <text x={cx} y={h - 4} textAnchor="middle" fontFamily={F.elite} fontSize="7" fill={ink} letterSpacing="2">
        CUT &amp; PASTE 1981
      </text>
    </g>
  );
};

/* ── Hollow Kings · thrash 1986 ────────────────────────────── */
const SKULL = "M40 4 C62 4 76 20 76 42 C76 56 68 64 60 66 L58 80 C58 86 50 88 40 88 C30 88 22 86 22 80 L20 66 C12 64 4 56 4 42 C4 20 18 4 40 4 Z";
export const HollowKings: PrintComponent = ({ w, h, base, side, mode }) => {
  const bone = base === "dark" ? "#e9e2d1" : "#141414";
  const blood = "#b3261e";
  const dark = base === "dark" ? "#141414" : "#e9e2d1";
  const cx = w / 2;
  const sy = h * 0.3;
  if (side === "back") {
    if (mode === "glow") return null;
    return <TourBack w={w} h={h} print="hollow-kings" ink={bone} accent={blood} titleFont={F.metal} titleSize={20} titleSpacing={1} />;
  }
  if (mode === "glow") {
    return (
      <g transform={`translate(${cx - 40} ${sy}) `}>
        <ellipse cx="27" cy="40" rx="9" ry="10" fill={PHOSPHOR} />
        <ellipse cx="53" cy="40" rx="9" ry="10" fill={PHOSPHOR} />
        {[18, 40, 62].map((x, i) => (
          <circle key={i} cx={x} cy={[-14, -20, -14][i]} r="3" fill={PHOSPHOR} />
        ))}
      </g>
    );
  }
  return (
    <g>
      <g transform={`translate(${cx - 40} ${sy})`}>
        {/* crown */}
        <path d="M12 6 L18 -14 L30 -2 L40 -20 L50 -2 L62 -14 L68 6 Z" fill={blood} stroke={bone} strokeWidth="1.5" strokeLinejoin="round" />
        {[18, 40, 62].map((x, i) => (
          <circle key={i} cx={x} cy={[-14, -20, -14][i]} r="3" fill={bone} />
        ))}
        {/* skull */}
        <path d={SKULL} fill={bone} stroke={dark} strokeWidth="1.2" />
        <ellipse cx="27" cy="40" rx="9" ry="10" fill={dark} />
        <ellipse cx="53" cy="40" rx="9" ry="10" fill={dark} />
        <path d="M40 50 L34 62 L46 62 Z" fill={dark} />
        <path d="M27 68 L30 76 L35 68 L40 77 L45 68 L50 76 L53 68" fill="none" stroke={dark} strokeWidth="1.3" />
        {[28, 34, 40, 46, 52].map((x) => (
          <line key={x} x1={x} y1="72" x2={x} y2="84" stroke={dark} strokeWidth="1.1" />
        ))}
        <path d="M10 30 L16 36 L12 44 L18 50" fill="none" stroke={dark} strokeWidth="1" />
        <path d="M70 28 L64 34 L68 42 L62 48" fill="none" stroke={dark} strokeWidth="1" />
      </g>
      {/* logo */}
      <text x={cx} y={h * 0.78} textAnchor="middle" fontFamily={F.metal} fontSize="30" fill={bone} stroke={dark} strokeWidth="1.2" paintOrder="stroke" textLength={w - 8} lengthAdjust="spacingAndGlyphs">
        HOLLOW
      </text>
      <text x={cx} y={h * 0.78 + 26} textAnchor="middle" fontFamily={F.metal} fontSize="30" fill={blood} stroke={dark} strokeWidth="1.2" paintOrder="stroke" textLength={w - 36} lengthAdjust="spacingAndGlyphs">
        KINGS
      </text>
      {/* lightning cracks */}
      <path d={`M8 ${h * 0.5} L20 ${h * 0.56} L14 ${h * 0.6} L26 ${h * 0.68}`} fill="none" stroke={blood} strokeWidth="1.6" strokeLinejoin="round" />
      <path d={`M${w - 8} ${h * 0.5} L${w - 20} ${h * 0.56} L${w - 14} ${h * 0.6} L${w - 26} ${h * 0.68}`} fill="none" stroke={blood} strokeWidth="1.6" strokeLinejoin="round" />
    </g>
  );
};
