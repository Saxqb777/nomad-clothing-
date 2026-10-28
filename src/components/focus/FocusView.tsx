"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import type { ColourwayId, Size, Tee } from "@/lib/data/types";
import { bandOf } from "@/lib/data/tees";
import { COLOURWAYS } from "@/lib/data/colourways";
import { Garment } from "@/components/garment/Garment";
import { SwingTags } from "./SwingTags";
import { SizePasses } from "./SizePasses";
import { FoundInStamp } from "./FoundInStamp";
import { Scrubber } from "@/components/smoothui/Scrubber";
import { ageFactor, gradeFor, MAX_YEARS } from "@/lib/ageing";
import { useNomad } from "@/components/state/store";
import { getAudio } from "@/lib/audio/engine";
import { useViewport } from "@/lib/useViewport";
import { useGlowLayer } from "@/components/lights/GlowPortal";
import { createPortal } from "react-dom";
import { cn, formatAED } from "@/lib/utils";

interface Props {
  tee: Tee;
  originRect: DOMRect | null;
  onClose: () => void;
  onOpenTable: () => void;
}

export function FocusView({ tee, originRect, onClose, onOpenTable }: Props) {
  const band = bandOf(tee);
  const vp = useViewport();
  const reduce = useReducedMotion() ?? false;
  const { settings, addToTable, cart } = useNomad();
  const { layer: glowLayer } = useGlowLayer();

  const [colourway, setColourway] = useState<ColourwayId>(tee.defaultColourway);
  const [side, setSide] = useState<"front" | "back">("front");
  const [years, setYears] = useState(0);
  const [size, setSize] = useState<Size | null>(null);
  const [shake, setShake] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const age = ageFactor(years);
  const grade = gradeFor(years);

  const garmentRef = useRef<HTMLDivElement>(null);
  const glowTwinRef = useRef<HTMLDivElement>(null);
  const [twinPos, setTwinPos] = useState<{ left: number; top: number; w: number; h: number } | null>(null);

  const GH = vp.mobile ? Math.round(Math.min(vp.h * 0.42, 360)) : Math.round(Math.max(300, Math.min(vp.h * 0.64, 560, (vp.w - 560) * 0.9)));
  const GW = Math.round((GH * 300) / 380);

  // FLIP in from the rail hanger
  useLayoutEffect(() => {
    const el = garmentRef.current;
    if (!el) return;
    const target = el.getBoundingClientRect();
    if (originRect && !reduce) {
      const s = originRect.height / target.height;
      const dx = originRect.left + originRect.width / 2 - (target.left + target.width / 2);
      const dy = originRect.top - target.top;
      const ctrl = animate(
        el,
        { x: [dx, 0], y: [dy, 0], scale: [s, 1], rotateY: [55, 0], opacity: [0.6, 1] },
        { type: "spring", stiffness: 150, damping: 22, mass: 0.9 },
      );
      return () => ctrl.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the glow twin aligned with the garment
  useEffect(() => {
    if (!glowLayer) return;
    const measure = () => {
      const r = garmentRef.current?.getBoundingClientRect();
      if (r) setTwinPos({ left: r.left, top: r.top, w: r.width, h: r.height });
    };
    const t = window.setTimeout(measure, 700);
    const r = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(r);
      window.removeEventListener("resize", measure);
    };
  }, [glowLayer, GH, side]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tick = useCallback(() => {
    if (settings.sound) getAudio().tick();
  }, [settings.sound]);

  const onAdd = () => {
    if (!size) {
      setShake((s) => s + 1);
      setToast("Pick a size pass first");
      window.setTimeout(() => setToast(null), 1800);
      return;
    }
    const key = `${tee.id}:${colourway}:${size}`;
    if (cart.some((c) => c.key === key)) {
      setToast("Already on the table");
    } else {
      addToTable({ key, teeId: tee.id, colourway, size, years });
      setToast("On the merch table");
    }
    tick();
    window.setTimeout(() => setToast(null), 2200);
  };

  const cw = COLOURWAYS[colourway];

  const details = (
    <div className={cn("flex flex-col gap-5", vp.mobile ? "px-5 pb-28 pt-2" : "max-w-[400px]")}>
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">{band.genre} · {band.year}</div>
        <h2 className="font-display font-extrabold leading-[0.95] tracking-tight mt-1" style={{ fontSize: vp.mobile ? 34 : 44, fontVariationSettings: "'wdth' 84, 'opsz' 60" }}>
          {band.name}
        </h2>
        <div className="font-mono text-[12.5px] uppercase tracking-[0.12em] mt-1.5">
          {band.tour} · {tee.garment === "longsleeve" ? "long sleeve" : tee.garment === "tank" ? "tank" : "tee"}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <FoundInStamp city={tee.foundIn.city} country={tee.foundIn.country} year={tee.foundIn.year} size={vp.mobile ? 96 : 108} className="shrink-0 -ml-1" />
        <p className="font-mono text-[12px] leading-[1.5] text-ink-soft pt-3">{tee.foundIn.story}</p>
      </div>

      <div>
        <Scrubber
          label="Years on tour"
          min={0}
          max={MAX_YEARS}
          step={1}
          value={years}
          onValueChange={setYears}
          format={(v) => `${v} yr${v === 1 ? "" : "s"}`}
          ticks={MAX_YEARS / 5 + 1}
          endLabels={["Mint", "Road worn"]}
        />
        <div className="mt-2 flex items-center gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">Condition</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={grade} initial={{ scale: 1.25, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: -3 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 16 }} className="stamp stamp-box text-[11px] inline-block">
              {grade}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <SizePasses sizes={tee.sizes} value={size} onChange={(s) => { setSize(s); tick(); }} shake={shake} />

      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <span className="pricelabel text-[18px] -rotate-1 inline-block">{formatAED(tee.price)}</span>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft mt-1.5">one of one · {cw.name}</div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="font-body font-semibold text-[13px] uppercase tracking-[0.1em] px-5 py-3 rounded-full bg-ink text-paper-lit hover:bg-stamp transition-colors cursor-pointer"
        >
          Add to table
        </button>
      </div>
      {cart.length > 0 && (
        <button type="button" onClick={onOpenTable} className="self-start font-mono text-[11px] uppercase tracking-[0.14em] underline underline-offset-4 text-stamp cursor-pointer">
          Open merch table ({cart.length})
        </button>
      )}
    </div>
  );

  const garmentBlock = (
    <div className="relative mx-auto" style={{ width: GW, height: GH, perspective: 1400 }}>
      <motion.div
        ref={garmentRef}
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: side === "back" ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 14, mass: 1 }}
      >
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
          <Garment garment={tee.garment} colourway={colourway} print={tee.print} seed={tee.seed} age={age} side="front" />
        </div>
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <Garment garment={tee.garment} colourway={colourway} print={tee.print} seed={tee.seed + 1} age={age} side="back" />
        </div>
      </motion.div>
      <SwingTags colourways={tee.colourways} value={colourway} onChange={(c) => { setColourway(c); tick(); }} grade={grade} compact={vp.mobile} />
    </div>
  );

  const toggle = (
    <div className="flex justify-center">
      <div className="inline-flex rounded-full border border-ink/20 p-[3px] bg-paper-lit/70" role="radiogroup" aria-label="Front or back">
        {(["front", "back"] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={side === s}
            onClick={() => { setSide(s); tick(); }}
            className={cn("relative px-4 py-1.5 rounded-full font-body text-[12px] font-semibold uppercase tracking-[0.12em] cursor-pointer transition-colors", side === s ? "text-paper-lit" : "text-ink-soft hover:text-ink")}
          >
            {side === s && <motion.span layoutId="fb-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            <span className="relative">{s}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col bg-paper/88 sm:bg-paper/72"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${band.name} ${band.tour}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Back to the rail"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-11 h-11 rounded-full border border-ink/20 bg-paper-lit/80 flex items-center justify-center hover:bg-paper-lit cursor-pointer"
      >
        <X size={18} />
      </button>
      <div className="absolute top-7 left-6 hidden sm:block font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">Esc · back to the rail</div>

      {vp.mobile ? (
        <div className="flex-1 overflow-y-auto overscroll-contain pt-16">
          {garmentBlock}
          <div className="my-3">{toggle}</div>
          {details}
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center px-8 pt-10 pb-24 overflow-y-auto">
          <div />
          <div className="flex flex-col gap-4">
            {garmentBlock}
            {toggle}
          </div>
          <div className="pl-10 xl:pl-16">{details}</div>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 font-mono text-[11.5px] uppercase tracking-[0.14em] px-4 py-2 rounded-full bg-ink text-paper-lit shadow-lg"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {glowLayer && twinPos && band.glow &&
        createPortal(
          <div ref={glowTwinRef} className="absolute" style={{ left: twinPos.left, top: twinPos.top, width: twinPos.w, height: twinPos.h, perspective: 1400 }}>
            <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }} animate={{ rotateY: side === "back" ? 180 : 0 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 14, mass: 1 }}>
              <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
                <Garment garment={tee.garment} colourway={colourway} print={tee.print} seed={tee.seed} age={age} side="front" mode="glow" />
              </div>
            </motion.div>
          </div>,
          glowLayer,
        )}
    </motion.div>
  );
}
