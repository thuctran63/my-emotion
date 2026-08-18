import { useMemo } from "react";
import { useI18n } from "../lib/i18n";
import { monthLabel, weekdayShort } from "../lib/dates";
import { LEVEL_COLORS, yearGrid } from "../lib/stats";
import type { Entry } from "../lib/api";

type Props = {
  entries: Entry[];
  year: number;
};

const CELL = 12;
const GAP = 3;

/** GitHub-style heatmap: one cell per day, colored by mood level. */
export default function YearPixels({ entries, year }: Props) {
  const { t, lang } = useI18n();
  const grid = useMemo(() => yearGrid(entries, year), [entries, year]);

  // group by week (columns), rows = weekday (Mon..Sun)
  const weeks: { date: string; level: number | null }[][] = [];
  let cur: { date: string; level: number | null }[] = [];
  const firstDow = (new Date(year, 0, 1).getDay() + 6) % 7; // 0=Mon
  for (let i = 0; i < firstDow; i++) cur.push({ date: "", level: null });
  for (const day of grid) {
    cur.push(day);
    if (cur.length === 7) {
      weeks.push(cur);
      cur = [];
    }
  }
  if (cur.length) weeks.push(cur);

  const W = weeks.length * (CELL + GAP) + 30;
  const H = 7 * (CELL + GAP) + 24;

  return (
    <div className="overflow-x-auto pb-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="min-w-full" role="img" aria-label={`Year in pixels ${year}`}>
        <title>{`${t("stats_year")} ${year}`}</title>
        {/* month labels */}
        {weeks.map((wk, wi) => {
          const first = wk.find((d) => d.date);
          if (!first) return null;
          const m = Number(first.date.slice(5, 7)) - 1;
          const prev = wi > 0 ? weeks[wi - 1].find((d) => d.date) : null;
          const prevM = prev ? Number(prev.date.slice(5, 7)) - 1 : -1;
          if (m === prevM) return null;
          return (
            <text key={wi} x={wi * (CELL + GAP) + 1} y={10} fontSize="9" fill="currentColor" fillOpacity="0.55">
              {monthLabel(m, lang)}
            </text>
          );
        })}
        {/* weekday labels */}
        {[0, 2, 4, 6].map((row) => (
          <text key={row} x={W - 26} y={24 + row * (CELL + GAP) + 9} fontSize="9" fill="currentColor" fillOpacity="0.55">
            {weekdayShort(row, lang)}
          </text>
        ))}
        {/* cells */}
        {weeks.map((wk, wi) =>
          wk.map((day, row) => {
            if (!day.date) return null;
            const color = day.level === null ? "var(--color-slate-200)" : LEVEL_COLORS[day.level - 1];
            return (
              <rect
                key={day.date}
                x={wi * (CELL + GAP)}
                y={24 + row * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx="2.5"
                fill={color}
                opacity={day.level === null ? 0.5 : 0.9}
              >
                <title>{`${day.date}: ${day.level === null ? "—" : `${day.level}/5`}`}</title>
              </rect>
            );
          })
        )}
      </svg>
    </div>
  );
}