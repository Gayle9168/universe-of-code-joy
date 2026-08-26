import { describe, expect, it } from "vitest";
import { LANE_STEP, assignPointerLanes, comparePointerNames } from "@/lib/pointerLanes";

const lanesByName = (markers: Array<{ name: string; slot: number }>) =>
  Object.fromEntries(assignPointerLanes(markers).map((r) => [r.name, r.lane]));

describe("assignPointerLanes", () => {
  it("leaves a lone marker centred on its cell", () => {
    expect(lanesByName([{ name: "mid", slot: 4 }])).toEqual({ mid: 0 });
  });

  it("separates low = mid symmetrically, low on the left", () => {
    const lanes = lanesByName([
      { name: "mid", slot: 3 },
      { name: "lo", slot: 3 },
    ]);
    expect(lanes["lo"]).toBe(-LANE_STEP / 2);
    expect(lanes["mid"]).toBe(LANE_STEP / 2);
  });

  it("separates mid = high symmetrically, mid on the left", () => {
    const lanes = lanesByName([
      { name: "hi", slot: 7 },
      { name: "mid", slot: 7 },
    ]);
    expect(lanes["mid"]).toBe(-LANE_STEP / 2);
    expect(lanes["hi"]).toBe(LANE_STEP / 2);
  });

  it("spreads low = mid = high into three distinct lanes in semantic order", () => {
    const lanes = lanesByName([
      { name: "hi", slot: 5 },
      { name: "mid", slot: 5 },
      { name: "lo", slot: 5 },
    ]);
    expect(lanes["lo"]).toBe(-LANE_STEP);
    expect(lanes["mid"]).toBe(0);
    expect(lanes["hi"]).toBe(LANE_STEP);
    expect(new Set(Object.values(lanes)).size).toBe(3);
  });

  it("does not offset adjacent pointers on different cells", () => {
    const lanes = lanesByName([
      { name: "lo", slot: 4 },
      { name: "mid", slot: 5 },
      { name: "hi", slot: 6 },
    ]);
    expect(lanes).toEqual({ lo: 0, mid: 0, hi: 0 });
  });

  it("is deterministic regardless of input order", () => {
    const a = lanesByName([
      { name: "lo", slot: 2 },
      { name: "mid", slot: 2 },
      { name: "hi", slot: 2 },
    ]);
    const b = lanesByName([
      { name: "mid", slot: 2 },
      { name: "hi", slot: 2 },
      { name: "lo", slot: 2 },
    ]);
    expect(a).toEqual(b);
  });

  it("handles unknown pointer names after the known ones, alphabetically", () => {
    const result = assignPointerLanes([
      { name: "zulu", slot: 1 },
      { name: "alpha", slot: 1 },
      { name: "lo", slot: 1 },
    ]);
    expect(result.map((r) => r.name).sort()).toEqual(["alpha", "lo", "zulu"]);
    const order = [...result].sort((a, b) => a.lane - b.lane).map((r) => r.name);
    expect(order).toEqual(["lo", "alpha", "zulu"]);
  });

  it("orders names semantically", () => {
    expect(comparePointerNames("lo", "mid")).toBeLessThan(0);
    expect(comparePointerNames("hi", "mid")).toBeGreaterThan(0);
  });
});
