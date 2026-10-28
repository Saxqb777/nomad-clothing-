"use client";

import Link from "next/link";
import { Lightbulb, Disc3, Volume2, VolumeX, Map, Shuffle, Sticker } from "lucide-react";
import { MorphToggle } from "@/components/smoothui/MorphToggle";
import { MagneticButton } from "@/components/smoothui/MagneticButton";
import { useNomad } from "@/components/state/store";
import { getAudio } from "@/lib/audio/engine";
import { cn } from "@/lib/utils";

interface Props {
  onDig: () => void;
  onRoute: () => void;
  onTable: () => void;
  digging?: boolean;
}

/** The bottom dock: switches on the left, the Dig button, and the merch table on the right. Icon-only on phones. */
export function Dock({ onDig, onRoute, onTable, digging }: Props) {
  const { settings, setSettings, cart } = useNomad();
  const out = settings.lights === "out";

  const toggleLights = (on: boolean) => setSettings({ lights: on ? "out" : "on" });
  const toggleSound = async (on: boolean) => {
    setSettings({ sound: on, ...(on ? {} : { needle: false }) });
    if (on) await getAudio().resume();
    else getAudio().suspend();
  };
  const toggleNeedle = async (on: boolean) => {
    setSettings({ needle: on, ...(on ? { sound: true } : {}) });
    if (on) await getAudio().resume();
    else getAudio().liftNeedle();
  };

  const panel = cn(
    "pointer-events-auto rounded-2xl border",
    out ? "bg-night-soft/92 border-white/10 text-[#d8d6d0]" : "bg-paper-lit/88 border-ink/10 text-ink",
  );
  const row = "flex items-center gap-2.5";
  const label = "font-mono text-[10.5px] uppercase tracking-[0.14em]";
  const iconBtn = (active: boolean) =>
    cn(
      "flex flex-col items-center justify-center gap-1 w-[46px] h-[50px] rounded-xl cursor-pointer transition-colors",
      active ? (out ? "bg-phosphor/15 text-phosphor" : "bg-stamp/12 text-stamp") : out ? "text-[#b9b7b0]" : "text-ink-soft",
    );
  const tiny = "font-mono text-[8px] uppercase tracking-[0.1em] leading-none";

  const tableIcon = (
    <span className="relative block w-7 h-5" aria-hidden>
      <span className={cn("absolute inset-x-0 top-0 h-[7px] rounded-[2px]", out ? "bg-[#d8d6d0]" : "bg-ink")} />
      <span className={cn("absolute left-[3px] top-[8px] w-[2px] h-[12px]", out ? "bg-[#d8d6d0]" : "bg-ink")} />
      <span className={cn("absolute right-[3px] top-[8px] w-[2px] h-[12px]", out ? "bg-[#d8d6d0]" : "bg-ink")} />
    </span>
  );

  const dig = (
    <MagneticButton
      onClick={onDig}
      aria-label="Dig the crate: shuffle the rail and land on a random tee"
      className={cn(
        "pointer-events-auto shrink-0 rounded-full w-[64px] h-[64px] sm:w-[84px] sm:h-[84px] flex flex-col items-center justify-center border-2 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] font-display font-extrabold",
        out ? "bg-phosphor text-night border-phosphor" : "bg-ink text-paper-lit border-ink hover:bg-stamp hover:border-stamp",
        digging && "animate-pulse",
      )}
    >
      <Shuffle size={18} />
      <span className="text-[10px] sm:text-[11px] tracking-[0.16em] mt-0.5 sm:mt-1" style={{ fontVariationSettings: "'wdth' 80" }}>
        DIG
      </span>
    </MagneticButton>
  );

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[60] px-2 sm:px-6 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 pointer-events-none" aria-label="Controls">
      {/* phones: one compact row */}
      <div className="sm:hidden flex items-end justify-between gap-2">
        <div className={cn(panel, "flex items-center gap-0.5 px-1 py-1")}>
          <button type="button" role="switch" aria-checked={out} aria-label="Lights out" onClick={() => toggleLights(!out)} className={iconBtn(out)}>
            <Lightbulb size={17} />
            <span className={tiny}>Lights</span>
          </button>
          <button type="button" role="switch" aria-checked={settings.sound} aria-label="Sound" onClick={() => toggleSound(!settings.sound)} className={iconBtn(settings.sound)}>
            {settings.sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
            <span className={tiny}>Sound</span>
          </button>
          <button type="button" role="switch" aria-checked={settings.needle} aria-label="Needle drop: play the band's loop" onClick={() => toggleNeedle(!settings.needle)} className={iconBtn(settings.needle)}>
            <Disc3 size={17} className={cn(settings.needle && "animate-[spin_3s_linear_infinite]")} />
            <span className={tiny}>Needle</span>
          </button>
          <button type="button" aria-label="Route: where every tee was found" onClick={onRoute} className={iconBtn(false)}>
            <Map size={17} />
            <span className={tiny}>Route</span>
          </button>
          <Link href="/wall" aria-label="Sticker wall" className={iconBtn(false)}>
            <Sticker size={17} />
            <span className={tiny}>Wall</span>
          </Link>
        </div>
        {dig}
        <button type="button" onClick={onTable} className={cn(panel, "flex items-center gap-2 px-3 py-3 cursor-pointer")} aria-label={`Merch table, ${cart.length} item${cart.length === 1 ? "" : "s"}`}>
          {tableIcon}
          <span className={cn("font-display font-bold text-[12px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center", cart.length ? "bg-stamp text-paper-lit" : out ? "bg-white/10" : "bg-ink/10")}>{cart.length}</span>
        </button>
      </div>

      {/* larger screens */}
      <div className="hidden sm:flex mx-auto max-w-[1180px] items-end justify-between gap-3">
        <div className={cn(panel, "flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3")}>
          <div className={row}>
            <Lightbulb size={15} className={out ? "text-phosphor" : "text-ink-soft"} />
            <span className={label}>Lights</span>
            <MorphToggle size="sm" label="Lights out" checked={out} onChange={toggleLights} onColor="#3a3a44" />
          </div>
          <div className={row}>
            <Volume2 size={15} className={out ? "text-phosphor/80" : "text-ink-soft"} />
            <span className={label}>Sound</span>
            <MorphToggle size="sm" label="Sound" checked={settings.sound} onChange={toggleSound} />
          </div>
          <div className={row}>
            <Disc3 size={15} className={cn(settings.needle && "animate-[spin_3s_linear_infinite]", out ? "text-phosphor/80" : "text-ink-soft")} />
            <span className={label}>Needle drop</span>
            <MorphToggle size="sm" label="Needle drop: play the band's loop" checked={settings.needle} onChange={toggleNeedle} />
          </div>
          <button type="button" onClick={onRoute} className={cn(row, "cursor-pointer hover:text-stamp")}>
            <Map size={15} />
            <span className={label}>Route</span>
          </button>
          <Link href="/wall" className={cn(row, "hover:text-stamp")}>
            <Sticker size={15} />
            <span className={label}>Sticker wall</span>
          </Link>
        </div>
        {dig}
        <button type="button" onClick={onTable} className={cn(panel, "flex items-center gap-3 px-4 py-3 cursor-pointer", out ? "hover:border-phosphor/50" : "hover:border-ink/40")} aria-label={`Merch table, ${cart.length} item${cart.length === 1 ? "" : "s"}`}>
          {tableIcon}
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em]">Merch table</span>
          <span className={cn("font-display font-bold text-[13px] min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center", cart.length ? "bg-stamp text-paper-lit" : out ? "bg-white/10" : "bg-ink/10")}>{cart.length}</span>
        </button>
      </div>
    </nav>
  );
}
