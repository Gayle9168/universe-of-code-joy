import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { contrastRatio } from "../contrast";

describe("Visible Pale-Teal Focus Rings (Criterion S7.4 & WCAG 2.1 AA SC 1.4.11)", () => {
  describe("Focus ring non-text contrast mathematics", () => {
    const PRIMARY_TEAL = "#0e9c86";
    const PAPER_BG = "#f7f9f8";
    const CARD_BG = "#ffffff";
    const INK_TEXT = "#0e1513";
    const PALE_TEAL_TINT = "#e6f5f2";

    it("ensures primary teal focus ring achieves >= 3.0:1 non-text contrast on --paper background", () => {
      const ratio = contrastRatio(PRIMARY_TEAL, PAPER_BG);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      expect(ratio).toBeCloseTo(3.25, 2);
    });

    it("ensures primary teal focus ring achieves >= 3.0:1 non-text contrast on --card (white) surface", () => {
      const ratio = contrastRatio(PRIMARY_TEAL, CARD_BG);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      expect(ratio).toBeCloseTo(3.43, 2);
    });

    it("ensures pale-teal tint token is distinct from dark ink foreground", () => {
      const ratio = contrastRatio(INK_TEXT, PALE_TEAL_TINT);
      expect(ratio).toBeGreaterThanOrEqual(10.0);
    });
  });

  describe("Design system & CSS token verification in styles.css", () => {
    const stylesPath = path.resolve(process.cwd(), "src/styles.css");
    const stylesContent = fs.readFileSync(stylesPath, "utf-8");

    it("defines focus ring design tokens in @theme inline and :root", () => {
      expect(stylesContent).toContain("--color-focus-ring: var(--primary)");
      expect(stylesContent).toContain("--color-focus-halo: var(--tint)");
      expect(stylesContent).toContain("--focus-ring: var(--primary)");
      expect(stylesContent).toContain("--focus-halo: var(--tint)");
    });

    it("defines global :focus-visible rules with primary outline and pale-teal halo in @layer base", () => {
      expect(stylesContent).toContain(":focus-visible {");
      expect(stylesContent).toContain("outline: 2px solid var(--primary)");
      expect(stylesContent).toContain("box-shadow: 0 0 0 4px var(--tint)");
    });

    it("defines specialized form input focus-visible rules in @layer base", () => {
      expect(stylesContent).toContain("input:focus-visible");
      expect(stylesContent).toContain("textarea:focus-visible");
      expect(stylesContent).toContain("select:focus-visible");
    });

    it("provides a reusable @utility focus-ring class", () => {
      expect(stylesContent).toContain("@utility focus-ring {");
    });
  });

  describe("Interactive primitive focus ring contracts", () => {
    it("verifies StepScrubber slider includes keyboard focus ring styles", () => {
      const scrubberPath = path.resolve(process.cwd(), "src/components/player/StepScrubber.tsx");
      const content = fs.readFileSync(scrubberPath, "utf-8");
      expect(content).toContain("focus-visible:ring-2");
      expect(content).toContain("focus-visible:ring-primary/30");
    });

    it("verifies Button component includes pale-teal focus ring styles", () => {
      const btnPath = path.resolve(process.cwd(), "src/components/ui/button.tsx");
      const content = fs.readFileSync(btnPath, "utf-8");
      expect(content).toContain("focus-visible:ring-2");
      expect(content).toContain("focus-visible:ring-primary/30");
    });

    it("verifies Input and Textarea components include pale-teal focus halo styles", () => {
      const inputPath = path.resolve(process.cwd(), "src/components/ui/input.tsx");
      const inputContent = fs.readFileSync(inputPath, "utf-8");
      expect(inputContent).toContain("focus-visible:border-primary");
      expect(inputContent).toContain("focus-visible:ring-primary/15");

      const textareaPath = path.resolve(process.cwd(), "src/components/ui/textarea.tsx");
      const textareaContent = fs.readFileSync(textareaPath, "utf-8");
      expect(textareaContent).toContain("focus-visible:border-primary");
      expect(textareaContent).toContain("focus-visible:ring-primary/15");
    });

    it("verifies Slider, Checkbox, and Switch components include pale-teal focus ring styles", () => {
      const sliderPath = path.resolve(process.cwd(), "src/components/ui/slider.tsx");
      const sliderContent = fs.readFileSync(sliderPath, "utf-8");
      expect(sliderContent).toContain("focus-visible:ring-2");
      expect(sliderContent).toContain("focus-visible:ring-primary/30");

      const checkPath = path.resolve(process.cwd(), "src/components/ui/checkbox.tsx");
      const checkContent = fs.readFileSync(checkPath, "utf-8");
      expect(checkContent).toContain("focus-visible:ring-2");
      expect(checkContent).toContain("focus-visible:ring-primary/30");

      const switchPath = path.resolve(process.cwd(), "src/components/ui/switch.tsx");
      const switchContent = fs.readFileSync(switchPath, "utf-8");
      expect(switchContent).toContain("focus-visible:ring-2");
      expect(switchContent).toContain("focus-visible:ring-primary/30");
    });
  });
});
