import type { ArrayFrame, CellState } from "@/engine/types";

/**
 * Teaching interpretation of a *decision in progress*.
 *
 * A comparison step must not look as though the search range has already
 * changed: the official range is still whatever the frame declares, and a
 * highlighted surviving side is only a preview of the decision about to be
 * taken. This module decides whether the current frame carries enough semantic
 * evidence to say that, so the generic `frontier` cell state keeps its generic
 * meaning ("still a candidate") everywhere else in the renderer.
 *
 * Evidence required, all from the current frame:
 *  1. a comparison is being asked (`frame.comparison`),
 *  2. a decision is attached to it (`frame.decision`),
 *  3. the frame declares an official range,
 *  4. the highlighted cells form ONE contiguous block that is strictly narrower
 *     than that official range and lies inside it.
 *
 * Anything less returns null and nothing is claimed.
 *
 * Architecture constraint: pure functions only — no React, DOM or stores.
 */

export interface DecisionPreview {
  /** First index of the previewed block. */
  from: number;
  /** Last index of the previewed block. */
  to: number;
  /** The official range, which has NOT changed yet. */
  officialFrom: number;
  officialTo: number;
}

const HIGHLIGHT: CellState = "frontier";

function contiguousHighlight(frame: ArrayFrame): { from: number; to: number } | null {
  const hits: number[] = [];
  for (let i = 0; i < frame.values.length; i += 1) {
    if (frame.states[i] === HIGHLIGHT) hits.push(i);
  }
  if (hits.length === 0) return null;
  const from = hits[0]!;
  const to = hits[hits.length - 1]!;
  if (to - from + 1 !== hits.length) return null; // not one block
  return { from, to };
}

/** The previewed surviving side, or null when the frame does not prove one. */
export function decisionPreview(frame: ArrayFrame): DecisionPreview | null {
  if (!frame.comparison || !frame.decision) return null;
  const range = frame.ranges[0];
  if (!range) return null;

  const block = contiguousHighlight(frame);
  if (!block) return null;

  const officialFrom = Math.min(range.from, range.to);
  const officialTo = Math.max(range.from, range.to);
  const officialSize = officialTo - officialFrom + 1;
  const blockSize = block.to - block.from + 1;

  if (blockSize >= officialSize) return null; // nothing narrowed yet
  if (block.from < officialFrom || block.to > officialTo) return null; // outside the range

  return { from: block.from, to: block.to, officialFrom, officialTo };
}
