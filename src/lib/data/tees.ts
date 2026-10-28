import type { Tee, Provenance, Size } from "./types";
import { BAND_BY_ID } from "./bands";

const sizes = (soldOut: Size[] = []): Tee["sizes"] =>
  (["S", "M", "L", "XL", "XXL"] as Size[]).map((size) => ({ size, soldOut: soldOut.includes(size) }));

export const CITIES: Record<string, Omit<Provenance, "year" | "story">> = {
  lisbon: { city: "Lisbon", country: "Portugal", lon: -9.14, lat: 38.72 },
  austin: { city: "Austin", country: "USA", lon: -97.74, lat: 30.27 },
  berlin: { city: "Berlin", country: "Germany", lon: 13.4, lat: 52.52 },
  tokyo: { city: "Tokyo", country: "Japan", lon: 139.69, lat: 35.69 },
  seoul: { city: "Seoul", country: "South Korea", lon: 126.98, lat: 37.57 },
  melbourne: { city: "Melbourne", country: "Australia", lon: 144.96, lat: -37.81 },
  mexicocity: { city: "Mexico City", country: "Mexico", lon: -99.13, lat: 19.43 },
  buenosaires: { city: "Buenos Aires", country: "Argentina", lon: -58.38, lat: -34.6 },
  reykjavik: { city: "Reykjavik", country: "Iceland", lon: -21.94, lat: 64.15 },
  marrakech: { city: "Marrakech", country: "Morocco", lon: -7.98, lat: 31.63 },
  chicago: { city: "Chicago", country: "USA", lon: -87.63, lat: 41.88 },
};

const found = (key: keyof typeof CITIES, year: number, story: string): Provenance => ({
  ...CITIES[key],
  year,
  story,
});

export const TEES: Tee[] = [
  {
    id: "velvet-static-low-signal",
    bandId: "velvet-static",
    print: "velvet-static",
    garment: "tee",
    price: 640,
    colourways: ["jet-black", "faded-coal", "bone"],
    defaultColourway: "faded-coal",
    sizes: sizes(["S", "XXL"]),
    foundIn: found("lisbon", 2019, "Bottom of a crate at Feira da Ladra, under forty copies of the same fado record."),
    seed: 11,
  },
  {
    id: "dust-coyote-mojave-nights",
    bandId: "dust-coyote",
    print: "dust-coyote",
    garment: "tee",
    price: 820,
    colourways: ["sun-bleached", "bone", "jet-black"],
    defaultColourway: "sun-bleached",
    sizes: sizes(["M"]),
    foundIn: found("austin", 2021, "Thrift bin on South Congress, still smelling faintly of campfire."),
    seed: 23,
  },
  {
    id: "paper-saints-cut-and-paste",
    bandId: "paper-saints",
    print: "paper-saints",
    garment: "tee",
    price: 560,
    colourways: ["bone", "jet-black", "faded-coal"],
    defaultColourway: "bone",
    sizes: sizes(["L", "XL"]),
    foundIn: found("berlin", 2018, "A Mauerpark seller swore it belonged to the drummer. It did not. Still great."),
    seed: 37,
  },
  {
    id: "hollow-kings-crown-of-rust",
    bandId: "hollow-kings",
    print: "hollow-kings",
    garment: "tee",
    price: 1150,
    colourways: ["jet-black", "faded-coal"],
    defaultColourway: "jet-black",
    sizes: sizes(["S", "M", "XXL"]),
    foundIn: found("tokyo", 2022, "Crate behind a Shimokitazawa record store, between a broken amp and a cat."),
    seed: 41,
  },
  {
    id: "neon-mirage-night-drive",
    bandId: "neon-mirage",
    print: "neon-mirage",
    garment: "tee",
    price: 720,
    colourways: ["jet-black", "faded-coal", "bone"],
    defaultColourway: "jet-black",
    sizes: sizes(["XL"]),
    foundIn: found("seoul", 2023, "Dongmyo flea market, 6am, from a man who only sold things in pairs."),
    seed: 53,
  },
  {
    id: "rust-parade-sawdust",
    bandId: "rust-parade",
    print: "rust-parade",
    garment: "tee",
    price: 590,
    colourways: ["army", "faded-coal", "jet-black", "bone"],
    defaultColourway: "army",
    sizes: sizes(["S"]),
    foundIn: found("melbourne", 2020, "Fitzroy op shop, filed under 'workwear' for reasons nobody could explain."),
    seed: 67,
  },
  {
    id: "black-orchid-club-wilted",
    bandId: "black-orchid-club",
    print: "black-orchid-club",
    garment: "tee",
    price: 880,
    colourways: ["jet-black", "faded-coal"],
    defaultColourway: "jet-black",
    sizes: sizes(["M", "L"]),
    foundIn: found("mexicocity", 2019, "Tianguis de la Lagunilla, wrapped around a cracked porcelain saint."),
    seed: 71,
  },
  {
    id: "sun-riot-wipeout-summer",
    bandId: "sun-riot",
    print: "sun-riot",
    garment: "tank",
    price: 480,
    colourways: ["bone", "sun-bleached", "jet-black"],
    defaultColourway: "bone",
    sizes: sizes(["XXL", "XL"]),
    foundIn: found("buenosaires", 2022, "San Telmo Sunday market, traded for two cold Quilmes and a sticker."),
    seed: 83,
  },
  {
    id: "glass-harbour-tideline",
    bandId: "glass-harbour",
    print: "glass-harbour",
    garment: "longsleeve",
    price: 760,
    colourways: ["bone", "faded-coal", "army"],
    defaultColourway: "bone",
    sizes: sizes(["S", "M"]),
    foundIn: found("reykjavik", 2021, "Kolaportið flea market, in a box marked 'wool' that contained no wool."),
    seed: 97,
  },
  {
    id: "copper-hymnal-revival",
    bandId: "copper-hymnal",
    print: "copper-hymnal",
    garment: "tee",
    price: 980,
    colourways: ["bone", "sun-bleached"],
    defaultColourway: "sun-bleached",
    sizes: sizes(["L", "XL", "XXL"]),
    foundIn: found("marrakech", 2018, "A souk stall near Jemaa el-Fna, hanging between two kaftans like it had always been there."),
    seed: 101,
  },
  {
    id: "lantern-youth-basement",
    bandId: "lantern-youth",
    print: "lantern-youth",
    garment: "longsleeve",
    price: 420,
    colourways: ["army", "jet-black", "bone"],
    defaultColourway: "army",
    sizes: sizes(["XXL"]),
    foundIn: found("chicago", 2023, "Wicker Park basement sale, next to a stack of burned CD-Rs labelled 'demos 3'."),
    seed: 113,
  },
  {
    id: "pale-radio-dead-air",
    bandId: "pale-radio",
    print: "pale-radio",
    garment: "tee",
    price: 380,
    colourways: ["faded-coal", "bone", "jet-black"],
    defaultColourway: "faded-coal",
    sizes: sizes([]),
    foundIn: found("austin", 2021, "Same thrift bin as the Dust Coyote, two rows down, same campfire."),
    seed: 127,
  },
];

export const TEE_BY_ID: Record<string, Tee> = Object.fromEntries(TEES.map((t) => [t.id, t]));

export const bandOf = (tee: Tee) => BAND_BY_ID[tee.bandId];

/** Cities in the order the road trip happened (by found year, then name). */
export const ROUTE_STOPS = (() => {
  const seen = new Map<string, { city: string; country: string; lon: number; lat: number; year: number; teeIds: string[] }>();
  for (const t of [...TEES].sort((a, b) => a.foundIn.year - b.foundIn.year || a.foundIn.city.localeCompare(b.foundIn.city))) {
    const key = t.foundIn.city;
    const cur = seen.get(key);
    if (cur) cur.teeIds.push(t.id);
    else
      seen.set(key, {
        city: t.foundIn.city,
        country: t.foundIn.country,
        lon: t.foundIn.lon,
        lat: t.foundIn.lat,
        year: t.foundIn.year,
        teeIds: [t.id],
      });
  }
  return [...seen.values()];
})();
