"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { ROUTE_STOPS, TEE_BY_ID, bandOf } from "@/lib/data/tees";
import { cn } from "@/lib/utils";

const W = 1000;
const H = 520;
const proj = (lon: number, lat: number): [number, number] => [((lon + 180) / 360) * W, ((78 - lat) / 136) * H];

// Napkin-map continents, lon/lat, deliberately loose.
const LAND: [number, number][][] = [
  [[-168, 66], [-140, 70], [-95, 72], [-75, 62], [-60, 47], [-70, 42], [-76, 35], [-81, 30], [-80, 25], [-90, 29], [-97, 26], [-105, 20], [-92, 15], [-83, 9], [-78, 8], [-86, 13], [-97, 16], [-106, 22], [-114, 30], [-120, 34], [-124, 42], [-125, 49], [-135, 58], [-150, 60], [-160, 58], [-166, 62]],
  [[-78, 8], [-72, 11], [-62, 10], [-50, 0], [-35, -5], [-38, -13], [-41, -22], [-48, -27], [-53, -34], [-58, -39], [-65, -45], [-68, -52], [-70, -54], [-74, -50], [-74, -40], [-71, -30], [-70, -18], [-76, -12], [-81, -5], [-80, 2]],
  [[-10, 36], [-9, 43], [-2, 48], [2, 51], [5, 53], [9, 55], [11, 57], [5, 58], [5, 62], [14, 67], [22, 70], [30, 70], [40, 66], [42, 60], [30, 56], [28, 50], [30, 45], [28, 41], [23, 37], [16, 38], [12, 44], [6, 43], [0, 42], [-9, 37]],
  [[-17, 15], [-17, 21], [-10, 30], [-5, 35], [10, 37], [20, 32], [32, 31], [35, 25], [42, 12], [51, 12], [49, 4], [40, -5], [40, -15], [35, -25], [30, -33], [20, -35], [15, -28], [12, -17], [9, -2], [5, 5], [-8, 5]],
  [[40, 66], [60, 70], [80, 73], [110, 75], [140, 72], [170, 68], [180, 65], [160, 60], [155, 52], [140, 48], [135, 40], [122, 38], [122, 30], [118, 22], [108, 18], [105, 10], [104, 2], [98, 8], [95, 15], [90, 22], [80, 15], [78, 8], [72, 20], [66, 25], [57, 25], [52, 24], [60, 30], [48, 30], [43, 35], [36, 36], [30, 40], [42, 45], [50, 48], [48, 55], [45, 60]],
  [[114, -22], [114, -34], [118, -35], [125, -33], [132, -32], [138, -35], [141, -38], [147, -39], [150, -37], [153, -30], [153, -25], [146, -19], [142, -11], [137, -12], [131, -12], [126, -14], [122, -18]],
  [[130, 31], [132, 34], [137, 35], [140, 36], [142, 40], [141, 45], [144, 44], [140, 41], [140, 37], [136, 34], [133, 33]],
  [[-24, 65], [-22, 66], [-16, 67], [-13, 65], [-18, 63], [-22, 64]],
  [[-5, 50], [1, 51], [2, 53], [-2, 56], [-3, 58], [-6, 57], [-5, 54], [-3, 52]],
];

const landPath = (pts: [number, number][]) => pts.map(([lon, lat], i) => `${i ? "L" : "M"}${proj(lon, lat).map((v) => v.toFixed(1)).join(" ")}`).join(" ") + " Z";

/** Stamp positions, nudged apart when two cities sit on top of each other. */
const STOP_POS: [number, number][] = (() => {
  const pts = ROUTE_STOPS.map((s) => proj(s.lon, s.lat));
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j][0] - pts[i][0];
        const dy = pts[j][1] - pts[i][1];
        const d = Math.hypot(dx, dy) || 1;
        const min = 40;
        if (d < min) {
          const push = (min - d) / 2;
          const ux = dx / d;
          const uy = dy / d;
          pts[i] = [pts[i][0] - ux * push, pts[i][1] - uy * push];
          pts[j] = [pts[j][0] + ux * push, pts[j][1] + uy * push];
        }
      }
  }
  return pts.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
})();

function routePath() {
  const pts = STOP_POS;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2 - Math.min(90, Math.abs(x1 - x0) * 0.25);
    d += ` Q${mx.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return d;
}

export function RouteMap({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (teeId: string) => void }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col bg-paper/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label="The route: where every tee was found"
        >
          <div className="flex items-start justify-between px-5 sm:px-8 pt-5">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">The route</div>
              <h2 className="font-display font-extrabold text-[28px] sm:text-[36px] leading-none tracking-tight mt-1" style={{ fontVariationSettings: "'wdth' 84, 'opsz' 60" }}>
                Where every tee was found
              </h2>
              <p className="font-mono text-[12px] text-ink-soft mt-2">Tap a city and the rail slides to the tees found there.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close the route" className="w-11 h-11 rounded-full border border-ink/20 bg-paper-lit/80 flex items-center justify-center hover:bg-paper-lit cursor-pointer shrink-0">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 px-3 sm:px-8 pb-6 pt-4 overflow-y-auto">
            <div className="flex-1 min-h-[260px]">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full max-h-[70vh]" role="img" aria-label="Hand drawn world map with the route">
                <defs>
                  <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-ink)" strokeWidth="0.6" opacity="0.18" />
                  </pattern>
                </defs>
                <rect width={W} height={H} fill="var(--color-paper-lit)" />
                <rect width={W} height={H} fill="url(#paperGrain)" opacity="0.5" />
                {/* graticule, hand ruled */}
                <g stroke="var(--color-ink)" strokeWidth="0.5" opacity="0.14" filter="url(#wobble)">
                  {[-60, -30, 0, 30, 60].map((lat) => (
                    <line key={lat} x1={0} x2={W} y1={proj(0, lat)[1]} y2={proj(0, lat)[1]} />
                  ))}
                  {[-120, -60, 0, 60, 120].map((lon) => (
                    <line key={lon} y1={0} y2={H} x1={proj(lon, 0)[0]} x2={proj(lon, 0)[0]} />
                  ))}
                </g>
                <g filter="url(#wobble)">
                  {LAND.map((pts, i) => (
                    <g key={i}>
                      <path d={landPath(pts)} fill="url(#hatch)" stroke="var(--color-ink)" strokeWidth="1.3" strokeLinejoin="round" opacity="0.9" />
                    </g>
                  ))}
                </g>
                {/* the route */}
                <motion.path
                  d={routePath()}
                  fill="none"
                  stroke="var(--color-stamp)"
                  strokeWidth="2.2"
                  strokeDasharray="7 6"
                  strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.2, ease: "easeInOut", delay: 0.2 }}
                />
                {ROUTE_STOPS.map((s, i) => {
                  const [x, y] = STOP_POS[i];
                  const tees = s.teeIds.map((id) => TEE_BY_ID[id]);
                  return (
                    <motion.g
                      key={s.city}
                      initial={reduce ? false : { opacity: 0, scale: 1.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + i * 0.18, type: "spring", stiffness: 300, damping: 14 }}
                      style={{ transformOrigin: `${x}px ${y}px` }}
                      className="cursor-pointer outline-none"
                      role="button"
                      tabIndex={0}
                      aria-label={`${s.city}, ${s.year}: ${tees.map((t) => bandOf(t).name).join(", ")}`}
                      onClick={() => onPick(s.teeIds[0])}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPick(s.teeIds[0])}
                    >
                      <g transform={`translate(${x} ${y}) rotate(${((i * 53) % 21) - 10})`} style={{ filter: "url(#stampInk)" }}>
                        <circle r="17" fill="var(--color-paper-lit)" fillOpacity="0.9" stroke="var(--color-stamp)" strokeWidth="2" />
                        <circle r="13.8" fill="none" stroke="var(--color-stamp)" strokeWidth="0.8" />
                        <text y="-3" textAnchor="middle" fontFamily="var(--font-courier)" fontWeight="700" fontSize="6.2" fill="var(--color-stamp)" letterSpacing="0.6">
                          {s.city.toUpperCase().slice(0, 11)}
                        </text>
                        <text y="8" textAnchor="middle" fontFamily="var(--font-bricolage)" fontWeight="800" fontSize="9.5" fill="var(--color-stamp)">
                          {s.year}
                        </text>
                      </g>
                      {tees.length > 1 && (
                        <g transform={`translate(${x + 16} ${y - 16})`}>
                          <circle r="7" fill="var(--color-stamp)" />
                          <text y="2.8" textAnchor="middle" fontFamily="var(--font-bricolage)" fontWeight="800" fontSize="8" fill="#fff">
                            {tees.length}
                          </text>
                        </g>
                      )}
                    </motion.g>
                  );
                })}
              </svg>
            </div>

            <ol className="lg:w-[300px] shrink-0 flex flex-col gap-1.5" aria-label="Stops in order">
              {ROUTE_STOPS.map((s, i) => (
                <li key={s.city}>
                  <button
                    type="button"
                    onClick={() => onPick(s.teeIds[0])}
                    className={cn("w-full text-left flex items-baseline gap-3 px-3 py-2 rounded-lg border border-transparent hover:border-ink/20 hover:bg-paper-lit cursor-pointer")}
                  >
                    <span className="font-mono text-[10px] text-ink-faint w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display font-semibold text-[15px]" style={{ fontVariationSettings: "'wdth' 90" }}>
                      {s.city}
                    </span>
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-soft ml-auto">
                      {s.year} · {s.teeIds.length} tee{s.teeIds.length > 1 ? "s" : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
