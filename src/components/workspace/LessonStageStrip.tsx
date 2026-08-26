import * as React from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export type LessonStage =
  | "concept"
  | "watch"
  | "visualize"
  | "predict"
  | "trace"
  | "code"
  | "solve";

const STAGES: Array<{ id: LessonStage; label: string }> = [
  { id: "concept", label: "Concept" },
  { id: "watch", label: "Watch" },
  { id: "visualize", label: "Visualize" },
  { id: "predict", label: "Predict" },
  { id: "trace", label: "Trace" },
  { id: "code", label: "Code" },
  { id: "solve", label: "Solve" },
];

export interface LessonStageStripProps {
  /** The stage this screen is. */
  active: LessonStage;
  /** Question slug for the Solve stage; null disables it. */
  practiceSlug: string | null;
  /** Algorithm the Trace and Visualize links point at. */
  algorithmSlug?: string;
  /** True when this algorithm has a hand-trace exercise; false keeps it inert. */
  traceAvailable?: boolean;
  className?: string;
}

/**
 * The learning-journey strip: Concept — Watch — Visualize — Predict — Trace —
 * Code — Solve. Stages without their own screen yet render as inert labels
 * rather than dead links.
 */
export function LessonStageStrip({
  active,
  practiceSlug,
  algorithmSlug,
  traceAvailable = false,
  className,
}: LessonStageStripProps): React.ReactElement {
  return (
    <nav
      aria-label="Lesson stages"
      className={cn("flex items-center gap-1 overflow-x-auto", className)}
    >
      {STAGES.map((stage) => {
        const isActive = stage.id === active;
        const base =
          "inline-flex h-7 shrink-0 items-center rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors";
        if (isActive) {
          return (
            <span
              key={stage.id}
              aria-current="step"
              className={cn(base, "bg-tint font-semibold text-primary")}
            >
              {stage.label}
            </span>
          );
        }
        /* Trace and Visualize are the same route with a different stage param,
           so the header, lesson context row and this strip never remount. */
        if (algorithmSlug && (stage.id === "trace" ? traceAvailable : stage.id === "visualize")) {
          return (
            <Link
              key={stage.id}
              to="/algorithms/$slug"
              params={{ slug: algorithmSlug }}
              search={(prev: Record<string, unknown>) => ({
                ...prev,
                ...(stage.id === "trace" ? { stage: "trace" as const } : { stage: undefined }),
              })}
              className={cn(base, "text-slate hover:bg-tint hover:text-ink")}
            >
              {stage.label}
            </Link>
          );
        }
        if (stage.id === "solve" && practiceSlug) {
          return (
            <Link
              key={stage.id}
              to="/practice/$slug"
              params={{ slug: practiceSlug }}
              className={cn(base, "text-slate hover:bg-tint hover:text-ink")}
            >
              {stage.label}
            </Link>
          );
        }
        return (
          <span key={stage.id} className={cn(base, "text-slate-soft")}>
            {stage.label}
          </span>
        );
      })}
    </nav>
  );
}

export default LessonStageStrip;
