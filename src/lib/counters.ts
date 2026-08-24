import type { AlgorithmRun, Step } from "@/engine/types";

/**
 * The counters to show for one step, padded with every counter the run will
 * ever show.
 *
 * A counter does not exist on a step until its first `bump`, so binary search's
 * step 0 carries `{linear worst: 10}` and only grows a `comparisons` entry once
 * the first probe happens. Rendered directly, the strip starts one column wide
 * and gains columns as the run plays, shoving everything beside it sideways.
 * Padding the missing ones to 0 fixes the column set for the whole run.
 *
 * `run.totalCounters` is the last step's snapshot and counters never decrease,
 * so its keys are exactly the set any step can have. Its key order is the order
 * the algorithm first bumped them, which is the order they render in.
 */
export function paddedCounters(
  run: Pick<AlgorithmRun, "totalCounters"> | null,
  step: Pick<Step, "counters"> | null,
): Record<string, number> {
  if (!run) return {};
  const live = step?.counters ?? {};
  const padded: Record<string, number> = {};
  for (const name of Object.keys(run.totalCounters)) padded[name] = live[name] ?? 0;
  // A counter the last step somehow lacks still renders rather than vanishing.
  for (const [name, value] of Object.entries(live)) padded[name] ??= value;
  return padded;
}
