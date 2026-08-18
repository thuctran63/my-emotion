import type { Entry } from "./api";
import { addDaysISO, parseISO, toISODate, todayISO } from "./dates";

/** Level colors used across faces, charts and heatmap. */
export const LEVEL_COLORS = [
  "#ef4444", // 1 red
  "#f97316", // 2 orange
  "#eab308", // 3 yellow
  "#22c55e", // 4 green
  "#10b981", // 5 emerald
];

export const LEVEL_LABELS = ["Rất tệ", "Không tốt", "Bình thường", "Khá tốt", "Tuyệt vời"];

export function sortedByDate(entries: Iterable<Entry>): Entry[] {
  return [...entries].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/** Consecutive-day streak ending today (or the latest logged day). */
export function currentStreak(entries: Iterable<Entry>): number {
  const days = new Set(sortedByDate(entries).map((e) => e.date));
  if (days.size === 0) return 0;
  let cursor = todayISO();
  if (!days.has(cursor)) {
    // allow streak that ended yesterday to still count as "alive"
    cursor = addDaysISO(cursor, -1);
    if (!days.has(cursor)) return 0;
  }
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive logged days anywhere in history. */
export function longestStreak(entries: Iterable<Entry>): number {
  const days = new Set(sortedByDate(entries).map((e) => e.date));
  let best = 0;
  let run = 0;
  let prev = "";
  for (const d of [...days].sort()) {
    run = prev && addDaysISO(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function averageLevel(entries: Iterable<Entry>): number {
  const list = [...entries];
  if (list.length === 0) return 0;
  return list.reduce((s, e) => s + e.level, 0) / list.length;
}

/** Map of weekday (0=Mon..6=Sun) → average level. */
export function weekdayAverages(entries: Iterable<Entry>): (number | null)[] {
  const sums = new Array<number>(7).fill(0);
  const counts = new Array<number>(7).fill(0);
  for (const e of entries) {
    const wd = (parseISO(e.date).getDay() + 6) % 7;
    sums[wd] += e.level;
    counts[wd]++;
  }
  return sums.map((s, i) => (counts[i] ? s / counts[i] : null));
}

/** Distribution: count per level 1..5. */
export function distribution(entries: Iterable<Entry>): number[] {
  const counts = new Array<number>(5).fill(0);
  for (const e of entries) counts[e.level - 1]++;
  return counts;
}

/** Days list with level per date for heatmap/timeline, missing days = null. */
export function yearGrid(entries: Iterable<Entry>, year: number): { date: string; level: number | null }[] {
  const map = new Map([...entries].map((e) => [e.date, e.level]));
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const out: { date: string; level: number | null }[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = toISODate(d);
    out.push({ date: iso, level: map.get(iso) ?? null });
  }
  return out;
}

/** 7-day moving average over a date-sorted series; null before enough data. */
export function movingAverage(entries: Entry[], window = 7): (number | null)[] {
  return entries.map((_, i) => {
    if (i < window - 1) return null;
    let sum = 0;
    for (let j = i - window + 1; j <= i; j++) sum += entries[j].level;
    return sum / window;
  });
}

/** Linear slope of the mood series (least squares) → direction insight. */
export function trendDirection(entries: Entry[]): "up" | "down" | "steady" {
  if (entries.length < 2) return "steady";
  const n = entries.length;
  const xs = entries.map((_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = entries.reduce((a, e) => a + e.level, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (entries[i].level - meanY);
    den += (i - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const threshold = 0.02; // per-day slope
  if (slope > threshold) return "up";
  if (slope < -threshold) return "down";
  return "steady";
}

/** Month (0..11) with the highest average level. */
export function bestMonth(entries: Entry[]): number | null {
  if (entries.length === 0) return null;
  const sums = new Array<number>(12).fill(0);
  const counts = new Array<number>(12).fill(0);
  for (const e of entries) {
    const m = parseISO(e.date).getMonth();
    sums[m] += e.level;
    counts[m]++;
  }
  let best = -1;
  let bestAvg = -Infinity;
  for (let m = 0; m < 12; m++) {
    if (counts[m] > 0) {
      const avg = sums[m] / counts[m];
      if (avg > bestAvg) {
        bestAvg = avg;
        best = m;
      }
    }
  }
  return best === -1 ? null : best;
}
