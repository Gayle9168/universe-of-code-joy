import { describe, expect, it } from "vitest";
import {
  getModule,
  getModuleForProblem,
  hasModule,
  hasModuleForProblem,
  listAllModules,
  listModules,
  listProblemModules,
  resolveModule,
} from "@/engine/registry";
import { algorithms } from "@/data/algorithms";
import { problems } from "@/data/problems";

const algorithmSlugs = new Set(algorithms.map((a) => a.slug));
const problemSlugs = new Set(problems.map((p) => p.slug));

describe("problem-keyed module registry", () => {
  it("keys every problem module by a real question slug", () => {
    for (const mod of listProblemModules()) {
      expect(problemSlugs.has(mod.slug), `${mod.slug} exists in src/data/problems.ts`).toBe(true);
    }
  });

  it("gives each problem module its own slug as its registry key", () => {
    // The route loads the player by `problemMod.slug`, so a key/slug mismatch
    // would silently animate a different question than the card that was clicked.
    for (const mod of listProblemModules()) {
      expect(getModuleForProblem(mod.slug)).toBe(mod);
    }
  });

  it("never registers a problem module under an algorithm slug", () => {
    for (const mod of listProblemModules()) {
      expect(algorithmSlugs.has(mod.slug), `${mod.slug} is not an algorithm slug`).toBe(false);
    }
  });

  /**
   * `resolveModule` is a single lookup across both maps, and the player store
   * loads through it. That is only unambiguous while the two key spaces stay
   * disjoint — this is the assertion that keeps it honest.
   */
  it("keeps algorithm and question slugs disjoint across the whole catalog", () => {
    for (const slug of algorithmSlugs) {
      expect(problemSlugs.has(slug), `"${slug}" is both an algorithm and a question slug`).toBe(
        false,
      );
    }
  });

  it("resolves either kind of slug, and nothing else", () => {
    for (const mod of listModules()) expect(resolveModule(mod.slug)).toBe(mod);
    for (const mod of listProblemModules()) expect(resolveModule(mod.slug)).toBe(mod);
    expect(resolveModule("no-such-slug")).toBeUndefined();
  });

  it("keeps the algorithm-keyed lookups blind to problem modules", () => {
    // `listModules()` feeds /dev/engine and the "has a visualizer" ranking in
    // recommend.ts, both of which mean algorithm cards specifically.
    for (const mod of listProblemModules()) {
      expect(getModule(mod.slug)).toBeUndefined();
      expect(hasModule(mod.slug)).toBe(false);
    }
    for (const mod of listModules()) {
      expect(getModuleForProblem(mod.slug)).toBeUndefined();
      expect(hasModuleForProblem(mod.slug)).toBe(false);
    }
  });

  it("lists every module exactly once across both maps", () => {
    const all = listAllModules();
    expect(all).toHaveLength(listModules().length + listProblemModules().length);
    expect(new Set(all.map((m) => m.slug)).size).toBe(all.length);
  });
});
