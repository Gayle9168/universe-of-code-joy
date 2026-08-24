import { describe, expect, it } from "vitest";
import {
  deepEqual,
  entryName,
  formatArgs,
  formatValue,
  solveXp,
  stripTypes,
  summarize,
  toResults,
  workerSource,
} from "./runner";
import type { ProblemTest } from "@/content/types";

describe("formatValue / formatArgs", () => {
  it("serializes values compactly", () => {
    expect(formatValue([1, 2])).toBe("[1,2]");
    expect(formatValue(undefined)).toBe("undefined");
    expect(formatValue(true)).toBe("true");
  });

  it("joins arguments", () => {
    expect(formatArgs([[2, 7], 9])).toBe("[2,7], 9");
  });
});

describe("deepEqual", () => {
  it("compares nested structures", () => {
    expect(deepEqual([[1], [2, 3]], [[1], [2, 3]])).toBe(true);
    expect(deepEqual([[1], [2, 3]], [[1], [3, 2]])).toBe(false);
    expect(deepEqual({ a: 1, b: [2] }, { b: [2], a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual(NaN, NaN)).toBe(true);
    expect(deepEqual(null, undefined)).toBe(false);
  });
});

describe("entryName", () => {
  it("finds function declarations", () => {
    expect(entryName("function twoSum(a, b) {}")).toBe("twoSum");
    expect(entryName("function search(nums: number[]): number {\n  return -1;\n}")).toBe("search");
  });

  it("finds arrow assignments", () => {
    expect(entryName("const isValid = (s) => true;")).toBe("isValid");
  });

  it("returns null when nothing is declared", () => {
    expect(entryName("// nothing here")).toBeNull();
  });
});

const run = (src: string, ...args: unknown[]): unknown => {
  const js = stripTypes(src);
  const name = entryName(js)!;
  const fn = new Function(`${js}\nreturn ${name};`)() as (...a: unknown[]) => unknown;
  return fn(...args);
};

describe("stripTypes", () => {
  it("strips parameter and return annotations", () => {
    expect(run("function add(a: number, b: number): number {\n  return a + b;\n}", 2, 3)).toBe(5);
  });

  it("strips variable annotations inside a body", () => {
    expect(
      run(
        "function twoSum(nums: number[], target: number): number[] {\n  const seen: Map<number, number> = new Map();\n  for (let i: number = 0; i < nums.length; i++) {\n    const need: number = target - nums[i];\n    if (seen.has(need)) return [seen.get(need)!, i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}",
        [2, 7, 11],
        9,
      ),
    ).toEqual([0, 1]);
  });

  it("keeps object literal keys intact", () => {
    expect(
      run('function make(): { a: number } {\n  const o = { a: 1, b: "x: y" };\n  return o.a;\n}'),
    ).toBe(1);
  });

  it("removes type aliases and interfaces", () => {
    const js = stripTypes(
      "type Node = { val: number } | null;\ninterface Box { size: number }\nfunction f(n: Node): number {\n  return 1;\n}",
    );
    expect(js).not.toMatch(/interface/);
    expect(js).not.toMatch(/type Node/);
    expect(run("type N = number;\nfunction f(n: N): N {\n  return n * 2;\n}", 4)).toBe(8);
  });

  it("removes as-assertions and optional markers", () => {
    expect(run("function f(x?: number): number {\n  return (x as number) ?? 7;\n}")).toBe(7);
  });
});

describe("complex TypeScript stripping (S3.7, S11.5/R-4)", () => {
  it("handles Map<string, number[]> nested generics cleanly without syntax corruption", () => {
    const src = `
      function mapLength(words: string[]): Map<string, number[]> {
        const dict: Map<string, number[]> = new Map<string, number[]>();
        for (let i = 0; i < words.length; i++) {
          const w: string = words[i]!;
          const existing: number[] = dict.get(w) ?? [];
          dict.set(w, [...existing, w.length]);
        }
        return dict;
      }
    `;
    const result = run(src, ["apple", "pie", "apple"]) as Map<string, number[]>;
    expect(result.get("apple")).toEqual([5, 5]);
    expect(result.get("pie")).toEqual([3]);
  });

  it("handles 'as const' assertions and 'satisfies' operator without throwing syntax errors", () => {
    const src = `
      function getConfig(): { max: number; items: readonly string[] } {
        const limits = { max: 100, min: 0 } as const;
        const data = { items: ["a", "b", "c"] } satisfies Record<string, readonly string[]>;
        return { max: limits.max, items: data.items };
      }
    `;
    expect(run(src)).toEqual({ max: 100, items: ["a", "b", "c"] });
  });

  it("compiles enum declarations and preserves runtime enum member lookup", () => {
    const src = `
      enum Status { Pending = 1, Running = 2, Completed = 4 }
      function checkStatus(s: number): boolean {
        return (s & Status.Completed) === Status.Completed;
      }
    `;
    expect(run(src, 4)).toBe(true);
    expect(run(src, 2)).toBe(false);
  });

  it("synthesizes constructor parameter properties in classes", () => {
    const src = `
      class ListNode {
        constructor(public val: number, public next: ListNode | null = null) {}
      }
      function sumList(val1: number, val2: number): number {
        const head = new ListNode(val1, new ListNode(val2));
        return head.val + (head.next?.val ?? 0);
      }
    `;
    expect(run(src, 15, 25)).toBe(40);
  });

  it("parses arrow functions with return type annotations and curry expressions", () => {
    const src = `
      const makeAdder = (x: number): ((y: number) => number) => (y: number): number => x + y;
      function exec(): number {
        const addTen: (n: number) => number = makeAdder(10);
        return addTen(32);
      }
    `;
    expect(run(src)).toBe(42);
  });

  it("preserves plain a < b and a > b comparisons without treating them as generic brackets", () => {
    const src = `
      function binarySearch(nums: number[], target: number): number {
        let left: number = 0;
        let right: number = nums.length - 1;
        while (left <= right) {
          const mid: number = (left + right) >> 1;
          if (nums[mid] < target) {
            left = mid + 1;
          } else if (nums[mid] > target) {
            right = mid - 1;
          } else {
            return mid;
          }
        }
        return -1;
      }
    `;
    expect(run(src, [1, 3, 5, 7, 9], 7)).toBe(3);
    expect(run(src, [1, 3, 5, 7, 9], 2)).toBe(-1);
  });
});
const tests: ProblemTest[] = [
  { id: "t1", input: [[2, 7], 9], expected: [1, 2], hidden: false },
  { id: "t2", input: [[1, 2], 5], expected: [], hidden: true },
];

describe("toResults / summarize", () => {
  it("marks pass, fail and error rows", () => {
    const results = toResults(tests, [
      { id: "t1", ok: true, actual: [1, 2], ms: 1.4 },
      { id: "t2", ok: false, message: "boom", ms: 0.2 },
    ]);
    expect(results[0]!.outcome).toBe("pass");
    expect(results[0]!.ms).toBe(1);
    expect(results[1]!.outcome).toBe("error");
    expect(results[1]!.actual).toBe("boom");
    expect(summarize(results).verdict).toBe("error");
  });

  it("flags a wrong answer as failed", () => {
    const results = toResults(tests, [
      { id: "t1", ok: true, actual: [2, 1], ms: 1 },
      { id: "t2", ok: true, actual: [], ms: 1 },
    ]);
    expect(results[0]!.outcome).toBe("fail");
    const summary = summarize(results);
    expect(summary.passed).toBe(1);
    expect(summary.verdict).toBe("failed");
  });

  it("accepts a full pass and treats undefined returns as a failure", () => {
    const ok = summarize(
      toResults(tests, [
        { id: "t1", ok: true, actual: [1, 2], ms: 1 },
        { id: "t2", ok: true, actual: [], ms: 2 },
      ]),
    );
    expect(ok).toEqual({ passed: 2, total: 2, totalMs: 3, verdict: "accepted" });

    const undef = toResults(tests, [{ id: "t1", ok: true, undef: true, ms: 0 }]);
    expect(undef[0]!.outcome).toBe("fail");
    expect(undef[0]!.actual).toBe("undefined");
    expect(undef[1]!.outcome).toBe("idle");
  });
});

describe("solveXp", () => {
  it("pays full XP on a first-attempt hint-free solve", () => {
    expect(solveXp(100, 1, 0)).toBe(100);
  });

  it("reduces XP for attempts and hints but never below 30%", () => {
    expect(solveXp(100, 3, 0)).toBe(80);
    expect(solveXp(100, 1, 2)).toBe(80);
    expect(solveXp(100, 20, 10)).toBe(30);
  });
});

describe("workerSource", () => {
  it("freezes Math.random and Date.now for deterministic evaluation", () => {
    const originalRandom = Math.random;
    const originalDateNow = Date.now;
    try {
      const mockSelf: {
        onmessage?: (event: { data: unknown }) => void;
        postMessage?: (data: unknown) => void;
        performance: { now: () => number };
      } = {
        performance: { now: () => 10 },
      };

      const code = "function getRandom() { return [Math.random(), Date.now()]; }";
      new Function("self", workerSource(code, "getRandom"))(mockSelf);

      expect(Math.random()).toBe(0.5);
      expect(Date.now()).toBe(0);

      let message: unknown = null;
      mockSelf.postMessage = (data: unknown) => {
        message = data;
      };
      mockSelf.onmessage?.({
        data: {
          tests: [{ id: "t1", input: [], expected: [0.5, 0], hidden: false }],
        },
      });

      expect(message).toEqual({
        kind: "done",
        results: [{ id: "t1", ok: true, actual: [0.5, 0], undef: false, ms: 0, logs: [] }],
      });
    } finally {
      Math.random = originalRandom;
      Date.now = originalDateNow;
    }
  });
});

describe("deterministic algorithmic environment (S3.8, S11.5/R-4)", () => {
  it("proves repeatable execution of randomized algorithms — multiple evaluations deep-equal", () => {
    const originalRandom = Math.random;
    const originalDateNow = Date.now;
    try {
      const mockSelf: {
        onmessage?: (event: { data: unknown }) => void;
        postMessage?: (data: unknown) => void;
        performance: { now: () => number };
      } = {
        performance: { now: () => 100 },
      };

      const randomizedCode = `
        function randomPartition(arr) {
          if (arr.length <= 1) return { arr: arr, seed: Date.now(), pivots: [] };
          var pivotIdx = Math.floor(Math.random() * arr.length);
          var pivot = arr[pivotIdx];
          var left = [], right = [];
          for (var i = 0; i < arr.length; i++) {
            if (i === pivotIdx) continue;
            if (arr[i] < pivot) left.push(arr[i]);
            else right.push(arr[i]);
          }
          return {
            pivotSelected: pivot,
            left: left,
            right: right,
            timeSeen: Date.now()
          };
        }
      `;

      new Function("self", workerSource(randomizedCode, "randomPartition"))(mockSelf);

      const inputArr = [9, 2, 7, 3, 5, 8, 1, 4, 6];
      const resultsHistory: unknown[] = [];

      for (let i = 0; i < 5; i++) {
        let message: unknown = null;
        mockSelf.postMessage = (data: unknown) => {
          message = data;
        };
        mockSelf.onmessage?.({
          data: {
            tests: [{ id: "run-" + i, input: [inputArr], expected: null, hidden: false }],
          },
        });
        resultsHistory.push(message);
      }

      const firstRun = resultsHistory[0] as {
        kind: string;
        results: Array<{ actual: unknown; logs: string[] }>;
      };
      expect(firstRun.kind).toBe("done");
      expect(firstRun.results[0]!.actual).toBeDefined();

      for (let i = 1; i < resultsHistory.length; i++) {
        const currentRun = resultsHistory[i] as {
          kind: string;
          results: Array<{ actual: unknown; logs: string[] }>;
        };
        expect(currentRun.results[0]!.actual).toEqual(firstRun.results[0]!.actual);
      }
    } finally {
      Math.random = originalRandom;
      Date.now = originalDateNow;
    }
  });

  it("insulates student Date.now() while preserving runner execution time measurement", () => {
    const originalRandom = Math.random;
    const originalDateNow = Date.now;
    try {
      let currentTime = 100;
      const mockSelf: {
        onmessage?: (event: { data: unknown }) => void;
        postMessage?: (data: unknown) => void;
        performance: { now: () => number };
      } = {
        performance: {
          now: () => {
            const t = currentTime;
            currentTime += 15;
            return t;
          },
        },
      };

      new Function(
        "self",
        workerSource(
          "function timeLoop() { var total = 0; for(var i=0; i<5; i++) { total += Date.now(); } return total; }",
          "timeLoop",
        ),
      )(mockSelf);

      let message: unknown = null;
      mockSelf.postMessage = (data: unknown) => {
        message = data;
      };

      mockSelf.onmessage?.({
        data: {
          tests: [{ id: "timing-test", input: [], expected: 0, hidden: false }],
        },
      });

      const doneMsg = message as {
        kind: string;
        results: Array<{ id: string; ok: boolean; actual: number; ms: number; logs: string[] }>;
      };

      expect(doneMsg.kind).toBe("done");
      expect(doneMsg.results[0]!.actual).toBe(0);
      expect(doneMsg.results[0]!.ms).toBe(15);
      expect(doneMsg.results[0]!.logs).toEqual([]);
    } finally {
      Math.random = originalRandom;
      Date.now = originalDateNow;
    }
  });

  it("prevents state leaks between runs via fresh workers (S3.3)", () => {
    type MockSelf = {
      onmessage?: (event: { data: unknown }) => void;
      postMessage?: (data: unknown) => void;
      performance: { now: () => number };
    };

    const mockSelf1: MockSelf = { performance: { now: () => 0 } };
    new Function(
      "self",
      workerSource("self.leakedVar = 42; function entry() { return self.leakedVar; }", "entry"),
    )(mockSelf1);

    const mockSelf2: MockSelf = { performance: { now: () => 0 } };
    new Function("self", workerSource("function entry() { return self.leakedVar; }", "entry"))(
      mockSelf2,
    );

    let result1: unknown = null;
    mockSelf1.postMessage = (data: unknown) => {
      result1 = data;
    };
    mockSelf1.onmessage!({
      data: { tests: [{ id: "t1", input: [], expected: 42, hidden: false }] },
    });

    let result2: unknown = null;
    mockSelf2.postMessage = (data: unknown) => {
      result2 = data;
    };
    mockSelf2.onmessage!({
      data: { tests: [{ id: "t2", input: [], expected: undefined, hidden: false }] },
    });

    const run1 = result1 as { results: Array<{ actual: unknown }> };
    const run2 = result2 as { results: Array<{ actual: unknown }> };
    expect(run1.results[0]!.actual).toBe(42);
    expect(run2.results[0]!.actual).toBeNull();
  });
});
