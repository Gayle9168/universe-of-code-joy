# Phase 3 — Variable Board + Expression System

Goal: at any paused step a student can read low / mid / high / target, see which one just changed, and see the calculation or comparison that produced the current state. Engine untouched.

## Engine schema changes: NONE

Confirmed from `src/engine/algorithms/binarySearch.ts` and `src/engine/types.ts`:

- `pointers` carry `lo`, `hi`, and `mid` only once `mid` exists (setup and the eliminate/boundary step emit `mid: null`), so "reveal mid when the engine has it" is already the natural behaviour — no placeholder needed.
- `target` is on every frame (`{ label, value }`).
- `comparison` (`left` / `op` / `right` / `verdict` / `tone`) is emitted on compare and found steps.
- `decision` (`title` / `detail` / `tone`) is emitted on find-mid, eliminate and found steps — e.g. `mid = floor((0 + 9) / 2) = 4`, `lo moves to 5`, `Found 23 at index 5`.
- `pointer.note` carries `(0 + 9) / 2 = 4` only on frames where the arithmetic is still live (`showMidMath`).

Limitation and the decision it forces: the midpoint arithmetic exists as **display text** in `pointer.note` and `decision.title`. Text parsing is not a reliable data source, so the expression is **recomputed numerically** from the `lo` / `hi` / `mid` pointer indices in the same frame (`floor((lo + hi) / 2)`), which is what `src/lib/variableBoard.ts#midExpression` already does. That guarantees the expression result and the pointer agree by construction. No new engine field is added.

`aux.keyvalue` exists in the `AuxPanel` union but binary search emits no aux panels and the player renders none, so it is not the Phase 3 data source. The derivation layer is written to accept a key-value row list as an additional source so future algorithms (Dijkstra, sliding window) feed the same board without touching the component.

## Variable data source (priority order)

1. `frame.aux` `keyvalue` rows when a module supplies them (generic hook, unused by binary search today).
2. `frame.pointers` (low / mid / high) and `frame.target`.
3. A pure derivation layer diffing `steps[index - 1]` against `steps[index]`.

No slug checks anywhere; no algorithm state recomputed in the UI.

## Architecture: Variable Board + one Current Operation

Replaces the current three-card row (Variable Board / Midpoint Calculation / Comparison) with two regions:

```text
┌──────────────────────┬──────────────────────────┐
│ VARIABLES            │ CURRENT OPERATION        │
│ low   0 → 5          │ MIDPOINT CALCULATION     │
│ mid   4              │ mid = floor((low+high)/2)│
│ high  9              │ floor((0 + 9) / 2)       │
│ target 23            │ = 4                      │
└──────────────────────┴──────────────────────────┘
```

`CurrentOperation` picks exactly one state from the canonical current step, in this order:

| Step | Operation shown | Source |
| --- | --- | --- |
| Setup | none (board takes the full width) | no comparison, no mid |
| Find mid | Midpoint calculation: formula → substitution → result | pointers lo/hi/mid |
| Compare | Comparison: `16 < 23` then `TRUE` + engine verdict | `frame.comparison` |
| Eliminate | Boundary update: `low = mid + 1`, `0 → 5` | `decision` + pointer diff |
| Found | Result: `23 = 23`, found at index n | `comparison` + `decision` |

Only one region ever shows a given comparison, so `16 < 23` is never on screen twice: the comparison lives in the operation panel, and the array canvas keeps only its cell states, pointers and window bracket (no duplicated expression text). `DecisionNote` is folded into the operation panel rather than rendered as a second callout.

## Components

- `src/components/viz/ExpressionView.tsx` — reusable, algorithm-agnostic: renders an ordered list of expression lines each tagged `formula` | `substitution` | `result` | `truth`, with a tone. Sliding window (`sum = sum - nums[left]`), heap parent index, DP recurrence and Dijkstra relaxation all fit this shape without layout changes.
- `src/components/viz/VariableItem.tsx` — one compact labelled variable; renders `0 → 5` when changed, otherwise the plain value.
- `src/components/viz/VariableBoard.tsx` — refined to render `VariableItem`s from derived variables; reflows when `mid` is absent; no oversized boxes.
- `src/components/viz/CurrentOperation.tsx` — chooses and titles the single operation, renders it through `ExpressionView`.
- `ExpressionBlock.tsx` and `ComparisonCard.tsx` are removed once `CurrentOperation` covers both; `DecisionNote.tsx` becomes internal to the operation panel or is deleted if unused.

## Pure derivation layer (`src/lib/variables.ts`, extending `src/lib/variableBoard.ts`)

- `deriveVariables(previousStep, currentStep): Variable[]` → `{ name, label, current, previous?, changed }`, ordered low, mid, high, target; omits `mid` when the frame has no mid pointer; `target.changed` is false unless the value itself differs.
- `deriveOperation(previousStep, currentStep): Operation | null` → discriminated union (`midpoint` | `comparison` | `boundary` | `result`) plus the `ExpressionLine[]` it renders and an accessible sentence.
- Pure, no mutation, no React, no stores. Both take only step data already on screen.

## Synchronization guarantees

Every value is a pure function of `run.steps[index]` from `playerStore` (`useCurrentStep`), with `steps[index - 1]` used only for diffing. There is no local copy of variables, no timer-driven state, and no derived state stored in `useState`, so Next / Previous / timeline seek / autoplay all recompute board, operation, pointers, code line and reasoning from the same index in one render — a stale `0 → 5` or a stale formula is not representable. Mid consistency is guaranteed because the board value, the pointer index and the expression result all read the same `mid` pointer.

## Motion and reduced motion

Changed values and operation content cross-fade with the existing `viz-swap` teaching transition (no rolling counters, no progressive reveal that delays the canonical state). Unchanged variables, including `target`, do not re-key and so never re-animate. Under `prefers-reduced-motion` / `data-reduced-motion` the global rules collapse transitions to 0s; the full state including `0 → 5` and the complete expression renders instantly, and each changed variable carries an accessible sentence (`low changed from 0 to 5`) plus one concise operation sentence, so nothing educational is motion-dependent.

## Responsive

Desktop primary. Variables and Current Operation sit side by side and stack at narrow desktop/tablet widths; expression type sizes stay at the design-system mono sizes rather than shrinking. No mobile redesign.

## Tests

New `src/lib/__tests__/variables.test.ts` plus updates to `variable-board.test.ts` and `viz-state.test.ts`:

- change detection: low 0→5 changed, high 9 unchanged;
- mid consistency: board value, mid pointer index and expression result agree on every find-mid step of a real generated run;
- target stability across all steps of a run;
- no leakage: variables derived at step n show no `previous` when nothing moved, stepping back restores the earlier state;
- conditional operation: setup → none, find mid → midpoint, compare → comparison, eliminate → boundary, found → result;
- absent `mid` produces no mid row (never `mid = 0` or `—`).

## Verification

`bun run typecheck`, `bun run lint`, `bun run test` all green, plus Playwright screenshots at desktop width for Setup, Midpoint calculation, Comparison, boundary change (low/high moved) and Found.

## Not doing

No prediction, no trace, no coding challenges, no other algorithms, no engine or player architecture change, no reasoning copy rework, no mobile redesign. Work stops at the end of Phase 3.
