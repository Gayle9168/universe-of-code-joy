import * as React from "react";
import { cn } from "@/lib/utils";
import type { ExpressionLine, OperationTone } from "@/lib/variables";

export interface ExpressionViewProps {
  lines: ExpressionLine[];
  tone?: OperationTone;
  className?: string;
}

const TONE: Record<OperationTone, string> = {
  accent: "text-accent-strong",
  error: "text-error",
  warning: "text-warning",
};

/**
 * Renders an ordered expression: the general formula, the same formula with the
 * current numbers substituted in, the result, its truth value and a plain
 * English note. Algorithm-agnostic — a midpoint, a window sum update, a heap
 * parent index or a Dijkstra relaxation all use this same shape.
 *
 * Pure presentation: takes lines, no stores, no router.
 */
export function ExpressionView({
  lines,
  tone = "accent",
  className,
}: ExpressionViewProps): React.ReactElement | null {
  if (lines.length === 0) return null;

  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      {lines.map((line) => {
        if (line.kind === "note") {
          return (
            <p key={`note-${line.text}`} className="font-sans text-[12px] leading-[1.4] text-slate">
              {line.text}
            </p>
          );
        }
        return (
          <p
            key={`${line.kind}-${line.text}`}
            className={cn(
              "font-mono text-[13px] tabular-nums",
              line.kind === "formula" && "text-slate",
              line.kind === "substitution" && "text-ink",
              line.kind === "result" && "text-[15px] font-semibold text-ink",
              line.kind === "truth" && cn("text-[13px] font-semibold", TONE[tone]),
            )}
          >
            {line.text}
          </p>
        );
      })}
    </div>
  );
}

export default ExpressionView;
