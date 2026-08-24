import { describe, expect, it } from "vitest";

import { formatCountdown, periodEnd, periodKeyFor, questCurrent, questState } from "@/lib/quests";
import { buildLeague, isoWeek, mulberry32, weekDayKeys, weekEnd, weekStart } from "@/lib/league";
import { evaluateAchievements, achievementCounter, newlyUnlocked } from "@/lib/achievements";
import { buildQueue, gradeXp, intervalLabel, nextInterval, questionFor } from "@/lib/review";
import { getQuests } from "@/content/quests";
import { getAlgorithm } from "@/content/algorithms";

import type { ProgressData } from "@/stores/progressStore";

const NOW = new Date(2026, 7, 1, 12, 0, 0); // Sat 1 Aug 2026, local

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

const questById = (id: string) => getQuests().find((q) => q.id === id)!;

describe("quests", () => {
  it("derives daily problem progress from today activity", () => {
    const state = emptyProgress();
    state.activity["2026-08-01"] = { xp: 40, minutes: 10, steps: 3, solved: 2 };
    expect(questCurrent(questById("daily-problems"), state, NOW)).toBe(2);
    expect(questCurrent(questById("daily-xp"), state, NOW)).toBe(40);
    expect(questCurrent(questById("daily-streak"), state, NOW)).toBe(1);
  });

  it("does not count yesterday against today", () => {
    const state = emptyProgress();
    state.activity["2026-07-31"] = { xp: 400, minutes: 60, steps: 0, solved: 9 };
    expect(questCurrent(questById("daily-problems"), state, NOW)).toBe(0);
    // ...but it still counts toward the weekly quest.
    expect(questCurrent(questById("weekly-problems"), state, NOW)).toBe(9);
  });

  it("counts cards graded today for the review quest", () => {
    const state = emptyProgress();
    state.reviewCards["bfs"] = {
      ease: 2.5,
      intervalDays: 1,
      dueISO: NOW.toISOString(),
      reps: 1,
      lapses: 0,
      lastGradedISO: new Date(2026, 7, 1, 9).toISOString(),
    };
    expect(questCurrent(questById("daily-review"), state, NOW)).toBe(1);
  });

  it("marks a claim as spent only within its own period", () => {
    const state = emptyProgress();
    state.activity["2026-08-01"] = { xp: 0, minutes: 0, steps: 0, solved: 5 };
    state.quests["daily-problems"] = {
      progress: 2,
      claimedAt: NOW.toISOString(),
      periodKey: "2026-07-31",
    };
    const stale = questState(questById("daily-problems"), state, NOW);
    expect(stale.complete).toBe(true);
    expect(stale.claimed).toBe(false);

    state.quests["daily-problems"]!.periodKey = "2026-08-01";
    expect(questState(questById("daily-problems"), state, NOW).claimed).toBe(true);
  });

  it("clamps current at the target and reports whole percentages", () => {
    const state = emptyProgress();
    state.activity["2026-08-01"] = { xp: 999, minutes: 0, steps: 0, solved: 0 };
    const s = questState(questById("daily-xp"), state, NOW);
    expect(s.current).toBe(100);
    expect(s.pct).toBe(100);
  });

  it("uses day keys for daily and ISO weeks for weekly periods", () => {
    expect(periodKeyFor("daily", NOW)).toBe("2026-08-01");
    expect(periodKeyFor("weekly", NOW)).toBe(isoWeek(NOW).key);
    expect(periodEnd("daily", NOW).getDate()).toBe(2);
    expect(periodEnd("weekly", NOW).getDay()).toBe(1); // Monday
  });

  it("formats countdowns", () => {
    expect(formatCountdown(3661 * 1000)).toBe("01:01:01");
    expect(formatCountdown(-5)).toBe("00:00:00");
  });
});

describe("league", () => {
  it("is deterministic for the same seed and XP", () => {
    const a = buildLeague(202631, 1180);
    const b = buildLeague(202631, 1180);
    expect(a.rows.map((r) => r.handle)).toEqual(b.rows.map((r) => r.handle));
    expect(a.myRank).toBe(b.myRank);
  });

  it("changes cohort when the week changes", () => {
    const a = buildLeague(202631, 1180);
    const b = buildLeague(202632, 1180);
    expect(a.rows.map((r) => r.name).join()).not.toBe(b.rows.map((r) => r.name).join());
  });

  it("places the user by real XP: more XP never means a worse rank", () => {
    const low = buildLeague(1, 100);
    const high = buildLeague(1, 5000);
    expect(high.myRank).toBeLessThan(low.myRank);
    expect(high.myRank).toBe(1);
    expect(high.xpToClimb).toBe(0);
  });

  it("always includes the user in the visible rows", () => {
    for (const xp of [0, 500, 1500, 9000]) {
      const league = buildLeague(7, xp);
      expect(league.rows.some((r) => r.me)).toBe(true);
    }
  });

  it("ranks rows in descending XP order", () => {
    const { rows } = buildLeague(42, 900);
    const top = rows.slice(0, 10);
    for (let i = 1; i < top.length; i += 1) {
      expect(top[i]!.xp).toBeLessThanOrEqual(top[i - 1]!.xp);
      expect(top[i]!.rank).toBe(top[i - 1]!.rank + 1);
    }
  });

  it("computes local week boundaries and day keys", () => {
    expect(weekStart(NOW).getDay()).toBe(1);
    expect(weekEnd(NOW).getTime() - weekStart(NOW).getTime()).toBe(7 * 86_400_000);
    const keys = weekDayKeys(NOW);
    expect(keys).toHaveLength(7);
    expect(keys).toContain("2026-08-01");
    expect(keys[0]).toBe("2026-07-27");
  });

  it("mulberry32 stays in range and is reproducible", () => {
    const a = mulberry32(9);
    const b = mulberry32(9);
    for (let i = 0; i < 20; i += 1) {
      const v = a();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      expect(v).toBe(b());
    }
  });
});

describe("achievements", () => {
  it("locks everything for a brand-new account", () => {
    const states = evaluateAchievements(emptyProgress());
    expect(states.every((s) => !s.unlocked)).toBe(true);
    // Level 1 counts toward the level-10 badge; everything else sits at zero.
    const byId = new Map(states.map((s) => [s.achievement.id, s]));
    expect(byId.get("first-blood")!.pct).toBe(0);
    expect(byId.get("scholar")!.pct).toBe(0);
    expect(byId.get("level-10")!.pct).toBe(10);
  });

  it("unlocks first-blood after one solved problem", () => {
    const state = emptyProgress();
    state.problems["two-sum"] = {
      attempts: 1,
      solvedAt: NOW.toISOString(),
      bestRuntimeMs: 12,
      lastCode: { js: "", ts: "", py: "" },
    };
    const byId = new Map(evaluateAchievements(state).map((s) => [s.achievement.id, s]));
    expect(byId.get("first-blood")!.unlocked).toBe(true);
    expect(byId.get("perfectionist")!.unlocked).toBe(true);
    expect(byId.get("problem-solver")!.unlocked).toBe(false);
    expect(byId.get("problem-solver")!.pct).toBe(10);
  });

  it("tracks streak thresholds from the longest streak", () => {
    const state = emptyProgress();
    state.streak.longest = 7;
    expect(achievementCounter({ id: "streak-3" } as never, state)).toEqual([7, 3]);
    expect(achievementCounter({ id: "streak-7" } as never, state)).toEqual([7, 7]);
    expect(achievementCounter({ id: "streak-30" } as never, state)).toEqual([7, 30]);
  });

  it("evaluates all category lesson progress badges", () => {
    const state = emptyProgress();
    expect(achievementCounter({ id: "graph-explorer" } as never, state)[0]).toBe(0);
    expect(achievementCounter({ id: "sorting-savant" } as never, state)[0]).toBe(0);
    expect(achievementCounter({ id: "tree-hugger" } as never, state)[0]).toBe(0);
    expect(achievementCounter({ id: "hash-master" } as never, state)[0]).toBe(0);

    // Complete a sorting lesson
    state.lessons["quicksort"] = {
      completedAt: NOW.toISOString(),
      quizScore: 100,
      sectionIndex: 3,
    };
    expect(achievementCounter({ id: "sorting-savant" } as never, state)[0]).toBe(1);
  });

  it("evaluates path and quiz achievements", () => {
    const state = emptyProgress();
    expect(achievementCounter({ id: "path-finisher" } as never, state)).toEqual([0, 1]);
    expect(achievementCounter({ id: "path-collector" } as never, state)[0]).toBe(0);
    expect(achievementCounter({ id: "quiz-whiz" } as never, state)).toEqual([0, 10]);

    state.lessons["bubble-sort"] = {
      completedAt: NOW.toISOString(),
      quizScore: 100,
      sectionIndex: 3,
    };
    expect(achievementCounter({ id: "quiz-whiz" } as never, state)).toEqual([1, 10]);
  });

  it("evaluates night-owl and early-bird badges based on hour of completion", () => {
    const state = emptyProgress();
    // 02:00 AM completion -> night owl
    state.lessons["bubble-sort"] = {
      completedAt: new Date(2026, 7, 1, 2, 0).toISOString(),
      quizScore: 100,
      sectionIndex: 3,
    };
    expect(achievementCounter({ id: "night-owl" } as never, state)).toEqual([1, 1]);
    expect(achievementCounter({ id: "early-bird" } as never, state)).toEqual([1, 1]);

    // 05:30 AM completion -> early bird only
    state.lessons["selection-sort"] = {
      completedAt: new Date(2026, 7, 1, 5, 30).toISOString(),
      quizScore: 100,
      sectionIndex: 3,
    };
    expect(achievementCounter({ id: "early-bird" } as never, state)).toEqual([2, 1]);
  });

  it("evaluates quest champion and weekly warrior", () => {
    const state = emptyProgress();
    state.quests["daily-lesson"] = {
      progress: 1,
      claimedAt: NOW.toISOString(),
      periodKey: "2026-08-01",
    };
    state.quests["weekly-lessons"] = {
      progress: 3,
      claimedAt: NOW.toISOString(),
      periodKey: "2026-W31",
    };

    expect(achievementCounter({ id: "quest-champion" } as never, state)).toEqual([1, 20]);
    expect(achievementCounter({ id: "weekly-warrior" } as never, state)).toEqual([1, 10]);
  });

  it("evaluates newlyUnlocked helper and fallback counters", () => {
    const state = emptyProgress();
    expect(achievementCounter({ id: "unknown-id" } as never, state)).toEqual([0, 1]);

    // Complete 1 lesson => first-steps unlocks
    state.lessons["bubble-sort"] = {
      completedAt: NOW.toISOString(),
      quizScore: 100,
      sectionIndex: 3,
    };
    const unlocked = newlyUnlocked(state);
    expect(unlocked).toContain("first-steps");
  });

  it("keeps a badge earned once it is recorded", () => {
    const state = emptyProgress();
    state.achievements["first-steps"] = { unlockedAt: NOW.toISOString(), progress: 100 };
    const first = evaluateAchievements(state).find((s) => s.achievement.id === "first-steps")!;
    expect(first.unlocked).toBe(true);
    expect(first.unlockedAt).not.toBeNull();
  });
});

describe("review", () => {
  it("queues algorithms with mastery but no card yet", () => {
    const state = emptyProgress();
    state.algorithms["bfs"] = {
      status: "watched",
      stepsWatched: 12,
      lessonDone: false,
      quizScore: null,
      problemsSolved: [],
      lastSeenISO: NOW.toISOString(),
      masteryPct: 20,
    };
    const queue = buildQueue(state, NOW);
    expect(queue.map((c) => c.slug)).toEqual(["bfs"]);
    expect(queue[0]!.answer).toBe("A queue (FIFO)");
  });

  it("skips cards that are not due yet", () => {
    const state = emptyProgress();
    state.reviewCards["bfs"] = {
      ease: 2.5,
      intervalDays: 4,
      dueISO: new Date(NOW.getTime() + 3 * 86_400_000).toISOString(),
      reps: 2,
      lapses: 0,
    };
    expect(buildQueue(state, NOW)).toHaveLength(0);
  });

  it("grows intervals for good grades and resets for lapses", () => {
    const card = { ease: 2.5, intervalDays: 10, dueISO: NOW.toISOString(), reps: 2, lapses: 0 };
    expect(nextInterval(card, 0)).toBe(1);
    expect(nextInterval(card, 2)).toBe(25);
    expect(nextInterval(card, 3)).toBe(34);
    expect(nextInterval(card, 3)).toBeGreaterThan(nextInterval(card, 1));
    expect(intervalLabel(1)).toBe("1d");
    expect(intervalLabel(60)).toBe("2mo");
    expect(gradeXp(0)).toBeLessThan(gradeXp(3));
  });

  it("falls back to a complexity question for algorithms without a written card", () => {
    const algorithm = getAlgorithm("linear-search")!;
    const card = questionFor(algorithm);
    expect(card.question).toContain("Linear Search");
    expect(card.answer).toContain(algorithm.timeAvg);
  });
});
