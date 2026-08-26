# Phase 6 — Prediction Gate / Active Reasoning

Add one deterministic "predict before reveal" checkpoint to the Golden Binary Search lesson. At the first meaningful branch comparison, playback pauses and the Reasoning card becomes a question. Everything that reveals the branch stays hidden until the learner answers, reveals, or skips.

No engine changes: `Step`, `Frame`, `ArrayFrame` schemas and the player execution index stay exactly as they are.

## Experience

At the first branch comparison (e.g. `16 < 23` TRUE):

- Visible: array with indices/values, official range `[0..9]`, target, low/mid/high on the Variable Board, the comparison expression with TRUE/FALSE, the active comparison code line.
- Hidden: decision preview tint and `Preview: [5..9] would survive`, the `Discard the left half` decision line in Current Operation, Why, Invariant, and `Next:` in Reasoning.
- The Reasoning card becomes `Your turn`: a radio group (`low = mid + 1`, `high = mid - 1`, `return mid`, `target not found`) plus **Check answer**.
- Correct → calm check mark, one-sentence causal explanation, **Continue**. Continue resolves the gate in place (does not auto-advance), so the now-revealed preview / Why / Invariant / Next become visible on the same step; the learner then steps to Eliminate.
- Incorrect → calm, non-red "Not quite" with a misconception sentence for the chosen option, **Try again**, plus a quiet **Show answer**. The step never advances.
- Show answer → correct option marked, explanation shown, outcome recorded as `revealed`.

## Checkpoint derivation (pure, deterministic)

New `src/lib/prediction.ts`:

- `buildPredictionCheckpoints(steps)` — scans the canonical run for the first step whose frame carries a `comparison` with a non-equality operator **and** whose next step moves a boundary pointer (`lo`/`hi`). Returns at most one checkpoint for Phase 6, `{ id, stepIndex }`. No slug checks, no randomness, no English-string parsing.
- `derivePrediction(current, next, context)` — returns `{ id, question, context, options, correctOptionId, explanation, misconceptionFeedback, accessiblePrompt }`. The correct option is decided from semantic state only: comparison operands/operator, mid, low/high, target, and the pointer that actually changes in the next step. Handles the three cases generically — target larger → `low = mid + 1`, target smaller → `high = mid - 1`, equality → `return mid` (supported and tested, not surfaced in the default run).

## Prediction state architecture

New `src/stores/predictionStore.ts` (zustand, in-memory, not persisted, separate from `progressStore` and from `playerStore`):

- `runKey: string | null` plus `entries: Record<checkpointId, { status: "unanswered" | "selected" | "incorrect" | "correct" | "revealed"; selectedOptionId?: string; attempts: number; outcome?: PredictionOutcome }>`.
- `PredictionOutcome = "correct-first-try" | "correct-after-retry" | "revealed" | "skipped"` — learning metadata only; no XP/mastery wiring.
- `runKey` is derived deterministically from the player's `slug` + serialized `rawInputs` (new pure `predictionRunKey()` helper). When the key changes (custom input, different algorithm) entries are dropped, so a solved checkpoint cannot leak into a new run.
- `reset()` is called on Replay/Restart so the checkpoint becomes answerable again.
- New hook `src/hooks/usePredictionGate.ts` combines the checkpoint list, the canonical `index`, and store state into `{ checkpoint, prediction, status, isBlocking, revealAllowed }`. `isBlocking` is true only while the player sits exactly on an unresolved checkpoint step.

## Leak prevention

`revealAllowed` (false while blocking) is threaded as an explicit prop — no component reads prediction state itself except the gate:

- `AlgorithmWorldPanel` passes `revealDecision={revealAllowed}` to `ArrayCanvas` (suppresses `decisionPreview` caption and preview tint) and to `CurrentOperation` (drops `result`/decision lines and the verdict note, keeping the comparison + TRUE/FALSE).
- `ExplainPane` renders `PredictionGate` instead of Why / Invariant / Next while blocking; `What happened` (the neutral comparison sentence) stays.
- The code pane already follows `codeLine` of the current step, so no change is needed — the boundary line is never highlighted early.

## Player integration

- `useAutoplay`: when the gate is blocking, pause and do not schedule a timer. No second timer, no second index.
- `ControlStrip` / `ExplainPane` Next: disabled while blocking (`aria-disabled` + tooltip-free label "Answer the prediction to continue"); Previous, Restart, and speed remain available.
- `usePlayerKeys`: while blocking, `ArrowRight`, `Shift+ArrowRight`, `End` and `Space` are ignored; `isTypingTarget` is extended so radio/button controls inside the gate swallow Space/Enter (gate markup uses native `input[type=radio]` in a `role="radiogroup"` plus real buttons).
- `StepTimeline` seek past an unresolved checkpoint: marks it `skipped` (outcome `"skipped"`) and seeks normally. Past steps stay seekable.

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
