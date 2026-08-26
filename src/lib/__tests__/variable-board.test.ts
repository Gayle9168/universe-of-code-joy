import { describe, it, expect } from "vitest";
import { activeWindow, invariantFor } from "@/lib/variableBoard";
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
    expect(invariantFor(tree)).toBeNull();
  });
});
