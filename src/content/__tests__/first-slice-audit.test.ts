import { describe, it, expect } from "vitest";
import {
  FIRST_CONTENT_SLICE_SCOPE,
  auditFirstContentSlice,
  isFirstSliceComplete,
} from "../first-slice";
import { paths, getPath } from "@/data/paths";
import { algorithms, getAlgorithm } from "@/data/algorithms";
import { lessons, getLesson } from "@/data/lessons";
import { problems, getProblem } from "@/data/problems";
import { hasModule, getModule } from "@/engine/registry";

describe("First Content Slice Completeness Audit (S10.5 & S0.11)", () => {
  it("passes 100% completeness audit against frozen S0.11 / D-6 scope", () => {
    const report = auditFirstContentSlice();
    expect(report.errors, `Audit failed with errors: ${report.errors.join("; ")}`).toEqual([]);
    expect(report.complete).toBe(true);
    expect(report.scorePercent).toBe(100);
    expect(isFirstSliceComplete()).toBe(true);
  });

  describe("Flagship Path: interview-prep", () => {
    it("exists and has 5 complete structured modules", () => {
      const path = getPath("interview-prep");
      expect(path).toBeDefined();
      expect(path?.modules.length).toBe(5);
    });

    it("resolves 100% of module itemSlugs to valid catalog entities", () => {
      const path = getPath("interview-prep");
      expect(path).toBeDefined();

      const algoSet = new Set(algorithms.map((a) => a.slug));
      const lessonSet = new Set(lessons.map((l) => l.slug));
      const problemSet = new Set(problems.map((p) => p.slug));

      for (const mod of path!.modules) {
        for (const itemSlug of mod.itemSlugs) {
          const resolved =
            algoSet.has(itemSlug) || lessonSet.has(itemSlug) || problemSet.has(itemSlug);
          expect(
            resolved,
            `Item "${itemSlug}" in module "${mod.title}" could not be resolved`,
          ).toBe(true);
        }
      }
    });
  });

  describe("Core 12 Runnable Algorithm Modules (Engine Integrity)", () => {
    it("has exactly 12 core algorithm modules registered in the engine", () => {
      expect(FIRST_CONTENT_SLICE_SCOPE.coreAlgorithmSlugs.length).toBe(12);

      for (const slug of FIRST_CONTENT_SLICE_SCOPE.coreAlgorithmSlugs) {
        expect(hasModule(slug), `Core algorithm "${slug}" is missing from engine registry`).toBe(
          true,
        );

        const mod = getModule(slug);
        expect(mod).toBeDefined();
        expect(mod?.slug).toBe(slug);
        expect(mod?.inputs.length).toBeGreaterThan(0);
        expect(mod?.presets.length).toBeGreaterThan(0);

        // Verify module can run and generate steps using its first preset
        const defaultRaw = mod!.presets[0].values;
        const valid = mod!.validate(defaultRaw);
        expect(
          valid.ok,
          `Module "${slug}" failed to validate default preset: ${valid.ok ? "" : valid.error}`,
        ).toBe(true);

        if (valid.ok) {
          const run = mod!.run(valid.parsed);
          expect(run.steps.length).toBeGreaterThan(0);
          expect(run.pseudocode.length).toBeGreaterThan(0);
        }
      }
    });

    it("contains every algorithm frozen in the S0.11 scope, and may exceed it", () => {
      // The frozen scope is a floor, not a ceiling — auditFirstContentSlice() is a presence
      // check, so catalog growth beyond the frozen 24 must not regress the slice.
      const frozen = [
        ...FIRST_CONTENT_SLICE_SCOPE.coreAlgorithmSlugs,
        ...FIRST_CONTENT_SLICE_SCOPE.extendedAlgorithmSlugs,
      ];
      expect(frozen.length).toBe(FIRST_CONTENT_SLICE_SCOPE.targetCounts.totalAlgorithms);
      expect(algorithms.length).toBeGreaterThanOrEqual(frozen.length);

      for (const slug of frozen) {
        expect(getAlgorithm(slug), `Frozen algorithm "${slug}" not found in catalog`).toBeDefined();
      }

      const slugs = algorithms.map((a) => a.slug);
      expect(new Set(slugs).size, "Algorithm slugs must be unique").toBe(slugs.length);
    });
  });

  describe("Lesson Catalog Depth (30 Lessons)", () => {
    it("contains exactly 30 rich interactive lessons", () => {
      expect(lessons.length).toBe(30);
      expect(FIRST_CONTENT_SLICE_SCOPE.lessonSlugs.length).toBe(30);
    });

    it("ensures every lesson has at least 4 markdown sections and a valid algorithm binding", () => {
      for (const slug of FIRST_CONTENT_SLICE_SCOPE.lessonSlugs) {
        const lesson = getLesson(slug);
        expect(lesson, `Lesson "${slug}" not found`).toBeDefined();
        expect(lesson?.sections.length).toBeGreaterThanOrEqual(4);
        expect(
          getAlgorithm(lesson!.algorithmSlug),
          `Lesson "${slug}" has invalid algorithmSlug "${lesson!.algorithmSlug}"`,
        ).toBeDefined();
      }
    });

    it("ensures every lesson has 4 interactive quiz questions with bounded answerIndex", () => {
      for (const lesson of lessons) {
        expect(lesson.quiz.length).toBe(4);
        for (const q of lesson.quiz) {
          expect(q.prompt.length).toBeGreaterThan(10);
          expect(q.options.length).toBeGreaterThanOrEqual(2);
          expect(q.answerIndex).toBeGreaterThanOrEqual(0);
          expect(q.answerIndex).toBeLessThan(q.options.length);
          expect(q.explanation.length).toBeGreaterThan(5);
        }
      }
    });
  });

  describe("Problem Catalog Depth (40 Coding Challenges)", () => {
    it("contains every problem frozen in the S0.11 scope, and may exceed it", () => {
      // The frozen scope is a floor, not a ceiling: growth beyond 40 must not regress the slice.
      expect(problems.length).toBeGreaterThanOrEqual(FIRST_CONTENT_SLICE_SCOPE.problemSlugs.length);
      expect(FIRST_CONTENT_SLICE_SCOPE.problemSlugs.length).toBe(40);

      for (const slug of FIRST_CONTENT_SLICE_SCOPE.problemSlugs) {
        expect(getProblem(slug), `Frozen problem "${slug}" not found in catalog`).toBeDefined();
      }

      const slugs = problems.map((p) => p.slug);
      expect(new Set(slugs).size, "Problem slugs must be unique").toBe(slugs.length);
    });

    it("ensures every problem has multi-language starter code (JS, TS, Python)", () => {
      for (const slug of FIRST_CONTENT_SLICE_SCOPE.problemSlugs) {
        const prob = getProblem(slug);
        expect(prob, `Problem "${slug}" not found`).toBeDefined();
        expect(
          prob?.starterCode.js.length,
          `Problem "${slug}" missing JS starter code`,
        ).toBeGreaterThan(10);
        expect(
          prob?.starterCode.ts.length,
          `Problem "${slug}" missing TS starter code`,
        ).toBeGreaterThan(10);
        expect(
          prob?.starterCode.py.length,
          `Problem "${slug}" missing Python starter code`,
        ).toBeGreaterThan(10);
      }
    });

    it("ensures every problem has at least 1 test case and valid constraints", () => {
      for (const prob of problems) {
        expect(prob.tests.length).toBeGreaterThanOrEqual(1);
        expect(prob.constraints.length).toBeGreaterThanOrEqual(1);
        expect(prob.examples.length).toBeGreaterThanOrEqual(1);
        expect(prob.hints.length).toBeGreaterThanOrEqual(1);
        expect(prob.xp).toBeGreaterThan(0);
        expect(
          getAlgorithm(prob.algorithmSlug),
          `Problem "${prob.slug}" has invalid algorithmSlug "${prob.algorithmSlug}"`,
        ).toBeDefined();
      }
    });

    it("has a balanced distribution of difficulty tiers", () => {
      const easyCount = problems.filter((p) => p.difficulty === "easy").length;
      const mediumCount = problems.filter((p) => p.difficulty === "medium").length;
      const hardCount = problems.filter((p) => p.difficulty === "hard").length;

      expect(easyCount).toBeGreaterThanOrEqual(10);
      expect(mediumCount).toBeGreaterThanOrEqual(15);
      expect(hardCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Design & Tone Directives (S0.6)", () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    it("contains zero emojis across all lesson text and quizzes", () => {
      for (const lesson of lessons) {
        expect(emojiRegex.test(lesson.title), `Lesson title "${lesson.title}" contains emoji`).toBe(
          false,
        );
        for (const sec of lesson.sections) {
          expect(
            emojiRegex.test(sec.heading),
            `Section heading "${sec.heading}" contains emoji`,
          ).toBe(false);
          expect(
            emojiRegex.test(sec.markdown),
            `Section markdown in "${lesson.slug}" contains emoji`,
          ).toBe(false);
        }
        for (const q of lesson.quiz) {
          expect(emojiRegex.test(q.prompt), `Quiz prompt in "${lesson.slug}" contains emoji`).toBe(
            false,
          );
        }
      }
    });

    it("contains zero emojis across all problem statements and hints", () => {
      for (const prob of problems) {
        expect(emojiRegex.test(prob.title), `Problem title "${prob.title}" contains emoji`).toBe(
          false,
        );
        expect(
          emojiRegex.test(prob.statementMarkdown),
          `Statement in "${prob.slug}" contains emoji`,
        ).toBe(false);
        for (const h of prob.hints) {
          expect(emojiRegex.test(h), `Hint in "${prob.slug}" contains emoji`).toBe(false);
        }
      }
    });
  });
});
