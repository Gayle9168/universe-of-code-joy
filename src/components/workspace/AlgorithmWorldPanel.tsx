import * as React from "react";
import { MonitorPlay } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ArrayCanvas } from "@/components/viz/ArrayCanvas";
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
 * read the same frame — variable board and midpoint calculation. Playback lives
 * in the band under both columns, not in here.
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

  return (
    <section
      aria-label="Algorithm world"
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-hairline bg-card shadow-sm",
        className,
      )}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {step ? `Step ${index + 1} of ${run?.steps.length ?? 0}: ${step.narration}` : ""}
      </div>

      {/* items-start: when the reserved comparison/decision slots make the world
          taller than the card, centering would clip the target label at the top. */}
      <div className="relative flex min-h-0 flex-1 items-start justify-center overflow-y-auto overflow-x-hidden px-6 pb-1 pt-3">
        {frame ? (
          frame.kind === "array" ? (
            <ArrayCanvas frame={frame} />
          ) : (
            <FrameView frame={frame} className="max-h-full" />
          )
        ) : (
          <p className="t-small text-slate">Preparing the visualization…</p>
        )}
      </div>

      {frame?.kind === "array" ? (
        <div className="flex shrink-0 flex-wrap items-stretch gap-3 border-t border-hairline px-6 py-2">
          <VariableBoard rows={rows} className="min-w-[220px] flex-1" />
          <ExpressionBlock expression={expression} className="min-w-[220px] flex-1" />
        </div>
      ) : null}
    </section>
  );
}

export default AlgorithmWorldPanel;
