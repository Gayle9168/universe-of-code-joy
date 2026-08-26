import * as React from "react";
import { MonitorPlay } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ArrayCanvas } from "@/components/viz/ArrayCanvas";
import { CurrentOperation } from "@/components/viz/CurrentOperation";
import { FrameView } from "@/components/viz/FrameView";
import { VariableBoard } from "@/components/viz/VariableBoard";
import type { AlgorithmModule } from "@/engine/types";
import { deriveReasoning } from "@/lib/reasoning";
import { deriveOperation, deriveVariables } from "@/lib/variables";
import { changedPointers } from "@/lib/vizState";
import { cn } from "@/lib/utils";
import { usePlayerStore, useCurrentStep } from "@/stores/playerStore";

export interface AlgorithmWorldPanelProps {
  /** Undefined means this slug has no engine module yet. */
  module: AlgorithmModule | undefined;
  algoName: string;
  className?: string;
}

/**
 * The Algorithm World card: the frame renderer plus the teaching panels that
 * read the same frame — variable board, midpoint calculation and the comparison
 * the step is asking. Playback lives in the band under both columns.
 */
export function AlgorithmWorldPanel({
  module: mod,
  algoName,
  className,
}: AlgorithmWorldPanelProps): React.ReactElement {
  const step = useCurrentStep();
  const index = usePlayerStore((s) => s.index);
  const run = usePlayerStore((s) => s.run);
  const prevStep = run && index > 0 ? (run.steps[index - 1] ?? null) : null;
  const prevFrame = prevStep?.frame ?? null;

  if (!mod) {
    return (
      <div className={cn("rounded-2xl border border-hairline bg-card shadow-sm", className)}>
        <EmptyState
          icon={MonitorPlay}
          title="Visualization coming soon"
          description={`We are still building the step-by-step player for ${algoName}. The About tab has everything else.`}
        />
      </div>
    );
  }

  const frame = step?.frame;
  /* Everything below is a pure function of the current step (plus the previous
     step for diffing), so seek, autoplay and rapid stepping cannot strand a
     stale value or formula. */
  const variables = deriveVariables(step, prevStep);
  /* The canonical run slice lets the operation panel teach the complexity
     insight once, derived from history rather than from a mutable UI flag. */
  const operation = deriveOperation(step, prevStep, run ? { steps: run.steps, index } : undefined);
  const reasoning = deriveReasoning(step, prevStep, index + 1);
  const showTeachingRow = variables.length > 0 || operation !== null;

  /* Only the boundary that actually moved on this step gets emphasis. */
  const moved =
    frame?.kind === "array"
      ? changedPointers(prevFrame?.kind === "array" ? prevFrame.pointers : null, frame.pointers)
      : [];

  return (
    <section
      aria-label="Algorithm world"
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-hairline bg-card px-6 pb-5 pt-5 shadow-sm",
        className,
      )}
    >
      {/* The one live region for the whole workspace: a single concise execution
          summary per step, instead of code, variables, operation and reasoning
          each announcing themselves. */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {reasoning?.accessibleSummary ?? ""}
      </div>

      <h2 className="shrink-0 font-display text-[19px] font-semibold tracking-tight text-ink">
        Algorithm World
      </h2>

      {/* One scroll column: the frame, then the panels that read it. The group is
          centred in the card so leftover height is shared above and below rather
          than pooling into one dead region under the content. */}
      {/* Top-aligned with one measured offset: the data structure sits high in
          the card instead of floating in the middle of leftover height, while
          keeping breathing room above the target chip. */}
      <div className="relative mt-4 flex min-h-0 flex-1 flex-col justify-start gap-6 overflow-y-auto overflow-x-hidden pt-2">
        <div className="flex shrink-0 justify-center">
          {frame ? (
            frame.kind === "array" ? (
              <ArrayCanvas frame={frame} movedPointers={moved} />
            ) : (
              <FrameView frame={frame} />
            )
          ) : (
            <p className="t-small text-slate">Preparing the visualization…</p>
          )}
        </div>

        {showTeachingRow ? (
          <div className="flex shrink-0 flex-col items-stretch gap-4 lg:flex-row">
            <VariableBoard variables={variables} className="lg:flex-[0.9]" />
            <CurrentOperation operation={operation} className="lg:flex-[1.1]" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default AlgorithmWorldPanel;
