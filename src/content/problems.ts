import { problems } from "@/data/problems";
import type { Difficulty, Problem } from "@/data/types";

import { getContentClient } from "./client";

export { problems };

/**
 * Synchronous content accessor for a single problem challenge by its slug.
 */
export function getProblem(slug: string): Problem | undefined {
  return problems.find((p) => p.slug === slug);
}

/**
 * Synchronous content accessor for the full list of problem challenges.
 */
export function getProblems(): Problem[] {
  return problems;
}

/**
 * Synchronous accessor for all problem challenges linked to a given algorithm slug.
 */
export function getProblemsByAlgorithm(algorithmSlug: string): Problem[] {
  return problems.filter((p) => p.algorithmSlug === algorithmSlug);
}

/**
 * Synchronous accessor for problem challenges filtered by difficulty.
 */
export function getProblemsByDifficulty(difficulty: Difficulty): Problem[] {
  return problems.filter((p) => p.difficulty === difficulty);
}

/**
 * Asynchronous content accessor for a problem challenge (Seam 1 / S10.2).
 */
export async function fetchProblem(slug: string): Promise<Problem | null> {
  return getContentClient().getProblem(slug);
}

/**
 * Asynchronous content accessor for all problem challenges.
 */
export async function fetchProblems(): Promise<Problem[]> {
  return getContentClient().getProblems();
}

/**
 * Asynchronous content accessor for problems of an algorithm.
 */
export async function fetchProblemsByAlgorithm(algorithmSlug: string): Promise<Problem[]> {
  return getContentClient().getProblemsByAlgorithm(algorithmSlug);
}

/**
 * Asynchronous content accessor for problems filtered by difficulty.
 */
export async function fetchProblemsByDifficulty(difficulty: Difficulty): Promise<Problem[]> {
  return getContentClient().getProblemsByDifficulty(difficulty);
}
