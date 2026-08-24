import * as React from "react";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/common/Chip";
import { usePlayerStore, useCurrentStep } from "@/stores/playerStore";

export interface StepCounterProps {
  className?: string;
}

export function StepCounter({ className }: StepCounterProps): React.ReactElement {
  const index = usePlayerStore((s) => s.index);
  const total = usePlayerStore((s) => s.run?.steps.length ?? 0);
  const truncated = usePlayerStore((s) => s.run?.truncated ?? false);
  const step = useCurrentStep();

  return (
    <div className={cn("flex items-center gap-2 justify-end shrink-0", className)}>
      <span
        className="whitespace-nowrap font-mono text-xs text-slate tabular-nums min-w-[95px] text-right"
        aria-live="polite"
        aria-atomic="true"
      >
        step {total === 0 ? 0 : index + 1} / {total}
      </span>
      {step?.phase ? (
        <Chip tone="accent" className="min-w-[60px] justify-center text-center">
          {step.phase}
        </Chip>
      ) : null}
      {truncated ? <Chip tone="warning">Truncated (Max 2,000 steps)</Chip> : null}
    </div>
  );
}

export default StepCounter;
