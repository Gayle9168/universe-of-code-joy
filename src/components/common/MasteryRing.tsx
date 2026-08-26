import * as React from "react";
import { cn } from "@/lib/utils";
import { clampPct, ringGeometry } from "@/lib/ring";

export interface MasteryRingProps {
  pct: number;
  size?: number;
  stroke?: number;
  className?: string;
}

/**
 * Circular mastery indicator: a hairline track, a teal progress arc and the
 * rounded percentage in the middle. Pure presentation.
 */
export function MasteryRing({
  pct,
  size = 38,
  stroke = 3,
  className,
}: MasteryRingProps): React.ReactElement {
  const value = clampPct(pct);
  const { radius, circumference, dashOffset } = ringGeometry(size, stroke, value);
  const center = size / 2;

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Mastery ${Math.round(value)} percent`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-hairline"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          className="stroke-primary transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>
      <span className="absolute font-mono text-[10px] font-semibold tabular-nums text-ink">
        {Math.round(value)}%
      </span>
    </span>
  );
}

export default MasteryRing;
