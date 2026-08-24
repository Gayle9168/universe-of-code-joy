/**
 * Algora — First Content Slice Scope & Completeness Manifest
 *
 * SPECIFICATION REFERENCES:
 * - S0.11: "D-6 first content slice scoped and frozen. A written list: 1 path, ~12 algorithms, ~30 lessons, ~40 challenges. Evidence: the slice is enumerated in a file, not described vaguely."
 * - S10.5: "The first content slice is actually complete to the frozen S0.11 scope."
 * - D-6 (research.md §22.6): "one path (Interview Prep Fast-Track), 12 algorithms, ~30 lessons, ~40 challenges. Enough to prove the loop; small enough to finish."
 */

import { hasModule } from "@/engine/registry";
import type { ContentCatalog } from "./schemas";
import { algorithms, CATEGORY_META } from "@/data/algorithms";
import { lessons } from "@/data/lessons";
import { problems } from "@/data/problems";
import { paths } from "@/data/paths";
import { achievements } from "@/data/achievements";
import { quests } from "@/data/quests";
import { MARKETING_CLAIMS } from "@/data/marketing-claims";
import { demoLearner } from "@/content/demo-learner";

export interface FirstSliceScope {
  readonly version: string;
  readonly frozenDate: string;
  readonly pathSlug: string;
  readonly coreAlgorithmSlugs: readonly string[];
  readonly extendedAlgorithmSlugs: readonly string[];
  readonly lessonSlugs: readonly string[];
  readonly problemSlugs: readonly string[];
  readonly targetCounts: {
    readonly paths: number;
    readonly coreAlgorithms: number;
    readonly totalAlgorithms: number;
    readonly lessons: number;
    readonly problems: number;
  };
}

export const FIRST_CONTENT_SLICE_SCOPE: FirstSliceScope = {
  version: "1.0.0",
  frozenDate: "2026-08-04",
  pathSlug: "interview-prep",
  coreAlgorithmSlugs: [
    "binary-search",
    "bubble-sort",
    "insertion-sort",
    "selection-sort",
    "merge-sort",
    "quicksort",
    "heap-sort",
    "sliding-window",
    "bfs",
    "dfs",
    "dijkstra",
    "topological-sort",
  ] as const,
  extendedAlgorithmSlugs: [
    "linear-search",
    "counting-sort",
    "two-pointers",
    "linked-list-reversal",
    "stack-basics",
    "queue-basics",
    "hash-table-chaining",
    "bst-insert",
    "bst-traversals",
    "level-order",
    "heap-insert",
    "union-find",
  ] as const,
  lessonSlugs: [
    "binary-search",
    "linear-search",
    "bubble-sort",
    "insertion-sort",
    "selection-sort",
    "merge-sort",
    "quicksort",
    "heap-sort",
    "counting-sort",
    "two-pointers",
    "sliding-window",
    "linked-list-reversal",
    "stack-basics",
    "queue-basics",
    "hash-table-chaining",
    "bst-insert",
    "bst-traversals",
    "level-order",
    "heap-insert",
    "bfs",
    "dfs",
    "dijkstra",
    "topological-sort",
    "union-find",
    "binary-search-variants",
    "fast-slow-pointers",
    "monotonic-stack",
    "trie-basics",
    "dynamic-programming-memo",
    "graph-representations",
  ] as const,
  problemSlugs: [
    "two-sum",
    "binary-search-classic",
    "first-bad-version",
    "merge-sorted-arrays",
    "kth-largest-element",
    "reverse-linked-list",
    "valid-parentheses",
    "binary-tree-level-order",
    "number-of-islands",
    "course-schedule",
    "network-delay-time",
    "linear-search-find-target",
    "bubble-sort-steps",
    "insertion-sort-list",
    "sort-colors",
    "search-rotated-sorted-array",
    "find-minimum-in-rotated-sorted-array",
    "peak-index-in-mountain-array",
    "max-consecutive-ones-iii",
    "minimum-size-subarray-sum",
    "longest-substring-without-repeating-characters",
    "container-with-most-water",
    "trapping-rain-water",
    "middle-of-linked-list",
    "merge-two-sorted-lists",
    "linked-list-cycle",
    "remove-nth-node-from-end",
    "min-stack",
    "evaluate-reverse-polish-notation",
    "daily-temperatures",
    "implement-queue-using-stacks",
    "two-sum-hash-map",
    "group-anagrams",
    "validate-binary-search-tree",
    "maximum-depth-of-binary-tree",
    "invert-binary-tree",
    "lowest-common-ancestor-bst",
    "top-k-frequent-elements",
    "clone-graph",
    "number-of-connected-components",
  ] as const,
  targetCounts: {
    paths: 1,
    coreAlgorithms: 12,
    totalAlgorithms: 24,
    lessons: 30,
    problems: 40,
  },
};

export interface FirstSliceAuditResult {
  complete: boolean;
  scorePercent: number;
  counts: {
    paths: number;
    coreAlgorithms: number;
    totalAlgorithms: number;
    lessons: number;
    problems: number;
  };
  missingItems: {
    paths: string[];
    coreAlgorithms: string[];
    extendedAlgorithms: string[];
    lessons: string[];
    problems: string[];
  };
  engineModulesStatus: Record<string, boolean>;
  errors: string[];
  warnings: string[];
}

export function auditFirstContentSlice(catalog?: ContentCatalog): FirstSliceAuditResult {
  const cat: ContentCatalog = catalog ?? {
    algorithms,
    lessons,
    problems,
    paths,
    achievements,
    quests,
    marketingClaims: Object.values(MARKETING_CLAIMS),
    categoryMeta: CATEGORY_META,
    demoLearner,
  };

  const errors: string[] = [];
  const warnings: string[] = [];

  const pathMap = new Map(cat.paths.map((p) => [p.slug, p]));
  const algoMap = new Map(cat.algorithms.map((a) => [a.slug, a]));
  const lessonMap = new Map(cat.lessons.map((l) => [l.slug, l]));
  const problemMap = new Map(cat.problems.map((p) => [p.slug, p]));

  // 1. Verify Flagship Path
  const missingPaths: string[] = [];
  const flagshipPath = pathMap.get(FIRST_CONTENT_SLICE_SCOPE.pathSlug);
  if (!flagshipPath) {
    missingPaths.push(FIRST_CONTENT_SLICE_SCOPE.pathSlug);
    errors.push(`Flagship path "${FIRST_CONTENT_SLICE_SCOPE.pathSlug}" is missing from catalog.`);
  } else {
    // Check all module items resolve
    for (const mod of flagshipPath.modules) {
      for (const itemSlug of mod.itemSlugs) {
        if (!algoMap.has(itemSlug) && !lessonMap.has(itemSlug) && !problemMap.has(itemSlug)) {
          errors.push(
            `Module "${mod.title}" in path "${flagshipPath.slug}" references nonexistent item "${itemSlug}".`,
          );
        }
      }
    }
  }

  // 2. Verify Core Algorithms & Engine Module Bindings
  const missingCoreAlgos: string[] = [];
  const engineModulesStatus: Record<string, boolean> = {};

  for (const slug of FIRST_CONTENT_SLICE_SCOPE.coreAlgorithmSlugs) {
    if (!algoMap.has(slug)) {
      missingCoreAlgos.push(slug);
      errors.push(`Core algorithm "${slug}" is missing from algorithms catalog.`);
    }
    const hasEng = hasModule(slug);
    engineModulesStatus[slug] = hasEng;
    if (!hasEng) {
      errors.push(`Core algorithm "${slug}" has no registered AlgorithmModule in engine registry.`);
    }
  }

  // 3. Verify Extended Algorithms
  const missingExtendedAlgos: string[] = [];
  for (const slug of FIRST_CONTENT_SLICE_SCOPE.extendedAlgorithmSlugs) {
    if (!algoMap.has(slug)) {
      missingExtendedAlgos.push(slug);
      errors.push(`Extended algorithm "${slug}" is missing from algorithms catalog.`);
    }
  }

  // 4. Verify Lessons
  const missingLessons: string[] = [];
  for (const slug of FIRST_CONTENT_SLICE_SCOPE.lessonSlugs) {
    const lesson = lessonMap.get(slug);
    if (!lesson) {
      missingLessons.push(slug);
      errors.push(`Lesson "${slug}" is missing from lessons catalog.`);
    } else {
      if (!algoMap.has(lesson.algorithmSlug)) {
        errors.push(
          `Lesson "${slug}" references nonexistent algorithmSlug "${lesson.algorithmSlug}".`,
        );
      }
      if (!lesson.sections || lesson.sections.length === 0) {
        errors.push(`Lesson "${slug}" has no sections.`);
      }
      if (!lesson.quiz || lesson.quiz.length === 0) {
        warnings.push(`Lesson "${slug}" has no quiz questions.`);
      }
    }
  }

  // 5. Verify Problems
  const missingProblems: string[] = [];
  for (const slug of FIRST_CONTENT_SLICE_SCOPE.problemSlugs) {
    const prob = problemMap.get(slug);
    if (!prob) {
      missingProblems.push(slug);
      errors.push(`Problem "${slug}" is missing from problems catalog.`);
    } else {
      if (!algoMap.has(prob.algorithmSlug)) {
        errors.push(
          `Problem "${slug}" references nonexistent algorithmSlug "${prob.algorithmSlug}".`,
        );
      }
      if (!prob.starterCode.js || !prob.starterCode.ts || !prob.starterCode.py) {
        errors.push(`Problem "${slug}" is missing starterCode in one or more required languages.`);
      }
      if (!prob.tests || prob.tests.length === 0) {
        errors.push(`Problem "${slug}" has no test cases.`);
      }
    }
  }

  const counts = {
    paths: cat.paths.length,
    coreAlgorithms: FIRST_CONTENT_SLICE_SCOPE.coreAlgorithmSlugs.filter((s) => algoMap.has(s))
      .length,
    totalAlgorithms: cat.algorithms.length,
    lessons: cat.lessons.length,
    problems: cat.problems.length,
  };

  const totalRequired =
    FIRST_CONTENT_SLICE_SCOPE.targetCounts.paths +
    FIRST_CONTENT_SLICE_SCOPE.targetCounts.coreAlgorithms +
    FIRST_CONTENT_SLICE_SCOPE.targetCounts.lessons +
    FIRST_CONTENT_SLICE_SCOPE.targetCounts.problems;

  const totalPresent =
    (flagshipPath ? 1 : 0) +
    counts.coreAlgorithms +
    FIRST_CONTENT_SLICE_SCOPE.lessonSlugs.filter((s) => lessonMap.has(s)).length +
    FIRST_CONTENT_SLICE_SCOPE.problemSlugs.filter((s) => problemMap.has(s)).length;

  const scorePercent = Math.round((totalPresent / totalRequired) * 100);
  const complete = errors.length === 0 && scorePercent === 100;

  return {
    complete,
    scorePercent,
    counts,
    missingItems: {
      paths: missingPaths,
      coreAlgorithms: missingCoreAlgos,
      extendedAlgorithms: missingExtendedAlgos,
      lessons: missingLessons,
      problems: missingProblems,
    },
    engineModulesStatus,
    errors,
    warnings,
  };
}

export function isFirstSliceComplete(catalog?: ContentCatalog): boolean {
  return auditFirstContentSlice(catalog).complete;
}
