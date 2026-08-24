import { describe, expect, it } from "vitest";
import { cellCenter, rowGeometry, scaleXFor, windowExtentPx } from "@/lib/vizTransitions";

describe("rowGeometry", () => {
  it("splits the row into equal cells minus the gaps", () => {
    // 10 cells, 9 gaps of 8px => 728 - 72 = 656 / 10 = 65.6
    expect(rowGeometry(728, 10, 8)).toEqual({ cellWidth: 65.6, stride: 73.6 });
  });

  it("returns zeroed geometry before measurement", () => {
    expect(rowGeometry(0, 10, 8)).toEqual({ cellWidth: 0, stride: 0 });
    expect(rowGeometry(Number.NaN, 10, 8)).toEqual({ cellWidth: 0, stride: 0 });
  });

  it("handles a single cell with no gaps applied", () => {
    expect(rowGeometry(100, 1, 8)).toEqual({ cellWidth: 100, stride: 108 });
  });
});

describe("cellCenter", () => {
  it("centres the first and last cells inside the row", () => {
    expect(cellCenter(0, 728, 10, 8)).toBeCloseTo(32.8, 5);
    expect(cellCenter(9, 728, 10, 8)).toBeCloseTo(9 * 73.6 + 32.8, 5);
  });

  it("clamps out-of-range indexes", () => {
    expect(cellCenter(-4, 728, 10, 8)).toBeCloseTo(cellCenter(0, 728, 10, 8), 5);
    expect(cellCenter(99, 728, 10, 8)).toBeCloseTo(cellCenter(9, 728, 10, 8), 5);
  });
});

describe("windowExtentPx", () => {
  it("spans the full row for the initial window", () => {
    const { offset, width } = windowExtentPx(0, 9, 728, 10, 8);
    expect(offset).toBe(0);
    expect(width).toBeCloseTo(728, 5);
  });

  it("contracts to the left half", () => {
    const { offset, width, center } = windowExtentPx(0, 3, 728, 10, 8);
    expect(offset).toBe(0);
    expect(width).toBeCloseTo(3 * 73.6 + 65.6, 5);
    expect(center).toBeCloseTo(width / 2, 5);
  });

  it("normalises reversed bounds", () => {
    expect(windowExtentPx(6, 2, 728, 10, 8)).toEqual(windowExtentPx(2, 6, 728, 10, 8));
  });
});

describe("scaleXFor", () => {
  it("is 1 for a full-width span and 0.5 for half", () => {
    expect(scaleXFor(728, 728)).toBe(1);
    expect(scaleXFor(364, 728)).toBe(0.5);
  });

  it("falls back to 1 before measurement", () => {
    expect(scaleXFor(100, 0)).toBe(1);
  });
});
