import type { Colourway, ColourwayId } from "./types";

export const COLOURWAYS: Record<ColourwayId, Colourway> = {
  "jet-black": {
    id: "jet-black",
    name: "Jet Black",
    fresh: "#1a1b1f",
    washed: "#3a3b40",
    base: "dark",
    thread: "#2c2d31",
  },
  "faded-coal": {
    id: "faded-coal",
    name: "Faded Coal",
    fresh: "#44464a",
    washed: "#6a6c6e",
    base: "dark",
    thread: "#55575b",
  },
  bone: {
    id: "bone",
    name: "Bone",
    fresh: "#e6dfcd",
    washed: "#eee9dc",
    base: "light",
    thread: "#d3cab4",
  },
  "sun-bleached": {
    id: "sun-bleached",
    name: "Sun Bleached",
    fresh: "#d9b58f",
    washed: "#e8d2b5",
    base: "light",
    thread: "#c9a57e",
  },
  army: {
    id: "army",
    name: "Army",
    fresh: "#4f5a3e",
    washed: "#78806a",
    base: "dark",
    thread: "#5f6a4c",
  },
};

export const COLOURWAY_ORDER: ColourwayId[] = [
  "jet-black",
  "faded-coal",
  "bone",
  "sun-bleached",
  "army",
];
