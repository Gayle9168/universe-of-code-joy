import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  collapseDuration,
  getScrollBehavior,
  getTransitionConfig,
  isReducedMotionActive,
} from "../motion";
import { createPlayerStore } from "@/stores/playerStore";

describe("Criterion S7.7 — prefers-reduced-motion full enforcement", () => {
  describe("Pure domain motion logic (src/lib/motion.ts)", () => {
    it("correctly identifies reduced motion when store preference or media query is active", () => {
      expect(isReducedMotionActive(false, false)).toBe(false);
      expect(isReducedMotionActive(true, false)).toBe(true);
      expect(isReducedMotionActive(false, true)).toBe(true);
      expect(isReducedMotionActive(true, true)).toBe(true);
    });

    it("collapses transition duration to 0s under reduced motion", () => {
      const normal = getTransitionConfig(false, 0.35);
      expect(normal.duration).toBe(0.35);
      expect(normal.ease).toBeDefined();

      const reduced = getTransitionConfig(true, 0.35);
      expect(reduced.duration).toBe(0);
      expect(reduced.ease).toBeUndefined();
    });

    it("returns auto scroll behavior for instant jump under reduced motion", () => {
      expect(getScrollBehavior(false)).toBe("smooth");
      expect(getScrollBehavior(true)).toBe("auto");
    });

    it("collapses duration milliseconds to 0ms under reduced motion", () => {
      expect(collapseDuration(500, false)).toBe(500);
      expect(collapseDuration(500, true)).toBe(0);
      expect(collapseDuration(0, false)).toBe(0);
    });
  });

  describe("CSS Stylesheet Audit (src/styles.css)", () => {
    const stylesPath = path.resolve(process.cwd(), "src/styles.css");
    const stylesContent = fs.readFileSync(stylesPath, "utf-8");

    it("contains @media (prefers-reduced-motion: reduce) rule", () => {
      expect(stylesContent).toContain("@media (prefers-reduced-motion: reduce)");
    });

    it("collapses animation and transition durations to 0.01ms in media query", () => {
      expect(stylesContent).toContain("animation-duration: 0.01ms !important;");
      expect(stylesContent).toContain("transition-duration: 0.01ms !important;");
    });

    it("collapses animation and transition delays to 0ms in media query", () => {
      expect(stylesContent).toContain("animation-delay: 0ms !important;");
      expect(stylesContent).toContain("transition-delay: 0ms !important;");
    });

    it("zeroes motion duration tokens under reduced motion", () => {
      expect(stylesContent).toContain("--duration-fast-token: 0ms !important;");
      expect(stylesContent).toContain("--duration-base-token: 0ms !important;");
      expect(stylesContent).toContain("--duration-slow-token: 0ms !important;");
    });

    it("collapses scroll-behavior to auto", () => {
      expect(stylesContent).toContain("scroll-behavior: auto !important;");
    });

    it('supports html[data-reduced-motion="true"] for runtime preference syncing', () => {
      expect(stylesContent).toContain('html[data-reduced-motion="true"]');
    });
  });

  describe("Player stepping integrity under reduced motion", () => {
    it("allows stepping (next, prev, seek, milestones, first, last) to execute cleanly", () => {
      const store = createPlayerStore();
      store.getState().load("binary-search");

      const run = store.getState().run;
      expect(run).toBeDefined();
      const total = run!.steps.length;
      expect(total).toBeGreaterThan(5);

      // Start at 0
      expect(store.getState().index).toBe(0);

      // Step next
      store.getState().next();
      expect(store.getState().index).toBe(1);

      // Step milestone
      store.getState().stepToNextMilestone();
      expect(store.getState().index).toBeGreaterThan(1);

      // Step previous
      const current = store.getState().index;
      store.getState().prev();
      expect(store.getState().index).toBe(current - 1);

      // Seek
      store.getState().seek(4);
      expect(store.getState().index).toBe(4);

      // Last
      store.getState().last();
      expect(store.getState().index).toBe(total - 1);

      // First
      store.getState().first();
      expect(store.getState().index).toBe(0);

      // Reset
      store.getState().seek(3);
      store.getState().reset();
      expect(store.getState().index).toBe(0);
      expect(store.getState().isPlaying).toBe(false);
    });
  });
});
