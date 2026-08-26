import { describe, it, expect } from "vitest";
import { resolveModule } from "@/engine/registry";
import { deriveOperation, deriveVariables } from "@/lib/variables";
import type { AlgorithmRun, ArrayFrame, Step } from "@/engine/types";

function run(values: string, target: string): AlgorithmRun {
  const mod = resolveModule("binary-search")!;
  const validation = mod.validate({ array: values, target });
  if (!validation.ok) throw new Error(validation.error);
  return mod.run(validation.parsed);
}

function arrayFrame(step: Step): ArrayFrame {
  if (step.frame.kind !== "array") throw new Error("expected an array frame");
  return step.frame;
}

function pointer(step: Step, name: string): number | null {
  const p = arrayFrame(step).pointers.find((q) => q.name === name);
  return p ? p.index : null;
}

const SORTED = "2, 5, 8, 12, 16, 23, 38, 56, 72, 91";

describe("deriveVariables", () => {
  const steps = run(SORTED, "23").steps;

  it("orders low, mid, high, then the target", () => {
    const withMid = steps.find((s) => pointer(s, "mid") !== null)!;
    expect(deriveVariables(withMid).map((v) => v.label)).toEqual(["low", "mid", "high", "target"]);
  });

  it("omits mid entirely on steps where the engine has no midpoint", () => {
    const setup = steps[0]!;
    expect(pointer(setup, "mid")).toBeNull();
    const names = deriveVariables(setup).map((v) => v.label);
    expect(names).not.toContain("mid");
    expect(names).toEqual(["low", "high", "target"]);
  });

  it("marks only the boundary that moved, with its previous value", () => {
    const i = steps.findIndex((s, k) => k > 0 && pointer(s, "lo") !== pointer(steps[k - 1]!, "lo"));
    expect(i).toBeGreaterThan(0);
    const vars = deriveVariables(steps[i]!, steps[i - 1]!);
    const low = vars.find((v) => v.label === "low")!;
    const high = vars.find((v) => v.label === "high")!;
    expect(low.changed).toBe(true);
    expect(low.previous).toBe(String(pointer(steps[i - 1]!, "lo")));
    expect(low.description).toBe(`low changed from ${low.previous} to ${low.current}`);
    expect(high.changed).toBe(false);
    expect(high.previous).toBeUndefined();
  });

  it("keeps the target stable across every step of a run", () => {
    for (let i = 0; i < steps.length; i += 1) {
      const target = deriveVariables(steps[i]!, i > 0 ? steps[i - 1]! : null).find(
        (v) => v.label === "target",
      )!;
      expect(target.current).toBe("23");
      expect(target.changed).toBe(false);
      expect(target.previous).toBeUndefined();
    }
  });

  it("leaks nothing when nothing moved, and stepping back restores the earlier state", () => {
    const same = deriveVariables(steps[1]!, steps[1]!);
    expect(same.every((v) => !v.changed && v.previous === undefined)).toBe(true);
    const forward = deriveVariables(steps[2]!, steps[1]!);
    const back = deriveVariables(steps[1]!, steps[2]!);
    expect(back.map((v) => v.current)).toEqual(
      deriveVariables(steps[1]!).map((v) => v.current),
    );
    expect(forward.map((v) => v.current)).not.toEqual(back.map((v) => v.current));
  });

  it("reads a module's key-value panel when one is supplied", () => {
    const step = {
      ...steps[0]!,
      aux: [{ kind: "keyvalue" as const, label: "State", rows: [{ k: "sum", v: "12" }] }],
    };
    const prev = {
      ...steps[0]!,
      aux: [{ kind: "keyvalue" as const, label: "State", rows: [{ k: "sum", v: "7" }] }],
    };
    expect(deriveVariables(step, prev)).toEqual([
      {
        name: "sum",
        label: "sum",
        current: "12",
        previous: "7",
        changed: true,
        description: "sum changed from 7 to 12",
      },
    ]);
  });
});

describe("deriveOperation", () => {
  const steps = run(SORTED, "23").steps;

  it("shows no operation on setup", () => {
    expect(deriveOperation(steps[0]!)).toBeNull();
  });

  it("agrees with the mid pointer on every midpoint step", () => {
    let seen = 0;
    for (let i = 0; i < steps.length; i += 1) {
      const op = deriveOperation(steps[i]!, i > 0 ? steps[i - 1]! : null);
      if (!op || op.kind !== "midpoint") continue;
      seen += 1;
      const mid = pointer(steps[i]!, "mid")!;
      const lo = pointer(steps[i]!, "lo")!;
      const hi = pointer(steps[i]!, "hi")!;
      expect(mid).toBe(Math.floor((lo + hi) / 2));
      expect(op.lines.map((l) => l.kind)).toEqual(["formula", "substitution", "result"]);
      expect(op.lines[1]!.text).toBe(`floor((${lo} + ${hi}) / 2)`);
      expect(op.lines[2]!.text).toBe(`= ${mid}`);
      const board = deriveVariables(steps[i]!).find((v) => v.label === "mid")!;
      expect(board.current).toBe(String(mid));
    }
    expect(seen).toBeGreaterThan(0);
  });

  it("shows the comparison with its truth value when the engine compares", () => {
    const i = steps.findIndex((s) => arrayFrame(s).comparison && !deriveOperationIsResult(s));
    const op = deriveOperation(steps[i]!, steps[i - 1]!)!;
    expect(op.kind).toBe("comparison");
    const kinds = op.lines.map((l) => l.kind);
    expect(kinds[0]).toBe("substitution");
    expect(kinds).toContain("truth");
    expect(op.lines[1]!.text).toMatch(/^(TRUE|FALSE)$/);
  });

  it("shows the boundary update when a pointer moves without a comparison", () => {
    const i = steps.findIndex((s, k) => {
      if (k === 0) return false;
      const f = arrayFrame(s);
      return !f.comparison && pointer(s, "mid") === null;
    });
    expect(i).toBeGreaterThan(0);
    const op = deriveOperation(steps[i]!, steps[i - 1]!)!;
    expect(op.kind).toBe("boundary");
    expect(op.lines.some((l) => /→/.test(l.text))).toBe(true);
  });

  it("shows the result once a cell is found", () => {
    const last = steps[steps.length - 1]!;
    const op = deriveOperation(last, steps[steps.length - 2]!)!;
    expect(op.kind).toBe("result");
    expect(op.lines.some((l) => l.kind === "result")).toBe(true);
  });

  it("never announces a found result when the target is absent", () => {
    const missing = run(SORTED, "24").steps;
    const last = missing[missing.length - 1]!;
    const op = deriveOperation(last, missing[missing.length - 2]!);
    expect(op?.kind).not.toBe("result");
  });
});

function deriveOperationIsResult(step: Step): boolean {
  return Object.values(arrayFrame(step).states).includes("found");
}
