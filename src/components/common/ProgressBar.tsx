import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, showLabel = false, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const clamped = Math.min(Math.max(value, 0), max);
    const percent = (clamped / max) * 100;

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div
          className="h-2 w-full rounded-full bg-viz-idle overflow-hidden"
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
          />
        </div>
        {showLabel && (
          <p className="t-small text-slate-soft mt-1 font-mono">{Math.round(percent)}%</p>
        )}
      </div>
    );
  },
);
ProgressBar.displayName = "ProgressBar";
