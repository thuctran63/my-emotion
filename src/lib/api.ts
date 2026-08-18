export type Entry = {
  id?: string;
  date: string; // YYYY-MM-DD
  level: number; // 1..5
  note?: string;
  updatedAt?: string;
};

const BASE = "/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  list: (from?: string, to?: string) => {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    const qs = q.toString();
    return req<Entry[]>(`/entries${qs ? `?${qs}` : ""}`);
  },
  upsert: (body: { date: string; level: number; note?: string }) =>
    req<Entry>("/entries", { method: "POST", body: JSON.stringify(body) }),
  patch: (date: string, body: { level?: number; note?: string }) =>
    req<Entry>(`/entries/${date}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (date: string) => req<{ ok: boolean; deleted: number }>(`/entries/${date}`, { method: "DELETE" }),
};
