# Binary Search Visualizer — Reference-Grade Workspace

Rebuild the algorithm workspace at `/algorithms/$slug` to match the reference exactly, with Binary Search as the first algorithm-specific visualization. The existing engine stays the single source of truth: algorithms emit deterministic frames, React only renders them.

## What changes visually

**Lesson header** (currently correct but noisy): breadcrumb → title + EASY badge → one-line description, with `Bookmark` and `Practice →` on the right. The current "Mark as complete" pill becomes the bookmark/practice pair per the reference; lesson completion moves into the About panel action area so no functionality is lost.

**Workspace**: two columns, left ~64% / right ~36% at 1440px+, ~58/42 at 1024–1279px, CSS grid with `min-w-0` on both tracks. Left column is one card: canvas on top (majority of height), compact step timeline, then a single-row control strip. Right column is the code panel (top, taller) and the reasoning panel (below).

**Removed**: the bottom "Algorithm Properties / complexity / learning progress" strip, the floating "Array view" chip, the floating legend box, the status strip with pointers/candidate-trail/counter row, and the oversized playback bar. Complexity, category, tags and legend move into the About tab.

**Canvas** (Binary Search): `TARGET 13` card above the array; index labels above each cell; ten rounded value cells with subtle borders; teal-filled active midpoint; tinted active window; dimmed/retreated discarded cells; a dashed `lo … SEARCH WINDOW … hi` bracket under the array with labelled boundary markers; a compact three-part decision strip (`mid value 16` | `16 > 13` | `target 13`); and a decision callout that appears only on decision frames ("Midpoint is greater than target. Discard the right half and move hi to mid − 1." with `New hi = 3`).

**Timeline**: named algorithm steps (Setup, Compare, Eliminate, Find Mid, … Found) as numbered nodes with a connecting rail; completed nodes checked, current node filled teal, future nodes outlined. Clicking a node seeks. This replaces the generic phase-band scrubber on this workspace.

**Controls**: one compact row — `Previous`, `Play / Pause`, `Next`, `Speed` select — matching the reference proportions.

**Reasoning panel**: `Why this step?` (frame narration/detail) → `Current State` (lo / hi / mid read from the frame) → `What happens next?` (next frame's prediction line) with a next-step arrow button. No duplicated text between panels.

**Code panel**: JavaScript listing with line numbers, syntax highlighting, and the executing line highlighted with a subtle animated transition; tabs `Code (JavaScript)` / `Input` / `About` as in the reference. Readable at 1024px (13px mono).

## Animation behaviour

Every visual event corresponds to one emitted frame and one code line. Frame N → N+1 is animated with transform/opacity only (no width/height/top/left), using stable DOM/SVG nodes and memoized cells so no remount happens per frame.

Binary Search frame story (emitted by the engine, not the UI):

1. `setup` — array settles in, target appears, window bracket draws around lo=0…hi=9.
2. `find-mid` — code line for `mid = Math.floor((lo + hi) / 2)`; lo/hi emphasise, formula shows, the mid marker travels (not teleports) to index 4.
3. `read-value` — code line `const val = arr[mid]`; cell 4 lifts and its value is read (≈600ms).
4. `compare` — `16 > 13` resolves in the decision strip.
5. `decision` — right half transitions to a discarded state (opacity + desaturation + slight retreat), staggered from the cut outward; callout appears.
6. `move-hi` — hi marker travels 9 → 3, window contracts.
7. `new-window` — canvas settles; active 2 5 8 12, discarded values still visible but secondary.
8. Repeat from step 2 until `found` / `not-found`.

Reduced motion (`prefers-reduced-motion` or the in-app pref, via the existing `useIsReducedMotion` / `src/lib/motion.ts`): zero-duration transitions, no travel, all information preserved.

Keyboard: ← previous, → next, Space play/pause, R restart, ignored while focus is in an editable element (extends the existing `usePlayerKeys`).

## Below 900px

Global header, breadcrumb, title, badge, description and the primary actions stay. Only the workspace grid is replaced by a compact card: "Interactive visualizations are designed for larger screens", a short line about needing room for the animation, code, explanation and timeline together, plus `Practice` and `About` links. Purely a media-query/`matchMedia` check — the ≥900px layout stays fluid across 1024/1280/1366/1440/1536/1920.

## Technical details

**Engine (`src/engine/types.ts`)** — backward-compatible optional additions to `ArrayFrame`:

```ts
target?: { label: string; value: number | string };
readValue?: { index: number; value: number | string };
comparison?: { left: number | string; operator: "<" | ">" | "=" | "<=" | ">="; right: number | string };
decision?: { type: "discard-right" | "discard-left" | "found" | "not-found";
             title: string; body: string; badge?: string };
semanticEvent?: "setup" | "find-mid" | "read-value" | "compare" | "decision"
              | "move-lo" | "move-hi" | "new-window" | "found" | "not-found";
```

All optional; no other algorithm module or frame consumer changes. `Step` gains an optional `timelineLabel?: string` for the named timeline nodes and an optional `checkpoint?: true` marker that the future prediction mode will read (rendered as nothing today) — this is the prediction-mode foundation, no UI redesign.

**`src/engine/algorithms/binarySearch.ts`** — emits the frame story above (adds the `read-value` step, sets the new optional fields, keeps `codeLine` mapped through the existing `CodeLineMap`). No algorithm logic moves into React.

**New components** (`src/components/workspace/`): `AlgorithmWorkspace` (grid + small-screen gate), `WorkspaceHeader`, `VisualizationCanvas` (chrome + shell only), `StepTimeline`, `PlaybackControls`, `ReasoningPanel`, `DesktopOnlyNotice`.

**New algorithm-specific renderer** (`src/components/viz/binary-search/BinarySearchVisualization.tsx`): pure `(props: { frame: ArrayFrame }) => JSX`, no store or router imports, per the architecture rules. `FrameView` gains a slot so a run's slug can select a dedicated visualization, falling back to the current generic `ArrayView`/`TreeView`/etc. for every other algorithm — Bubble Sort, BFS and friends keep their current visuals and inherit only the new chrome.

**Rewired** `src/routes/algorithms.$slug.tsx` to compose the new workspace; `WorkspacePanels.tsx` keeps `CodePane`, `InputPane`, `AboutPane` (complexity/tags/legend added) and loses the old `VisualStage` status strip.

**Tests**: extend `src/engine/__tests__/algorithms.test.ts` and `codeMap.test.ts` for frame immutability, determinism (same input → identical frames), backward compatibility (other modules emit no new fields), Binary Search lo/hi/mid transitions, code-line mapping, and the semantic event sequence. New pure helpers get unit tests in `src/lib/__tests__/`. Verified with `bun run typecheck`, `bun run test`, `bun run lint`.

## Not doing

No mobile visualizer, no bottom complexity cards, no "Current Step" block above the animation, no gradients/glass/glow/particles, no second execution system, no duplicated Binary Search logic in React, no changes to the global Algora design language or other product pages.
