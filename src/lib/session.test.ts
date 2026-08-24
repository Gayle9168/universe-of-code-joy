import { describe, expect, it } from "vitest";
import { isRunComplete, minutesFromSeconds, sessionXp } from "@/lib/session";

describe("sessionXp", () => {
  it("is zero for an untouched session", () => {
    expect(sessionXp({ stepsWatched: 0, completedRun: false, algoXp: 120 })).toBe(0);
  });

  it("awards one XP per step watched", () => {
    expect(sessionXp({ stepsWatched: 7, completedRun: false, algoXp: 120 })).toBe(7);
  });

  it("caps step XP so scrubbing a long run cannot farm XP", () => {
    expect(sessionXp({ stepsWatched: 500, completedRun: false, algoXp: 120 })).toBe(20);
  });

  it("adds a completion bonus worth a quarter of the algorithm XP", () => {
    expect(sessionXp({ stepsWatched: 4, completedRun: true, algoXp: 120 })).toBe(34);
  });

  it("never exceeds the algorithm XP value", () => {
    expect(sessionXp({ stepsWatched: 500, completedRun: true, algoXp: 10 })).toBe(10);
  });
});

describe("minutesFromSeconds", () => {
  it("floors to whole minutes and ignores junk", () => {
    expect(minutesFromSeconds(59)).toBe(0);
    expect(minutesFromSeconds(61)).toBe(1);
    expect(minutesFromSeconds(-5)).toBe(0);
    expect(minutesFromSeconds(Number.NaN)).toBe(0);
  });
});

describe("isRunComplete", () => {
  it("needs the last step of a multi-step run", () => {
    expect(isRunComplete(0, 1)).toBe(false);
    expect(isRunComplete(3, 5)).toBe(false);
    expect(isRunComplete(4, 5)).toBe(true);
  });
});
