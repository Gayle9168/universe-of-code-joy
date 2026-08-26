import type { ArrayFrame, Step } from "@/engine/types";

/**
 * Pure derivation of "predict before reveal" checkpoints for the Golden
 * Visualizer.
 *
 * Everything here comes from semantic engine state — `comparison`, `pointers`,
 * `ranges` and the *next* step's pointer diff. Authored English (`"Discard the
 * left half"`, `"lo moves to 5"`) is never parsed, and no algorithm slug is
 * inspected: a checkpoint exists because the run contains a branch comparison
 * followed by a boundary move, nothing else.
 *
 * Deterministic by construction — no randomness anywhere — so Replay, Previous,
 * seek, custom input and tests all agree about where checkpoints are.
 *
 * Architecture constraint: pure functions only. No React, DOM or stores, and no
 * engine schema additions.
 */

export type PredictionOptionId = "move-low" | "move-high" | "return-mid" | "not-found";

export interface PredictionOption {
  id: PredictionOptionId;
  /** Short, code-shaped label, e.g. `low = mid + 1`. */
  label: string;
}

export interface Prediction {
  /** Stable id: same run, same checkpoint, same id. */
  id: string;
  question: string;
  /** Evidence the learner may reason from — never the answer. */
  context: string[];
  options: PredictionOption[];
  correctOptionId: PredictionOptionId;
  /** Why the correct option follows from the comparison. */
  explanation: string;
  /** Per-option copy naming the misconception behind a wrong choice. */
  misconceptionFeedback: Record<PredictionOptionId, string>;
  /** One sentence a screen reader hears when the gate opens. */
  accessiblePrompt: string;
}

export interface PredictionCheckpoint {
  id: string;
  /** Canonical player step index this checkpoint is attached to. */
  stepIndex: number;
}

/** Boundary pointer names an array algorithm may expose. */
const LOW_NAMES = ["lo", "low", "l", "left"] as const;
const HIGH_NAMES = ["hi", "high", "r", "right"] as const;

function asArrayFrame(step: Step | null | undefined): ArrayFrame | null {
  const frame = step?.frame;
  return frame && frame.kind === "array" ? frame : null;
}

function ptr(frame: ArrayFrame, names: readonly string[]): number | null {
  for (const name of names) {
    const p = frame.pointers.find((q) => q.name === name);
    if (p) return p.index;
  }
  return null;
}

function isEqualityOp(op: string): boolean {
  return op === "=" || op === "==" || op === "===";
}

/** True when `next` moves a low/high boundary relative to `frame`. */
function movesBoundary(frame: ArrayFrame, next: ArrayFrame | null): boolean {
  if (!next) return false;
  const loNow = ptr(frame, LOW_NAMES);
  const hiNow = ptr(frame, HIGH_NAMES);
  const loNext = ptr(next, LOW_NAMES);
  const hiNext = ptr(next, HIGH_NAMES);
  if (loNow !== null && loNext !== null && loNow !== loNext) return true;
  if (hiNow !== null && hiNext !== null && hiNow !== hiNext) return true;
  return false;
}

/**
 * Eligible prediction checkpoints for a canonical run.
 *
 * Phase 6 surfaces the FIRST meaningful branch comparison only: a step whose
 * frame asks a non-equality comparison and whose following step actually moves a
 * boundary. `limit` exists so more checkpoints can be surfaced later without a
 * second implementation.
 */
export function buildPredictionCheckpoints(
  steps: readonly Step[],
  limit: number = 1,
): PredictionCheckpoint[] {
  const out: PredictionCheckpoint[] = [];
  for (let i = 0; i < steps.length && out.length < limit; i += 1) {
    const frame = asArrayFrame(steps[i]);
    if (!frame) continue;
    const c = frame.comparison;
    if (!c || isEqualityOp(c.op)) continue;
    if (ptr(frame, ["mid"]) === null) continue;
    if (!movesBoundary(frame, asArrayFrame(steps[i + 1]))) continue;
    out.push({ id: `compare-${i}`, stepIndex: i });
  }
  return out;
}

const OPTIONS: readonly PredictionOption[] = [
  { id: "move-low", label: "low = mid + 1" },
  { id: "move-high", label: "high = mid - 1" },
  { id: "return-mid", label: "return mid" },
  { id: "not-found", label: "stop — target not found" },
];

/**
 * The question for a checkpoint step.
 *
 * The correct option is decided from the numeric comparison the frame carries
 * (middle value versus target), so one component and one copy system handle the
 * target-larger, target-smaller and equality cases identically. Returns null
 * when the frame does not carry enough semantic evidence.
 */
export function derivePrediction(
  current: Step | null | undefined,
  id: string = "prediction",
): Prediction | null {
  const frame = asArrayFrame(current);
  if (!frame) return null;
  const c = frame.comparison;
  if (!c) return null;
  const mid = ptr(frame, ["mid"]);
  if (mid === null) return null;

  const midValue = Number(c.left);
  const target = Number(c.right);
  if (!Number.isFinite(midValue) || !Number.isFinite(target)) return null;

  const lo = ptr(frame, LOW_NAMES);
  const hi = ptr(frame, HIGH_NAMES);
  const range = frame.ranges[0];

  const correctOptionId: PredictionOptionId =
    midValue === target ? "return-mid" : midValue < target ? "move-low" : "move-high";

  const relation =
    midValue === target ? "equals" : midValue < target ? "is smaller than" : "is larger than";

  const context: string[] = [`arr[${mid}] = ${c.left}`, `${c.left} ${c.op} ${c.right}`];
  if (lo !== null && hi !== null) context.unshift(`low = ${lo}, mid = ${mid}, high = ${hi}`);
  if (range) context.unshift(`search range [${range.from}..${range.to}]`);

  const question =
    correctOptionId === "return-mid"
      ? "What should happen next?"
      : "Which boundary should move next?";

  const explanation =
    correctOptionId === "return-mid"
      ? `The middle value equals the target, so index ${mid} is the answer and the search stops.`
      : correctOptionId === "move-low"
        ? `Since ${c.left} ${relation} ${c.right}, the target can only sit to the right of index ${mid}, so low moves to mid + 1.`
        : `Since ${c.left} ${relation} ${c.right}, the target can only sit to the left of index ${mid}, so high moves to mid - 1.`;

  const misconceptionFeedback: Record<PredictionOptionId, string> = {
    "move-low":
      correctOptionId === "move-low"
        ? explanation
        : `Moving low right would keep the larger values, but ${c.left} ${relation} ${c.right}, so the target must be searched on the smaller-value side.`,
    "move-high":
      correctOptionId === "move-high"
        ? explanation
        : `Moving high left would keep the smaller values, but ${c.left} ${relation} ${c.right}, so the target must be searched on the larger-value side.`,
    "return-mid":
      correctOptionId === "return-mid"
        ? explanation
        : `Returning mid claims a match, but ${c.left} ${relation} ${c.right} — the middle value is not the target.`,
    "not-found":
      correctOptionId === "return-mid"
        ? `The middle value already matches the target, so there is nothing left to rule out.`
        : `Stopping now gives up too early: the candidates to the ${
            correctOptionId === "move-low" ? "right" : "left"
          } of index ${mid} have not been ruled out.`,
  };

  return {
    id,
    question,
    context,
    options: [...OPTIONS],
    correctOptionId,
    explanation,
    misconceptionFeedback,
    accessiblePrompt: `Prediction checkpoint. ${c.left} ${relation} ${c.right}. ${question}`,
  };
}
