import * as React from "react";
import { cn } from "@/lib/utils";
import { VariableItem } from "@/components/viz/VariableItem";
import type { Variable } from "@/lib/variables";

export interface VariableBoardProps {
  variables: Variable[];
  className?: string;
}

/**
 * The variable board: the algorithm's live state as a compact reference strip,
 * one row per variable the engine currently has. Variables the engine has not
 * produced yet are absent rather than blank, so the board reflows instead of
 * holding empty space. Pure presentation — takes variables, no stores.
 */
export function VariableBoard({
  variables,
  className,
}: VariableBoardProps): React.ReactElement | null {
  if (variables.length === 0) return null;

  return (
    <section
      aria-label="Variables"
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border border-hairline bg-card px-4 py-3",
        className,
      )}
    >
      <h3 className="font-sans text-[12px] font-medium uppercase tracking-[0.06em] text-slate-soft">
        Variables
      </h3>
      <dl className="flex flex-col gap-1.5">
        {variables.map((variable) => (
          <VariableItem key={variable.name} variable={variable} />
        ))}
      </dl>
    </section>
  );
}

export default VariableBoard;
