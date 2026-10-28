"use client";

import { useEffect, useRef } from "react";
import { useNomad } from "@/components/state/store";
import { useGlowLayer } from "./GlowPortal";

/**
 * Lights Out. Kills the page lights; the pointer (or a finger) becomes a
 * flashlight beam. Glow-in-the-dark prints are portalled above the dark
 * overlay so they stay visible outside the beam.
 */
export function LightsOut() {
  const { settings } = useNomad();
  const out = settings.lights === "out";
  const { setLayer } = useGlowLayer();
  const layerRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!out) {
      setLayer(null);
      return;
    }
    setLayer(layerRef.current);
    const root = document.documentElement;
    pos.current = { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
    root.style.setProperty("--bx", `${pos.current.x}px`);
    root.style.setProperty("--by", `${pos.current.y}px`);
    const flush = () => {
      raf.current = null;
      root.style.setProperty("--bx", `${pos.current.x}px`);
      root.style.setProperty("--by", `${pos.current.y}px`);
    };
    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (raf.current === null) raf.current = requestAnimationFrame(flush);
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      pos.current = { x: t.clientX, y: t.clientY };
      if (raf.current === null) raf.current = requestAnimationFrame(flush);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouch);
      if (raf.current) cancelAnimationFrame(raf.current);
      setLayer(null);
    };
  }, [out, setLayer]);

  if (!out) return null;
  return (
    <>
      <div className="beam-overlay" aria-hidden />
      <div ref={layerRef} className="glow-layer" aria-hidden />
    </>
  );
}
