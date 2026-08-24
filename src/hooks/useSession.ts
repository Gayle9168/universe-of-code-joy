import * as React from "react";
import { toast } from "sonner";
import { getAlgorithm } from "@/content/algorithms";
import { SECONDS_PER_MINUTE, isRunComplete, minutesFromSeconds, sessionXp } from "@/lib/session";
import { useProgressStore } from "@/stores/progressStore";

export interface UseSessionOptions {
  /** Algorithm slug being watched. */
  slug: string | null;
  /** Current step index from a player store. */
  index: number;
  /** Total number of steps in the loaded run. */
  totalSteps: number;
  /** Set false to pause all recording (e.g. no run loaded). */
  enabled?: boolean;
}

const TICK_MS = 5_000;

/**
 * Records a visualizer session into `progressStore`: on-screen minutes, distinct
 * steps watched, a streak touch, and XP (plus a toast) the first time a run is
 * played through to its final step.
 *
 * All work happens in effects, so it is SSR-safe and never runs during render.
 */
export function useSession({ slug, index, totalSteps, enabled = true }: UseSessionOptions): void {
  const recordStepsWatched = useProgressStore((s) => s.recordStepsWatched);
  const recordMinutes = useProgressStore((s) => s.recordMinutes);
  const touchStreak = useProgressStore((s) => s.touchStreak);
  const awardXp = useProgressStore((s) => s.awardXp);

  const maxIndexRef = React.useRef(0);
  const flushedStepsRef = React.useRef(0);
  const secondsRef = React.useRef(0);
  const completedRef = React.useRef(false);
  const awardedRef = React.useRef(false);

  /* new algorithm → new session */
  React.useEffect(() => {
    maxIndexRef.current = 0;
    flushedStepsRef.current = 0;
    secondsRef.current = 0;
    completedRef.current = false;
    awardedRef.current = false;
  }, [slug]);

  /* count on-screen time, flush whole minutes */
  React.useEffect(() => {
    if (!enabled || !slug) return;
    let streakTouched = false;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      secondsRef.current += TICK_MS / 1000;
      if (!streakTouched) {
        streakTouched = true;
        touchStreak();
      }
      const whole = minutesFromSeconds(secondsRef.current);
      if (whole >= 1) {
        secondsRef.current -= whole * SECONDS_PER_MINUTE;
        recordMinutes(slug, whole);
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [enabled, slug, recordMinutes, touchStreak]);

  /* track furthest step reached; flush in small batches */
  React.useEffect(() => {
    if (!enabled || !slug || totalSteps <= 0) return;
    if (index > maxIndexRef.current) maxIndexRef.current = index;
    if (isRunComplete(index, totalSteps)) completedRef.current = true;

    const pending = maxIndexRef.current - flushedStepsRef.current;
    if (pending >= 5) {
      flushedStepsRef.current = maxIndexRef.current;
      recordStepsWatched(slug, pending);
    }
  }, [enabled, slug, index, totalSteps, recordStepsWatched]);

  /* completion → XP once per session */
  React.useEffect(() => {
    if (!enabled || !slug || totalSteps <= 0) return;
    if (!isRunComplete(index, totalSteps) || awardedRef.current) return;
    awardedRef.current = true;

    const pending = maxIndexRef.current - flushedStepsRef.current;
    if (pending > 0) {
      flushedStepsRef.current = maxIndexRef.current;
      recordStepsWatched(slug, pending);
    }

    const algo = getAlgorithm(slug);
    const amount = sessionXp({
      stepsWatched: maxIndexRef.current,
      completedRun: true,
      algoXp: algo?.xp ?? 0,
    });
    if (amount <= 0) return;
    const { leveledUp, newLevel } = awardXp(amount, `run:${slug}`);
    touchStreak();
    toast.success(`+${amount} XP — run complete`, {
      description: leveledUp
        ? `Level ${newLevel} unlocked. ${algo?.name ?? "This algorithm"} played end to end.`
        : `${algo?.name ?? "This algorithm"} played end to end.`,
    });
  }, [enabled, slug, index, totalSteps, awardXp, recordStepsWatched, touchStreak]);

  /* unmount → flush remaining steps and seconds */
  React.useEffect(() => {
    if (!enabled || !slug) return;
    return () => {
      const pending = maxIndexRef.current - flushedStepsRef.current;
      if (pending > 0) {
        flushedStepsRef.current = maxIndexRef.current;
        recordStepsWatched(slug, pending);
      }
      if (secondsRef.current >= SECONDS_PER_MINUTE / 2) recordMinutes(slug, 1);
      secondsRef.current = 0;
    };
  }, [enabled, slug, recordStepsWatched, recordMinutes]);
}

export default useSession;
