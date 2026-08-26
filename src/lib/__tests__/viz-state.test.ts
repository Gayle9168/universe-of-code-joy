import { describe, it, expect } from "vitest";
import {
  cellTreatment,
  changedPointers,
  evaluateComparison,
  pickCellState,
  statePriority,
} from "@/lib/vizState";

describe("cell state priority", () => {
  it("ranks found above every other state", () => {
    expect(statePriority("found")).toBeLessThan(statePriority("compare"));
    expect(statePriority("compare")).toBeLessThan(statePriority("frontier"));
    expect(statePriority("frontier")).toBeLessThan(statePriority("excluded"));
    expect(statePriority("excluded")).toBeLessThan(statePriority("idle"));
  });

  it("picks the highest-meaning state when several apply", () => {
    expect(pickCellState(["excluded", "found", "frontier"])).toBe("found");
    expect(pickCellState(["idle", "frontier"])).toBe("frontier");
    expect(pickCellState([])).toBe("idle");
  });
});

describe("cell treatment", () => {
  it("gives excluded cells a dim + mark signal, not colour alone", () => {
    const t = cellTreatment("excluded");
    expect(t).toEqual({ emphasis: "ruled-out", dim: true, mark: true });
  });

  it("treats the probe and the result as the primary focus", () => {
    expect(cellTreatment("compare").emphasis).toBe("primary");
    expect(cellTreatment("found").emphasis).toBe("primary");
    expect(cellTreatment("found").mark).toBe(true);
  });

  it("keeps surviving candidates undimmed and unmarked", () => {
    expect(cellTreatment("frontier")).toEqual({
      emphasis: "candidate",
      dim: false,
      mark: false,
    });
    expect(cellTreatment("idle").emphasis).toBe("neutral");
  });
});

describe("changedPointers", () => {
  it("reports only the boundary that moved", () => {
    const prev = [
      { name: "lo", index: 0 },
      { name: "hi", index: 9 },
    ];
    const next = [
      { name: "lo", index: 5 },
      { name: "hi", index: 9 },
    ];
    expect(changedPointers(prev, next)).toEqual(["lo"]);
  });

  it("does not treat a newly appearing pointer as movement", () => {
    const prev = [{ name: "lo", index: 0 }];
    const next = [
      { name: "lo", index: 0 },
      { name: "mid", index: 4 },
    ];
    expect(changedPointers(prev, next)).toEqual([]);
  });

  it("reports nothing on the first frame", () => {
    expect(changedPointers(null, [{ name: "lo", index: 0 }])).toEqual([]);
    expect(changedPointers([], [{ name: "lo", index: 0 }])).toEqual([]);
  });
});

describe("evaluateComparison", () => {
  it("evaluates the operators binary search emits", () => {
    expect(evaluateComparison("16", "<", "23")).toBe(true);
    expect(evaluateComparison("16", ">", "23")).toBe(false);
    expect(evaluateComparison("23", "===", "23")).toBe(true);
    expect(evaluateComparison("8", "<=", "8")).toBe(true);
  });

  it("returns null when it cannot decide", () => {
    expect(evaluateComparison("arr[4]", "<", "23")).toBeNull();
    expect(evaluateComparison("1", "~", "2")).toBeNull();
  });
});
