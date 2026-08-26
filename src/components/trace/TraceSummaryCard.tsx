import * as React from "react";
import { Check, RotateCcw } from "lucide-react";
import type { TraceSession } from "@/lib/trace";
import { cn } from "@/lib/utils";

export interface TraceSummaryCardProps {
  session: TraceSession;
  /** Total checked attempts across the trace; steps === checkpoints. */
  attempts: number;
  steps: number;
  hintsUsed: number;
  onRestart: () => void;
  className?: string;
}

/**
 * Completion summary. Reports only what is actually tracked — steps, attempts,
 * hints and the halving path — with no invented score or XP wiring.
 */
export function TraceSummaryCard({
  session,
  attempts,
  steps,
  hintsUsed,
  onRestart,
  className,
}: TraceSummaryCardProps): React.ReactElement {
  const { summary } = session;
  const path = summary.candidateCounts.join(" → ");

  const stats: Array<{ label: string; value: string }> = [
    { label: "steps", value: String(steps) },
    { label: "answers checked", value: String(attempts) },
    { label: "hints used", value: String(hintsUsed) },
  ];

  return (
    <section
      aria-labelledby="trace-summary-heading"
      className={cn("flex flex-col gap-3", className)}
    >
      <div className="flex items-center gap-1.5">
        <Check aria-hidden="true" size={14} strokeWidth={1.8} className="text-accent-strong" />
        <h3
          id="trace-summary-heading"
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate"
        >
          Trace complete
        </h3>
      </div>

      <p className="font-sans text-[13px] leading-relaxed text-ink">
        {summary.found
          ? `You executed binary search by hand and found ${session.target} at index ${summary.foundIndex}.`
          : `You executed binary search by hand and ruled out every candidate: ${session.target} is not in this list.`}
      </p>

      {path ? (
        <p className="font-mono text-[11px] text-slate">
          candidates: {path}
          {summary.found ? "" : " → 0"}
        </p>
      ) : null}

      <dl className="flex flex-wrap gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="min-w-[92px] rounded-xl border border-hairline bg-paper px-3 py-2"
          >
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-soft">
              {stat.label}
            </dt>
            <dd className="font-mono text-[15px] font-semibold text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={onRestart}
        className="inline-flex h-9 w-fit items-center gap-1.5 rounded-lg border border-primary/30 bg-card px-3 font-sans text-[13px] font-medium text-primary transition-colors hover:bg-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <RotateCcw aria-hidden="true" size={14} strokeWidth={1.6} />
        Trace again
      </button>
    </section>
  );
}

export default TraceSummaryCard;
