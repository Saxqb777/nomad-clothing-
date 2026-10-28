import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { StickerWall } from "@/components/wall/StickerWall";

export const metadata: Metadata = {
  title: "Sticker wall — NOMAD",
  description: "The venue bathroom door. Slap a sticker on it; everyone sees it.",
};

export default function WallPage() {
  return (
    <main className="sweep min-h-screen flex flex-col">
      <header className="relative flex justify-center pt-6 pb-4 px-4">
        <Link href="/" className="absolute left-4 sm:left-6 top-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] hover:text-stamp">
          <ArrowLeft size={14} /> <span className="hidden sm:inline">Back to the rail</span>
        </Link>
        <Wordmark small />
      </header>
      <section className="flex-1 flex flex-col items-center px-3 sm:px-6 pb-16">
        <div className="text-center mb-5 max-w-[560px]">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">Sticker wall</div>
          <h1 className="font-display font-extrabold text-[30px] sm:text-[40px] leading-[0.95] tracking-tight mt-1" style={{ fontVariationSettings: "'wdth' 84, 'opsz' 60" }}>
            The bathroom door
          </h1>
          <p className="font-mono text-[12px] text-ink-soft mt-2">Everyone who passes through leaves a sticker. They stay. A few per minute, so pick your spot.</p>
        </div>
        <StickerWall />
      </section>
    </main>
  );
}
