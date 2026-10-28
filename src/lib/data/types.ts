export type GarmentType = "tee" | "longsleeve" | "tank";

export type ColourwayId =
  | "jet-black"
  | "faded-coal"
  | "bone"
  | "sun-bleached"
  | "army";

export interface Colourway {
  id: ColourwayId;
  name: string;
  /** Fabric colour fresh off the press. */
  fresh: string;
  /** Fabric colour after thirty years on tour. */
  washed: string;
  /** Which ink palette a print should use on this base. */
  base: "dark" | "light";
  /** Stitching thread colour. */
  thread: string;
}

export type Size = "S" | "M" | "L" | "XL" | "XXL";

export interface TourDate {
  date: string;
  city: string;
  venue: string;
}

export type PrintId =
  | "velvet-static"
  | "dust-coyote"
  | "paper-saints"
  | "hollow-kings"
  | "neon-mirage"
  | "rust-parade"
  | "black-orchid-club"
  | "sun-riot"
  | "glass-harbour"
  | "copper-hymnal"
  | "lantern-youth"
  | "pale-radio";

export type Waveform = "sine" | "square" | "sawtooth" | "triangle";

/** A band's sound signature, rendered live by the Web Audio engine. */
export interface SoundSignature {
  bpm: number;
  /** 0..1 shuffle amount applied to off-beat 16ths. */
  swing: number;
  /** Semitone offset from A2 (110Hz) for the key. */
  root: number;
  /** 16-step patterns, 2 bars (32 chars). x = hit, . = rest, o = open hat / accent. */
  kick: string;
  snare: string;
  hat: string;
  /** Bass line: step index -> semitone offset (relative to root), with length in steps. */
  bass: Array<[step: number, semis: number, len: number]>;
  /** Lead / chord stabs: step -> semitone offsets (chord) and length. */
  lead: Array<[step: number, semis: number[], len: number]>;
  timbre: {
    bassOsc: Waveform;
    leadOsc: Waveform;
    /** Waveshaper drive 0..1. */
    fuzz: number;
    /** Lowpass cutoff in Hz for lead. */
    cutoff: number;
    /** Delay mix 0..1. */
    delay: number;
    /** Chorus depth 0..1. */
    chorus: number;
    /** Detune in cents between unison voices. */
    detune: number;
    /** Snare tail length (seconds). Gated 80s snare uses ~0.28. */
    snareTail: number;
    /** Overall lead level. */
    leadLevel: number;
    /** Octave of the lead relative to root (0 = same octave as bass + 1). */
    leadOctave: number;
  };
}

export interface Band {
  id: string;
  name: string;
  genre: string;
  year: number;
  tour: string;
  dates: TourDate[];
  print: PrintId;
  /** Parts of the print glow in the dark. */
  glow: boolean;
  sound: SoundSignature;
}

export interface Provenance {
  city: string;
  country: string;
  year: number;
  story: string;
  /** Longitude / latitude for the Route map. */
  lon: number;
  lat: number;
}

export interface Tee {
  id: string;
  bandId: string;
  garment: GarmentType;
  /** Price in AED. */
  price: number;
  colourways: ColourwayId[];
  defaultColourway: ColourwayId;
  sizes: Array<{ size: Size; soldOut: boolean }>;
  foundIn: Provenance;
  /** Deterministic seed for wear, pinholes and fray. */
  seed: number;
  /** Which print this tee carries. */
  print: PrintId;
}

export type ConditionGrade =
  | "Mint"
  | "Lightly worn"
  | "Worn in"
  | "Well loved"
  | "Road worn";
