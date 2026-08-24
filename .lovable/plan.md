# Visualizer on Small Screens — Show the Real Desktop UI, Scaled

Right now `/algorithms/$slug` hides the workspace below 1024px and shows the "Interactive visualizations are designed for larger screens" card instead (`src/routes/algorithms.$slug.tsx`, lines 534-575). That notice goes away. On phones and tablets you get the exact desktop visualizer — same layout, proportions, typography and colors — scaled down to fit the screen, with nothing reflowed or simplified.

## What changes

- The desktop-only notice is deleted.
- The workspace (top nav + page header + two-column canvas/code/explanation grid) always renders in its desktop form.
- Below 1024px, that whole desktop board is rendered at a fixed desktop size and uniformly scaled to the available width, so it is a true miniature of the desktop screen — no stacking, no hidden panels, no re-flowed grid.
- Above 1024px nothing changes at all: identical markup, no transform, pixel-identical to today at 1024/1280/1440/1536+.
- Because the board is a faithful scale, on a narrow phone the text is small; native pinch-zoom and panning inside the scaled board stay available so any part can be inspected.

## Technical details

- New hook `src/hooks/useFitScale.ts`: measures a container with `ResizeObserver`, returns `scale = min(1, containerWidth / designWidth)`. SSR/pre-measure returns `1` so the server render matches desktop and hydration does not mismatch.
- New pure helper `fitScale(containerWidth, designWidth)` in `src/lib/vizTransitions.ts` (or a sibling `src/lib/fitScale.ts` if it reads cleaner there), with unit tests in `src/lib/__tests__/` — pure, no React/DOM/store imports, per the architecture rules.
- New presentational wrapper `src/components/common/DesktopScaleFrame.tsx`:
  - Renders `children` inside a fixed-size inner div (`width: DESIGN_WIDTH` = 1440px, `min-height: DESIGN_HEIGHT` = 900px) with `transform: scale(s)` and `transform-origin: top left`.
  - The outer element reserves `designHeight * s` in height so no overlap or clipped content, and scrolls when needed.
  - `scale === 1` renders children with no transform/extra wrapper styles, keeping the desktop DOM path untouched.
- `src/routes/algorithms.$slug.tsx`:
  - Remove the `lg:hidden` notice block and the `hidden … lg:grid` gate on the workspace grid, so the grid renders unconditionally with its existing `lg:grid-cols-[58fr_42fr] xl:… 2xl:…` classes intact (they resolve at the 1440px design width inside the frame).
  - Wrap the page shell (`header` + `main`) in `DesktopScaleFrame` so the nav's `px-24`, header row and grid all scale together rather than partially overflowing.
  - No other layout, spacing, token or typography edits; `VisualStage`, `RightColumnPanels`, `ArrayCanvas`, `StepTimeline`, `ControlStrip` are untouched.
- Reduced-motion and existing animation behaviour are unaffected (a CSS transform does not change frame logic or timings). Engine, stores and player logic are untouched.

## Verification

- `bun run typecheck`, `bun run lint`, `bun run test` (existing suites plus the new `fitScale` tests).
- Playwright screenshots of `/algorithms/binary-search` at 1536x864, 1280x800 and 1024x768 to confirm they are unchanged, and at 428x792, 390x844 and 768x1024 to confirm the full desktop workspace is visible, correctly scaled, not clipped, and free of horizontal overflow.
- Step Previous/Next and Play/Pause once at 428px to confirm interaction still lands on the right controls inside the scaled board.

## Not doing

- No mobile-specific layout, stacked panels, tabs or simplified visualizer.
- No changes to Explore, its Search category, or the Binary Search cards.
- No engine, frame-generation, store or routing changes.
