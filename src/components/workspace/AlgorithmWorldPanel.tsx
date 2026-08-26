import * as React from "react";
import { MonitorPlay } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ArrayCanvas } from "@/components/viz/ArrayCanvas";
import { ComparisonCard } from "@/components/viz/ComparisonCard";
import { ExpressionBlock } from "@/components/viz/ExpressionBlock";
import { FrameView } from "@/components/viz/FrameView";
import { VariableBoard } from "@/components/viz/VariableBoard";
import type { AlgorithmModule } from "@/engine/types";
import { midExpression, variableRows } from "@/lib/variableBoard";
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
  const prevFrame = run && index > 0 ? (run.steps[index - 1]?.frame ?? null) : null;

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
  const rows = frame ? variableRows(frame, prevFrame) : [];
  const expression = frame ? midExpression(frame) : null;

  const hasExpression = Boolean(expression);
  const hasComparison = Boolean(frame?.kind === "array" && frame.comparison);
  const showTeachingRow = frame?.kind === "array" && (rows.length > 0 || hasExpression || hasComparison);

  return (
    <section
      aria-label="Algorithm world"
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-hairline bg-card px-6 pb-5 pt-5 shadow-sm",
        className,
      )}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {step ? `Step ${index + 1} of ${run?.steps.length ?? 0}: ${step.narration}` : ""}
      </div>

      <h2 className="shrink-0 font-display text-[19px] font-semibold tracking-tight text-ink">
        Algorithm World
      </h2>

      {/* One scroll column: the frame, then the panels that read it. The group is
          centred in the card so leftover height is shared above and below rather
          than pooling into one dead region under the content. */}
      <div className="relative mt-4 flex min-h-0 flex-1 flex-col justify-center gap-6 overflow-y-auto overflow-x-hidden">

        <div className="flex shrink-0 justify-center">
          {frame ? (
            frame.kind === "array" ? (
              <ArrayCanvas frame={frame} />
            ) : (
              <FrameView frame={frame} />
            )
          ) : (
            <p className="t-small text-slate">Preparing the visualization…</p>
          )}
        </div>

        {showTeachingRow ? (
          <div className="flex shrink-0 items-stretch gap-4">
            <VariableBoard rows={rows} className="flex-[1.35]" />
            <ExpressionBlock expression={expression} className="flex-[1.4]" />
            <ComparisonCard
              comparison={hasComparison ? (frame.comparison ?? null) : null}
              className="flex-[0.85]"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}


export default AlgorithmWorldPanel;
