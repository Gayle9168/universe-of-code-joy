import * as React from "react";
import {
  buildPredictionCheckpoints,
  derivePrediction,
  type Prediction,
  type PredictionCheckpoint,
} from "@/lib/prediction";
import { usePlayerStore } from "@/stores/playerStore";
import {
  EMPTY_ENTRY,
  isResolved,
  predictionRunKey,
  usePredictionStore,
  usePredictionStoreApi,
  type PredictionEntry,
} from "@/stores/predictionStore";

/**
 * Joins the canonical player position with prediction interaction state.
 *
 * The player owns `index`; this hook only *reads* it. There is no second index
 * and no second timer — a blocking gate simply stops the existing player from
 * advancing until the checkpoint resolves.
 */
export interface PredictionGate {
  checkpoint: PredictionCheckpoint | null;
  prediction: Prediction | null;
  entry: PredictionEntry;
  /** The player is sitting on an unresolved checkpoint: nothing may advance. */
  isBlocking: boolean;
  /** Branch-revealing UI is allowed (no gate here, or it resolved). */
  revealAllowed: boolean;
  /** The gate panel replaces the reasoning body (unresolved, or awaiting Continue). */
  showGate: boolean;
  /** Marks unresolved checkpoints skipped when the learner jumps forward past them. */
  skipCrossedForward: (target: number) => void;
}

export function usePredictionGate(): PredictionGate {
  const storeApi = usePredictionStoreApi();
  const run = usePlayerStore((s) => s.run);
  const index = usePlayerStore((s) => s.index);
  const slug = usePlayerStore((s) => s.slug);
  const rawInputs = usePlayerStore((s) => s.rawInputs);
  const entries = usePredictionStore((s) => s.entries);

  const checkpoints = React.useMemo(
    () => (run ? buildPredictionCheckpoints(run.steps) : []),
    [run],
  );

  /* A new run identity (custom input, different algorithm) drops every entry, so
     a solved checkpoint can never leak into a different execution. */
  const runKey = predictionRunKey(slug, rawInputs);
  React.useEffect(() => {
    storeApi.getState().syncRun(runKey);
  }, [runKey, storeApi]);

  /* Replay / Restart returns execution to the first step; the checkpoint becomes
     answerable again instead of carrying a stale "Correct!". */
  React.useEffect(() => {
    if (index === 0) storeApi.getState().resetEntries();
  }, [index, storeApi]);

  const checkpoint = checkpoints.find((c) => c.stepIndex === index) ?? null;
  const entry = (checkpoint ? entries[checkpoint.id] : undefined) ?? EMPTY_ENTRY;
  const step = run?.steps[index] ?? null;

  const prediction = React.useMemo(
    () => (checkpoint ? derivePrediction(step, checkpoint.id) : null),
    [checkpoint, step],
  );

  const resolved = isResolved(entry);
  const isBlocking = Boolean(checkpoint && prediction && !resolved);
  const showGate = Boolean(checkpoint && prediction && (!resolved || !entry.continued));

  const skipCrossedForward = React.useCallback(
    (target: number) => {
      if (target <= index) return; // backward, or onto the checkpoint itself
      const store = storeApi.getState();
      for (const c of checkpoints) {
        if (c.stepIndex >= index && c.stepIndex < target && !isResolved(store.entries[c.id])) {
          store.skip(c.id);
        }
      }
    },
    [checkpoints, index, storeApi],
  );

  return {
    checkpoint,
    prediction,
    entry,
    isBlocking,
    revealAllowed: !isBlocking,
    showGate,
    skipCrossedForward,
  };
}

export default usePredictionGate;
