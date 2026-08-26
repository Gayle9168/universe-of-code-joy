/**
 * Curated "Trace it yourself" exercises.
 *
 * Data only — no React, no engine calls. The exercise names an algorithm module
 * slug plus the raw inputs that module validates, so the canonical run (and
 * therefore the correct answers) always comes from the engine, never from here.
 *
 * The guided visualizer teaches with the module's first preset; a trace exercise
 * MUST use a different input, otherwise the learner is replaying a memorised
 * example instead of executing the algorithm.
 */

export interface TraceExercise {
  /** Stable id, used in checkpoint ids and the trace run key. */
  slug: string;
  /** Algorithm this exercise traces; matches the engine registry slug. */
  algorithmSlug: string;
  title: string;
  /** One line under the title, e.g. "New example · Binary Search". */
  subtitle: string;
  /** Raw inputs in the module's own `validate` shape. */
  inputs: Record<string, string>;
}

export const traceExercises: TraceExercise[] = [
  {
    slug: "binary-search-trace-1",
    algorithmSlug: "binary-search",
    title: "Trace it yourself",
    subtitle: "New example · Binary Search",
    inputs: { values: "4, 9, 15, 21, 34, 47, 58, 63, 79", target: "58" },
  },
];

export function getTraceExercise(algorithmSlug: string): TraceExercise | undefined {
  return traceExercises.find((e) => e.algorithmSlug === algorithmSlug);
}

export function hasTraceExercise(algorithmSlug: string): boolean {
  return getTraceExercise(algorithmSlug) !== undefined;
}
