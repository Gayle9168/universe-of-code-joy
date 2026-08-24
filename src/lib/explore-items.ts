/**
 * Unified view-model for the Explore grid, which mixes algorithm cards and
 * question cards. Pure functions — no React, no store, no router.
 */
import { CATEGORY_META, getAlgorithms } from "@/content/algorithms";
import { getProblems, getProblemsByAlgorithm } from "@/content/problems";
import type { Algorithm, Category, Difficulty, Problem } from "@/content/types";
import { sortRecommendedMixed } from "@/lib/recommend";
import type { ProgressData } from "@/stores/progressStore";

export type ExploreItemKind = "algorithm" | "question";

export interface ExploreItem {
  kind: ExploreItemKind;
  slug: string;
  title: string;
  oneLiner: string;
  category: Category;
  difficulty: Difficulty;
  estMinutes: number;
  /** Always an ALGORITHM slug — AlgorithmThumbnail resolves engine modules by algorithm. */
  thumbnailSlug: string;
  tags: string[];
}

/**
 * Questions whose title restates an algorithm card sitting in the same grid.
 * No string-similarity rule catches these — "Find Target in Unsorted Array" and
 * "Linear Search" share no words — so the list is curated and auditable.
 * The algorithm card wins because it owns the visualizer. These questions stay
 * fully reachable at /practice/$slug.
 */
export const SUPPRESSED_QUESTION_SLUGS: readonly string[] = [
  "binary-search-classic",
  "linear-search-find-target",
  "bubble-sort-steps",
  "insertion-sort-list",
  "binary-tree-level-order",
];

/** Markdown-aware first-sentence extraction, used when a problem has no oneLiner. */
export function firstSentence(markdown: string): string {
  const flat = markdown
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (!flat) return "";
  const match = /^(.+?[.!?])(\s|$)/.exec(flat);
  return (match?.[1] ?? flat).trim();
}

/**
 * Fallback solve-time estimate. Problem xp in this catalog runs 40-160; the
 * divisor keeps derived minutes inside the 8-30 range algorithms already use,
 * so the "Shortest first" sort stays comparable across both kinds.
 */
export function estMinutesFromXp(xp: number): number {
  return Math.max(5, Math.min(45, Math.round(xp / 6)));
}

export function algorithmToExploreItem(algo: Algorithm): ExploreItem {
  return {
    kind: "algorithm",
    slug: algo.slug,
    title: algo.name,
    oneLiner: algo.oneLiner,
    category: algo.category,
    difficulty: algo.difficulty,
    estMinutes: algo.estMinutes,
    thumbnailSlug: algo.slug,
    tags: algo.tags,
  };
}

/**
 * Returns null when the problem's algorithmSlug does not resolve, so a broken
 * foreign key drops one card instead of throwing during render.
 */
export function problemToExploreItem(
  problem: Problem,
  algorithmsBySlug: Map<string, Algorithm>,
): ExploreItem | null {
  const algo = algorithmsBySlug.get(problem.algorithmSlug);
  if (!algo) return null;

  return {
    kind: "question",
    slug: problem.slug,
    title: problem.title,
    oneLiner: problem.oneLiner ?? firstSentence(problem.statementMarkdown),
    category: algo.category,
    difficulty: problem.difficulty,
    estMinutes: problem.estMinutes ?? estMinutesFromXp(problem.xp),
    thumbnailSlug: problem.algorithmSlug,
    tags: algo.tags,
  };
}

export interface BuildExploreItemsOptions {
  algorithms?: Algorithm[];
  problems?: Problem[];
  suppressedQuestionSlugs?: readonly string[];
}

/**
 * Builds the mixed Explore grid: every algorithm, plus every question except
 * those suppressed as duplicates of an algorithm card.
 */
export function buildExploreItems(options: BuildExploreItemsOptions = {}): ExploreItem[] {
  const algorithms = options.algorithms ?? getAlgorithms();
  const problems = options.problems ?? getProblems();
  const suppressed = new Set(options.suppressedQuestionSlugs ?? SUPPRESSED_QUESTION_SLUGS);
  const algorithmsBySlug = new Map(algorithms.map((a) => [a.slug, a]));

  const items: ExploreItem[] = algorithms.map(algorithmToExploreItem);

  for (const problem of problems) {
    if (suppressed.has(problem.slug)) continue;
    const item = problemToExploreItem(problem, algorithmsBySlug);
    if (item) items.push(item);
  }

  return items;
}

/* ------------------------------ filter & sort ------------------------------ */

export type ExploreSortKey = "recommended" | "az" | "difficulty" | "shortest";

const DIFFICULTY_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

/**
 * Subsequence match on the title, so "bfs" finds "Breadth-First Search". Kept
 * separate from the substring checks below because it is deliberately loose.
 */
export function fuzzyTitle(title: string, query: string): boolean {
  const target = title.toLowerCase();
  let i = 0;
  for (const ch of query.toLowerCase()) {
    const found = target.indexOf(ch, i);
    if (found === -1) return false;
    i = found + 1;
  }
  return true;
}

export function matchesQuery(item: ExploreItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (fuzzyTitle(item.title, q)) return true;
  if (item.tags.some((t) => t.toLowerCase().includes(q))) return true;
  if (CATEGORY_META[item.category].label.toLowerCase().includes(q)) return true;
  if (item.category.toLowerCase().includes(q)) return true;
  return false;
}

export interface ExploreFilters {
  query: string;
  categories: string[];
  /** "all", or one of the Difficulty values. */
  difficulty: string;
}

/**
 * Percent complete for the card's progress bar. An algorithm has a graded
 * mastery; a question is binary — the catalog stores only `solvedAt`, so it is
 * 0 or 100 and never anything between.
 */
export function exploreItemProgressPct(item: ExploreItem, progress: ProgressData): number {
  if (item.kind === "question") {
    return progress.problems?.[item.slug]?.solvedAt ? 100 : 0;
  }
  return progress.algorithms?.[item.slug]?.masteryPct ?? 0;
}

export function filterExploreItems(items: ExploreItem[], filters: ExploreFilters): ExploreItem[] {
  return items.filter((item) => {
    if (!matchesQuery(item, filters.query)) return false;
    if (filters.categories.length > 0 && !filters.categories.includes(item.category)) return false;
    if (filters.difficulty !== "all" && item.difficulty !== filters.difficulty) return false;
    return true;
  });
}

/**
 * Every sort is total: each comparator ends in a slug tiebreak so two items can
 * never swap between renders. "recommended" delegates to the shared scorer,
 * which keeps each algorithm adjacent to its own questions.
 */
export function sortExploreItems(
  items: ExploreItem[],
  sortKey: ExploreSortKey,
  progress: ProgressData,
  algorithms: Algorithm[] = getAlgorithms(),
): ExploreItem[] {
  if (sortKey === "az") {
    return [...items].sort(
      (a, b) => a.title.localeCompare(b.title) || a.slug.localeCompare(b.slug),
    );
  }
  if (sortKey === "difficulty") {
    return [...items].sort(
      (a, b) =>
        DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] ||
        a.title.localeCompare(b.title) ||
        a.slug.localeCompare(b.slug),
    );
  }
  if (sortKey === "shortest") {
    return [...items].sort(
      (a, b) =>
        a.estMinutes - b.estMinutes ||
        a.title.localeCompare(b.title) ||
        a.slug.localeCompare(b.slug),
    );
  }
  return sortRecommendedMixed(
    items.map((item) => ({ ...item, scoreSlug: item.thumbnailSlug })),
    progress,
    algorithms,
  ).map(({ scoreSlug: _scoreSlug, ...item }) => item);
}

/* ------------------------------ practice target ------------------------------ */

const EASIEST_FIRST = (a: Problem, b: Problem): number =>
  DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] || a.slug.localeCompare(b.slug);

/**
 * Which question the visualizer's "Practice" button opens.
 *
 * No algorithm slug is also a problem slug, so linking to /practice/{algorithmSlug}
 * hits notFound() every time — the button has to resolve a real question first.
 * Prefers the question the user arrived from (an Explore card sets ?problem=),
 * falling back to the algorithm's easiest linked question. Returns null when the
 * algorithm has no question at all, so the caller can disable the button instead
 * of routing into a 404.
 *
 * A preferred slug that is not linked to this algorithm is ignored rather than
 * trusted — the search param is user-editable.
 */
export function resolvePracticeSlug(
  algorithmSlug: string,
  preferredProblemSlug?: string,
  problems: Problem[] = getProblemsByAlgorithm(algorithmSlug),
): string | null {
  if (problems.length === 0) return null;
  if (preferredProblemSlug && problems.some((p) => p.slug === preferredProblemSlug)) {
    return preferredProblemSlug;
  }
  return [...problems].sort(EASIEST_FIRST)[0]!.slug;
}
