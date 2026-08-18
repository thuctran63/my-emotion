/** Date helpers — all in the user's local timezone. */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d); // local midnight
}

export function addDaysISO(iso: string, n: number): string {
  const dt = parseISO(iso);
  dt.setDate(dt.getDate() + n);
  return toISODate(dt);
}

export function fmtLong(iso: string, lang: "vi" | "en"): string {
  const dt = parseISO(iso);
  const months =
    lang === "vi"
      ? ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
      : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function fmtDay(iso: string): string {
  return parseISO(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function fmtDayFull(iso: string, lang: "vi" | "en"): string {
  return parseISO(iso).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function weekdayIndex(iso: string): number {
  // 0 = Sunday, convert to 0=Monday..6=Sunday
  return (parseISO(iso).getDay() + 6) % 7;
}

export function monthLabel(month0: number, lang: "vi" | "en"): string {
  const months =
    lang === "vi"
      ? ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[month0];
}

export function weekdayShort(dayIndexMonday0: number, lang: "vi" | "en"): string {
  const vi = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const en = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return lang === "vi" ? vi[dayIndexMonday0] : en[dayIndexMonday0];
}
