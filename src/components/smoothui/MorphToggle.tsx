"use client";

/**
 * Adapted from SmoothUI "Morph Toggle" (smoothui.dev): a spring-driven switch.
 * Used for Lights, Sound and Needle in the dock.
 */
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export interface MorphToggleProps {
  checked: boolean;
  onChange: (c: boolean) => void;
  label: string;
  className?: string;
  size?: "sm" | "md";
  onColor?: string;
}

const SPRING = { type: "spring" as const, bounce: 0.15, duration: 0.3 };

export function MorphToggle({ checked, onChange, label, className, size = "md", onColor }: MorphToggleProps) {
  const dims = size === "sm" ? { w: 34, h: 20, t: 14 } : { w: 44, h: 26, t: 20 };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative rounded-full shrink-0 cursor-pointer transition-colors", className)}
      style={{ width: dims.w, height: dims.h, background: checked ? onColor ?? "var(--color-stamp)" : "rgba(23,22,26,0.18)" }}
    >
      <motion.span
        className="absolute top-[3px] rounded-full bg-paper-lit shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
        style={{ width: dims.t, height: dims.t, left: 3 }}
        animate={{ x: checked ? dims.w - dims.t - 6 : 0, scaleX: 1 }}
        transition={SPRING}
      />
    </button>
  );
}
