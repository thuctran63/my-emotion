import { useId } from "react";
import type { Entry } from "../lib/api";
import { LEVEL_COLORS, movingAverage } from "../lib/stats";

type Props = {
  entries: Entry[]; // sorted asc by date
  height?: number;
};

/**
 * Trend line chart: raw mood (dots) + 7-day moving average (line).
 * Pure SVG, no dependencies. Accessible via <title> + aria-label.
 */
export default function ChartLine({ entries, height = 180 }: Props) {
  const id = useId();
  const W = 600;
  const H = height;
  const PAD = { top: 12, right: 12, bottom: 24, left: 28 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  if (entries.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
        —
      </div>
    );
  }

  const ma = movingAverage(entries);
  const x = (i: number) => PAD.left + (entries.length === 1 ? innerW / 2 : (i / (entries.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - ((v - 1) / 4) * innerH;

  const maPts = ma
    .map((v, i) => (v === null ? null : `${x(i)},${y(v)}`))
    .filter(Boolean)
    .join(" ");

  const last = entries[entries.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Mood trend chart">
      <title>Mood trend</title>
      {/* gridlines + y labels */}
      {[1, 2, 3, 4, 5].map((lv) => (
        <g key={lv}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(lv)} y2={y(lv)} stroke="currentColor" strokeOpacity="0.08" />
          <text x={PAD.left - 6} y={y(lv) + 3.5} textAnchor="end" fontSize="10" fill="currentColor" fillOpacity="0.5">
            {lv}
          </text>
        </g>
      ))}
      {/* moving average area fill */}
      {maPts && (
        <>
          <polygon
            points={`${PAD.left},${PAD.top + innerH} ${maPts} ${x(entries.length - 1)},${PAD.top + innerH}`}
            fill={`url(#${id})`}
            opacity="0.35"
          />
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LEVEL_COLORS[4]} stopOpacity="0.5" />
              <stop offset="100%" stopColor={LEVEL_COLORS[4]} stopOpacity="0" />
            </linearGradient>
          </defs>
        </>
      )}
      {/* raw dots */}
      {entries.map((e, i) => (
        <circle key={e.date} cx={x(i)} cy={y(e.level)} r="3" fill={LEVEL_COLORS[e.level - 1]} opacity="0.85">
          <title>{`${e.date}: ${e.level}/5`}</title>
        </circle>
      ))}
      {/* MA line */}
      {maPts && (
        <polyline points={maPts} fill="none" stroke={LEVEL_COLORS[4]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* last point highlight */}
      <circle cx={x(entries.length - 1)} cy={y(last.level)} r="5" fill={LEVEL_COLORS[last.level - 1]} stroke="white" strokeWidth="2" />
      {/* x labels: first & last date */}
      <text x={PAD.left} y={H - 6} fontSize="10" fill="currentColor" fillOpacity="0.5">
        {entries[0].date}
      </text>
      <text x={W - PAD.right} y={H - 6} textAnchor="end" fontSize="10" fill="currentColor" fillOpacity="0.5">
        {last.date}
      </text>
    </svg>
  );
}