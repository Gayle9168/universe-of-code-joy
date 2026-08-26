import { describe, expect, it } from "vitest";
import { decisionPreview } from "@/lib/decisionPreview";
import type { ArrayFrame } from "@/engine/types";
import binarySearchModule from "@/engine/algorithms/binarySearch";

function frames(values: number[], target: number): ArrayFrame[] {
  const raw = { values: values.join(", "), target: String(target) };
  const parsed = binarySearchModule.validate(raw);
  if (!parsed.ok) throw new Error(parsed.error);
  return binarySearchModule.run(parsed.parsed).steps.map((s) => s.frame as ArrayFrame);
}

/** A frame with a range but no comparison/decision evidence. */
function bareFrame(): ArrayFrame {
  return {
    kind: "array",
    values: [1, 2, 3, 4],
    states: { 0: "frontier", 1: "frontier", 2: "frontier", 3: "frontier" },
    pointers: [],
    ranges: [{ from: 0, to: 3, label: "search range" }],
  } as ArrayFrame;
}

describe("decisionPreview", () => {
  it("returns null without comparison and decision evidence", () => {
    expect(decisionPreview(bareFrame())).toBeNull();
  });

  it("returns null when there is no official range", () => {
    const frame = { ...bareFrame(), ranges: [] } as ArrayFrame;
    expect(decisionPreview(frame)).toBeNull();
  });

  it("never previews a block equal to or wider than the official range", () => {
    for (const frame of frames([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23)) {
      const preview = decisionPreview(frame);
      if (!preview) continue;
      const range = frame.ranges[0]!;
      expect(preview.from).toBeGreaterThanOrEqual(range.from);
      expect(preview.to).toBeLessThanOrEqual(range.to);
      expect(preview.to - preview.from).toBeLessThan(range.to - range.from);
    }
  });

  it("only ever appears on comparison steps of a real run", () => {
    const run = (() => {
      const parsed = binarySearchModule.validate({
        values: "2, 5, 8, 12, 16, 23, 38, 56, 72, 91",
        target: "23",
      });
      if (!parsed.ok) throw new Error(parsed.error);
      return binarySearchModule.run(parsed.parsed);
    })();
    for (const step of run.steps) {
      const preview = decisionPreview(step.frame as ArrayFrame);
      if (preview) {
        expect((step.frame as ArrayFrame).comparison).toBeTruthy();
        expect((step.frame as ArrayFrame).decision).toBeTruthy();
      }
    }
  });

  it("does not preview on a target-absent run's terminal frame", () => {
    const all = frames([2, 5, 8], 99);
    expect(decisionPreview(all[all.length - 1]!)).toBeNull();
  });
});
