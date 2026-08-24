import { describe, expect, it } from "vitest";
import { getModule, listAllModules, listModules, resolveModule } from "@/engine/registry";
import { algorithms } from "@/data/algorithms";
import type { AlgorithmRun, ArrayFrame, GraphFrame, TreeFrame } from "@/engine/types";

// `resolveModule`, not `getModule`: the sweeps below cover `listAllModules()`,
// which includes problem-keyed modules that `getModule` is deliberately blind to.
function runWith(slug: string, raw: Record<string, string>): AlgorithmRun {
  const mod = resolveModule(slug);
  expect(mod, `module ${slug} is registered`).toBeTruthy();
  const validation = mod!.validate(raw);
  if (!validation.ok) throw new Error(`validate failed for ${slug}: ${validation.error}`);
  return mod!.run(validation.parsed);
}

function runPreset(slug: string, index = 0): AlgorithmRun {
  const mod = resolveModule(slug)!;
  return runWith(slug, mod.presets[index]!.values);
}

function lastArray(run: AlgorithmRun): (number | string)[] {
  const frame = run.steps[run.steps.length - 1]!.frame as ArrayFrame;
  return frame.values;
}

describe("registry", () => {
  it("registers thirteen modules whose slugs all exist in the content layer", () => {
    const slugs = listModules().map((m) => m.slug);
    expect(slugs).toHaveLength(13);
    const known = new Set(algorithms.map((a) => a.slug));
    for (const slug of slugs) expect(known.has(slug), `${slug} exists in data`).toBe(true);
  });

  it("keeps every step within pseudocode range with non-empty narration", () => {
    for (const mod of listAllModules()) {
      for (const preset of mod.presets) {
        const run = runWith(mod.slug, preset.values);
        expect(run.steps.length).toBeGreaterThan(0);
        for (const step of run.steps) {
          expect(step.codeLine).toBeGreaterThanOrEqual(1);
          expect(step.codeLine).toBeLessThanOrEqual(run.pseudocode.length);
          expect(step.narration.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("never lets counters decrease between consecutive steps", () => {
    for (const mod of listModules()) {
      const run = runPreset(mod.slug);
      for (let i = 1; i < run.steps.length; i += 1) {
        for (const [key, value] of Object.entries(run.steps[i - 1]!.counters)) {
          expect(run.steps[i]!.counters[key] ?? 0).toBeGreaterThanOrEqual(value);
        }
      }
    }
  });
});

describe("insertion-sort", () => {
  it("sorts a known list", () => {
    const run = runWith("insertion-sort", { values: "5, 2, 9, 1, 6" });
    expect(lastArray(run)).toEqual([1, 2, 5, 6, 9]);
    expect(run.result).toContain("1, 2, 5, 6, 9");
  });
});

describe("selection-sort", () => {
  it("sorts a known list and counts n(n-1)/2 comparisons", () => {
    const run = runWith("selection-sort", { values: "29, 10, 14, 37, 13" });
    expect(lastArray(run)).toEqual([10, 13, 14, 29, 37]);
    expect(run.totalCounters["comparisons"]).toBe(10);
  });
});

describe("merge-sort", () => {
  it("sorts the textbook list and logs merges", () => {
    const run = runWith("merge-sort", { values: "38, 27, 43, 3, 9, 82, 10" });
    expect(lastArray(run)).toEqual([3, 9, 10, 27, 38, 43, 82]);
    const aux = run.steps.find((s) => s.aux?.[0]?.kind === "log");
    expect(aux).toBeTruthy();
  });
});

describe("quicksort", () => {
  it("sorts a known list", () => {
    const run = runWith("quicksort", { values: "7, 2, 1, 6, 8, 5, 3, 4" });
    expect(lastArray(run)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("heap-sort", () => {
  it("sorts a known list and shows the backing array", () => {
    const run = runWith("heap-sort", { values: "4, 10, 3, 5, 1, 8" });
    const frame = run.steps[run.steps.length - 1]!.frame as TreeFrame;
    expect(frame.nodes.map((n) => n.label)).toEqual([1, 3, 4, 5, 8, 10]);
    const aux = run.steps[0]!.aux?.[0];
    expect(aux?.kind).toBe("keyvalue");
  });
});

describe("dfs", () => {
  it("walks depth-first from A", () => {
    const run = runWith("dfs", { graph: "A-B, A-C, B-D, B-E, C-F, E-G", start: "A" });
    expect(run.result).toBe("Visit order: A → B → D → E → G → C → F");
    expect(run.steps[0]!.aux?.[0]?.kind).toBe("stack");
  });
});

describe("dijkstra", () => {
  it("finds the known shortest distances", () => {
    const run = runWith("dijkstra", {
      graph: "A-B:4, A-C:2, B-C:5, B-D:10, C-E:3, E-D:4, D-F:11",
      start: "A",
    });
    const frame = run.steps[run.steps.length - 1]!.frame as GraphFrame;
    const dist = Object.fromEntries(frame.nodes.map((n) => [n.id, n.dist]));
    expect(dist).toEqual({ A: 0, B: 4, C: 2, D: 9, E: 5, F: 20 });
  });

  it("rejects unweighted edges with a friendly error", () => {
    const result = getModule("dijkstra")!.validate({ graph: "A-B, B-C", start: "A" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("weight");
  });
});

describe("topological-sort", () => {
  it("orders prerequisites correctly", () => {
    const run = runWith("topological-sort", { graph: "A>C, B>C, C>D, C>E, D>F, E>F" });
    expect(run.result).toBe("Order: A → B → C → D → E → F");
  });

  it("refuses a cyclic graph", () => {
    const result = getModule("topological-sort")!.validate({ graph: "A>B, B>C, C>A" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("loop");
  });
});

describe("sliding-window", () => {
  it("finds the best window sum", () => {
    const run = runWith("sliding-window", { values: "2, 1, 5, 1, 3, 2, 8, 1", k: "3" });
    expect(run.result).toContain("Best window sum 13");
  });

  it("rejects a window bigger than the list", () => {
    const result = getModule("sliding-window")!.validate({ values: "1, 2", k: "5" });
    expect(result.ok).toBe(false);
  });
});
