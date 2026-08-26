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
 * asking, as one mono expression. Height and opacity are reserved so a step
 * without a comparison never shifts the row. Pure presentation.
 */
export function ComparisonCard({ comparison, className }: ComparisonCardProps): React.ReactElement {
  const expression = comparison
    ? `${comparison.left} ${comparison.op} ${comparison.right} ?`
    : "\u00a0";

  return (
    <section
      aria-label="Comparison"
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border border-hairline bg-card px-4 py-3",
        className,
      )}
    >
      <h3 className="font-sans text-[13px] font-medium text-ink">Comparison</h3>
      {/* The frame stays; only the question fades when a step asks none. */}
      <span
        key={expression}
        aria-hidden={comparison ? undefined : true}
        className="viz-swap inline-flex h-9 w-fit items-center rounded-lg border border-primary/25 bg-tint px-3 font-mono text-[15px] tabular-nums text-ink transition-opacity duration-300 ease-out"
        style={{ opacity: comparison ? 1 : 0 }}
      >
        {expression}
      </span>
    </section>
  );
}

export default ComparisonCard;
