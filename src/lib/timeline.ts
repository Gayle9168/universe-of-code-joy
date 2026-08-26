import type { Step } from "@/engine/types";

/**
 * Semantic timeline construction.
 *
 * Nodes are generated from the actual engine steps: one node per run of
 * *consecutive* steps sharing a label, so a repeated Find mid / Compare /
 * Eliminate cycle produces a separate, separately seekable node per execution
 * event. Nothing about any specific algorithm is encoded here — the label comes
 * from `timelineLabel`, falling back to `phase`.
 *
 * Architecture constraint: pure functions only — no React, DOM or stores.
 */

export interface TimelineNode {
  label: string;
  /** First step index in this group — where clicking the node seeks. */
  from: number;
  /** Last step index in this group. */
  to: number;
  /** True when any step in the group is a milestone. */
  milestone: boolean;
}

export function buildTimelineNodes(steps: readonly Step[]): TimelineNode[] {
  const out: TimelineNode[] = [];
  steps.forEach((step, i) => {
    const label = step.timelineLabel ?? step.phase;
    const last = out[out.length - 1];
    if (last && last.label === label && last.to === i - 1) {
      last.to = i;
      last.milestone = last.milestone || Boolean(step.isMilestone);
    } else {
      out.push({ label, from: i, to: i, milestone: Boolean(step.isMilestone) });
    }
  });
  return out;
}

/** Index of the node containing `stepIndex`, or -1. */
export function activeNodeIndex(nodes: readonly TimelineNode[], stepIndex: number): number {
  return nodes.findIndex((nd) => stepIndex >= nd.from && stepIndex <= nd.to);
}
