import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { isStickerId, RATE_LIMIT, type WallSticker } from "@/lib/data/stickers";

async function visitorHash(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";
  const ua = req.headers.get("user-agent") || "";
  const salt = process.env.STICKER_SALT || "nomad-wall";
  const data = new TextEncoder().encode(`${salt}|${ip}|${ua}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest).slice(0, 12))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type Row = { id: number; design: string; x: number; y: number; rotation: number; scale: number; created_at: string };

const toSticker = (r: Row): WallSticker => ({
  id: Number(r.id),
  design: r.design as WallSticker["design"],
  x: Number(r.x),
  y: Number(r.y),
  rotation: Number(r.rotation),
  scale: Number(r.scale),
  createdAt: String(r.created_at),
});

export async function GET() {
  try {
    const rows = (await sql()`SELECT id, design, x, y, rotation, scale, created_at FROM stickers ORDER BY id DESC LIMIT 600`) as Row[];
    return Response.json({ stickers: rows.reverse().map(toSticker) }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "The wall is out of reach right now." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad sticker." }, { status: 400 });
  }
  const b = body as { design?: unknown; x?: unknown; y?: unknown; rotation?: unknown; scale?: unknown };
  const x = Number(b.x);
  const y = Number(b.y);
  const rotation = Number(b.rotation ?? 0);
  const scale = Number(b.scale ?? 1);
  if (!isStickerId(b.design) || !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1 || !Number.isFinite(rotation) || Math.abs(rotation) > 60 || !Number.isFinite(scale) || scale < 0.6 || scale > 1.4) {
    return Response.json({ error: "Bad sticker." }, { status: 400 });
  }
  const visitor = await visitorHash(req);
  try {
    const q = sql();
    const [counts] = (await q`
      SELECT
        COUNT(*) FILTER (WHERE created_at > now() - interval '1 minute') AS minute,
        COUNT(*) FILTER (WHERE created_at > now() - interval '1 hour') AS hour
      FROM stickers WHERE visitor_hash = ${visitor}
    `) as Array<{ minute: string; hour: string }>;
    if (Number(counts.minute) >= RATE_LIMIT.perMinute || Number(counts.hour) >= RATE_LIMIT.perHour) {
      return Response.json({ error: "Easy. The wall needs a minute to dry." }, { status: 429, headers: { "Retry-After": "60" } });
    }
    const [row] = (await q`
      INSERT INTO stickers (design, x, y, rotation, scale, visitor_hash)
      VALUES (${b.design}, ${x}, ${y}, ${rotation}, ${scale}, ${visitor})
      RETURNING id, design, x, y, rotation, scale, created_at
    `) as Row[];
    return Response.json({ sticker: toSticker(row) }, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "The wall is out of reach right now." }, { status: 500 });
  }
}
