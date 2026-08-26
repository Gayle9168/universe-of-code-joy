import * as React from "react";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/playerStore";

export interface StepTimelineProps {
  className?: string;
}

interface TimelineNode {
  label: string;
  /** First step index in this phase group — where clicking the node seeks. */
  from: number;
  to: number;
}

/**
 * The meaningful timeline: one node per *phase group* rather than per step, so a
 * run reads as Setup → Find mid → Compare → Eliminate → Found instead of an
 * anonymous strip of dozens of ticks. Clicking a node seeks to the first step of
 * that phase; the node stays active for every step inside it.
 */
export function StepTimeline({ className }: StepTimelineProps): React.ReactElement | null {
  const run = usePlayerStore((s) => s.run);
  const index = usePlayerStore((s) => s.index);
  const seek = usePlayerStore((s) => s.seek);
  const activeRef = React.useRef<HTMLButtonElement | null>(null);

  const nodes = React.useMemo<TimelineNode[]>(() => {
    if (!run) return [];
    const out: TimelineNode[] = [];
    run.steps.forEach((step, i) => {
      const label = step.timelineLabel ?? step.phase;
      const last = out[out.length - 1];
      if (last && last.label === label && last.to === i - 1) last.to = i;
      else out.push({ label, from: i, to: i });
    });
    return out;
  }, [run]);

  const activeNode = nodes.findIndex((nd) => index >= nd.from && index <= nd.to);

  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeNode]);

  if (!run || run.steps.length === 0) return null;

  return (
    <div
      className={cn("w-full", className)}
      role="group"
      aria-label={`Step timeline, step ${index + 1} of ${run.steps.length}`}
    >
      <ol className="flex items-center justify-center gap-0 overflow-x-auto">
        {nodes.map((node, i) => {
          const isActive = i === activeNode;
          const isPast = i < activeNode;
          return (
            <li key={`${node.label}-${node.from}`} className="flex min-w-0 shrink-0 items-start">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-[13px] h-px w-8 shrink-0 transition-colors duration-300 ease-out",
                    isPast || isActive ? "bg-primary/40" : "bg-hairline",
                  )}
                />
              )}
              <button
                ref={isActive ? activeRef : undefined}
                type="button"
                onClick={() => seek(node.from)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Phase ${i + 1}: ${node.label}`}
                className="group flex w-[84px] flex-col items-center gap-1.5 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
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
                  title={node.label}
                >
                  {node.label}
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
