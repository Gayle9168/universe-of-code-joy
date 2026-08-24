import {
  algorithms,
  algorithmsByCategory,
  CATEGORY_META,
  getAlgorithm as getAlgorithmFromData,
} from "@/data/algorithms";
import type { Algorithm, Category, Difficulty } from "@/data/types";

import { getContentClient } from "./client";

export { algorithms, algorithmsByCategory, CATEGORY_META };

/**
 * Synchronous content accessor for algorithms grouped by category.
 */
export function getAlgorithmsByCategory(): Record<Category, Algorithm[]> {
  return algorithmsByCategory();
}

/**
 * Synchronous content accessor for a single algorithm by its unique slug.
 */
export function getAlgorithm(slug: string): Algorithm | undefined {
  return getAlgorithmFromData(slug);
}

/**
 * Synchronous content accessor for the full list of algorithms.
 */
export function getAlgorithms(): Algorithm[] {
  return algorithms;
}

/**
 * Synchronous content accessor for category metadata.
 */
export function getCategoryMeta(): Record<
  Category,
  { label: string; icon: string; description: string }
> {
  return CATEGORY_META;
}

/**
 * Synchronous content accessor for algorithms filtered by difficulty.
 */
export function getAlgorithmsByDifficulty(difficulty: Difficulty): Algorithm[] {
  return algorithms.filter((a) => a.difficulty === difficulty);
}

/**
 * Asynchronous content accessor for an algorithm (Seam 1 / S10.2).
 */
export async function fetchAlgorithm(slug: string): Promise<Algorithm | null> {
  return getContentClient().getAlgorithm(slug);
}

/**
 * Asynchronous content accessor for all algorithms.
 */
export async function fetchAlgorithms(): Promise<Algorithm[]> {
  return getContentClient().getAlgorithms();
}

/**
 * Asynchronous content accessor for algorithms grouped by category.
 */
export async function fetchAlgorithmsByCategory(): Promise<Record<Category, Algorithm[]>> {
  return getContentClient().getAlgorithmsByCategory();
}

/**
 * Asynchronous content accessor for category metadata.
 */
export async function fetchCategoryMeta(): Promise<
  Record<Category, { label: string; icon: string; description: string }>
> {
  return getContentClient().getCategoryMeta();
}

/**
 * Asynchronous content accessor for algorithms filtered by difficulty.
 */
export async function fetchAlgorithmsByDifficulty(difficulty: Difficulty): Promise<Algorithm[]> {
  return getContentClient().getAlgorithmsByDifficulty(difficulty);
}
