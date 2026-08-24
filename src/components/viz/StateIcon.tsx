import * as React from "react";
import { Play, Check, Lock, GitCompare, Search, Target, Ban } from "lucide-react";
import type { CellState } from "@/engine/types";
import { cn } from "@/lib/utils";
import { STATE_LABELS } from "@/components/viz/tokens";

export interface StateIconProps {
  state: CellState;
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Pure presentation component rendering crisp 1.5px Lucide symbols for non-idle visual states.
 * Adheres strictly to Algora's visual guidelines (no emojis, 1.5px stroke, accessible attributes).
 */
export function StateIcon({
  state,
  size = 14,
  color,
  className,
}: StateIconProps): React.ReactElement | null {
  if (state === "idle") return null;

  const props = {
    size,
    strokeWidth: 1.5,
    color,
    className: cn("shrink-0", className),
    "aria-label": STATE_LABELS[state],
    role: "img",
  };

  switch (state) {
    case "active":
      return <Play {...props} />;
    case "visited":
      return <Check {...props} />;
    case "sorted":
      return <Lock {...props} />;
    case "compare":
      return <GitCompare {...props} />;
    case "frontier":
      return <Search {...props} />;
    case "found":
      return <Target {...props} />;
    case "excluded":
      return <Ban {...props} />;
    default:
      return null;
  }
}

export default StateIcon;
