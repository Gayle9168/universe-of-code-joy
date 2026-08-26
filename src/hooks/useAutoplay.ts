import { useEffect } from "react";
import { usePlayerStore, usePlayerStoreApi } from "@/stores/playerStore";
import { usePrefsStore } from "@/stores/prefsStore";
import { useIsReducedMotion } from "@/hooks/useReducedMotionSync";
import { BASE_STEP_MS, stepDurationMs } from "@/lib/pacing";

/**
 * Autoplay: one pending advance at a time, scheduled for exactly as long as the
 * *current* step deserves (see `src/lib/pacing.ts`), so a comparison and the
 * elimination that follows it never collapse into a single perceived state.
 *
 * The timer is keyed on the canonical `index`, so every manual interaction —
 * Next, Previous, timeline seek, Pause, Restart, or a new run from an input
 * change — tears the pending callback down. A stale scheduled advance can never
 * move the player after manual navigation.
 *
 * Under prefers-reduced-motion / reducedMotion, autoplay is disabled entirely
 * and stepping is manual (Criterion S7.7). Reduced motion never changes the
 * step sequence, only whether time advances it.
 */
export function useAutoplay(): void {
  const storeApi = usePlayerStoreApi();
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const index = usePlayerStore((s) => s.index);
  const total = usePlayerStore((s) => s.run?.steps.length ?? 0);
  const phase = usePlayerStore((s) => s.run?.steps[s.index]?.phase ?? null);
  const speed = usePrefsStore((s) => s.playbackSpeed);
  const reducedMotion = useIsReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onVisibility = () => {
      if (document.hidden && storeApi.getState().isPlaying) {
        storeApi.getState().pause();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [storeApi]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Under reduced motion, automatic playback is disabled (Criterion S7.7).
    if (reducedMotion) {
      if (isPlaying) storeApi.getState().pause();
      return;
    }

    if (!isPlaying) return;
    if (total === 0) {
      storeApi.getState().pause();
      return;
    }

    const delay = stepDurationMs(phase, speed, BASE_STEP_MS);

    const timer = window.setTimeout(() => {
      const state = storeApi.getState();
      // Re-read the canonical index: only advance from the step this timer was
      // scheduled for. Anything else means the learner moved in the meantime.
      if (!state.isPlaying || state.index !== index) return;
      const last = (state.run?.steps.length ?? 0) - 1;
      if (state.index >= last) {
        if (state.loop) state.seek(0);
        else state.pause();
        return;
      }
      state.next();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [isPlaying, index, total, phase, speed, reducedMotion, storeApi]);
}

export default useAutoplay;
