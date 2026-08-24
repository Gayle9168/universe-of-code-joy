# Binary Search Visualizer — Animation Pass 2

Wire the existing engine frames into the Phase 1 UI so stepping and playback animate instead of snapping. No layout, sizing, typography, grid, or component-structure changes; no engine, store, or test-contract changes.

## What changes visually

- **Array cells** keep their fixed grid positions and animate `background-color`, `border-color`, `color`, and `opacity` between states (~300ms, natural easing). Cells leaving the window fade into the muted state instead of flipping instantly, and stay in the DOM.
- **Midpoint** emphasis moves by transitioning the solid-teal treatment on/off the affected cells (plus a very slight scale on the incoming midpoint), never by moving cells.
- **Search-window bracket** becomes one persistent element whose start/end columns change, with its span animated via transform/scale rather than being unmounted and remounted, so it visibly contracts. The SEARCH WINDOW label stays centred and stable.
- **lo / hi / mid markers** become a single persistent marker per pointer name that translates horizontally to the new cell centre, derived from the rendered grid geometry (column width from `ResizeObserver` on the row) so it is correct at 1024–1536px+. Labels cross-fade their index numbers.
- **Comparison strip** keeps a reserved fixed height so it never causes layout shift; values and the operator line cross-fade on frame change.
- **Decision callout** occupies a reserved slot and cross-fades its icon/tone/title/detail; the card itself does not move or jump.
- **Timeline nodes** transition fill/border/label colour, with a subtle scale on the active node and an animated progress rail; state comes only from the existing `index` and `run.steps`.
- **Code panel** highlighted line transitions its background/border smoothly using the existing `codeLine` metadata; when a frame has no mapping, current behaviour is preserved.
- **Explanation panel** sections cross-fade their text content on frame change; the panel height is stabilised so the right column does not jump.
- **Target card** stays completely stationary and only animates if its value/state actually changes.
- **Found / not-found** final frames: the matching cell gets the strongest existing token treatment with a short one-off emphasis transition; exhausted-search frames simply settle on the final window. No overlay, modal, or confetti.

## Playback

Play / Pause / Previous / Next / Speed continue to use the existing `usePlayerStore` actions and the existing `useAutoplay` rAF loop. No new timer, no second animation clock. Pause leaves the current frame exactly as rendered; Play resumes from it.

## Reduced motion

All durations route through the existing `src/lib/motion.ts` helpers plus `useIsReducedMotion`, so `prefers-reduced-motion` (or the in-app pref) collapses every transition to 0ms while every state change and label still renders. Existing keyboard controls are untouched.

## Technical details

- New pure helper `src/lib/vizTransitions.ts` (transition duration/class resolution, pointer-offset maths from column geometry) with unit tests in `src/lib/__tests__/`. No React, DOM, or store imports.
- `src/components/viz/ArrayCanvas.tsx`: same DOM structure and class tokens, with `transition-*`/`duration` utilities added, stable keys, persistent bracket + pointer markers, reserved slots for comparison/decision, and `React.memo` on the cell so playback does not re-render the whole tree per tick. Stays a pure `(props: { frame }) => JSX` component.
- `src/components/player/StepTimeline.tsx`: transition classes and an animated rail; no new state.
- `src/components/player/WorkspacePanels.tsx`: cross-fade wrappers around explanation-section content and the code-line highlight only.
- Verification: `bun run typecheck`, `bun run lint`, `bun run test` (all existing tests unchanged), plus Playwright screenshots at 1536×864, 1440×900, 1280×800 and 1024×768 on the setup, comparison, elimination and final frames, and a manual Previous/Next/Play/Pause/Speed pass.

## Not doing

No new visual components beyond what animating an existing element requires, no page-level or camera transitions, no second frame sequence or state system, no changes to engine, algorithm logic, routing, or tests.
