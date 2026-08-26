import type { ArrayFrame, Frame } from "@/engine/types";

/**
 * Pure derivations for the Golden Visualizer: the active search window and the
 * loop invariant. The variable board and the expression panel live in
 * `src/lib/variables.ts`.
 *
 * Everything here is derived from frame data the engine already emits — no new
 * Step fields, no algorithm logic. No React, no DOM, no stores.
 */



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


/** What remains true after this step — shown in the reasoning panel. */
export function invariantFor(frame: Frame): string | null {
  const f = asArrayFrame(frame);
  if (!f) return null;
  const win = activeWindow(f);
  if (!win) return null;
  const label = f.target ? `${f.target.label} ${String(f.target.value)}` : "the answer";
  return `If ${label} is in the array, its index is between ${win.from} and ${win.to}. Everything outside that range is ruled out.`;
}
