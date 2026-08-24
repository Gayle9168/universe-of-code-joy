# algora — project handbook

Everything in this document was read out of the repository as it stands today. It is the
"learn the project" reference: what algora is, how the code is organised, every screen that
exists, and the order in which it all got built.

Forward-looking work lives in [`ROADMAP.md`](./ROADMAP.md). This file describes the present.

---

## 1. What algora is

A gamified platform where CS students master **data structures & algorithms** through
three views kept in sync: a **visualization**, the **code**, and a **plain-English
explanation**.

- Tagline: _"See the algorithm think."_
- Scope is strictly DSA — no CS-core / OS / networking content.
- Status: **frontend-only**. There is no backend, no accounts table, no server database.
  All learner state lives in the browser (`localStorage`, key `algora-progress`).
  Auth screens are real UI with local behaviour only.

---

## 2. Stack (from `package.json`)

| Concern                 | Choice                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| Framework               | TanStack Start v1 (`@tanstack/react-start`) on Vite                                      |
| Routing                 | TanStack Router file routes (`@tanstack/react-router`), generated `src/routeTree.gen.ts` |
| UI runtime              | React 19 + TypeScript 5.8                                                                |
| Styling                 | Tailwind CSS v4 via `@tailwindcss/vite`, tokens in `src/styles.css`                      |
| Components              | shadcn/ui on Radix primitives (`src/components/ui`)                                      |
| State                   | zustand 5 (`persist` middleware for progress/prefs)                                      |
| Animation               | framer-motion for UI transitions; hand-written SVG for algorithm visuals                 |
| Icons                   | lucide-react (1.5px stroke, sizes 16/20/24)                                              |
| Toasts                  | sonner, single host mounted in `src/routes/__root.tsx`                                   |
| Charts (marketing only) | recharts                                                                                 |
| Tests                   | vitest — **103 tests across 9 files, all passing**                                       |

**There is no `tailwind.config.ts`** — Tailwind v4 tokens are declared in `@theme inline`
inside `src/styles.css`. Never add a config file.

Deliberately **not** used: react-router-dom, Redux, MUI, Chakra, styled-components, D3.

---

## 3. Design system — light theme only

Single source of truth: `src/styles.css`. Components consume Tailwind token classes
(`bg-paper`, `text-ink`, `border-hairline`, `bg-viz-active`…), never hex literals. The only
approved literal-colour exceptions already in the repo are brand marks (the Google "G") and
medal-tier gradients.

**Surfaces & ink**

| Token          | Value     | Use                                              |
| -------------- | --------- | ------------------------------------------------ |
| `--paper`      | `#f7f9f8` | page background                                  |
| `--card`       | white     | cards, panels, the code editor (it is light too) |
| `--hairline`   | `#e4e9e7` | every 1px border                                 |
| `--ink`        | `#0e1513` | headings and body                                |
| `--slate`      | `#5b6763` | secondary text                                   |
| `--slate-soft` | `#8a9591` | tertiary / captions                              |

**Accent (exactly one)** — teal: `--highlight` `#14b8a6`, `--accent-strong` `#0b7f6d`,
`--tint` `#e6f5f2`.

**Semantic only, never decorative** — `--warning` / `--warning-tint` (amber),
`--error` / `--error-tint` (rose), `--success` / `--success-tint`.

**Visualization palette** — a paired fill+ink token for every algorithm state:
`viz-idle`, `viz-active`, `viz-visited`, `viz-frontier`, `viz-found`, `viz-excluded`,
`viz-compare`, `viz-sorted`, plus edge tokens `viz-edge`, `viz-edge-active`,
`viz-edge-tree`, `viz-edge-rejected`. Renderers may only use these.

**Type** — `--font-sans` / `--font-display` = Instrument Sans (UI, headings);
`--font-mono` = JetBrains Mono (code, stats, chips, field labels).

**Shape & motion** — radii 4 / 8 / 10 / 16 / 24 / 32px, three soft shadows
(`--shadow-1..3`), motion durations `--duration-fast|base|slow`.

**Forbidden**: dark or black panels, purple/violet, rainbow gradients, glow blobs,
glassmorphism, neon, emoji-as-icon, stock photos of people, lorem ipsum.

---

## 4. Folder map

```
src/
  routes/                TanStack file routes — one file per URL
  components/
    ui/                  shadcn primitives (46 files) — vendor layer, rarely edited
    common/              12 project primitives + AlgorithmThumbnail (barrel: index.ts)
    viz/                 pure frame renderers + FrameView dispatcher + tokens.ts
    player/              playback controls bound to playerStore
    site-chrome.tsx      marketing nav + footer + AlgoraGlyph
    app-shell.tsx        AppSidebar / AppTopBar / AppWorkspaceBar
    onboarding-chrome.tsx OnboardingTopBar / OnboardingFooter / StepBadge
    settings-nav.tsx     settings sub-navigation
  engine/                algorithm runtime: types, StepBuilder, layout, registry
    algorithms/          12 algorithm modules
  stores/                zustand: progress, prefs, player, result
  data/                  static typed content (no fetching)
  hooks/                 useProgress, useSession, useAutoplay, usePlayerKeys, useHydrated…
  lib/                   pure logic: xp, recommend, session, runner, review, quests,
                         achievements, league, utils
  styles.css             the whole design system
```

Enforced import rules:

- Nothing in `components/viz/` may import a zustand store, `engine/registry.ts`, or
  `@tanstack/react-router` — renderers are pure `(props: { frame; className? }) => JSX`.
- `lib/*` is pure and dependency-light: no React, no DOM, no store imports (they take
  `ProgressData` as an argument instead). That is why every one of them is unit-tested.

---

## 5. Page inventory (30 route files)

Chrome column = which shell the page composes.

### Marketing (static by design)

| URL        | File          | Chrome      | What it is                             |
| ---------- | ------------- | ----------- | -------------------------------------- |
| `/`        | `index.tsx`   | site-chrome | Landing page                           |
| `/pricing` | `pricing.tsx` | site-chrome | Plans + comparison                     |
| `/blog`    | `blog.tsx`    | site-chrome | Article index                          |
| `/campus`  | `campus.tsx`  | site-chrome | University / campus program            |
| `/contact` | `contact.tsx` | site-chrome | Contact + form UI                      |
| `/paths`   | `paths.tsx`   | site-chrome | Learning paths — **wired** to progress |

### Auth & onboarding

| URL                      | File                        | Chrome            | What it is                |
| ------------------------ | --------------------------- | ----------------- | ------------------------- |
| `/auth`                  | `auth.tsx`                  | AlgoraGlyph       | Sign up                   |
| `/login`                 | `login.tsx`                 | AlgoraGlyph       | Log in                    |
| `/forgot-password`       | `forgot-password.tsx`       | AlgoraGlyph       | Request reset             |
| `/reset-password`        | `reset-password.tsx`        | AlgoraGlyph       | Set new password          |
| `/verify-email`          | `verify-email.tsx`          | AlgoraGlyph       | 6-digit mono code entry   |
| `/onboarding/goals`      | `onboarding/goals.tsx`      | onboarding-chrome | Step 1 — goals            |
| `/onboarding/assessment` | `onboarding/assessment.tsx` | onboarding-chrome | Step 2 — diagnostic       |
| `/onboarding/path`       | `onboarding/path.tsx`       | onboarding-chrome | Step 3 — recommended path |

### Core learning

| URL                 | File                   | Chrome                       | What it is                                                                           |
| ------------------- | ---------------------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| `/explore`          | `explore.tsx`          | AppSidebar + AppTopBar       | Catalog: fuzzy search, category tabs, difficulty/status/sort, pagination, URL-synced |
| `/algorithms/$slug` | `algorithms.$slug.tsx` | AppSidebar                   | Flagship workspace — viz + code + explain, deep-linkable `input`/`step`              |
| `/visualizer`       | `visualizer.tsx`       | AppSidebar                   | Picker rail, compare mode (two player stores), free-tier gate after 3 algorithms     |
| `/mastery-map`      | `mastery-map.tsx`      | AppSidebar + AppWorkspaceBar | Four-tier skill tree with live node states, zoom / fit-to-view                       |
| `/dev/engine`       | `dev.engine.tsx`       | none                         | Deliberately unstyled engine regression harness                                      |

### Practice & review

| URL                 | File                   | Chrome                       | What it is                                                                      |
| ------------------- | ---------------------- | ---------------------------- | ------------------------------------------------------------------------------- |
| `/practice/$slug`   | `practice.$slug.tsx`   | AppSidebar + AppWorkspaceBar | Editable editor, JS/TS/PY tabs, staged hints, Run vs Submit, Worker test runner |
| `/practice/results` | `practice.results.tsx` | AppSidebar + AppWorkspaceBar | Real last attempt: tests, runtime, XP breakdown, what's next                    |
| `/review`           | `review.tsx`           | AppSidebar + AppWorkspaceBar | Spaced-repetition session, self-grade Again/Hard/Good/Easy                      |

### Gamification

| URL             | File               | Chrome                       | What it is                                                             |
| --------------- | ------------------ | ---------------------------- | ---------------------------------------------------------------------- |
| `/dashboard`    | `dashboard.tsx`    | AppSidebar + AppTopBar       | XP/level, streak, weekly-minutes ring, continue-learning, today's plan |
| `/quests`       | `quests.tsx`       | AppSidebar + AppWorkspaceBar | Daily/weekly quests, claimable rewards, reset countdowns               |
| `/achievements` | `achievements.tsx` | AppSidebar + AppWorkspaceBar | Badge gallery + rewards shop (spend XP on streak freezes)              |
| `/leagues`      | `leagues.tsx`      | AppSidebar + AppWorkspaceBar | Deterministic 120-member weekly cohort, promote/demote zones           |

### Account

| URL                 | File                   | Chrome                       | What it is             |
| ------------------- | ---------------------- | ---------------------------- | ---------------------- |
| `/settings`         | `settings.index.tsx`   | app-shell + settings-nav     | Account settings       |
| `/settings/billing` | `settings.billing.tsx` | app-shell + settings-nav     | Subscription & billing |
| `/notifications`    | `notifications.tsx`    | AppSidebar + AppWorkspaceBar | Inbox                  |

Plus `__root.tsx` — the only root layout: html/head, the sonner toast host, `<Outlet />`.
`src/routes/README.md` documents the filename → URL conventions.

---

## 6. Anatomy of the two signature screens

**Landing page (`src/routes/index.tsx`, block order as coded)**
`SiteNav` → `Hero` (with a hand-drawn `TreeSvg` and `VisualizerCard`, legend dots, icon
buttons) → `SocialProof` (MIT / Stanford / Berkeley / CMU / Waterloo SVG lockups from
`university-lockups.tsx`) → `GamificationSection` (`GameCard`, `XpRing`, `StreakBlock`,
`Leaderboard`) → `MasteryMap` → `Features` → `CtaBand` → `SiteFooter`.

**Algorithm workspace (`src/routes/algorithms.$slug.tsx`)**
`Breadcrumb` → `WorkspaceHeader` (h1, `DifficultyBadge`, `ComplexityTag`, bookmark toggle,
"Complete lesson") → body grid `minmax(0,1fr) / 380px`: `FrameView` canvas + `AuxPanels` on
the left, tabbed **Code / Explain / Input / About** on the right → `PlaybackBar` with
`StepScrubber`, `SpeedControl`, `StepCounter`, `CounterStrip`. Inputs and the current step
are encoded into the URL (debounced) so any state is shareable.

---

## 7. The visualization engine

`src/engine/` is the heart of the product and is treated as **final API**.

- **`types.ts`** — frame contracts (`ArrayFrame`, `TreeFrame`, `GraphFrame`, `GridFrame`,
  `TableFrame`), `Step`, `AlgorithmRun`, `AlgorithmModule`.
- **`builder.ts`** — `StepBuilder`. Guarantees, each covered by a test: step index `i`
  assigned sequentially from 0; every frame and aux panel **deep-cloned** so steps can never
  alias; counters snapshotted per step and cumulative; `emit()` throws on an invalid
  `codeLine`; `finish()` returns a frozen run.
- **`layout.ts`** — `layeredLayout` (BFS-layer auto-layout) and `circularLayout`; every
  graph algorithm reuses them instead of hand-placing nodes.
- **`registry.ts`** — slug → module map. **Keys match `src/data/algorithms.ts` verbatim.**
  Exposes `getModule`, `hasModule`, `listModules`.

**12 runnable modules**: `binary-search`, `bubble-sort`, `insertion-sort`,
`selection-sort`, `merge-sort`, `quicksort`, `heap-sort`, `sliding-window`, `bfs`, `dfs`,
`dijkstra`, `topological-sort`. Each ships 8–16 pseudocode lines, aligned js/ts/py source,
narration per step, 3 presets, a `validate()` returning error strings, and accurate counters.

**Module → pixels pipeline**

```
data/algorithms.ts (slug)
  └─ engine/registry.ts  → AlgorithmModule
       └─ stores/playerStore.ts (load → run → index)
            ├─ components/viz/FrameView.tsx  → Array|Tree|Graph|Grid|Table view + AuxPanels
            └─ components/player/*           → scrubber, speed, counters, playback
```

`useAutoplay` drives playback with `requestAnimationFrame`; `usePlayerKeys` binds keyboard
shortcuts.

---

## 8. State layer

### `stores/progressStore.ts` — the learner record

Persisted with zustand `persist`, name `algora-progress`, `version: 1`, with a `migrate`
hook. Shape (`ProgressData`): `xp`, `level`, `streak` (`current`, `longest`,
`lastActiveISO`, `freezesLeft`), and records keyed by slug/id for `algorithms`, `lessons`,
`problems`, `reviewCards`, `quests`, `achievements`, `activity` (per local day:
`xp/minutes/steps/solved`), plus `bookmarks[]` and `activePathSlug`.

Actions: `awardXp`, `recordStepsWatched`, `recordMinutes`, `markLessonSection`,
`completeLesson`, `recordAttempt`, `markSolved`, `touchStreak`, `useFreeze`, `gradeCard`,
`setQuestProgress`, `claimQuest`, `unlockAchievement`, `addFreeze`, `toggleBookmark`,
`setActivePath`, `resetAll`.

Rules the store enforces:

- **Mastery is derived, never stored as truth** — `computeMasteryPct()` from steps watched,
  lesson done, quiz score and problems solved.
- Streaks use **local calendar days** (`dayKey`, `calendarDaysBetween`), not 24h windows.
- `awardXp` recomputes the level through `lib/xp.ts`.
- Quest/achievement progress is recomputed from counters; only claim/unlock timestamps
  persist.

### Other stores

- **`playerStore.ts`** — a `createPlayerStore()` **factory** provided through React context,
  so `/visualizer` compare mode can run two independent players. State: slug, run, index,
  isPlaying, loop, error, rawInputs; actions for play/pause/step/seek/first/last/milestones.
- **`prefsStore.ts`** — persisted UI preferences (code language, etc.).
- **`resultStore.ts`** — in-memory hand-off of a `SubmissionResult` from the practice editor
  to `/practice/results` (deliberately not persisted).

### SSR / hydration rule

Persisted state is never read during the first render. `hooks/useHydrated.ts` returns false
on the server and on the first client render, and `baselineProgress` supplies the SSR values,
so server HTML and first client HTML are byte-identical. No `Math.random()` or `Date.now()`
in render — that is also why `lib/league.ts` uses a seeded `mulberry32` PRNG.

---

## 9. Pure logic libraries (`src/lib/`)

| File              | Responsibility                                                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `xp.ts`           | Level curve: `xpForLevel`, `levelFromXp`, `xpAtLevelStart`, `xpToNextLevel`, `progressPct`                                                         |
| `recommend.ts`    | `scoreAlgorithm`, `sortRecommended`, `nextBestAction` — powers dashboard, explore sort, mastery-map sidebar                                        |
| `session.ts`      | Visualizer session scoring: `sessionXp`, `minutesFromSeconds`, `isRunComplete` (XP per step, 20-step cap, completion share)                        |
| `runner.ts`       | Practice execution: `stripTypes` (TS→JS), `entryName`, `deepEqual`, `workerSource`, `toResults`, `summarize`, `solveXp` (attempt + hint penalties) |
| `review.ts`       | SRS: `questionFor`, `cardFor`, `buildQueue`, `nextInterval`, `intervalLabel`, `gradeXp`                                                            |
| `quests.ts`       | `questCurrent`, `questState`, `periodKeyFor`, `periodEnd`, `formatCountdown`, `activePathPct`, `completedCategories`                               |
| `achievements.ts` | `achievementCounter`, `evaluateAchievements`, `newlyUnlocked` — idempotent, re-derivable badges                                                    |
| `league.ts`       | Deterministic weekly cohort: `mulberry32`, `weekStart/End`, `isoWeek`, `weekDayKeys`, `buildLeague`                                                |
| `utils.ts`        | `cn` class merge                                                                                                                                   |

All take plain data in and return plain data out, which is what makes the 103-test suite
possible without a DOM.

---

## 10. Static content layer (`src/data/`)

Typed by `data/types.ts`, no fetching anywhere.

| File              | Contents                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `algorithms.ts`   | `CATEGORY` list + **25 algorithms** (slug, name, one-liner, category, difficulty, complexity, estMinutes) |
| `lessons.ts`      | **6 lessons** mapped to algorithm slugs                                                                   |
| `problems.ts`     | **11 practice problems** (incl. `two-sum`) with tests, starters, hints                                    |
| `paths.ts`        | **3 DSA paths**: Interview Prep, Data Structures (most popular), Competitive Programming                  |
| `quests.ts`       | **12 quests** (daily + weekly)                                                                            |
| `achievements.ts` | **24 achievements** across lessons, problems, streaks, categories, paths, quests, level                   |
| `user.ts`         | `mockUser` — seeds the progress store on first run                                                        |

---

## 11. Build history

**Phase 0 — pixel-perfect static desktop screens**, in shipping order: landing → visualizer
→ paths → pricing / contact / blog / campus → sign-up / login / password recovery → email
verification → 3-step onboarding → student dashboard → explore catalog (9 custom SVG
thumbnails) → algorithm workspace → practice / results / review / mastery map → quests /
leagues / achievements → settings / billing / notifications.

**Phase 1 — system extraction.** All colours moved into `styles.css` tokens; 30+ files
refactored off hex literals; the 12 `components/common/` primitives created; the typed
`src/data/` layer and `prefsStore` added; vitest installed.

**Phase 2 — engine.** `engine/types.ts` + `StepBuilder` (+7 tests), `layout.ts`, first three
modules, then the remaining nine (40+ assertions), `playerStore`, `useAutoplay`,
`usePlayerKeys`, the `/dev/engine` harness, the `player/*` control suite, and the five `viz/*`
renderers behind `FrameView`.

**Phase 3 — progression.** `progressStore` (persist + migrate), `xp.ts`, `recommend.ts`,
`useProgress`, `AlgorithmThumbnail` (visibility-gated, max 3 concurrent hover animations).

**Phase 4 — interactivity, one roadmap step per turn, zero pixel change:**

| Step | Result                                                                            |
| ---- | --------------------------------------------------------------------------------- |
| 1    | Dashboard live from real XP/streak/activity + `nextBestAction()`                  |
| 2    | Mastery map node states and `/paths` completion from real mastery                 |
| 3    | Session recording: `session.ts` + `useSession`, XP toasts, store-backed bookmarks |
| 4    | Practice challenge: `runner.ts` + `useTestRunner` Worker with a 3s hard timeout   |
| 5    | Results screen from `resultStore`; `/review` as a working SRS session             |
| 6    | Quests + achievements derived from counters, one-time claims, period resets       |
| 7    | Leagues: deterministic seeded cohort, user placed by real weekly XP               |

**Remaining** (see `ROADMAP.md`): Step 8 settings + notifications, Step 9 onboarding + auth
flows, Step 10 global chrome (⌘K palette, global search, sidebar counters), and an optional
backend phase (Lovable Cloud accounts + progress sync + real leaderboards).

---

## 12. Conventions and guard-rails

- **Change only what the prompt asks.** No drive-by refactors, renames or restyles; do not
  touch design tokens unless the task is about tokens.
- **Reuse before creating** — search `components/common`, `components/viz`,
  `components/player` first.
- **TypeScript everywhere, explicit prop types, no `any`.**
- **Token-only colours** in components; no hex, no `bg-white`/`text-black`, no numbered
  Tailwind palettes.
- **Accessibility**: real `<button>`s, aria-labels, visible focus rings, keyboard paths for
  every interaction, `prefers-reduced-motion` honoured by every animation.
- **Layout floor**: nothing may break at 375px width, even though desktop is the target.
- **SSR-safe**: no randomness or clock reads in render; persisted reads go through
  `useHydrated()`.
- **Never hand-edit** `src/routeTree.gen.ts`, and never add a Tailwind config file.
- Add tests whenever logic is added; keep the suite green.

---

## 13. Working on it

```bash
bun run dev      # dev server on :8080
bun run test     # vitest, 103 tests
bun run lint     # eslint
bun run build    # production build
```

**Add an algorithm**: entry in `src/data/algorithms.ts` → module in
`src/engine/algorithms/<name>.ts` built with `StepBuilder` (reuse `layout.ts` for graphs) →
register the slug verbatim in `src/engine/registry.ts` → add a known-correct assertion in
`src/engine/__tests__/algorithms.test.ts`. No UI work needed; `FrameView` dispatches on the
frame kind.

**Add a page**: new file in `src/routes/` (dots become slashes; `createFileRoute` string must
match the filename), compose the right chrome (`site-chrome` for marketing, `app-shell` for
product, `onboarding-chrome` for the wizard), and give the route its own `head()` with a
unique title and description.

**Add a token**: declare the raw value under `:root` in `src/styles.css`, expose it in
`@theme inline` as `--color-*` / `--duration-*`, then use the generated class. Never inline
the value in a component.
