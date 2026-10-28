"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Tee } from "@/lib/data/types";
import { bandOf } from "@/lib/data/tees";
import { COLOURWAYS } from "@/lib/data/colourways";
import { RailSim, type Knock } from "@/lib/physics/rail";
import { Garment } from "@/components/garment/Garment";
import { useGlowLayer } from "@/components/lights/GlowPortal";
import { formatAED, mixHex } from "@/lib/utils";
import { flag } from "@/lib/flags";

export interface RailHandle {
  goTo: (index: number, opts?: { face?: boolean }) => void;
  dig: () => void;
  bump: (strength?: number) => void;
  hangerRect: (index: number) => DOMRect | null;
  facedIndex: () => number | null;
}

interface RailProps {
  tees: Tee[];
  /** Index of the tee shown in the focus view; the rail copy is hidden and the loop idles. */
  focusedIndex: number | null;
  onFocus: (index: number) => void;
  onFaced?: (index: number | null) => void;
  onKnock?: (k: Knock) => void;
  onDigLanded?: (index: number) => void;
  garmentHeight: number;
}

const SIDE_DEG = 80;

export const Rail = forwardRef<RailHandle, RailProps>(function Rail(
  { tees, focusedIndex, onFocus, onFaced, onKnock, onDigLanded, garmentHeight: GH },
  ref,
) {
  const GW = Math.round((GH * 300) / 380);
  const reduced = useReducedMotion() ?? false;
  const { layer: glowLayer } = useGlowLayer();

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const glowTrackRef = useRef<HTMLDivElement>(null);
  const hangerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const swingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hitRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const glowHangerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glowSwingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = useRef<HTMLDivElement>(null);
  const hitsRef = useRef<HTMLDivElement>(null);
  const enteredRef = useRef(false);
  const edgeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const simRef = useRef<RailSim | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const lastRef = useRef(0);
  const centreOnRef = useRef<number | null>(null);
  const facedRef = useRef<number | null>(null);
  const [faced, setFaced] = useState<number | null>(null);
  const wasDiggingRef = useRef(false);
  const focusedRef = useRef<number | null>(focusedIndex);
  focusedRef.current = focusedIndex;

  const callbacks = useRef({ onFocus, onFaced, onKnock, onDigLanded });
  callbacks.current = { onFocus, onFaced, onKnock, onDigLanded };

  const specs = useMemo(
    () =>
      tees.map((t, i) => ({
        length: (t.garment === "longsleeve" ? 1.18 : t.garment === "tank" ? 0.86 : 1) * GH * 0.62,
        damping: 1.15 + ((i * 37) % 7) * 0.07,
      })),
    [tees, GH],
  );

  const setFacedBoth = useCallback((i: number | null) => {
    if (facedRef.current === i) return;
    facedRef.current = i;
    setFaced(i);
    callbacks.current.onFaced?.(i);
  }, []);

  // ── DOM write ──
  const writeFrame = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return;
    const track = trackRef.current;
    if (track) track.style.transform = `translate3d(${sim.offset}px,0,0)`;
    const gt = glowTrackRef.current;
    if (gt) gt.style.transform = `translate3d(${sim.offset}px,0,0)`;
    const hl = hitsRef.current;
    if (hl) hl.style.transform = `translate3d(${sim.offset}px,0,0)`;
    for (let i = 0; i < sim.n; i++) {
      const h = hangerRefs.current[i];
      const s = swingRefs.current[i];
      if (!h || !s) continue;
      const tx = `translate3d(${(sim.x[i] - GW / 2).toFixed(2)}px,0,0) rotate(${sim.theta[i].toFixed(4)}rad)`;
      const sw = `perspective(1100px) rotateY(${((1 - sim.face[i]) * SIDE_DEG).toFixed(2)}deg)`;
      h.style.transform = tx;
      s.style.transform = sw;
      const hit = hitRefs.current[i];
      if (hit) {
        const w = sim.slot(sim.face[i]);
        hit.style.width = `${w.toFixed(1)}px`;
        hit.style.transform = `translate3d(${(sim.x[i] - w / 2).toFixed(2)}px,0,0)`;
      }
      const edge = edgeRefs.current[i];
      if (edge) edge.style.opacity = String(Math.max(0, Math.min(1, (0.82 - sim.face[i]) * 5)));
      const gh = glowHangerRefs.current[i];
      const gs = glowSwingRefs.current[i];
      if (gh && gs) {
        gh.style.transform = tx;
        gs.style.transform = sw;
      }
    }
    const label = labelRef.current;
    const f = facedRef.current;
    if (label && f !== null) {
      label.style.transform = `translate3d(${(sim.offset + sim.x[f]).toFixed(1)}px,0,0)`;
    }
  }, [GW]);

  const wake = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastRef.current = performance.now();
    const loop = () => {
      const sim = simRef.current;
      if (!sim) {
        runningRef.current = false;
        return;
      }
      const now = performance.now();
      const dt = Math.min(1 / 30, Math.max(0.001, (now - lastRef.current) / 1000));
      lastRef.current = now;

      if (centreOnRef.current !== null) sim.offsetTarget = sim.centreOffsetFor(centreOnRef.current);

      // Dig: flutter whatever is flying past the centre
      if (sim.digging) {
        const near = sim.nearestToCentre();
        for (let k = 0; k < sim.n; k++) sim.faceT[k] = k === near ? 0.3 : 0;
      }

      const wasEntering = sim.entering;
      sim.step(dt);
      if (wasEntering && !sim.entering) enteredRef.current = true;

      if (wasDiggingRef.current && !sim.digging) {
        wasDiggingRef.current = false;
        setFacedBoth(sim.digTargetIndex);
        centreOnRef.current = sim.digTargetIndex;
        callbacks.current.onDigLanded?.(sim.digTargetIndex);
      }
      if (centreOnRef.current !== null && sim.offsetTarget === null) centreOnRef.current = null;

      if (sim.knocks.length && flag("knocks")) for (const k of sim.knocks) callbacks.current.onKnock?.(k);

      writeFrame();

      if (sim.settled()) {
        runningRef.current = false;
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [writeFrame, setFacedBoth]);

  // ── sim lifecycle ──
  useLayoutEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const sim = new RailSim(specs, {
      garmentWidth: GW,
      sliverSlot: Math.max(22, Math.round(GW * 0.11)),
      gap: Math.round(GW * 0.06),
      pad: Math.round(vp.clientWidth * 0.5 - GW * 0.5),
      viewportWidth: vp.clientWidth,
      reducedMotion: reduced,
    });
    simRef.current = sim;
    const centre = sim.centreOffsetFor(Math.floor(tees.length / 2) - 1);
    if (!enteredRef.current && !reduced) {
      // page open: the rack slides in from the right and settles in the middle.
      // enteredRef flips once the slide finishes (or the visitor grabs the rail),
      // so a sim re-created a frame later by the viewport hook restarts it rather than skipping it.
      sim.startEntry(centre + vp.clientWidth * 0.9, centre, 1.6);
    } else {
      enteredRef.current = true;
      sim.offset = centre;
      sim.resetMotion();
      sim.bump(0.6);
    }
    writeFrame();
    wake();

    const ro = new ResizeObserver(() => {
      const s = simRef.current;
      if (!s) return;
      s.cfg.viewportWidth = vp.clientWidth;
      s.cfg.pad = Math.round(vp.clientWidth * 0.5 - GW * 0.5);
      wake();
    });
    ro.observe(vp);
    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      simRef.current = null;
    };
  }, [specs, GW, reduced, tees.length, writeFrame, wake]);

  // keep the glow twins in sync when the layer mounts
  useEffect(() => {
    writeFrame();
  }, [glowLayer, writeFrame]);

  // ── facing ──
  const face = useCallback(
    (i: number | null) => {
      const sim = simRef.current;
      if (!sim) return;
      if (i === null) sim.faceNone();
      else sim.faceOnly(i);
      setFacedBoth(i);
      wake();
    },
    [setFacedBoth, wake],
  );

  useImperativeHandle(
    ref,
    () => ({
      goTo: (i, opts) => {
        const sim = simRef.current;
        if (!sim) return;
        if (opts?.face !== false) face(i);
        centreOnRef.current = i;
        sim.offsetTarget = sim.centreOffsetFor(i);
        sim.bump(0.8);
        wake();
      },
      dig: () => {
        const sim = simRef.current;
        if (!sim) return;
        let j = Math.floor(Math.random() * sim.n);
        if (j === facedRef.current) j = (j + 1 + Math.floor(Math.random() * (sim.n - 1))) % sim.n;
        setFacedBoth(null);
        sim.faceNone();
        sim.offsetTarget = null;
        sim.digging = true;
        sim.digTargetIndex = j;
        wasDiggingRef.current = true;
        sim.bump(1.6);
        wake();
      },
      bump: (s) => {
        simRef.current?.bump(s);
        wake();
      },
      hangerRect: (i) => swingRefs.current[i]?.getBoundingClientRect() ?? null,
      facedIndex: () => facedRef.current,
    }),
    [face, wake, setFacedBoth],
  );

  // ── pointer: drag the rail ──
  const drag = useRef({ active: false, id: -1, lastX: 0, lastT: 0, moved: 0, startX: 0 });
  const suppressClick = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const sim = simRef.current;
    if (!sim) return;
    drag.current = { active: true, id: e.pointerId, lastX: e.clientX, lastT: performance.now(), moved: 0, startX: e.clientX };
    sim.dragging = true;
    sim.offsetTarget = null;
    centreOnRef.current = null;
    sim.digging = false;
    if (sim.entering) {
      sim.cancelEntry();
      enteredRef.current = true;
    }
    sim.vel = 0;
    viewportRef.current?.classList.add("dragging");
    wake();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.id) return;
    const sim = simRef.current;
    if (!sim) return;
    const now = performance.now();
    const dx = e.clientX - d.lastX;
    const dt = Math.max(1, now - d.lastT) / 1000;
    d.lastX = e.clientX;
    d.lastT = now;
    d.moved = Math.max(d.moved, Math.abs(e.clientX - d.startX));
    if (d.moved > 6 && viewportRef.current && !viewportRef.current.hasPointerCapture(e.pointerId)) {
      viewportRef.current.setPointerCapture(e.pointerId);
    }
    sim.offset += dx;
    const v = dx / dt;
    sim.vel = sim.vel * 0.55 + v * 0.45;
    wake();
  };
  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.id) return;
    d.active = false;
    const sim = simRef.current;
    if (sim) {
      sim.dragging = false;
      // a stale velocity from a pause before release should not fling
      if (performance.now() - d.lastT > 80) sim.vel = 0;
    }
    if (d.moved > 6) {
      suppressClick.current = true;
      window.setTimeout(() => (suppressClick.current = false), 0);
    }
    viewportRef.current?.classList.remove("dragging");
    if (viewportRef.current?.hasPointerCapture(e.pointerId)) viewportRef.current.releasePointerCapture(e.pointerId);
    wake();
  };

  // wheel = slide along the rail
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      const sim = simRef.current;
      if (!sim || focusedRef.current !== null) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!delta) return;
      e.preventDefault();
      sim.offsetTarget = null;
      centreOnRef.current = null;
      sim.vel -= delta * 14;
      sim.vel = Math.max(-5000, Math.min(5000, sim.vel));
      wake();
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [wake]);

  const hoverCapable = useRef(false);
  useEffect(() => {
    hoverCapable.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const sim = simRef.current;
    if (!sim) return;
    const cur = facedRef.current ?? sim.nearestToCentre();
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = Math.max(0, Math.min(sim.n - 1, cur + (e.key === "ArrowRight" ? 1 : -1)));
      face(next);
      centreOnRef.current = next;
      sim.offsetTarget = sim.centreOffsetFor(next);
      wake();
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const next = e.key === "Home" ? 0 : sim.n - 1;
      face(next);
      centreOnRef.current = next;
      wake();
    } else if (e.key === "Enter" || e.key === " ") {
      if (facedRef.current !== null) {
        e.preventDefault();
        callbacks.current.onFocus(facedRef.current);
      }
    } else if (e.key === "Escape") {
      if (facedRef.current !== null) {
        e.preventDefault();
        face(null);
      }
    }
  };

  const facedTee = faced !== null ? tees[faced] : null;

  const hangerNodes = (glow: boolean) =>
    tees.map((t, i) => {
      const cw = COLOURWAYS[t.defaultColourway];
      const hidden = focusedIndex === i;
      return (
        <div
          key={t.id}
          className="hanger"
          ref={(el) => {
            if (glow) glowHangerRefs.current[i] = el;
            else hangerRefs.current[i] = el;
          }}
          style={{ width: GW, height: GH, opacity: hidden ? 0 : 1, transition: "opacity 200ms", transform: "translate3d(-200vw,0,0)" }}
          aria-hidden={glow ? true : undefined}
        >
          <div
            className="hanger-swing"
            ref={(el) => {
              if (glow) glowSwingRefs.current[i] = el;
              else swingRefs.current[i] = el;
            }}
            style={{ width: GW, height: GH, transformOrigin: "50% 50%", transform: `perspective(1100px) rotateY(${SIDE_DEG}deg)` }}
          >
            <div className="hanger-face" style={{ width: GW, height: GH }}>
              <Garment garment={t.garment} colourway={t.defaultColourway} print={t.print} seed={t.seed} age={0} quality="rail" mode={glow ? "glow" : "ink"} />
            </div>
            {!glow && (
              <div
                className="hanger-edge"
                ref={(el) => {
                  edgeRefs.current[i] = el;
                }}
                style={{
                  width: 7,
                  height: GH * 0.78,
                  top: GH * 0.13,
                  marginLeft: -3.5,
                  borderRadius: 3,
                  transform: "rotateY(-90deg)",
                  background: `linear-gradient(90deg, ${mixHex(cw.fresh, "#000", 0.35)}, ${mixHex(cw.fresh, "#000", 0.05)} 50%, ${mixHex(cw.fresh, "#000", 0.4)})`,
                }}
              />
            )}
          </div>
        </div>
      );
    });

  return (
    <div
      ref={viewportRef}
      className="rail-viewport relative w-full outline-none"
      style={{ height: GH + 96 }}
      tabIndex={0}
      role="listbox"
      aria-label="Rail of tees. Use the arrow keys to move along the rail, Enter to pick one up."
      aria-activedescendant={facedTee ? `hanger-${facedTee.id}` : undefined}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={(e) => {
        if (drag.current.active) endDrag(e);
        if (hoverCapable.current && focusedRef.current === null) face(null);
      }}
    >
      {/* the rail itself */}
      <div className="absolute left-0 right-0 pointer-events-none" style={{ top: -2 }} aria-hidden>
        <div
          className="h-[6px] w-full rounded-full"
          style={{
            background: "linear-gradient(180deg, #f4f4f2 0%, #b9b9b6 35%, #777774 55%, #cfcfcc 100%)",
            boxShadow: "0 2px 3px rgba(0,0,0,0.25), 0 10px 18px -8px rgba(0,0,0,0.25)",
          }}
        />
        {[0.08, 0.92].map((p) => (
          <div
            key={p}
            className="absolute -top-5 w-[7px] h-7 rounded-sm"
            style={{ left: `${p * 100}%`, background: "linear-gradient(90deg,#cfcfcc,#8a8a87 50%,#b5b5b2)", boxShadow: "0 2px 2px rgba(0,0,0,.2)" }}
          />
        ))}
      </div>

      <div
        ref={trackRef}
        className="absolute top-0 left-0 h-full will-change-transform"
        style={{
          width: 1,
          filter: focusedIndex !== null ? "blur(7px)" : "none",
          opacity: focusedIndex !== null ? 0.45 : 1,
          transition: "filter 450ms ease, opacity 450ms ease",
        }}
      >
        {hangerNodes(false)}
      </div>

      {/* flat hit layer above the garments: 3D-rotated faces would otherwise shadow the buttons */}
      <div ref={hitsRef} className="absolute top-0 left-0 will-change-transform" style={{ height: GH, width: 1 }}>
        {tees.map((t, i) => (
          <button
            key={t.id}
            type="button"
            id={`hanger-${t.id}`}
            ref={(el) => {
              hitRefs.current[i] = el;
            }}
            className="absolute top-0 left-0 h-full bg-transparent cursor-pointer focus-visible:outline-none"
            style={{ width: 24 }}
            role="option"
            aria-selected={faced === i}
            aria-label={`${bandOf(t).name}, ${bandOf(t).tour} ${bandOf(t).year}, ${formatAED(t.price)}`}
            tabIndex={-1}
            onPointerEnter={() => {
              if (hoverCapable.current && focusedRef.current === null && !drag.current.active && !simRef.current?.entering) face(i);
            }}
            onClick={(e) => {
              if (suppressClick.current) {
                e.preventDefault();
                return;
              }
              if (focusedRef.current !== null) return;
              if (facedRef.current === i) callbacks.current.onFocus(i);
              else {
                face(i);
                if (!hoverCapable.current) {
                  centreOnRef.current = i;
                  wake();
                }
              }
            }}
          />
        ))}
      </div>

      {glowLayer &&
        createPortal(
          <div className="absolute" style={{ left: 0, top: 0 }} ref={(el) => {
              if (el && viewportRef.current) positionGlow(el, viewportRef.current);
            }}>
            <div ref={glowTrackRef} className="absolute top-0 left-0 will-change-transform">
              {hangerNodes(true)}
            </div>
          </div>,
          glowLayer,
        )}

      {/* name, price and the availability button, under the faced garment */}
      <div ref={labelRef} className="absolute top-0 left-0 will-change-transform pointer-events-none" style={{ top: GH + 10 }}>
        <AnimatePresence>
          {facedTee && focusedIndex === null && (
            <motion.div
              key={facedTee.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="-translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto"
              style={{ width: Math.max(GW + 40, 240) }}
            >
              <div className="flex items-center gap-3">
                <div className="text-center leading-tight">
                  <div className="font-display text-[15px] font-semibold tracking-tight" style={{ fontVariationSettings: "'wdth' 92, 'opsz' 14" }}>
                    {bandOf(facedTee).name}
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                    {bandOf(facedTee).tour} ’{String(bandOf(facedTee).year).slice(2)}
                  </div>
                </div>
                <span className="pricelabel text-[13px] -rotate-2">{formatAED(facedTee.price)}</span>
              </div>
              <button
                type="button"
                className="font-body text-[12px] font-medium tracking-[0.08em] uppercase px-3.5 py-2 rounded-full border border-ink/25 hover:border-ink bg-paper-lit/80 hover:bg-paper-lit transition-colors cursor-pointer"
                onClick={() => faced !== null && onFocus(faced)}
              >
                See availability
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

function positionGlow(el: HTMLDivElement, vp: HTMLDivElement) {
  const r = vp.getBoundingClientRect();
  el.style.left = `${r.left}px`;
  el.style.top = `${r.top}px`;
  el.style.width = `${r.width}px`;
  el.style.height = `${r.height}px`;
}
