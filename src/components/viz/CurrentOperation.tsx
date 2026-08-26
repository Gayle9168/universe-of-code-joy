import * as React from "react";
import { cn } from "@/lib/utils";
import { ExpressionView } from "@/components/viz/ExpressionView";
import type { Operation } from "@/lib/variables";

export interface CurrentOperationProps {
  /** Null on steps that compute nothing (setup) — the panel then disappears. */
  operation: Operation | null;
  className?: string;
}

/**
 * The single operation the current step is performing: a midpoint calculation,
 * a comparison, a boundary update or the final result. Exactly one is on screen
 * at a time, so the same expression is never shown twice. Pure presentation.
 */
export function CurrentOperation({
  operation,
  className,
}: CurrentOperationProps): React.ReactElement | null {
  if (!operation) return null;

  return (
    <section
      aria-label="Current operation"
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border border-hairline bg-card px-4 py-3",
        className,
      )}
    >
      <h3 className="font-sans text-[12px] font-medium uppercase tracking-[0.06em] text-slate-soft">
        {operation.title}
      </h3>
      <span className="sr-only">{operation.announcement}</span>
      <ExpressionView
        key={operation.lines.map((l) => l.text).join("|")}
        lines={operation.lines}
        tone={operation.tone}
        className="viz-swap"
      />
    </section>
  );
}

export default CurrentOperation;
