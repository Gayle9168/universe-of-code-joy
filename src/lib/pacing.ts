/**
 * Semantic playback pacing.
 *
 * Autoplay should read like teaching, not a slideshow: the arithmetic that
 * produces a probe and the elimination that follows a comparison need slightly
 * longer on screen than the comparison itself, so cause and consequence never
 * collapse into one perceived state.
 *
 * Everything here is derived from a step's own `phase` string. There is no
 * algorithm slug, no registry lookup and no per-module table: an unknown phase
 * falls back to the base duration, so a new module gets sane pacing for free.
 *
 * Architecture constraint: pure functions only — no React, DOM or stores.
 */

/** One step at 1x with no semantic weight. */
export const BASE_STEP_MS = 900;

/** Exact phase names, weighted by how much thinking the step contains. */
const EXACT: Record<string, number> = {
  setup: 1.15,
  probe: 1.25,
  compare: 1,
  found: 1.5,
  done: 1.5,
};

/**
 * Generic fallbacks by meaning, so a module that names its phases differently
 * still gets the rhythm right without being listed anywhere.
 */
const KEYWORDS: ReadonlyArray<{ match: string; weight: number }> = [
  { match: "narrow", weight: 1.3 },
  { match: "eliminat", weight: 1.3 },
  { match: "discard", weight: 1.3 },
  { match: "shrink", weight: 1.3 },
  { match: "probe", weight: 1.25 },
  { match: "midpoint", weight: 1.25 },
  { match: "found", weight: 1.5 },
  { match: "result", weight: 1.5 },
  { match: "done", weight: 1.5 },
  { match: "setup", weight: 1.15 },
  { match: "init", weight: 1.15 },
];

/** Relative time a phase deserves. An unknown phase weighs exactly 1. */
export function phaseWeight(phase: string | null | undefined): number {
  if (!phase) return 1;
  const key = phase.toLowerCase();
  const exact = EXACT[key];
  if (exact !== undefined) return exact;
  for (const entry of KEYWORDS) {
    if (key.includes(entry.match)) return entry.weight;
  }
  return 1;
}

/**
 * How long the current step should stay on screen during autoplay.
 * `speed` is the learner's playback multiplier; higher means shorter.
 */
export function stepDurationMs(
  phase: string | null | undefined,
  speed: number = 1,
  baseMs: number = BASE_STEP_MS,
): number {
  const safeSpeed = Math.max(0.1, Number.isFinite(speed) ? speed : 1);
  return Math.round((baseMs * phaseWeight(phase)) / safeSpeed);
}
