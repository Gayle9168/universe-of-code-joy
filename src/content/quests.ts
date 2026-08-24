import { quests, getQuest as getQuestFromData } from "@/data/quests";
import type { Quest } from "@/data/types";

import { getContentClient } from "./client";

export { quests };

/**
 * Synchronous content accessor for a quest by its ID.
 */
export function getQuest(id: string): Quest | undefined {
  return getQuestFromData(id);
}

/**
 * Synchronous content accessor for all quests.
 */
export function getQuests(): Quest[] {
  return quests;
}

/**
 * Synchronous accessor for quests filtered by kind ("daily" | "weekly").
 */
export function getQuestsByKind(kind: Quest["kind"]): Quest[] {
  return quests.filter((q) => q.kind === kind);
}

/**
 * Asynchronous content accessor for a quest (Seam 1 / S10.2).
 */
export async function fetchQuest(id: string): Promise<Quest | null> {
  return getContentClient().getQuest(id);
}

/**
 * Asynchronous content accessor for all quests.
 */
export async function fetchQuests(): Promise<Quest[]> {
  return getContentClient().getQuests();
}

/**
 * Asynchronous content accessor for quests filtered by kind.
 */
export async function fetchQuestsByKind(kind: Quest["kind"]): Promise<Quest[]> {
  return getContentClient().getQuestsByKind(kind);
}
