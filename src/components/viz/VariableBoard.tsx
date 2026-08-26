import * as React from "react";
import { cn } from "@/lib/utils";
import type { VariableRow } from "@/lib/variableBoard";

export interface VariableBoardProps {
  rows: VariableRow[];
  className?: string;
}

/**
 * The variable board: one labelled cell per tracked variable, with the values
 * that changed on this step emphasised. Pure presentation — takes rows, no
 * stores, no router.
 */
export function VariableBoard({ rows, className }: VariableBoardProps): React.ReactElement | null {
  if (rows.length === 0) return null;

  return (
    <section
      aria-label="Variable board"
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border border-hairline bg-paper px-3 py-2.5",
        className,
      )}
    >
      <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">Variables</h3>
      <dl className="flex flex-wrap gap-2">
        {rows.map((row) => (
          <div
            key={row.name}
            className={cn(
              "flex min-w-[68px] flex-col rounded-lg border px-2.5 py-1.5 transition-colors duration-300 ease-out",
              row.changed ? "border-primary/40 bg-tint" : "border-hairline bg-card",
            )}
          >
            <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-slate">
              {row.name}
            </dt>
            <dd
              className={cn(
                "font-mono text-[15px] font-semibold tabular-nums",
                row.changed ? "text-primary" : "text-ink",
              )}
            >
              <span key={row.value} className="viz-swap">
                {row.value}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default VariableBoard;
