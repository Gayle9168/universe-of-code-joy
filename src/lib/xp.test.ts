import { describe, expect, it } from "vitest";
import { levelFromXp, progressPct, xpAtLevelStart, xpForLevel, xpToNextLevel } from "@/lib/xp";

describe("xp curve", () => {
  it("starts at level 1 and is monotonic non-decreasing", () => {
    expect(levelFromXp(0)).toBe(1);
    let prev = 1;
    for (let xp = 0; xp <= 200_000; xp += 137) {
      const level = levelFromXp(xp);
      expect(level).toBeGreaterThanOrEqual(prev);
      prev = level;
    }
  });

  it("crossing xpForLevel(n) puts you in level n + 1", () => {
    for (let n = 1; n <= 40; n += 1) {
      expect(levelFromXp(xpForLevel(n))).toBe(n + 1);
    }
  });

  it("xpToNextLevel is positive and progressPct stays in range", () => {
    for (let xp = 0; xp <= 200_000; xp += 211) {
      expect(xpToNextLevel(xp)).toBeGreaterThan(0);
      const pct = progressPct(xp);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });

  it("produces finite numbers for edge inputs", () => {
    for (const xp of [0, 1, 1e9, -50, NaN, Infinity, -Infinity]) {
      for (const value of [levelFromXp(xp), xpToNextLevel(xp), progressPct(xp)]) {
        expect(Number.isFinite(value)).toBe(true);
        expect(Number.isNaN(value)).toBe(false);
      }
      expect(levelFromXp(xp)).toBeGreaterThanOrEqual(1);
    }
  });

  it("handles xpAtLevelStart and xpForLevel invalid parameters", () => {
    expect(xpAtLevelStart(1)).toBe(0);
    expect(xpAtLevelStart(0)).toBe(0);
    expect(xpAtLevelStart(-5)).toBe(0);
    expect(xpAtLevelStart(NaN)).toBe(0);
    expect(xpAtLevelStart(2)).toBe(xpForLevel(1));

    expect(xpForLevel(0)).toBe(xpForLevel(1));
    expect(xpForLevel(-10)).toBe(xpForLevel(1));
    expect(xpForLevel(NaN)).toBe(xpForLevel(1));
  });
});
