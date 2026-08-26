import * as React from "react";
import { cn } from "@/lib/utils";
import { pointerLabel } from "@/lib/pointerLabels";
import type { VariableRow } from "@/lib/variableBoard";

export interface VariableBoardProps {
  rows: VariableRow[];
  className?: string;
}

/**
 * The variable board: one labelled box per tracked variable, with the values
 * that changed on this step emphasised. Pure presentation — takes rows, no
 * stores, no router.
 */
export function VariableBoard({ rows, className }: VariableBoardProps): React.ReactElement | null {
  if (rows.length === 0) return null;

  return (
    <section
      aria-label="Variable board"
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border border-hairline bg-card px-4 py-3",
        className,
      )}
    >
      <h3 className="font-sans text-[13px] font-medium text-ink">Variable Board</h3>
      <dl className="grid gap-2" style={{ gridTemplateColumns: `repeat(${rows.length}, 1fr)` }}>
        {rows.map((row) => (
          <div key={row.name} className="flex min-w-0 flex-col items-center gap-1.5">
            <dt className="truncate font-mono text-[12px] text-slate">{pointerLabel(row.name)}</dt>
            <dd
              className={cn(
                "flex h-9 w-full items-center justify-center gap-1 rounded-lg border font-mono text-[15px] tabular-nums transition-colors duration-300 ease-out",
                row.changed
                  ? "border-[1.5px] border-accent-strong bg-tint font-semibold text-accent-strong"
                  : "border-hairline bg-card text-ink",
              )}
            >
              {row.previous !== undefined ? (
                <span className="text-[12px] font-normal text-slate line-through">
                  {row.previous}
                </span>
              ) : null}
              {row.previous !== undefined ? (
                <span aria-hidden="true" className="text-[11px] text-slate">
                  &rarr;
                </span>
              ) : null}
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
