import type { StickerId } from "@/lib/data/stickers";
import { F } from "@/components/garment/prints/common";

/**
 * The fixed sticker set. Each is drawn in a 100x100 box with a die-cut white
 * border so they read as real vinyl on a painted door.
 */
export function StickerArt({ id, size = 96 }: { id: StickerId; size?: number }) {
  const border = "#f4f1ea";
  const inner = (() => {
    switch (id) {
      case "nomad-round":
        return (
          <g>
            <circle cx="50" cy="50" r="42" fill="#17161a" stroke={border} strokeWidth="6" />
            <circle cx="50" cy="50" r="33" fill="none" stroke="#f4f1ea" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="50" y="56" textAnchor="middle" fontFamily={F.display} fontWeight="800" fontSize="17" fill="#f4f1ea" letterSpacing="3" style={{ fontVariationSettings: "'wdth' 78" }}>
              NOMAD
            </text>
          </g>
        );
      case "one-of-one":
        return (
          <g>
            <rect x="6" y="28" width="88" height="44" rx="4" fill="#fffdf5" stroke={border} strokeWidth="5" />
            {Array.from({ length: 18 }, (_, i) => (
              <rect key={i} x={14 + i * 4} y="36" width={i % 3 === 0 ? 2.4 : 1.2} height="18" fill="#17161a" />
            ))}
            <text x="50" y="66" textAnchor="middle" fontFamily={F.courier} fontWeight="700" fontSize="9" fill="#17161a" letterSpacing="2">
              1 OF 1
            </text>
          </g>
        );
      case "was-here":
        return (
          <g>
            <path d="M8 40 h62 l22 10 l-22 10 h-62 z" fill="#2f3f8f" stroke={border} strokeWidth="5" strokeLinejoin="round" />
            <text x="40" y="54" textAnchor="middle" fontFamily={F.courier} fontWeight="700" fontSize="9.5" fill="#f4f1ea" letterSpacing="1.5">
              I WAS HERE
            </text>
          </g>
        );
      case "arrow-up":
        return (
          <g>
            <path d="M50 8 L84 46 L64 46 L64 90 L36 90 L36 46 L16 46 Z" fill="#f2b705" stroke={border} strokeWidth="5" strokeLinejoin="round" />
            <text x="50" y="80" textAnchor="middle" fontFamily={F.bangers} fontSize="13" fill="#17161a">
              RACK
            </text>
          </g>
        );
      case "keep-digging":
        return (
          <g>
            <rect x="6" y="32" width="88" height="36" rx="18" fill="#b3261e" stroke={border} strokeWidth="5" />
            <text x="50" y="55" textAnchor="middle" fontFamily={F.display} fontWeight="800" fontSize="11" fill="#fff" letterSpacing="1.5" style={{ fontVariationSettings: "'wdth' 80" }}>
              KEEP DIGGING
            </text>
          </g>
        );
      case "cassette":
        return (
          <g>
            <rect x="8" y="26" width="84" height="50" rx="5" fill="#2b2b30" stroke={border} strokeWidth="5" />
            <rect x="18" y="34" width="64" height="20" rx="3" fill="#e8dcc2" />
            <circle cx="36" cy="44" r="6" fill="#2b2b30" />
            <circle cx="64" cy="44" r="6" fill="#2b2b30" />
            <text x="50" y="68" textAnchor="middle" fontFamily={F.rocksalt} fontSize="7" fill="#e8dcc2">
              demos 3
            </text>
          </g>
        );
      case "van":
        return (
          <g>
            <path d="M10 62 L14 40 L34 30 L80 30 L90 44 L90 62 Z" fill="#cdb68e" stroke={border} strokeWidth="5" strokeLinejoin="round" />
            <rect x="38" y="36" width="16" height="12" fill="#2b2b30" />
            <rect x="60" y="36" width="16" height="12" fill="#2b2b30" />
            <circle cx="28" cy="64" r="8" fill="#17161a" stroke={border} strokeWidth="3" />
            <circle cx="74" cy="64" r="8" fill="#17161a" stroke={border} strokeWidth="3" />
          </g>
        );
      case "no-photos":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill="#f4f1ea" stroke={border} strokeWidth="5" />
            <rect x="30" y="40" width="40" height="26" rx="3" fill="#17161a" />
            <circle cx="50" cy="53" r="7" fill="#f4f1ea" />
            <rect x="40" y="34" width="14" height="7" fill="#17161a" />
            <line x1="22" y1="78" x2="78" y2="22" stroke="#b3261e" strokeWidth="7" strokeLinecap="round" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="#b3261e" strokeWidth="6" />
          </g>
        );
      case "coffee-ring":
        return (
          <g opacity="0.85">
            <circle cx="50" cy="50" r="36" fill="none" stroke="#6b3f21" strokeWidth="7" opacity="0.55" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="#8a5530" strokeWidth="3" strokeDasharray="20 6 12 9" opacity="0.7" />
            <circle cx="66" cy="34" r="4" fill="#6b3f21" opacity="0.45" />
          </g>
        );
      case "sun-riot":
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill="#ffd23f" stroke={border} strokeWidth="5" />
            <rect x="22" y="40" width="22" height="11" rx="2" fill="#17161a" />
            <rect x="56" y="40" width="22" height="11" rx="2" fill="#17161a" />
            <path d="M34 62 Q50 76 66 62" fill="none" stroke="#17161a" strokeWidth="3" />
            <text x="50" y="30" textAnchor="middle" fontFamily={F.bangers} fontSize="12" fill="#17161a" letterSpacing="1">
              SUN RIOT
            </text>
          </g>
        );
      case "hollow-crown":
        return (
          <g>
            <path d="M14 70 L18 32 L36 50 L50 20 L64 50 L82 32 L86 70 Z" fill="#17161a" stroke={border} strokeWidth="5" strokeLinejoin="round" />
            <circle cx="18" cy="32" r="4" fill="#b3261e" />
            <circle cx="50" cy="20" r="4" fill="#b3261e" />
            <circle cx="82" cy="32" r="4" fill="#b3261e" />
            <text x="50" y="66" textAnchor="middle" fontFamily={F.metal} fontSize="12" fill="#e9e2d1">
              HOLLOW
            </text>
          </g>
        );
      case "road-worn":
        return (
          <g transform="rotate(-8 50 50)">
            <rect x="8" y="34" width="84" height="32" rx="3" fill="#fffdf5" stroke={border} strokeWidth="5" />
            <rect x="13" y="39" width="74" height="22" rx="2" fill="none" stroke="#2f3f8f" strokeWidth="2" />
            <text x="50" y="55" textAnchor="middle" fontFamily={F.courier} fontWeight="700" fontSize="10" fill="#2f3f8f" letterSpacing="2">
              ROAD WORN
            </text>
          </g>
        );
    }
  })();
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.45))" }}>
      {inner}
    </svg>
  );
}

export const STICKER_LABELS: Record<StickerId, string> = {
  "nomad-round": "NOMAD round",
  "one-of-one": "One of one barcode",
  "was-here": "I was here",
  "arrow-up": "Arrow to the rack",
  "keep-digging": "Keep digging",
  cassette: "Cassette: demos 3",
  van: "Tour van",
  "no-photos": "No photos",
  "coffee-ring": "Coffee ring",
  "sun-riot": "Sun Riot",
  "hollow-crown": "Hollow Kings crown",
  "road-worn": "Road worn grade",
};
