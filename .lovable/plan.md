# Phase 6 — Prediction Gate / Active Reasoning

Add one deterministic "predict before reveal" checkpoint to the Golden Binary Search lesson. At the first meaningful branch comparison, playback pauses and the Reasoning card becomes a question. Everything that reveals the branch stays hidden until the learner answers, reveals, or skips.

No engine changes: `Step`, `Frame`, `ArrayFrame` schemas and the player execution index stay exactly as they are.

## Experience

At the first branch comparison (e.g. `16 < 23` TRUE):

- Visible: array with indices/values, official range `[0..9]`, target, low/mid/high on the Variable Board, the comparison expression with TRUE/FALSE, the active comparison code line.
- Hidden: decision preview tint and `Preview: [5..9] would survive`, the `Discard the left half` decision line in Current Operation, Why, Invariant, and `Next:` in Reasoning.
- The Reasoning card becomes `Your turn`: a radio group (`low = mid + 1`, `high = mid - 1`, `return mid`, `target not found`) plus **Check answer**.
- Correct → calm check mark, one-sentence causal explanation, **Continue**. Continue resolves the gate **on the same Compare step**: it never touches `currentStepIndex`. The revealed preview / decision / Why / Invariant / Next appear on that same step, and the learner uses the existing Next/Play to enter Eliminate. Sequence: `Compare → Prediction → Correct → Continue → reveal on Compare → Next → Eliminate`.
- Incorrect → calm, non-red "Not quite" with a misconception sentence for the chosen option, **Try again** (restores the answer interaction), plus a quiet **Show answer**. `selected` and `incorrect` both stay **blocking**: nothing advances, and no preview / decision / Why / Invariant / Next is exposed.
- Show answer → correct option marked, explanation shown, outcome recorded as `revealed` (never `correct`).


## Checkpoint derivation (pure, deterministic)

New `src/lib/prediction.ts`:

- `buildPredictionCheckpoints(steps)` — scans the canonical run for the first step whose frame carries a `comparison` with a non-equality operator **and** whose next step moves a boundary pointer (`lo`/`hi`). Returns at most one checkpoint for Phase 6, `{ id, stepIndex }`. No slug checks, no randomness, no English-string parsing.
- `derivePrediction(current, next, context)` — returns `{ id, question, context, options, correctOptionId, explanation, misconceptionFeedback, accessiblePrompt }`. The correct option is decided from semantic state only: comparison operands/operator, mid, low/high, target, and the pointer that actually changes in the next step. Handles the three cases generically — target larger → `low = mid + 1`, target smaller → `high = mid - 1`, equality → `return mid` (supported and tested, not surfaced in the default run).

## Prediction state architecture

New `src/stores/predictionStore.ts` — zustand **factory plus React context**, exactly like `createPlayerStore` / `PlayerStoreProvider`, so each visualizer/workspace instance owns its own interaction state and two instances can never interfere. In-memory only, not persisted, and it holds no step index: the canonical `currentStepIndex` in `playerStore` stays the one and only playback position (no `predictionStepIndex`, no second player).

- `runKey: string | null` plus `entries: Record<checkpointId, { status: "unanswered" | "selected" | "incorrect" | "correct" | "revealed" | "skipped"; selectedOptionId?: PredictionOptionId; attempts: number; outcome?: PredictionOutcome; continued: boolean }>`.
- Resolution rule: only `correct`, `revealed` and `skipped` resolve a checkpoint. `unanswered`, `selected` and `incorrect` keep it blocking.
- `PredictionOutcome = "correct-first-try" | "correct-after-retry" | "revealed" | "skipped"` — learning metadata only; no XP/mastery wiring.
- `predictionRunKey(slug, rawInputs)` is a pure helper that sorts the raw-input keys before serializing, so equivalent input objects built in any property order always produce the identical key. Changing the key drops entries, so nothing leaks between runs or algorithms.
- `resetEntries()` runs on Replay/Restart (return to step 0) so the checkpoint becomes answerable again and no stale "Correct!" survives.
- New hook `src/hooks/usePredictionGate.ts` combines checkpoints, the canonical `index` and store state into `{ checkpoint, prediction, entry, isBlocking, revealAllowed, showGate, skipCrossedForward(target) }`. `isBlocking` is true only while the player sits exactly on an unresolved checkpoint step.

## Leak prevention

`revealAllowed` (false until the checkpoint is resolved) is threaded as an explicit prop — no presentation component reads prediction state itself:

- `AlgorithmWorldPanel` passes `revealDecision={revealAllowed}` to `ArrayCanvas` (suppresses the `decisionPreview` caption and any surviving-range preview tint) and to `CurrentOperation` (drops the decision/result line, keeping only the comparison expression and its TRUE/FALSE verdict).
- `ExplainPane` renders `PredictionGate` instead of Why / Invariant / Next while unresolved; only the neutral `What happened` comparison sentence stays.
- The code pane follows `codeLine` of the current Compare step, so the boundary line is never highlighted early — no change needed.

## Player integration

- `useAutoplay`: when the gate is blocking, pause and schedule no timer. No second timer, no second index.
- `ControlStrip` / `ExplainPane` Next: disabled while blocking; Previous, Restart and speed remain available.
- `usePlayerKeys`: while blocking, `ArrowRight`, `Shift+ArrowRight`, `End` and `Space` are ignored; the gate uses native `input[type=radio]` in a `role="radiogroup"` plus real buttons, and focus inside those controls suppresses global shortcuts so Space never starts playback.
- `StepTimeline` seek: a checkpoint is marked `skipped` **only when the learner crosses forward past it** (target step index beyond an unresolved checkpoint the player has not passed). Backward seeks, seeking to the checkpoint step itself and Previous never mark it skipped.


## Accessibility

- Gate is a `<section aria-labelledby>` with heading "Prediction checkpoint", a labelled radio group, and a single `aria-live="polite" aria-atomic="true"` region used only for the one feedback sentence (correct / not quite / revealed). The workspace summary live region is suppressed while blocking so only one announcement fires.
- Focus moves to the feedback region heading after Check answer; Continue is reachable by Tab. Reduced motion removes only the cross-fade.

## Files

Added: `src/lib/prediction.ts`, `src/stores/predictionStore.ts`, `src/hooks/usePredictionGate.ts`, `src/components/player/PredictionGate.tsx`, tests `src/lib/__tests__/prediction.test.ts`, `src/lib/__tests__/prediction-leak.test.ts`, `src/stores/__tests__/predictionStore.test.ts`.

Modified: `src/components/player/WorkspacePanels.tsx` (ExplainPane gate branch), `src/components/workspace/AlgorithmWorldPanel.tsx`, `src/components/viz/ArrayCanvas.tsx`, `src/components/viz/CurrentOperation.tsx` (reveal prop), `src/components/player/ControlStrip.tsx`, `src/components/player/StepTimeline.tsx`, `src/hooks/useAutoplay.ts`, `src/hooks/usePlayerKeys.ts`.

Untouched: everything in `src/engine/`.

## Verification

- Derivation tests over real Binary Search runs (target larger, smaller, equality, custom inputs) with no hardcoded 16/23/index 4.
- Leak tests: at the unresolved checkpoint, preview / decision / Why / Invariant / Next absent; comparison, variables, range, code line present.
- Player tests: autoplay pauses at checkpoint, Next blocked, Previous works, Continue then advances, incorrect never advances, Show answer yields non-correct outcome, timeline skip marks skipped, Replay and custom input reset state.
- Accessibility tests: labelled options, single feedback announcement, shortcuts inert while a gate control has focus.
- `bun run typecheck`, `bun run test`, `bun run lint`, plus Playwright screenshots for unanswered / selected / incorrect / correct / revealed decision / Eliminate.

Then stop — no separate Predict stage, no Trace, no other algorithm.
