import * as React from "react";
import { cn } from "@/lib/utils";
import type { MidExpression } from "@/lib/variableBoard";

export interface ExpressionBlockProps {
  expression: MidExpression | null;
  className?: string;
}

/**
 * The midpoint calculation: the formula, then the same formula with the current
 * numbers substituted in. Height is reserved so a step without an expression
 * does not shift the canvas. Pure presentation.
 */
export function ExpressionBlock({
  expression,
  className,
}: ExpressionBlockProps): React.ReactElement {
  return (
    <section
      aria-label="Midpoint calculation"
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border border-hairline bg-card px-4 py-3",
        className,
      )}
    >
      <h3 className="font-sans text-[13px] font-medium text-ink">Midpoint Calculation</h3>
      {/* The card keeps its frame on steps with no midpoint; only the maths fades. */}
      <div
        className="flex flex-col gap-1.5 transition-opacity duration-300 ease-out"
        style={{ opacity: expression ? 1 : 0 }}
        aria-hidden={expression ? undefined : true}
      >
        <p className="font-mono text-[13px] text-slate">{expression?.formula ?? "\u00a0"}</p>
        <p
          key={expression?.substitution ?? "none"}
          className="viz-swap font-mono text-[13px] tabular-nums text-ink"
        >
          {expression?.substitution ?? "\u00a0"}
        </p>
      </div>
    </section>
  );
}

export default ExpressionBlock;
