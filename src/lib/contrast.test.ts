import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  hexToRgb,
  measureAllPairs,
  relativeLuminance,
  formatContrastTable,
  TOKEN_PAIRS,
} from "./contrast";

describe("WCAG 2.1 color mathematics", () => {
  it("converts hex strings to correct RGB integers", () => {
    expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb("#5b6763")).toEqual({ r: 91, g: 103, b: 99 });
    expect(hexToRgb("f7f9f8")).toEqual({ r: 247, g: 249, b: 248 });
    expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("calculates accurate relative luminance values", () => {
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 4);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 4);
  });

  it("computes standard reference contrast ratios", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
    expect(contrastRatio("#ffffff", "#000000")).toBe(21);
  });
});

describe("WCAG AA contrast table & token verification (Criterion S7.1)", () => {
  it("specifically verifies --slate (#5b6763) on --paper (#f7f9f8) meets WCAG AA (>= 4.5:1)", () => {
    const ratio = contrastRatio("#5b6763", "#f7f9f8");
    expect(ratio).toBeGreaterThanOrEqual(4.5);

    const targetPair = measureAllPairs().find(
      (p) => p.fgToken === "--slate" && p.bgToken === "--paper",
    );
    expect(targetPair).toBeDefined();
    expect(targetPair!.ratio).toBeGreaterThanOrEqual(4.5);
    expect(targetPair!.passAA).toBe(true);
    expect(targetPair!.compliant).toBe(true);
    expect(["AA", "AAA"]).toContain(targetPair!.rating);
  });

  it("ensures every defined token pair in Algora's design system meets its target compliance level", () => {
    const results = measureAllPairs();
    expect(results.length).toBeGreaterThanOrEqual(20);

    const nonCompliant = results.filter((r) => !r.compliant);
    expect(
      nonCompliant,
      `Non-compliant token pairings found: ${JSON.stringify(nonCompliant, null, 2)}`,
    ).toEqual([]);
  });

  it("generates a formatted markdown table summarizing all token pair measurements", () => {
    const table = formatContrastTable();
    expect(table).toContain("# WCAG AA Contrast Audit Table (Criterion S7.1)");
    expect(table).toContain("`--slate` (#5b6763) | `--paper` (#f7f9f8)");
    expect(table).toContain("✅ Pass");
    expect(table.split("\n").length).toBeGreaterThan(TOKEN_PAIRS.length + 5);
  });
});
