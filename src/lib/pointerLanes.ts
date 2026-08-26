/**
 * Deterministic lane assignment for pointer markers that land on the same cell.
 *
 * When low, mid and high collapse onto one index (the final frame of a search),
 * stacked labels become illegible. Every marker sharing a cell is spread
 * symmetrically around it in a stable semantic order — low, then mid, then high,
 * then anything else alphabetically — so the same frame always renders the same
 * layout and no label sits on top of another.
 *
 * Generic: the ordering is a name preference list, not an algorithm rule.
 *
 * Architecture constraint: pure functions only — no React, DOM or stores.
 */

/** Horizontal spacing between two markers sharing a cell, in px. */
export const LANE_STEP = 44;

export interface LaneInput {
  name: string;
  /** Column the marker points at. */
  slot: number;
}

export interface LaneResult extends LaneInput {
  /** Horizontal offset from the cell centre, in px. 0 when alone on the cell. */
  lane: number;
  /** Position within its cell group, left to right. */
  order: number;
  /** How many markers share this cell. */
  groupSize: number;
}

const NAME_ORDER = ["lo", "low", "l", "left", "mid", "middle", "hi", "high", "r", "right"];

function rank(name: string): number {
  const i = NAME_ORDER.indexOf(name.toLowerCase());
  return i === -1 ? NAME_ORDER.length : i;
}

/** Stable semantic ordering for markers inside one cell. */
export function comparePointerNames(a: string, b: string): number {
  const byRank = rank(a) - rank(b);
  return byRank !== 0 ? byRank : a.localeCompare(b);
}

/**
 * Lane offsets for every marker, returned in input order.
 * A marker alone on its cell gets `lane: 0`; a group of n is centred on the
 * cell, so two markers sit at ±laneStep/2 and three at -laneStep, 0, +laneStep.
 */
export function assignPointerLanes(
  markers: readonly LaneInput[],
  laneStep: number = LANE_STEP,
): LaneResult[] {
  const groups = new Map<number, string[]>();
  for (const m of markers) {
    const bucket = groups.get(m.slot);
    if (bucket) bucket.push(m.name);
    else groups.set(m.slot, [m.name]);
  }
  for (const bucket of groups.values()) bucket.sort(comparePointerNames);

  return markers.map((m) => {
    const bucket = groups.get(m.slot) ?? [m.name];
    const order = Math.max(0, bucket.indexOf(m.name));
    const groupSize = bucket.length;
    const lane = groupSize < 2 ? 0 : (order - (groupSize - 1) / 2) * laneStep;
    return { ...m, lane, order, groupSize };
  });
}
