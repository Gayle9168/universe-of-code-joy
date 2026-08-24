/**
 * Search-param shape for the algorithm visualizer, and the one rule about
 * updating it.
 *
 * Lives outside the route file so the route keeps exporting only its `Route` and
 * components — `react-refresh/only-export-components` warns on anything else, and
 * this needs to be importable by tests.
 */

/** Validated search params for /algorithms/$slug. */
export interface AlgorithmSearch {
  input?: string;
  step?: number;
  /**
   * Set when the user arrived from a question card on /explore.
   *
   * Two jobs: it retargets the "Practice" button at the question they clicked,
   * and — when that question owns an engine module — it selects the module the
   * canvas plays. The second job is why it must never be dropped from the URL.
   */
  problem?: string;
}

/**
 * The search params to write back after a step or input change.
 *
 * Merge-based on purpose. The debounced URL write used to build a fresh
 * `{ input, step }` object, which silently dropped `problem` 300ms after load.
 * That was harmless while `problem` only retargeted the Practice button, but now
 * that it also chooses the module, dropping it made a question visualizer reload
 * itself as its parent algorithm while the user watched. Everything already in
 * `prev` survives.
 */
export function mergePlayerSearch(
  prev: AlgorithmSearch,
  input: string,
  step: number,
): AlgorithmSearch {
  return { ...prev, input, step };
}
