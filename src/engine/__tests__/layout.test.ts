import { describe, expect, it } from "vitest";
import { circularLayout, layeredLayout } from "../layout";
import { getModule, hasModule, listModules } from "../registry";
import { StepBuilder, MAX_FRAMES } from "../builder";
import type { Frame } from "../types";

describe("Graph Layout Helpers (src/engine/layout.ts)", () => {
  describe("circularLayout", () => {
    it("handles empty node list", () => {
      const pos = circularLayout([], { x: 50, y: 50 }, 30);
      expect(pos).toEqual({});
    });

    it("handles single node centered", () => {
      const pos = circularLayout(["A"], { x: 50, y: 50 }, 30);
      expect(pos["A"]).toEqual({ x: 50, y: 50 });
    });

    it("arranges multiple nodes evenly with clamped bounds", () => {
      const pos = circularLayout(["A", "B", "C", "D"], { x: 50, y: 50 }, 40);
      expect(Object.keys(pos)).toHaveLength(4);
      for (const p of Object.values(pos)) {
        expect(p.x).toBeGreaterThanOrEqual(4);
        expect(p.x).toBeLessThanOrEqual(96);
        expect(p.y).toBeGreaterThanOrEqual(4);
        expect(p.y).toBeLessThanOrEqual(96);
      }
    });
  });

  describe("layeredLayout", () => {
    it("places nodes in layers from single seed", () => {
      const nodes = ["A", "B", "C", "D"];
      const neighbors: Record<string, string[]> = {
        A: ["B", "C"],
        B: ["D"],
        C: ["D"],
        D: [],
      };
      const pos = layeredLayout(nodes, (id) => neighbors[id] ?? [], ["A"]);
      expect(Object.keys(pos)).toHaveLength(4);
      expect(pos["A"]!.y).toBeLessThan(pos["B"]!.y);
      expect(pos["B"]!.y).toBe(pos["C"]!.y);
      expect(pos["B"]!.y).toBeLessThan(pos["D"]!.y);
    });

    it("handles disconnected orphan nodes via circular fallback", () => {
      const nodes = ["A", "B", "C", "Orphan1", "Orphan2"];
      const neighbors: Record<string, string[]> = {
        A: ["B"],
        B: ["C"],
        C: [],
        Orphan1: [],
        Orphan2: [],
      };
      const pos = layeredLayout(nodes, (id) => neighbors[id] ?? [], ["A"]);
      expect(Object.keys(pos)).toHaveLength(5);
      expect(pos["Orphan1"]).toBeDefined();
      expect(pos["Orphan2"]).toBeDefined();
    });

    it("handles single node graph", () => {
      const pos = layeredLayout(["A"], () => [], ["A"]);
      expect(pos["A"]).toEqual({ x: 50, y: 22 });
    });

    it("handles empty start ids or unknown seeds gracefully", () => {
      const nodes = ["A", "B"];
      const pos = layeredLayout(nodes, () => [], ["UnknownNode"]);
      expect(Object.keys(pos)).toHaveLength(2);
    });
  });
});

describe("Registry & Builder Edge Cases", () => {
  describe("registry", () => {
    it("hasModule identifies registered and unregistered slugs", () => {
      expect(hasModule("binary-search")).toBe(true);
      expect(hasModule("quicksort")).toBe(true);
      expect(hasModule("nonexistent-algo")).toBe(false);
    });

    it("getModule retrieves module or returns undefined", () => {
      expect(getModule("bfs")).toBeDefined();
      expect(getModule("unknown")).toBeUndefined();
    });

    it("listModules returns all registered modules", () => {
      const list = listModules();
      expect(list.length).toBeGreaterThanOrEqual(12);
      expect(list.map((m) => m.slug)).toContain("dijkstra");
    });
  });

  describe("StepBuilder error branches & limits", () => {
    const dummyFrame: Frame = {
      kind: "array",
      values: [1, 2, 3],
      states: {},
      pointers: [],
      ranges: [],
    };

    it("throws when codeLine is out of bounds", () => {
      const builder = new StepBuilder(["line 1", "line 2"], {
        js: ["", ""],
        ts: ["", ""],
        py: ["", ""],
      });
      expect(() => {
        builder.emit({
          frame: dummyFrame,
          codeLine: 0,
          narration: "Narration",
          phase: "test",
        });
      }).toThrow(/out of range/);

      expect(() => {
        builder.emit({
          frame: dummyFrame,
          codeLine: 3,
          narration: "Narration",
          phase: "test",
        });
      }).toThrow(/out of range/);
    });

    it("throws when bumping counter negatively", () => {
      const builder = new StepBuilder(["line 1"], {
        js: [""],
        ts: [""],
        py: [""],
      });
      expect(() => {
        builder.bump("comparisons", -1);
      }).toThrow(/never decrease/);
    });

    it("caps frames at MAX_FRAMES and marks truncated", () => {
      const builder = new StepBuilder(["line 1"], {
        js: [""],
        ts: [""],
        py: [""],
      });
      for (let i = 0; i < MAX_FRAMES + 5; i += 1) {
        builder.emit({
          frame: dummyFrame,
          codeLine: 1,
          narration: `Step ${i}`,
          phase: "loop",
          detail: "details",
          isMilestone: i % 10 === 0,
          aux: [{ kind: "log", label: "Aux", lines: [`i = ${i}`] }],
        });
      }
      expect(builder.count).toBe(MAX_FRAMES);
      const run = builder.finish("test", "input", "output");
      expect(run.truncated).toBe(true);
      expect(run.steps.length).toBe(MAX_FRAMES);
    });
  });
});
