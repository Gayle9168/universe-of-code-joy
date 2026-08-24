import * as React from "react";
import { cn } from "@/lib/utils";

export interface RingProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  percent: number;
  size?: number;
  strokeWidth?: number;
}

export const RingProgress = React.forwardRef<HTMLDivElement, RingProgressProps>(
  ({ className, percent, size = 80, strokeWidth = 8, ...props }, ref) => {
    const clamped = Math.min(Math.max(percent, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clamped / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${clamped}% complete`}
        {...props}
      >
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-viz-idle fill-none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="stroke-primary fill-none transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
          />
        </svg>
        <span className="absolute t-mono-label text-ink">{Math.round(clamped)}%</span>
      </div>
    );
  },
);
RingProgress.displayName = "RingProgress";
