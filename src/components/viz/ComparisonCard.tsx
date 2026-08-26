import * as React from "react";
import { cn } from "@/lib/utils";
import type { ArrayFrame } from "@/engine/types";

export interface ComparisonCardProps {
  /** Null when the current step has nothing to compare yet. */
  comparison: ArrayFrame["comparison"] | null;
  className?: string;
}

/**
 * The comparison card beside the variable board: the question the step is
 * asking, as one mono expression. Absent on steps that ask nothing — the row
 * reflows rather than holding an empty frame open. Pure presentation.
 */
export function ComparisonCard({
  comparison,
  className,
}: ComparisonCardProps): React.ReactElement | null {
  if (!comparison) return null;

  const expression = `${comparison.left} ${comparison.op} ${comparison.right} ?`;

  return (
    <section
      aria-label="Comparison"
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border border-hairline bg-card px-4 py-3",
        className,
      )}
    >
      <h3 className="font-sans text-[13px] font-medium text-ink">Comparison</h3>
      <span
        key={expression}
        className="viz-swap inline-flex h-9 w-fit items-center rounded-lg border border-primary/25 bg-tint px-3 font-mono text-[15px] tabular-nums text-ink"
      >
        {expression}
      </span>
    </section>
  );
}

export default ComparisonCard;
