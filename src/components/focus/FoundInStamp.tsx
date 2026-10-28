import { usePid } from "@/components/garment/prints/common";

/** A customs-style postmark: where the tee was found and when. */
export function FoundInStamp({ city, country, year, size = 112, className }: { city: string; country: string; year: number; size?: number; className?: string }) {
  const id = usePid();
  const r = 50;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} style={{ filter: "url(#stampInk)", transform: "rotate(-7deg)" }} aria-label={`Found in ${city}, ${country}, ${year}`} role="img">
      <defs>
        <path id={`top${id}`} d={`M ${60 - r + 10} 60 A ${r - 10} ${r - 10} 0 0 1 ${60 + r - 10} 60`} />
        <path id={`bot${id}`} d={`M ${60 - r + 10} 60 A ${r - 10} ${r - 10} 0 0 0 ${60 + r - 10} 60`} />
      </defs>
      <g fill="none" stroke="var(--color-stamp)" strokeWidth="2.2">
        <circle cx="60" cy="60" r={r} />
        <circle cx="60" cy="60" r={r - 4} strokeWidth="1" />
        <circle cx="60" cy="60" r={r - 22} strokeWidth="1.2" />
      </g>
      <g fill="var(--color-stamp)" fontFamily="var(--font-courier)" fontWeight="700" letterSpacing="2">
        <text fontSize="10.5">
          <textPath href={`#top${id}`} startOffset="50%" textAnchor="middle">
            {city.toUpperCase()}
          </textPath>
        </text>
        <text fontSize="8.5" letterSpacing="2.4">
          <textPath href={`#bot${id}`} startOffset="50%" textAnchor="middle">
            {country.toUpperCase()}
          </textPath>
        </text>
        <text x="60" y="56" textAnchor="middle" fontSize="7" letterSpacing="1.4">
          FOUND
        </text>
        <text x="60" y="69" textAnchor="middle" fontSize="13" fontFamily="var(--font-bricolage)" fontWeight="800" letterSpacing="1">
          {year}
        </text>
      </g>
    </svg>
  );
}
