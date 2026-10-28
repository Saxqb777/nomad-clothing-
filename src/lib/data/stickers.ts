export const STICKER_IDS = [
  "nomad-round",
  "one-of-one",
  "was-here",
  "arrow-up",
  "keep-digging",
  "cassette",
  "van",
  "no-photos",
  "coffee-ring",
  "sun-riot",
  "hollow-crown",
  "road-worn",
] as const;

export type StickerId = (typeof STICKER_IDS)[number];

export const isStickerId = (s: unknown): s is StickerId => typeof s === "string" && (STICKER_IDS as readonly string[]).includes(s);

export interface WallSticker {
  id: number;
  design: StickerId;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  createdAt: string;
}

/** Per visitor: at most this many stickers per minute. */
export const RATE_LIMIT = { perMinute: 6, perHour: 40 };
