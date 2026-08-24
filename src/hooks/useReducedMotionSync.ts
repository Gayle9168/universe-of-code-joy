import * as React from "react";
import { usePrefsStore } from "@/stores/prefsStore";
import { isReducedMotionActive } from "@/lib/motion";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Hook that returns whether reduced motion is active, checking both
 * the persisted user preference and the system media query.
 */
export function useIsReducedMotion(): boolean {
  const storePref = usePrefsStore((s) => s.reducedMotion);
  const [mediaMatch, setMediaMatch] = React.useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  });

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    setMediaMatch(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setMediaMatch(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isReducedMotionActive(storePref, mediaMatch);
}

/**
 * Root hook that syncs the `data-reduced-motion` attribute on `<html>`
 * with the effective reduced motion state.
 */
export function useReducedMotionSync(): void {
  const isReduced = useIsReducedMotion();

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (isReduced) {
      document.documentElement.setAttribute("data-reduced-motion", "true");
    } else {
      document.documentElement.removeAttribute("data-reduced-motion");
    }
  }, [isReduced]);
}

export default useReducedMotionSync;
