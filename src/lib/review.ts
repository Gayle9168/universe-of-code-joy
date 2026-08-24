/**
 * Spaced-repetition queue helpers. Card content is generated from the algorithm
 * catalog so every algorithm a student has touched becomes reviewable.
 */
import { CATEGORY_META, getAlgorithm, getAlgorithms } from "@/content/algorithms";
import type { Algorithm } from "@/content/types";
import type { ProgressData, ReviewCard } from "@/stores/progressStore";

export interface ReviewQuestion {
  slug: string;
  label: string;
  question: string;
  answer: string;
  explanation: string;
}

/** Hand-written prompts for the algorithms students meet first. */
const OVERRIDES: Record<string, { question: string; answer: string; explanation: string }> = {
  bfs: {
    question: "What data structure does BFS use to track the frontier?",
    answer: "A queue (FIFO)",
    explanation:
      "BFS explores nodes level by level using a queue to track the frontier (next nodes to visit) in first-in, first-out order.",
  },
  dfs: {
    question: "What data structure does DFS use to track the path?",
    answer: "A stack (LIFO)",
    explanation:
      "DFS follows one branch as deep as possible, using an explicit stack — or the call stack during recursion — to remember where to backtrack to.",
  },
  "binary-search": {
    question: "What must be true of the input before binary search is valid?",
    answer: "The array must be sorted",
    explanation:
      "Each comparison discards half of the range, which is only sound when the data is ordered. Sorting first costs O(n log n).",
  },
  quicksort: {
    question: "What makes quicksort degrade to O(n²)?",
    answer: "Consistently bad pivots",
    explanation:
      "When every pivot splits off a single element — for example the first element of already-sorted data — the recursion depth becomes n instead of log n.",
  },
  "merge-sort": {
    question: "Why is merge sort stable while quicksort is not?",
    answer: "Merging keeps equal elements in order",
    explanation:
      "The merge step always takes from the left run on a tie, so equal keys never cross. Quicksort swaps across the array and loses that guarantee.",
  },
  dijkstra: {
    question: "Which structure gives Dijkstra its log factor?",
    answer: "A min-priority queue (heap)",
    explanation:
      "Dijkstra repeatedly extracts the closest unsettled node. A binary heap makes that extraction O(log n) instead of O(n).",
  },
};

/** Question/answer pair for one algorithm slug. */
export function questionFor(algorithm: Algorithm): ReviewQuestion {
  const label = `${CATEGORY_META[algorithm.category].label} · ${algorithm.name}`;
  const override = OVERRIDES[algorithm.slug];
  if (override) return { slug: algorithm.slug, label, ...override };
  return {
    slug: algorithm.slug,
    label,
    question: `What is the average time complexity of ${algorithm.name}?`,
    answer: `${algorithm.timeAvg} time · ${algorithm.space} space`,
    explanation: algorithm.oneLiner,
  };
}

const DEFAULT_CARD: ReviewCard = {
  ease: 2.5,
  intervalDays: 1,
  dueISO: new Date(0).toISOString(),
  reps: 0,
  lapses: 0,
};

/** The card record for a slug, defaulted to a brand-new card. */
export function cardFor(state: ProgressData, slug: string): ReviewCard {
  return state.reviewCards[slug] ?? DEFAULT_CARD;
}

/**
 * Today's queue: explicit cards that are due, plus any algorithm the student has
 * engaged with that has no card yet. Ordered by longest overdue first.
 */
export function buildQueue(state: ProgressData, now: Date = new Date()): ReviewQuestion[] {
  const nowMs = now.getTime();
  const seen = new Set<string>();
  const scored: { slug: string; due: number }[] = [];

  for (const [slug, card] of Object.entries(state.reviewCards)) {
    if (!getAlgorithm(slug)) continue;
    const due = new Date(card.dueISO).getTime();
    if (Number.isNaN(due) || due > nowMs) continue;
    seen.add(slug);
    scored.push({ slug, due });
  }

  for (const algorithm of getAlgorithms()) {
    if (seen.has(algorithm.slug)) continue;
    const entry = state.algorithms[algorithm.slug];
    if (!entry || entry.masteryPct <= 0) continue;
    scored.push({ slug: algorithm.slug, due: nowMs });
  }

  scored.sort((a, b) => a.due - b.due || a.slug.localeCompare(b.slug));
  return scored
    .map(({ slug }) => getAlgorithm(slug))
    .filter((a): a is Algorithm => Boolean(a))
    .map(questionFor);
}

/** Mirrors `progressStore.gradeCard` so the buttons can preview the next interval. */
export function nextInterval(card: ReviewCard, grade: number): number {
  const g = Math.min(3, Math.max(0, Math.round(grade)));
  if (g === 0) return 1;
  const ease = Math.min(3, Math.max(1.3, card.ease + (g === 1 ? -0.1 : g === 3 ? 0.1 : 0)));
  // Easy gets a bonus so its interval always outruns Good, even on day-one cards.
  const bonus = g === 3 ? 1.3 : 1;
  return Math.max(1, Math.round(card.intervalDays * ease * bonus));
}

/** Compact human label for an interval in days. */
export function intervalLabel(days: number): string {
  if (days < 1) return "<1d";
  if (days === 1) return "1d";
  if (days < 30) return `${days}d`;
  const months = Math.round(days / 30);
  return `${months}mo`;
}

/** XP for a graded card: recall quality scaled, never negative. */
export function gradeXp(grade: number): number {
  const g = Math.min(3, Math.max(0, Math.round(grade)));
  return [2, 4, 6, 8][g]!;
}
