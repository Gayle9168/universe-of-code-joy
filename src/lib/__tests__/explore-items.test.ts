import { describe, expect, it } from "vitest";

import { CATEGORY_META, getAlgorithms } from "@/content/algorithms";
import { getProblems, getProblemsByAlgorithm } from "@/content/problems";
import type { Algorithm, Problem } from "@/content/types";
import {
  SUPPRESSED_QUESTION_SLUGS,
  algorithmToExploreItem,
  buildExploreItems,
  estMinutesFromXp,
  exploreItemProgressPct,
  filterExploreItems,
  firstSentence,
  fuzzyTitle,
  matchesQuery,
  problemToExploreItem,
  resolvePracticeSlug,
  sortExploreItems,
  type ExploreItem,
} from "@/lib/explore-items";
import type { ProgressData } from "@/stores/progressStore";

const algorithms = getAlgorithms();
const problems = getProblems();
const algorithmsBySlug = new Map(algorithms.map((a) => [a.slug, a]));

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

function itemFixture(overrides: Partial<ExploreItem> = {}): ExploreItem {
  return {
    kind: "algorithm",
    slug: "binary-search",
    title: "Binary Search",
    oneLiner: "Halve the range each step.",
    category: "searching",
    difficulty: "easy",
    estMinutes: 12,
    thumbnailSlug: "binary-search",
    tags: ["divide-and-conquer", "sorted"],
    ...overrides,
  };
}

function problemFixture(overrides: Partial<Problem> = {}): Problem {
  return {
    slug: "fixture-problem",
    algorithmSlug: "binary-search",
    title: "Fixture Problem",
    difficulty: "easy",
    statementMarkdown: "Do the thing. Then do another thing.",
    constraints: ["1 <= n <= 10"],
    examples: [{ input: "n = 1", output: "1" }],
    starterCode: { js: "// js", ts: "// ts", py: "# py" },
    tests: [{ id: "t1", input: [1], expected: 1, hidden: false }],
    hints: ["A hint"],
    xp: 60,
    ...overrides,
  };
}

describe("firstSentence", () => {
  it("takes only the first sentence and strips inline markdown", () => {
    expect(firstSentence("Find the **target** in a `sorted` array. Return its index.")).toBe(
      "Find the target in a sorted array.",
    );
  });

  it("collapses newlines so multi-paragraph statements stay on one line", () => {
    expect(firstSentence("First line.\n\nSecond paragraph here.")).toBe("First line.");
  });

  it("returns the whole string when there is no terminal punctuation", () => {
    expect(firstSentence("No terminator here")).toBe("No terminator here");
  });

  it("handles an empty statement without throwing", () => {
    expect(firstSentence("")).toBe("");
    expect(firstSentence("   ")).toBe("");
  });
});

describe("estMinutesFromXp", () => {
  it("keeps derived minutes inside the range algorithms already use", () => {
    for (const p of problems) {
      const mins = estMinutesFromXp(p.xp);
      expect(mins).toBeGreaterThanOrEqual(5);
      expect(mins).toBeLessThanOrEqual(45);
      expect(Number.isInteger(mins)).toBe(true);
    }
  });

  it("is monotonic — more xp never estimates less time", () => {
    expect(estMinutesFromXp(60)).toBeGreaterThanOrEqual(estMinutesFromXp(40));
    expect(estMinutesFromXp(160)).toBeGreaterThanOrEqual(estMinutesFromXp(60));
  });
});

describe("problemToExploreItem", () => {
  it("derives category from the linked algorithm, not the problem", () => {
    const item = problemToExploreItem(problemFixture(), algorithmsBySlug);
    expect(item?.category).toBe(algorithmsBySlug.get("binary-search")!.category);
  });

  it("prefers an authored oneLiner over the statement fallback", () => {
    const item = problemToExploreItem(
      problemFixture({ oneLiner: "Authored summary." }),
      algorithmsBySlug,
    );
    expect(item?.oneLiner).toBe("Authored summary.");
  });

  it("falls back to the statement's first sentence when oneLiner is absent", () => {
    const item = problemToExploreItem(problemFixture(), algorithmsBySlug);
    expect(item?.oneLiner).toBe("Do the thing.");
  });

  it("prefers an authored estMinutes over the xp-derived fallback", () => {
    const item = problemToExploreItem(problemFixture({ estMinutes: 33 }), algorithmsBySlug);
    expect(item?.estMinutes).toBe(33);
  });

  it("falls back to an xp-derived estMinutes when absent", () => {
    const item = problemToExploreItem(problemFixture({ xp: 60 }), algorithmsBySlug);
    expect(item?.estMinutes).toBe(estMinutesFromXp(60));
  });

  it("uses the algorithm slug for the thumbnail, never the problem slug", () => {
    const item = problemToExploreItem(problemFixture(), algorithmsBySlug);
    expect(item?.thumbnailSlug).toBe("binary-search");
    expect(item?.slug).toBe("fixture-problem");
  });

  it("returns null for an unresolvable algorithmSlug instead of throwing", () => {
    const item = problemToExploreItem(
      problemFixture({ algorithmSlug: "does-not-exist" }),
      algorithmsBySlug,
    );
    expect(item).toBeNull();
  });
});

describe("buildExploreItems", () => {
  const items = buildExploreItems();

  it("includes every algorithm as a card", () => {
    const algoItems = items.filter((i) => i.kind === "algorithm");
    expect(algoItems).toHaveLength(algorithms.length);
  });

  it("suppresses exactly the curated duplicate questions", () => {
    const questionSlugs = new Set(items.filter((i) => i.kind === "question").map((i) => i.slug));
    for (const slug of SUPPRESSED_QUESTION_SLUGS) {
      expect(questionSlugs.has(slug)).toBe(false);
    }
    expect(questionSlugs.size).toBe(problems.length - SUPPRESSED_QUESTION_SLUGS.length);
  });

  it("keeps every suppressed slug a real problem, so the list cannot rot silently", () => {
    const problemSlugs = new Set(problems.map((p) => p.slug));
    for (const slug of SUPPRESSED_QUESTION_SLUGS) {
      expect(problemSlugs.has(slug)).toBe(true);
    }
  });

  it("emits no duplicate kind+slug pair", () => {
    const keys = items.map((i) => `${i.kind}:${i.slug}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("gives every item a non-empty oneLiner and a positive estMinutes", () => {
    for (const item of items) {
      expect(item.oneLiner.length).toBeGreaterThan(0);
      expect(item.estMinutes).toBeGreaterThan(0);
    }
  });

  it("points every thumbnailSlug at a real algorithm", () => {
    for (const item of items) {
      expect(algorithmsBySlug.has(item.thumbnailSlug)).toBe(true);
    }
  });

  it("honours injected catalogs so the adapter stays testable in isolation", () => {
    const algo = algorithmsBySlug.get("binary-search")! satisfies Algorithm;
    const injected = buildExploreItems({
      algorithms: [algo],
      problems: [problemFixture()],
      suppressedQuestionSlugs: [],
    });
    expect(injected).toHaveLength(2);
    expect(injected[0]!.kind).toBe("algorithm");
    expect(injected[1]!.kind).toBe("question");
  });

  it("drops a question whose algorithm is absent from the injected catalog", () => {
    const injected = buildExploreItems({
      algorithms: [],
      problems: [problemFixture()],
      suppressedQuestionSlugs: [],
    });
    expect(injected).toHaveLength(0);
  });
});

describe("fuzzyTitle", () => {
  it("matches an acronym typed against the full title", () => {
    expect(fuzzyTitle("Breadth-First Search", "bfs")).toBe(true);
    expect(fuzzyTitle("Depth-First Search", "dfs")).toBe(true);
  });

  it("matches a plain substring and is case-insensitive", () => {
    expect(fuzzyTitle("Binary Search", "SEARCH")).toBe(true);
  });

  it("respects character order — a scrambled query does not match", () => {
    expect(fuzzyTitle("Breadth-First Search", "sfb")).toBe(false);
  });

  it("rejects a character the title does not contain", () => {
    expect(fuzzyTitle("Merge Sort", "zzz")).toBe(false);
  });

  it("treats an empty query as a match, so a cleared search filters nothing", () => {
    expect(fuzzyTitle("Merge Sort", "")).toBe(true);
  });
});

describe("matchesQuery", () => {
  it("matches on title, tag, category label, and category key", () => {
    const item = itemFixture({ category: "dp", tags: ["memoization"] });
    expect(matchesQuery(item, "binary")).toBe(true);
    expect(matchesQuery(item, "memo")).toBe(true);
    expect(matchesQuery(item, "dynamic programming")).toBe(true);
    expect(matchesQuery(item, "dp")).toBe(true);
  });

  it("returns true for a blank or whitespace-only query", () => {
    expect(matchesQuery(itemFixture(), "")).toBe(true);
    expect(matchesQuery(itemFixture(), "   ")).toBe(true);
  });

  it("returns false when nothing on the item matches", () => {
    expect(matchesQuery(itemFixture({ tags: [] }), "quantum")).toBe(false);
  });

  it("resolves every real item's category through CATEGORY_META without throwing", () => {
    for (const item of buildExploreItems()) {
      expect(CATEGORY_META[item.category]).toBeDefined();
      expect(matchesQuery(item, "")).toBe(true);
    }
  });
});

describe("filterExploreItems", () => {
  const items = buildExploreItems();
  const noFilters = { query: "", categories: [], difficulty: "all" };

  it("returns everything when no filter is set", () => {
    expect(filterExploreItems(items, noFilters)).toHaveLength(items.length);
  });

  it("keeps only the requested categories", () => {
    const filtered = filterExploreItems(items, { ...noFilters, categories: ["graphs"] });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((i) => i.category === "graphs")).toBe(true);
  });

  it("accepts several categories at once", () => {
    const filtered = filterExploreItems(items, {
      ...noFilters,
      categories: ["graphs", "sorting"],
    });
    expect(new Set(filtered.map((i) => i.category))).toEqual(new Set(["graphs", "sorting"]));
  });

  it("keeps only the requested difficulty", () => {
    const filtered = filterExploreItems(items, { ...noFilters, difficulty: "hard" });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((i) => i.difficulty === "hard")).toBe(true);
  });

  it("ands the three filters together rather than oring them", () => {
    const both = filterExploreItems(items, {
      query: "search",
      categories: ["searching"],
      difficulty: "easy",
    });
    expect(both.every((i) => i.category === "searching" && i.difficulty === "easy")).toBe(true);
    const categoryOnly = filterExploreItems(items, { ...noFilters, categories: ["searching"] });
    expect(both.length).toBeLessThanOrEqual(categoryOnly.length);
  });

  it("matches both kinds — a query can return algorithms and questions together", () => {
    const filtered = filterExploreItems(items, { ...noFilters, query: "bfs" });
    expect(filtered.some((i) => i.kind === "algorithm")).toBe(true);
    expect(filtered.some((i) => i.kind === "question")).toBe(true);
  });

  it("returns an empty array for a query nothing matches", () => {
    expect(filterExploreItems(items, { ...noFilters, query: "zzqqxx" })).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const before = [...items];
    filterExploreItems(items, { ...noFilters, difficulty: "easy" });
    expect(items).toEqual(before);
  });
});

describe("sortExploreItems", () => {
  const items = buildExploreItems();
  const progress = emptyProgress();
  const keys = ["recommended", "az", "difficulty", "shortest"] as const;

  it("preserves the item set and never mutates the input for any sort key", () => {
    const before = [...items];
    for (const key of keys) {
      const sorted = sortExploreItems(items, key, progress);
      expect(sorted).toHaveLength(items.length);
      expect(new Set(sorted.map((i) => `${i.kind}:${i.slug}`)).size).toBe(items.length);
      expect(items).toEqual(before);
    }
  });

  it("is deterministic — a reversed input yields the identical order", () => {
    for (const key of keys) {
      const a = sortExploreItems(items, key, progress);
      const b = sortExploreItems([...items].reverse(), key, progress);
      expect(b.map((i) => `${i.kind}:${i.slug}`)).toEqual(a.map((i) => `${i.kind}:${i.slug}`));
    }
  });

  it("orders A-Z by title", () => {
    const sorted = sortExploreItems(items, "az", progress);
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i - 1]!.title.localeCompare(sorted[i]!.title)).toBeLessThanOrEqual(0);
    }
  });

  it("orders difficulty easy → medium → hard", () => {
    const rank = { easy: 0, medium: 1, hard: 2 };
    const sorted = sortExploreItems(items, "difficulty", progress);
    for (let i = 1; i < sorted.length; i += 1) {
      expect(rank[sorted[i - 1]!.difficulty]).toBeLessThanOrEqual(rank[sorted[i]!.difficulty]);
    }
  });

  it("orders shortest first by estMinutes", () => {
    const sorted = sortExploreItems(items, "shortest", progress);
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i - 1]!.estMinutes).toBeLessThanOrEqual(sorted[i]!.estMinutes);
    }
  });

  it("keeps recommended learn-then-practice: an algorithm precedes its own questions", () => {
    const sorted = sortExploreItems(items, "recommended", progress);
    const indexOf = new Map(sorted.map((item, i) => [`${item.kind}:${item.slug}`, i]));
    for (const item of sorted) {
      if (item.kind !== "question") continue;
      const algoIndex = indexOf.get(`algorithm:${item.thumbnailSlug}`);
      expect(algoIndex).toBeDefined();
      expect(algoIndex!).toBeLessThan(indexOf.get(`question:${item.slug}`)!);
    }
  });

  it("groups recommended output — one algorithm's questions are contiguous with it", () => {
    const sorted = sortExploreItems(items, "recommended", progress);
    const seen = new Set<string>();
    let current = "";
    for (const item of sorted) {
      if (item.thumbnailSlug === current) continue;
      // A group may only be entered once; re-entering means it was split.
      expect(seen.has(item.thumbnailSlug)).toBe(false);
      seen.add(item.thumbnailSlug);
      current = item.thumbnailSlug;
    }
  });

  it("strips the internal scoreSlug the mixed scorer needs", () => {
    const sorted = sortExploreItems(items, "recommended", progress);
    for (const item of sorted) {
      expect(item).not.toHaveProperty("scoreSlug");
    }
  });
});

describe("exploreItemProgressPct", () => {
  const algoItem = algorithmToExploreItem(algorithmsBySlug.get("binary-search")!);
  const questionItem = itemFixture({ kind: "question", slug: "two-sum" });

  function algorithmProgress(masteryPct: number): ProgressData {
    return {
      ...emptyProgress(),
      algorithms: {
        "binary-search": {
          status: "learning",
          stepsWatched: 4,
          lessonDone: false,
          quizScore: null,
          problemsSolved: [],
          lastSeenISO: "2026-08-09T00:00:00.000Z",
          masteryPct,
        },
      },
    };
  }

  function solvedProgress(solvedAt: string | null): ProgressData {
    return {
      ...emptyProgress(),
      problems: {
        "two-sum": {
          attempts: 2,
          solvedAt,
          bestRuntimeMs: null,
          lastCode: { js: "", ts: "", py: "" },
        },
      },
    };
  }

  it("reads an algorithm's graded masteryPct", () => {
    expect(exploreItemProgressPct(algoItem, algorithmProgress(64))).toBe(64);
  });

  it("reports 0 for an algorithm with no stored progress", () => {
    expect(exploreItemProgressPct(algoItem, emptyProgress())).toBe(0);
  });

  it("is binary for a question — 100 once solved", () => {
    expect(exploreItemProgressPct(questionItem, solvedProgress("2026-08-09T00:00:00.000Z"))).toBe(
      100,
    );
  });

  it("reports 0 for a question attempted but not solved", () => {
    expect(exploreItemProgressPct(questionItem, solvedProgress(null))).toBe(0);
  });

  it("reports 0 for a question with no stored progress", () => {
    expect(exploreItemProgressPct(questionItem, emptyProgress())).toBe(0);
  });

  it("never reads the algorithm slice for a question, or the problem slice for an algorithm", () => {
    // A question shares the parent algorithm's thumbnailSlug, so a mastery value
    // stored there must not leak into the question's bar.
    const crossed: ProgressData = {
      ...algorithmProgress(90),
      problems: solvedProgress("2026-08-09T00:00:00.000Z").problems,
    };
    const questionOnBinarySearch = itemFixture({
      kind: "question",
      slug: "unsolved-question",
      thumbnailSlug: "binary-search",
    });
    expect(exploreItemProgressPct(questionOnBinarySearch, crossed)).toBe(0);
    expect(exploreItemProgressPct(algoItem, crossed)).toBe(90);
  });

  it("stays inside 0-100 for every real item against an empty profile", () => {
    for (const item of buildExploreItems()) {
      const pct = exploreItemProgressPct(item, emptyProgress());
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });
});

describe("resolvePracticeSlug", () => {
  it("returns null for the algorithms that have no linked question", () => {
    const withoutQuestions = algorithms.filter((a) => getProblemsByAlgorithm(a.slug).length === 0);
    expect(withoutQuestions.map((a) => a.slug)).toEqual([
      "selection-sort",
      "counting-sort",
      "heap-insert",
    ]);
    for (const algo of withoutQuestions) {
      expect(resolvePracticeSlug(algo.slug)).toBeNull();
    }
  });

  it("returns a real problem slug for every algorithm that has one", () => {
    const problemSlugs = new Set(problems.map((p) => p.slug));
    for (const algo of algorithms) {
      const resolved = resolvePracticeSlug(algo.slug);
      if (resolved === null) continue;
      expect(problemSlugs.has(resolved)).toBe(true);
      expect(getProblemsByAlgorithm(algo.slug).map((p) => p.slug)).toContain(resolved);
    }
  });

  it("never returns an algorithm slug — /practice/{algorithmSlug} is always a 404", () => {
    const algorithmSlugs = new Set(algorithms.map((a) => a.slug));
    for (const algo of algorithms) {
      const resolved = resolvePracticeSlug(algo.slug);
      if (resolved !== null) expect(algorithmSlugs.has(resolved)).toBe(false);
    }
  });

  it("picks the easiest linked question, breaking ties by slug", () => {
    expect(resolvePracticeSlug("two-pointers")).toBe("move-zeroes");
    expect(resolvePracticeSlug("dp-1d")).toBe("climbing-stairs");
    expect(resolvePracticeSlug("bfs")).toBe("number-of-islands");
  });

  it("prefers the question the user arrived from over the easiest one", () => {
    expect(resolvePracticeSlug("two-pointers", "trapping-rain-water")).toBe("trapping-rain-water");
  });

  it("ignores a preferred slug not linked to this algorithm, since ?problem= is user-editable", () => {
    expect(resolvePracticeSlug("two-pointers", "climbing-stairs")).toBe("move-zeroes");
    expect(resolvePracticeSlug("two-pointers", "not-a-real-problem")).toBe("move-zeroes");
  });

  it("ignores a preferred slug for an algorithm with no questions at all", () => {
    expect(resolvePracticeSlug("selection-sort", "two-sum")).toBeNull();
  });

  it("honours an injected problem list so the resolver stays testable in isolation", () => {
    const injected = [
      problemFixture({ slug: "hard-one", difficulty: "hard" }),
      problemFixture({ slug: "easy-one", difficulty: "easy" }),
    ];
    expect(resolvePracticeSlug("binary-search", undefined, injected)).toBe("easy-one");
    expect(resolvePracticeSlug("binary-search", "hard-one", injected)).toBe("hard-one");
    expect(resolvePracticeSlug("binary-search", undefined, [])).toBeNull();
  });

  it("does not mutate the injected list while sorting it", () => {
    const injected = [
      problemFixture({ slug: "hard-one", difficulty: "hard" }),
      problemFixture({ slug: "easy-one", difficulty: "easy" }),
    ];
    resolvePracticeSlug("binary-search", undefined, injected);
    expect(injected.map((p) => p.slug)).toEqual(["hard-one", "easy-one"]);
  });
});
