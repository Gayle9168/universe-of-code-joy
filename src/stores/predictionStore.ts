import * as React from "react";
import { useStore, type StoreApi } from "zustand";
import { createStore } from "zustand/vanilla";
import type { PredictionOptionId } from "@/lib/prediction";

/**
 * Learning-interaction state for prediction checkpoints.
 *
 * This is NOT algorithm execution state: no step index, no frame and no run live
 * here, and nothing in this file can move the player. The canonical
 * `currentStepIndex` stays in `playerStore` and remains the only playback
 * position in the app.
 *
 * Scoped exactly like the player — factory plus React context — so two
 * visualizer instances (compare mode) never share interaction state. Nothing is
 * persisted; prediction results are session-local for Phase 6.
 */

export type PredictionStatus =
  | "unanswered"
  | "selected"
  | "incorrect"
  | "correct"
  | "revealed"
  | "skipped";

/** Structured for a future mastery system to read. No XP wiring in Phase 6. */
export type PredictionOutcome =
  | "correct-first-try"
  | "correct-after-retry"
  | "revealed"
  | "skipped";

export interface PredictionEntry {
  status: PredictionStatus;
  selectedOptionId?: PredictionOptionId;
  attempts: number;
  outcome?: PredictionOutcome;
  /** True once the learner pressed Continue on the feedback panel. */
  continued: boolean;
}

export interface PredictionState {
  /** Identity of the run these entries belong to. */
  runKey: string | null;
  entries: Record<string, PredictionEntry>;

  /** Points the store at a run; entries are dropped when the run changes. */
  syncRun: (runKey: string | null) => void;
  select: (id: string, optionId: PredictionOptionId) => void;
  /** Records an attempt; resolves the checkpoint only when the answer is right. */
  check: (id: string, correctOptionId: PredictionOptionId) => void;
  retry: (id: string) => void;
  reveal: (id: string, correctOptionId: PredictionOptionId) => void;
  skip: (id: string) => void;
  continueFrom: (id: string) => void;
  resetEntries: () => void;
}

export type PredictionStoreApi = StoreApi<PredictionState>;

export const EMPTY_ENTRY: PredictionEntry = {
  status: "unanswered",
  attempts: 0,
  continued: false,
};

/** Statuses that let playback continue past the checkpoint. */
export function isResolved(entry: PredictionEntry | undefined | null): boolean {
  const status = entry?.status ?? "unanswered";
  return status === "correct" || status === "revealed" || status === "skipped";
}

/**
 * Stable key for a run: equivalent raw inputs always serialize the same way,
 * regardless of the order their properties were constructed in.
 */
export function predictionRunKey(
  slug: string | null | undefined,
  rawInputs: Record<string, string> | null | undefined,
): string | null {
  if (!slug) return null;
  const entries = Object.entries(rawInputs ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `${slug}::${entries.map(([k, v]) => `${k}=${v}`).join("&")}`;
}

export function createPredictionStore(): PredictionStoreApi {
  return createStore<PredictionState>()((set, get) => {
    const patch = (id: string, next: Partial<PredictionEntry>): void =>
      set((s) => ({
        entries: { ...s.entries, [id]: { ...(s.entries[id] ?? EMPTY_ENTRY), ...next } },
      }));

    return {
      runKey: null,
      entries: {},

      syncRun: (runKey) => {
        if (get().runKey === runKey) return;
        set({ runKey, entries: {} });
      },

      select: (id, optionId) => {
        if (isResolved(get().entries[id])) return;
        patch(id, { status: "selected", selectedOptionId: optionId });
      },

      check: (id, correctOptionId) => {
        const entry = get().entries[id] ?? EMPTY_ENTRY;
        if (isResolved(entry) || !entry.selectedOptionId) return;
        const attempts = entry.attempts + 1;
        if (entry.selectedOptionId === correctOptionId) {
          patch(id, {
            status: "correct",
            attempts,
            outcome: attempts === 1 ? "correct-first-try" : "correct-after-retry",
          });
        } else {
          /* Incorrect keeps the checkpoint blocking: only correct, revealed and
             skipped resolve it. */
          patch(id, { status: "incorrect", attempts });
        }
      },

      retry: (id) => {
        if (isResolved(get().entries[id])) return;
        patch(id, { status: "unanswered", selectedOptionId: undefined });
      },

      reveal: (id, correctOptionId) => {
        if (isResolved(get().entries[id])) return;
        patch(id, { status: "revealed", selectedOptionId: correctOptionId, outcome: "revealed" });
      },

      skip: (id) => {
        if (isResolved(get().entries[id])) return;
        patch(id, { status: "skipped", outcome: "skipped", continued: true });
      },

      continueFrom: (id) => {
        if (!isResolved(get().entries[id])) return;
        patch(id, { continued: true });
      },

      resetEntries: () => {
        if (Object.keys(get().entries).length === 0) return;
        set({ entries: {} });
      },
    };
  });
}

/** Instance used when no provider is present. */
export const defaultPredictionStore = createPredictionStore();

const PredictionStoreContext = React.createContext<PredictionStoreApi | null>(null);

export interface PredictionStoreProviderProps {
  store: PredictionStoreApi;
  children: React.ReactNode;
}

/** Scopes every prediction hook below it to `store`. */
export function PredictionStoreProvider({
  store,
  children,
}: PredictionStoreProviderProps): React.ReactElement {
  return React.createElement(PredictionStoreContext.Provider, { value: store }, children);
}

/** The nearest provided instance, falling back to the default one. */
export function usePredictionStoreApi(): PredictionStoreApi {
  return React.useContext(PredictionStoreContext) ?? defaultPredictionStore;
}

export function usePredictionStore<T>(selector: (state: PredictionState) => T): T {
  return useStore(usePredictionStoreApi(), selector);
}
