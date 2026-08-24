import { describe, expect, it } from "vitest";
import { StepBuilder, MAX_FRAMES } from "@/engine/builder";
import type { ArrayFrame, AuxPanel } from "@/engine/types";

const PSEUDO: string[] = ["for i in range(n)", "  compare a[i], a[j]", "  swap", "return a"];

const CODE: Record<"js" | "ts" | "py" | "java" | "cpp", string[]> = {
  js: ["for (…)", "compare", "swap", "return a"],
  ts: ["for (…)", "compare", "swap", "return a"],
  py: ["for i in range(n):", "compare", "swap", "return a"],
  java: ["// Coming soon"],
  cpp: ["// Coming soon"],
};

function makeBuilder(): StepBuilder {
  return new StepBuilder(PSEUDO, CODE);
}

function makeArrayFrame(): ArrayFrame {
  return {
    kind: "array",
    values: [5, 3, 8],
    states: { 0: "active" },
    pointers: [{ name: "i", index: 0 }],
    ranges: [],
  };
}

describe("StepBuilder", () => {
  it("assigns i sequentially from 0", () => {
    const b = makeBuilder();
    for (let n = 0; n < 4; n += 1) {
      b.emit({ frame: makeArrayFrame(), codeLine: 1, narration: `step ${n}`, phase: "scan" });
    }
    const run = b.finish("slug", "input", "done");
    expect(run.steps.map((s) => s.i)).toEqual([0, 1, 2, 3]);
    expect(b.count).toBe(4);
  });

  it("deep-clones frames so later mutation cannot reach earlier steps", () => {
    const b = makeBuilder();
    const frame = makeArrayFrame();

    b.emit({ frame, codeLine: 1, narration: "first", phase: "scan" });

    frame.values[0] = 999;
    frame.pointers.push({ name: "j", index: 2 });
    frame.states[1] = "compare";

    b.emit({ frame, codeLine: 2, narration: "second", phase: "scan" });

    const run = b.finish("slug", "input", "done");
    const first = run.steps[0]!.frame as ArrayFrame;
    const second = run.steps[1]!.frame as ArrayFrame;

    expect(first).toEqual(makeArrayFrame());
    expect(first.values[0]).toBe(5);
    expect(first.pointers).toHaveLength(1);
    expect(first.states[1]).toBeUndefined();
    expect(first).not.toBe(frame);
    expect(first.values).not.toBe(second.values);
    expect(second.values[0]).toBe(999);
    expect(second.pointers).toHaveLength(2);
  });

  it("snapshots counters per step without retroactive changes", () => {
    const b = makeBuilder();
    b.emit({ frame: makeArrayFrame(), codeLine: 1, narration: "a", phase: "scan" });
    b.bump("comparisons");
    b.emit({ frame: makeArrayFrame(), codeLine: 2, narration: "b", phase: "scan" });
    b.bump("comparisons", 2);
    b.emit({ frame: makeArrayFrame(), codeLine: 2, narration: "c", phase: "scan" });

    const run = b.finish("slug", "input", "done");
    expect(run.steps[0]!.counters["comparisons"]).toBeUndefined();
    expect(run.steps[1]!.counters["comparisons"]).toBe(1);
    expect(run.steps[2]!.counters["comparisons"]).toBe(3);

    b.bump("comparisons", 10);
    expect(run.steps[1]!.counters["comparisons"]).toBe(1);
    expect(run.steps[2]!.counters["comparisons"]).toBe(3);
  });

  it("keeps counters cumulative and never decreasing across the step list", () => {
    const b = makeBuilder();
    const names = ["comparisons", "swaps"];
    for (let n = 0; n < 5; n += 1) {
      b.bump("comparisons", 2);
      if (n % 2 === 0) b.bump("swaps");
      b.emit({ frame: makeArrayFrame(), codeLine: 3, narration: `s${n}`, phase: "partition" });
    }
    const run = b.finish("slug", "input", "done");

    for (const name of names) {
      let prev = 0;
      for (const step of run.steps) {
        const value = step.counters[name] ?? 0;
        expect(value).toBeGreaterThanOrEqual(prev);
        prev = value;
      }
    }
    expect(run.steps[4]!.counters["comparisons"]).toBe(10);
    expect(run.steps[4]!.counters["swaps"]).toBe(3);
    expect(() => b.bump("swaps", -1)).toThrow(/never decrease/);
  });

  it("throws a descriptive error naming the offending codeLine", () => {
    for (const bad of [0, PSEUDO.length + 1, -2]) {
      const b = makeBuilder();
      expect(() =>
        b.emit({ frame: makeArrayFrame(), codeLine: bad, narration: "x", phase: "scan" }),
      ).toThrow(new RegExp(`codeLine ${bad}\\b`));
      expect(() =>
        b.emit({ frame: makeArrayFrame(), codeLine: bad, narration: "x", phase: "scan" }),
      ).toThrow(/out of range/);
      expect(b.count).toBe(0);
    }
  });

  it("finish() totals match the final step and the run is frozen", () => {
    const b = makeBuilder();
    b.bump("visits");
    b.emit({ frame: makeArrayFrame(), codeLine: 1, narration: "a", phase: "scan" });
    b.bump("visits", 4);
    b.emit({ frame: makeArrayFrame(), codeLine: 4, narration: "b", phase: "done" });

    const run = b.finish("quicksort", "[5,3,8]", "sorted");
    expect(run.totalCounters).toEqual(run.steps[run.steps.length - 1]!.counters);
    expect(run.totalCounters["visits"]).toBe(5);
    expect(Object.isFrozen(run)).toBe(true);

    expect(() => {
      (run as { slug: string }).slug = "hacked";
    }).toThrow(TypeError);
    expect(run.slug).toBe("quicksort");

    expect(() => {
      (run as { steps: unknown }).steps = [];
    }).toThrow(TypeError);
    expect(run.steps).toHaveLength(2);
  });

  it("deep-clones aux panels", () => {
    const b = makeBuilder();
    const queue: AuxPanel = { kind: "queue", label: "Queue", items: [{ id: "a", label: "A" }] };
    const aux: AuxPanel[] = [queue];

    b.emit({ frame: makeArrayFrame(), aux, codeLine: 1, narration: "a", phase: "scan" });

    queue.items.push({ id: "b", label: "B" });
    queue.items[0]!.state = "visited";
    queue.label = "Changed";

    b.emit({ frame: makeArrayFrame(), aux, codeLine: 2, narration: "b", phase: "scan" });

    const run = b.finish("bfs", "tree", "done");
    const firstAux = run.steps[0]!.aux![0] as Extract<AuxPanel, { kind: "queue" }>;
    const secondAux = run.steps[1]!.aux![0] as Extract<AuxPanel, { kind: "queue" }>;

    expect(firstAux.items).toHaveLength(1);
    expect(firstAux.items[0]!.state).toBeUndefined();
    expect(firstAux.label).toBe("Queue");
    expect(secondAux.items).toHaveLength(2);
    expect(secondAux.label).toBe("Changed");
    expect(firstAux.items).not.toBe(secondAux.items);
  });

  it("enforces MAX_FRAMES = 2000 and sets truncated flag when threshold is reached (S2.7)", () => {
    const b = makeBuilder();
    const frame = makeArrayFrame();

    for (let n = 0; n < MAX_FRAMES + 50; n += 1) {
      b.emit({ frame, codeLine: 1, narration: `step ${n}`, phase: "loop" });
    }

    expect(b.count).toBe(MAX_FRAMES);

    const run = b.finish("slug", "input", "done");
    expect(run.steps).toHaveLength(MAX_FRAMES);
    expect(run.truncated).toBe(true);
  });

  it("sets truncated flag to false when under MAX_FRAMES", () => {
    const b = makeBuilder();
    b.emit({ frame: makeArrayFrame(), codeLine: 1, narration: "step 0", phase: "init" });
    const run = b.finish("slug", "input", "done");
    expect(run.truncated).toBe(false);
  });
});
