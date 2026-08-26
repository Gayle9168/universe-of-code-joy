import { describe, expect, it } from "vitest";
import { activeNodeIndex, buildTimelineNodes } from "@/lib/timeline";
import type { Step } from "@/engine/types";
import binarySearchModule from "@/engine/algorithms/binarySearch";

function steps(values: number[], target: number): Step[] {
  const parsed = binarySearchModule.validate({
    values: values.join(", "),
    target: String(target),
  });
  if (!parsed.ok) throw new Error(parsed.error);
  return binarySearchModule.run(parsed.parsed).steps as Step[];
}

describe("buildTimelineNodes", () => {
  it("returns no nodes for an empty run", () => {
    expect(buildTimelineNodes([])).toEqual([]);
  });

  it("groups consecutive same-label steps and keeps repeats separate", () => {
    const fake = [
      { phase: "setup" },
      { phase: "probe" },
      { phase: "compare" },
      { phase: "probe" },
      { phase: "probe" },
      { phase: "compare" },
    ] as unknown as Step[];
    const nodes = buildTimelineNodes(fake);
    expect(nodes.map((n) => n.label)).toEqual([
      "setup",
      "probe",
      "compare",
      "probe",
      "compare",
    ]);
    expect(nodes[3]).toMatchObject({ from: 3, to: 4 });
  });

  it("prefers timelineLabel over phase", () => {
    const fake = [{ phase: "probe", timelineLabel: "Find mid" }] as unknown as Step[];
    expect(buildTimelineNodes(fake)[0]!.label).toBe("Find mid");
  });

  it("marks a group as a milestone when any step inside it is one", () => {
    const fake = [
      { phase: "compare" },
      { phase: "compare", isMilestone: true },
    ] as unknown as Step[];
    expect(buildTimelineNodes(fake)[0]!.milestone).toBe(true);
  });

  it("covers every step index of a real run exactly once", () => {
    const all = steps([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23);
    const nodes = buildTimelineNodes(all);
    const covered: number[] = [];
    for (const node of nodes) {
      for (let i = node.from; i <= node.to; i += 1) covered.push(i);
    }
    expect(covered).toEqual(all.map((_, i) => i));
  });

  it("resolves the active node for every step index", () => {
    const all = steps([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 72);
    const nodes = buildTimelineNodes(all);
    all.forEach((_, i) => {
      const active = activeNodeIndex(nodes, i);
      expect(active).toBeGreaterThanOrEqual(0);
      expect(i).toBeGreaterThanOrEqual(nodes[active]!.from);
      expect(i).toBeLessThanOrEqual(nodes[active]!.to);
    });
    expect(activeNodeIndex(nodes, 9999)).toBe(-1);
  });

  it("seek targets are strictly increasing so past/current/future is unambiguous", () => {
    const nodes = buildTimelineNodes(steps([1, 3, 5, 7, 9, 11, 13], 13));
    for (let i = 1; i < nodes.length; i += 1) {
      expect(nodes[i]!.from).toBeGreaterThan(nodes[i - 1]!.from);
    }
  });
});
