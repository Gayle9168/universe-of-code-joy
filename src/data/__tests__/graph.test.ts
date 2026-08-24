import { describe, expect, it } from "vitest";
import { algorithms } from "../algorithms";
import { paths } from "../paths";

describe("Algorithm Prerequisites Graph Invariants", () => {
  it("has zero cycles in the prerequisite DAG (Acyclicity)", () => {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const algoMap = new Map(algorithms.map((a) => [a.slug, a]));

    function isCyclic(slug: string): boolean {
      if (!visited.has(slug)) {
        visited.add(slug);
        recStack.add(slug);

        const algo = algoMap.get(slug);
        if (algo) {
          for (const prereq of algo.prerequisites) {
            if (!visited.has(prereq) && isCyclic(prereq)) {
              return true;
            } else if (recStack.has(prereq)) {
              return true;
            }
          }
        }
      }
      recStack.delete(slug);
      return false;
    }

    for (const algo of algorithms) {
      expect(isCyclic(algo.slug)).toBe(false);
    }
  });

  it("all prerequisite slugs refer to existing algorithms in catalog", () => {
    const knownSlugs = new Set(algorithms.map((a) => a.slug));
    for (const algo of algorithms) {
      for (const prereq of algo.prerequisites) {
        expect(knownSlugs.has(prereq)).toBe(true);
      }
    }
  });

  it("every algorithm has valid time and space complexity defined", () => {
    for (const algo of algorithms) {
      expect(algo.timeAvg).toBeTruthy();
      expect(algo.space).toBeTruthy();
      expect(algo.estMinutes).toBeGreaterThan(0);
      expect(algo.xp).toBeGreaterThan(0);
    }
  });

  it("performs topological sort to prove DAG acyclicity and reachability of all skills (S4.11)", () => {
    const inDegree = new Map<string, number>();
    const dependents = new Map<string, string[]>();

    for (const algo of algorithms) {
      inDegree.set(algo.slug, algo.prerequisites.length);
      for (const prereq of algo.prerequisites) {
        const list = dependents.get(prereq) ?? [];
        list.push(algo.slug);
        dependents.set(prereq, list);
      }
    }

    const queue: string[] = [];
    for (const [slug, count] of inDegree.entries()) {
      if (count === 0) queue.push(slug);
    }

    const topologicalOrder: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      topologicalOrder.push(current);

      const deps = dependents.get(current) ?? [];
      for (const dependent of deps) {
        const currentCount = (inDegree.get(dependent) ?? 0) - 1;
        inDegree.set(dependent, currentCount);
        if (currentCount === 0) {
          queue.push(dependent);
        }
      }
    }

    expect(topologicalOrder.length).toBe(algorithms.length);
    expect(new Set(topologicalOrder).size).toBe(algorithms.length);
  });

  it("every algorithm in the catalog is reachable within curriculum learning paths in paths.ts", () => {
    const pathSlugs = new Set<string>();
    for (const path of paths) {
      for (const module of path.modules) {
        for (const slug of module.itemSlugs) {
          pathSlugs.add(slug);
        }
      }
    }

    for (const algo of algorithms) {
      expect(pathSlugs.has(algo.slug)).toBe(true);
    }
  });
});
