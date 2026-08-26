# Phase 5 — Teaching Playback + Semantic Timeline

Playback becomes a narrated reasoning sequence. No engine schema change, no new player architecture: `currentStepIndex` in `playerStore` stays the single source of truth and every surface keeps deriving from it. No prediction, no mobile redesign, no second algorithm.

## What is there today

- `StepTimeline` already builds nodes from real engine steps by grouping *consecutive identical* `timelineLabel`s, seeks with `seek(node.from)`, scrolls the active node into view, and uses `isMilestone` for a larger dot. Binary search emits `Setup / Find mid / Compare / Eliminate / … / Found | Not found`, so each reasoning event is already its own seekable node.
- `ControlStrip` order is Previous · Play/Pause/Replay · Next · Restart, with `1 / 10` and the speed radiogroup on the right. Play already flips to Replay on the last step and Next already disables there.
- `useAutoplay` runs one rAF loop with a flat `900ms / speed` accumulator for every step, so Compare and Eliminate get identical time and the accumulator survives manual navigation.
- `ArrayCanvas` already spreads colliding pointer markers into lanes (±44px), but that logic is inline and untested.
- At a `compare` step the frame's official range is still `[lo..hi]`, yet the surviving half is painted `frontier` with no wording — so it can read as if the range already changed.
- `AlgorithmWorldPanel` centres its content column (`justify-center`), leaving noticeable space above the target chip.
- Every `Eliminate` step repeats the same "Halving every step is what makes this O(log n)" sentence (from `decision.detail`, surfaced by `deriveOperation`).

## What changes

1. **Timeline hierarchy** (`StepTimeline`): completed nodes get a small check mark and quiet text; the current node keeps the teal border + tint and gains a stronger current marker; future nodes stay visible but subdued. Labels stay full words — no abbreviations, no micro-text. Keep local horizontal scroll and auto-scroll-into-view; no page-level overflow. The terminal node (`Found` / `Not found`) is the highlighted node on the last step. `isMilestone` keeps a slightly stronger dot — no new colour.

2. **Phase primary, number secondary** (`ControlStrip`): the current phase label (`timelineLabel`) becomes the prominent readout with `Step 3 of 10` as secondary mono text. Play/Pause/Replay keeps visible text with its icon. Control order and keyboard shortcuts unchanged.

3. **Semantic autoplay pacing** — new pure `src/lib/pacing.ts` with `stepDurationMs(phase, speed, baseMs)`: weights come from the step's own `phase` string (exact names plus generic keyword fallbacks such as "narrow"/"eliminat"/"probe"), **an unknown phase weighs exactly 1 and falls back to base timing**, and there is **no algorithm-slug or registry lookup anywhere in the playback system**. Probe and elimination steps get slightly longer, compare stays base, terminal steps settle.

4. **Autoplay invalidation** (`useAutoplay`): the loop is re-keyed on `index`, so each step schedules exactly one pending advance and any index change tears it down. Next, Previous, timeline seek, Pause, Restart and an input change (`load`) all cancel the pending callback — **no stale scheduled advance can ever move the player after manual navigation**. Reduced motion keeps disabling autoplay exactly as now, and never changes the step sequence.

5. **Pointer collisions** — new pure `src/lib/pointerLanes.ts` (`assignPointerLanes`) consumed by `ArrayCanvas`: markers sharing a cell are spread symmetrically in a stable semantic order (low → mid → high, then others alphabetically), deterministic for a given frame, and positioned below the row so array values are never covered. Tested for `low = mid`, `mid = high`, `low = mid = high`, and adjacent indices.

6. **Compare vs Eliminate semantics** — new pure `src/lib/decisionPreview.ts` keeps teaching interpretation out of generic rendering: `frontier` keeps its generic "still a candidate" meaning everywhere, and a preview caption is shown **only** when the current frame proves it — a comparison *and* a decision are attached, the frame declares an official range, and the highlighted cells form one contiguous block strictly narrower than and inside that range. Otherwise nothing is claimed. At Compare the bracket and `Current search range [0..9]` stay unchanged and the surviving side is labelled as a decision preview; at Eliminate the rejected cells become `excluded`, the bracket contracts and the boundary moves.

7. **Complexity insight from canonical history** (`deriveOperation` in `src/lib/variables.ts`): an optional context argument carries `{ steps, index }` from the run, and first-occurrence is computed by scanning the canonical steps before `index`. The `10 candidates → 5` figure stays on every elimination; the O(log n) sentence appears only on the first one. **No component-local `hasShownComplexityInsight` flag**, so Previous, seek and Replay always agree.

8. **Layout / scrollbar**: `AlgorithmWorldPanel` moves from centred to top-aligned with a measured top offset so the array sits higher while keeping breathing room; the reasoning panel fits an ordinary desktop run through **spacing and layout only — no typography below `docs/DESIGN_SYSTEM.md` sizes**. Code pane scrolling stays; genuinely long content can still scroll.

## Technical notes

- Files added: `src/lib/pacing.ts`, `src/lib/pointerLanes.ts`, `src/lib/decisionPreview.ts`, plus tests `src/lib/__tests__/pacing.test.ts`, `pointer-lanes.test.ts`, `decision-preview.test.ts`, `timeline.test.ts`.
- Files modified: `src/components/player/StepTimeline.tsx`, `src/components/player/ControlStrip.tsx`, `src/hooks/useAutoplay.ts`, `src/components/viz/ArrayCanvas.tsx`, `src/components/workspace/AlgorithmWorldPanel.tsx`, `src/components/player/WorkspacePanels.tsx`, `src/lib/variables.ts` (context arg is optional, existing call sites keep working).
- Engine schema changes: none. `src/engine/**` is not touched.

## Tests

Driven by real `binarySearchModule` runs: standard found run (timeline matches every emitted step), midpoint-found-immediately short run, multi-elimination run (each repeated Find mid / Compare / Eliminate independently seekable), not-found run ends on `Not found`, seek to step N synchronises frame/variables/operation/reasoning/code line, prev/next moves the active marker, final step → Replay returns to index 0, autoplay pacing skips no semantic state and unknown phases fall back to base, long run keeps labels readable. Plus pointer-lane collision cases, decision-preview evidence gating (no preview without comparison + decision + narrower contiguous block), an explicit compare-vs-eliminate assertion that the official range is unchanged at compare and changed at eliminate, and a history-derived assertion that the O(log n) insight appears only on the first elimination regardless of navigation direction.

## Verification

`bun run typecheck`, `bun run test`, `bun run lint`, and Playwright screenshots at 1440x900 for Compare, Eliminate, Found with the low/mid/high collision, Not found, and the timeline mid-way through a multi-iteration run. Stop after Phase 5.
