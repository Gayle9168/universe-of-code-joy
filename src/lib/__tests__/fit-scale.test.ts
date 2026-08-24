import { describe, expect, it } from "vitest";
import { DESIGN_HEIGHT, DESIGN_WIDTH, fitScale, scaledHeight } from "@/lib/fitScale";

describe("fitScale", () => {
  it("returns 1 before the container is measured", () => {
    expect(fitScale(0)).toBe(1);
    expect(fitScale(Number.NaN)).toBe(1);
    expect(fitScale(-100)).toBe(1);
  });

  it("never upscales beyond 1", () => {
    expect(fitScale(DESIGN_WIDTH)).toBe(1);
    expect(fitScale(1920)).toBe(1);
  });

  it("scales narrow containers proportionally", () => {
    expect(fitScale(720)).toBeCloseTo(0.5, 6);
    expect(fitScale(428)).toBeCloseTo(428 / 1440, 6);
  });

  it("honours a custom design width", () => {
    expect(fitScale(512, 1024)).toBeCloseTo(0.5, 6);
  });
});

describe("scaledHeight", () => {
  it("reserves the scaled design height", () => {
    expect(scaledHeight(1)).toBe(DESIGN_HEIGHT);
    expect(scaledHeight(0.5)).toBe(DESIGN_HEIGHT / 2);
    expect(scaledHeight(0.5, 800)).toBe(400);
  });

  it("falls back to full height for invalid scales", () => {
    expect(scaledHeight(0)).toBe(DESIGN_HEIGHT);
    expect(scaledHeight(Number.NaN)).toBe(DESIGN_HEIGHT);
  });
});
