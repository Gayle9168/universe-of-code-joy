import type { CellState } from "@/engine/types";

/**
 * Pure state-grammar logic for array visualization: deterministic priority when
 * a cell could belong to several states, the non-colour signals each state must
 * carry, and the frame-diff that says which pointer actually moved.
 *
 * Architecture constraint: pure functions only — no React, DOM APIs or stores.
 */

/** Highest meaning first: found > error-ish > compare/active > frontier > sorted > visited > excluded > idle. */
const PRIORITY: CellState[] = [
  "found",
  "compare",
  "active",
  "frontier",
  "sorted",
  "visited",
  "excluded",
  "idle",
];

/** Lower number wins. Unknown states rank last. */
export function statePriority(state: CellState): number {
  const i = PRIORITY.indexOf(state);
  return i === -1 ? PRIORITY.length : i;
}

/** The state a cell should render when several apply at once. */
export function pickCellState(states: readonly CellState[]): CellState {
  if (states.length === 0) return "idle";
  return [...states].sort((a, b) => statePriority(a) - statePriority(b))[0]!;
}

export type CellEmphasis = "primary" | "candidate" | "ruled-out" | "neutral";

export interface CellTreatment {
  emphasis: CellEmphasis;
  /** True when the cell must read as still present but proven irrelevant. */
  dim: boolean;
  /** True when the cell needs a non-colour mark (icon) beside its value. */
  mark: boolean;
}

/**
 * How a cell state must read. `dim` and `mark` exist so the candidate / excluded
 * distinction never depends on colour alone (WCAG 1.4.1).
 */
export function cellTreatment(state: CellState): CellTreatment {
  switch (state) {
    case "found":
      return { emphasis: "primary", dim: false, mark: true };
    case "compare":
    case "active":
      return { emphasis: "primary", dim: false, mark: true };
    case "frontier":
      return { emphasis: "candidate", dim: false, mark: false };
    case "excluded":
      return { emphasis: "ruled-out", dim: true, mark: true };
    default:
      return { emphasis: "neutral", dim: false, mark: false };
  }
}

/**
 * Names of pointers whose index moved between two frames' pointer lists.
 * A pointer that only just appeared does not count as moved — it has no
 * previous position to travel from.
 */
export function changedPointers(
  previous: ReadonlyArray<{ name: string; index: number }> | null | undefined,
  current: ReadonlyArray<{ name: string; index: number }>,
): string[] {
  if (!previous || previous.length === 0) return [];
  const before = new Map(previous.map((p) => [p.name, p.index]));
  return current
    .filter((p) => before.has(p.name) && before.get(p.name) !== p.index)
    .map((p) => p.name);
}

/**
 * Truth of a rendered comparison (`16` `<` `23`) when both sides are numeric.
 * Returns null for non-numeric or unknown operators, so the view can fall back
 * to showing the engine's plain-English verdict alone.
 */
export function evaluateComparison(left: string, op: string, right: string): boolean | null {
  const a = Number(left);
  const b = Number(right);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  switch (op) {
    case "<":
      return a < b;
    case ">":
      return a > b;
    case "<=":
      return a <= b;
    case ">=":
      return a >= b;
    case "===":
    case "==":
    case "=":
      return a === b;
    case "!==":
    case "!=":
      return a !== b;
    default:
      return null;
  }
}
