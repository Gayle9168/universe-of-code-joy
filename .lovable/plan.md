# Phase 5 — Teaching Playback + Semantic Timeline

Playback becomes a narrated reasoning sequence. No engine schema change, no new player architecture: `currentStepIndex` in `playerStore` stays the single source of truth and every surface keeps deriving from it.

## What is there today

- `StepTimeline` already builds nodes from real engine steps by grouping *consecutive identical* `timelineLabel`s, seeks with `seek(node.from)`, scrolls the active node into view, and uses `isMilestone` for a larger dot. Binary search emits `Setup / Find mid / Compare / Eliminate / … / Found | Not found`, so each reasoning event is already its own seekable node.
- `ControlStrip` order is Previous · Play/Pause/Replay · Next · Restart, with `1 / 10` and the speed radiogroup on the right. Play already flips to Replay on the last step and Next already disables there.
- `useAutoplay` uses one flat `900ms / speed` for every step, so Compare and Eliminate get identical time.
- `ArrayCanvas` already spreads colliding pointer markers into lanes (±44px), but that logic is inline in the component and untested.
- At a `compare` step the frame's official range is still `[lo..hi]` (`ranges` from `lo`/`hi`), yet the surviving half is painted `frontier` with no wording — so it can read as if the range already changed.
- `AlgorithmWorldPanel` centres its content column (`justify-center`), leaving noticeable space above the target chip.
- Every `Eliminate` step repeats the same "Halving every step is what makes this O(log n)" sentence.

## What changes

1. **Timeline hierarchy** (`StepTimeline`): completed nodes get a small check mark and quiet text; the current node keeps the teal border + tint and gains a stronger current marker; future nodes stay visible but subdued. Labels stay full words ("Find mid", "Compare", "Eliminate") — no abbreviations. Keep the existing horizontal local scroll and auto-scroll-into-view; no page-level overflow. Terminal node (`Found` / `Not found`) is the highlighted node on the last step. `isMilestone` keeps a slightly stronger dot — no new colour.

2. **Phase primary, number secondary** (`ControlStrip`): the current phase label (from `timelineLabel`) becomes the prominent readout, with `Step 3 of 10` beneath/next to it in the existing secondary mono style. Play/Pause/Replay keeps visible text with its icon. Control order, keyboard shortcuts, and speed radiogroup unchanged.

3. **Semantic autoplay pacing**: new pure `src/lib/pacing.ts` exporting `stepDurationMs(phase, baseMs)` — probe and elimination steps get a modest multiplier, compare stays base, terminal steps settle slightly longer; everything scaled by the existing `playbackSpeed`. `useAutoplay` reads the duration of the *current* step instead of a constant, so Compare and Eliminate never visually collapse. Manual Next/Prev/seek still wins: the accumulator resets whenever the index changes from outside the loop. Reduced motion keeps disabling autoplay exactly as now.

4. **Timeline seek**: `seek` continues to be the only mutation; the click handler also pauses autoplay so a timer can't push past the chosen step. All surfaces already derive from the index, so there is no stale intermediate state.

5. **Pointer collisions**: extract the lane maths into pure `src/lib/pointerLanes.ts` (`assignPointerLanes(markers)`) and consume it from `ArrayCanvas`. Handles two and three pointers on one index and keeps labels legible (`low · mid · high` spread, consistent order). Generic — no binary-search special case.

6. **Compare vs Eliminate semantics**: at a compare step the bracket and `Current search range [0..9]` stay unchanged (already true) and the surviving half is explicitly labelled as a *decision preview* rather than a new range — a quiet caption tied to the previewed sub-range, derived from cells in the `frontier` state being narrower than `ranges[0]`. At the eliminate step the rejected cells become `excluded`, the bracket contracts and the range text updates. Presentation only.

7. **Complexity insight** (`src/lib/variables.ts` → `deriveOperation`): keep the `10 candidates → 5` figure on every elimination, but show the "halving is what makes this O(log n)" sentence only on the first elimination of the run. No repeated identical sentence.

8. **Layout**: `AlgorithmWorldPanel` content column moves from centred to top-aligned with a measured top offset so the array sits higher without losing breathing room, and the reasoning panel's spacing is tightened so a normal binary-search run needs no vertical scrollbar at 1440x900. Code pane scrolling stays.

## Technical notes

- Files added: `src/lib/pacing.ts`, `src/lib/pointerLanes.ts`, plus tests `src/lib/__tests__/pacing.test.ts`, `src/lib/__tests__/pointer-lanes.test.ts`, `src/lib/__tests__/timeline.test.ts`.
- Files modified: `src/components/player/StepTimeline.tsx`, `src/components/player/ControlStrip.tsx`, `src/hooks/useAutoplay.ts`, `src/components/viz/ArrayCanvas.tsx`, `src/components/workspace/AlgorithmWorldPanel.tsx`, `src/components/player/WorkspacePanels.tsx`, `src/lib/variables.ts`.
- Engine schema changes: none. `src/engine/**` is not touched.

## Tests

Driven by real `binarySearchModule` runs, not fixtures: standard found run (timeline matches every emitted step), midpoint-found-immediately short run, multi-elimination run (each repeated Find mid / Compare / Eliminate independently seekable), not-found run ends on `Not found`, seek to step N synchronises frame/variables/operation/reasoning/code line, prev/next moves the active marker, final step → Replay returns to index 0, autoplay pacing skips no semantic state, long run keeps labels readable. Plus pointer-lane cases (`low = mid`, `low = mid = high`, adjacent indices) and an explicit compare-vs-eliminate assertion that the official range is unchanged at compare and changed at eliminate.

## Verification

`bun run typecheck`, `bun run test`, `bun run lint`, and Playwright screenshots at 1440x900 for Compare, Eliminate, Found with the low/mid/high collision, Not found, and the timeline mid-way through a multi-iteration run. Stop after Phase 5 — no prediction, no mobile redesign, no second algorithm.
