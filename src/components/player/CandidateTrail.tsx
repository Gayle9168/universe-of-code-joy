import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/playerStore";
import { useIsReducedMotion } from "@/hooks/useReducedMotionSync";
import { candidateTrail, fullCandidateTrail, isShrinkingTrail } from "@/lib/candidates";

/**
 * The shrinking search space, as a running trail: `16 → 8 → 4 → 2 → 1`.
 *
 * This is the only place O(log n) appears as a number the learner can watch
 * rather than a claim in prose. Entries appear as they are reached, so the trail
 * grows with playback instead of spoiling the ending.
 *
 * Renders nothing unless the run's candidate count only ever falls (see
 * `isShrinkingTrail`) — quicksort and sliding-window also exclude cells, but
 * theirs come back, and a halving trail would misdescribe them.
 */
export interface CandidateTrailProps {
  className?: string;
}

export function CandidateTrail({ className }: CandidateTrailProps): React.ReactElement | null {
  const run = usePlayerStore((s) => s.run);
  const index = usePlayerStore((s) => s.index);
  const reduced = useIsReducedMotion();

  const steps = run?.steps;
  // The whole run decides whether the trail is honest and how wide it will get;
  // computing it from the steps played so far would let the strip appear
  // mid-run and resize the row under the array on every narrowing step.
  const full = React.useMemo(() => (steps ? fullCandidateTrail(steps) : []), [steps]);
  const shown = React.useMemo(() => (steps ? candidateTrail(steps, index) : []), [steps, index]);

  if (!isShrinkingTrail(full)) return null;

  return (
    <div className={cn("flex items-baseline gap-2 font-mono text-[12px]", className)}>
      <span className="t-mono-label text-slate">candidates</span>
      <span className="flex items-baseline gap-1.5">
        {full.map((count, i) => {
          const reached = i < shown.length;
          const current = i === shown.length - 1;
          return (
            <React.Fragment key={`${i}-${count}`}>
              {i > 0 && (
                <span aria-hidden="true" className={reached ? "text-slate" : "text-slate/25"}>
                  →
                </span>
              )}
              <motion.span
                className={cn(
                  "tabular-nums",
                  current ? "font-semibold text-ink" : reached ? "text-slate" : "text-slate/25",
                )}
                initial={false}
                animate={{ opacity: reached ? 1 : 0.55, scale: current && !reduced ? 1.15 : 1 }}
                transition={
                  reduced ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
                }
              >
                {/* Not-yet-reached entries are placeholders: they hold the width
                    so the row cannot jump, without revealing the count early. */}
                {reached ? count : "·".repeat(String(count).length)}
              </motion.span>
            </React.Fragment>
          );
        })}
      </span>
    </div>
  );
}

export default CandidateTrail;
