import { paths, getPath as getPathFromData } from "@/data/paths";
import type { Path } from "@/data/types";

import { getContentClient } from "./client";

export { paths };

/**
 * Synchronous content accessor for a guided learning path by its slug.
 */
export function getPath(slug: string): Path | undefined {
  return getPathFromData(slug);
}

/**
 * Synchronous content accessor for all guided learning paths.
 */
export function getPaths(): Path[] {
  return paths;
}

/**
 * Asynchronous content accessor for a guided learning path (Seam 1 / S10.2).
 */
export async function fetchPath(slug: string): Promise<Path | null> {
  return getContentClient().getPath(slug);
}

/**
 * Asynchronous content accessor for all guided learning paths.
 */
export async function fetchPaths(): Promise<Path[]> {
  return getContentClient().getPaths();
}
