/**
 * Pure session-scoring helpers used by `useSession`.
 * No React, no store, no timers — so they are trivially testable.
 */

/** XP granted per new step watched in a visualizer session. */
export const XP_PER_STEP = 1;

/** Steps that still earn XP within a single session. */
export const STEP_XP_CAP = 20;

/** Fraction of an algorithm's XP awarded for playing a run to its final step. */
export const COMPLETION_SHARE = 0.25;

/** Seconds of on-screen activity that count as one recorded minute. */
export const SECONDS_PER_MINUTE = 60;

export interface SessionScoreInput {
  /** Distinct new steps watched this session. */
  stepsWatched: number;
  /** Whether the learner reached the final step of the run. */
  completedRun: boolean;
  /** The algorithm's catalog XP value. */
  algoXp: number;
}

/**
 * XP for one visualizer session. Step XP is capped so scrubbing a long run
 * cannot farm XP, and the total never exceeds the algorithm's own XP value.
 */
export function sessionXp({ stepsWatched, completedRun, algoXp }: SessionScoreInput): number {
  const steps = Math.max(0, Math.floor(stepsWatched));
  const base = Math.min(steps, STEP_XP_CAP) * XP_PER_STEP;
  const bonus = completedRun ? Math.round(Math.max(0, algoXp) * COMPLETION_SHARE) : 0;
  return Math.min(base + bonus, Math.max(0, Math.round(algoXp)));
}

/** Whole minutes contained in an accumulated second count. */
export function minutesFromSeconds(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.floor(seconds / SECONDS_PER_MINUTE);
}

/** True when `index` is the last step of a run with more than one step. */
export function isRunComplete(index: number, totalSteps: number): boolean {
  return totalSteps > 1 && index >= totalSteps - 1;
}
