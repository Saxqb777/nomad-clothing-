"use client";

import { motion } from "motion/react";
import type { ColourwayId } from "@/lib/data/types";
import { COLOURWAYS } from "@/lib/data/colourways";
import { cn } from "@/lib/utils";

/** Kraft swing tags on strings from the hanger hook, one per colourway. */
export function SwingTags({
  colourways,
  value,
  onChange,
  grade,
  compact,
}: {
  colourways: ColourwayId[];
  value: ColourwayId;
  onChange: (c: ColourwayId) => void;
  grade: string;
  compact?: boolean;
}) {
  const n = colourways.length;
  return (
    <div className="absolute left-1/2 top-0 pointer-events-none" style={{ width: 0, height: 0 }} role="radiogroup" aria-label="Colourway">
      {colourways.map((id, i) => {
        const cw = COLOURWAYS[id];
        const selected = id === value;
        const angle = (compact ? 30 : 22) + i * 16 - (n - 1) * 2;
        const len = (compact ? 92 : 118) + i * 24;
        return (
          <motion.button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${cw.name}${selected ? ", selected" : ""}`}
            onClick={() => onChange(id)}
            className="absolute left-0 top-0 pointer-events-auto cursor-pointer outline-none group"
            style={{ transformOrigin: "0 0" }}
            initial={{ rotate: angle, y: 4 }}
            animate={{ rotate: selected ? angle + 6 : angle, y: selected ? 6 : 4 }}
            whileTap={{ rotate: angle - 10 }}
            transition={{ type: "spring", stiffness: 120, damping: 9, mass: 0.9 }}
          >
            {/* string */}
            <div className="absolute left-0 top-0 w-px bg-ink-soft/70" style={{ height: len, transform: "translateX(-0.5px)" }} />
            {/* tag */}
            <div
              className={cn(
                "absolute -translate-x-1/2 rounded-[3px] shadow-[0_3px_6px_rgba(0,0,0,0.18)] flex flex-col items-center justify-start",
                compact ? "w-[44px] h-[66px] pt-[14px]" : "w-[54px] h-[80px] pt-[16px]",
                "group-focus-visible:ring-2 group-focus-visible:ring-stamp",
              )}
              style={{
                top: len - 2,
                background: `linear-gradient(170deg, #d9c49f 0%, var(--color-kraft) 55%, var(--color-kraft-deep) 100%)`,
                border: selected ? "1.5px solid var(--color-stamp)" : "1px solid rgba(0,0,0,0.12)",
                clipPath: "polygon(50% 0, 100% 10%, 100% 100%, 0 100%, 0 10%)",
              }}
            >
              <span className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-paper-deep shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]" />
              <span className={cn("rounded-full shrink-0 border border-black/20", compact ? "w-4 h-4" : "w-5 h-5")} style={{ background: cw.fresh }} />
              <span className={cn("stamp text-center leading-[1.05] mt-1.5 px-0.5", compact ? "text-[7.5px]" : "text-[8.5px]")}>{cw.name}</span>
              <span className="font-mono text-[6.5px] mt-auto mb-1 text-ink/70 tracking-wider">1/1 · {grade.toUpperCase().slice(0, 9)}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
