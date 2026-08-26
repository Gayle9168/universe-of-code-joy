# Golden Visualizer — Audit and Implementation Plan

Note: `docs/VISUALIZER_CONTRACT.md` does not exist in the repo (only `DESIGN_SYSTEM.md`, `LEARNING_EXPERIENCE.md`, `PROJECT.md`, `ROADMAP.md`, `AGENTS.md`). This audit uses the design system, the learning-experience doc, and the code as written.

## 1. Existing architecture

Engine
- `src/engine/types.ts` — `Step` (`frame`, `aux`, `codeLine`, `narration`, `detail`, `phase`, `timelineLabel`, `counters`, `isMilestone`), `ArrayFrame` (`values`, `states`, `pointers` with `name/index/color/note`, `pointerNotes`, `ranges`, `rangeRows`, `swapPair`, `target`, `comparison{left,op,right,verdict,tone}`, `decision{title,detail,tone}`), `AuxPanel` kinds `stack | queue | keyvalue | log | cost`, `CodeLineMap`, `AlgorithmRun`, `AlgorithmModule`.
- `src/engine/builder.ts` — `StepBuilder` (deep-clones frames/aux, cumulative counters, `MAX_FRAMES` 2000) and `resolveCodeLine(run, lang, codeLine)` for pseudocode→listing mapping.
- `src/engine/algorithms/binarySearch.ts` (480 lines) — deterministic run emitting phases `setup / probe / compare / found / narrow-left / narrow-right / done`, timeline labels `Setup, Find mid, Compare, Eliminate, Found, Not found`, milestones, `target`, `comparison`, `decision`, lo/hi/mid pointers with a mid `note` (`(0 + 9) / 2 = 4`), plus JS/TS/PY listings and a `codeMap`.
- `src/engine/registry.ts` — slug→module and problem→module resolution.

Player
- `src/stores/playerStore.ts` — `load/play/pause/toggle/next/prev/seek/first/last/reset/toggleLoop`, milestone and phase stepping, selectors `useCurrentStep`, `useCodeLine`, `useCounters`, `usePhaseSegments`, `useProgressPercent`, `useCanStepForward/Back`; factory + context for multiple instances.
- `src/hooks/useAutoplay.ts`, `usePlayerKeys.ts`, `useReducedMotionSync.ts`, `useHydrated.ts`, `useFitScale.ts`.
- Controls: `ControlStrip.tsx` (Previous / Play-Pause-Replay / N of Total / Speed / Next), `StepTimeline.tsx` (numbered nodes labelled by `timelineLabel`, click to seek, auto-scroll), plus legacy `PlaybackBar`, `StepScrubber`, `StepCounter`, `CounterStrip`, `CandidateTrail`, `SpeedControl`.

Visualization
- `src/components/viz/ArrayCanvas.tsx` — DOM search canvas: index labels, memoized `ValueCell` with 300ms state transitions, measured geometry, translating lo/hi/mid markers, dashed search-window bracket, comparison strip, decision callout, screen-reader description.
- `src/lib/vizTransitions.ts` (+ tests) — pure geometry: `rowGeometry`, `cellCenter`, `windowExtentPx`, `scaleXFor`.
- `ArrayView.tsx` (generic array/sorting), `TreeView`, `GraphView`, `GridView`, `TableView`, `FrameView` dispatcher, `AuxPanels.tsx`, `tokens.ts`, `StateIcon.tsx`.

Workspace / learning UI
- `src/routes/algorithms.$slug.tsx` — route, search-param validation (`input`, `step`, `problem`), head/SEO, a page-local top nav, breadcrumb, large hero header block (h1 + one-liner + Bookmark + Practice), two-column grid `58/42 → 64/36 → 68/32`, `DesktopScaleFrame` wrapper, session recording, URL sync, `RightColumnPanels` (Code/Input/About tabs + `ExplainPane`).
- `src/components/player/WorkspacePanels.tsx` (794 lines) — `CodePane` (JS/TS/PY tabs, active-line highlight, auto-scroll, copy), `ExplainPane` (Why this step / Current state from pointers / What happens next), `InputPane`, `AboutPane`, `SidePanel`, `VisualStage` (aux float panels, canvas, timeline + control strip footer).
- `src/stores/progressStore.ts` — per-algorithm `masteryPct`, lesson completion, XP, streak; `src/lib/xp.ts`, `src/hooks/useSession.ts`.

Styling
- `src/styles.css` — Tailwind v4 `@theme inline` tokens (`paper`, `card`, `hairline`, `ink`, `slate`, `tint`, `primary`), `viz-swap` cross-fade utility, reduced-motion overrides. No dark theme.

Testing
- Engine: `src/engine/__tests__/{algorithms,codeMap,engine,layout,registry}.test.ts`, `builder.test.ts`.
- Lib/a11y: `viz-transitions`, `fit-scale`, `playback-controls-a11y`, `code-line-announcement`, `live-region`, `semantic-landmarks`, `focus-ring`, `reduced-motion`, `alt-text-audit`.
- Content/stores: content schema and accessor tests, `progressStore.test.ts`; e2e `e2e/searching-animations.spec.ts`, `e2e/shots.spec.ts`.

## 2. What can be reused untouched

- The whole engine contract and `StepBuilder`; binary-search step generation, code maps, counters, milestones.
- `playerStore` and all playback hooks/keys/autoplay.
- `ArrayCanvas` primitives (cells, markers, bracket, comparison strip, decision callout) and `vizTransitions`.
- `CodePane` synchronization (already `resolveCodeLine`-driven with auto-scroll and three languages).
- `StepTimeline` and `ControlStrip` behaviour; `AboutPane`, `InputPane`, `CustomInputModal`.
- Design tokens, `DesktopScaleFrame`, progress/mastery store.

## 3. Missing pieces (gaps only)

Layout
- The large hero header (h1 + one-liner + action row) must be replaced by one compact context row: name, difficulty, estimated minutes, complexity, mastery %.
- No lesson-stage strip (`Concept · Watch · Visualize · Predict · Trace · Code · Solve`); only Visualize exists as a route.
- Playback + timeline currently live inside the canvas card footer; the golden layout wants a full-width band under both columns.
- Column split should settle at ~58/42 as the golden target.

Visual primitives
- No variable board (`low / mid / high / target`) — `keyvalue` aux exists in the type but `VisualStage` renders only `queue/stack/cost/visited-order`, and binary search emits no aux at all.
- No midpoint expression block (`mid = floor((low + high) / 2)` then the substituted line); today only a cramped ~26-char pointer `note`.

Engine metadata
- Binary search emits no `aux` `keyvalue` panel for variables and no dedicated expression payload. Both are expressible with existing shapes (`keyvalue` rows; a second `keyvalue`/`log` panel or the existing pointer `note`), so no new `Step` field is required. Optional, additive only if needed: an `expression` field on `ArrayFrame`.

Synchronization
- Code ↔ canvas ↔ reasoning are already index-synced; missing is a shared "changed this step" signal so the variable board can highlight only what moved (derivable in a pure lib from previous vs current frame pointers — no engine change).

Learning UI
- `ExplainPane` has Why / Current state / Next; the golden reasoning panel wants **What happened / Why / Invariant**, hiding empty sections. Invariant text is not authored anywhere yet.
- Mastery % is in the store but not surfaced on this page.
- Prediction (Predict stage) does not exist; milestones already mark the anchor points.

Responsive
- `DesktopScaleFrame` scales the 1440 design down, which is acceptable; the new layout must keep working inside it and at 1024–1920 without the timeline overlapping the canvas.

Accessibility
- Existing live regions/keys are good. New elements (stage strip, variable board, invariant) need labels, and the variable-board highlight must respect reduced motion.

Testing
- No tests for: variable-board derivation, expression formatting, changed-variable diffing, reasoning-section presence/absence, compact context row rendering.

## 4. Risks

- `WorkspacePanels.tsx` is large and shared by `/visualizer`, `/practice/$slug` and compare paths — moving playback out of `VisualStage` can break those callers unless props keep the current default behaviour.
- Removing the `<h1>` hero risks SEO/landmark test failures (`semantic-landmarks.test.ts`) — the compact row must still carry a single `h1`.
- `DesktopScaleFrame` assumes a fixed design height; a taller layout will scale smaller on short windows.
- e2e screenshot specs will need re-baselining.
- Adding aux panels to binary search changes emitted steps, so `algorithms.test.ts` snapshots/immutability assertions must be updated deliberately.
- The 20 other algorithm modules share these renderers; every change must be additive with fallbacks.

## 5. Proposed component architecture

```text
routes/algorithms.$slug.tsx
└── DesktopScaleFrame
    ├── (global app nav — unchanged)
    ├── LessonContextRow        (new, compact: h1 + difficulty + minutes + O(log n) + mastery)
    ├── LessonStageStrip        (new, links/disabled stages)
    └── GoldenWorkspace         (new shell, grid 58/42 + full-width footer band)
        ├── AlgorithmWorldPanel (new card wrapper)
        │   ├── ArrayCanvas            (reused, unchanged API)
        │   ├── VariableBoard          (new, pure: reads keyvalue aux / pointers)
        │   └── ExpressionBlock        (new, pure: mid formula + substitution)
        ├── CodePanel          (existing CodePane, unchanged)
        ├── ReasoningPanel     (ExplainPane restructured: happened / why / invariant)
        └── PlaybackBand       (existing StepTimeline + ControlStrip, relocated)
```

## 6. Exact files to modify / add

Modify
- `src/routes/algorithms.$slug.tsx` — drop hero, add context row + stage strip, compose the golden shell.
- `src/components/player/WorkspacePanels.tsx` — `VisualStage` gains an option to omit its footer (defaults unchanged for other routes); `ExplainPane` restructured into the three reasoning sections; render `keyvalue` aux.
- `src/components/viz/ArrayCanvas.tsx` — slots for the variable board / expression block if they belong inside the canvas card.
- `src/engine/algorithms/binarySearch.ts` — emit a `keyvalue` variable panel and the midpoint expression per step (existing shapes).
- `src/engine/types.ts` — only if an `expression` field proves necessary (optional, additive).
- Tests: `src/engine/__tests__/algorithms.test.ts`, `src/lib/__tests__/semantic-landmarks.test.ts`, `e2e/*` baselines.

Add
- `src/components/workspace/GoldenWorkspace.tsx`, `LessonContextRow.tsx`, `LessonStageStrip.tsx`, `PlaybackBand.tsx`, `AlgorithmWorldPanel.tsx`.
- `src/components/viz/VariableBoard.tsx`, `src/components/viz/ExpressionBlock.tsx` (pure `(props) => JSX`).
- `src/lib/variableBoard.ts` (derive rows + changed-since-previous-step) and `src/lib/__tests__/variable-board.test.ts`.

## 7. Implementation sequence

- Phase 1 — Golden workspace shell: compact context row, stage strip, 58/42 grid, playback band moved below both columns; no behaviour change.
- Phase 2 — Binary Search visual state: keep `ArrayCanvas`, tune ranges/excluded/found presentation inside the new panel height.
- Phase 3 — Variables + expressions: `variableBoard` lib + `VariableBoard` + `ExpressionBlock`, fed by a `keyvalue` aux emitted from `binarySearch.ts`.
- Phase 4 — Code / reasoning synchronization: reasoning panel sections (happened / why / invariant), changed-variable highlight, code auto-scroll verification.
- Phase 5 — Playback + timeline: phase-grouped meaningful timeline (Initialize / Calculate / Compare / Eliminate / Found) from existing `phase` values, Restart control added.
- Phase 6 — Prediction: milestone-anchored predict prompt (behind the Predict stage), no engine change.
- Phase 7 — Responsive: 1024 → 1920 verification inside `DesktopScaleFrame`, no overlap, reduced-motion pass.
- Phase 8 — Tests: new lib tests, updated engine/landmark tests, e2e re-baseline; `bun run typecheck`, `bun run test`, `bun run lint` after each phase.

## 8. Architecture decision

**YES.** The Golden Visualizer can be built cleanly on the current `Step` + `Frame` architecture. Everything the approved UI shows already has a representation: `target`, `pointers` (low/mid/high), `ranges` (valid vs excluded), `states` (active/excluded/found), `comparison`, `decision`, `phase`/`timelineLabel`/`isMilestone` for the timeline, `counters`, `codeLine` + `codeMap` for three-language sync, and `AuxPanel.keyvalue` for the variable board. The remaining work is layout, two pure presentation primitives, one aux emission in the binary-search module, and reasoning-panel copy — no new engine, no duplicated algorithm logic, no parallel route.
