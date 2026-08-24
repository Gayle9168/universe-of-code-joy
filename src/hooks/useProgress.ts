import * as React from "react";
import { getAlgorithm, getAlgorithms } from "@/content/algorithms";
import type { Category } from "@/content/types";
import {
  dayKey,
  useProgressStore,
  type ActivityRow,
  type AlgorithmProgress,
} from "@/stores/progressStore";

/** Progress for a single algorithm, or null when nothing has been recorded. */
export function useAlgorithmProgress(slug: string): AlgorithmProgress | null {
  return useProgressStore((s) => s.algorithms[slug] ?? null);
}

/** Average mastery across every algorithm in the catalog, 0–100. */
export function useOverallMastery(): number {
  return useProgressStore((s) => {
    const algos = getAlgorithms();
    if (algos.length === 0) return 0;
    const total = algos.reduce((sum, a) => sum + (s.algorithms[a.slug]?.masteryPct ?? 0), 0);
    return Math.round(total / algos.length);
  });
}

/** Mastery per category, derived from the real category values in src/data/algorithms.ts. */
export function useCategoryMastery(): Record<Category, number> {
  const entries = useProgressStore((s) => s.algorithms);
  return React.useMemo(() => {
    const sums = new Map<Category, { total: number; count: number }>();
    for (const a of getAlgorithms()) {
      const bucket = sums.get(a.category) ?? { total: 0, count: 0 };
      bucket.total += entries[a.slug]?.masteryPct ?? 0;
      bucket.count += 1;
      sums.set(a.category, bucket);
    }
    const out = {} as Record<Category, number>;
    for (const [category, { total, count }] of sums) {
      out[category] = count === 0 ? 0 : Math.round(total / count);
    }
    return out;
  }, [entries]);
}

/** Number of review cards due now or earlier. */
export function useDueCardCount(): number {
  return useProgressStore((s) => {
    const now = Date.now();
    return Object.values(s.reviewCards).filter((c) => new Date(c.dueISO).getTime() <= now).length;
  });
}

/** Today's activity row (zeroed when nothing happened yet). */
export function useTodayActivity(): ActivityRow {
  const key = dayKey();
  const row = useProgressStore((s) => s.activity[key]);
  return React.useMemo(() => row ?? { xp: 0, minutes: 0, steps: 0, solved: 0 }, [row]);
}

/** Convenience: is this algorithm bookmarked. */
export function useIsBookmarked(slug: string): boolean {
  return useProgressStore((s) => s.bookmarks.includes(slug));
}

export { getAlgorithm };
