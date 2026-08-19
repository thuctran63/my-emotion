import { useMemo } from "react";
import { useI18n } from "../lib/i18n";
import { useEntries } from "../lib/useEntries";
import { sortedByDate, currentStreak, longestStreak, averageLevel, weekdayAverages, distribution, trendDirection, bestMonth } from "../lib/stats";
import { weekdayShort } from "../lib/dates";
import ChartLine from "../components/ChartLine";
import ChartBars from "../components/ChartBars";
import ChartWeekday from "../components/ChartWeekday";
import YearPixels from "../components/YearPixels";

export default function StatsPage() {
  const { t, lang } = useI18n();
  const { entries, loading, error, refresh } = useEntries();

  const sorted = useMemo(() => sortedByDate(entries.values()), [entries]);
  const stats = useMemo(() => {
    const avg = averageLevel(sorted);
    const wd = weekdayAverages(sorted);
    let bestWd = -1;
    let bestWdVal = 0;
    wd.forEach((v, i) => {
      if (v !== null && v > bestWdVal) {
        bestWdVal = v;
        bestWd = i;
      }
    });
    return {
      total: sorted.length,
      avg,
      streak: currentStreak(sorted),
      bestStreak: longestStreak(sorted),
      bestDay: sorted.reduce<typeof sorted[number] | null>((b, e) => (b === null || e.level > b.level ? e : b), null),
      wd,
      bestWd,
      dist: distribution(sorted),
      trend: trendDirection(sorted),
      bestMonth: bestMonth(sorted),
      last30Avg: sorted.length ? averageLevel(sorted.slice(-30)) : 0,
    };
  }, [sorted]);

  if (loading && sorted.length === 0) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-slate-400">{t("status_loading")}</div>;
  }

  const hasData = sorted.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t("stats_title")}
        </h1>
      </header>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          <span>{t("status_error")}</span>
          <button type="button" onClick={() => refresh()} className="font-semibold underline underline-offset-2">
            {t("status_retry")}
          </button>
        </div>
      )}

      {!hasData ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-400 dark:border-slate-700">
          {t("stats_no_data")}
        </div>
      ) : (
        <div className="space-y-6">
          {/* stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label={t("stats_total_days")} value={String(stats.total)} />
            <StatCard label={t("stats_avg")} value={stats.avg.toFixed(1)} suffix="/5" />
            <StatCard label={t("stats_best_streak")} value={String(stats.bestStreak)} suffix={t("today_days")} />
            <StatCard
              label={t("stats_best_day")}
              value={stats.bestDay ? stats.bestDay.date.slice(5) : "–"}
              sub={stats.bestDay ? `${stats.bestDay.level}/5` : undefined}
            />
          </div>

          {/* trend */}
          <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("stats_trend")}</h2>
            <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">{t("stats_trend_desc")}</p>
            <ChartLine entries={sorted} />
          </section>

          {/* distribution + weekday */}
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("stats_distribution")}</h2>
              <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">{t("stats_dist_desc")}</p>
              <ChartBars counts={stats.dist} />
            </section>
            <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("stats_weekday")}</h2>
              <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">{t("stats_weekday_desc")}</p>
              <ChartWeekday averages={stats.wd} />
              {stats.bestWd !== -1 && (
                <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t("stats_weekday_insight", { day: weekdayShort(stats.bestWd, lang) })}
                </p>
              )}
            </section>
          </div>

          {/* year in pixels */}
          <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("stats_year")}</h2>
            <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">{t("stats_year_desc")}</p>
            <YearPixels entries={sorted} year={new Date().getFullYear()} />
          </section>

          {/* insights */}
          <section className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <h2 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">{t("stats_insights")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {stats.bestMonth !== null && (
                <InsightCard
                  icon={
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M8 2v4" />
                      <path d="M16 2v4" />
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M3 10h18" />
                    </svg>
                  }
                  label={t("stats_insight_month")}
                  value={t(`f${stats.bestMonth}`)}
                  tone="indigo"
                />
              )}
              <InsightCard
                icon={
                  stats.trend === "up" ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 17l6-6 4 4 8-8" />
                      <path d="M14 7h7v7" />
                    </svg>
                  ) : stats.trend === "down" ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 7l6 6 4-4 8 8" />
                      <path d="M14 17h7v-7" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                    </svg>
                  )
                }
                label={t("stats_insight_trend")}
                value={
                  stats.trend === "up"
                    ? t("stats_trend_up_short")
                    : stats.trend === "down"
                      ? t("stats_trend_down_short")
                      : t("stats_trend_steady_short")
                }
                tone={stats.trend === "up" ? "emerald" : stats.trend === "down" ? "rose" : "slate"}
              />
              {stats.bestStreak > 1 && (
                <InsightCard
                  icon={
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  }
                  label={t("stats_insight_streak")}
                  value={`${stats.bestStreak} ${t("today_days")}`}
                  tone="amber"
                />
              )}
              <InsightCard
                icon={
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 3v18h18" />
                    <path d="M7 14l4-4 3 3 5-6" />
                  </svg>
                }
                label={t("stats_insight_30d")}
                value={`${stats.last30Avg.toFixed(1)}/5`}
                tone="sky"
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, suffix, sub }: { label: string; value: string; suffix?: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">
        {value}
        {suffix && <span className="ml-1 text-xs font-semibold text-slate-400 dark:text-slate-500">{suffix}</span>}
      </p>
      {sub && <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  );
}

const TONES: Record<string, { chip: string; icon: string }> = {
  indigo: { chip: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400", icon: "text-indigo-500 dark:text-indigo-400" },
  emerald: { chip: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", icon: "text-emerald-500 dark:text-emerald-400" },
  rose: { chip: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400", icon: "text-rose-500 dark:text-rose-400" },
  amber: { chip: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400", icon: "text-amber-500 dark:text-amber-400" },
  sky: { chip: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400", icon: "text-sky-500 dark:text-sky-400" },
  slate: { chip: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400", icon: "text-slate-500 dark:text-slate-400" },
};

function InsightCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  const c = TONES[tone] ?? TONES.slate;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.chip}`}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}