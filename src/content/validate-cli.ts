/**
 * Algora — Build-Time Content Schema Validation & First Content Slice Audit CLI
 *
 * SPECIFICATION REFERENCES:
 * - S10.6 & Gate G10: "Lesson content validates against its schema, and invalid content fails the build rather than rendering broken."
 * - S10.5: "The first content slice is actually complete to the frozen S0.11 scope."
 * - S0.11: "D-6 first content slice scoped and frozen. A written list: 1 path, ~12 algorithms, ~30 lessons, ~40 challenges."
 *
 * Invoked during `bun run validate:content`, `bun run build`, and `bun run verify`.
 */

import { algorithms, CATEGORY_META } from "@/data/algorithms";
import { lessons } from "@/data/lessons";
import { problems } from "@/data/problems";
import { paths } from "@/data/paths";
import { achievements } from "@/data/achievements";
import { quests } from "@/data/quests";
import { LEGAL_DOCUMENTS } from "@/data/legal";
import { MARKETING_CLAIMS } from "@/data/marketing-claims";
import { demoLearner } from "@/content/demo-learner";
import { validateCatalog, type ContentCatalog } from "./schemas";
import { auditFirstContentSlice } from "./first-slice";

export function runContentValidation(): boolean {
  console.log("🔍 Validating Algora content catalog against Zod schemas...");

  const catalog: ContentCatalog = {
    algorithms,
    lessons,
    problems,
    paths,
    achievements,
    quests,
    legalDocuments: Object.values(LEGAL_DOCUMENTS),
    marketingClaims: Object.values(MARKETING_CLAIMS),
    categoryMeta: CATEGORY_META,
    demoLearner,
  };

  // 1. Zod Schema & Referential Validation (S10.6)
  const result = validateCatalog(catalog);

  if (!result.success) {
    console.error(`\n❌ Content validation FAILED with ${result.errors.length} error(s):\n`);
    for (let i = 0; i < result.errors.length; i++) {
      const err = result.errors[i];
      console.error(
        `  ${i + 1}. [${err.entityType}:${err.idOrSlug}] ${err.fieldPath}: ${err.message}`,
      );
    }
    console.error("\nBuild aborted due to invalid content (S10.6).\n");
    return false;
  }

  // 2. First Content Slice Completeness Audit (S10.5 & S0.11)
  const sliceAudit = auditFirstContentSlice(catalog);

  if (!sliceAudit.complete) {
    console.error(
      `\n❌ First content slice completeness audit FAILED (Score: ${sliceAudit.scorePercent}%):\n`,
    );
    for (const err of sliceAudit.errors) {
      console.error(`  • ${err}`);
    }
    console.error("\nBuild aborted due to incomplete first content slice (S10.5).\n");
    return false;
  }

  console.log("✅ Content schema validation PASSED (S10.6):");
  console.log(`   • Algorithms:       ${result.counts.algorithms}`);
  console.log(`   • Lessons:          ${result.counts.lessons}`);
  console.log(`   • Problems:         ${result.counts.problems}`);
  console.log(`   • Paths:            ${result.counts.paths}`);
  console.log(`   • Achievements:     ${result.counts.achievements}`);
  console.log(`   • Quests:           ${result.counts.quests}`);
  console.log(`   • Legal Documents:  ${result.counts.legalDocuments} (Zero-placeholder verified)`);
  console.log(`   • Marketing Claims: ${result.counts.marketingClaims}`);
  console.log(`   • Referential Integrity: 100% Validated\n`);

  console.log("✅ First content slice completeness audit PASSED (S10.5 & S0.11):");
  console.log(`   • Flagship Path:    interview-prep (100% resolved)`);
  console.log(`   • Core Algorithms:  ${sliceAudit.counts.coreAlgorithms}/12 with Engine Modules`);
  console.log(`   • Catalog Track:    ${sliceAudit.counts.totalAlgorithms}/24 total algorithms`);
  console.log(`   • Lessons:          ${sliceAudit.counts.lessons}/30 lessons completed`);
  console.log(
    `   • Challenges:       ${sliceAudit.counts.problems}/40 coding challenges completed`,
  );
  console.log(`   • Slice Completeness Score: 100%\n`);

  return true;
}

// Direct CLI execution
if (import.meta.main || process.argv[1]?.endsWith("validate-cli.ts")) {
  const success = runContentValidation();
  if (!success) {
    process.exit(1);
  }
}
