import { lessons } from "@/data/lessons";
import type { Lesson } from "@/data/types";

import { getContentClient } from "./client";

export { lessons };

/**
 * Synchronous content accessor for a single lesson by its slug.
 */
export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

/**
 * Synchronous content accessor for all available lessons.
 */
export function getLessons(): Lesson[] {
  return lessons;
}

/**
 * Synchronous accessor for the primary lesson associated with an algorithm slug.
 */
export function getLessonByAlgorithm(algorithmSlug: string): Lesson | undefined {
  return lessons.find((l) => l.algorithmSlug === algorithmSlug);
}

/**
 * Synchronous accessor for all lessons associated with an algorithm slug.
 */
export function getLessonsByAlgorithm(algorithmSlug: string): Lesson[] {
  return lessons.filter((l) => l.algorithmSlug === algorithmSlug);
}

/**
 * Asynchronous content accessor for a lesson (Seam 1 / S10.2).
 * Prepared for future server function / API migration with zero consumer rewrite.
 */
export async function fetchLesson(slug: string): Promise<Lesson | null> {
  return getContentClient().getLesson(slug);
}

/**
 * Asynchronous content accessor for all lessons.
 */
export async function fetchLessons(): Promise<Lesson[]> {
  return getContentClient().getLessons();
}

/**
 * Asynchronous content accessor for the lesson of a given algorithm slug.
 */
export async function fetchLessonByAlgorithm(algorithmSlug: string): Promise<Lesson | null> {
  return getContentClient().getLessonByAlgorithm(algorithmSlug);
}

/**
 * Asynchronous content accessor for all lessons of a given algorithm slug.
 */
export async function fetchLessonsByAlgorithm(algorithmSlug: string): Promise<Lesson[]> {
  return getContentClient().getLessonsByAlgorithm(algorithmSlug);
}
