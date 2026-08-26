import { describe, expect, it } from "vitest";
import {
  buildPredictionCheckpoints,
  derivePrediction,
  type PredictionOptionId,
} from "@/lib/prediction";
import { deriveReasoning } from "@/lib/reasoning";
import { decisionPreview } from "@/lib/decisionPreview";
import binarySearchModule from "@/engine/algorithms/binarySearch";
import type { ArrayFrame, Step } from "@/engine/types";
import {
  EMPTY_ENTRY,
  createPredictionStore,
  isResolved,
  predictionRunKey,
} from "@/stores/predictionStore";

function steps(values: number[], target: number): Step[] {
  const raw = { values: values.join(", "), target: String(target) };
  const parsed = binarySearchModule.validate(raw);
  if (!parsed.ok) throw new Error(parsed.error);
  return binarySearchModule.run(parsed.parsed).steps;
}

/** The first checkpoint's derived prediction for a run, or null if none exists. */
function firstPrediction(values: number[], target: number) {
  const run = steps(values, target);
  const checkpoint = buildPredictionCheckpoints(run)[0];
  if (!checkpoint) return null;
  const prediction = derivePrediction(run[checkpoint.stepIndex], checkpoint.id);
  return prediction ? { run, checkpoint, prediction } : null;
}

describe("buildPredictionCheckpoints", () => {
  it("surfaces exactly one checkpoint for the Golden lesson run", () => {
    expect(buildPredictionCheckpoints(steps([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23))).toHaveLength(
      1,
    );
  });

  it("attaches the checkpoint to a branch comparison followed by a boundary move", () => {
    const run = steps([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23);
    const { stepIndex } = buildPredictionCheckpoints(run)[0]!;
    const frame = run[stepIndex]!.frame as ArrayFrame;
    expect(frame.comparison).toBeTruthy();
    expect(["=", "==", "==="]).not.toContain(frame.comparison!.op);
    const next = run[stepIndex + 1]!.frame as ArrayFrame;
    expect(JSON.stringify(next.pointers)).not.toBe(JSON.stringify(frame.pointers));
  });

  it("is deterministic across identical runs", () => {
    const a = buildPredictionCheckpoints(steps([1, 3, 5, 7, 9, 11], 11));
    const b = buildPredictionCheckpoints(steps([1, 3, 5, 7, 9, 11], 11));
    expect(a).toEqual(b);
  });

  it("honours the limit and never exceeds it", () => {
    const run = steps([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23);
    expect(buildPredictionCheckpoints(run, 3).length).toBeLessThanOrEqual(3);
    expect(buildPredictionCheckpoints(run, 0)).toEqual([]);
  });
});

describe("derivePrediction", () => {
  it("derives low = mid + 1 when the middle value is smaller than the target", () => {
    const found = firstPrediction([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 91)!;
    const frame = found.run[found.checkpoint.stepIndex]!.frame as ArrayFrame;
    expect(Number(frame.comparison!.left)).toBeLessThan(91);
    expect(found.prediction.correctOptionId).toBe<PredictionOptionId>("move-low");
  });

  it("derives high = mid - 1 when the middle value is larger than the target", () => {
    const found = firstPrediction([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 2)!;
    const frame = found.run[found.checkpoint.stepIndex]!.frame as ArrayFrame;
    expect(Number(frame.comparison!.left)).toBeGreaterThan(2);
    expect(found.prediction.correctOptionId).toBe<PredictionOptionId>("move-high");
  });

  it("derives return mid for the equality case", () => {
    /* Equality frames are not shown as the default checkpoint, but the
       derivation architecture must handle them. */
    const run = steps([1, 2, 3, 4, 5], 3);
    const equality = run.find((s) => {
      const f = s.frame as ArrayFrame;
      return f.kind === "array" && f.comparison && ["=", "==", "==="].includes(f.comparison.op);
    })!;
    expect(derivePrediction(equality)!.correctOptionId).toBe<PredictionOptionId>("return-mid");
  });

  it("works for custom input without any hardcoded values", () => {
    const values = [4, 9, 14, 19, 24, 29, 34];
    for (const target of values) {
      const found = firstPrediction(values, target);
      if (!found) continue;
      const frame = found.run[found.checkpoint.stepIndex]!.frame as ArrayFrame;
      const midValue = Number(frame.comparison!.left);
      const expected: PredictionOptionId = midValue < target ? "move-low" : "move-high";
      expect(found.prediction.correctOptionId).toBe(expected);
    }
  });

  it("offers four labelled options and feedback for every one of them", () => {
    const { prediction } = firstPrediction([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23)!;
    expect(prediction.options.map((o) => o.id)).toEqual([
      "move-low",
      "move-high",
      "return-mid",
      "not-found",
    ]);
    for (const option of prediction.options) {
      expect(option.label.length).toBeGreaterThan(0);
      expect(prediction.misconceptionFeedback[option.id].length).toBeGreaterThan(0);
    }
  });

  it("keeps the answer out of the question, context and accessible prompt", () => {
    const { prediction } = firstPrediction([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23)!;
    const shown = [prediction.question, prediction.accessiblePrompt, ...prediction.context]
      .join(" ")
      .toLowerCase();
    for (const leak of ["discard", "eliminat", "left half", "right half", "mid + 1", "mid - 1"]) {
      expect(shown).not.toContain(leak);
    }
  });

  it("returns null without semantic comparison evidence", () => {
    expect(derivePrediction(null)).toBeNull();
    const bare = {
      frame: {
        kind: "array",
        values: [1, 2],
        states: {},
        pointers: [],
        ranges: [],
      } as ArrayFrame,
    } as Step;
    expect(derivePrediction(bare)).toBeNull();
  });
});

describe("answer leakage at an unresolved checkpoint", () => {
  const found = firstPrediction([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23)!;
  const step = found.run[found.checkpoint.stepIndex]!;
  const frame = step.frame as ArrayFrame;

  it("has branch-revealing reasoning that the gate must replace", () => {
    /* Guards the gate's purpose: Why / Invariant / Next exist on this step, so
       rendering them next to the question would hand over the answer. */
    const reasoning = deriveReasoning(step, found.run[found.checkpoint.stepIndex - 1] ?? null, 1);
    expect(reasoning).toBeTruthy();
    const revealing = [reasoning!.why, reasoning!.invariant, reasoning!.next].filter(Boolean);
    expect(revealing.length).toBeGreaterThan(0);
  });

  it("has a decision preview that must stay hidden until resolution", () => {
    expect(decisionPreview(frame)).not.toBeNull();
  });

  it("still exposes the evidence the learner reasons from", () => {
    const context = found.prediction.context.join(" ");
    expect(context).toContain("search range");
    expect(context).toContain("low = ");
    expect(context).toContain(String(frame.comparison!.right));
  });
});

describe("prediction store", () => {
  const id = "compare-3";

  it("starts unanswered, unresolved and not continued", () => {
    const store = createPredictionStore();
    expect(store.getState().entries[id]).toBeUndefined();
    expect(isResolved(EMPTY_ENTRY)).toBe(false);
    expect(EMPTY_ENTRY.continued).toBe(false);
  });

  it("keeps a selection blocking until it is checked", () => {
    const store = createPredictionStore();
    store.getState().select(id, "move-high");
    expect(store.getState().entries[id]!.status).toBe("selected");
    expect(isResolved(store.getState().entries[id])).toBe(false);
  });

  it("records an incorrect attempt without resolving the checkpoint", () => {
    const store = createPredictionStore();
    store.getState().select(id, "move-high");
    store.getState().check(id, "move-low");
    const entry = store.getState().entries[id]!;
    expect(entry.status).toBe("incorrect");
    expect(entry.attempts).toBe(1);
    expect(isResolved(entry)).toBe(false);
  });

  it("marks a first-try correct answer and allows Continue", () => {
    const store = createPredictionStore();
    store.getState().select(id, "move-low");
    store.getState().check(id, "move-low");
    expect(store.getState().entries[id]!.outcome).toBe("correct-first-try");
    store.getState().continueFrom(id);
    expect(store.getState().entries[id]!.continued).toBe(true);
  });

  it("distinguishes correct-after-retry from a first-try answer", () => {
    const store = createPredictionStore();
    store.getState().select(id, "move-high");
    store.getState().check(id, "move-low");
    store.getState().retry(id);
    expect(store.getState().entries[id]!.status).toBe("unanswered");
    store.getState().select(id, "move-low");
    store.getState().check(id, "move-low");
    expect(store.getState().entries[id]!.outcome).toBe("correct-after-retry");
  });

  it("reveals the answer without claiming it was solved", () => {
    const store = createPredictionStore();
    store.getState().reveal(id, "move-low");
    const entry = store.getState().entries[id]!;
    expect(entry.status).toBe("revealed");
    expect(entry.outcome).toBe("revealed");
    expect(entry.selectedOptionId).toBe("move-low");
    expect(isResolved(entry)).toBe(true);
  });

  it("records a forward skip as skipped, never as correct", () => {
    const store = createPredictionStore();
    store.getState().skip(id);
    expect(store.getState().entries[id]!.outcome).toBe("skipped");
    expect(isResolved(store.getState().entries[id])).toBe(true);
  });

  it("ignores further interaction once the checkpoint is resolved", () => {
    const store = createPredictionStore();
    store.getState().reveal(id, "move-low");
    store.getState().select(id, "not-found");
    store.getState().retry(id);
    expect(store.getState().entries[id]!.status).toBe("revealed");
  });

  it("resets every entry on replay", () => {
    const store = createPredictionStore();
    store.getState().select(id, "move-low");
    store.getState().check(id, "move-low");
    store.getState().resetEntries();
    expect(store.getState().entries).toEqual({});
  });

  it("drops entries when custom input creates a new run", () => {
    const store = createPredictionStore();
    store.getState().syncRun(predictionRunKey("binary-search", { values: "1, 2, 3", target: "23" }));
    store.getState().select(id, "move-low");
    store.getState().check(id, "move-low");
    store.getState().syncRun(predictionRunKey("binary-search", { values: "1, 2, 3", target: "72" }));
    expect(store.getState().entries).toEqual({});
  });

  it("keeps entries when the run identity is unchanged", () => {
    const store = createPredictionStore();
    const key = predictionRunKey("binary-search", { values: "1, 2, 3", target: "23" });
    store.getState().syncRun(key);
    store.getState().select(id, "move-low");
    store.getState().syncRun(key);
    expect(store.getState().entries[id]!.status).toBe("selected");
  });
});

describe("predictionRunKey", () => {
  it("is stable regardless of input property order", () => {
    expect(predictionRunKey("binary-search", { target: "23", values: "1, 2" })).toBe(
      predictionRunKey("binary-search", { values: "1, 2", target: "23" }),
    );
  });

  it("differs per algorithm and per input", () => {
    expect(predictionRunKey("binary-search", { target: "23" })).not.toBe(
      predictionRunKey("linear-search", { target: "23" }),
    );
    expect(predictionRunKey("binary-search", { target: "23" })).not.toBe(
      predictionRunKey("binary-search", { target: "72" }),
    );
  });

  it("has no key without an algorithm", () => {
    expect(predictionRunKey(null, { target: "23" })).toBeNull();
  });
});
