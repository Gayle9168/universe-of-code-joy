# Phase 2 — Binary Search Golden Execution

Make Binary Search *visibly think*. The engine already emits everything needed; this phase is UI interpretation only.

## Engine schema changes: NONE

`src/engine/algorithms/binarySearch.ts` already emits, per step: `target`, `pointers` (`lo`/`hi`/`mid` with `color` and a `note` carrying `(lo + hi) / 2 = mid`), `ranges` (the live window with a candidate-count label), `states` (`excluded` outside the window, `frontier` for the surviving half *before* the cut, `compare` on the probe, `found`), `comparison` (`left`/`op`/`right`/`verdict`/`tone`), `decision` (`title`/`detail`/`tone`), plus `phase`, `timelineLabel`, `isMilestone`, `codeLine`. The step sequence is already Setup → Find mid → Compare → Eliminate → … → Found / Not found, with the survivor half lit one step before the discard. No new fields are required.

The real gap is that the UI throws information away: `frame.decision` is rendered nowhere in the Golden workspace, `comparison.verdict` is never shown, and in `ArrayCanvas` a candidate cell and an excluded cell are nearly identical (both `border-hairline bg-card`, differing only in text colour).

## What changes visually

**1. Cell state grammar (the region story).** `ArrayCanvas` gets a deterministic state-priority treatment — found > compare > frontier > candidate (in-window idle) > excluded — where every state carries a non-colour signal too:
- candidate: card surface with a visible hairline and full opacity
- frontier (surviving half, shown before the cut): tint fill + accent hairline
- compare (the probe): strongest accent border, semibold value
- excluded: reduced opacity, muted value, and a small `Ban` mark from the existing `StateIcon` vocabulary, so "still exists, proven irrelevant" reads without colour
- found: strongest existing found treatment with one short emphasis transition

Cells keep their keys and DOM identity; only state classes change.

**2. Causal chain, not three unrelated cards.** The teaching row under the array becomes an explicit cause → consequence column when the step has that data:

```text
active cell  16
      ↓
   16 < 23
      ↓
   TRUE
      ↓
→ Search right
```

- `ComparisonCard` renders the expression *and* the verdict line (`TRUE` plus the engine's plain-English `verdict`), toned from `comparison.tone`.
- A new small `DecisionNote` presentation component renders `frame.decision` (title + detail, toned) — currently unused engine data. It is a concise inline note, not a large permanent card, and it disappears when the step carries no decision.
- Cards still only appear when their data exists (Phase 1.5 rule preserved): setup shows no comparison and no midpoint card.

**3. Pointer identity and emphasis.** Markers stay persistent and travel (already implemented). `AlgorithmWorldPanel` already holds the previous frame; it passes the set of pointer names whose index changed to `ArrayCanvas`, so only the boundary that actually moved gets the brief emphasis — unchanged pointers stay visually still. Collision lanes stay as-is.

**4. Variable board shows the movement.** Changed rows render `0 → 5` (previous value, arrow, new value) instead of just a highlight, using the previous frame already passed to `variableRows`.

**5. Attention order.** One primary event per step is enforced by the engine's step split (find mid, compare, eliminate are separate steps), so the UI adds no simultaneous animation: emphasis is applied to the element the current step is about and nothing else.

## Playback, rapid stepping, reduced motion

- Existing `playerStore`, `useAutoplay`, keyboard, timeline seek, restart and speed are untouched. No second player, no animation clock.
- Rapid Next/Previous: every visual is a pure function of `steps[index].frame` (plus the previous frame for diffing) — there is no queued animation state to strand, so the interface always settles on the canonical current step. The only retained state is the persistent marker list and last-known pointer index, which are re-derived each render.
- Reduced motion: the global `prefers-reduced-motion` / `data-reduced-motion` rules in `styles.css` collapse every transition, autoplay is already disabled under reduced motion, and all information (pointer position, active value, comparison, verdict, excluded marks, new boundary, found state) is rendered as static content rather than as motion.

## Code and reasoning synchronization

No hardcoded step→line mapping. Verification only: confirm the highlighted line for each step resolves through the existing `codeMap` for JS, TS and Python, and that the reasoning sections read `steps[index]` exclusively (no independent navigation state).

## Files

Modified: `src/components/viz/ArrayCanvas.tsx`, `src/components/viz/ComparisonCard.tsx`, `src/components/viz/VariableBoard.tsx`, `src/components/workspace/AlgorithmWorldPanel.tsx`, `src/lib/variableBoard.ts`.

Added: `src/components/viz/DecisionNote.tsx`, a pure `cellTreatment`/state-priority helper in `src/lib/vizState.ts` with tests in `src/lib/__tests__/viz-state.test.ts`, plus a step-synchronization test.

Architecture rules kept: `viz/*` stays `(props) => JSX` with no store/router imports; `lib/*` stays pure with unit tests; no engine, store, or route changes.

## Verification

- `bun run typecheck`, `bun run lint`, `bun run test` (existing suites must stay green).
- Behavioural cases through the existing custom-input path: found after several eliminations (target 23), target smaller than mid (high moves), target larger than mid (low moves), target at the initial mid, target absent, one-element array, duplicates — each must validate, regenerate steps, reset playback and terminate correctly.
- Playwright screenshots of Initialize, Find mid, Compare, Eliminate / boundary move, and Found at desktop width.

## Not doing

No prediction, no trace, no other algorithms, no mobile redesign, no gamification, no engine or Step/Frame/ArrayFrame changes. Work stops after this phase.
