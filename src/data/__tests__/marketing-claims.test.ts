import { describe, expect, it } from "vitest";
import {
  MARKETING_CLAIMS,
  getAllMarketingClaims,
  getUnverifiedMarketingClaims,
  getSubstantiatedMarketingClaims,
  isClaimsRegistryAudited,
  getClaimsAuditLog,
  getMarketingClaim,
  heroProofStats,
  authHeroStats,
  campusHeroStats,
  campusOutcomesStats,
  campusTestimonialClaim,
  campusCohortDemoClaim,
  blogNewsletterClaim,
  pricingCatalogClaim,
  universitySocialProofClaim,
} from "@/data/marketing-claims";
import type { MetricMarketingClaim } from "@/data/marketing-claims";

describe("marketing claims registry & audit (S10.3 / S10.4 — G10 Content Integrity)", () => {
  it("substantiates 100% of marketing claims with empirical evidence and zero unverified claims", () => {
    const allClaims = getAllMarketingClaims();
    expect(allClaims.length).toBeGreaterThanOrEqual(12);

    for (const claim of allClaims) {
      expect(claim.status).toBe("SUBSTANTIATED");
      expect(claim.id).toBeTruthy();
      expect(claim.flagReason.trim().length).toBeGreaterThan(15);
      expect(claim.targetResolution.trim().length).toBeGreaterThan(15);
      expect(claim.evidence.trim().length).toBeGreaterThan(15);
      expect(claim.substantiationMethod.trim().length).toBeGreaterThan(10);
      expect(claim.reviewedBy.trim().length).toBeGreaterThan(3);
      expect(claim.reviewedAt.trim().length).toBeGreaterThan(5);
      expect(claim.surfaces.length).toBeGreaterThanOrEqual(1);

      // Verify each surface begins with a root '/'
      for (const surface of claim.surfaces) {
        expect(surface.startsWith("/")).toBe(true);
      }
    }
  });

  it("returns 0 unverified claims through getUnverifiedMarketingClaims()", () => {
    const unverified = getUnverifiedMarketingClaims();
    expect(unverified).toEqual([]);
    expect(unverified.length).toBe(0);
  });

  it("returns all substantiated claims through getSubstantiatedMarketingClaims()", () => {
    const substantiated = getSubstantiatedMarketingClaims();
    const all = getAllMarketingClaims();
    expect(substantiated.length).toBe(all.length);
  });

  it("confirms complete formal audit sign-off via isClaimsRegistryAudited() and getClaimsAuditLog()", () => {
    expect(isClaimsRegistryAudited()).toBe(true);

    const auditLog = getClaimsAuditLog();
    expect(auditLog.reviewedBy).toBe("Algora Content Integrity & Legal Audit Team");
    expect(auditLog.criterion).toContain("S10.4");
    expect(auditLog.unverifiedCount).toBe(0);
    expect(auditLog.substantiatedCount).toBe(auditLog.totalClaimsCount);

    // The log is itself a public claim about the registry, so tie it to the
    // registry rather than to a floor. A new claim that leaves the counts
    // behind is exactly the drift this file exists to prevent.
    const all = getAllMarketingClaims();
    expect(auditLog.totalClaimsCount).toBe(all.length);
    expect(auditLog.substantiatedCount).toBe(
      all.filter((c) => c.status === "SUBSTANTIATED").length,
    );
    expect(auditLog.unverifiedCount).toBe(all.filter((c) => c.status === "UNVERIFIED").length);
  });

  it("retrieves individual substantiated claims by ID or throws on missing ID", () => {
    const claim = getMarketingClaim<MetricMarketingClaim>("hero-learners");
    expect(claim.id).toBe("hero-learners");
    expect(claim.value).toBe("100%");
    expect(claim.label).toBe("in-browser");
    expect(claim.rawText).toBe("100% in-browser");
    expect(claim.status).toBe("SUBSTANTIATED");
    expect(claim.evidence).toContain("Pure client-side Web Worker runner architecture");

    expect(() => getMarketingClaim("non-existent-claim")).toThrow(
      'Marketing claim with id "non-existent-claim" not found in registry.',
    );
  });

  it("exports properly structured substantiated grouped constants for page consumption", () => {
    expect(heroProofStats.map((s) => s.rawText)).toEqual([
      "100% in-browser",
      "30+ lessons",
      "60fps animation",
    ]);
    expect(authHeroStats.map((s) => s.value)).toEqual(["100%", "30+", "60fps"]);

    expect(campusHeroStats.map((s) => s.rawText)).toEqual([
      "CS1 & CS2 syllabus ready",
      "Unlimited cohort seats",
    ]);

    expect(campusOutcomesStats.map((s) => ({ v: s.value, c: s.label }))).toEqual([
      { v: "3-way", c: "synchronized code, canvas & explanation" },
      { v: "0ms", c: "local sandbox runner latency" },
      { v: "100%", c: "browser-based with zero install" },
    ]);

    expect(campusTestimonialClaim.author).toBe("Algora Curriculum Architecture");
    expect(campusTestimonialClaim.role).toBe("Pedagogy & Visual Systems");
    expect(campusTestimonialClaim.initials).toBe("CA");
    expect(campusTestimonialClaim.status).toBe("SUBSTANTIATED");

    expect(campusCohortDemoClaim.courseCode).toBe("CS 2110");
    expect(campusCohortDemoClaim.term).toBe("Sample Dashboard");
    expect(campusCohortDemoClaim.roster.length).toBe(5);

    expect(blogNewsletterClaim.rawText).toBe(
      "Get algorithm breakdowns & visual guides. Unsubscribe anytime.",
    );
    expect(pricingCatalogClaim.rawText).toBe("Complete algorithm catalog & visualizers");
    expect(universitySocialProofClaim.label).toBe("Designed for standard CS curricula at");
    expect(universitySocialProofClaim.institutions.length).toBe(5);
  });
});
