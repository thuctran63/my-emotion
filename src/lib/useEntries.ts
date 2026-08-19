import { useCallback, useEffect, useRef, useState } from "react";
import { api, type Entry } from "./api";

type EntriesMap = Map<string, Entry>;

const CACHE_KEY = "my-emotion:entries";

function loadCache(): EntriesMap {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return new Map();
    return new Map((JSON.parse(raw) as Entry[]).map((e) => [e.date, e]));
  } catch {
    return new Map();
  }
}

function persist(entries: EntriesMap) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify([...entries.values()]));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function useEntries() {
  const [entries, setEntries] = useState<EntriesMap>(loadCache);
  // With cached data the UI is interactive immediately; fetch refreshes in background.
  const [loading, setLoading] = useState(() => entries.size === 0);
  const [error, setError] = useState(false);
  const [loadedRange, setLoadedRange] = useState<{ from?: string; to?: string }>({});
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const refresh = useCallback(async (from?: string, to?: string) => {
    try {
      // Only show the loading state when there is nothing on screen yet
      if (entriesRef.current.size === 0) setLoading(true);
      const list = await api.list(from, to);
      setEntries((prev) => {
        const next = new Map(prev);
        for (const e of list) next.set(e.date, e);
        persist(next);
        return next;
      });
      setLoadedRange({ from, to });
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // optimistic local mutation
  const applyLocal = useCallback((date: string, patch: Partial<Entry>) => {
    setEntries((prev) => {
      const next = new Map(prev);
      const cur = next.get(date);
      next.set(date, { ...cur, date, ...patch } as Entry);
      persist(next);
      return next;
    });
  }, []);

  const save = useCallback(
    async (date: string, level: number, note?: string) => {
      // optimistic
      applyLocal(date, { level, note });
      try {
        const saved = await api.upsert({ date, level, note });
        applyLocal(date, saved);
        return true;
      } catch {
        // rollback: refetch range
        refresh(loadedRange.from, loadedRange.to);
        return false;
      }
    },
    [applyLocal, refresh, loadedRange]
  );

  const remove = useCallback(
    async (date: string) => {
      setEntries((prev) => {
        const next = new Map(prev);
        next.delete(date);
        return next;
      });
      try {
        await api.remove(date);
        return true;
      } catch {
        refresh(loadedRange.from, loadedRange.to);
        return false;
      }
    },
    [refresh, loadedRange]
  );

  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, error, refresh, save, remove };
}
