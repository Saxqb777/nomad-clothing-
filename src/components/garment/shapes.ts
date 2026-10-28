import type { GarmentType } from "@/lib/data/types";

export const VIEW_W = 300;
export const VIEW_H = 380;

export interface GarmentShape {
  body: string;
  /** Collar / neck binding, drawn on top of the body. */
  collarBand: string;
  /** Inside of the back collar, visible above the front neckline. */
  collarBack: string;
  /** The outer neckline curve, used for fray threads. Sampled as cubic bezier. */
  neckline: [number, number][];
  /** Hem line segments for hem stitching. */
  hem: string;
  /** Sleeve / armhole seams. */
  seams: string[];
  /** Where the front print sits. */
  front: { x: number; y: number; w: number; h: number };
  back: { x: number; y: number; w: number; h: number };
  /** Vertical drape fold centres (x) and their start y. */
  folds: Array<{ x: number; y0: number; y1: number; w: number; dark: boolean }>;
  /** Approximate garment bottom for layout. */
  bottom: number;
}

const TEE: GarmentShape = {
  body:
    "M112 54 C100 58 78 62 62 68 L24 140 C36 152 58 158 74 160 L86 134 C83 200 80 280 78 350 C120 358 180 358 222 350 C220 280 217 200 214 134 L226 160 C242 158 264 152 276 140 L238 68 C222 62 200 58 188 54 C176 70 124 70 112 54 Z",
  collarBand: "M112 54 C124 70 176 70 188 54 L185 57 C176 78 124 78 115 57 Z",
  collarBack: "M112 54 C124 46 176 46 188 54 C176 60 124 60 112 54 Z",
  neckline: [
    [112, 54],
    [124, 70],
    [176, 70],
    [188, 54],
  ],
  hem: "M80 344 C120 352 180 352 220 344",
  seams: ["M86 134 L74 160", "M214 134 L226 160", "M62 68 L112 54", "M238 68 L188 54"],
  front: { x: 82, y: 108, w: 136, h: 156 },
  back: { x: 82, y: 92, w: 136, h: 210 },
  folds: [
    { x: 104, y0: 150, y1: 350, w: 16, dark: true },
    { x: 196, y0: 150, y1: 350, w: 16, dark: true },
    { x: 136, y0: 170, y1: 350, w: 12, dark: false },
    { x: 166, y0: 170, y1: 350, w: 12, dark: false },
  ],
  bottom: 356,
};

const LONGSLEEVE: GarmentShape = {
  body:
    "M112 54 C100 58 78 62 62 68 C44 150 30 230 28 300 C32 312 50 314 64 306 L86 134 C83 200 80 280 78 350 C120 358 180 358 222 350 C220 280 217 200 214 134 L236 306 C250 314 268 312 272 300 C270 230 256 150 238 68 C222 62 200 58 188 54 C176 70 124 70 112 54 Z",
  collarBand: TEE.collarBand,
  collarBack: TEE.collarBack,
  neckline: TEE.neckline,
  hem: TEE.hem,
  seams: ["M86 134 L64 306", "M214 134 L236 306", "M62 68 L112 54", "M238 68 L188 54", "M30 296 C36 304 52 306 62 300", "M238 300 C248 306 264 304 270 296"],
  front: { x: 86, y: 108, w: 128, h: 156 },
  back: { x: 86, y: 92, w: 128, h: 210 },
  folds: [
    { x: 104, y0: 150, y1: 350, w: 16, dark: true },
    { x: 196, y0: 150, y1: 350, w: 16, dark: true },
    { x: 136, y0: 170, y1: 350, w: 12, dark: false },
    { x: 166, y0: 170, y1: 350, w: 12, dark: false },
    { x: 48, y0: 90, y1: 300, w: 10, dark: true },
    { x: 252, y0: 90, y1: 300, w: 10, dark: true },
  ],
  bottom: 356,
};

const TANK: GarmentShape = {
  body:
    "M118 52 C108 55 100 58 94 62 C90 90 82 118 82 140 C81 200 79 280 78 350 C120 358 180 358 222 350 C221 280 219 200 218 140 C218 118 210 90 206 62 C200 58 192 55 182 52 C170 86 130 86 118 52 Z",
  collarBand: "M118 52 C130 86 170 86 182 52 L179 55 C170 92 130 92 121 55 Z",
  collarBack: "M118 52 C130 45 170 45 182 52 C170 58 130 58 118 52 Z",
  neckline: [
    [118, 52],
    [130, 86],
    [170, 86],
    [182, 52],
  ],
  hem: TEE.hem,
  seams: ["M94 62 C90 90 82 118 82 140", "M206 62 C218 118 218 140 218 140"],
  front: { x: 96, y: 118, w: 108, h: 140 },
  back: { x: 96, y: 100, w: 108, h: 196 },
  folds: [
    { x: 110, y0: 160, y1: 350, w: 14, dark: true },
    { x: 190, y0: 160, y1: 350, w: 14, dark: true },
    { x: 150, y0: 180, y1: 350, w: 14, dark: false },
  ],
  bottom: 356,
};

export const SHAPES: Record<GarmentType, GarmentShape> = {
  tee: TEE,
  longsleeve: LONGSLEEVE,
  tank: TANK,
};

/** Wire hanger, drawn before the garment so the body hides the shoulders. */
export const HANGER = {
  hook: "M150 32 V18 C150 5 138 3 136 11",
  shoulders: "M150 32 L58 70 Q150 78 242 70 L150 32 Z",
};

/** Evaluate a cubic bezier at t. */
export function cubic(p: [number, number][], t: number): [number, number] {
  const [p0, p1, p2, p3] = p;
  const mt = 1 - t;
  return [
    mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0],
    mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1],
  ];
}
