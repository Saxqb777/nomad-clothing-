import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({ className, small }: { className?: string; small?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex flex-col items-center no-underline text-current", className)} aria-label="NOMAD home">
      <span
        className={cn("font-display font-extrabold leading-none tracking-[0.34em] select-none", small ? "text-[22px]" : "text-[34px] sm:text-[42px]")}
        style={{ fontVariationSettings: "'wdth' 78, 'opsz' 96", marginRight: "-0.34em" }}
      >
        NOMAD
      </span>
      {!small && (
        <span className="font-mono text-[10.5px] sm:text-[11px] tracking-[0.18em] uppercase text-ink-soft mt-2">one-of-one tees · found on the road</span>
      )}
    </Link>
  );
}
