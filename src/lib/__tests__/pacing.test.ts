import { describe, expect, it } from "vitest";
import { BASE_STEP_MS, phaseWeight, stepDurationMs } from "@/lib/pacing";
import binarySearchModule from "@/engine/algorithms/binarySearch";

function run(values: number[], target: number) {
  const raw = { values: values.join(", "), target: String(target) };
  const parsed = binarySearchModule.validate(raw);
  if (!parsed.ok) throw new Error(parsed.error);
  return binarySearchModule.run(parsed.parsed);
}

describe("semantic autoplay pacing", () => {
  it("falls back to base timing for unknown or missing phases", () => {
    expect(phaseWeight("totally-unknown-phase")).toBe(1);
    expect(phaseWeight(undefined)).toBe(1);
    expect(phaseWeight(null)).toBe(1);
    expect(stepDurationMs("totally-unknown-phase")).toBe(BASE_STEP_MS);
  });

  it("gives midpoint and elimination steps more time than a comparison", () => {
    expect(stepDurationMs("probe")).toBeGreaterThan(stepDurationMs("compare"));
    expect(stepDurationMs("narrow-left")).toBeGreaterThan(stepDurationMs("compare"));
    expect(stepDurationMs("narrow-right")).toBe(stepDurationMs("narrow-left"));
    expect(stepDurationMs("compare")).toBe(BASE_STEP_MS);
  });

  it("settles on terminal steps", () => {
    expect(stepDurationMs("found")).toBeGreaterThan(stepDurationMs("probe"));
    expect(stepDurationMs("done")).toBe(stepDurationMs("found"));
  });

  it("matches meaning generically, without any algorithm identity", () => {
    expect(stepDurationMs("eliminate-left-half")).toBe(stepDurationMs("narrow-left"));
    expect(stepDurationMs("shrink-window")).toBe(stepDurationMs("narrow-left"));
  });

  it("scales inversely with playback speed and never divides by zero", () => {
    expect(stepDurationMs("compare", 2)).toBe(Math.round(BASE_STEP_MS / 2));
    expect(stepDurationMs("compare", 0.5)).toBe(BASE_STEP_MS * 2);
    expect(stepDurationMs("compare", 0)).toBeGreaterThan(0);
    expect(stepDurationMs("compare", Number.NaN)).toBe(BASE_STEP_MS);
  });

  it("gives every step of a real run a positive duration", () => {
    for (const step of run([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23).steps) {
      expect(stepDurationMs(step.phase)).toBeGreaterThan(0);
    }
  });
});
