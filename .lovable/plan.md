# Binary Search Visualizer — Static UI Pass 1

Rebuild the visual composition of `/algorithms/binary-search` to match the reference screenshot at desktop and wide-desktop widths. This pass is layout, spacing, typography and state styling only — no animation, no autoplay changes, no engine redesign. The existing engine, frames, player store, code panel and routing stay exactly as they are; the current frame's data is what the new UI renders.

## What the page will look like

**Global header** — keeps the existing lockup, streak, XP, bell and avatar. The nav becomes the reference's five items: Explore, Visualizer (active pill), Practice, Playground, Progress. Alignment tightened to one 64px row.

**Page header** — breadcrumb `Explore > Searching > Binary Search`, then the title with the EASY badge and a one-line description underneath. Right side gets `Bookmark` (outlined, bookmark icon) and `Practice →` (solid teal). The current "Mark as complete" pill moves into the About tab's action area so lesson completion is not lost.

**Two-column workspace** — CSS grid, `min-w-0` on both tracks: ~68/32 at 2xl, ~66/34 at xl, ~62/38 at lg, with gap and padding stepping down 28 → 24 → 20px. Both columns stay side by side down to 1024px.

**Visualizer card** — one card, content laid out top-to-bottom with a deliberate rhythm and no dead space above the array:

```text
TARGET card              (centered, compact)
index row 0…9            (labels directly above each cell)
array cells              (56-64px wide, 48-56px tall at 2xl)
lo / SEARCH WINDOW / hi  (dashed bracket + boundary markers)
comparison strip         (mid value | 16 > 13 | target)
decision callout         (orange-tinted, single row)
step timeline            (numbered nodes + connecting rail)
control strip            (Previous | Play/Pause | Next | Speed)
```

Removed: the "Array view" chip, the floating legend box, the pointer/candidate/counter status strip, and the oversized playback bar. Legend content moves into About.

**Array states** (static, read from the current frame): active window cells get a light teal tint, the midpoint a solid teal fill with inverted text, eliminated cells a muted grey treatment, and the target card its own teal outline emphasis.

**Right panel** — one cohesive column: tabs `Code (JavaScript)` / `Input` / `About` with an underline accent, then the line-numbered, syntax-highlighted listing with the current line highlighted and a Copy button; below it the explanation panel with `Why this step?`, `Current State` (lo / hi / mid) and `What happens next?` separated by hairlines rather than three separate cards.

**Bottom bar** — the existing compact properties strip (time, space, category, tags, learning progress), restyled to the reference proportions so it reads as secondary.

**Below 1024px** — the surrounding page (header, breadcrumb, title, actions, properties bar) stays; the workspace grid is replaced by a short "designed for larger screens" card with Practice and About links.

## Technical notes

- `src/routes/algorithms.$slug.tsx` — grid ratios, header actions, breadcrumb/description, bottom bar restyle, small-screen gate.
- New `src/components/workspace/` presentation components: `VisualizerCard`, `TargetCard`, `SearchWindowBracket`, `ComparisonStrip`, `DecisionCallout`, `ControlStrip`, `DesktopOnlyNotice`. Pure `(props) => JSX`, no store or router imports; the route/panel wiring passes the frame and existing player actions in.
- `src/components/viz/ArrayView.tsx` — enlarge cells, move index labels above, restyle window/eliminated/midpoint states, drop the chip and legend. Existing `target` / `comparison` / `decision` frame fields already supply the content.
- `src/components/player/WorkspacePanels.tsx` — `VisualStage` loses the status strip and playback bar in favour of the new timeline + control strip; `CodePane`, `InputPane`, `AboutPane` keep their behaviour with the new tab chrome. `ExplainPane` gets the three-section layout.
- `src/components/player/StepTimeline.tsx` — restyle nodes/rail to reference proportions; seek behaviour unchanged.
- Tokens only (`bg-paper`, `bg-card`, `border-hairline`, `text-ink`, `text-slate`, `bg-tint`, `text-primary`, warning/error tints) — no raw hex, no dark surfaces.
- No engine, algorithm, store or test-contract changes. Verification: `bun run typecheck`, `bun run lint`, `bun run test`, plus Playwright screenshots at 1536×864, 1440×900, 1280×800 and 1024×768 reviewed against the reference.

## Not in this pass

Animation, step transitions, motion timing, autoplay changes, mobile visualizer, engine or algorithm-logic changes.
