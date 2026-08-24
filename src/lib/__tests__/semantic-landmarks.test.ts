import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Semantic Landmarks (S7.8)", () => {
  const readSrcFile = (relPath: string) => {
    const fullPath = path.resolve(__dirname, "../../..", relPath);
    return fs.readFileSync(fullPath, "utf-8");
  };

  describe("1. App Shell Landmarks (app-shell.tsx)", () => {
    const appShellCode = readSrcFile("src/components/app-shell.tsx");

    it('AppSidebar renders <aside aria-label="Sidebar"> and <nav aria-label="Main navigation">', () => {
      expect(appShellCode).toMatch(/<aside[^>]*aria-label="Sidebar"/);
      expect(appShellCode).toMatch(/<nav[^>]*aria-label="Main navigation"/);
    });

    it('AppTopBar renders <header> and search container with role="search"', () => {
      expect(appShellCode).toMatch(/<header[^>]*className="flex h-\[68px\]/);
      expect(appShellCode).toMatch(/<div[^>]*role="search"/);
    });

    it('AppWorkspaceBar renders <header>, <nav aria-label="Breadcrumbs">, and search container', () => {
      expect(appShellCode).toMatch(/<nav[^>]*aria-label="Breadcrumbs"/);
      expect(appShellCode).toMatch(/<header[^>]*className="flex h-\[68px\]/);
    });
  });

  describe("2. Site Chrome Landmarks (site-chrome.tsx)", () => {
    const siteChromeCode = readSrcFile("src/components/site-chrome.tsx");

    it('SiteNav renders <header> and <nav aria-label="Main">', () => {
      expect(siteChromeCode).toMatch(/<header/);
      expect(siteChromeCode).toMatch(/<nav[^>]*aria-label="Main"/);
    });

    it('SiteFooter renders <footer> and <nav aria-label="Footer navigation">', () => {
      expect(siteChromeCode).toMatch(/<footer/);
      expect(siteChromeCode).toMatch(/<nav[^>]*aria-label="Footer navigation"/);
    });
  });

  describe("3. Onboarding Chrome Landmarks (onboarding-chrome.tsx)", () => {
    const onboardingCode = readSrcFile("src/components/onboarding-chrome.tsx");

    it('OnboardingTopBar renders <header> and <nav aria-label="Onboarding progress">', () => {
      expect(onboardingCode).toMatch(/<header/);
      expect(onboardingCode).toMatch(/<nav[^>]*aria-label="Onboarding progress"/);
    });

    it('OnboardingTopBar associates active step with aria-current="step"', () => {
      expect(onboardingCode).toMatch(/aria-current=\{state === "active" \? "step" : undefined\}/);
    });

    it("OnboardingFooter renders <footer>", () => {
      expect(onboardingCode).toMatch(/<footer/);
    });
  });

  describe("4. Settings Nav Landmarks (settings-nav.tsx)", () => {
    const settingsNavCode = readSrcFile("src/components/settings-nav.tsx");

    it('SettingsNav renders <nav aria-label="Settings"> to differentiate from AppSidebar', () => {
      expect(settingsNavCode).toMatch(/<nav[^>]*aria-label="Settings"/);
    });
  });

  describe("5. Marketing & Public Pages Main Landmark Audit", () => {
    const publicRoutes = [
      "src/routes/index.tsx",
      "src/routes/pricing.tsx",
      "src/routes/paths.tsx",
      "src/routes/contact.tsx",
      "src/routes/campus.tsx",
      "src/routes/blog.tsx",
    ];

    publicRoutes.forEach((routePath) => {
      it(`${routePath} encapsulates page body in a <main> landmark`, () => {
        const content = readSrcFile(routePath);
        expect(content).toMatch(/<main/);
      });
    });
  });

  describe("6. App & Auth Routes Main Landmark Audit", () => {
    const appRoutes = [
      "src/routes/dashboard.tsx",
      "src/routes/explore.tsx",
      "src/routes/mastery-map.tsx",
      "src/routes/leagues.tsx",
      "src/routes/quests.tsx",
      "src/routes/review.tsx",
      "src/routes/achievements.tsx",
      "src/routes/notifications.tsx",
      "src/routes/settings.index.tsx",
      "src/routes/settings.billing.tsx",
      "src/routes/practice.$slug.tsx",
      "src/routes/practice.results.tsx",
      "src/routes/algorithms.$slug.tsx",
      "src/routes/login.tsx",
      "src/routes/auth.tsx",
      "src/routes/forgot-password.tsx",
      "src/routes/reset-password.tsx",
      "src/routes/verify-email.tsx",
      "src/routes/onboarding/goals.tsx",
      "src/routes/onboarding/assessment.tsx",
      "src/routes/onboarding/path.tsx",
    ];

    appRoutes.forEach((routePath) => {
      it(`${routePath} encapsulates content in a <main> landmark`, () => {
        const content = readSrcFile(routePath);
        expect(content).toMatch(/<main/);
      });
    });
  });
});
