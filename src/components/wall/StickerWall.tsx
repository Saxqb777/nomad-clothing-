"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { STICKER_IDS, type StickerId, type WallSticker } from "@/lib/data/stickers";
import { StickerArt, STICKER_LABELS } from "./StickerArt";
import { cn } from "@/lib/utils";
import { useViewport } from "@/lib/useViewport";

type Local = WallSticker & { mine?: boolean };

export function StickerWall() {
  const vp = useViewport();
  const reduce = useReducedMotion();
  const doorRef = useRef<HTMLDivElement>(null);
  const [stickers, setStickers] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [design, setDesign] = useState<StickerId>("nomad-round");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const stickerSize = vp.mobile ? 58 : 76;

  const say = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/stickers")
      .then((r) => r.json())
      .then((d: { stickers?: WallSticker[]; error?: string }) => {
        if (!alive) return;
        if (d.stickers) setStickers(d.stickers);
        else say(d.error ?? "The wall is out of reach right now.");
      })
      .catch(() => alive && say("The wall is out of reach right now."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [say]);

  const slap = async (clientX: number, clientY: number) => {
    const door = doorRef.current;
    if (!door || busy) return;
    const r = door.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    const rotation = Math.round((Math.random() - 0.5) * 44);
    const scale = Math.round((0.85 + Math.random() * 0.3) * 100) / 100;
    const tempId = -Date.now();
    const optimistic: Local = { id: tempId, design, x, y, rotation, scale, createdAt: new Date().toISOString(), mine: true };
    setStickers((s) => [...s, optimistic]);
    setBusy(true);
    try {
      const res = await fetch("/api/stickers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ design, x, y, rotation, scale }) });
      const d = (await res.json()) as { sticker?: WallSticker; error?: string };
      if (!res.ok || !d.sticker) {
        setStickers((s) => s.filter((k) => k.id !== tempId));
        say(d.error ?? "That one didn't stick.");
      } else {
        const real = d.sticker;
        setStickers((s) => s.map((k) => (k.id === tempId ? { ...real, mine: true } : k)));
      }
    } catch {
      setStickers((s) => s.filter((k) => k.id !== tempId));
      say("That one didn't stick.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* the door */}
      <div
        ref={doorRef}
        role="button"
        tabIndex={0}
        aria-label={`Bathroom door with ${stickers.length} stickers. Click anywhere to slap on a ${STICKER_LABELS[design]} sticker.`}
        onClick={(e) => slap(e.clientX, e.clientY)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const r = doorRef.current?.getBoundingClientRect();
            if (r) slap(r.left + r.width * (0.2 + Math.random() * 0.6), r.top + r.height * (0.15 + Math.random() * 0.7));
          }
        }}
        className={cn("relative w-full max-w-[860px] select-none overflow-hidden rounded-[6px] cursor-crosshair outline-none focus-visible:ring-2 focus-visible:ring-phosphor", "shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.05)]")}
        style={{ aspectRatio: vp.mobile ? "3 / 4" : "16 / 10", background: "linear-gradient(180deg,#232523 0%,#1b1d1b 60%,#161816 100%)" }}
      >
        {/* paint, scuffs, panels */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 625" aria-hidden>
          <rect width="1000" height="625" fill="url(#paperGrain)" opacity="0.35" />
          <g fill="none" stroke="#0d0f0d" strokeWidth="3" opacity="0.9">
            <rect x="70" y="50" width="380" height="240" rx="6" />
            <rect x="550" y="50" width="380" height="240" rx="6" />
            <rect x="70" y="340" width="380" height="240" rx="6" />
            <rect x="550" y="340" width="380" height="240" rx="6" />
          </g>
          <g fill="none" stroke="#3a3d39" strokeWidth="1.5" opacity="0.7">
            <rect x="78" y="58" width="364" height="224" rx="4" />
            <rect x="558" y="58" width="364" height="224" rx="4" />
            <rect x="78" y="348" width="364" height="224" rx="4" />
            <rect x="558" y="348" width="364" height="224" rx="4" />
          </g>
          {/* scratches and old marker */}
          <g stroke="#6a6d66" strokeWidth="1" opacity="0.5" strokeLinecap="round">
            <path d="M120 420 l60 -14 M130 440 l40 -3 M600 120 l90 30 M640 140 l40 -22 M840 520 l-70 -30" />
          </g>
          <g stroke="#b9b7ad" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5">
            <path d="M160 180 l6 70 M176 180 l6 70 M192 180 l6 70 M208 180 l6 70 M150 230 l80 -30" />
            <path d="M700 420 q30 -40 70 -10 t60 10" />
            <path d="M820 100 l40 0 l-12 -12 m12 12 l-12 12" />
          </g>
          {/* kick plate */}
          <rect x="0" y="585" width="1000" height="40" fill="url(#kick)" />
          <defs>
            <linearGradient id="kick" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#8e8f8a" />
              <stop offset="0.5" stopColor="#5f605c" />
              <stop offset="1" stopColor="#8a8b86" />
            </linearGradient>
          </defs>
          {/* handle + plate */}
          <rect x="930" y="300" width="22" height="80" rx="4" fill="#9a9b96" stroke="#55564f" />
          <rect x="936" y="310" width="10" height="60" rx="3" fill="#6e6f6a" />
          <rect x="430" y="12" width="140" height="22" rx="2" fill="#c9c5b8" opacity="0.9" />
          <text x="500" y="27" textAnchor="middle" fontFamily="var(--font-courier)" fontWeight="700" fontSize="11" fill="#2a2b28" letterSpacing="3">
            STAFF ONLY
          </text>
        </svg>

        {/* stickers */}
        <AnimatePresence initial={false}>
          {stickers.map((s) => (
            <motion.div
              key={s.id}
              className="absolute pointer-events-none"
              style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: stickerSize, height: stickerSize, marginLeft: -stickerSize / 2, marginTop: -stickerSize / 2 }}
              initial={s.mine && !reduce ? { scale: 1.9, rotate: s.rotation - 18, opacity: 0.6 } : { scale: s.scale, rotate: s.rotation, opacity: 1 }}
              animate={{ scale: s.scale, rotate: s.rotation, opacity: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 18, mass: 0.7 }}
            >
              <StickerArt id={s.design} size={stickerSize} />
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] uppercase tracking-[0.18em] text-[#9a9b96]">Finding the door…</div>
        )}
        {!loading && stickers.length === 0 && (
          <div className="absolute inset-x-0 bottom-16 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-[#9a9b96] pointer-events-none">Clean door. You go first.</div>
        )}
      </div>

      {/* the sticker sheet */}
      <div className="w-full max-w-[860px]">
        <div className="flex items-baseline justify-between mb-2 px-1">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-soft">Peel one, then slap the door</span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-faint">{stickers.length} on the wall</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1 rounded-xl bg-paper-lit/70 border border-ink/10" role="radiogroup" aria-label="Sticker designs">
          {STICKER_IDS.map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={design === id}
              aria-label={STICKER_LABELS[id]}
              onClick={() => setDesign(id)}
              className={cn("shrink-0 rounded-lg p-1 cursor-pointer transition-transform", design === id ? "bg-ink/10 scale-105 ring-2 ring-stamp" : "hover:bg-ink/5")}
            >
              <StickerArt id={id} size={vp.mobile ? 52 : 60} />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 font-mono text-[11.5px] uppercase tracking-[0.14em] px-4 py-2 rounded-full bg-ink text-paper-lit shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
