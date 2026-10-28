"use client";

import { Arc, F, PHOSPHOR, TourBack, usePid, type PrintComponent, cos, sin } from "./common";

/* ── Neon Mirage · synthpop 1984 ───────────────────────────── */
export const NeonMirage: PrintComponent = ({ w, h, base, side, mode }) => {
  const id = usePid();
  const pink = base === "dark" ? "#ff62a8" : "#b8175f";
  const cyan = base === "dark" ? "#5de4ff" : "#0b7a8c";
  const lemon = base === "dark" ? "#ffe76b" : "#1c1c1c";
  const cx = w / 2;
  const horizon = h * 0.58;
  const sunR = w * 0.26;
  if (side === "back") {
    if (mode === "glow") return null;
    return <TourBack w={w} h={h} print="neon-mirage" ink={cyan} accent={pink} titleFont={F.monoton} titleSize={15} />;
  }
  const grid = (
    <g fill="none" stroke={mode === "glow" ? PHOSPHOR : cyan} strokeWidth="1">
      {[0.1, 0.25, 0.45, 0.72, 1].map((t, i) => (
        <line key={i} x1={4} x2={w - 4} y1={horizon + t * (h - horizon - 20)} y2={horizon + t * (h - horizon - 20)} />
      ))}
      {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
        <line key={k} x1={cx + k * 10} y1={horizon} x2={cx + k * 44} y2={h - 20} />
      ))}
    </g>
  );
  if (mode === "glow") {
    return (
      <g>
        {grid}
        <circle cx={cx} cy={horizon - 6} r={sunR * 0.6} fill={PHOSPHOR} opacity="0.7" />
      </g>
    );
  }
  const bars: React.ReactNode[] = [];
  let y = horizon - sunR;
  let gap = 0;
  let i = 0;
  while (y < horizon) {
    const thick = Math.max(2, 10 - i * 0.9);
    bars.push(<rect key={i} x={cx - sunR} y={y} width={sunR * 2} height={thick} fill={i % 2 ? pink : lemon} />);
    y += thick + gap;
    gap = Math.min(5, gap + 0.8);
    i++;
  }
  return (
    <g>
      <defs>
        <clipPath id={`sunc${id}`}>
          <circle cx={cx} cy={horizon} r={sunR} />
        </clipPath>
        <linearGradient id={`chromeT${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={cyan} />
          <stop offset="0.5" stopColor={lemon} />
          <stop offset="0.52" stopColor={pink} />
          <stop offset="1" stopColor={pink} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#sunc${id})`}>{bars}</g>
      {grid}
      <text x={cx} y={h * 0.2} textAnchor="middle" fontFamily={F.monoton} fontSize="22" fill={`url(#chromeT${id})`} textLength={w - 10} lengthAdjust="spacingAndGlyphs">
        NEON
      </text>
      <text x={cx} y={h * 0.2 + 24} textAnchor="middle" fontFamily={F.monoton} fontSize="22" fill={`url(#chromeT${id})`} textLength={w - 10} lengthAdjust="spacingAndGlyphs">
        MIRAGE
      </text>
      <text x={cx} y={h - 6} textAnchor="middle" fontFamily={F.archivo} fontSize="7.5" fill={lemon} letterSpacing="3.5" style={{ fontVariationSettings: "'wdth' 110" }}>
        NIGHT DRIVE 1984
      </text>
    </g>
  );
};

/* ── Rust Parade · grunge 1994 ─────────────────────────────── */
export const RustParade: PrintComponent = ({ w, h, base, side, mode }) => {
  const mustard = base === "dark" ? "#dcae3b" : "#8f6a12";
  const ink = base === "dark" ? "#efe9dc" : "#1b1b1b";
  if (mode === "glow") return null;
  if (side === "back") return <TourBack w={w} h={h} print="rust-parade" ink={ink} accent={mustard} titleFont={F.rocksalt} titleSize={13} uppercase={false} />;
  const cx = w / 2;
  const ty = h * 0.52;
  return (
    <g>
      {/* a crude pickup, drawn like a marker sketch */}
      <g transform={`translate(${cx - 52} ${ty})`} fill="none" stroke={ink} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M2 30 L6 12 L40 10 L52 -8 L78 -6 L84 10 L104 12 L104 32 L2 32 Z" fill={mustard} />
        <path d="M44 10 L52 -2 L74 -2 L78 10" />
        <path d="M6 12 L40 11" />
        <circle cx="26" cy="34" r="8" fill={ink} />
        <circle cx="82" cy="34" r="8" fill={ink} />
        <circle cx="26" cy="34" r="3" fill={mustard} stroke="none" />
        <circle cx="82" cy="34" r="3" fill={mustard} stroke="none" />
        <path d="M12 20 l6 0 M20 24 l10 0 M60 16 l12 0" strokeWidth="1.6" />
      </g>
      <text x={cx} y={h * 0.22} textAnchor="middle" fontFamily={F.rocksalt} fontSize="19" fill={ink} transform={`rotate(-4 ${cx} ${h * 0.22})`} textLength={w - 8} lengthAdjust="spacingAndGlyphs">
        RUST
      </text>
      <text x={cx} y={h * 0.38} textAnchor="middle" fontFamily={F.rocksalt} fontSize="19" fill={mustard} transform={`rotate(3 ${cx} ${h * 0.38})`} textLength={w - 4} lengthAdjust="spacingAndGlyphs">
        PARADE
      </text>
      <text x={cx} y={h * 0.9} textAnchor="middle" fontFamily={F.rocksalt} fontSize="9" fill={ink}>
        {"sawdust tour '94"}
      </text>
      <path d={`M10 ${h * 0.94} q30 6 60 0 t56 2`} fill="none" stroke={mustard} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
};

/* ── Black Orchid Club · goth 1985 ─────────────────────────── */
export const BlackOrchidClub: PrintComponent = ({ w, h, base, side, mode }) => {
  const silver = base === "dark" ? "#e8e4ee" : "#151317";
  const plum = base === "dark" ? "#7a2c5a" : "#5a1f43";
  const cx = w / 2;
  const cy = h * 0.5;
  const orchid = (stroke: string, fill: string, sw = 1.1) => (
    <g transform={`translate(${cx} ${cy})`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-16" rx="7.5" ry="17" transform={`rotate(${a})`} />
      ))}
      <path d="M0 2 C8 6 10 16 4 22 C1 25 -1 25 -4 22 C-10 16 -8 6 0 2 Z" />
      <circle cx="0" cy="0" r="3.2" />
      <path d="M0 24 C-2 34 -8 42 -4 56" fill="none" />
    </g>
  );
  if (side === "back") {
    if (mode === "glow") return null;
    return <TourBack w={w} h={h} print="black-orchid-club" ink={silver} accent={plum} titleFont={F.pirata} titleSize={22} uppercase={false} />;
  }
  if (mode === "glow") return orchid(PHOSPHOR, "none", 1.4);
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={w * 0.34} ry={h * 0.3} fill="none" stroke={silver} strokeWidth="1" />
      <ellipse cx={cx} cy={cy} rx={w * 0.34 - 4} ry={h * 0.3 - 4} fill="none" stroke={plum} strokeWidth="2" />
      {/* corner ornaments */}
      {[
        [8, 8],
        [w - 8, 8],
        [8, h - 8],
        [w - 8, h - 8],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0`} fill="none" stroke={silver} strokeWidth="0.9" />
      ))}
      {orchid(silver, plum)}
      <Arc cx={cx} cy={cy + 4} r={w * 0.44} text="Black Orchid" font={F.pirata} size={19} fill={silver} />
      <Arc cx={cx} cy={cy - 8} r={w * 0.44} text="Club" font={F.pirata} size={19} fill={silver} up={false} />
    </g>
  );
};

/* ── Sun Riot · surf punk 1979 ─────────────────────────────── */
export const SunRiot: PrintComponent = ({ w, h, base, side, mode }) => {
  const yellow = base === "dark" ? "#ffd23f" : "#f2b705";
  const teal = base === "dark" ? "#32c2bd" : "#0c7e7b";
  const red = base === "dark" ? "#ff5a47" : "#c8321f";
  const ink = base === "dark" ? "#1a1a1a" : "#1a1a1a";
  const label = base === "dark" ? "#fff5d6" : "#1a1a1a";
  if (mode === "glow") return null;
  if (side === "back") return <TourBack w={w} h={h} print="sun-riot" ink={label} accent={red} titleFont={F.bangers} titleSize={22} titleSpacing={1} />;
  const cx = w / 2;
  const sy = h * 0.44;
  const r = w * 0.24;
  return (
    <g>
      {/* rays */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + 0.26;
        return (
          <path
            key={i}
            d={`M${cx + cos(a - 0.12) * (r + 2)} ${sy + sin(a - 0.12) * (r + 2)} L${cx + cos(a) * (r + 16)} ${sy + sin(a) * (r + 16)} L${cx + cos(a + 0.12) * (r + 2)} ${sy + sin(a + 0.12) * (r + 2)} Z`}
            fill={yellow}
            stroke={ink}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        );
      })}
      <circle cx={cx} cy={sy} r={r} fill={yellow} stroke={ink} strokeWidth="1.6" />
      {/* sunglasses */}
      <rect x={cx - r * 0.78} y={sy - 10} width={r * 0.7} height="11" rx="2" fill={ink} />
      <rect x={cx + r * 0.08} y={sy - 10} width={r * 0.7} height="11" rx="2" fill={ink} />
      <line x1={cx - r * 0.08} x2={cx + r * 0.08} y1={sy - 5} y2={sy - 5} stroke={ink} strokeWidth="1.6" />
      {/* grimace */}
      <path d={`M${cx - r * 0.5} ${sy + 8} Q${cx} ${sy + 22} ${cx + r * 0.5} ${sy + 8}`} fill="none" stroke={ink} strokeWidth="1.8" />
      {[-2, -1, 0, 1, 2].map((k) => (
        <line key={k} x1={cx + k * 5} y1={sy + 9 + Math.abs(k)} x2={cx + k * 5} y2={sy + 15 - Math.abs(k) * 0.5} stroke={ink} strokeWidth="1" />
      ))}
      <text x={cx} y={h * 0.18} textAnchor="middle" fontFamily={F.bangers} fontSize="30" fill={red} stroke={ink} strokeWidth="1.2" paintOrder="stroke" letterSpacing="2" transform={`skewX(-6)`}>
        SUN RIOT
      </text>
      {/* waves */}
      {[0, 1].map((k) => (
        <path key={k} d={`M4 ${h * 0.8 + k * 8} q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0`} fill="none" stroke={teal} strokeWidth="2.2" strokeLinecap="round" />
      ))}
      <text x={cx} y={h - 4} textAnchor="middle" fontFamily={F.bangers} fontSize="9.5" fill={label} letterSpacing="2">
        {"WIPEOUT SUMMER '79"}
      </text>
    </g>
  );
};
