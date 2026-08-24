import { expect, test } from "@playwright/test";
import { algorithms } from "../src/data/algorithms";
import { problems } from "../src/data/problems";
import { getModule, getModuleForProblem } from "../src/engine/registry";
import type { AlgorithmModule } from "../src/engine/types";

/** Temporary: capture one mid-run frame per searching card as visual proof. */

const searchingSlugs = new Set(
  algorithms.filter((a) => a.category === "searching").map((a) => a.slug),
);

const cards: { id: string; url: string; module: AlgorithmModule }[] = [
  ...algorithms
    .filter((a) => searchingSlugs.has(a.slug))
    .map((a) => ({ id: a.slug, url: `/algorithms/${a.slug}`, module: getModule(a.slug)! })),
  ...problems
    .filter((p) => searchingSlugs.has(p.algorithmSlug))
    .map((p) => ({
      id: p.slug,
      url: `/algorithms/${p.algorithmSlug}?problem=${p.slug}`,
      module: getModuleForProblem(p.slug) ?? getModule(p.algorithmSlug)!,
    })),
];

for (const card of cards) {
  test(`shot ${card.id}`, async ({ page }) => {
    const parsed = card.module.validate(card.module.presets[0]!.values);
    if (!parsed.ok) throw new Error(parsed.error);
    const total = card.module.run(parsed.parsed).steps.length;

    await page.goto(card.url);
    await expect(page.locator('svg[role="img"]').first()).toBeVisible({ timeout: 30_000 });

    /* Halfway through: far enough in that ruled-out halves, the probe and the
       surviving window are all on screen at once. */
    const target = Math.floor(total / 2);
    for (let i = 0; i < target; i += 1) await page.click('button[aria-label="Next step (→)"]');
    await expect(page.getByText(`step ${target + 1} / ${total}`)).toBeVisible();
    await page.waitForTimeout(600);

    await page.screenshot({ path: `test-results/shots/${card.id}.png` });
  });
}
