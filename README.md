# NOMAD

A demo rack of one-of-one vintage band tees, found on the road. Prototype.

- Next.js (App Router) · TypeScript · Tailwind v4 · Motion · SmoothUI adaptations
- Every garment is drawn in code (SVG): fabric shading, jersey grain, folds, prints, and a wear layer
- Product data lives in `src/lib/data` (typed). Neon Postgres is used only for the Sticker Wall.

## Run

```
pnpm install
pnpm dev
```

Set `DATABASE_URL` (Neon) for the sticker wall API. Optional: `STICKER_SALT` for visitor hashing.

## Flags

Flip in the browser console: `localStorage.setItem("nomad:flag:<name>", "1" | "0")`. See `src/lib/flags.ts`.
