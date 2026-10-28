"use client";

import { motion } from "motion/react";
import type { Size } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** Sizes as laminated backstage passes on lanyards. Sold out passes are hole punched. */
export function SizePasses({
  sizes,
  value,
  onChange,
  shake,
}: {
  sizes: Array<{ size: Size; soldOut: boolean }>;
  value: Size | null;
  onChange: (s: Size) => void;
  shake?: number;
}) {
  return (
    <div className="relative" role="radiogroup" aria-label="Size">
      {/* the bar the lanyards hang from */}
      <div className="h-[3px] rounded-full bg-ink/25 mb-0" />
      <motion.div
        className="flex justify-between px-1"
        key={shake}
        animate={shake ? { x: [0, -5, 5, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {sizes.map(({ size, soldOut }) => {
          const selected = value === size;
          return (
            <motion.button
              key={size}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={soldOut}
              aria-label={`${size}${soldOut ? ", sold out" : ""}`}
              disabled={soldOut}
              onClick={() => onChange(size)}
              className={cn("relative flex flex-col items-center outline-none group", soldOut ? "cursor-not-allowed" : "cursor-pointer")}
              style={{ transformOrigin: "50% 0" }}
              animate={{ rotate: selected ? -4 : 0, y: selected ? 4 : 0 }}
              whileHover={soldOut ? undefined : { rotate: 3 }}
              transition={{ type: "spring", stiffness: 160, damping: 10 }}
            >
              {/* lanyard */}
              <span className={cn("block w-[3px] h-[26px]", selected ? "bg-stamp" : "bg-ink/50")} style={{ background: selected ? "repeating-linear-gradient(180deg,var(--color-stamp) 0 4px,var(--color-stamp-deep) 4px 6px)" : undefined }} />
              <span className="block w-[10px] h-[6px] rounded-sm bg-[#8d8d89] -mt-px shadow-[0_1px_1px_rgba(0,0,0,0.35)]" />
              {/* pass */}
              <span
                className={cn(
                  "pass-laminate relative mt-[2px] w-[50px] h-[70px] rounded-[5px] border flex flex-col items-center shadow-[0_3px_8px_rgba(0,0,0,0.22)]",
                  "group-focus-visible:ring-2 group-focus-visible:ring-stamp",
                  soldOut ? "bg-[#3a3a3f] border-black/30 text-[#9b9b98]" : "bg-[#1b1b20] border-black/40 text-paper-lit",
                  selected && "ring-2 ring-stamp",
                )}
              >
                <span className="block w-[14px] h-[4px] rounded-full bg-paper-deep/80 mt-[4px] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]" />
                <span className="font-display text-[7.5px] font-bold tracking-[0.2em] mt-[5px] opacity-80" style={{ fontVariationSettings: "'wdth' 80" }}>
                  NOMAD
                </span>
                <span className="font-display text-[22px] font-extrabold leading-none mt-[3px]" style={{ fontVariationSettings: "'wdth' 85" }}>
                  {size}
                </span>
                <span className="font-mono text-[5.5px] tracking-[0.14em] mt-[4px] opacity-75">{soldOut ? "SOLD OUT" : "ALL ACCESS"}</span>
                {soldOut && (
                  <span
                    className="absolute left-1/2 top-[36px] -translate-x-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full"
                    style={{ background: "var(--color-paper)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)" }}
                    aria-hidden
                  />
                )}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
