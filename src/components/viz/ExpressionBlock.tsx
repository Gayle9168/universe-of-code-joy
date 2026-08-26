import * as React from "react";
import { cn } from "@/lib/utils";
import type { MidExpression } from "@/lib/variableBoard";

export interface ExpressionBlockProps {
  expression: MidExpression | null;
  className?: string;
}

/**
 * The midpoint calculation: the formula, then the same formula with the current
 * numbers substituted in. Rendered only on steps that actually have a midpoint —
 * an empty card teaches nothing, so the row reflows instead. Pure presentation.
 */
export function ExpressionBlock({
  expression,
  className,
}: ExpressionBlockProps): React.ReactElement | null {
  if (!expression) return null;

  return (
    <section
      aria-label="Midpoint calculation"
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border border-hairline bg-card px-4 py-3",
        className,
      )}
    >
      <h3 className="font-sans text-[13px] font-medium text-ink">Midpoint Calculation</h3>
      <div className="flex flex-col gap-1">
        <p className="font-mono text-[13px] text-slate">{expression.formula}</p>
        <p
          key={expression.substitution}
          className="viz-swap font-mono text-[13px] tabular-nums text-ink"
        >
          {expression.substitution}
        </p>
      </div>
    </section>
  );
}

export default ExpressionBlock;
