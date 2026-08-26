import { useEffect } from "react";
import { usePlayerStoreApi, type PlayerState } from "@/stores/playerStore";
import { usePrefsStore } from "@/stores/prefsStore";
import { usePredictionGate } from "@/hooks/usePredictionGate";

export const PLAYER_SPEEDS: number[] = [0.25, 0.5, 1, 1.5, 2, 4];

/** Keys that would advance execution past an open prediction checkpoint. */
export const FORWARD_KEYS: readonly string[] = [" ", "Spacebar", "ArrowRight", "End"];

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return target.isContentEditable;
}

/**
 * True when the event came from a region that opts out of global player
 * shortcuts (the Prediction Gate), so Space selects an option instead of
 * starting playback.
 */
export function isShortcutFreeTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.closest('[data-player-keys="off"]') !== null;
}

/**
 * Pure keyboard event dispatcher for algorithm playback controls.
 * Separated from window listeners to enable rigorous automated unit testing without DOM hacks.
 */
export function handlePlayerKeyDown(
  key: string,
  shiftKey: boolean,
  player: PlayerState,
  setPlaybackSpeed: (speed: number) => void,
  speeds: number[] = PLAYER_SPEEDS,
): boolean {
  let handled = true;

  switch (key) {
    case " ":
    case "Spacebar":
      player.toggle();
      break;
    case "ArrowRight":
      if (shiftKey) player.stepToNextMilestone();
      else player.next();
      break;
    case "ArrowLeft":
      if (shiftKey) player.stepToPrevMilestone();
      else player.prev();
      break;
    case "Home":
      player.first();
      break;
    case "End":
      player.last();
      break;
    case "l":
    case "L":
      player.toggleLoop();
      break;
    case "r":
    case "R":
      player.reset();
      break;
    default: {
      const idx = parseInt(key, 10) - 1;
      if (!shiftKey && !isNaN(idx) && idx >= 0 && idx < speeds.length) {
        setPlaybackSpeed(speeds[idx]!);
      } else {
        handled = false;
      }
    }
  }

  return handled;
}

/**
 * Global keyboard shortcuts for the algorithm player.
 * Ignores events originating from form fields / contenteditable regions and from
 * the Prediction Gate, and never calls preventDefault on keys it does not handle.
 * While a prediction checkpoint is unresolved, the keys that would advance
 * execution (Space, →, Shift+→, End) do nothing; Previous and Home still work.
 */
export function usePlayerKeys(enabled: boolean = true): void {
  const storeApi = usePlayerStoreApi();
  const { isBlocking } = usePredictionGate();

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (isShortcutFreeTarget(event.target)) return;
      if (isBlocking && FORWARD_KEYS.includes(event.key)) return;

      const player = storeApi.getState();
      const prefs = usePrefsStore.getState();

      const handled = handlePlayerKeyDown(
        event.key,
        event.shiftKey,
        player,
        prefs.setPlaybackSpeed,
        PLAYER_SPEEDS,
      );

      if (handled) event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, isBlocking, storeApi]);
}

export default usePlayerKeys;
