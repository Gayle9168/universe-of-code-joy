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
      aria-hidden={expression ? undefined : true}
      className={cn(
        "flex w-full flex-col gap-1 rounded-xl border border-hairline bg-paper px-3 py-2.5 transition-opacity duration-300 ease-out",
        className,
      )}
      style={{ opacity: expression ? 1 : 0 }}
    >
      <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">
        Midpoint calculation
      </h3>
      <p className="font-mono text-[12px] text-slate">{expression?.formula ?? "\u00a0"}</p>
      <p
        key={expression?.substitution ?? "none"}
        className="viz-swap font-mono text-[14px] font-semibold tabular-nums text-ink"
      >
        {expression?.substitution ?? "\u00a0"}
      </p>
    </section>
  );
}

export default ExpressionBlock;
