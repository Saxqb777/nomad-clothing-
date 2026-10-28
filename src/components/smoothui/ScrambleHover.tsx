"use client";

/** Adapted from SmoothUI "Scramble Hover": letters resolve like a tuning radio. */
import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·/–".split("");

export function ScrambleHover({ children, className, duration = 520, speed = 28 }: { children: string; className?: string; duration?: number; speed?: number }) {
  const [display, setDisplay] = useState(children);
  const timers = useRef<{ t?: number; i?: number }>({});
  const reduce = useRef(false);
  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  const run = () => {
    if (reduce.current) return;
    const start = performance.now();
    window.clearInterval(timers.current.i);
    timers.current.i = window.setInterval(() => {
      const p = (performance.now() - start) / duration;
      if (p >= 1) {
        window.clearInterval(timers.current.i);
        setDisplay(children);
        return;
      }
      setDisplay(
        children
          .split("")
          .map((c, i) => (c === " " || i / children.length < p ? c : CHARS[Math.floor(Math.random() * CHARS.length)]))
          .join(""),
      );
    }, speed);
  };
  useEffect(() => () => window.clearInterval(timers.current.i), []);
  return (
    <span className={className} onPointerEnter={run} onFocus={run}>
      {display}
    </span>
  );
}
