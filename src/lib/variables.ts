import type { ArrayFrame, AuxPanel, Step } from "@/engine/types";
import { pointerLabel } from "@/lib/pointerLabels";
import { evaluateComparison } from "@/lib/vizState";

/**
 * Pure derivation layer for the Variable Board and the Current Operation panel.
 *
 * Both are read-only views of `steps[index]` (with `steps[index - 1]` used only
 * to diff), so the board can never disagree with the pointers, the code line or
 * the reasoning. No engine schema additions: everything here is computed from
 * `pointers`, `target`, `comparison`, `decision`, `states` and — when a module
 * supplies them — `aux` key-value rows.
 *
 * Architecture constraint: pure functions only. No React, no DOM, no stores.
 */

export interface Variable {
  /** Engine name, e.g. `lo`. */
  name: string;
  /** Lesson-facing label, e.g. `low`. */
  label: string;
  current: string;
  /** Only present when this variable changed on this step. */
  previous?: string;
  changed: boolean;
  /** Accessible sentence — the change must not depend on colour alone. */
  description: string;
}

export type ExpressionLineKind = "formula" | "substitution" | "result" | "truth" | "note";

export interface ExpressionLine {
  kind: ExpressionLineKind;
  text: string;
}

export type OperationKind = "midpoint" | "comparison" | "boundary" | "result";

export type OperationTone = "accent" | "error" | "warning";

export interface Operation {
  kind: OperationKind;
  title: string;
  lines: ExpressionLine[];
  tone: OperationTone;
  /** One short sentence for screen readers and reduced motion. */
  announcement: string;
}

/** Display order for the variables an array algorithm exposes. */
const ORDER = ["lo", "l", "left", "low", "mid", "hi", "r", "right", "high"];

function orderOf(name: string): number {
  const i = ORDER.indexOf(name.toLowerCase());
  return i === -1 ? ORDER.length : i;
}

function asArrayFrame(step: Step | null | undefined): ArrayFrame | null {
  const frame = step?.frame;
  return frame && frame.kind === "array" ? frame : null;
}

function pointerIndex(frame: ArrayFrame, name: string): number | null {
  const p = frame.pointers.find((q) => q.name === name);
  return p ? p.index : null;
}

function keyValueRows(step: Step | null | undefined): Array<{ k: string; v: string }> | null {
  const panel = step?.aux?.find((p: AuxPanel) => p.kind === "keyvalue");
  if (!panel || panel.kind !== "keyvalue") return null;
  return panel.rows.map((r) => ({ k: r.k, v: r.v }));
}

function makeVariable(name: string, current: string, previous: string | null): Variable {
  const label = pointerLabel(name);
  const changed = previous !== null && previous !== current;
  return {
    name,
    label,
    current,
    ...(changed ? { previous } : {}),
    changed,
    description: changed
      ? `${label} changed from ${previous} to ${current}`
      : `${label} is ${current}`,
  };
}

/**
 * The algorithmically important variables for the current step.
 *
 * Source priority: a module's own `keyvalue` aux panel, otherwise the frame's
 * pointers plus the hunted target. A variable the engine has not produced yet
 * (binary search's `mid` on the setup step) is simply absent — never a fake `0`
 * or an em dash.
 */
export function deriveVariables(
  current: Step | null | undefined,
  previous?: Step | null,
): Variable[] {
  const rows = keyValueRows(current);
  if (rows) {
    const before = new Map((keyValueRows(previous) ?? []).map((r) => [r.k, r.v]));
    return rows.map((r) => makeVariable(r.k, r.v, before.has(r.k) ? before.get(r.k)! : null));
  }

  const frame = asArrayFrame(current);
  if (!frame) return [];
  const prev = asArrayFrame(previous);

  const vars: Variable[] = [...frame.pointers]
    .sort((a, b) => orderOf(a.name) - orderOf(b.name))
    .map((ptr) => {
      const was = prev ? pointerIndex(prev, ptr.name) : null;
      return makeVariable(ptr.name, String(ptr.index), was === null ? null : String(was));
    });

  if (frame.target) {
    const was = prev?.target ? String(prev.target.value) : null;
    vars.push(makeVariable(frame.target.label, String(frame.target.value), was));
  }

  return vars;
}

/** True when this frame has settled on a found cell. */
function hasFound(frame: ArrayFrame): boolean {
  return Object.values(frame.states).includes("found");
}

function comparisonLines(frame: ArrayFrame): ExpressionLine[] {
  const c = frame.comparison;
  if (!c) return [];
  const lines: ExpressionLine[] = [{ kind: "substitution", text: `${c.left} ${c.op} ${c.right}` }];
  const truth = evaluateComparison(c.left, c.op, c.right);
  if (truth !== null) lines.push({ kind: "truth", text: truth ? "TRUE" : "FALSE" });
  if (c.verdict) lines.push({ kind: "note", text: c.verdict });
  return lines;
}

/**
 * The single calculation, comparison, boundary move or result this step is
 * about — one reusable operation instead of three permanently mounted cards.
 *
 * Precedence is result > comparison > midpoint > boundary, so the panel always
 * follows the algorithm's current thought and never shows two expressions at
 * once. Returns null on steps that compute nothing (setup).
 */
export function deriveOperation(
  current: Step | null | undefined,
  previous?: Step | null,
): Operation | null {
  const frame = asArrayFrame(current);
  if (!frame) return null;
  const prev = asArrayFrame(previous);
  const tone: OperationTone = frame.comparison?.tone ?? frame.decision?.tone ?? "accent";

  /* Result — the search has landed. */
  if (hasFound(frame)) {
    const lines = comparisonLines(frame);
    if (frame.decision) lines.push({ kind: "result", text: frame.decision.title });
    return {
      kind: "result",
      title: "Result",
      lines,
      tone: "accent",
      announcement: frame.decision?.title ?? "The search is over.",
    };
  }

  /* Comparison — the question this step asks, and its answer. */
  if (frame.comparison) {
    const lines = comparisonLines(frame);
    if (frame.decision) lines.push({ kind: "result", text: frame.decision.title });
    const truth = evaluateComparison(
      frame.comparison.left,
      frame.comparison.op,
      frame.comparison.right,
    );
    return {
      kind: "comparison",
      title: "Comparison",
      lines,
      tone,
      announcement: `${frame.comparison.left} ${frame.comparison.op} ${frame.comparison.right} is ${
        truth === null ? "evaluated" : truth ? "true" : "false"
      }.${frame.comparison.verdict ? ` ${frame.comparison.verdict}.` : ""}`,
    };
  }

  /* Midpoint — the arithmetic that put the probe where it is. Recomputed from
     the pointer indices rather than parsed out of display text, so the result
     and the pointer agree by construction. */
  const lo = pointerIndex(frame, "lo");
  const hi = pointerIndex(frame, "hi");
  const mid = pointerIndex(frame, "mid");
  if (lo !== null && hi !== null && mid !== null) {
    return {
      kind: "midpoint",
      title: "Midpoint calculation",
      lines: [
        { kind: "formula", text: "mid = floor((low + high) / 2)" },
        { kind: "substitution", text: `floor((${lo} + ${hi}) / 2)` },
        { kind: "result", text: `= ${mid}` },
      ],
      tone: "accent",
      announcement: `mid equals floor of low plus high divided by two. With low ${lo} and high ${hi}, mid is ${mid}.`,
    };
  }

  /* Boundary update — which side collapsed, and where the boundary landed. */
  if (prev) {
    const prevMid = pointerIndex(prev, "mid");
    for (const ptr of frame.pointers) {
      const was = pointerIndex(prev, ptr.name);
      if (was === null || was === ptr.index) continue;
      const label = pointerLabel(ptr.name);
      const lines: ExpressionLine[] = [];
      if (prevMid !== null && ptr.index === prevMid + 1) {
        lines.push({ kind: "formula", text: `${label} = mid + 1` });
      } else if (prevMid !== null && ptr.index === prevMid - 1) {
        lines.push({ kind: "formula", text: `${label} = mid - 1` });
      }
      lines.push({ kind: "substitution", text: `${was} → ${ptr.index}` });
      if (frame.decision?.detail) lines.push({ kind: "note", text: frame.decision.detail });
      return {
        kind: "boundary",
        title: "Boundary update",
        lines,
        tone,
        announcement: `${label} changed from ${was} to ${ptr.index}.`,
      };
    }
  }

  return null;
}
