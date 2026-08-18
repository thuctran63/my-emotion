import { Hono } from "hono";
import { cors } from "hono/cors";
import { entries } from "./db.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(d: string): boolean {
  if (!DATE_RE.test(d)) return false;
  const [y, m, day] = d.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === day;
}

function validateLevel(level: unknown): level is number {
  return typeof level === "number" && Number.isInteger(level) && level >= 1 && level <= 5;
}

function validateNote(note: unknown): note is string {
  return typeof note === "string" && note.length <= 5000;
}

export const app = new Hono();
app.use("/api/*", cors());

app.get("/api/health", (c) => c.json({ ok: true }));

// GET /api/entries?from=YYYY-MM-DD&to=YYYY-MM-DD → newest first
app.get("/api/entries", async (c) => {
  const from = c.req.query("from");
  const to = c.req.query("to");
  const q: { date?: { $gte?: string; $lte?: string } } = {};
  if (from) q.date = { ...(q.date ?? {}), $gte: from };
  if (to) q.date = { ...(q.date ?? {}), $lte: to };
  const docs = await (await entries()).find(q).sort({ date: -1 }).toArray();
  return c.json(
    docs.map(({ _id, ...d }) => ({ ...d, id: String(_id) }))
  );
});

// POST /api/entries — upsert by date. Body: { date, level, note? }
app.post("/api/entries", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== "object") return c.json({ error: "invalid_body" }, 400);
  const { date, level, note } = body as { date?: unknown; level?: unknown; note?: unknown };
  if (typeof date !== "string" || !isValidDate(date)) return c.json({ error: "invalid_date" }, 400);
  if (!validateLevel(level)) return c.json({ error: "invalid_level" }, 400);
  if (note !== undefined && !validateNote(note)) return c.json({ error: "invalid_note" }, 400);

  const now = new Date();
  const update: Record<string, unknown> = {
    $set: { level, ...(note !== undefined ? { note } : {}), updatedAt: now },
    $setOnInsert: { createdAt: now },
  };
  const doc = await (await entries()).findOneAndUpdate(
    { date },
    update,
    { upsert: true, returnDocument: "after" }
  );
  if (!doc) return c.json({ error: "not_found" }, 500);
  const { _id, ...rest } = doc;
  return c.json({ ...rest, id: String(_id) });
});

// PATCH /api/entries/:date — partial update { level?, note? }
app.patch("/api/entries/:date", async (c) => {
  const { date } = c.req.param();
  if (!isValidDate(date)) return c.json({ error: "invalid_date" }, 400);
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== "object") return c.json({ error: "invalid_body" }, 400);
  const { level, note } = body as { level?: unknown; note?: unknown };
  if (level !== undefined && !validateLevel(level)) return c.json({ error: "invalid_level" }, 400);
  if (note !== undefined && !validateNote(note)) return c.json({ error: "invalid_note" }, 400);

  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (level !== undefined) set.level = level;
  if (note !== undefined) set.note = note;
  const doc = await (await entries()).findOneAndUpdate(
    { date },
    { $set: set },
    { returnDocument: "after" }
  );
  if (!doc) return c.json({ error: "not_found" }, 404);
  const { _id, ...rest } = doc;
  return c.json({ ...rest, id: String(_id) });
});

// DELETE /api/entries/:date
app.delete("/api/entries/:date", async (c) => {
  const { date } = c.req.param();
  if (!isValidDate(date)) return c.json({ error: "invalid_date" }, 400);
  const res = await (await entries()).deleteOne({ date });
  return c.json({ ok: true, deleted: res.deletedCount });
});
