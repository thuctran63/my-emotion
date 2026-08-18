import { useEffect, useRef, useState } from "react";
import { useI18n } from "../lib/i18n";
import { useEntries } from "../lib/useEntries";
import { addDaysISO, fmtDayFull, todayISO } from "../lib/dates";
import { currentStreak } from "../lib/stats";
import EmotionPicker from "../components/EmotionPicker";
import { LEVEL_COLORS } from "../lib/stats";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function TodayPage() {
  const { t, lang } = useI18n();
  const { entries, loading, error, refresh, save } = useEntries();

  const today = todayISO();
  const existing = entries.get(today);
  const [level, setLevel] = useState(0);
  const [note, setNote] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const noteTimer = useRef<number | undefined>(undefined);
  const firstRender = useRef(true);

  // hydrate from server when it arrives
  useEffect(() => {
    if (existing) {
      setLevel(existing.level);
      setNote(existing.note ?? "");
    }
  }, [existing?.date, existing?.level, existing?.note]);

  // debounced autosave of the note (only after a level exists)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (level === 0) return;
    setSaveState("saving");
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(async () => {
      const ok = await save(today, level, note);
      setSaveState(ok ? "saved" : "error");
    }, 600);
    return () => window.clearTimeout(noteTimer.current);
  }, [note, level, today, save]);

  const pickLevel = async (lv: number) => {
    setLevel(lv);
    setSaveState("saving");
    const ok = await save(today, lv, note);
    setSaveState(ok ? "saved" : "error");
  };

  const streak = currentStreak(entries.values());
  const last30 = Array.from({ length: 30 }, (_, i) => addDaysISO(today, -(29 - i)));

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <header className="mb-6 text-center">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{fmtDayFull(today, lang)}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t("today_title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {existing ? t("today_update") : t("today_sub")}
        </p>
      </header>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          <span>{t("status_error")}</span>
          <button type="button" onClick={() => refresh()} className="font-semibold underline underline-offset-2">
            {t("status_retry")}
          </button>
        </div>
      )}

      <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 sm:p-8">
        <EmotionPicker value={level} disabled={loading} onChange={pickLevel} />

        <div className="mt-6">
          <label htmlFor="note" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t("today_note_label")}
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("today_note_ph")}
            rows={4}
            maxLength={5000}
            className="w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span
              className={`inline-flex items-center gap-1.5 font-medium ${
                saveState === "error"
                  ? "text-red-600 dark:text-red-400"
                  : saveState === "saved"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400 dark:text-slate-500"
              }`}
              role="status"
              aria-live="polite"
            >
              {saveState === "saving" && (
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                  <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              )}
              {saveState === "saving" && t("today_saving")}
              {saveState === "saved" && t("today_saved")}
              {saveState === "error" && t("today_error")}
            </span>
            <span className="tabular-nums text-slate-400 dark:text-slate-500">{note.length}/5000</span>
          </div>
        </div>
      </section>

      {/* streak + last 30 days */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {t("today_streak")}
          </p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
            {streak}
            <span className="ml-1.5 text-sm font-semibold text-slate-400 dark:text-slate-500">{t("today_days")}</span>
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {t("today_30d")}
          </p>
          {last30.some((d) => entries.has(d)) ? (
            <div className="flex items-end gap-[3px]" role="img" aria-label={t("today_30d")}>
              {last30.map((d) => {
                const e = entries.get(d);
                return (
                  <div
                    key={d}
                    className="flex-1 rounded-sm"
                    style={{
                      height: e ? `${(e.level / 5) * 100}%` : "12%",
                      backgroundColor: e ? LEVEL_COLORS[e.level - 1] : "var(--color-slate-200)",
                      opacity: e ? 0.9 : 0.6,
                    }}
                    title={e ? `${d}: ${e.level}/5` : d}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500">{t("today_empty_30d")}</p>
          )}
        </div>
      </section>

      {level === 0 && !existing && (
        <p className="mt-6 text-center text-sm text-slate-400 dark:text-slate-500">{t("today_pick_first")}</p>
      )}
    </div>
  );
}