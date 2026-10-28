"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Rail, type RailHandle } from "@/components/rail/Rail";
import { Wordmark } from "@/components/brand/Wordmark";
import { FocusView } from "@/components/focus/FocusView";
import { Dock } from "@/components/dock/Dock";
import { LightsOut } from "@/components/lights/LightsOut";
import { GlowPortalProvider } from "@/components/lights/GlowPortal";
import { RouteMap } from "@/components/route/RouteMap";
import { MerchTable } from "@/components/merch/MerchTable";
import { ScrambleHover } from "@/components/smoothui/ScrambleHover";
import { TEES, bandOf } from "@/lib/data/tees";
import { useNomad } from "@/components/state/store";
import { getAudio } from "@/lib/audio/engine";
import { useViewport } from "@/lib/useViewport";
import { flag } from "@/lib/flags";
import type { Knock } from "@/lib/physics/rail";

export default function Home() {
  return (
    <GlowPortalProvider>
      <RailPage />
    </GlowPortalProvider>
  );
}

function RailPage() {
  const rail = useRef<RailHandle>(null);
  const vp = useViewport();
  const { settings } = useNomad();
  const [focused, setFocused] = useState<number | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [faced, setFaced] = useState<number | null>(null);
  const [routeOpen, setRouteOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [digging, setDigging] = useState(false);

  const GH = vp.mobile ? Math.round(Math.min(Math.max(vp.h * 0.36, 200), 290)) : Math.round(Math.min(Math.max(vp.h * 0.4, 240), 340));

  const focusTee = useCallback((i: number) => {
    setOriginRect(rail.current?.hangerRect(i) ?? null);
    setFocused(i);
    const url = new URL(window.location.href);
    url.searchParams.set("tee", TEES[i].id);
    window.history.replaceState(null, "", url);
  }, []);

  const closeFocus = useCallback(() => {
    setFocused(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("tee");
    window.history.replaceState(null, "", url);
    window.setTimeout(() => rail.current?.bump(0.5), 50);
  }, []);

  // deep link: /?tee=<id>
  useEffect(() => {
    const id = new URL(window.location.href).searchParams.get("tee");
    if (!id) return;
    const i = TEES.findIndex((t) => t.id === id);
    if (i >= 0) {
      rail.current?.goTo(i);
      const t = window.setTimeout(() => focusTee(i), 500);
      return () => window.clearTimeout(t);
    }
  }, [focusTee]);

  // Needle drop: the band of whatever is faced or focused
  const current = focused ?? faced;
  useEffect(() => {
    if (!settings.needle) return;
    if (current === null) return;
    const band = bandOf(TEES[current]);
    getAudio().play(band.id, band.sound);
  }, [settings.needle, current]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) getAudio().liftNeedle();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const onKnock = useCallback(
    (k: Knock) => {
      if (settings.sound) getAudio().clack(k.intensity, k.pan);
    },
    [settings.sound],
  );

  const dig = useCallback(() => {
    if (focused !== null) return;
    setDigging(true);
    rail.current?.dig();
  }, [focused]);

  // Shake to dig on phones (DeviceMotion); the button stays as the fallback.
  const shakeArmed = useRef(false);
  const lastDig = useRef(0);
  useEffect(() => {
    if (!flag("shakeToDig")) return;
    let last: number[] = [];
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
      const now = performance.now();
      last = last.filter((t) => now - t < 900);
      if (mag > 24) last.push(now);
      if (last.length >= 3 && now - lastDig.current > 2500) {
        lastDig.current = now;
        last = [];
        dig();
      }
    };
    const arm = () => {
      if (shakeArmed.current) return;
      shakeArmed.current = true;
      window.addEventListener("devicemotion", onMotion);
    };
    type DME = typeof DeviceMotionEvent & { requestPermission?: () => Promise<"granted" | "denied"> };
    const DM = (typeof DeviceMotionEvent !== "undefined" ? DeviceMotionEvent : null) as DME | null;
    if (DM && typeof DM.requestPermission === "function") {
      // iOS: needs a user gesture; arm on the first tap anywhere
      const once = () => {
        DM.requestPermission?.().then((r) => r === "granted" && arm()).catch(() => {});
        window.removeEventListener("pointerdown", once);
      };
      window.addEventListener("pointerdown", once);
      return () => {
        window.removeEventListener("pointerdown", once);
        window.removeEventListener("devicemotion", onMotion);
      };
    }
    if (DM) arm();
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [dig]);

  const out = settings.lights === "out";

  return (
    <main className="sweep min-h-[100dvh] flex flex-col overflow-hidden">
      <header className="flex justify-center pt-7 sm:pt-9 pb-2 px-4 transition-opacity duration-300" style={{ opacity: focused !== null ? 0 : 1 }}>
        <Wordmark />
      </header>

      <div className="flex-1 flex flex-col justify-center pb-24 sm:pb-24">
        <Rail
          ref={rail}
          tees={TEES}
          focusedIndex={focused}
          onFocus={focusTee}
          onFaced={setFaced}
          onKnock={onKnock}
          onDigLanded={() => setDigging(false)}
          garmentHeight={GH}
        />
        <p className={`text-center font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.18em] px-6 mt-2 transition-opacity duration-300 ${out ? "text-[#6c6c74]" : "text-ink-faint"}`} style={{ opacity: focused !== null ? 0 : 1 }} aria-hidden>
          <ScrambleHover>{vp.hover ? "Drag the rail · hover a tee · arrow keys · enter to pick up" : "Swipe the rail · tap a tee · tap again to pick up"}</ScrambleHover>
        </p>
      </div>

      <Dock onDig={dig} onRoute={() => setRouteOpen(true)} onTable={() => setTableOpen(true)} digging={digging} />

      <AnimatePresence>
        {focused !== null && (
          <FocusView key={TEES[focused].id} tee={TEES[focused]} originRect={originRect} onClose={closeFocus} onOpenTable={() => setTableOpen(true)} />
        )}
      </AnimatePresence>

      <RouteMap
        open={routeOpen}
        onClose={() => setRouteOpen(false)}
        onPick={(teeId) => {
          setRouteOpen(false);
          const i = TEES.findIndex((t) => t.id === teeId);
          if (i >= 0) {
            if (focused !== null) closeFocus();
            window.setTimeout(() => rail.current?.goTo(i), 120);
          }
        }}
      />

      <MerchTable open={tableOpen} onClose={() => setTableOpen(false)} />
      <LightsOut />
    </main>
  );
}
