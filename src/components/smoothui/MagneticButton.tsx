"use client";

/**
 * Adapted from SmoothUI "Magnetic Button" (smoothui.dev): the button leans
 * toward the cursor. Used for Dig the Crate.
 */
import { cn } from "@/lib/utils";
import { motion, useReducedMotion, useSpring } from "motion/react";
import { useRef } from "react";

export function MagneticButton({
  children,
  className,
  onClick,
  strength = 0.35,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { strength?: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.6 });
  const y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.6 });
  return (
    <motion.button
      ref={ref}
      type="button"
      className={cn("cursor-pointer", className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce) return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  );
}
