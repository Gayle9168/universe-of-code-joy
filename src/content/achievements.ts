import { achievements, getAchievement as getAchievementFromData } from "@/data/achievements";
import type { Achievement } from "@/data/types";

import { getContentClient } from "./client";

export { achievements };

/**
 * Synchronous content accessor for an achievement badge by its ID.
 */
export function getAchievement(id: string): Achievement | undefined {
  return getAchievementFromData(id);
}

/**
 * Synchronous content accessor for all achievement badges.
 */
export function getAchievements(): Achievement[] {
  return achievements;
}

/**
 * Synchronous accessor for achievements filtered by tier.
 */
export function getAchievementsByTier(tier: Achievement["tier"]): Achievement[] {
  return achievements.filter((a) => a.tier === tier);
}

/**
 * Asynchronous content accessor for an achievement badge (Seam 1 / S10.2).
 */
export async function fetchAchievement(id: string): Promise<Achievement | null> {
  return getContentClient().getAchievement(id);
}

/**
 * Asynchronous content accessor for all achievement badges.
 */
export async function fetchAchievements(): Promise<Achievement[]> {
  return getContentClient().getAchievements();
}

/**
 * Asynchronous content accessor for achievements filtered by tier.
 */
export async function fetchAchievementsByTier(tier: Achievement["tier"]): Promise<Achievement[]> {
  return getContentClient().getAchievementsByTier(tier);
}
