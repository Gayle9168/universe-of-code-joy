import { describe, expect, it } from "vitest";
import { getAlgorithm } from "@/content/algorithms";
import { getProblem, getProblemsByAlgorithm } from "@/content/problems";
import type { Problem } from "@/content/types";
import {
  isImplementationSolved,
  resolveImplementationSlug,
  resolveTransferSlug,
} from "@/lib/lesson-stages";
import { validatePracticeSearch } from "@/lib/practice-search";
import type { ProgressData } from "@/stores/progressStore";

const progressWith = (slugs: string[]): Pick<ProgressData, "problems"> => ({
  problems: Object.fromEntries(
    slugs.map((slug) => [slug, { attempts: 1, solvedAt: "2026-01-01T00:00:00.000Z" }]),
  ) as ProgressData["problems"],
});

describe("resolveImplementationSlug", () => {
  it("maps binary search to its canonical implementation challenge", () => {
    expect(resolveImplementationSlug("binary-search")).toBe("binary-search-classic");
    expect(getProblem("binary-search-classic")?.title).toBe("Classic Binary Search");
  });

  it("returns null for an algorithm with no mapping", () => {
    const unmapped = getAlgorithm("linear-search");
    expect(unmapped?.implementationProblemSlug).toBeUndefined();
    expect(resolveImplementationSlug("linear-search")).toBeNull();
  });

  it("returns null when the mapping points at a slug the catalog lacks", () => {
    const broken = { ...getAlgorithm("binary-search")!, implementationProblemSlug: "nope" };
    expect(resolveImplementationSlug("binary-search", broken)).toBeNull();
  });

  it("returns null for an unknown algorithm slug", () => {
    expect(resolveImplementationSlug("not-an-algorithm")).toBeNull();
  });

  it("only ever resolves to real problems across the whole catalog", () => {
    for (const algo of [getAlgorithm("binary-search")!]) {
      const slug = resolveImplementationSlug(algo.slug);
      if (slug) expect(getProblem(slug)).toBeDefined();
    }
  });
});

describe("resolveTransferSlug", () => {
  it("never reuses the implementation challenge for the Solve stage", () => {
    const code = resolveImplementationSlug("binary-search");
    const solve = resolveTransferSlug("binary-search");
    expect(code).toBe("binary-search-classic");
    expect(solve).not.toBe(code);
    expect(getProblem(solve!)?.algorithmSlug).toBe("binary-search");
  });

  it("ignores a preferred slug that is the implementation challenge", () => {
    expect(resolveTransferSlug("binary-search", "binary-search-classic")).not.toBe(
      "binary-search-classic",
    );
  });

  it("honours a preferred transfer question that is linked to the algorithm", () => {
    const others = getProblemsByAlgorithm("binary-search").filter(
      (p) => p.slug !== "binary-search-classic",
    );
    const preferred = others[1]?.slug ?? others[0]!.slug;
    expect(resolveTransferSlug("binary-search", preferred)).toBe(preferred);
  });

  it("returns null when the implementation challenge is the only linked question", () => {
    const only = [getProblem("binary-search-classic")!] as Problem[];
    expect(resolveTransferSlug("binary-search", undefined, only, "binary-search-classic")).toBeNull();
  });
});

describe("isImplementationSolved", () => {
  it("is false with no mapping", () => {
    expect(isImplementationSolved(null, progressWith(["binary-search-classic"]))).toBe(false);
  });

  it("is false while the mapped problem is unsolved (visiting is not completion)", () => {
    expect(isImplementationSolved("binary-search-classic", { problems: {} })).toBe(false);
    expect(
      isImplementationSolved("binary-search-classic", {
        problems: { "binary-search-classic": { attempts: 3 } } as ProgressData["problems"],
      }),
    ).toBe(false);
  });

  it("is true once the mapped problem has a solvedAt", () => {
    expect(isImplementationSolved("binary-search-classic", progressWith(["binary-search-classic"]))).toBe(
      true,
    );
  });

  it("is not satisfied by solving a different problem", () => {
    expect(isImplementationSolved("binary-search-classic", progressWith(["two-sum"]))).toBe(false);
  });
});

describe("validatePracticeSearch", () => {
  it("keeps recognised lesson origin context", () => {
    expect(
      validatePracticeSearch({ from: "lesson", algorithm: "binary-search", stage: "code" }),
    ).toEqual({ from: "lesson", algorithm: "binary-search", stage: "code" });
  });

  it("drops junk params", () => {
    expect(
      validatePracticeSearch({ from: "hack", algorithm: "not-real", stage: "everything" }),
    ).toEqual({});
    expect(validatePracticeSearch({})).toEqual({});
  });

  it("drops an algorithm slug that is not in the catalog even with from=lesson", () => {
    expect(validatePracticeSearch({ from: "lesson", algorithm: "🙈" })).toEqual({ from: "lesson" });
  });
});
