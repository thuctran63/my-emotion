import { useI18n } from "../lib/i18n";
import { weekdayShort } from "../lib/dates";
import { LEVEL_COLORS } from "../lib/stats";

type Props = {
  averages: (number | null)[]; // 0=Mon..6=Sun
};

/** Bar chart of average mood per weekday. */
export default function ChartWeekday({ averages }: Props) {
  const { lang } = useI18n();
  const max = Math.max(...averages.filter((v): v is number => v !== null), 5);
  return (
    <div className="flex h-40 min-w-0 items-end gap-1.5 sm:gap-3" role="img" aria-label="Average mood by weekday">
      {averages.map((avg, i) => {
        const h = avg === null ? 0 : (avg / max) * 100;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
              {avg === null ? "–" : avg.toFixed(1)}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md transition-all duration-300"
                style={{
                  height: `${h}%`,
                  backgroundColor: avg === null ? "var(--color-slate-300)" : LEVEL_COLORS[Math.round(avg) - 1],
                  opacity: avg === null ? 0.4 : 1,
                }}
                title={avg === null ? undefined : `${weekdayShort(i, lang)}: ${avg.toFixed(1)}/5`}
              />
            </div>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{weekdayShort(i, lang)}</span>
          </div>
        );
      })}
    </div>
  );
}