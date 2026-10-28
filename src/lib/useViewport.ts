"use client";

import { useEffect, useState } from "react";

export function useViewport() {
  const [v, setV] = useState({ w: 1280, h: 800, mobile: false, hover: true });
  useEffect(() => {
    const read = () =>
      setV({
        w: window.innerWidth,
        h: window.innerHeight,
        mobile: window.innerWidth < 760,
        hover: window.matchMedia("(hover: hover) and (pointer: fine)").matches,
      });
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return v;
}
