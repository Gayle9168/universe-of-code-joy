# Phase 1.5 — Golden Workspace Composition Polish

Wiring and layout only: no engine changes, no new animation semantics, no prediction, no decoration.

## 1. Kill the dead vertical space

Today the Algorithm World card is a full-height flex column with a scrolling inner region, so on a 1440–1920 desktop the canvas and the three teaching cards float at the top of a tall white card.

- Let the left card size to its content instead of stretching: content column becomes `flex-col` with natural height plus a bounded max height, and the grid row uses `items-start` so both columns align to their content top.
- Right column keeps the two panels but its total height tracks the left column instead of a fixed 55/45 stretch, so Code and Reasoning get the height the composition actually needs.
- Playback band stays a compact fixed-height row directly under both columns, so Algorithm World + Code + Reasoning + playback read as one viewport composition with even breathing room (not one tall empty card).

## 2. No empty educational cards

- `Midpoint Calculation` renders only when `midExpression(frame)` returns a value.
- `Comparison` renders only when `frame.comparison` exists.
- Both drop their reserved-height/opacity-0 placeholder behaviour; when absent the row reflows and Variable Board takes the freed width (Setup shows Variable Board alone, full width).
- Cross-fade on content change is preserved for the steps where the card is present, so nothing becomes an instant swap.

## 3. Variable Board

No data change: it already renders exactly the pointers the frame carries plus target, so Setup naturally shows low / high / target and `mid` appears the step the engine emits it. Only the width behaviour changes (it grows when siblings are absent).

## 4. Reasoning panel fits without an internal scrollbar

- Tighter section rhythm: smaller gaps between WHAT HAPPENED / WHY / INVARIANT / NEXT, label and text on a tighter leading, so ordinary Binary Search reasoning fits at typical desktop heights.
- The `Step N of Total` chip in the header is demoted to caption weight (secondary information).
- Scroll container stays as a safety net for unusually long narration — no text truncation, no clamping.

## 5. Timeline hierarchy: concept first, number second

Keep `playerStore` and the existing phase-grouping logic untouched. Presentation only:

- The phase label (`timelineLabel ?? phase`) becomes the primary element on every node, not just the active one — past/future nodes show their label in muted ink instead of a bare digit.
- The node number shrinks to a small dot/index marker; the concept name carries the meaning (Setup, Find mid, Compare, Eliminate, Found).
- Milestone steps (`isMilestone`) get a slightly stronger node marker using existing tokens only.
- `Step N / Total` remains in the playback band / reasoning header as secondary text.

## 6. Priority and restraint

No gradients, illustrations, extra stat cards, new colors, new shadows or gamification. All improvement comes from spacing, proportion, conditional rendering, hierarchy and alignment, using existing tokens.

## Files to modify

- `src/components/workspace/GoldenWorkspace.tsx` — grid alignment, column height behaviour, gaps
- `src/components/workspace/AlgorithmWorldPanel.tsx` — content-driven height, conditional teaching-card row
- `src/components/viz/ExpressionBlock.tsx` — render nothing when no expression (drop reserved placeholder)
- `src/components/viz/ComparisonCard.tsx` — render nothing when no comparison
- `src/components/player/WorkspacePanels.tsx` — Reasoning section spacing/hierarchy only
- `src/components/player/StepTimeline.tsx` — label-first node presentation
- `src/components/workspace/PlaybackBand.tsx` — compact fixed band height if needed
- tests: extend existing suites for the new "hidden when absent" contract

## Verification

`bun run typecheck`, `bun run test`, `bun run lint`, plus Playwright screenshots at 1440x900, 1680x1050 and 1920x1080 confirming no large blank area, no empty cards at Setup, no Reasoning scrollbar, and that play/pause, next/prev, speed, seek, code sync, language switch, input, about, URL step state, mastery, keyboard and reduced motion all still work.
