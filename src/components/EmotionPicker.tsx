import { useI18n } from "../lib/i18n";
import { LEVEL_COLORS } from "../lib/stats";
import Face from "./Face";

type Props = {
  value: number; // 0 = none, 1..5
  disabled?: boolean;
  onChange: (level: number) => void;
};

const LEVEL_KEYS = ["level_1", "level_2", "level_3", "level_4", "level_5"];

export default function EmotionPicker({ value, disabled = false, onChange }: Props) {
  const { t } = useI18n();
  return (
    <div className="flex justify-between gap-2 sm:gap-4" role="radiogroup" aria-label={t("today_title")}>
      {LEVEL_KEYS.map((k, i) => {
        const level = i + 1;
        const selected = value === level;
        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(level)}
            className={`group flex w-full min-w-0 flex-col items-center gap-2 rounded-2xl border-2 p-2 pt-3 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 active:scale-95 disabled:opacity-50 ${
              selected
                ? "border-transparent bg-white/70 shadow-lg shadow-black/10 dark:bg-white/10 dark:shadow-black/30"
                : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
            }`}
            style={selected ? { boxShadow: `0 0 0 2px ${LEVEL_COLORS[level - 1]}, 0 8px 20px -8px ${LEVEL_COLORS[level - 1]}66` } : undefined}
          >
            <Face level={level} className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" selected={selected} />
            <span
              className="w-full truncate text-center text-[11px] font-semibold leading-tight sm:text-xs"
              style={{ color: LEVEL_COLORS[level - 1] }}
            >
              {t(k)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
