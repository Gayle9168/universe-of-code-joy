import { describe, expect, it } from "vitest";
import { getQuests } from "@/content/quests";
import { getLessons } from "@/content/lessons";
import { getAlgorithm } from "@/content/algorithms";
import type { ProgressData } from "@/stores/progressStore";
import {
  activePathPct,
  completedCategories,
  formatCountdown,
  periodEnd,
  periodKeyFor,
  questCurrent,
  questState,
} from "./quests";

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

describe("Quests pure domain logic (Criterion S11.3)", () => {
  describe("periodKeyFor & periodEnd", () => {
    it("returns correct daily period key and end timestamp", () => {
      const d = new Date(2026, 7, 3, 14, 30); // 2026-08-03 (August is month index 7)
      expect(periodKeyFor("daily", d)).toBe("2026-08-03");
      expect(periodEnd("daily", d).getTime()).toBe(new Date(2026, 7, 4, 0, 0, 0, 0).getTime());
    });

    it("returns correct weekly period key and end timestamp", () => {
      const d = new Date(2026, 7, 3, 14, 30); // 2026-08-03 (Monday)
      expect(periodKeyFor("weekly", d)).toBe("2026-W32");
      // Next Monday
      const nextMon = periodEnd("weekly", d);
      expect(nextMon.getDay()).toBe(1); // Monday
      expect(nextMon.getDate()).toBe(10);
    });

    it("formats hours, minutes, and seconds properly", () => {
      expect(formatCountdown(3665_000)).toBe("01:01:05");
      expect(formatCountdown(0)).toBe("00:00:00");
      expect(formatCountdown(-5000)).toBe("00:00:00");
    });
  });

  describe("completedCategories & activePathPct", () => {
    it("identifies fully completed categories", () => {
      const state = emptyProgress();
      expect(completedCategories(state)).toEqual([]);

      // Mark all sorting lessons complete
      for (const lesson of getLessons()) {
        if (getAlgorithm(lesson.algorithmSlug)?.category === "sorting") {
          state.lessons[lesson.slug] = {
            completedAt: "2026-08-03T10:00:00.000Z",
            quizScore: 100,
            sectionIndex: 0,
          };
        }
      }

      const cats = completedCategories(state);
      expect(cats).toContain("sorting");
    });

    it("calculates active path completion percentage accurately", () => {
      const state = emptyProgress();
      state.activePathSlug = "interview-prep";
      expect(activePathPct(state)).toBe(0);

      state.algorithms["binary-search"] = {
        status: "mastered",
        stepsWatched: 10,
        lessonDone: true,
        quizScore: 100,
        problemsSolved: ["bs-1"],
        masteryPct: 70,
        lastSeenISO: "2026-08-03T10:00:00.000Z",
      };
      const pct = activePathPct(state);
      expect(pct).toBeGreaterThan(0);

      // Non-existent path returns 0
      state.activePathSlug = "non-existent-path";
      expect(activePathPct(state)).toBe(0);
    });
  });

  describe("questCurrent evaluation for all quest types", () => {
    it("evaluates daily quests based on activity and lessons", () => {
      const state = emptyProgress();
      const now = new Date(2026, 7, 3, 10, 0); // 2026-08-03
      const today = "2026-08-03";

      const dailyLesson = getQuests().find((q) => q.id === "daily-lesson")!;
      const dailyProblems = getQuests().find((q) => q.id === "daily-problems")!;
      const dailyQuiz = getQuests().find((q) => q.id === "daily-quiz")!;
      const dailyXp = getQuests().find((q) => q.id === "daily-xp")!;
      const dailyStreak = getQuests().find((q) => q.id === "daily-streak")!;
      const dailyReview = getQuests().find((q) => q.id === "daily-review")!;

      expect(questCurrent(dailyLesson, state, now)).toBe(0);
      expect(questCurrent(dailyProblems, state, now)).toBe(0);
      expect(questCurrent(dailyQuiz, state, now)).toBe(0);
      expect(questCurrent(dailyXp, state, now)).toBe(0);
      expect(questCurrent(dailyStreak, state, now)).toBe(0);
      expect(questCurrent(dailyReview, state, now)).toBe(0);

      // Populate activity
      state.activity[today] = { xp: 50, minutes: 10, steps: 100, solved: 2 };
      state.lessons["bubble-sort"] = {
        completedAt: new Date(2026, 7, 3, 11, 0).toISOString(),
        quizScore: 90,
        sectionIndex: 0,
      };
      state.reviewCards["bubble-sort"] = {
        ease: 2.5,
        intervalDays: 1,
        dueISO: new Date(0).toISOString(),
        reps: 1,
        lapses: 0,
        lastGradedISO: new Date(2026, 7, 3, 11, 30).toISOString(),
      };

      expect(questCurrent(dailyLesson, state, now)).toBe(1);
      expect(questCurrent(dailyProblems, state, now)).toBe(2);
      expect(questCurrent(dailyQuiz, state, now)).toBe(1);
      expect(questCurrent(dailyXp, state, now)).toBe(50);
      expect(questCurrent(dailyStreak, state, now)).toBe(1);
      expect(questCurrent(dailyReview, state, now)).toBe(1);
    });

    it("evaluates weekly quests based on weekly activity aggregates", () => {
      const state = emptyProgress();
      const now = new Date(2026, 7, 3, 10, 0); // 2026-08-03
      const today = "2026-08-03";

      const weeklyLessons = getQuests().find((q) => q.id === "weekly-lessons")!;
      const weeklyProblems = getQuests().find((q) => q.id === "weekly-problems")!;
      const weeklyCategory = getQuests().find((q) => q.id === "weekly-category")!;
      const weeklyStreak = getQuests().find((q) => q.id === "weekly-streak")!;
      const weeklyPath = getQuests().find((q) => q.id === "weekly-path-progress")!;
      const weeklyXp = getQuests().find((q) => q.id === "weekly-xp")!;

      state.activity[today] = { xp: 120, minutes: 20, steps: 200, solved: 3 };
      state.lessons["bubble-sort"] = {
        completedAt: new Date(2026, 7, 3, 11, 0).toISOString(),
        quizScore: 85,
        sectionIndex: 0,
      };

      expect(questCurrent(weeklyLessons, state, now)).toBe(1);
      expect(questCurrent(weeklyProblems, state, now)).toBe(3);
      expect(questCurrent(weeklyStreak, state, now)).toBe(1);
      expect(questCurrent(weeklyXp, state, now)).toBe(120);
      expect(questCurrent(weeklyCategory, state, now)).toBe(0);
      expect(questCurrent(weeklyPath, state, now)).toBe(0);

      // Unknown quest fallback
      expect(
        questCurrent(
          {
            id: "unknown",
            title: "",
            desc: "",
            xp: 10,
            target: 5,
            unit: "",
            kind: "daily",
          } as never,
          state,
          now,
        ),
      ).toBe(0);
    });
  });

  describe("questState derivation and claims", () => {
    it("computes complete, claimed, and percentage accurately", () => {
      const state = emptyProgress();
      const now = new Date(2026, 7, 3, 10, 0);
      const today = "2026-08-03";
      const dailyXp = getQuests().find((q) => q.id === "daily-xp")!;

      const unstarted = questState(dailyXp, state, now);
      expect(unstarted.complete).toBe(false);
      expect(unstarted.claimed).toBe(false);
      expect(unstarted.pct).toBe(0);

      // Partially done (25 out of 100 target = 25%)
      state.activity[today] = { xp: 25, minutes: 5, steps: 50, solved: 0 };
      const partial = questState(dailyXp, state, now);
      expect(partial.current).toBe(25);
      expect(partial.complete).toBe(false);
      expect(partial.pct).toBe(25);

      // Completed but unclaimed
      state.activity[today].xp = 150;
      const completed = questState(dailyXp, state, now);
      expect(completed.complete).toBe(true);
      expect(completed.claimed).toBe(false);
      expect(completed.pct).toBe(100);
      expect(completed.current).toBe(100); // Clamped at target 100

      // Claimed for today
      state.quests[dailyXp.id] = {
        progress: 100,
        claimedAt: "2026-08-03T12:00:00.000Z",
        periodKey: "2026-08-03",
      };
      const claimed = questState(dailyXp, state, now);
      expect(claimed.claimed).toBe(true);

      // Claimed in a previous period does not count as claimed today
      state.quests[dailyXp.id] = {
        progress: 100,
        claimedAt: "2026-08-02T12:00:00.000Z",
        periodKey: "2026-08-02",
      };
      const staleClaimed = questState(dailyXp, state, now);
      expect(staleClaimed.claimed).toBe(false);
    });
  });
});
