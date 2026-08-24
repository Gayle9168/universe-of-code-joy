/**
 * Pure domain motion logic & calculations (Criterion S7.7 & WCAG 2.1 AA SC 2.3.3).
 *
 * Architecture constraint: Must remain pure domain functions taking data parameters.
 * FORBIDDEN to import React, DOM APIs, or Zustand stores directly.
 */

export interface TransitionConfig {
  duration: number;
  ease?: readonly number[] | string;
}

/**
 * Determines whether reduced-motion mode is active by combining the user's
 * in-app preference with the system media query match state.
 */
export function isReducedMotionActive(
  storePref: boolean,
  mediaQueryMatches: boolean = false,
): boolean {
  return storePref || mediaQueryMatches;
}

/**
 * Returns a transition configuration object. When reduced motion is active,
 * duration is strictly 0s, eliminating all tweening and animation latency.
 */
export function getTransitionConfig(
  reduced: boolean,
  defaultDuration: number = 0.35,
  defaultEase: readonly number[] | string = [0.22, 1, 0.36, 1],
): TransitionConfig {
  if (reduced) {
    return { duration: 0 };
  }
  return {
    duration: defaultDuration,
    ease: defaultEase,
  };
}

/**
 * Returns the scroll behavior mode for element scrolling (e.g. scrollIntoView).
 * Under reduced motion, returns "auto" for instant positioning; otherwise "smooth".
 */
export function getScrollBehavior(reduced: boolean): ScrollBehavior {
  return reduced ? "auto" : "smooth";
}

/**
 * Collapses a millisecond duration value to 0ms when reduced motion is enabled.
 */
export function collapseDuration(durationMs: number, reduced: boolean): number {
  return reduced ? 0 : Math.max(0, durationMs);
}
