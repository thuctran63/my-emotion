import { useI18n } from "../lib/i18n";
import { LEVEL_COLORS } from "../lib/stats";

type Props = {
  counts: number[]; // length 5, count per level
};

const LEVEL_KEYS = ["level_1", "level_2", "level_3", "level_4", "level_5"];

/** Horizontal stacked bar showing share of each mood level. */
export default function ChartBars({ counts }: Props) {
  const { t } = useI18n();
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return <div className="text-sm text-slate-400">—</div>;

  return (
    <div>
      <div className="flex h-6 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800" role="img" aria-label="Mood distribution">
        {counts.map((c, i) =>
          c > 0 ? (
            <div
              key={i}
              style={{ width: `${(c / total) * 100}%`, backgroundColor: LEVEL_COLORS[i] }}
              title={`${t(LEVEL_KEYS[i])}: ${c}`}
            />
          ) : null
        )}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-5">
        {counts.map((c, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: LEVEL_COLORS[i] }} aria-hidden="true" />
            <span className="truncate text-slate-600 dark:text-slate-300">{t(LEVEL_KEYS[i])}</span>
            <span className="ml-auto font-semibold tabular-nums text-slate-800 dark:text-slate-100">
              {total ? Math.round((c / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}