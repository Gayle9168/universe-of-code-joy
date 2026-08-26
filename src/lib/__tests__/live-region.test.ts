import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Live region announcements with aria-atomic (Criterion S7.5)", () => {
  describe("ExplainPane accessibility contracts", () => {
    const panelsPath = path.resolve(process.cwd(), "src/components/player/WorkspacePanels.tsx");
    const panelsContent = fs.readFileSync(panelsPath, "utf-8");

    it("verifies ExplainPane defines aria-live='polite' and aria-atomic='true' on empty state", () => {
      expect(panelsContent).toContain('aria-live="polite" aria-atomic="true"');
      expect(panelsContent).toContain("Run the algorithm to see the explanation.");
    });

    it("keeps the reasoning body a scrollable flex child (spacing may be tuned)", () => {
      // Asserts structure, not exact spacing utilities, so layout polish does
      // not require a test edit while the scroll container stays guaranteed.
      expect(panelsContent).toMatch(/ref=\{bodyRef\}[\s\S]{0,160}min-h-0 flex-1/);
      expect(panelsContent).toMatch(/ref=\{bodyRef\}[\s\S]{0,160}overflow-y-auto/);
    });

    it("verifies VisualStage provides an accessible polite live region for cross-tab announcements", () => {
      expect(panelsContent).toContain(
        '<div className="sr-only" aria-live="polite" aria-atomic="true">',
      );
    });
  });

  describe("StepCounter accessibility contracts", () => {
    const counterPath = path.resolve(process.cwd(), "src/components/player/StepCounter.tsx");
    const counterContent = fs.readFileSync(counterPath, "utf-8");

    it("verifies StepCounter defines both aria-live='polite' and aria-atomic='true'", () => {
      expect(counterContent).toContain('aria-live="polite"');
      expect(counterContent).toContain('aria-atomic="true"');
    });
  });
});
