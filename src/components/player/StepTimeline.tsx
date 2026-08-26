import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { activeNodeIndex, buildTimelineNodes } from "@/lib/timeline";
import { usePlayerStore } from "@/stores/playerStore";

export interface StepTimelineProps {
  className?: string;
}

/**
 * The meaningful timeline: one node per *phase group* rather than per step, so a
 * run reads as Setup → Find mid → Compare → Eliminate → Found instead of an
 * anonymous strip of dozens of ticks. Clicking a node seeks to the first step of
 * that phase; the node stays active for every step inside it. The concept label
 * is the primary element on every node — the step number is secondary.
 */
export function StepTimeline({ className }: StepTimelineProps): React.ReactElement | null {
  const run = usePlayerStore((s) => s.run);
  const index = usePlayerStore((s) => s.index);
  const seek = usePlayerStore((s) => s.seek);
  const pause = usePlayerStore((s) => s.pause);
  const activeRef = React.useRef<HTMLButtonElement | null>(null);

  /* Seeking is a deliberate manual move: playback stops and the pending autoplay
     advance is invalidated by the index change, so nothing arrives late. */
  const seekTo = React.useCallback(
    (target: number) => {
      pause();
      seek(target);
    },
    [pause, seek],
  );

  const nodes = React.useMemo(() => (run ? buildTimelineNodes(run.steps) : []), [run]);

  const activeNode = activeNodeIndex(nodes, index);

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
            <li key={`${node.label}-${node.from}`} className="flex min-w-0 shrink-0 items-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px w-3 shrink-0 transition-colors duration-300 ease-out",
                    isPast || isActive ? "bg-primary/40" : "bg-hairline",
                  )}
                />
              )}
              <button
                ref={isActive ? activeRef : undefined}
                type="button"
                onClick={() => seekTo(node.from)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Phase ${i + 1}: ${node.label}`}
                className={cn(
                  "group flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  isActive
                    ? "border-primary bg-tint"
                    : isPast
                      ? "border-primary/25 bg-card hover:bg-tint"
                      : "border-hairline bg-card hover:border-primary/30",
                )}
              >
                {/* Completed phases carry a check; the current phase carries a
                    ringed marker. Milestones stay slightly stronger. No new colour. */}
                {isPast ? (
                  <Check
                    aria-hidden="true"
                    size={12}
                    strokeWidth={2}
                    className="shrink-0 text-primary/70"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "shrink-0 rounded-full transition-colors duration-300 ease-out",
                      isActive
                        ? "size-2.5 bg-primary ring-2 ring-primary/25"
                        : node.milestone
                          ? "size-2.5 bg-primary/30"
                          : "size-1.5 bg-hairline",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "max-w-[96px] truncate font-mono text-[10px] uppercase tracking-[0.06em] transition-colors duration-300 ease-out",
                    isActive
                      ? "font-semibold text-ink"
                      : isPast
                        ? "text-slate"
                        : "text-slate-soft group-hover:text-slate",
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
