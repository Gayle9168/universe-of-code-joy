import { bfsModule } from "@/engine/algorithms/bfs";
import { binarySearchModule } from "@/engine/algorithms/binarySearch";
import { bubbleSortModule } from "@/engine/algorithms/bubbleSort";
import { dfsModule } from "@/engine/algorithms/dfs";
import { dijkstraModule } from "@/engine/algorithms/dijkstra";
import { findMinimumRotatedModule } from "@/engine/algorithms/findMinimumRotated";
import { firstBadVersionModule } from "@/engine/algorithms/firstBadVersion";
import { heapSortModule } from "@/engine/algorithms/heapSort";
import { insertionSortModule } from "@/engine/algorithms/insertionSort";
import { kokoEatingBananasModule } from "@/engine/algorithms/kokoEatingBananas";
import { linearSearchModule } from "@/engine/algorithms/linearSearch";
import { mergeSortModule } from "@/engine/algorithms/mergeSort";
import { peakIndexMountainModule } from "@/engine/algorithms/peakIndexMountain";
import { quicksortModule } from "@/engine/algorithms/quicksort";
import { searchInsertPositionModule } from "@/engine/algorithms/searchInsertPosition";
import { searchRotatedModule } from "@/engine/algorithms/searchRotated";
import { selectionSortModule } from "@/engine/algorithms/selectionSort";
import { slidingWindowModule } from "@/engine/algorithms/slidingWindow";
import { topologicalSortModule } from "@/engine/algorithms/topologicalSort";
import type { AlgorithmModule } from "@/engine/types";

/**
 * Registry of runnable algorithm modules.
 * Keys MUST match the slugs in src/data/algorithms.ts verbatim.
 */
const modules: Record<string, AlgorithmModule> = {
  "binary-search": binarySearchModule,
  "linear-search": linearSearchModule,
  "bubble-sort": bubbleSortModule,
  "insertion-sort": insertionSortModule,
  "selection-sort": selectionSortModule,
  "merge-sort": mergeSortModule,
  quicksort: quicksortModule,
  "heap-sort": heapSortModule,
  "sliding-window": slidingWindowModule,
  bfs: bfsModule,
  dfs: dfsModule,
  dijkstra: dijkstraModule,
  "topological-sort": topologicalSortModule,
};

/**
 * Registry of runnable modules keyed by PROBLEM slug.
 *
 * Six searching questions — First Bad Version, Search in Rotated Sorted Array,
 * Find Minimum in Rotated Sorted Array, Peak Index in a Mountain Array, Search
 * Insert Position and Koko Eating Bananas — all declare
 * `algorithmSlug: "binary-search"`, because that is genuinely the technique they
 * teach. Resolving their animation by algorithm therefore showed all six the
 * same plain binary-search run, which animates none of them: none is a plain
 * search for a value in a sorted list, and two do not search an array at all.
 *
 * Keys here MUST match the slugs in src/data/problems.ts verbatim. These modules
 * are deliberately absent from `modules` above and from `listModules()`, whose
 * contract is that every slug it returns also exists in src/data/algorithms.ts.
 * Use `listAllModules()` for validation sweeps that should cover both.
 */
const problemModules: Record<string, AlgorithmModule> = {
  "find-minimum-in-rotated-sorted-array": findMinimumRotatedModule,
  "first-bad-version": firstBadVersionModule,
  "koko-eating-bananas": kokoEatingBananasModule,
  "peak-index-in-mountain-array": peakIndexMountainModule,
  "search-insert-position": searchInsertPositionModule,
  "search-rotated-sorted-array": searchRotatedModule,
};

export function getModule(slug: string): AlgorithmModule | undefined {
  return modules[slug];
}

/**
 * The module for either kind of slug, algorithm or question.
 *
 * Safe as a single lookup because the two namespaces are disjoint — no algorithm
 * slug is also a problem slug, which `registry.test.ts` asserts rather than
 * assumes. This is what the player store loads through, so `load("koko-eating-bananas")`
 * works without every call site having to know which kind of slug it holds.
 */
export function resolveModule(slug: string): AlgorithmModule | undefined {
  return modules[slug] ?? problemModules[slug];
}

export function hasModule(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(modules, slug);
}

/** The module for a specific question, or undefined when it has none. */
export function getModuleForProblem(problemSlug: string): AlgorithmModule | undefined {
  return problemModules[problemSlug];
}

export function hasModuleForProblem(problemSlug: string): boolean {
  return Object.prototype.hasOwnProperty.call(problemModules, problemSlug);
}

export function listModules(): AlgorithmModule[] {
  return Object.values(modules);
}

export function listProblemModules(): AlgorithmModule[] {
  return Object.values(problemModules);
}

/**
 * Every runnable module, algorithm-keyed and problem-keyed alike. Structural
 * checks — codeMap widths, codeLine bounds, counter stability — must sweep this
 * rather than `listModules()`, so a problem module cannot skip them.
 */
export function listAllModules(): AlgorithmModule[] {
  return [...Object.values(modules), ...Object.values(problemModules)];
}
