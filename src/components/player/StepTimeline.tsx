import * as React from "react";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/playerStore";

export interface StepTimelineProps {
  className?: string;
}

/**
 * The numbered step timeline: one node per emitted step, labelled with the
 * step's own `timelineLabel` (falling back to its `phase`), and clickable to
 * seek. Replaces the bare slider so the run reads as a named sequence —
 * Setup, Find mid, Compare, Eliminate — rather than an anonymous position.
 */
export function StepTimeline({ className }: StepTimelineProps): React.ReactElement | null {
  const run = usePlayerStore((s) => s.run);
  const index = usePlayerStore((s) => s.index);
  const seek = usePlayerStore((s) => s.seek);
  const activeRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [index]);

  if (!run || run.steps.length === 0) return null;

  return (
    <div
      className={cn("w-full", className)}
      role="group"
      aria-label={`Step timeline, step ${index + 1} of ${run.steps.length}`}
    >
      <ol className="flex items-start gap-0 overflow-x-auto pb-1">
        {run.steps.map((step, i) => {
          const label = step.timelineLabel ?? step.phase;
          const isActive = i === index;
          const isPast = i < index;
          return (
            <li key={step.i} className="flex min-w-0 shrink-0 items-start">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-[13px] h-px w-6 shrink-0 transition-colors duration-300 ease-out",
                    isPast || isActive ? "bg-primary/40" : "bg-hairline",
                  )}
                />
              )}
              <button
                ref={isActive ? activeRef : undefined}
                type="button"
                onClick={() => seek(i)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${label}`}
                className="group flex w-[74px] flex-col items-center gap-1.5 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] tabular-nums",
                    "transition-[background-color,border-color,color,transform] duration-300 ease-out",
                    isActive
                      ? "scale-110 border-primary bg-primary text-primary-foreground"
                      : isPast
                        ? "border-primary/40 bg-tint text-primary"
                        : "border-hairline bg-card text-slate group-hover:border-primary/40",
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    "w-full truncate text-center font-mono text-[10px] uppercase tracking-[0.08em] transition-colors duration-300 ease-out",
                    isActive ? "text-ink" : "text-slate",
                  )}
                  title={label}
                >
                  {label}
                </span>
              </button>

            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default StepTimeline;
