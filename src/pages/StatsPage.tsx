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
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {stats.bestMonth !== null && (
                <li>
                  {t("stats_best_month", { month: t(`f${stats.bestMonth}`) })}
                </li>
              )}
              <li className="flex items-center gap-2">
                {stats.trend === "up" && (
                  <>
                    <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 15l-6-6-6 6"/></svg>
                    {t("stats_trending_up")}
                  </>
                )}
                {stats.trend === "down" && (
                  <>
                    <svg className="h-4 w-4 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                    {t("stats_trending_down")}
                  </>
                )}
                {stats.trend === "steady" && (
                  <>
                    <svg className="h-4 w-4 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/></svg>
                    {t("stats_steady")}
                  </>
                )}
              </li>
              {stats.bestStreak > 1 && <li>{t("stats_streak_insight", { n: stats.bestStreak })}</li>}
              <li>{t("stats_30d_avg", { v: stats.last30Avg.toFixed(1) })}</li>
            </ul>
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