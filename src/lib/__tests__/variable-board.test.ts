import { describe, it, expect } from "vitest";
import { activeWindow, invariantFor, midExpression, variableRows } from "@/lib/variableBoard";
import type { ArrayFrame, Frame } from "@/engine/types";

function frame(partial: Partial<ArrayFrame> = {}): ArrayFrame {
  return {
    kind: "array",
    values: [2, 5, 8, 12, 16],
    states: {},
    pointers: [
      { name: "lo", index: 0 },
      { name: "mid", index: 2 },
      { name: "hi", index: 4 },
    ],
    ranges: [],
    ...partial,
  };
}

describe("variableBoard derivations", () => {
  it("builds one row per pointer plus the target", () => {
    const rows = variableRows(frame({ target: { label: "target", value: 13 } }));
    expect(rows.map((r) => r.name)).toEqual(["lo", "mid", "hi", "target"]);
    expect(rows.map((r) => r.value)).toEqual(["0", "2", "4", "13"]);
  });

  it("marks only the values that moved since the previous frame", () => {
    const prev = frame();
    const next = frame({
      pointers: [
        { name: "lo", index: 0 },
        { name: "mid", index: 2 },
        { name: "hi", index: 1 },
      ],
    });
    const rows = variableRows(next, prev);
    expect(rows.filter((r) => r.changed).map((r) => r.name)).toEqual(["hi"]);
  });

  it("treats the first frame as nothing changed", () => {
    expect(variableRows(frame()).every((r) => !r.changed)).toBe(true);
  });

  it("substitutes the midpoint formula", () => {
    expect(midExpression(frame())).toEqual({
      formula: "mid = floor((lo + hi) / 2)",
      substitution: "floor((0 + 4) / 2) = 2",
    });
  });

  it("returns no expression without a mid pointer", () => {
    expect(midExpression(frame({ pointers: [{ name: "lo", index: 0 }] }))).toBeNull();
  });

  it("prefers the frame's own range for the active window", () => {
    expect(activeWindow(frame({ ranges: [{ from: 1, to: 3 }] }))).toEqual({ from: 1, to: 3 });
    expect(activeWindow(frame())).toEqual({ from: 0, to: 4 });
  });

  it("returns no window once lo passes hi", () => {
    const f = frame({
      pointers: [
        { name: "lo", index: 3 },
        { name: "hi", index: 2 },
      ],
    });
    expect(activeWindow(f)).toBeNull();
    expect(invariantFor(f)).toBeNull();
  });

  it("states the invariant over the active window", () => {
    expect(invariantFor(frame({ target: { label: "target", value: 13 } }))).toContain(
      "index is between 0 and 4",
    );
  });

  it("ignores non-array frames", () => {
    const tree: Frame = { kind: "tree", nodes: [], edges: [] };
    expect(variableRows(tree)).toEqual([]);
    expect(midExpression(tree)).toBeNull();
    expect(invariantFor(tree)).toBeNull();
  });
});
