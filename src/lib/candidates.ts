import type { Frame, Step } from "@/engine/types";

/**
 * How many cells are still in play in an array frame — everything not ruled out.
 *
 * `null` for the frame kinds that have no such notion (tree, graph, grid, table),
 * so callers can tell "no answer" from "zero candidates left", which is a real
 * and meaningful state at the end of a failed binary search.
 */
export function candidatesLeft(frame: Frame): number | null {
  if (frame.kind !== "array") return null;
  let live = 0;
  for (let i = 0; i < frame.values.length; i += 1) {
    if ((frame.states[i] ?? "idle") !== "excluded") live += 1;
  }
  return live;
}

/**
 * The run of candidate counts up to and including `index`, with consecutive
 * repeats collapsed — `[16, 8, 4, 2, 1]` for a 16-value binary search played to
 * the end.
 */
export function candidateTrail(steps: Step[], index: number): number[] {
  const trail: number[] = [];
  const last = Math.min(index, steps.length - 1);
  for (let i = 0; i <= last; i += 1) {
    const count = candidatesLeft(steps[i]!.frame);
    if (count === null) continue;
    if (trail[trail.length - 1] !== count) trail.push(count);
  }
  return trail;
}

/**
 * Whether a trail is worth showing as a shrinking search space.
 *
 * Measured across all 21 presets: binary search gives `16 → 8 → 4 → 2 → 1 → 0`,
 * but quicksort gives `8 → 4 → 8 → 6 → 8` and sliding-window `11 → 10 → 11 → 10`
 * — their "excluded" means *outside the current partition/window*, which grows
 * back. Rendering those as a halving trail would state something false, so the
 * strip only appears when the count never goes back up and has actually moved.
 */
export function isShrinkingTrail(trail: number[]): boolean {
  if (trail.length < 2) return false;
  for (let i = 1; i < trail.length; i += 1) {
    if (trail[i]! > trail[i - 1]!) return false;
  }
  return true;
}

/**
 * The full trail the run *will* produce, so the strip can reserve its width up
 * front. Without this the strip grows a segment at a time and shoves the
 * counters sideways on every narrowing step.
 */
export function fullCandidateTrail(steps: Step[]): number[] {
  return candidateTrail(steps, steps.length - 1);
}

/**
 * One-line summary of a range for the status strip: what it is, and how big.
 *
 * The strip used to print the index extent (`left half: 0–3`), which on binary
 * search restated `lo` and `hi` from the very same row. The bracket on the array
 * already shows *where* the range is, so the size is the part worth writing —
 * except when the label already carries its own numbers, as binary search's
 * `search window · 10 → 5 candidates` does, where appending one would read
 * `…candidates: 5`.
 */
export function rangeSummary(range: { label?: string; from: number; to: number }): string {
  const size = Math.max(0, range.to - range.from + 1);
  if (!range.label) return `range: ${size}`;
  return /\d/.test(range.label) ? range.label : `${range.label}: ${size}`;
}
