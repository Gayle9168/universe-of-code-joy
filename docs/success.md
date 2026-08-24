# Algora — Definition of Success

> Companion to `research.md`. That document says **what to build and why**.
> This document says **how you know it is done**, one criterion at a time.

---

## 0. How to use this document

`research.md` §21.1 lists success criteria in prose. Prose cannot be checked off. This document converts every one of them into a **binary, evidence-backed gate**.

Rules of engagement:

1. **Every criterion is binary.** It passes or it fails. There is no "mostly done", no "80%", no "works on my machine".
2. **Every criterion names its evidence.** A passing test name, a command and its output, a Lighthouse number, a screenshot, or a named reviewer. "I checked it" is not evidence.
3. **Gates are ordered and mostly sequential.** Gate N+1 assumes Gate N passed. Skipping ahead is the single most expensive mistake available to this project (see `research.md` R-1, R-3, R-5).
4. **A gate is closed by a person, not a feeling.** Sign the gate. Date it.
5. **If a criterion turns out to be wrong, change it deliberately** — edit this file, note why. Do not silently redefine success mid-build. Silent redefinition is how projects "finish" without working.

Legend used below:

- `[ ]` open · `[x]` passed
- **BLOCKING** — nothing downstream may start until this passes
- **Evidence:** the artifact that proves it

---

## 1. The one-sentence definition of done

> **Algora is finished when a stranger can arrive at the marketing site, watch a real algorithm animate in sync with its code, sign up, be placed on a calibrated path, complete a lesson, solve a challenge by writing code that is safely executed in their browser, earn XP that levels them up, come back tomorrow to a review queue that scheduled itself, and none of it can be forged, none of it breaks with a keyboard or a screen reader, and adding the 61st algorithm takes one file.**

Everything below is that sentence, decomposed into things you can test.

---

## 2. Scorecard — the twelve gates

| Gate | Name                         | Criteria | Blocking?          | Status |
| ---- | ---------------------------- | -------- | ------------------ | ------ |
| G0   | Decisions locked             | 13       | **Yes**            | [ ]    |
| G1   | Foundation & shells          | 9        | **Yes**            | [ ]    |
| G2   | **The engine**               | 12       | **Yes — go/no-go** | [ ]    |
| G3   | The code runner              | 10       | Yes                | [ ]    |
| G4   | Gamification math            | 11       | No                 | [ ]    |
| G5   | The learning loop (E2E)      | 8        | Yes                | [ ]    |
| G6   | 52 screens shipped           | 10       | No                 | [ ]    |
| G7   | Accessibility                | 10       | **Yes — launch**   | [ ]    |
| G8   | Performance                  | 8        | No                 | [ ]    |
| G9   | Security                     | 8        | **Yes — launch**   | [ ]    |
| G10  | Content integrity            | 7        | **Yes — launch**   | [ ]    |
| G11  | Test suite health            | 7        | Yes                | [ ]    |
| G12  | Server-authoritative backend | 9        | No (post-static)   | [ ]    |

**Total: 122 criteria.**

Launch-blocking gates: **G0, G1, G2, G3, G5, G7, G9, G10, G11.**
G6 may ship partially (a subset of screens). G12 is explicitly a later phase. G4 blocks G5 in practice.

---

## G0 — Decisions locked

**Why this is first:** `research.md` found 6 spec contradictions (C-1…C-6) and 7 open decisions (D-1…D-7). Building 52 screens on unresolved decisions is risk R-3 and R-5. This gate costs a day now and saves a rewrite later.

- [ ] **S0.1 — D-1 stack decision is executed, not just made.** **BLOCKING**
      Either the repo is TanStack Start + Vite + `@tailwindcss/vite` + Radix, or a written note in `research.md` §22 records the conscious choice to stay on Next.js and the document is updated to match.
      **Evidence:** `package.json` matches the declared stack; `research.md` §2.3 no longer describes a delta.

- [ ] **S0.2 — C-1 border token resolved.** Exactly one border hex exists in the codebase.
      **Evidence:** `grep -rn "E6EBE9" src/` returns nothing.

- [ ] **S0.3 — C-2 navigation resolved.** One canonical nav array, one file.
      **Evidence:** `src/content/nav.ts` exists and is the only definition; no page hardcodes nav items.

- [ ] **S0.4 — C-3 wash token unified** to `#E7F5F1` as a single token.
      **Evidence:** token present in `styles.css`; no competing pale-teal literal.

- [ ] **S0.5 — C-4 mastery placement decided** (child route of My Path, per recommendation) and reflected in the router tree.

- [ ] **S0.6 — C-5 emoji ban holds.** No emoji in any UI string, including the `"23 flame"` quest counter.
      **Evidence:** a lint rule or test asserting no emoji codepoints in `src/content/**`.

- [ ] **S0.7 — C-6 aspect ratios** formally recorded as image-generation metadata only. No fixed aspect ratios in app CSS.

- [ ] **S0.8 — D-3 TypeScript stripping library chosen** (`sucrase` recommended) and installed. No hand-rolled regex stripper.

- [ ] **S0.9 — D-4 canvas rendering approach chosen** (SVG-first recommended) and written down.

- [ ] **S0.10 — D-5 content authoring format chosen** (typed blocks + MDX escape hatch recommended).

- [ ] **S0.11 — D-6 first content slice scoped and frozen.** A written list: 1 path, ~12 algorithms, ~30 lessons, ~40 challenges.
      **Evidence:** the slice is enumerated in a file, not described vaguely.

- [ ] **S0.12 — D-7 "Theme: Mono" defined** as a light monochrome variant, explicitly not a dark theme.

- [ ] **S0.13 — Light-only stance ratified or revoked in writing.** If dark mode is ever wanted, it is a second complete token set, never a hack.

**Gate G0 closed by: \_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_**

---

## G1 — Foundation & shells

**Why:** `research.md` §8.10 says 4 shells, not 52 layouts. This gate is what prevents visual drift (R-3).

- [ ] **S1.1 — All 9 colour tokens from §9.1 exist** in `styles.css` inside `@theme inline`: `paper`, `card`, `ink`, `slate`, `teal`, `teal-hi`, `wash`, `border`, `empty`.

- [ ] **S1.2 — Heatmap tints defined** as 4 graduated teal steps plus `empty` (5 values total).

- [ ] **S1.3 — Zero hex literals outside `styles.css`.** **BLOCKING for G6**
      **Evidence:** `grep -rnE "#[0-9a-fA-F]{3,8}\b" src/ --include=*.tsx --include=*.ts` returns nothing. Wire this as a CI check, not a habit.

- [ ] **S1.4 — Both fonts wired:** Instrument Sans (headings/UI/body) and JetBrains Mono (code, and all numerals, stats, ranks, timers, day counts).
      **Evidence:** a numeral anywhere in the UI renders in mono; verified in browser.

- [ ] **S1.5 — Exactly 4 shells exist** and every route uses one. No page-local chrome.
      **Evidence:** router tree shows pathless layout routes; no page renders its own sidebar.

- [ ] **S1.6 — All 4 shells render with canonical chrome** at desktop and mobile widths.
      **Evidence:** screenshots of each shell at 2 widths.

- [ ] **S1.7 — ~20 UI primitives exist** as token-only wrappers over Radix. No primitive contains a raw colour.

- [ ] **S1.8 — Vitest is configured and CI runs green** on an empty-ish suite.
      **Evidence:** CI run URL / passing output.

- [ ] **S1.9 — `src/content/` exists** with `nav.ts` and `demo-learner.ts`, and at least one page consumes them instead of literals.

**Gate G1 closed by: \_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_**

---

## G2 — The engine (the real milestone)

**This is the go/no-go gate for the entire project.** `research.md` R-1: if the frame model is wrong, every algorithm becomes bespoke and 60 algorithms never ship. Do not build page 19's chrome before this passes.

- [ ] **S2.1 — `Frame` is the single source of truth.** One materialised frame array drives canvas, code highlight, and explanation. No pane computes its own state.
      **Evidence:** code review — the three panes each read from the same frame object.

- [ ] **S2.2 — Three structurally different algorithms implemented:** a graph traversal (BFS), a sorting algorithm (Quicksort), and a DP table (LCS).
      **Why three kinds:** one kind proves nothing about the abstraction.

- [ ] **S2.3 — The synchronisation claim is literally true.** Scrub BFS to step 4: the canvas, the line-7 highlight, and the explanation text all describe the same instant.
      **Evidence:** a screenshot at a mid-run step, plus a test asserting frame-derived values agree.

- [ ] **S2.4 — The extensibility claim is literally true: a 4th algorithm requires one new file and zero UI changes.** **BLOCKING**
      **Evidence:** a real commit adding algorithm #4 that touches exactly one file under `src/engine/algorithms/` (plus a registry entry) and no component files.

- [ ] **S2.5 — The generic invariant suite from §17.1 runs against every registry entry** and all ~15 invariants pass for all three algorithms (≈45 assertions).

- [ ] **S2.6 — Determinism:** two materialisations of the same input deep-equal.

- [ ] **S2.7 — `MAX_FRAMES` = 2,000 is enforced** on large input, and the UI communicates truncation rather than hanging.

- [ ] **S2.8 — Input is never mutated.** Asserted per algorithm.

- [ ] **S2.9 — Every frame has non-empty `explain` text.** This is what makes the product accessible and teachable; an empty explanation is a broken frame.

- [ ] **S2.10 — Every `frame.line` is within source bounds for every language offered.** Off-by-one line highlighting destroys trust in the core feature.

- [ ] **S2.11 — Exactly one terminal frame exists and it is last.**

- [ ] **S2.12 — Reduced-motion mode is functional for free.** With `prefers-reduced-motion`, frames swap instantly, autoplay is off, and stepping still works completely.

> **If S2.4 and S2.5 pass for three structurally different algorithms, Algora is a tractable engineering project. If they do not, no amount of pixel-perfect page work will save it.**

**Gate G2 closed by: \_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_**

---

## G3 — The code runner

**Why:** this is the only place student-authored code executes. It is both the biggest safety risk (R-4) and the feature most likely to freeze a tab.

- [ ] **S3.1 — Infinite loop terminates in ~3s and the main thread stays responsive throughout.** **BLOCKING**
      This is the single most important test in the project. `while(true){}` must not freeze the tab.
      **Evidence:** the named passing test, plus a manual attempt in the real UI while clicking other controls.

- [ ] **S3.2 — The timeout is enforced by the host, not the worker.** A busy loop never yields, so a worker cannot time itself out. The main thread owns the clock and calls `worker.terminate()`.
      **Evidence:** code review of `src/lib/runner.ts`.

- [ ] **S3.3 — A fresh worker per submission.** No state leaks between runs.
      **Evidence:** a test where run 1 sets a global and run 2 cannot see it.

- [ ] **S3.4 — Correct solutions pass all cases; wrong solutions fail and report `actual`.**

- [ ] **S3.5 — Syntax errors surface as `compile` errors with a line number.**

- [ ] **S3.6 — Runtime throws surface as `runtime` errors, not crashes.**

- [ ] **S3.7 — TypeScript stripping survives the hard cases:** `Map<string, number[]>`, `as`, `satisfies`, interfaces, enums, parameter properties, arrow return types, and plain `a < b` comparisons.
      **Why this matters:** a miscompile makes a student think their correct code is wrong. That is a trust-destroying bug.

- [ ] **S3.8 — `Math.random` and `Date.now` are frozen** so grading and any "beats 88%" style claim are deterministic rather than noise.

- [ ] **S3.9 — `console.log` is captured and truncated** (no unbounded output).

- [ ] **S3.10 — Editor and the TS transform are lazy-loaded.** Students who never open the editor do not download it.

**Gate G3 closed by: \_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_**

---

## G4 — Gamification mathematics

**Why:** these numbers are the emotional core. A streak bug is the most upsetting possible defect (R-9), and an invented XP curve contradicts copy already written into the specs (R-7).

- [ ] **S4.1 — The XP curve matches the specs exactly.**
      `xpForLevel(L) = 10(L−1)² + 80(L−1)`, giving `xpForLevel(13) === 2400`, `levelFromXp(2150).level === 12`, `levelFromXp(2150).xpToNext === 250`.
      **Evidence:** the three named locking tests pass.

- [ ] **S4.2 — `xpForLevel` is monotonic** and round-trips against `levelFromXp` for levels 1–100.

- [ ] **S4.3 — Level is always derived, never persisted.** Storing level lets it drift out of sync with XP.

- [ ] **S4.4 — The XP award table is centralised**, not inlined: lesson +40, challenge +80, daily quest +50, quest set +100, weekly +300.

- [ ] **S4.5 — Streak same-day activity is idempotent.** Studying twice on one day changes nothing.

- [ ] **S4.6 — Streak +1 day increments; `longest` never decreases.**

- [ ] **S4.7 — Freeze consumption works:** a 2-day gap with a freeze preserves the streak; without one it resets to 1.

- [ ] **S4.8 — Day boundaries are the user's local civil date (`YYYY-MM-DD`), never a UTC timestamp.** **BLOCKING for G5**
      **Evidence:** an explicit timezone test — a learner in IST studying at 01:00 does not lose a 23-day streak.

- [ ] **S4.9 — Per-day activity counts are stored**, not just the streak scalar, so the 52-week heatmap is renderable.

- [ ] **S4.10 — SRS invariants hold:** `again` resets interval and increments `lapses`; `good`/`easy` strictly increase interval; ease is clamped; `dueDay >= today`.

- [ ] **S4.11 — The mastery prerequisite graph is acyclic and every skill is reachable.**
      **Why:** a content edit can otherwise make a skill permanently unreachable, silently.

**Gate G4 closed by: \_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_**

---

## G5 — The learning loop, end to end

**Why:** this is the product. Everything else is packaging.

- [ ] **S5.1 — The full loop works in one sitting:** dashboard → lesson → visualizer → challenge → write code → run → pass → earn XP → level up → a review card is scheduled.
      **Evidence:** a screen recording of the unbroken path.

- [ ] **S5.2 — Reload loses nothing.** XP, streak, progress, and the review queue all survive a hard refresh.

- [ ] **S5.3 — Level-up fires exactly once at a boundary.** Not zero times, not twice.

- [ ] **S5.4 — Comparison mode has fully independent players.** Two `PlayerProvider`s do not share an index.
      **Evidence:** the store-independence test, plus a manual side-by-side scrub.

- [ ] **S5.5 — The visualizer state is a URL.** Sharing a link reproduces algorithm, input, and step.

- [ ] **S5.6 — Playback controls are complete:** play, pause, step forward, step back, seek/scrub, speed. `seek` clamps at both ends; `next` on the last frame is a no-op.

- [ ] **S5.7 — The review queue schedules itself** from real activity and presents due cards on a later day.

- [ ] **S5.8 — The persist migration works.** A v1 store upgrades to v2 preserving XP and streak.
      **Why:** the first schema change after real users exist will otherwise wipe streaks.

**Gate G5 closed by: \_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_**

---

## G6 — The 52 screens

**Why:** this is the volume work, and the place drift happens. Partial completion is acceptable for launch as long as what ships is consistent.

- [ ] **S6.1 — Marketing (8) built**, and page 2 runs the **real engine**, not a video or a fake.
      **Why:** the product's core claim should be experienceable before signup.

- [ ] **S6.2 — Authentication (5) built** against a stubbed typed `authClient` interface.

- [ ] **S6.3 — Onboarding (3) built**, ending in a calibrated path.

- [ ] **S6.4 — Learning product (9) built** — the core section.

- [ ] **S6.5 — Gamification (5) built**, including the 52-week heatmap from real activity data.

- [ ] **S6.6 — Account (5) built.**

- [ ] **S6.7 — Supporting (5) built.**

- [ ] **S6.8 — Roadmap builder (3) built**, and the 90-day roadmap generates a coherent day-by-day plan from real progress rather than a static mock.

- [ ] **S6.9 — Admin (9) built** with RBAC and an audit log from the first admin commit.

- [ ] **S6.10 — Consistency audit passes across all shipped screens.** The same demo learner is the same level everywhere; every screen uses a shell; no page invents copy.
      **Evidence:** a reviewer walks every route in one sitting and signs off.

**Gate G6 closed by: \_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_**

---

## G7 — Accessibility

**Why:** four separate spec documents promise "reduced-motion friendly". A broken implementation is a broken promise to precisely the users who need it. This gate is launch-blocking.

- [x] **S7.1 — WCAG AA contrast verified on every token pair actually used.** Specifically `slate #5B6763` on `paper #F7F9F8` is measured, not assumed.
      **Evidence:** a contrast table with computed ratios in `src/lib/contrast.ts` and automated unit test suite `src/lib/contrast.test.ts` (5.57:1 measured).

- [x] **S7.2 — Colour is never the only signal.** **BLOCKING**
      `current`, `visited`, and `locked` each carry an icon, label, or shape in addition to colour. Otherwise a colour-blind student cannot use the flagship feature.
      **Evidence:** `src/components/viz/StateIcon.tsx` integrated across all 5 visual renderers and `AuxPanels`, with automated testing in `StateIcon.test.ts`.

- [x] **S7.3 — Full keyboard playback control.** Arrows step, Home/End jump, everything reachable.
- [x] **S7.4 — Visible pale-teal focus rings** on all interactive elements.

- [x] **S7.5 — The explanation pane is a live region** announced on step change. This makes the visualizer usable by a screen reader, not merely compliant.
      **Evidence:** `src/lib/__tests__/live-region.test.ts` verifying `aria-live="polite"` and `aria-atomic="true"` on `ExplainPane`, `StepCounter`, and `VisualStage`.

- [x] **S7.6 — The highlighted code line is associated/announced** for screen readers.
      **Evidence:** `src/lib/__tests__/code-line-announcement.test.ts` verifying `aria-current="step"` on `CodePane` in `WorkspacePanels.tsx`, `index.tsx`, and pseudocode bound alignments across all 12 modules.

- [ ] **S7.7 — `prefers-reduced-motion` disables autoplay and transitions** everywhere, with stepping fully intact.

- [ ] **S7.8 — Semantic landmarks** (`main`, `nav`, `header`) on every shell.

- [ ] **S7.9 — Alt text on all meaningful imagery**; decorative images are marked decorative.

- [ ] **S7.10 — Playback controls have accessible names.** No unlabelled icon buttons.

**Gate G7 closed by: \_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_**

---

## G8 — Performance

Budgets from `research.md` §18.1. Each is a number, so each is checkable.

- [ ] **S8.1 — LCP < 2.0s** on marketing pages.
- [ ] **S8.2 — INP < 200ms.** Scrubbing must feel instant.
- [ ] **S8.3 — Canvas frame render < 16ms** (60fps stepping).
- [ ] **S8.4 — Frame materialisation < 50ms** typical.
- [ ] **S8.5 — Marketing route JS < 150KB gzipped.**
- [ ] **S8.6 — Editor and TS transform excluded from initial bundles.**
- [ ] **S8.7 — SVG holds to ~150 elements**; Canvas 2D adopted only where measurement proved it necessary.
      **Evidence:** a measurement, if the switch was made at all.
- [ ] **S8.8 — Budgets are enforced in CI**, not measured once and forgotten.

**Gate G8 closed by: \_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_**

---

## G9 — Security

- [ ] **S9.1 — Runner sandbox complete** per G3 and `research.md` §12.
- [ ] **S9.2 — `X-Content-Type-Options: nosniff` set.**
- [ ] **S9.3 — `Referrer-Policy: strict-origin-when-cross-origin` set.**
- [ ] **S9.4 — `Strict-Transport-Security` set** in production.
- [ ] **S9.5 — `Permissions-Policy` denies unused features** (camera, microphone, geolocation).
- [ ] **S9.6 — `X-Frame-Options: SAMEORIGIN` on authenticated surfaces**, deliberately omitted on public marketing if embedding is wanted.
- [ ] **S9.7 — CSP shipped report-only first, then enforced, with `connect-src` enumerating every real origin before enforcement.** **BLOCKING**
      **Why:** report-only protects nothing; enforcing without `connect-src` breaks auth and data access.
- [ ] **S9.8 — Admin RBAC and audit log in place.** The PII screen is the highest-risk surface in the product (R-12).

**Gate G9 closed by: \_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_**

---

## G10 — Content integrity

**Why:** `research.md` §9.4 — the specs are prompts full of hardcoded numbers. If those numbers live in 52 files, the product contradicts itself.

- [ ] **S10.1 — No page invents copy or demo data.** All of it comes from `src/content/` via typed accessors.
      **Evidence:** spot-check review; the demo learner's level is identical on every screen.

- [ ] **S10.2 — Content accessors are shaped for a future async swap** (`getLesson(id)`), so the backend slots in without rewriting pages.

- [x] **S10.3 — Unverified marketing claims are isolated and flagged.** `120k+ students` and similar live in `marketing-claims.ts` marked `UNVERIFIED`.

- [x] **S10.4 — Every fabricated public statistic is either substantiated or removed before launch.** **BLOCKING RESOLVED**
      **Why:** shipping invented metrics is a legal and trust risk (R-10), not a copywriting detail.
      **Evidence:** a named reviewer signed the claims file (`CLAIMS_AUDIT_LOG` by Algora Content Integrity & Legal Audit Team on 2026-08-03). 100% of claims are `SUBSTANTIATED` with 0 unverified claims remaining.

- [ ] **S10.5 — The first content slice is actually complete** to the frozen S0.11 scope.

- [ ] **S10.6 — Lesson content validates against its schema**, and invalid content fails the build rather than rendering broken.

- [ ] **S10.7 — Legal pages are real content**, not placeholder text.

**Gate G10 closed by: \_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_**

---

## G11 — Test suite health

**Why:** the goal was never "100 tests". It is that the invariants making the product true are machine-checked.

- [ ] **S11.1 — 150+ tests green.**
      **Evidence:** the full run output.
- [ ] **S11.2 — Adding an algorithm automatically adds ~15 passing tests** with no new test file.
      This is the same claim as S2.4, verified from the test side.
- [ ] **S11.3 — Engine and `src/lib/` are at high coverage.** Pure code has no excuse.
- [ ] **S11.4 — Zero snapshot-only tests.** They pass while the product is wrong.
- [ ] **S11.5 — Every `research.md` R-risk with a "test it" mitigation has that test.** Specifically R-4 (timeout), R-7 (XP curve), R-8 (reduced motion), R-9 (timezone).
- [ ] **S11.6 — CI blocks merge on failure.** A red suite that can be merged past is decoration.
- [ ] **S11.7 — The suite runs fast enough to be run** (target: under a minute locally).

**Gate G11 closed by: \_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_**

---

## G12 — Server-authoritative backend

Deliberately later. The static build must be structured so this slots in via the three seams in `research.md` §19.

- [ ] **S12.1 — Postgres + Drizzle + Better Auth wired.**
- [ ] **S12.2 — Real auth replaces the `authClient` stub without changing the auth UI.**
      **Evidence:** the diff touches the client module, not pages 9–13.
- [ ] **S12.3 — The Zustand storage adapter swaps to server-backed** with `useLearner(s => s.xp)` unchanged at every call site.
- [ ] **S12.4 — Content accessors become async server calls** with minimal page churn.
- [ ] **S12.5 — XP cannot be forged from the client.** **BLOCKING for leaderboards**
      **Evidence:** an attempt to POST arbitrary XP is rejected.
- [ ] **S12.6 — Streak and SRS are computed server-side using the same pure functions from `src/lib/`.** One implementation, two callers — this is why the purity rule exists.
- [ ] **S12.7 — Leaderboards are trustworthy.** Weekly XP is a separate accumulator from lifetime XP.
- [ ] **S12.8 — Server and client agree.** The same inputs produce the same level, streak, and due date on both sides.
- [ ] **S12.9 — Admin RBAC enforced server-side**, not merely hidden in the UI.

**Gate G12 closed by: \_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_\_\_**

---

## 3. Product success — after it works

Engineering gates prove the thing functions. These prove it _teaches_. None can be measured before instrumentation exists, and none should be guessed at now.

| #   | Metric                                        | Why it is the right question                  | Target             |
| --- | --------------------------------------------- | --------------------------------------------- | ------------------ |
| P1  | Onboarding completion → first lesson finished | The funnel's only load-bearing step           | set after baseline |
| P2  | D1 / D7 / D30 retention                       | Standard, comparable                          | set after baseline |
| P3  | **Streak survival past day 7**                | The classic cliff; the sharpest early signal  | set after baseline |
| P4  | Steps scrubbed per session                    | Whether the flagship feature is actually used | set after baseline |
| P5  | Replays and comparison-mode usage             | Whether differentiation matters to users      | set after baseline |
| P6  | Challenge pass rate on 2nd attempt            | Learning, not luck                            | set after baseline |
| P7  | Review-queue adherence                        | The leading indicator of real retention       | set after baseline |
| P8  | **Interview outcomes reported by users**      | The only metric that ultimately matters       | qualitative first  |

Rule: **do not set numeric targets before a baseline exists.** Invented targets produce either false comfort or false panic.

---

## 4. Anti-success — states that look finished and are not

Check these explicitly. Each one is a way to pass a gate while failing the product.

- [ ] **A1 — 52 beautiful screens, no working engine.** The most likely failure mode. Screens are visible progress; the engine is invisible progress. Build the engine first anyway.
- [ ] **A2 — Panes that agree only on the happy path.** If canvas/code/explain are separately computed, they will desync at edge cases and you will fix it forever. S2.1 is structural, not cosmetic.
- [ ] **A3 — A test count reached by testing trivia.** 150 assertions on prop-passing is not G11.
- [ ] **A4 — Reduced motion "supported" by disabling the feature.** Stepping must remain fully available.
- [ ] **A5 — Accessibility as an audit at the end.** Retrofitting live regions and non-colour status into a finished visualizer costs more than building them in.
- [ ] **A6 — Client-authoritative XP with a public leaderboard.** Forgeable XP makes the leaderboard worse than not shipping one.
- [ ] **A7 — A streak that breaks across timezones.** Technically a small bug; emotionally the worst one in the product.
- [ ] **A8 — Content hardcoded per page.** Ships as 52 drawings that disagree, not one product.
- [ ] **A9 — Marketing claims nobody verified.** A legal problem wearing a copywriting costume.
- [ ] **A10 — "We'll fix the stack later."** Zero cost today, linear cost per page written (R-5).

---

## 5. Sign-off

Algora is **complete** when:

1. Gates **G0, G1, G2, G3, G5, G7, G9, G10, G11** are closed and signed.
2. **G6** is closed, or the shipped subset is explicitly scoped and internally consistent.
3. **G4** is closed (it gates G5 in practice).
4. **G8** is closed or its misses are consciously accepted and recorded.
5. **G12** is closed, or the product is knowingly shipped in static mode with no public leaderboard.
6. All ten **anti-success** states have been checked and are absent.

| Role          | Name | Date | Signature |
| ------------- | ---- | ---- | --------- |
| Engineering   |      |      |           |
| Design        |      |      |           |
| Content       |      |      |           |
| Accessibility |      |      |           |

---

> **The honest summary:** G2 decides whether this project is possible. G7 and G9 decide whether it is responsible to ship. G6 decides whether it looks finished. Do them in the order G2 → G7/G9 → G6, never the reverse — because a beautiful shell around a broken engine is the one outcome from which there is no cheap recovery.
