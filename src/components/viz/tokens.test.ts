import { describe, expect, it } from "vitest";
import { FILL, legendLabel, legendRows, statesInFrame } from "./tokens";
import type { CellState, Frame } from "@/engine/types";

const arrayFrame = (states: Record<number, CellState>): Frame => ({
  kind: "array",
  values: Object.keys(states).map(Number),
  states,
  pointers: [],
  ranges: [],
});

describe("legendLabel", () => {
  it("uses the default wording when the slug has no override", () => {
    expect(legendLabel("bubble-sort", "active")).toBe("Current");
    expect(legendLabel("bubble-sort", "sorted")).toBe("In final position");
  });

  it("uses per-slug wording where the same state means something different", () => {
    expect(legendLabel("binary-search", "compare")).toBe("Midpoint");
    expect(legendLabel("binary-search", "excluded")).toBe("Discarded");
    expect(legendLabel("sliding-window", "excluded")).toBe("Leaving");
    expect(legendLabel("heap-sort", "sorted")).toBe("Removed from heap");
  });
});

describe("statesInFrame", () => {
  it("collects the states present in an array frame", () => {
    const states = statesInFrame(arrayFrame({ 0: "idle", 1: "compare", 2: "idle", 3: "excluded" }));
    expect(states).toEqual(new Set(["idle", "compare", "excluded"]));
  });

  it("collects node states from graph and tree frames", () => {
    const graph: Frame = {
      kind: "graph",
      directed: false,
      weighted: false,
      nodes: [
        { id: "a", label: "A", x: 0, y: 0, state: "active" },
        { id: "b", label: "B", x: 1, y: 0, state: "frontier" },
        { id: "c", label: "C", x: 2, y: 0, state: "visited" },
      ],
      edges: [],
    };
    expect(statesInFrame(graph)).toEqual(new Set(["active", "frontier", "visited"]));
  });

  it("collects cell states from grid and table frames", () => {
    const grid: Frame = {
      kind: "grid",
      rows: 1,
      cols: 2,
      cells: [
        { r: 0, c: 0, state: "found" },
        { r: 0, c: 1, state: "idle" },
      ],
    };
    expect(statesInFrame(grid)).toEqual(new Set(["found", "idle"]));
  });
});

describe("legendRows", () => {
  it("returns nothing when the frame is all idle — nothing to explain", () => {
    expect(legendRows(arrayFrame({ 0: "idle", 1: "idle" }), "binary-search")).toEqual([]);
  });

  it("lists only the states present, in a fixed order", () => {
    const rows = legendRows(
      arrayFrame({ 0: "excluded", 1: "compare", 2: "idle" }),
      "binary-search",
    );
    expect(rows.map((r) => r.state)).toEqual(["compare", "excluded", "idle"]);
  });

  it("labels from the per-slug wording and fills from the same token the viz uses", () => {
    const rows = legendRows(arrayFrame({ 0: "compare", 1: "excluded" }), "binary-search");
    expect(rows.find((r) => r.state === "compare")?.label).toBe("Midpoint");
    expect(rows.find((r) => r.state === "excluded")?.fill).toBe(FILL.excluded);
  });
});
