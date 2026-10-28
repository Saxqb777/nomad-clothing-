"use client";

import { createContext, useContext, useState } from "react";

interface GlowCtx {
  /** The fixed layer above the dark overlay where glow twins are portalled. Null when lights are on. */
  layer: HTMLDivElement | null;
  setLayer: (el: HTMLDivElement | null) => void;
}

const Ctx = createContext<GlowCtx>({ layer: null, setLayer: () => {} });

export function GlowPortalProvider({ children }: { children: React.ReactNode }) {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  return <Ctx.Provider value={{ layer, setLayer }}>{children}</Ctx.Provider>;
}

export function useGlowLayer() {
  return useContext(Ctx);
}
