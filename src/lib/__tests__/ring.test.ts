import { describe, expect, it } from "vitest";
import { clampPct, ringGeometry } from "@/lib/ring";

describe("clampPct", () => {
  it("clamps out-of-range and non-finite values", () => {
    expect(clampPct(-20)).toBe(0);
    expect(clampPct(140)).toBe(100);
    expect(clampPct(Number.NaN)).toBe(0);
    expect(clampPct(72)).toBe(72);
  });
});

describe("ringGeometry", () => {
  it("insets the radius by half the stroke", () => {
    expect(ringGeometry(36, 4, 0).radius).toBe(16);
  });

  it("draws nothing at 0% and the whole ring at 100%", () => {
    const empty = ringGeometry(36, 4, 0);
    expect(empty.dashOffset).toBeCloseTo(empty.circumference, 6);
    expect(ringGeometry(36, 4, 100).dashOffset).toBeCloseTo(0, 6);
  });

  it("is linear in between", () => {
    const g = ringGeometry(36, 4, 50);
    expect(g.dashOffset).toBeCloseTo(g.circumference / 2, 6);
  });

  it("never produces a negative radius", () => {
    expect(ringGeometry(2, 10, 50).radius).toBe(0);
  });
});
