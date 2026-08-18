import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../lib/i18n";
import { useEntries } from "../lib/useEntries";
import { fmtDay, fmtLong } from "../lib/dates";
import { LEVEL_COLORS, sortedByDate } from "../lib/stats";
import Face from "../components/Face";

export default function HistoryPage() {
  const { t, lang } = useI18n();
  const { entries, loading, error, refresh, save, remove } = useEntries();

  const [editing, setEditing] = useState<string | null>(null);
  const [editLevel, setEditLevel] = useState(0);
  const [editNote, setEditNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);

  const sorted = useMemo(() => sortedByDate(entries.values()).reverse(), [entries]);

  // group by month
  const groups = useMemo(() => {
    const g: { key: string; label: string; items: typeof sorted }[] = [];
    for (const e of sorted) {
      const key = e.date.slice(0, 7);
      const last = g[g.length - 1];
      if (last && last.key === key) last.items.push(e);
      else g.push({ key, label: fmtLong(e.date, lang), items: [e] });
    }
    return g;
  }, [sorted, lang]);

  const viewingEntry = viewing ? entries.get(viewing) : undefined;

  // close modal with Escape
  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setViewing(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing]);

  const startEdit = (date: string, level: number, note: string) => {
    setEditing(date);
    setEditLevel(level);
    setEditNote(note);
  };

  const saveEdit = async () => {
    if (!editing) return;
    await save(editing, editLevel, editNote);
    setEditing(null);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(sorted, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-emotion-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && sorted.length === 0) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-slate-400">{t("status_loading")}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {t("hist_title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sorted.length} ngày</p>
        </div>
        {sorted.length > 0 && (
          <button
            type="button"
            onClick={exportJSON}
            className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("hist_export")}
          </button>
        )}
      </header>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          <span>{t("status_error")}</span>
          <button type="button" onClick={() => refresh()} className="font-semibold underline underline-offset-2">
            {t("status_retry")}
          </button>
        </div>
      )}

      {sorted.length === 0 && !loading ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-400 dark:border-slate-700">
          {t("hist_empty")}
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.key}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {g.label}
              </h2>
              <ul className="space-y-2">
                {g.items.map((e) => {
                  const isEditing = editing === e.date;
                  return (
                    <li
                      key={e.date}
                      className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{fmtDay(e.date)}</span>
                            <div className="flex gap-1.5" role="radiogroup" aria-label="Mood level">
                              {[1, 2, 3, 4, 5].map((lv) => (
                                <button
                                  key={lv}
                                  type="button"
                                  role="radio"
                                  aria-checked={editLevel === lv}
                                  onClick={() => setEditLevel(lv)}
                                  className={`rounded-lg p-1 transition-transform active:scale-90 ${
                                    editLevel === lv ? "bg-slate-100 ring-2 dark:bg-slate-800" : "opacity-60 hover:opacity-100"
                                  }`}
                                  style={editLevel === lv ? { ["--tw-ring-color" as string]: LEVEL_COLORS[lv - 1] } : undefined}
                                >
                                  <Face level={lv} className="h-7 w-7" selected={editLevel === lv} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <textarea
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            rows={3}
                            maxLength={5000}
                            className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={saveEdit}
                              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                            >
                              {t("hist_save")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditing(null)}
                              className="rounded-lg px-3.5 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              {t("hist_cancel")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <Face level={e.level} className="mt-0.5 h-9 w-9 shrink-0" />
                          <button
                            type="button"
                            onClick={() => setViewing(e.date)}
                            className="min-w-0 flex-1 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                          >
                            <span className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{fmtDay(e.date)}</span>
                              <span className="text-xs font-semibold" style={{ color: LEVEL_COLORS[e.level - 1] }}>
                                {e.level}/5
                              </span>
                            </span>
                            {e.note ? (
                              <span className="mt-1 block truncate text-sm text-slate-600 dark:text-slate-300">
                                {e.note}
                              </span>
                            ) : (
                              <span className="mt-1 block text-sm italic text-slate-400 dark:text-slate-500">
                                {t("hist_note_empty")}
                              </span>
                            )}
                          </button>
                          <div className="flex shrink-0 flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(e.date, e.level, e.note ?? "")}
                              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              {t("hist_edit")}
                            </button>
                            {confirmDelete === e.date ? (
                              <button
                                type="button"
                                onClick={async () => {
                                  await remove(e.date);
                                  setConfirmDelete(null);
                                }}
                                className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-500"
                              >
                                {t("hist_confirm_delete")}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDelete(e.date)}
                                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                              >
                                {t("hist_delete")}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {viewingEntry && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setViewing(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={fmtDay(viewingEntry.date)}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-slate-200/70 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Face level={viewingEntry.level} className="h-12 w-12" selected />
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{fmtDay(viewingEntry.date)}</p>
                  <p className="text-sm font-semibold" style={{ color: LEVEL_COLORS[viewingEntry.level - 1] }}>
                    {viewingEntry.level}/5
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewing(null)}
                aria-label={t("hist_close")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/50">
              {viewingEntry.note ? (
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {viewingEntry.note}
                </p>
              ) : (
                <p className="text-sm italic text-slate-400 dark:text-slate-500">{t("hist_note_empty")}</p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  startEdit(viewingEntry.date, viewingEntry.level, viewingEntry.note ?? "");
                  setViewing(null);
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                {t("hist_edit")}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await remove(viewingEntry.date);
                  setViewing(null);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500"
              >
                {t("hist_delete")}
              </button>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {t("hist_close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}