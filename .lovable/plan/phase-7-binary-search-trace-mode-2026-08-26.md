# Phase 7 — Binary Search Trace Mode

Trace Mode gives the learner a brand-new input and makes them execute binary search: choose mid, compare, move a boundary, repeat, declare the result. The existing engine run stays the correctness oracle — no second binary search implementation, no engine schema change.

## Where it lives

The lesson shell stays exactly as it is. The visualizer route gains a `stage` search param:

- `/algorithms/binary-search` — Visualize (unchanged, default)
- `/algorithms/binary-search?stage=trace` — Trace It Yourself

Same header, same lesson context row, same stage strip; only the workspace body swaps. This avoids making `$slug` a parent route (which would need an `<Outlet />`) and avoids a parallel product shell. The stage strip's **Trace** chip becomes a real link, and the Guided workspace gains a primary CTA "Trace it yourself →" at the end of the run.

```text
┌──────────────────────────────────────────────────────┐
│ TRACE IT YOURSELF · New example · Binary Search      │
├───────────────────────────┬──────────────────────────┤
│ ALGORITHM WORLD           │ YOUR MOVE                │
│ target chip, array, index │ question + choices       │
│ labels, low/high, mid     │ feedback / hint          │
│ once confirmed, excluded  │ hint · show answer       │
│ region, current range     │ restart trace            │
├───────────────────────────┴──────────────────────────┤
│ Trace progress: Mid ✓ Compare ✓ Boundary ● Mid ○ …   │
└──────────────────────────────────────────────────────┘
```

No source code pane during the trace exercise.

## Exercise data

New curated exercise in content (not in a component): `[4, 9, 15, 21, 34, 47, 58, 63, 79]`, target `58` — different from the guided preset. Shape is generic (`slug`, `algorithmSlug`, `title`, `inputs`) so a not-found exercise or a second algorithm can be added later without touching UI.

## Checkpoint derivation (pure)

`src/lib/trace.ts` — `buildTraceSession(run)` folds the canonical steps into semantic checkpoints using only structural frame data (`pointers`, `ranges`, `comparison`, `states`, `target`, `phase`, next-step pointer diffs). Narration, detail and decision English are never parsed.

Checkpoint types:

- `choose-mid` — from a probe step: current low/high, correct mid index
- `compare` — from a comparison step: mid, value, target, correct relation (`lt` / `eq` / `gt`)
- `move-boundary` — from the diff between the comparison step and the next step's pointers: correct action (`low = mid + 1`, `high = mid - 1`, `return mid`) and the new boundary value
- `result` — found (with index) or absent (`low > high`, no candidates remain)

Each checkpoint also carries the learner-visible state to render *after* it is answered correctly (low, high, mid, excluded region, current range) so the UI never needs future canonical state.

## Trace state

`src/stores/traceStore.ts`, mirroring the prediction store exactly: vanilla Zustand factory + React context provider, nothing global, nothing persisted.

```text
{ runKey, checkpointIndex, entries: { [checkpointId]: { status, attempts, answer, hintLevel, outcome } }, completed }
```

- Only a `correct` (or `revealed`) checkpoint advances `checkpointIndex` and therefore the learner-visible state. Incorrect answers are feedback-only.
- `status`: `unanswered | selected | incorrect | correct | revealed`; `outcome`: `correct-first-try | correct-after-retry | revealed` — structured for future mastery, no XP wiring in this phase.
- Separate from `playerStore` and `predictionStore`; Trace never mutates either.

## Validation

The trace UI derives the expected answer from the canonical checkpoint (which came from the engine run) and compares the learner's selection against it. Midpoint is validated against the *current* boundaries, so after `low` moves the accepted mid changes accordingly.

## No answer leakage

- The renderer only ever receives the state of checkpoints already resolved.
- `mid` marker appears only after a correct/revealed mid selection; boundary moves and exclusions only after a correct/revealed boundary answer.
- Progress strip shows upcoming action *types* only (Mid / Compare / Boundary), never which boundary moves, which index is mid, or whether the next probe finds the target.
- Answer text is absent from the DOM until revealed (not merely hidden), same rule Phase 6 established.

## Hints

Three progressive levels per checkpoint plus a final reveal, generated from the checkpoint's semantic data:

- choose-mid: "Use both current boundaries." → "Compute floor((low + high) / 2)." → "floor((0 + 8) / 2) = ?" → reveal `mid = 4`
- boundary: "34 is smaller than 58." → "Which side holds the larger values?" → reveal `low = mid + 1`

`hintLevel` is per-checkpoint session state; Restart clears it. "Show answer" marks the checkpoint `revealed`, lets the learner continue, and is never counted as independently solved.

## Completion

On the result checkpoint: "Binary Search traced ✓", a candidate-shrink recap (9 → 4 → 2 → found at index 6) computed from the resolved checkpoints, the reasoning checklist, and only the metrics actually tracked (hints used, attempts). Then `Continue to Code →` (inert label — Code stage is not part of this phase). No confetti.

## Restart / leaving

Trace Restart resets checkpoint 0, answers, hints and outcomes, keeps the exercise input, and touches nothing in the guided player or prediction session. Leaving to Visualize and back loses in-memory trace state, which is acceptable for this phase — no backend persistence.

## Accessibility

- Array-cell mid selection uses real `<button>` semantics with index/value labels, plus the keyboard-native choice list for the other questions (same radio pattern as the prediction gate).
- One concise `aria-live` sentence per checked answer ("Correct. Mid is index 4." / "Not quite. Mid must be calculated from low 0 and high 8."), focus moved to the explanation. No repeated array announcements.
- `data-player-keys="off"` on the trace panel so global player shortcuts never eat Space/arrows.
- Reduced motion: correct actions update immediately; no information depends on animation.

## Shared primitives

Extract only where duplication is real: a small `ChoiceGroup` (accessible radio option list) and `LearningFeedback` (correct / not-quite callout) shared by `PredictionGate` and Trace. `PredictionGate` keeps its own composition; no generic mega-component.

## Files

Added
- `src/content/trace-exercises.ts` — curated exercise data (found case; shape supports absent)
- `src/lib/trace.ts` — `buildTraceSession`, checkpoint types, hint derivation (pure)
- `src/stores/traceStore.ts` — scoped factory store + provider
- `src/hooks/useTraceSession.ts` — engine run → checkpoints → current question glue
- `src/components/trace/TraceWorkspace.tsx`, `TraceAlgorithmWorld.tsx`, `TraceMove.tsx`, `TraceProgress.tsx`, `TraceComplete.tsx`
- `src/components/learning/ChoiceGroup.tsx`, `LearningFeedback.tsx`
- `src/lib/__tests__/trace.test.ts`, `src/stores/__tests__/traceStore.test.ts`

Modified
- `src/routes/algorithms.$slug.tsx` — `stage` search param, renders Trace workspace, stage strip active state
- `src/components/workspace/LessonStageStrip.tsx` — Trace becomes a real link when a trace exercise exists
- `src/components/workspace/GoldenWorkspace.tsx` (or playback band) — "Trace it yourself →" CTA
- `src/components/player/PredictionGate.tsx` — use the extracted primitives (no behaviour change)

Engine: `src/engine/algorithms/binarySearch.ts`, `src/engine/types.ts` — unchanged.

## Verification

- Derivation tests on real engine runs: found case, not-found case, and a custom input with no hardcoded example values
- Mid tests: correct accepted, wrong rejected, mid recomputed from new boundaries after a move
- Comparison tests: less / equal / greater
- Boundary tests: larger target → low, smaller → high, equal → result; incorrect answer never mutates trace state
- Hint tests: deterministic progression, restart resets, show-answer marks revealed
- Restart isolation test: guided player + prediction state untouched
- Accessibility tests in the existing style (labels, single live region, keyboard mid selection)
- `bun run typecheck`, `bun run lint`, `bun run test`, plus Playwright screenshots of the nine required states

Stops after Phase 7 — no Code stage, Solve stage, mobile redesign, second algorithm, persistence or AI tutor.
