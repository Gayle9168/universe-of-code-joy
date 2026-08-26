import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { cn } from "@/lib/utils";
import type { Algorithm, Difficulty } from "@/content/types";

export interface LessonContextRowProps {
  heading: string;
  difficulty: Difficulty | undefined;
  estMinutes: number;
  complexity: string;
  masteryPct: number;
  practiceSlug: string | null;
  className?: string;
}

/**
 * One compact row of lesson context under the global nav — name, difficulty,
 * time, complexity, mastery — replacing the tall hero block so the workspace
 * keeps the vertical space for learning.
 */
export function LessonContextRow({
  heading,
  difficulty,
  estMinutes,
  complexity,
  masteryPct,
  practiceSlug,
  className,
}: LessonContextRowProps): React.ReactElement {
  return (
    <div className={cn("flex min-w-0 items-center gap-4", className)}>
      <h1 className="shrink-0 truncate font-display text-[19px] font-semibold tracking-tight text-ink">
        {heading}
      </h1>
      {difficulty ? <DifficultyBadge difficulty={difficulty} /> : null}
      <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-slate">
        <Clock size={13} strokeWidth={1.5} /> {estMinutes} min
      </span>
      <span className="font-mono text-[12px] text-slate">{complexity}</span>

      <div className="ml-auto flex shrink-0 items-center gap-4">
        <span className="inline-flex items-center gap-2 font-mono text-[12px] text-slate">
          Mastery
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-hairline">
            <span
              className="block h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, masteryPct))}%` }}
            />
          </span>
          <span className="tabular-nums font-medium text-ink">{Math.round(masteryPct)}%</span>
        </span>
        <Link
          to="/practice/$slug"
          params={{ slug: practiceSlug ?? "" }}
          disabled={!practiceSlug}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full px-4 font-sans text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            practiceSlug
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "pointer-events-none cursor-default bg-primary/40 text-primary-foreground",
          )}
        >
          Practice <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

/** Convenience: the complexity label shown in the context row. */
export function averageComplexity(algo: Algorithm): string {
  return algo.timeAvg;
}

export default LessonContextRow;
