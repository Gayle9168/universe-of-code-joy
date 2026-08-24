/**
 * Recommendation scoring. Pure functions — no React, no JSX, no store import.
 */
import { getAlgorithm, getAlgorithms } from "@/content/algorithms";
import { getLesson, getLessons } from "@/content/lessons";
import { getPaths } from "@/content/paths";
import type { Algorithm, Difficulty, Path, Lesson } from "@/content/types";
import { hasModule } from "@/engine/registry";
import type { ProgressData } from "@/stores/progressStore";

const DIFFICULTY_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

export interface RecommendData {
  algorithms?: Algorithm[];
  lessons?: Lesson[];
  paths?: Path[];
}

export interface AlgorithmScore {
  slug: string;
  prereqUnmet: number;
  categoryMastery: number;
  difficulty: number;
  estMinutes: number;
  hasViz: number;
  name: string;
}

function categoryMastery(
  progress: ProgressData,
  algorithms: Algorithm[],
  category: string,
): number {
  const inCategory = algorithms.filter((a) => a.category === category);
  if (inCategory.length === 0) return 0;
  const total = inCategory.reduce(
    (sum, a) => sum + (progress.algorithms?.[a.slug]?.masteryPct ?? 0),
    0,
  );
  return total / inCategory.length;
}

/** Lower is better. */
export function scoreAlgorithm(
  slug: string,
  progress: ProgressData,
  algorithms: Algorithm[] = getAlgorithms(),
): AlgorithmScore {
  const algo = algorithms.find((a) => a.slug === slug) ?? getAlgorithm(slug);
  if (!algo) {
    return {
      slug,
      prereqUnmet: Number.MAX_SAFE_INTEGER,
      categoryMastery: 100,
      difficulty: 99,
      estMinutes: 9999,
      hasViz: 1,
      name: slug,
    };
  }
  const prereqUnmet = algo.prerequisites.filter(
    (p) => (progress.algorithms?.[p]?.masteryPct ?? 0) < 50,
  ).length;
  return {
    slug,
    prereqUnmet,
    categoryMastery: categoryMastery(progress, algorithms, algo.category),
    difficulty: DIFFICULTY_RANK[algo.difficulty] ?? 3,
    estMinutes: algo.estMinutes,
    hasViz: hasModule(slug) ? 0 : 1,
    name: algo.name,
  };
}

/**
 * Prerequisites satisfied first, then weakest category mastery, then lower
 * difficulty, then shorter estMinutes, then runnable visualization, then
 * alphabetical by slug as a deterministic final tiebreak.
 */
export function sortRecommended(
  slugs: string[],
  progress: ProgressData,
  algorithms: Algorithm[] = getAlgorithms(),
): string[] {
  const scored = slugs.map((slug) => scoreAlgorithm(slug, progress, algorithms));
  scored.sort(
    (a, b) =>
      a.prereqUnmet - b.prereqUnmet ||
      a.categoryMastery - b.categoryMastery ||
      a.difficulty - b.difficulty ||
      a.estMinutes - b.estMinutes ||
      a.hasViz - b.hasViz ||
      a.slug.localeCompare(b.slug),
  );
  return scored.map((s) => s.slug);
}

/**
 * Mixed algorithm/question ordering for the Explore grid.
 *
 * A question inherits its algorithm's score, then sorts immediately after that
 * algorithm. The emergent order is learn-then-practice — Binary Search, its
 * binary-search questions, then the next weakest concept — which falls out of
 * the existing scorer rather than a second ranking system.
 */
export interface MixedSortItem {
  kind: "algorithm" | "question";
  slug: string;
  /** For a question, the algorithm it belongs to. For an algorithm, its own slug. */
  scoreSlug: string;
  title: string;
}

export function sortRecommendedMixed<T extends MixedSortItem>(
  items: T[],
  progress: ProgressData,
  algorithms: Algorithm[] = getAlgorithms(),
): T[] {
  const scoreCache = new Map<string, AlgorithmScore>();
  const scoreFor = (slug: string): AlgorithmScore => {
    let cached = scoreCache.get(slug);
    if (!cached) {
      cached = scoreAlgorithm(slug, progress, algorithms);
      scoreCache.set(slug, cached);
    }
    return cached;
  };

  return [...items].sort((a, b) => {
    const sa = scoreFor(a.scoreSlug);
    const sb = scoreFor(b.scoreSlug);
    return (
      sa.prereqUnmet - sb.prereqUnmet ||
      sa.categoryMastery - sb.categoryMastery ||
      sa.difficulty - sb.difficulty ||
      sa.estMinutes - sb.estMinutes ||
      sa.hasViz - sb.hasViz ||
      sa.slug.localeCompare(sb.slug) ||
      // Within one algorithm group: the algorithm card, then its questions.
      (a.kind === b.kind ? 0 : a.kind === "algorithm" ? -1 : 1) ||
      a.title.localeCompare(b.title) ||
      a.slug.localeCompare(b.slug)
    );
  });
}

export interface NextBestAction {
  kind: "lesson" | "review" | "path" | "algorithm";
  slug: string;
  reason: string;
  href: string;
}

export function nextBestAction(
  progress: ProgressData,
  data: RecommendData = {},
): NextBestAction | null {
  const algorithms = data.algorithms ?? getAlgorithms();
  const lessons = data.lessons ?? getLessons();
  const paths = data.paths ?? getPaths();

  // 1. unfinished lesson
  const unfinished = Object.entries(progress.lessons ?? {})
    .filter(([, l]) => !l.completedAt)
    .sort((a, b) => a[0].localeCompare(b[0]))[0];
  if (unfinished) {
    const [slug, state] = unfinished;
    const total = lessons.find((l) => l.slug === slug)?.sections.length ?? 0;
    return {
      kind: "lesson",
      slug,
      reason:
        total > 0
          ? `you left off at section ${Math.min(state.sectionIndex + 1, total)} of ${total}`
          : "you started this lesson but have not finished it",
      href: `/lessons/${slug}`,
    };
  }

  // 2. due review cards
  const now = Date.now();
  const due = Object.entries(progress.reviewCards ?? {})
    .filter(([, c]) => new Date(c.dueISO).getTime() <= now)
    .sort((a, b) => a[0].localeCompare(b[0]));
  if (due.length > 0) {
    return {
      kind: "review",
      slug: due[0]![0],
      reason:
        due.length === 1
          ? "one review card is due today"
          : `${due.length} review cards are due today`,
      href: "/review",
    };
  }

  // 3. next unfinished item in the active path
  if (progress.activePathSlug) {
    const path = paths.find((p) => p.slug === progress.activePathSlug);
    if (path) {
      for (const mod of path.modules) {
        for (const slug of mod.itemSlugs) {
          if ((progress.algorithms?.[slug]?.masteryPct ?? 0) >= 100) continue;
          if (!algorithms.some((a) => a.slug === slug)) continue;
          return {
            kind: "path",
            slug,
            reason: `next up in ${path.title}: ${mod.title}`,
            href: `/algorithms/${slug}`,
          };
        }
      }
    }
  }

  // 4. next algorithm in the weakest category
  const candidates = algorithms
    .filter((a) => (progress.algorithms?.[a.slug]?.masteryPct ?? 0) < 100)
    .map((a) => a.slug);
  if (candidates.length === 0) return null;
  const best = sortRecommended(candidates, progress, algorithms)[0]!;
  const algo = algorithms.find((a) => a.slug === best);
  if (!algo) return null;
  const hasAnyData =
    Object.keys(progress.algorithms ?? {}).length > 0 ||
    Object.keys(progress.lessons ?? {}).length > 0 ||
    Object.keys(progress.problems ?? {}).length > 0 ||
    (progress.xp ?? 0) > 0;
  if (!hasAnyData) return null;
  return {
    kind: "algorithm",
    slug: best,
    reason: `${algo.name} is the weakest spot in your ${algo.category.replace("-", " ")} skills`,
    href: `/algorithms/${best}`,
  };
}
