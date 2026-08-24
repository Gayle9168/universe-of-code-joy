import { create } from "zustand";
import type { RunnerLang } from "@/lib/runner";

/**
 * In-memory hand-off between the practice screen and the results screen.
 * Deliberately not persisted: a reload falls back to the persisted attempt record.
 */
export interface SubmissionResult {
  problemSlug: string;
  passed: number;
  total: number;
  runtimeMs: number;
  attempts: number;
  hintsUsed: number;
  xpAwarded: number;
  lang: RunnerLang;
  solvedToday: number;
}

interface ResultState {
  last: SubmissionResult | null;
  setLast: (result: SubmissionResult) => void;
  clear: () => void;
}

export const useResultStore = create<ResultState>()((set) => ({
  last: null,
  setLast: (result) => set({ last: result }),
  clear: () => set({ last: null }),
}));
