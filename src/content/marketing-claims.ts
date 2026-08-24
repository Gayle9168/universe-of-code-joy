import type { MarketingClaim } from "@/data/marketing-claims";
import { getContentClient } from "./client";

export * from "../data/marketing-claims";

/**
 * Asynchronous content accessor for a marketing claim by ID (Seam 1 / S10.2).
 */
export async function fetchMarketingClaim<T extends MarketingClaim = MarketingClaim>(
  id: string,
): Promise<T | null> {
  return getContentClient().getMarketingClaim<T>(id);
}

/**
 * Asynchronous content accessor for all marketing claims.
 */
export async function fetchMarketingClaims(): Promise<MarketingClaim[]> {
  return getContentClient().getMarketingClaims();
}
