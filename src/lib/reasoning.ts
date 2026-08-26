import type { ArrayFrame, Step } from "@/engine/types";
import { pointerLabel } from "@/lib/pointerLabels";
import { activeWindow } from "@/lib/variableBoard";

/**
 * Pure reasoning derivation for the Golden Visualizer.
 *
 * Answers four questions about the step the player is paused on: what just
 * happened, why that operation is valid, what remains guaranteed and what comes
 * next. Everything is read from semantic frame state — `phase`, `pointers`,
 * `ranges`, `comparison`, `values`, `target` — never from narration, detail or
 * decision prose, and never from a phase name alone when a real pointer diff can
 * confirm the same fact.
 *
 * `invariantFor` in variableBoard.ts stays focused on live search-range
 * invariants; terminal (found / empty range) result wording lives here.
 *
 * Architecture constraint: pure functions only. No React, no DOM, no stores, no
 * engine schema additions.
 */

export interface Reasoning {
  /** The immediate execution event, kept short. */
  happened: string;
  /** Why the operation is logically valid. The most important field. */
  why?: string;
  /** True for the *current* displayed state, never a stale range. */
  invariant?: string;
  /** `Result` on terminal steps, `Invariant` while the search is live. */
  invariantLabel: "Invariant" | "Result";
  /** Orientation only — omitted once the search has terminated. */
  next?: string;
  /** The single sentence a screen reader should hear for this step. */
  accessibleSummary: string;
}

function asArrayFrame(step: Step | null | undefined): ArrayFrame | null {
  const frame = step?.frame;
  return frame && frame.kind === "array" ? frame : null;
}

function ptr(frame: ArrayFrame, name: string): number | null {
  const p = frame.pointers.find((q) => q.name === name);
  return p ? p.index : null;
}

function targetText(frame: ArrayFrame): string {
  return frame.target ? String(frame.target.value) : "the target";
}

function foundIndex(frame: ArrayFrame): number | null {
  for (const [key, state] of Object.entries(frame.states)) {
    if (state === "found") return Number(key);
  }
  return null;
}

/** The invariant sentence for the range the canvas is drawing right now. */
function rangeInvariant(frame: ArrayFrame): string | null {
  const win = activeWindow(frame);
  if (!win) return null;
  return `If ${targetText(frame)} exists, its index is between ${win.from} and ${win.to}.`;
}

/**
 * Which boundary actually moved, confirmed by diffing pointer indices rather
 * than trusting a `narrow-left` / `narrow-right` phase name.
 */
function movedBoundary(
  frame: ArrayFrame,
  prev: ArrayFrame | null,
): { name: string; from: number; to: number } | null {
  if (!prev) return null;
  for (const name of ["lo", "hi", "l", "r", "low", "high"]) {
    const now = ptr(frame, name);
    const was = ptr(prev, name);
    if (now === null || was === null || now === was) continue;
    return { name, from: was, to: now };
  }
  return null;
}

function summarize(stepNumber: number | undefined, parts: (string | undefined)[]): string {
  const body = parts.filter((p): p is string => Boolean(p)).join(" ");
  return stepNumber === undefined ? body : `Step ${stepNumber}. ${body}`;
}

/**
 * Reasoning for `steps[index]`, using `steps[index - 1]` only to diff.
 *
 * `stepNumber` is 1-based and used for the accessible summary only. Milestone
 * steps get one extra teaching sentence; they never change which branch of the
 * derivation runs.
 */
export function deriveReasoning(
  current: Step | null | undefined,
  previous?: Step | null,
  stepNumber?: number,
): Reasoning | null {
  const frame = asArrayFrame(current);
  if (!current || !frame) return null;
  const prev = asArrayFrame(previous);

  const lo = ptr(frame, "lo");
  const hi = ptr(frame, "hi");
  const mid = ptr(frame, "mid");
  const target = targetText(frame);
  const invariant = rangeInvariant(frame);
  const milestone = current.isMilestone === true;
  const found = foundIndex(frame);

  /* ---- terminal: found ---- */
  if (found !== null) {
    const happened = `Found the target ${target} at index ${found}.`;
    return {
      happened,
      why: "The middle value exactly matches the target, so no further search is necessary.",
      invariant: `arr[${found}] = ${target}.`,
      invariantLabel: "Result",
      accessibleSummary: summarize(stepNumber, [happened]),
    };
  }

  /* ---- terminal: empty range ---- */
  if (lo !== null && hi !== null && lo > hi) {
    const happened = "The search range became empty.";
    return {
      happened,
      why: "Every remaining index was ruled out by an earlier comparison.",
      invariant: `No candidate index remains, so ${target} is not present in the array.`,
      invariantLabel: "Result",
      accessibleSummary: summarize(stepNumber, [happened, `${target} is not in the array.`]),
    };
  }

  /* ---- comparison ---- */
  const c = frame.comparison;
  if (c && mid !== null) {
    if (c.op === "=" || c.op === "==" || c.op === "===") {
      const happened = `${c.left} at index ${mid} matches the target ${c.right}.`;
      return {
        happened,
        why: "The middle value equals the target, so the index is known and the search can stop.",
        invariant: `arr[${mid}] = ${c.right}.`,
        invariantLabel: "Result",
        next: "Report the index and stop the search.",
        accessibleSummary: summarize(stepNumber, [happened]),
      };
    }

    const smaller = c.op === "<" || c.op === "<=";
    const firstElimination = lo === 0 && hi === frame.values.length - 1;
    const happened = smaller
      ? `${c.left} is smaller than the target ${c.right}.`
      : `${c.left} is larger than the target ${c.right}.`;
    const why = [
      `Because the array is sorted, every value ${smaller ? "at or left of" : "at or right of"} index ${mid} is also ${smaller ? "too small" : "too large"}.`,
      /* The misconception is worth naming on the first elimination — when the
         window is still the whole array — and on milestone steps. Semantic
         state decides this; it never changes which branch runs. */
      firstElimination || milestone
        ? "We are not guessing which side holds the target — sorted order proves the other side cannot."
        : "",
    ]
      .filter(Boolean)
      .join(" ");
    const from = smaller ? lo : mid;
    const to = smaller ? mid : hi;
    const discard =
      from !== null && to !== null
        ? `Discard indices ${from} through ${to}.`
        : "Discard the impossible half.";
    return {
      happened,
      why,
      invariant: `Any occurrence of ${c.right} must be to the ${smaller ? "right" : "left"} of index ${mid}.`,
      invariantLabel: "Invariant",
      next: discard,
      accessibleSummary: summarize(stepNumber, [happened, discard]),
    };
  }

  /* ---- boundary movement, confirmed by a real pointer diff ---- */
  const moved = movedBoundary(frame, prev);
  if (moved && prev) {
    const label = pointerLabel(moved.name);
    const prevMid = ptr(prev, "mid");
    const forward = moved.to > moved.from;
    const happened = `Moved ${label} from index ${moved.from} to index ${moved.to}.`;
    const why =
      prevMid === null
        ? `The discarded side was already ruled out, so index ${moved.to} is the ${forward ? "first" : "last"} remaining candidate.`
        : forward
          ? `Indices up to ${prevMid} were already proven too small, so index ${moved.to} is the first remaining candidate.`
          : `Indices from ${prevMid} onward were already proven too large, so index ${moved.to} is the last remaining candidate.`;
    return {
      happened,
      why,
      ...(invariant ? { invariant } : {}),
      invariantLabel: "Invariant",
      next: "Calculate the midpoint of the smaller search range.",
      accessibleSummary: summarize(stepNumber, [happened, invariant ?? ""]),
    };
  }

  /* ---- midpoint probe ---- */
  if (mid !== null && lo !== null && hi !== null) {
    const value = frame.values[mid];
    const happened = `Calculated the midpoint at index ${mid}.`;
    return {
      happened,
      why: "Reading the middle value lets us decide which half of the remaining range can be discarded.",
      ...(invariant ? { invariant } : {}),
      invariantLabel: "Invariant",
      next:
        value === undefined
          ? `Compare the middle value with the target ${target}.`
          : `Compare arr[${mid}] = ${String(value)} with the target ${target}.`,
      accessibleSummary: summarize(stepNumber, [happened]),
    };
  }

  /* ---- setup ---- */
  const happened = `We start with the entire sorted array of ${frame.values.length} values as the search range.`;
  return {
    happened,
    why: "Binary search needs a valid candidate range before it can repeatedly cut that range in half.",
    ...(invariant ? { invariant } : {}),
    invariantLabel: "Invariant",
    next: "Calculate the midpoint of the current search range.",
    accessibleSummary: summarize(stepNumber, [happened]),
  };
}
