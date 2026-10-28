"use client";

/**
 * Adapted from SmoothUI "Scrubber" (smoothui.dev) — design-tool style slider
 * with an animated thumb. Restyled as the NOMAD "Years on tour" odometer.
 */
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface ScrubberProps {
  className?: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onValueChange: (v: number) => void;
  format?: (v: number) => string;
  ticks?: number;
  endLabels?: [string, string];
}

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

export function Scrubber({ className, label = "Value", min = 0, max = 1, step = 1, value, onValueChange, format, ticks = 11, endLabels }: ScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const reduce = useReducedMotion();
  const pct = ((value - min) / (max - min)) * 100;

  const fromPointer = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const t = clamp((clientX - r.left) / r.width, 0, 1);
      const raw = min + t * (max - min);
      onValueChange(clamp(Math.round(raw / step) * step, min, max));
    },
    [min, max, step, onValueChange],
  );

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => fromPointer(e.clientX);
    const up = () => setDrag(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [drag, fromPointer]);

  return (
    <div className={cn("w-full select-none", className)}>
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">{label}</span>
        <motion.span key={value} initial={reduce ? false : { y: 4, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} className="font-display text-[18px] font-semibold tabular-nums" style={{ fontVariationSettings: "'wdth' 90" }}>
          {format ? format(value) : value}
        </motion.span>
      </div>
      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format ? format(value) : String(value)}
        tabIndex={0}
        className="relative h-9 cursor-ew-resize touch-none"
        onPointerDown={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).focus();
          setDrag(true);
          fromPointer(e.clientX);
        }}
        onKeyDown={(e) => {
          const big = step * 5;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") onValueChange(clamp(value + step, min, max));
          else if (e.key === "ArrowLeft" || e.key === "ArrowDown") onValueChange(clamp(value - step, min, max));
          else if (e.key === "PageUp") onValueChange(clamp(value + big, min, max));
          else if (e.key === "PageDown") onValueChange(clamp(value - big, min, max));
          else if (e.key === "Home") onValueChange(min);
          else if (e.key === "End") onValueChange(max);
          else return;
          e.preventDefault();
        }}
      >
        {/* track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-ink/15" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-stamp" style={{ width: `${pct}%` }} />
        {/* ticks */}
        <div className="absolute inset-x-0 top-1/2 flex justify-between pointer-events-none">
          {Array.from({ length: ticks }, (_, i) => (
            <span key={i} className={cn("w-px bg-ink/30", i % 5 === 0 ? "h-3 -mt-1.5" : "h-1.5 -mt-[3px]")} />
          ))}
        </div>
        {/* thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${pct}%` }}
          animate={{ scale: drag ? 1.25 : 1 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.3 }}
        >
          <div className="w-[18px] h-[18px] rounded-full bg-paper-lit border-2 border-ink shadow-[0_2px_6px_rgba(0,0,0,0.25)]" />
        </motion.div>
      </div>
      {endLabels && (
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint mt-1">
          <span>{endLabels[0]}</span>
          <span>{endLabels[1]}</span>
        </div>
      )}
    </div>
  );
}
