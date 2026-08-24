import { describe, expect, it } from "vitest";
import { getAlgorithms } from "@/content/algorithms";
import { getLessons } from "@/content/lessons";
import { getPaths } from "@/content/paths";
import {
  nextBestAction,
  scoreAlgorithm,
  sortRecommended,
  sortRecommendedMixed,
  type MixedSortItem,
} from "@/lib/recommend";
import type { ProgressData } from "@/stores/progressStore";

function emptyProgress(): ProgressData {
  return {
    xp: 0,
    level: 1,
    streak: { current: 0, longest: 0, lastActiveISO: null, freezesLeft: 2 },
    algorithms: {},
    lessons: {},
    problems: {},
    reviewCards: {},
    quests: {},
    achievements: {},
    activity: {},
    bookmarks: [],
    activePathSlug: null,
  };
}

describe("sortRecommended", () => {
  const slugs = getAlgorithms().map((a) => a.slug);

  it("is deterministic and preserves the slug set", () => {
    const progress = emptyProgress();
    const a = sortRecommended(slugs, progress);
    const b = sortRecommended([...slugs].reverse(), progress);
    expect(a).toEqual(b);
    expect(a).toHaveLength(slugs.length);
    expect(new Set(a).size).toBe(slugs.length);
    expect([...a].sort()).toEqual([...slugs].sort());
  });
});

describe("scoreAlgorithm & sorting details", () => {
  it("scores unknown algorithms with default fallback values", () => {
    const p = emptyProgress();
    const score = scoreAlgorithm("unknown-algo-slug", p);
    expect(score.prereqUnmet).toBe(Number.MAX_SAFE_INTEGER);
    expect(score.difficulty).toBe(99);
    expect(score.hasViz).toBe(1);
  });

  it("calculates unmet prerequisites accurately", () => {
    const p = emptyProgress();
    const dijkstraScore = scoreAlgorithm("dijkstra", p);
    // bfs is a prerequisite with 0 mastery
    expect(dijkstraScore.prereqUnmet).toBeGreaterThan(0);

    p.algorithms["bfs"] = {
      status: "learning",
      stepsWatched: 5,
      lessonDone: false,
      quizScore: null,
      problemsSolved: [],
      masteryPct: 60,
      lastSeenISO: new Date().toISOString(),
    };
    p.algorithms["heap-insert"] = {
      status: "learning",
      stepsWatched: 5,
      lessonDone: false,
      quizScore: null,
      problemsSolved: [],
      masteryPct: 70,
      lastSeenISO: new Date().toISOString(),
    };
    const updatedScore = scoreAlgorithm("dijkstra", p);
    expect(updatedScore.prereqUnmet).toBe(0);
  });
});

describe("nextBestAction", () => {
  it("returns null for a brand-new user", () => {
    expect(nextBestAction(emptyProgress())).toBeNull();
  });

  it("prefers an unfinished lesson", () => {
    const p = emptyProgress();
    p.lessons[getLessons()[0]!.slug] = { completedAt: null, sectionIndex: 2, quizScore: null };
    const action = nextBestAction(p);
    expect(action?.kind).toBe("lesson");
    expect(action?.slug).toBe(getLessons()[0]!.slug);
    expect(action?.reason).toMatch(/section/);
  });

  it("handles unfinished lesson with unknown or 0 sections", () => {
    const p = emptyProgress();
    p.lessons["custom-unlisted-lesson"] = { completedAt: null, sectionIndex: 0, quizScore: null };
    const action = nextBestAction(p);
    expect(action?.kind).toBe("lesson");
    expect(action?.reason).toContain("started this lesson");
  });

  it("then due review cards (single and multiple)", () => {
    const p = emptyProgress();
    p.reviewCards[getAlgorithms()[0]!.slug] = {
      ease: 2.5,
      intervalDays: 1,
      dueISO: new Date(Date.now() - 86_400_000).toISOString(),
      reps: 1,
      lapses: 0,
    };
    const singleAction = nextBestAction(p);
    expect(singleAction?.kind).toBe("review");
    expect(singleAction?.reason).toContain("one review card");

    p.reviewCards[getAlgorithms()[1]!.slug] = {
      ease: 2.5,
      intervalDays: 1,
      dueISO: new Date(Date.now() - 86_400_000).toISOString(),
      reps: 1,
      lapses: 0,
    };
    const multiAction = nextBestAction(p);
    expect(multiAction?.kind).toBe("review");
    expect(multiAction?.reason).toContain("2 review cards are due");
  });

  it("then the next item in the active path", () => {
    const p = emptyProgress();
    p.xp = 100;
    p.activePathSlug = getPaths()[0]!.slug;
    const action = nextBestAction(p);
    expect(action?.kind).toBe("path");
  });

  it("otherwise the weakest-category algorithm", () => {
    const p = emptyProgress();
    p.xp = 500;
    const action = nextBestAction(p);
    expect(action?.kind).toBe("algorithm");
    expect(getAlgorithms().some((a) => a.slug === action?.slug)).toBe(true);
  });

  it("returns null when all algorithms are 100% mastered", () => {
    const p = emptyProgress();
    p.xp = 10000;
    for (const a of getAlgorithms()) {
      p.algorithms[a.slug] = {
        status: "mastered",
        stepsWatched: 20,
        lessonDone: true,
        quizScore: 100,
        problemsSolved: ["p1"],
        masteryPct: 100,
        lastSeenISO: new Date().toISOString(),
      };
    }
    expect(nextBestAction(p)).toBeNull();
  });
});

describe("sortRecommendedMixed", () => {
  const items: MixedSortItem[] = [
    { kind: "question", slug: "q-bs-2", scoreSlug: "binary-search", title: "Zed Question" },
    {
      kind: "algorithm",
      slug: "binary-search",
      scoreSlug: "binary-search",
      title: "Binary Search",
    },
    { kind: "question", slug: "q-bs-1", scoreSlug: "binary-search", title: "Alpha Question" },
    { kind: "algorithm", slug: "bubble-sort", scoreSlug: "bubble-sort", title: "Bubble Sort" },
    { kind: "question", slug: "q-bubble", scoreSlug: "bubble-sort", title: "Bubble Question" },
  ];

  it("places an algorithm immediately before the questions that inherit its score", () => {
    const out = sortRecommendedMixed(items, emptyProgress());
    const bsAlgo = out.findIndex((i) => i.slug === "binary-search");
    const bsQuestions = [
      out.findIndex((i) => i.slug === "q-bs-1"),
      out.findIndex((i) => i.slug === "q-bs-2"),
    ];
    for (const q of bsQuestions) expect(q).toBeGreaterThan(bsAlgo);
  });

  it("orders questions of one algorithm alphabetically by title", () => {
    const out = sortRecommendedMixed(items, emptyProgress());
    expect(out.findIndex((i) => i.slug === "q-bs-1")).toBeLessThan(
      out.findIndex((i) => i.slug === "q-bs-2"),
    );
  });

  it("keeps each algorithm group contiguous", () => {
    const out = sortRecommendedMixed(items, emptyProgress());
    const groups = out.map((i) => i.scoreSlug);
    const firstIdx = new Map<string, number>();
    const lastIdx = new Map<string, number>();
    groups.forEach((g, i) => {
      if (!firstIdx.has(g)) firstIdx.set(g, i);
      lastIdx.set(g, i);
    });
    for (const [group, first] of firstIdx) {
      const last = lastIdx.get(group)!;
      for (let i = first; i <= last; i++) expect(groups[i]).toBe(group);
    }
  });

  it("is deterministic regardless of input order and does not mutate the input", () => {
    const progress = emptyProgress();
    const original = [...items];
    const a = sortRecommendedMixed(items, progress).map((i) => i.slug);
    const b = sortRecommendedMixed([...items].reverse(), progress).map((i) => i.slug);
    expect(a).toEqual(b);
    expect(items).toEqual(original);
  });

  it("agrees with sortRecommended on algorithm-only input", () => {
    const progress = emptyProgress();
    const slugs = getAlgorithms().map((a) => a.slug);
    const mixed = sortRecommendedMixed(
      getAlgorithms().map((a) => ({
        kind: "algorithm" as const,
        slug: a.slug,
        scoreSlug: a.slug,
        title: a.name,
      })),
      progress,
    ).map((i) => i.slug);
    expect(mixed).toEqual(sortRecommended(slugs, progress));
  });

  it("moves a mastered algorithm's whole group later as its category mastery rises", () => {
    const progress = emptyProgress();
    progress.algorithms["binary-search"] = {
      status: "mastered",
      stepsWatched: 20,
      lessonDone: true,
      quizScore: 100,
      problemsSolved: ["p1"],
      masteryPct: 100,
      lastSeenISO: new Date().toISOString(),
    };
    const out = sortRecommendedMixed(items, progress).map((i) => i.slug);
    expect(out.indexOf("binary-search")).toBeGreaterThan(out.indexOf("bubble-sort"));
  });
});
