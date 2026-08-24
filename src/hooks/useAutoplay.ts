import { useEffect, useRef } from "react";
import { usePlayerStore, usePlayerStoreApi } from "@/stores/playerStore";
import { usePrefsStore } from "@/stores/prefsStore";
import { useIsReducedMotion } from "@/hooks/useReducedMotionSync";

const BASE_MS_PER_STEP = 900;

/**
 * requestAnimationFrame autoplay loop with accumulated delta time.
 * Speed comes from prefsStore.playbackSpeed. Pauses when the tab is hidden.
 * Under prefers-reduced-motion / reducedMotion, autoplay is completely disabled
 * requiring explicit manual stepping (Criterion S7.7).
 */
export function useAutoplay(): void {
  const storeApi = usePlayerStoreApi();
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const speed = usePrefsStore((s) => s.playbackSpeed);
  const reducedMotion = useIsReducedMotion();

  const frameRef = useRef<number | null>(null);
  const accRef = useRef(0);
  const lastRef = useRef<number | null>(null);

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
    if (reducedMotion && isPlaying) {
      storeApi.getState().pause();
      accRef.current = 0;
      lastRef.current = null;
      return;
    }

    if (!isPlaying) {
      accRef.current = 0;
      lastRef.current = null;
      return;
    }

    const interval = BASE_MS_PER_STEP / Math.max(0.1, speed);

    const tick = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const delta = now - lastRef.current;
      lastRef.current = now;
      accRef.current += delta;

      while (accRef.current >= interval) {
        accRef.current -= interval;
        const state = storeApi.getState();
        const total = state.run?.steps.length ?? 0;
        if (total === 0) {
          state.pause();
          break;
        }
        if (state.index >= total - 1) {
          if (state.loop) state.seek(0);
          else {
            state.pause();
            accRef.current = 0;
            break;
          }
        } else {
          state.next();
        }
      }

      if (storeApi.getState().isPlaying) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastRef.current = null;
    };
  }, [isPlaying, speed, reducedMotion, storeApi]);
}

export default useAutoplay;
