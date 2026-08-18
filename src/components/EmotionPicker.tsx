import { useState, type CSSProperties } from "react";
import { useI18n } from "../lib/i18n";
import { LEVEL_COLORS } from "../lib/stats";
import Face from "./Face";

type Props = {
  value: number; // 0 = none, 1..5
  disabled?: boolean;
  onChange: (level: number) => void;
};

const LEVEL_KEYS = ["level_1", "level_2", "level_3", "level_4", "level_5"];

// Per-level burst personality: shape, reach, speed, palette
const EFFECTS: Record<
  number,
  { count: number; shape: "dot" | "square" | "star"; dist: number; dur: number; colors: string[] }
> = {
  1: { count: 6, shape: "dot", dist: 18, dur: 0.9, colors: ["#60a5fa", "#93c5fd", "#7dd3fc"] }, // slow rain
  2: { count: 8, shape: "dot", dist: 24, dur: 0.7, colors: ["#94a3b8", "#cbd5e1", "#a5b4fc"] }, // soft mist
  3: { count: 8, shape: "dot", dist: 28, dur: 0.6, colors: ["#fbbf24", "#fcd34d", "#f59e0b"] }, // warm pulse
  4: { count: 10, shape: "star", dist: 34, dur: 0.65, colors: ["#34d399", "#6ee7b7", "#a7f3d0", "#fbbf24"] }, // sparkles
  5: { count: 14, shape: "square", dist: 42, dur: 0.8, colors: ["#f472b6", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc"] }, // confetti
};

// Deterministic spokes (no Math.random on render)
function makeParticles(level: number) {
  const eff = EFFECTS[level];
  return Array.from({ length: eff.count }, (_, i) => {
    const ang = (i / eff.count) * Math.PI * 2 + (i % 2 ? 0.18 : -0.18);
    const dist = eff.dist * (0.7 + ((i * 37) % 30) / 100);
    const size = 5 + ((i * 13) % 5);
    return {
      dx: Math.cos(ang) * dist,
      dy: Math.sin(ang) * dist - 6,
      color: eff.colors[i % eff.colors.length],
      size,
      delay: ((i * 53) % 40) / 1000,
      rot: (i * 47) % 360,
    };
  });
}

export default function EmotionPicker({ value, disabled = false, onChange }: Props) {
  const { t } = useI18n();
  // re-triggers the burst/pop animation on every click (even same level)
  const [burst, setBurst] = useState<{ level: number; key: number } | null>(null);

  const pick = (level: number) => {
    setBurst({ level, key: Date.now() });
    onChange(level);
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-4" role="radiogroup" aria-label={t("today_title")}>
      {LEVEL_KEYS.map((k, i) => {
        const level = i + 1;
        const selected = value === level;
        const isBurst = burst?.level === level;
        const color = LEVEL_COLORS[level - 1];
        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => pick(level)}
            className={`group flex w-full min-w-0 flex-col items-center gap-2 rounded-2xl border-2 p-2 pt-3 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:scale-95 disabled:opacity-50 ${
              selected
                ? "emotion-glow border-transparent bg-white/70 shadow-lg shadow-black/10 dark:bg-white/10 dark:shadow-black/30"
                : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
            }`}
            style={selected ? ({ "--glow": color } as CSSProperties) : undefined}
          >
            <span className="emotion-float relative inline-block" style={{ animationDelay: `${i * 0.15}s` }}>
              <Face
                key={selected ? `sel-${burst?.key ?? 0}` : `idle-${level}`}
                level={level}
                className={`emotion-face h-12 w-12 shrink-0 transition-transform duration-200 group-hover:scale-110 sm:h-14 sm:w-14 ${selected ? "emotion-pop" : ""}`}
                selected={selected}
              />
              {isBurst && (
                <span
                  key={burst!.key}
                  className="pointer-events-none absolute left-1/2 top-1/2 z-10"
                  aria-hidden="true"
                >
                  <span className="emotion-ripple" style={{ "--glow": color } as CSSProperties} />
                  {makeParticles(level).map((p, j) => (
                    <span
                      key={j}
                      className={`emotion-particle ${EFFECTS[level].shape}`}
                      style={
                        {
                          background: p.color,
                          width: p.size,
                          height: p.size,
                          margin: `${-p.size / 2}px 0 0 ${-p.size / 2}px`,
                          "--dx": `${p.dx}px`,
                          "--dy": `${p.dy}px`,
                          "--rot": `${p.rot}deg`,
                          animationDelay: `${p.delay}s`,
                          animationDuration: `${EFFECTS[level].dur}s`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </span>
              )}
            </span>
            <span
              className="w-full truncate text-center text-[11px] font-semibold leading-tight sm:text-xs"
              style={{ color }}
            >
              {t(k)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
