import { useState, type ReactNode } from "react";
import { useI18n } from "../lib/i18n";
import Face from "./Face";

// ponytail: PIN is client-side only — anyone can read it from the bundle.
// Upgrade path: verify PIN server-side (e.g. POST /api/auth) and gate /api/entries.
const PIN = "290220";
const AUTH_KEY = "my-emotion:auth";
const TTL = 24 * 60 * 60 * 1000; // 1 day

function isAuthed(): boolean {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const { exp } = JSON.parse(raw);
    if (typeof exp !== "number" || exp < Date.now()) {
      localStorage.removeItem(AUTH_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default function PinGate({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [authed, setAuthed] = useState(isAuthed);
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);

  const press = (d: string) => {
    if (digits.length >= 6) return;
    const next = digits + d;
    setDigits(next);
    setError(false);
    if (next.length === 6) {
      if (next === PIN) {
        localStorage.setItem(AUTH_KEY, JSON.stringify({ exp: Date.now() + TTL }));
        setAuthed(true);
      } else {
        setError(true);
        setDigits("");
      }
    }
  };

  if (authed) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
      <Face level={3} className="mb-4 h-14 w-14" />
      <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">My Emotion</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("pin_sub")}</p>

      <div className="mt-6 flex gap-3" aria-label={t("pin_label")} role="img">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full border-2 transition-colors ${
              i < digits.length
                ? "border-indigo-500 bg-indigo-500"
                : "border-slate-300 dark:border-slate-600"
            }`}
          />
        ))}
      </div>

      {error && <p className="mt-3 text-sm font-medium text-rose-500">{t("pin_error")}</p>}

      <div className="mt-6 grid w-full max-w-[264px] grid-cols-3 gap-3">
        {KEYS.map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            className="h-16 rounded-2xl border border-slate-200 bg-white text-2xl font-semibold text-slate-800 shadow-sm transition-transform active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => setDigits("")}
          className="h-16 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-500 shadow-sm transition-transform active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
        >
          {t("pin_clear")}
        </button>
        <button
          onClick={() => press("0")}
          className="h-16 rounded-2xl border border-slate-200 bg-white text-2xl font-semibold text-slate-800 shadow-sm transition-transform active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          0
        </button>
        <button
          onClick={() => setDigits((s) => s.slice(0, -1))}
          aria-label={t("pin_backspace")}
          className="flex h-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-transform active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <path d="M18 9l-6 6" />
            <path d="M12 9l6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}