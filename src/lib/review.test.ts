import { describe, expect, it } from "vitest";
import { getAlgorithm } from "@/content/algorithms";
import type { Algorithm } from "@/content/types";
import type { ProgressData, ReviewCard } from "@/stores/progressStore";
import { buildQueue, cardFor, gradeXp, intervalLabel, nextInterval, questionFor } from "./review";

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

describe("Review and Spaced-Repetition domain logic (Criterion S11.3)", () => {
  describe("questionFor", () => {
    it("returns specialized prompt for overridden algorithms", () => {
      const bfs = getAlgorithm("bfs")!;
      const qBfs = questionFor(bfs);
      expect(qBfs.slug).toBe("bfs");
      expect(qBfs.question).toContain("frontier");
      expect(qBfs.answer).toContain("queue");

      const dfs = getAlgorithm("dfs")!;
      const qDfs = questionFor(dfs);
      expect(qDfs.slug).toBe("dfs");
      expect(qDfs.answer).toContain("stack");

      const bs = getAlgorithm("binary-search")!;
      const qBs = questionFor(bs);
      expect(qBs.answer).toContain("sorted");

      const qs = getAlgorithm("quicksort")!;
      const qQs = questionFor(qs);
      expect(qQs.answer).toContain("pivots");

      const ms = getAlgorithm("merge-sort")!;
      const qMs = questionFor(ms);
      expect(qMs.answer).toContain("equal elements");

      const dijkstra = getAlgorithm("dijkstra")!;
      const qDijkstra = questionFor(dijkstra);
      expect(qDijkstra.answer).toContain("min-priority queue");
    });

    it("falls back to algorithmic time/space complexity for non-overridden algorithms", () => {
      const alg: Algorithm = {
        slug: "custom-algo",
        name: "Custom Algo",
        category: "trees",
        difficulty: "medium",
        vizKind: "tree",
        estMinutes: 10,
        xp: 50,
        timeBest: "O(1)",
        timeAvg: "O(n log n)",
        timeWorst: "O(n²)",
        space: "O(n)",
        oneLiner: "Custom algorithm summary.",
        summary: "Detailed summary.",
        tags: ["trees"],
        prerequisites: [],
        realWorldUses: [],
        commonMistakes: [],
      };
      const q = questionFor(alg);
      expect(q.slug).toBe("custom-algo");
      expect(q.question).toBe("What is the average time complexity of Custom Algo?");
      expect(q.answer).toBe("O(n log n) time · O(n) space");
    });
  });

  describe("cardFor", () => {
    it("returns default card for unreviewed algorithms", () => {
      const state = emptyProgress();
      const card = cardFor(state, "bfs");
      expect(card.ease).toBe(2.5);
      expect(card.intervalDays).toBe(1);
      expect(card.reps).toBe(0);
      expect(card.lapses).toBe(0);
    });

    it("returns existing review card if present", () => {
      const state = emptyProgress();
      state.reviewCards["bfs"] = {
        ease: 2.8,
        intervalDays: 6,
        dueISO: "2026-08-10T00:00:00.000Z",
        reps: 3,
        lapses: 1,
      };
      const card = cardFor(state, "bfs");
      expect(card.ease).toBe(2.8);
      expect(card.intervalDays).toBe(6);
      expect(card.reps).toBe(3);
    });
  });

  describe("buildQueue", () => {
    it("prioritizes overdue cards by longest overdue first", () => {
      const state = emptyProgress();
      const now = new Date("2026-08-03T12:00:00.000Z");

      // Due yesterday
      state.reviewCards["bfs"] = {
        ease: 2.5,
        intervalDays: 2,
        dueISO: "2026-08-02T12:00:00.000Z",
        reps: 1,
        lapses: 0,
      };
      // Due 3 days ago
      state.reviewCards["quicksort"] = {
        ease: 2.5,
        intervalDays: 4,
        dueISO: "2026-07-31T12:00:00.000Z",
        reps: 2,
        lapses: 0,
      };
      // Due in future (should not appear in queue)
      state.reviewCards["dfs"] = {
        ease: 2.5,
        intervalDays: 10,
        dueISO: "2026-08-10T12:00:00.000Z",
        reps: 2,
        lapses: 0,
      };

      const queue = buildQueue(state, now);
      expect(queue.length).toBe(2);
      expect(queue[0]!.slug).toBe("quicksort"); // Older due date first
      expect(queue[1]!.slug).toBe("bfs");
    });

    it("enqueues practiced algorithms that have no card yet", () => {
      const state = emptyProgress();
      const now = new Date("2026-08-03T12:00:00.000Z");

      state.algorithms["dijkstra"] = {
        status: "practiced",
        stepsWatched: 10,
        lessonDone: true,
        quizScore: 90,
        problemsSolved: ["p1"],
        masteryPct: 40,
        lastSeenISO: "2026-08-03T10:00:00.000Z",
      };

      const queue = buildQueue(state, now);
      expect(queue.map((q) => q.slug)).toContain("dijkstra");
    });

    it("filters out unknown algorithm slugs safely", () => {
      const state = emptyProgress();
      const now = new Date("2026-08-03T12:00:00.000Z");

      state.reviewCards["invalid-nonexistent-slug"] = {
        ease: 2.5,
        intervalDays: 1,
        dueISO: "2026-08-01T00:00:00.000Z",
        reps: 1,
        lapses: 0,
      };

      const queue = buildQueue(state, now);
      expect(queue.find((q) => q.slug === "invalid-nonexistent-slug")).toBeUndefined();
    });
  });

  describe("nextInterval", () => {
    it("resets interval to 1 on grade 0 (Again)", () => {
      const card: ReviewCard = {
        ease: 2.5,
        intervalDays: 14,
        dueISO: "2026-08-03T00:00:00.000Z",
        reps: 4,
        lapses: 0,
      };
      expect(nextInterval(card, 0)).toBe(1);
    });

    it("decreases ease on grade 1 (Hard)", () => {
      const card: ReviewCard = {
        ease: 2.5,
        intervalDays: 4,
        dueISO: "2026-08-03T00:00:00.000Z",
        reps: 2,
        lapses: 0,
      };
      const interval = nextInterval(card, 1);
      // ease: 2.4 => 4 * 2.4 = 9.6 => 10
      expect(interval).toBe(10);
    });

    it("maintains ease on grade 2 (Good)", () => {
      const card: ReviewCard = {
        ease: 2.5,
        intervalDays: 4,
        dueISO: "2026-08-03T00:00:00.000Z",
        reps: 2,
        lapses: 0,
      };
      const interval = nextInterval(card, 2);
      // ease: 2.5 => 4 * 2.5 = 10
      expect(interval).toBe(10);
    });

    it("increases ease and applies 1.3x bonus on grade 3 (Easy)", () => {
      const card: ReviewCard = {
        ease: 2.5,
        intervalDays: 4,
        dueISO: "2026-08-03T00:00:00.000Z",
        reps: 2,
        lapses: 0,
      };
      const interval = nextInterval(card, 3);
      // ease: 2.6 => 4 * 2.6 * 1.3 = 13.52 => 14
      expect(interval).toBe(14);
    });

    it("clamps ease between 1.3 and 3.0", () => {
      const lowEaseCard: ReviewCard = {
        ease: 1.3,
        intervalDays: 2,
        dueISO: "2026-08-03T00:00:00.000Z",
        reps: 1,
        lapses: 3,
      };
      // Grade 1 should not drop ease below 1.3
      const lowInterval = nextInterval(lowEaseCard, 1);
      expect(lowInterval).toBe(3); // 2 * 1.3 = 2.6 => 3

      const highEaseCard: ReviewCard = {
        ease: 3.0,
        intervalDays: 5,
        dueISO: "2026-08-03T00:00:00.000Z",
        reps: 5,
        lapses: 0,
      };
      // Grade 3 should not increase ease above 3.0
      const highInterval = nextInterval(highEaseCard, 3);
      expect(highInterval).toBe(20); // 5 * 3.0 * 1.3 = 19.5 => 20
    });
  });

  describe("intervalLabel", () => {
    it("formats human-readable intervals", () => {
      expect(intervalLabel(0)).toBe("<1d");
      expect(intervalLabel(0.5)).toBe("<1d");
      expect(intervalLabel(1)).toBe("1d");
      expect(intervalLabel(6)).toBe("6d");
      expect(intervalLabel(29)).toBe("29d");
      expect(intervalLabel(30)).toBe("1mo");
      expect(intervalLabel(60)).toBe("2mo");
      expect(intervalLabel(180)).toBe("6mo");
    });
  });

  describe("gradeXp", () => {
    it("returns correct XP per grade and clamps invalid values", () => {
      expect(gradeXp(0)).toBe(2);
      expect(gradeXp(1)).toBe(4);
      expect(gradeXp(2)).toBe(6);
      expect(gradeXp(3)).toBe(8);

      // Clamp checks
      expect(gradeXp(-1)).toBe(2);
      expect(gradeXp(5)).toBe(8);
    });
  });
});
