import * as React from "react";
import { DESIGN_WIDTH, fitScale } from "@/lib/fitScale";

/**
 * Measures a container and returns the uniform scale needed to fit a
 * fixed-width desktop layout inside it. Returns 1 during SSR and the first
 * client render, so hydration always matches the desktop rendering.
 */
export function useFitScale(designWidth: number = DESIGN_WIDTH): {
  ref: React.RefObject<HTMLDivElement | null>;
  scale: number;
} {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const measure = (width: number) => {
      setScale((prev) => {
        const next = fitScale(width, designWidth);
        return Math.abs(next - prev) < 0.0005 ? prev : next;
      });
    };

    measure(node.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) measure(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [designWidth]);

  return { ref, scale };
}

export default useFitScale;
