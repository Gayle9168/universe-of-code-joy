import * as React from "react";
import { cn } from "@/lib/utils";
import type { ArrayFrame } from "@/engine/types";
import { evaluateComparison } from "@/lib/vizState";

export interface ComparisonCardProps {
  /** Null when the current step has nothing to compare yet. */
  comparison: ArrayFrame["comparison"] | null;
  className?: string;
}

const TONE: Record<"accent" | "error" | "warning", string> = {
  accent: "text-accent-strong",
  error: "text-error",
  warning: "text-warning",
};

/**
 * The comparison card beside the variable board: the question the step is
 * asking, the answer to it, and the plain-English verdict the engine emits —
 * so the student reads cause (expression) then consequence (verdict). Absent on
 * steps that ask nothing. Pure presentation.
 */
export function ComparisonCard({
  comparison,
  className,
}: ComparisonCardProps): React.ReactElement | null {
  if (!comparison) return null;

  const expression = `${comparison.left} ${comparison.op} ${comparison.right} ?`;
  const truth = evaluateComparison(comparison.left, comparison.op, comparison.right);
  const tone = TONE[comparison.tone ?? "accent"];

  return (
    <section
      aria-label="Comparison"
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border border-hairline bg-card px-4 py-3",
        className,
      )}
    >
      <h3 className="font-sans text-[13px] font-medium text-ink">Comparison</h3>
      <div key={expression} className="viz-swap flex flex-col gap-1.5">
        <span className="inline-flex h-9 w-fit items-center rounded-lg border border-primary/25 bg-tint px-3 font-mono text-[15px] tabular-nums text-ink">
          {expression}
        </span>
        {truth !== null ? (
          <span className={cn("font-mono text-[13px] font-semibold", tone)}>
            {truth ? "TRUE" : "FALSE"}
          </span>
        ) : null}
        {comparison.verdict ? (
          <p className="font-sans text-[12px] leading-[1.4] text-slate">{comparison.verdict}</p>
        ) : null}
      </div>
    </section>
  );
}

export default ComparisonCard;
