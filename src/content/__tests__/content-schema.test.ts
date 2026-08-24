import { describe, it, expect } from "vitest";
import { algorithms, CATEGORY_META } from "@/data/algorithms";
import { lessons } from "@/data/lessons";
import { problems } from "@/data/problems";
import { paths } from "@/data/paths";
import { achievements } from "@/data/achievements";
import { quests } from "@/data/quests";
import { MARKETING_CLAIMS } from "@/data/marketing-claims";
import { demoLearner } from "@/content/demo-learner";
import {
  AlgorithmSchema,
  LessonSchema,
  ProblemSchema,
  PathSchema,
  AchievementSchema,
  QuestSchema,
  MarketingClaimSchema,
  DemoLearnerSchema,
  CategoryMetaSchema,
  validateCatalog,
  assertValidContent,
  validateAlgorithm,
  validateLesson,
  validateProblem,
  validatePath,
  validateAchievement,
  validateQuest,
  validateMarketingClaim,
  ContentValidationError,
  type ContentCatalog,
} from "../schemas";
import { runContentValidation } from "../validate-cli";

describe("Content Schemas & Validation (S10.6)", () => {
  const fullCatalog: ContentCatalog = {
    algorithms,
    lessons,
    problems,
    paths,
    achievements,
    quests,
    marketingClaims: Object.values(MARKETING_CLAIMS),
    categoryMeta: CATEGORY_META,
    demoLearner,
  };

  describe("100% Production Data Validation", () => {
    it("validates all algorithms against AlgorithmSchema", () => {
      expect(algorithms.length).toBeGreaterThanOrEqual(12);
      for (const algo of algorithms) {
        const result = AlgorithmSchema.safeParse(algo);
        expect(
          result.success,
          `Algorithm "${algo.slug}" failed validation: ${JSON.stringify(result.error?.issues)}`,
        ).toBe(true);
      }
    });

    it("validates all lessons against LessonSchema", () => {
      expect(lessons.length).toBe(30);
      for (const lesson of lessons) {
        const result = LessonSchema.safeParse(lesson);
        expect(
          result.success,
          `Lesson "${lesson.slug}" failed validation: ${JSON.stringify(result.error?.issues)}`,
        ).toBe(true);
      }
    });

    it("validates all problems against ProblemSchema", () => {
      expect(problems.length).toBeGreaterThanOrEqual(40);
      for (const prob of problems) {
        const result = ProblemSchema.safeParse(prob);
        expect(
          result.success,
          `Problem "${prob.slug}" failed validation: ${JSON.stringify(result.error?.issues)}`,
        ).toBe(true);
      }
    });

    it("validates all paths against PathSchema", () => {
      expect(paths.length).toBeGreaterThanOrEqual(2);
      for (const path of paths) {
        const result = PathSchema.safeParse(path);
        expect(
          result.success,
          `Path "${path.slug}" failed validation: ${JSON.stringify(result.error?.issues)}`,
        ).toBe(true);
      }
    });

    it("validates all achievements against AchievementSchema", () => {
      expect(achievements.length).toBeGreaterThanOrEqual(20);
      for (const ach of achievements) {
        const result = AchievementSchema.safeParse(ach);
        expect(
          result.success,
          `Achievement "${ach.id}" failed validation: ${JSON.stringify(result.error?.issues)}`,
        ).toBe(true);
      }
    });

    it("validates all quests against QuestSchema", () => {
      expect(quests.length).toBeGreaterThanOrEqual(10);
      for (const quest of quests) {
        const result = QuestSchema.safeParse(quest);
        expect(
          result.success,
          `Quest "${quest.id}" failed validation: ${JSON.stringify(result.error?.issues)}`,
        ).toBe(true);
      }
    });

    it("validates all marketing claims against MarketingClaimSchema", () => {
      const claims = Object.values(MARKETING_CLAIMS);
      expect(claims.length).toBeGreaterThanOrEqual(10);
      for (const claim of claims) {
        const result = MarketingClaimSchema.safeParse(claim);
        expect(
          result.success,
          `Marketing claim "${claim.id}" failed validation: ${JSON.stringify(result.error?.issues)}`,
        ).toBe(true);
      }
    });

    it("validates demoLearner against DemoLearnerSchema", () => {
      const result = DemoLearnerSchema.safeParse(demoLearner);
      expect(result.success).toBe(true);
    });

    it("validates CATEGORY_META against CategoryMetaSchema", () => {
      const result = CategoryMetaSchema.safeParse(CATEGORY_META);
      expect(result.success).toBe(true);
    });

    it("validates full catalog with validateCatalog and assertValidContent with 0 errors", () => {
      const result = validateCatalog(fullCatalog);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.counts.algorithms).toBe(algorithms.length);
      expect(result.counts.lessons).toBe(lessons.length);
      expect(result.counts.problems).toBe(problems.length);

      expect(() => assertValidContent(fullCatalog)).not.toThrow();
    });

    it("runs validate-cli runContentValidation() successfully returning true", () => {
      const success = runContentValidation();
      expect(success).toBe(true);
    });
  });

  describe("Referential Integrity Enforcements", () => {
    it("ensures every lesson.algorithmSlug references a real algorithm", () => {
      const algoSlugs = new Set(algorithms.map((a) => a.slug));
      for (const lesson of lessons) {
        expect(
          algoSlugs.has(lesson.algorithmSlug),
          `Lesson "${lesson.slug}" references nonexistent algorithm "${lesson.algorithmSlug}"`,
        ).toBe(true);
      }
    });

    it("ensures every problem.algorithmSlug references a real algorithm", () => {
      const algoSlugs = new Set(algorithms.map((a) => a.slug));
      for (const prob of problems) {
        expect(
          algoSlugs.has(prob.algorithmSlug),
          `Problem "${prob.slug}" references nonexistent algorithm "${prob.algorithmSlug}"`,
        ).toBe(true);
      }
    });

    it("ensures every path module itemSlug references a real algorithm, problem, or lesson", () => {
      const validSlugs = new Set([
        ...algorithms.map((a) => a.slug),
        ...problems.map((p) => p.slug),
        ...lessons.map((l) => l.slug),
      ]);
      for (const path of paths) {
        for (const mod of path.modules) {
          for (const itemSlug of mod.itemSlugs) {
            expect(
              validSlugs.has(itemSlug),
              `Path "${path.slug}" module "${mod.title}" has unknown slug "${itemSlug}"`,
            ).toBe(true);
          }
        }
      }
    });

    it("ensures every algorithm prerequisite references an existing algorithm", () => {
      const algoSlugs = new Set(algorithms.map((a) => a.slug));
      for (const algo of algorithms) {
        for (const prereq of algo.prerequisites) {
          expect(
            algoSlugs.has(prereq),
            `Algorithm "${algo.slug}" has unknown prerequisite "${prereq}"`,
          ).toBe(true);
        }
      }
    });

    it("flags foreign key violation when lesson references non-existent algorithmSlug in validateCatalog", () => {
      const brokenCatalog: ContentCatalog = {
        ...fullCatalog,
        lessons: [
          ...lessons,
          {
            slug: "orphan-lesson",
            algorithmSlug: "nonexistent-algo-slug",
            title: "Orphan Lesson",
            estMinutes: 10,
            xp: 50,
            sections: [{ id: "s1", heading: "Intro", markdown: "Content" }],
            quiz: [],
          },
        ],
      };

      const result = validateCatalog(brokenCatalog);
      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) => e.fieldPath === "algorithmSlug" && e.message.includes("nonexistent-algo-slug"),
        ),
      ).toBe(true);
    });

    it("flags foreign key violation when problem references non-existent algorithmSlug in validateCatalog", () => {
      const brokenCatalog: ContentCatalog = {
        ...fullCatalog,
        problems: [
          ...problems,
          {
            slug: "orphan-problem",
            algorithmSlug: "phantom-algo",
            title: "Orphan Problem",
            difficulty: "easy",
            statementMarkdown: "Solve it",
            constraints: ["1 <= n"],
            examples: [{ input: "1", output: "1" }],
            starterCode: { js: "code", ts: "code", py: "code" },
            tests: [],
            hints: ["Hint"],
            xp: 50,
          },
        ],
      };

      const result = validateCatalog(brokenCatalog);
      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) => e.fieldPath === "algorithmSlug" && e.message.includes("phantom-algo"),
        ),
      ).toBe(true);
    });

    it("flags duplicate algorithm slug in validateCatalog", () => {
      const brokenCatalog: ContentCatalog = {
        ...fullCatalog,
        algorithms: [...algorithms, { ...algorithms[0] }],
      };

      const result = validateCatalog(brokenCatalog);
      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) => e.fieldPath === "slug" && e.message.includes("Duplicate algorithm slug"),
        ),
      ).toBe(true);
    });

    it("flags duplicate lesson slug in validateCatalog", () => {
      const brokenCatalog: ContentCatalog = {
        ...fullCatalog,
        lessons: [...lessons, { ...lessons[0] }],
      };

      const result = validateCatalog(brokenCatalog);
      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) => e.fieldPath === "slug" && e.message.includes("Duplicate lesson slug"),
        ),
      ).toBe(true);
    });
  });

  describe("Negative Edge Cases & Schema Rejection", () => {
    it("rejects algorithms with invalid slug formatting (uppercase, spaces, special chars)", () => {
      const invalidSlugs = ["BinarySearch", "binary search", "binary_search", "binary--search", ""];
      for (const slug of invalidSlugs) {
        const res = AlgorithmSchema.safeParse({ ...algorithms[0], slug });
        expect(res.success, `Slug "${slug}" should have failed validation`).toBe(false);
      }
    });

    it("rejects algorithms with negative or zero XP or minutes", () => {
      const negXp = AlgorithmSchema.safeParse({ ...algorithms[0], xp: -50 });
      expect(negXp.success).toBe(false);

      const zeroXp = AlgorithmSchema.safeParse({ ...algorithms[0], xp: 0 });
      expect(zeroXp.success).toBe(false);

      const negMin = AlgorithmSchema.safeParse({ ...algorithms[0], estMinutes: -10 });
      expect(negMin.success).toBe(false);
    });

    it("rejects algorithms with invalid category, difficulty, or vizKind", () => {
      const badCat = AlgorithmSchema.safeParse({ ...algorithms[0], category: "quantum-computing" });
      expect(badCat.success).toBe(false);

      const badDiff = AlgorithmSchema.safeParse({ ...algorithms[0], difficulty: "nightmare" });
      expect(badDiff.success).toBe(false);

      const badViz = AlgorithmSchema.safeParse({ ...algorithms[0], vizKind: "hypercube" });
      expect(badViz.success).toBe(false);
    });

    it("accepts problems with the optional oneLiner and estMinutes present or absent", () => {
      const base = problems[0]!;

      const withBoth = ProblemSchema.safeParse({
        ...base,
        oneLiner: "Find two sorted numbers that sum to a target.",
        estMinutes: 15,
      });
      expect(withBoth.success).toBe(true);

      // Every shipped problem omits both fields today; omission must stay valid.
      const omitted = ProblemSchema.safeParse(base);
      expect(omitted.success).toBe(true);

      const explicitUndefined = ProblemSchema.safeParse({
        ...base,
        oneLiner: undefined,
        estMinutes: undefined,
      });
      expect(explicitUndefined.success).toBe(true);
    });

    it("rejects problems whose optional oneLiner or estMinutes are present but invalid", () => {
      const base = problems[0]!;

      expect(ProblemSchema.safeParse({ ...base, oneLiner: "" }).success).toBe(false);
      expect(ProblemSchema.safeParse({ ...base, estMinutes: 0 }).success).toBe(false);
      expect(ProblemSchema.safeParse({ ...base, estMinutes: -5 }).success).toBe(false);
      expect(ProblemSchema.safeParse({ ...base, estMinutes: 12.5 }).success).toBe(false);
      expect(ProblemSchema.safeParse({ ...base, estMinutes: "20" }).success).toBe(false);
    });

    it("rejects lessons with empty sections", () => {
      const res = LessonSchema.safeParse({
        ...lessons[0],
        sections: [],
      });
      expect(res.success).toBe(false);
    });

    it("rejects quiz questions with fewer than 2 options", () => {
      const res = LessonSchema.safeParse({
        ...lessons[0],
        quiz: [
          {
            id: "q1",
            kind: "mcq",
            prompt: "Question?",
            options: ["Single Option"],
            answerIndex: 0,
            explanation: "Because",
          },
        ],
      });
      expect(res.success).toBe(false);
    });

    it("rejects quiz questions where answerIndex is out of range of options", () => {
      const res = LessonSchema.safeParse({
        ...lessons[0],
        quiz: [
          {
            id: "q1",
            kind: "mcq",
            prompt: "Question?",
            options: ["A", "B", "C"],
            answerIndex: 4, // Out of bounds!
            explanation: "Invalid index",
          },
        ],
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues.some((i) => i.message.includes("answerIndex"))).toBe(true);
      }
    });

    it("rejects quiz questions where array answerIndex contains an out of bounds index", () => {
      const res = LessonSchema.safeParse({
        ...lessons[0],
        quiz: [
          {
            id: "q1",
            kind: "order-steps",
            prompt: "Order steps:",
            options: ["Step 1", "Step 2", "Step 3"],
            answerIndex: [0, 1, 9], // 9 is out of bounds!
            explanation: "Invalid array index",
          },
        ],
      });
      expect(res.success).toBe(false);
    });

    it("rejects problems with missing starter code languages", () => {
      const res = ProblemSchema.safeParse({
        ...problems[0],
        starterCode: { js: "function() {}" }, // missing ts and py!
      });
      expect(res.success).toBe(false);
    });

    it("rejects achievements with invalid tier", () => {
      const res = AchievementSchema.safeParse({
        ...achievements[0],
        tier: "mythic",
      });
      expect(res.success).toBe(false);
    });

    it("rejects quests with non-positive target or invalid kind", () => {
      const badTarget = QuestSchema.safeParse({
        ...quests[0],
        target: 0,
      });
      expect(badTarget.success).toBe(false);

      const badKind = QuestSchema.safeParse({
        ...quests[0],
        kind: "annual",
      });
      expect(badKind.success).toBe(false);
    });

    it("throws ContentValidationError on assertValidContent with detailed breakdown", () => {
      const corruptCatalog: ContentCatalog = {
        algorithms: [{ ...algorithms[0], xp: -100 }],
        lessons: [],
        problems: [],
        paths: [],
        achievements: [],
        quests: [],
      };

      expect(() => assertValidContent(corruptCatalog)).toThrowError(ContentValidationError);
      try {
        assertValidContent(corruptCatalog);
      } catch (e) {
        const err = e as ContentValidationError;
        expect(err.details.length).toBeGreaterThan(0);
        expect(err.details[0].entityType).toBe("Algorithm");
        expect(err.details[0].fieldPath).toBe("xp");
      }
    });
  });

  describe("Helper Validators", () => {
    it("validates individual entities via helper functions", () => {
      expect(validateAlgorithm(algorithms[0]).success).toBe(true);
      expect(validateLesson(lessons[0]).success).toBe(true);
      expect(validateProblem(problems[0]).success).toBe(true);
      expect(validatePath(paths[0]).success).toBe(true);
      expect(validateAchievement(achievements[0]).success).toBe(true);
      expect(validateQuest(quests[0]).success).toBe(true);
      expect(validateMarketingClaim(Object.values(MARKETING_CLAIMS)[0]).success).toBe(true);

      expect(validateAlgorithm({}).success).toBe(false);
      expect(validateLesson({}).success).toBe(false);
      expect(validateProblem({}).success).toBe(false);
      expect(validatePath({}).success).toBe(false);
      expect(validateAchievement({}).success).toBe(false);
      expect(validateQuest({}).success).toBe(false);
      expect(validateMarketingClaim({}).success).toBe(false);
    });
  });
});
