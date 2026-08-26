# Phase 4 — Golden Reasoning System

Turn the Reasoning panel into four calm, semantically derived layers — What happened / Why / Invariant / Next — driven entirely by the current step. No engine schema change, no new navigation state.

## What is there today

- `ExplainPane` (`src/components/player/WorkspacePanels.tsx`) already renders four sections, but the content is raw: What happened = `step.narration`, Why = `step.detail` (often 2–3 sentences), Invariant = generic `invariantFor(frame)`, Next = the *next step's* full narration prefixed with "Next: ".
- `invariantFor` in `src/lib/variableBoard.ts` returns `null` once `lo > hi`, so a failed search currently ends with **no** invariant/result line at all.
- Binary search phases actually emitted: `setup`, `probe`, `compare`, `narrow-left`, `narrow-right`, `found`, `done`.
- Two live regions announce overlapping content on every step: the sr-only region in `AlgorithmWorldPanel` (step number + narration) and the `aria-live` wrapper around the whole reasoning body in `ExplainPane`.

## What changes

1. **New pure helper** `src/lib/reasoning.ts` with `deriveReasoning(current, previous, next)` returning
   `{ happened, why?, invariant?, next?, accessibleSummary }`.
   - Selected by `step.phase`; all values interpolated from semantic frame data only — `pointers` (lo/mid/high), `frame.target`, `frame.values[mid]`, `frame.ranges`, `frame.comparison` (left/op/right/tone), `frame.decision`, `isMilestone`. No parsing of English strings.
   - Terminology fixed to low / mid / high / target / search range, via the existing `pointerLabel` map.
   - `happened`: one short clause per phase (5–15 words).
   - `why`: the logical justification per phase; for the first elimination (`isMilestone` compare) it adds the sorted-order misconception line, not on later iterations.
   - `invariant`: `If <target> exists, its index is between <low> and <high>.` recomputed from the *current* frame range; on `found` → `arr[i] = target`; when the range is empty → `No candidate index remains.`
   - `next`: phase-derived orientation sentence (setup → calculate midpoint; probe → compare arr[mid] with target; compare → discard the impossible half; narrow → midpoint of the smaller range). Omitted on `found` / `done`.
   - `accessibleSummary`: one concise sentence, e.g. "Step 4. 16 is smaller than 23. Indices 0 to 4 can be eliminated."

2. **`ExplainPane` rewired** to render `deriveReasoning(...)` instead of raw narration/detail. Same visual shell (one panel, mono uppercase micro-headings, subtle separators, teal-tinted invariant line, single `viz-swap` transition keyed on step index) — no new cards, no icons, no shadows. Sections with no value are not rendered. The body scroll container resets to top on step change (`scrollTop = 0`, no focus change).
   The existing "Next step" arrow button stays; its label comes from the derived `next` text.

3. **Live regions de-duplicated**: the reasoning body loses `aria-live`; the single sr-only region in `AlgorithmWorldPanel` announces `accessibleSummary` instead of the raw narration, so one message per step total.

4. **`invariantFor`** kept but extended to return the empty-range/result wording; `src/lib/__tests__/variable-board.test.ts` updated accordingly. Engine, player store, CurrentOperation, VariableBoard, CodePane and timeline are untouched.

## Tests

New `src/lib/__tests__/reasoning.test.ts`, run against real engine output from `binarySearchModule` (not fixtures): setup / find-mid / compare-less / compare-greater / low-move / high-move / found / not-found; invariant tracks the updated boundary (explicit "not 0 and 9 after low moves to 5"); no `next` on found or not-found; a second run with a different array/target/absent target and a single-element array to prove nothing is hardcoded; and a synchronization test asserting reasoning, frame, pointers, operation and `codeLine` all come from `run.steps[index]`.

## Verification

`bun run typecheck`, `bun run test`, `bun run lint`, plus Playwright screenshots at 1440x900 for setup, find midpoint, less-than compare, greater-than compare, boundary move, found, and not found.
