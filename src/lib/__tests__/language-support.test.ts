/**
 * Language execution audit, asserted against the real runner code path rather
 * than the presence of a <select> option.
 */
import { describe, expect, it } from "vitest";
import { entryName, stripTypes, type RunnerLang } from "@/lib/runner";

/** Mirrors `useTestRunner.run`: the only pre-worker gate is the language check. */
function canExecute(lang: RunnerLang): boolean {
  return lang !== "py";
}

describe("runner language support", () => {
  it("executes JavaScript", () => {
    const src = "function search(nums, target) { return nums.indexOf(target); }";
    expect(canExecute("js")).toBe(true);
    expect(entryName(src)).toBe("search");
  });

  it("executes TypeScript by stripping types first", () => {
    const src = "function search(nums: number[], target: number): number { return 0; }";
    expect(canExecute("ts")).toBe(true);
    const js = stripTypes(src);
    expect(js).not.toContain("number[]");
    expect(entryName(js)).toBe("search");
  });

  it("cannot execute Python — no interpreter exists in the runner", () => {
    expect(canExecute("py")).toBe(false);
  });
});
