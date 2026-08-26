import type { ArrayFrame, Frame } from "@/engine/types";

/**
 * Pure derivations for the Golden Visualizer teaching panels: the variable
 * board, the midpoint expression and the loop invariant.
 *
 * Everything here is derived from frame data the engine already emits — no new
 * Step fields, no algorithm logic. No React, no DOM, no stores.
 */

export interface VariableRow {
  name: string;
  value: string;
  /** True when this row's value differs from the previous step's. */
  changed: boolean;
  /** The previous step's value, present only when this row changed. */
  previous?: string;
}


export interface MidExpression {
  formula: string;
  substitution: string;
}

function asArrayFrame(frame: Frame | undefined | null): ArrayFrame | null {
  return frame && frame.kind === "array" ? frame : null;
}

function pointerIndex(frame: ArrayFrame, name: string): number | null {
  const p = frame.pointers.find((q) => q.name === name);
  return p ? p.index : null;
}

/** The window currently in play: the frame's own range, else its lo/hi pointers. */
export function activeWindow(frame: ArrayFrame): { from: number; to: number } | null {
  const range = frame.ranges[0];
  if (range) return { from: range.from, to: range.to };
  const lo = pointerIndex(frame, "lo");
  const hi = pointerIndex(frame, "hi");
  if (lo === null || hi === null || lo > hi) return null;
  return { from: lo, to: hi };
}

/**
 * One row per pointer the frame carries, plus the hunted target when present.
 * `changed` compares against `prev` so the board can highlight only what moved.
 */
export function variableRows(frame: Frame, prev?: Frame | null): VariableRow[] {
  const f = asArrayFrame(frame);
  if (!f) return [];
  const p = asArrayFrame(prev);

  const rows: VariableRow[] = f.pointers.map((ptr) => {
    const before = p ? pointerIndex(p, ptr.name) : null;
    const changed = before !== null && before !== ptr.index;
    return {
      name: ptr.name,
      value: String(ptr.index),
      changed,
      ...(changed ? { previous: String(before) } : {}),
    };
  });


  if (f.target) {
    rows.push({
      name: f.target.label,
      value: String(f.target.value),
      changed: p?.target ? String(p.target.value) !== String(f.target.value) : false,
    });
  }

  return rows;
}

/** `mid = floor((lo + hi) / 2)` with the current numbers substituted in. */
export function midExpression(frame: Frame): MidExpression | null {
  const f = asArrayFrame(frame);
  if (!f) return null;
  const lo = pointerIndex(f, "lo");
  const hi = pointerIndex(f, "hi");
  const mid = pointerIndex(f, "mid");
  if (lo === null || hi === null || mid === null) return null;
  return {
    formula: "mid = floor((lo + hi) / 2)",
    substitution: `floor((${lo} + ${hi}) / 2) = ${mid}`,
  };
}

/** What remains true after this step — shown in the reasoning panel. */
export function invariantFor(frame: Frame): string | null {
  const f = asArrayFrame(frame);
  if (!f) return null;
  const win = activeWindow(f);
  if (!win) return null;
  const label = f.target ? `${f.target.label} ${String(f.target.value)}` : "the answer";
  return `If ${label} is in the array, its index is between ${win.from} and ${win.to}. Everything outside that range is ruled out.`;
}
