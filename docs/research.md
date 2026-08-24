# Algora — Project Research & Architecture Dossier

> **Status:** Research baseline, v1.0
> **Author:** Senior engineering review
> **Scope:** What Algora is, what problem it solves, what must be true for it to work, and the full technical architecture required to ship it.
> **Read this before writing a single component.**

---

## 0. How to read this document

This is not a marketing brief. It is the engineering source of truth that sits _above_ the 9 prompt documents already in this repo. Those documents describe **what each screen looks like**. This document describes **what the product is, why it wins, and how the system must be built so that 52 screens stay consistent and eventually become a real application.**

| Section | Answers                                                       |
| ------- | ------------------------------------------------------------- |
| 1–2     | What exists today; what state the repo is actually in         |
| 3–5     | The problem, the evidence, the solution thesis                |
| 6–7     | Market, competitors, users                                    |
| 8       | Full product surface (all 52 pages, categorised)              |
| 9       | Design system extracted from the specs + contradictions found |
| 10      | Target technical architecture                                 |
| 11      | **The core engine** — the frame model that makes Algora work  |
| 12      | The sandboxed code runner                                     |
| 13      | State management architecture                                 |
| 14      | Gamification mathematics                                      |
| 15      | Domain data model                                             |
| 16      | Routing map                                                   |
| 17      | Testing strategy (how we reach 100+ meaningful tests)         |
| 18      | Performance, accessibility, and quality budgets               |
| 19      | Static → dynamic migration path                               |
| 20      | Risk register                                                 |
| 21      | Phased roadmap with success criteria                          |
| 22      | Open decisions requiring a call                               |

---

## 1. Executive summary

**Algora** is a gamified learning platform where computer-science students master algorithms and data structures by watching them execute — with the **visualization, the source code, and a plain-English explanation locked to the same execution step**.

Tagline: _"See the algorithm think."_

The wedge is not "another LeetCode" and not "another visualizer." It is the **synchronisation**. Every existing tool gives you one of three artefacts — a picture, some code, or an explanation — and leaves the student to weld them together in their head. That welding _is_ the hard part of learning algorithms, and it is exactly what Algora does for them.

Everything else in the product (paths, XP, streaks, leagues, spaced repetition, roadmaps) exists to solve the _second_ problem: students who understand an algorithm on Tuesday cannot recall it in an interview in March. Comprehension is the visualizer's job. Retention is gamification's job. Both are required; neither alone is a product.

**Current reality check:** the repo contains a complete design specification and an empty application. There is no engine, no runner, no router, no content model, no tests. This document defines what to build.

---

## 2. Current repository state (audited)

2.1

### 2.2 The specification documents

| File                     | Section     | Pages | Aspect      | Notes                                                                                                |
| ------------------------ | ----------- | ----- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `marketing-remaining.md` | 1 (partial) | 7–8   | 9:20 tall   | Blog, Campus. Pages 1–6 specified elsewhere/already done                                             |
| `authentication.md`      | 2           | 9–13  | 16:9 / 9:16 | Sign up, Log in, Forgot, Reset, Verify                                                               |
| `onboarding.md`          | 3           | 14–16 | 16:9        | Goals → Assessment → Path result                                                                     |
| `learning-product.md`    | 4           | 17–25 | 16:9        | **Core app.** Dashboard, Explore, Visualizer, Lesson, Practice, Results, Path detail, Review, Search |
| `gamification.md`        | 5           | 26–30 | 16:9        | Mastery map, Quests, Leaderboard, Achievements, Streak                                               |
| `account.md`             | 6           | 31–35 | 16:9        | Profile, Analytics, Settings, Billing, Notifications                                                 |
| `supporting-pages.md`    | 7           | 36–40 | mixed       | Help centre, Help article, Status, Privacy, Terms                                                    |
| `roadmap-builder.md`     | 8           | 41–43 | 16:9        | Roadmap setup, Generated roadmap, Daily workspace                                                    |
| `admin.md`               | Admin       | A1–A9 | 16:9        | Login, Dashboard, Students, Detail, Content, Billing, Analytics, Settings, Profile                   |
| `architecture.md`        | —           | —     | —           | Mermaid page graph + page directory                                                                  |

**Total: 43 product pages + 9 admin pages = 52 screens.**

### 2.3 Stack delta — the repo is not the target stack

| Concern    | Repo today                    | Your stated target                                | Delta                                |
| ---------- | ----------------------------- | ------------------------------------------------- | ------------------------------------ |
| Framework  | Next.js 16.2.6 (App Router)   | React 19 + TanStack Start                         | **Replace**                          |
| Bundler    | Next/Turbopack                | Vite                                              | **Replace**                          |
| Routing    | Next file routes              | TanStack Router file-based                        | **Replace**                          |
| Tailwind   | v4 via `@tailwindcss/postcss` | v4 via `@tailwindcss/vite`                        | **Swap plugin**                      |
| Tokens     | `globals.css`                 | `src/styles.css` `@theme inline`, no config file  | Align (both are v4 CSS-first — good) |
| Primitives | `@base-ui/react`              | Radix UI + shadcn wrappers                        | **Replace**                          |
| State      | none                          | Zustand 5 + persist, Context player-store factory | **Add**                              |
| Execution  | none                          | Web Worker + TS strip + 3s timeout                | **Add**                              |
| Tests      | none                          | Vitest, 100+ tests                                | **Add**                              |

This is a **greenfield rebuild**, not a migration — there is no application logic to preserve. That is good news: the cost of switching is near zero _today_ and rises with every page you write. See **Decision D-1 (§22)**.

---

## 3. The problem

### 3.1 The stated problem

CS students are asked to learn ~60 algorithms and ~20 data structures, then reproduce them under time pressure in exams and interviews. Most fail not from lack of effort but from three specific, addressable failures.

### 3.2 Failure 1 — The translation gap (comprehension)

An algorithm exists in three representations:

1. **Behaviour over time** — what actually happens, step by step
2. **Code** — the symbolic encoding
3. **Intuition** — why it works, in words

Learning happens when a student can move fluidly between all three. Existing tools present them in **isolation and out of sync**:

- A textbook diagram is a _static snapshot_ of one moment. The student must animate 11 steps mentally.
- A lecture explains the idea but the code is on a different slide.
- A video is synchronised but **not interactive** — you cannot pause on step 4, change the input, and ask "what if?"
- A visualizer animates but hides the code, so the student never binds `while queue:` to _"the frontier is not yet empty."_

The student ends up doing **manual mental synchronisation** — the single most cognitively expensive operation in the whole task — with no support. This is the gap Algora closes structurally.

### 3.3 Failure 2 — The retention gap

Even with perfect comprehension, algorithm knowledge decays fast because it is:

- **Procedural, not factual** — knowing _about_ Dijkstra is not being able to write it
- **Interference-prone** — BFS/DFS, quicksort/mergesort, Prim/Kruskal blur together
- **Recall-critical at an unpredictable future date** — the interview is 4 months away

Passive re-reading is the default student strategy and is close to worthless for procedural recall. The intervention that works is **spaced retrieval practice**. Hence page 24 (Review queue) is not a nice-to-have; it is a load-bearing part of the value proposition.

### 3.4 Failure 3 — The consistency gap

Algorithms take months to internalise. Motivation does not survive months without structure. Students:

- do not know **what to study next** → decision fatigue → they study nothing
- cannot see progress → no reinforcement → attrition
- have no schedule tied to a real deadline ("my interviews are in 90 days")

This is why the product has Paths (23), Roadmap Builder (41–43), Streaks (30), Quests (27), and Leagues (28). Each is a specific answer to a specific dropout mechanism, not decoration.

### 3.5 Problem statement (canonical)

> CS students must convert 60+ algorithms from symbols into durable procedural skill under a deadline. Today they do the hardest cognitive work — synchronising behaviour, code, and intuition — unaided; they revise by re-reading, which does not build recall; and they navigate an unstructured curriculum alone, so most quit before mastery.

---

## 4. The solution thesis

Algora attacks all three failures with three mechanisms. Each mechanism maps to specific pages and specific engineering.

### 4.1 Mechanism 1 — The synchronised tri-pane (comprehension)

**One execution timeline drives three views.** Scrub to step 4 and simultaneously:

- the **canvas** shows node 1 as `Current`, nodes 2 & 4 as `Visited`, queue `[2,3,4]`
- the **code pane** highlights **line 7**
- the **explanation pane** describes _this dequeue_, with the key term in teal

Because all three read from the same frame, they **cannot drift**. The student stops translating and starts _observing the correspondence_. This is the product.

- **Pages:** 19 (flagship), embedded in 20, 15, 42–43
- **Engineering:** §11 frame model — the single most important design decision in the codebase
- **Non-negotiable:** if the panes can ever disagree, the product's core claim is false. This must be enforced by type system + tests, not by discipline.

### 4.2 Mechanism 2 — Active production, then spaced retrieval (retention)

Watching is not learning. The loop must close with the student _producing_:

- **Quick check** (page 20) — immediate low-stakes retrieval inside the lesson
- **Practice challenge** (21) — write real code, run real tests, in a **light-theme** editor
- **Results** (22) — complexity feedback vs brute force, not just pass/fail
- **Review queue** (24) — spaced repetition schedules the *re-*retrieval

- **Engineering:** §12 runner, §14.5 scheduler

### 4.3 Mechanism 3 — Structured progression with visible momentum (consistency)

- **Onboarding assessment (15)** calibrates the entry point — no "start at arrays" for an advanced student
- **Paths (23)** and **Roadmap Builder (41–43)** answer "what do I do today?" with a literal day-by-day plan tied to a real deadline
- **Mastery map (26)** makes 60 skills legible as a graph, converting a vague blob into a bounded, shrinking set
- **Streaks (30) / Quests (27) / Leagues (28)** supply short-horizon reinforcement for a long-horizon goal
- **Analytics (32)** surfaces weak spots so effort is spent where it pays

### 4.4 Why the combination is defensible

Any competitor can build one pane. The moat is the **content-engineering cost**: every algorithm needs an instrumented, deterministic, frame-emitting implementation _plus_ per-step prose _plus_ a visual layout _plus_ code in multiple languages, all kept in lockstep. 60 algorithms × 4 artefacts is a real content pipeline. Whoever builds the pipeline well wins; whoever hand-authors 60 special cases drowns. **§11 is therefore the moat, not the feature list.**

---

## 5. Product principles (derived from the specs — treat as constraints)

The prompt docs encode strong opinions. Extracted and made explicit:

1. **Light theme only.** Never dark. _Including the code editor_ — pages 21 and 43 explicitly forbid a dark IDE panel. This is a deliberate brand differentiator against every dev tool on earth.
2. **One accent colour.** Teal, and only for: primary actions, active/selected state, focus rings, progress, XP/streak, links, logo glyph. Colour carries _meaning_, so it must stay scarce.
3. **Calm over loud.** Celebration is "subtle teal flecks at most." No confetti cannon, no mascots, no emoji, no glows, no blobs, no gradients, no purple.
4. **Mono is semantic.** JetBrains Mono is reserved for code, numbers, stats, timers, day counts, ranks, and field labels. Instrument Sans for everything else. A number in a sans font is a bug.
5. **Depth from borders, not shadows.** 1px hairlines and whitespace do the work.
6. **Reduced-motion is first-class.** Four separate specs say "Reduced-motion friendly." An animation-driven product _must_ have a correct no-animation mode (§18.2).
7. **Real copy, never lorem.** The specs demand realistic legible copy — which means content must be authored and centralised (§9.4), not improvised per page.

---

## 6. Market & competitive landscape

| Player                | Category                | Strength                            | Structural gap Algora exploits                                                        |
| --------------------- | ----------------------- | ----------------------------------- | ------------------------------------------------------------------------------------- |
| **LeetCode**          | Problem bank            | Volume, interview credibility       | No teaching. Assumes you already know the algorithm. Zero visualization.              |
| **VisuAlgo**          | Academic visualizer     | Genuine algorithm depth             | Dated UX, no code sync, no accounts/progress, no retention loop                       |
| **NeetCode**          | Curated roadmap + video | Excellent curation                  | Video is passive and non-interactive; you cannot scrub _state_                        |
| **AlgoExpert**        | Video + curated set     | Polished explanations               | Passive; no spaced repetition; expensive                                              |
| **Duolingo**          | Gamified language       | Best-in-class retention engineering | Wrong domain — but the mechanic playbook Algora borrows (streaks, leagues, quests)    |
| **Brilliant**         | Interactive STEM        | Great interactive pedagogy          | Shallow on DS&A specifically; not interview-oriented                                  |
| **Coursera / MOOCs**  | Formal courses          | Credentials                         | Very high dropout, passive video, no practice loop                                    |
| **University course** | Institutional           | Rigour, credit                      | One pass at fixed pace; no revision system; the student who falls behind stays behind |

### 6.1 Positioning statement

> For CS students preparing for interviews or coursework, Algora is the only platform where the visualization, the code, and the explanation move together — and where a spaced-repetition system makes sure what you understood in October is still there in March.

**Category:** interactive algorithm mastery. Adjacent to problem banks (LeetCode) and visualizers (VisuAlgo); overlapping neither.

### 6.2 Competitive risk

The specs claim `120k+ students`, `480 lessons`, `60+ visualizers`, `4.9★`, `Used in 60+ courses`, `25k+ campus students`, `40k+ newsletter`. **These are design placeholders, not facts.** They must live in one content file flagged as unverified marketing claims (§9.4) and must be replaced with real numbers before any public launch. Shipping fabricated social proof is a legal and trust liability.

---

## 7. Users

### 7.1 Primary persona — "Arjun, the interview candidate"

The specs name him: Arjun R., `arjun@stanford.edu`, Level 12, 23-day streak, Intermediate, ~4h/week, goal _Interview Prep Fast-Track_.

- **Job:** pass DS&A interviews in ~90 days
- **Pain:** knows _of_ most algorithms, cannot produce them under pressure; doesn't know what to study today
- **Success:** solves a Medium unaided; explains complexity out loud
- **Key pages:** 17, 19, 21, 24, 41–43
- **Churn trigger:** breaks a streak, feels behind, quits. → mitigations: streak freezes, "you're on track," roadmap re-planning

### 7.2 Secondary — "Maya, the coursework student"

- **Job:** survive CS2 / midterms
- **Pain:** lecture moved on before the concept landed
- **Success:** finishes the assignment; passes the exam
- **Key pages:** 18, 19, 20, 26
- **Note:** her calendar is set by a syllabus, not a job hunt — Paths must map to coursework, not only interviews

### 7.3 Tertiary — "Dr. Elena Voss, the educator"

- **Job:** raise class outcomes, reduce repetitive office hours
- **Needs:** cohort dashboards, syllabus-aligned paths, roster invites, SSO
- **Key pages:** 8 (Campus), instructor cohort view
- **Note:** this is the B2B2C revenue wedge and the cheapest distribution channel — one lecturer delivers 128 students at once (spec: `CS 2110 · 128 students enrolled`)

### 7.4 Internal — Support / Content / Ops staff

- **Needs:** find a student, see their real progress and sessions, fix billing, publish content, watch funnels
- **Key pages:** A1–A9
- **Note:** A4 (Student detail) shows device sessions and billing → **PII surface**. Requires RBAC and an audit log from day one (A9 specifies "logged action history" — honour it).

---

## 8. Product surface — all 52 screens

### 8.1 Section 1 · Marketing (8) — public, tall-scroll

1 Home · 2 Visualizer (public demo) · 3 Learning Paths · 4 Pricing · 5 About · 6 Contact · 7 Blog · 8 Campus/Universities

**Engineering note:** page 2 is a _public, unauthenticated instance of the real engine_. It is the single highest-leverage conversion asset in the product — the visitor experiences the core value before signing up. Do not stub it with a video.

### 8.2 Section 2 · Authentication (5)

9 Sign up · 10 Log in · 11 Forgot password · 12 Reset password · 13 Email verification (6-digit code)

Providers per spec: Google, GitHub, email+password. Copy commits to "encrypted sessions," 30-minute reset expiry, and a resend countdown (`00:42`).

### 8.3 Section 3 · Onboarding (3)

14 Learning goals · 15 Skill assessment (8 questions) · 16 Personalized path result

Shared 3-step stepper `1 Goals · 2 Assessment · 3 Your path`, skippable. Q4-of-8 in the spec embeds a **live visualizer sub-card** → the engine is needed during onboarding, before first login completes.

### 8.4 Section 4 · Learning product (9) — the core

17 Student dashboard · 18 Explore algorithms · **19 Algorithm visualizer (flagship)** · 20 Lesson experience · 21 Practice challenge · 22 Challenge results · 23 Learning-path detail · 24 Review queue · 25 Search/results

### 8.5 Section 5 · Gamification (5)

26 Mastery map (skill graph, 60 skills, 18 mastered) · 27 Quests (daily/weekly/special) · 28 Leaderboard/leagues · 29 Achievements + rewards shop · 30 Streak calendar (52-week heatmap)

### 8.6 Section 6 · Account (5)

31 Public profile · 32 Personal analytics · 33 Settings (2FA, sessions) · 34 Subscription & billing · 35 Notifications

### 8.7 Section 7 · Supporting (5)

36 Help centre · 37 Help article · 38 Platform status · 39 Privacy policy · 40 Terms of service

### 8.8 Section 8 · Roadmap builder (3)

41 Setup (goal × duration × daily commitment × level) · 42 Generated roadmap (4 phases over 90 days) · 43 Daily study workspace

### 8.9 Admin (9)

A1 Login · A2 Dashboard · A3 Students · A4 Student detail · A5 Content management · A6 Subscriptions & billing · A7 Analytics · A8 Settings/RBAC · A9 Profile & security

### 8.10 Shell taxonomy — 4 shells, not 52 layouts

The single most important structural insight for building 52 pages consistently:

| Shell            | Pages        | Chrome                                                                             |
| ---------------- | ------------ | ---------------------------------------------------------------------------------- |
| `MarketingShell` | 1–8, 36–40   | Sticky top nav (`Learn · Visualizer · Paths · Compete · Pricing`), 4-column footer |
| `AuthShell`      | 9–13         | Thin wordmark bar, centred card or split brand panel, mono footer line             |
| `AppShell`       | 14–35, 41–43 | 240px left sidebar + 64px top bar (search, streak, XP, bell, avatar)               |
| `AdminShell`     | A2–A9        | Admin sidebar + top bar; A1 standalone                                             |

Build 4 shells + ~40 primitives. Then each page is composition, not construction. **Any page that hand-rolls its own sidebar is a defect.**

---

## 9. Design system (extracted from the specs)

### 9.1 Colour tokens

| Token     | Hex       | Use                                                    |
| --------- | --------- | ------------------------------------------------------ |
| `paper`   | `#F7F9F8` | App/page background (warm off-white)                   |
| `card`    | `#FFFFFF` | Elevated surfaces                                      |
| `ink`     | `#0E1513` | Headings, primary text                                 |
| `slate`   | `#5B6763` | Secondary text, labels, captions                       |
| `teal`    | `#0E9C86` | **The** accent — primary actions, active, progress, XP |
| `teal-hi` | `#14B8A6` | Highlight/hover step of the accent                     |
| `wash`    | `#E7F5F1` | Pale-teal selected chips, tint strips, callouts        |
| `border`  | `#E4E9E7` | 1px hairlines ⚠️ see §9.3                              |
| `empty`   | `#EEF2F0` | Heatmap empty day, disabled/locked fills               |

Heatmap (page 30) needs **graduated teal tints** pale→strong plus `empty`. Budget 4 intensity steps + empty = 5 values.

### 9.2 Typography, shape, motion

- **Instrument Sans** — headings, UI, body. Large, tight, geometric.
- **JetBrains Mono** — code, all numbers, stats, ranks, timers, day counts, badges, field labels.
- Radius: cards **12–16px**, buttons/inputs **8–10px**.
- Body ≥ 14px; `leading-relaxed` for reading columns (page 20, 37, 39, 40).
- Focus ring: pale-teal, ~8px spread on inputs. WCAG-AA contrast minimum.
- Shadows: at most one very soft low-opacity token. Contrast comes from borders.

### 9.3 ⚠️ Contradictions found in the specs — resolve before building

These are real defects that will produce visibly inconsistent pages if not settled now.

| #   | Conflict                                                                                                                                                     | Where                               | Recommended resolution                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C-1 | Border `#E4E9E7` vs `#E6EBE9`                                                                                                                                | 8 docs vs `roadmap-builder.md`      | Adopt **`#E4E9E7`** (majority). Single token, no exceptions.                                                                                           |
| C-2 | Sidebar nav differs: `Dashboard, Explore, My Path, Practice, Review, Compete, Achievements` vs `Dashboard, Explore, Roadmap, Practice, Mastery, Leaderboard` | §4/5/6 docs vs `roadmap-builder.md` | Define **one** canonical nav in code. Proposal: `Dashboard, Explore, My Path, Roadmap, Practice, Review, Compete, Achievements` — one array, one file. |
| C-3 | Roadmap doc omits the wash token from other docs and adds `#E7F5F1`                                                                                          | cross-doc                           | Merge: `wash = #E7F5F1` everywhere; it _is_ the "pale-teal tint" the other docs describe in prose.                                                     |
| C-4 | Mastery lives under "My Path" (§5) but is its own nav item (§8)                                                                                              | cross-doc                           | Follow C-2 canonical nav; mastery map = child of My Path, with its own route.                                                                          |
| C-5 | Emoji `🔥` appears in a quest count (`"23 🔥"`) while every doc bans emoji                                                                                   | `gamification.md`                   | Ban holds — use the teal flame **icon**.                                                                                                               |
| C-6 | Aspect ratios differ (9:20 marketing, 16:9 app, 9:16 forgot-password)                                                                                        | cross-doc                           | Irrelevant to responsive code. Treat as _image-gen_ metadata only; build responsive.                                                                   |

### 9.4 Content must be centralised

The specs are prompts full of hard-coded strings and numbers (`2,150 XP`, `Lvl 12`, `Step 4 / 11`, `beats 88%`, `120k+ students`). If these are typed into 52 page files:

- the same student is Level 12 on one page and Level 9 on another
- changing the XP curve means editing 52 files
- unverified marketing claims get scattered and un-auditable

**Requirement:** all display copy and demo data lives in `src/content/` as typed modules — `nav.ts`, `demo-learner.ts`, `algorithms/*.ts`, `marketing-claims.ts` (flagged `UNVERIFIED`), `legal/*.mdx`. Pages import; pages never invent. This is what makes 52 static pages _one_ product instead of 52 drawings.

---

## 10. Target technical architecture

### 10.1 Stack

| Layer         | Choice                                                        | Rationale                                                                                    |
| ------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| UI            | **React 19**                                                  | Concurrent rendering; `useSyncExternalStore` for the frame player                            |
| Framework     | **TanStack Start** (`@tanstack/react-start`)                  | Full-stack React on Vite; type-safe server functions when the static phase ends              |
| Bundler       | **Vite**                                                      | Fast HMR; Web Worker support is first-class (`new Worker(new URL(...), {type:'module'})`)    |
| Routing       | **TanStack Router** file-based                                | End-to-end typed routes/params/search; typed search params matter for the visualizer (§16.3) |
| Styling       | **Tailwind CSS v4** via `@tailwindcss/vite`                   | CSS-first config; tokens in `@theme inline` in `src/styles.css`; **no `tailwind.config.ts`** |
| Primitives    | **Radix UI** + local Tailwind-token wrappers (shadcn pattern) | Accessibility (focus, ARIA, dismiss) solved; we own the styling                              |
| Learner state | **Zustand 5** + `persist`                                     | Small, no provider needed, swappable storage adapter → clean static→server path (§19)        |
| Player state  | **Context factory** `createPlayerStore()`                     | Per-instance isolation for side-by-side comparison mode (§13.2)                              |
| Execution     | **Web Worker** + TS strip + 3s hard timeout                   | Untrusted student code must never touch the main thread (§12)                                |
| Icons         | Lucide (line, 20/24px, consistent stroke)                     | Matches "small teal line icon" spec language                                                 |
| Tests         | **Vitest** (+ jsdom / Testing Library)                        | Runs the pure engine and the store directly; 100+ tests (§17)                                |

⚠️ Pin exact versions at install time — verify `@tanstack/react-start`, `@tanstack/react-router`, and Vite majors against current releases rather than trusting this doc.

### 10.2 Directory structure

```
src/
├── routes/                      # TanStack Router file-based routes (§16)
├── components/
│   ├── ui/                      # Radix + Tailwind primitives (Button, Card, Pill…)
│   ├── shell/                   # MarketingShell, AuthShell, AppShell, AdminShell
│   ├── player/                  # Canvas, CodePane, ExplainPane, PlaybackBar, Timeline
│   ├── viz/                     # GraphViz, ArrayViz, TreeViz, GridViz, TableViz
│   ├── gamification/            # XPBar, StreakFlame, Heatmap, BadgeCard, LeagueRow
│   └── editor/                  # LightCodeEditor (light theme, always)
├── engine/                      # ★ THE CORE — pure, zero React, zero DOM
│   ├── types.ts                 # Frame, VisualState, AlgorithmModule
│   ├── registry.ts              # id → AlgorithmModule
│   ├── run.ts                   # generator → Frame[] (+ caps)
│   └── algorithms/
│       ├── graph/bfs.ts dfs.ts dijkstra.ts …
│       ├── sorting/quicksort.ts merge-sort.ts …
│       ├── searching/binary-search.ts …
│       └── dp/lcs.ts knapsack.ts …
├── lib/
│   ├── runner.ts                # Web Worker orchestration (§12)
│   ├── runner.worker.ts         # the sandbox itself
│   ├── strip-types.ts           # TS → JS
│   ├── xp.ts                    # pure XP/level math (§14)
│   ├── streak.ts                # pure streak math
│   ├── srs.ts                   # pure spaced-repetition scheduler
│   └── utils.ts                 # cn()
├── stores/
│   ├── learner.ts               # Zustand + persist
│   └── player.tsx               # createPlayerStore() + Provider + hooks
├── content/                     # ★ single source of copy & demo data (§9.4)
├── styles.css                   # Tailwind v4 @theme inline tokens
└── test/                        # Vitest setup
```

### 10.3 The one architectural rule

> **`src/engine/` and `src/lib/{xp,streak,srs}.ts` must contain no React, no DOM, and no I/O.**

Everything valuable and everything hard is pure and deterministic. That makes it unit-testable without a browser, portable to a server later (identical XP math client and server — no cheating divergence), and impossible to break by refactoring UI. This single rule is what makes "100+ meaningful tests" achievable rather than aspirational.

---

## 11. ★ The core engine — the frame model

This is the most important section. Get it right and 60 algorithms are a content pipeline. Get it wrong and every algorithm is a bespoke animation and the project fails at scale.

### 11.1 Principle

> An algorithm is not an animation. It is a **deterministic sequence of observable states**. Rendering is a pure function of the current state. Playback is an integer index into that sequence.

Consequences, all of them good:

- The three panes cannot desync — they read the **same frame object**
- Scrubbing, stepping backwards, and replay are free (array indexing)
- Reduced-motion mode is free (render frame N with no transition)
- Comparison mode is free (two frame arrays, two indices)
- The engine is trivially testable (assert invariants over a `Frame[]`)

### 11.2 Types

```ts
// src/engine/types.ts

/** Kinds of visual structures the canvas knows how to draw. */
export type VisualState =
  | { kind: "graph"; nodes: VizNode[]; edges: VizEdge[] }
  | { kind: "array"; cells: VizCell[] }
  | { kind: "tree"; nodes: VizNode[]; edges: VizEdge[] }
  | { kind: "grid"; cells: VizCell[][]; cols: number }
  | { kind: "table"; rows: VizCell[][]; rowLabels: string[]; colLabels: string[] };

/** Semantic status → drives colour. Components never hardcode hex. */
export type VizStatus =
  | "idle" // white / gray
  | "current" // solid teal
  | "visited" // pale teal
  | "frontier" // teal ring
  | "compared" // teal outline
  | "swapped"
  | "final" // teal + check
  | "excluded"; // muted

export interface VizNode {
  id: string;
  label: string;
  status: VizStatus;
  x: number;
  y: number;
}
export interface VizEdge {
  from: string;
  to: string;
  status: VizStatus;
  weight?: number;
}
export interface VizCell {
  id: string;
  value: number | string | null;
  status: VizStatus;
}

/** A named auxiliary structure shown as a callout: queue, stack, dist[], visited. */
export interface AuxView {
  label: string;
  kind: "queue" | "stack" | "set" | "map" | "scalar";
  display: string;
}

/** ONE frame = one fully-determined moment of execution. */
export interface Frame {
  /** 0-based, strictly increasing by 1 across the run. */
  step: number;
  /** 1-based line in the CANONICAL source for this algorithm. Drives the code highlight. */
  line: number;
  /** Plain-English description of THIS step. Drives the explanation pane. */
  explain: string;
  /** Optional term to render in teal inside `explain`. */
  emphasis?: string;
  /** What the canvas draws. */
  state: VisualState;
  /** Auxiliary structures — "queue: [2,3,4]" callouts. */
  aux: AuxView[];
  /** True only on the last frame. */
  terminal: boolean;
}

export interface AlgorithmModule {
  id: string; // 'bfs'
  name: string; // 'Breadth-First Search'
  category: "graphs" | "sorting" | "searching" | "data-structures" | "dp";
  difficulty: "easy" | "medium" | "hard";
  complexity: { time: string; space: string };
  /** Canonical source per language. Frame.line indexes the ACTIVE language's array. */
  source: Record<"python" | "javascript", string[]>;
  /** Deterministic frame generator. MUST be pure. */
  run(input: unknown): Generator<Frame>;
  defaultInput: unknown;
  validateInput(raw: unknown): { ok: true; input: unknown } | { ok: false; error: string };
}
```

### 11.3 Algorithms are generators

```ts
// src/engine/algorithms/graph/bfs.ts  (shape, abridged)
export function* run(input: GraphInput): Generator<Frame> {
  const g = normalise(input)
  const visited = new Set<string>()
  const queue: string[] = [g.start]
  let step = 0

  yield frame(step++, LINE.init, `Start BFS at node ${g.start}. Put it in the queue.`, …)

  while (queue.length > 0) {
    yield frame(step++, LINE.whileLoop, `The queue is not empty, so there is still frontier to explore.`, …)
    const node = queue.shift()!
    visited.add(node)
    yield frame(step++, LINE.dequeue, `Dequeue ${node} and mark it visited.`, { emphasis: 'Dequeue' }, …)
    for (const next of g.adj[node]) {
      if (!visited.has(next) && !queue.includes(next)) {
        queue.push(next)
        yield frame(step++, LINE.enqueue, `${next} is unvisited — add it to the back of the queue.`, …)
      }
    }
  }
  yield frame(step++, LINE.done, `The queue is empty. Every reachable node has been visited.`, { terminal: true }, …)
}
```

`LINE.*` is a named map into the canonical source array, so re-indenting the displayed code cannot silently break highlighting.

### 11.4 Materialisation with safety caps

```ts
// src/engine/run.ts
export const MAX_FRAMES = 2000;

export function materialise(mod: AlgorithmModule, input: unknown): Frame[] {
  const frames: Frame[] = [];
  for (const f of mod.run(input)) {
    frames.push(f);
    if (frames.length > MAX_FRAMES) {
      throw new EngineError(
        `${mod.id} exceeded ${MAX_FRAMES} frames — input too large or non-terminating`,
      );
    }
  }
  return frames;
}
```

The generator is bounded by frame count, not wall time — deterministic and testable. (Wall-time bounding is the _runner's_ job, §12, because that code is untrusted.)

### 11.5 Rendering contract

| Pane         | Reads                             | Must never                             |
| ------------ | --------------------------------- | -------------------------------------- |
| Canvas       | `frame.state`, `frame.aux`        | Compute algorithm logic                |
| Code pane    | `mod.source[lang]`, `frame.line`  | Track its own position                 |
| Explanation  | `frame.explain`, `frame.emphasis` | Store prose per-step outside the frame |
| Playback bar | `frames.length`, `index`          | Own a timer that the panes don't see   |

**Only the player store advances `index`.** One writer, three readers. This is the invariant that makes the product's central claim structurally true.

### 11.6 Content pipeline consequence

To add an algorithm you write **one file** exporting an `AlgorithmModule`, and it automatically works in: the flagship visualizer, the public marketing demo, lesson embeds, the onboarding quiz, comparison mode, and the mastery map. That leverage is the moat described in §4.4.

---

## 12. The sandboxed code runner

Pages 21, 43, and the practice loop execute **untrusted student code**. This is the only genuinely dangerous subsystem.

### 12.1 Threat model

| Threat                                   | Mitigation                                                                                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Infinite loop freezes the tab            | Run in a Worker; **3s hard timeout**; `worker.terminate()` — main thread never blocks                                                         |
| Memory exhaustion                        | Frame/output caps; terminate on timeout; cap serialised result size                                                                           |
| DOM / cookie / storage access            | Workers have no DOM. Additionally delete `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts`, `indexedDB` in the worker scope before eval |
| Exfiltration via network                 | Same as above; long-term add a CSP `connect-src` that excludes worker-originated calls                                                        |
| Prototype pollution leaking between runs | **Fresh worker per submission.** Never reuse a worker across runs                                                                             |
| Malicious output blowing up the UI       | Truncate `console` capture; cap array/string sizes in results                                                                                 |
| Stack overflow / thrown errors           | Catch, normalise, report as a failed test — not a crash                                                                                       |

### 12.2 Contract

```ts
// src/lib/runner.ts
export const RUN_TIMEOUT_MS = 3000;

export interface RunRequest {
  code: string; // student source (TS or JS)
  language: "typescript" | "javascript";
  entry: string; // e.g. 'twoSum'
  cases: Array<{ id: string; args: unknown[]; expected: unknown }>;
}

export type RunResult =
  | { status: "ok"; results: CaseResult[]; durationMs: number; logs: string[] }
  | { status: "timeout"; timeoutMs: number }
  | { status: "error"; kind: "compile" | "runtime"; message: string; line?: number };

export interface CaseResult {
  id: string;
  passed: boolean;
  actual: unknown;
  expected: unknown;
  error?: string;
  durationMs: number;
}
```

### 12.3 Timeout is enforced on the host, not the worker

A busy loop inside the worker never yields, so the worker cannot time itself out. The **main thread** owns the clock:

```ts
export async function run(req: RunRequest): Promise<RunResult> {
  const worker = new Worker(new URL("./runner.worker.ts", import.meta.url), { type: "module" });
  try {
    return await new Promise<RunResult>((resolve) => {
      const timer = setTimeout(() => {
        worker.terminate(); // hard kill
        resolve({ status: "timeout", timeoutMs: RUN_TIMEOUT_MS });
      }, RUN_TIMEOUT_MS);

      worker.onmessage = (e: MessageEvent<RunResult>) => {
        clearTimeout(timer);
        resolve(e.data);
      };
      worker.onerror = (e) => {
        clearTimeout(timer);
        resolve({ status: "error", kind: "runtime", message: e.message });
      };
      worker.postMessage(req);
    });
  } finally {
    worker.terminate(); // always; no reuse
  }
}
```

`terminate()` is the only reliable way to stop a runaway loop in JS. This is why the worker is disposable.

### 12.4 TypeScript stripping — pick deliberately

The stated design is "browser-native with TypeScript stripping." Options, honestly assessed:

| Approach                                         | Pros                                      | Cons                                                                                                                                                                    | Verdict                          |
| ------------------------------------------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Regex/hand-rolled stripper                       | Zero bytes                                | **Fragile.** Generics `Map<string, number[]>`, `as`, arrow return types, overloads, and `<` in comparisons all break it. Silent miscompiles = student blames themselves | Prototype only                   |
| `sucrase`                                        | Fast, small-ish, no WASM                  | Not a type checker (fine — we only strip)                                                                                                                               | ✅ **Recommended**               |
| `esbuild-wasm`                                   | Bulletproof, matches production semantics | ~1MB+ WASM download                                                                                                                                                     | Good if already needed elsewhere |
| Amper/TS 5.8 `erasableSyntaxOnly` + native strip | Cleanest long-term                        | Browser support not universal                                                                                                                                           | Revisit later                    |

**Recommendation:** `sucrase` transform inside the worker, lazily imported so JS-only users never pay for it. Whatever is chosen, `strip-types.ts` needs its own test file covering generics, `as`, `satisfies`, interfaces, enums, parameter properties, and `<` comparisons (§17.4).

### 12.5 Determinism for grading

Freeze the environment inside the worker before executing student code: seed/replace `Math.random`, freeze `Date.now`, and disable timers. Otherwise "42 ms · beats 88%" (page 22) is noise, and re-running the same submission yields different results.

---

## 13. State management architecture

Two fundamentally different kinds of state → two different mechanisms. This is the correct call and worth stating explicitly.

### 13.1 Learner state — one global Zustand store, persisted

Long-lived, cross-page, must survive reload, will eventually be server-owned.

```ts
// src/stores/learner.ts
interface LearnerState {
  profile: { name: string; handle: string; email: string; initials: string };
  xp: { total: number }; // level is DERIVED, never stored
  streak: { current: number; longest: number; lastActiveDay: string; freezes: number };
  progress: Record<string, LessonProgress>; // lessonId → progress
  mastery: Record<string, MasteryState>; // skillId → mastery
  srs: Record<string, SrsCard>; // cardId → schedule
  quests: { daily: QuestState[]; weekly: QuestState[]; resetsAt: string };
  badges: Record<string, { earnedAt: string }>;
  prefs: { language: "python" | "javascript"; reducedMotion: "system" | "on" | "off" };
  onboarding: { goals: Goal[]; commitment: Commitment; level: Level; completed: boolean };

  awardXp(amount: number, source: XpSource): void;
  completeLesson(lessonId: string): void;
  recordActivity(day: string): void;
  gradeCard(cardId: string, grade: SrsGrade): void;
}
```

Rules:

1. **Derive, never duplicate.** `level`, `xpToNext`, `progressPct` are selectors over `xp.total` (§14.1). Storing level guarantees a desync bug.
2. **All mutations go through named actions** that call the pure `lib/` functions. Actions orchestrate; math lives in `lib/`.
3. `persist` with an explicit `version` + `migrate`. Shipping a persisted schema without a migration path strands every early user's localStorage.
4. `partialize` out anything ephemeral.
5. The storage adapter is the **seam** for going server-backed (§19).

### 13.2 Player state — a Context store factory

Playback state is **per-visualizer-instance**, not global. Page 19's comparison mode runs BFS and DFS side by side; a global playhead would couple them into one broken widget. A lesson (page 20) can embed a mini-player _and_ the dashboard can preview one.

```ts
// src/stores/player.tsx
export interface PlayerState {
  frames: Frame[]
  index: number
  playing: boolean
  speed: 0.5 | 1 | 1.5 | 2
  language: 'python' | 'javascript'

  play(): void; pause(): void; toggle(): void
  next(): void; prev(): void
  seek(i: number): void            // clamped to [0, frames.length-1]
  reset(): void
  load(frames: Frame[]): void      // resets index to 0
}

export function createPlayerStore(init: { frames: Frame[]; speed?: number }) { /* createStore<PlayerState> */ }

const PlayerCtx = createContext<PlayerStore | null>(null)
export function PlayerProvider({ frames, children }) {
  const [store] = useState(() => createPlayerStore({ frames }))
  return <PlayerCtx.Provider value={store}>{children}</PlayerCtx.Provider>
}
export function usePlayer<T>(sel: (s: PlayerState) => T): T {
  const store = useContext(PlayerCtx)
  if (!store) throw new Error('usePlayer must be used inside <PlayerProvider>')
  return useStore(store, sel)
}
```

Why a factory rather than a global slice keyed by id: **lifecycle**. Unmount the component, the store is garbage-collected. No key collisions, no manual cleanup, no leaked timers across route changes.

### 13.3 Comparison mode

```tsx
<div className="grid gap-4 md:grid-cols-2">
  <PlayerProvider frames={bfsFrames}>
    <VisualizerPane title="BFS" />
  </PlayerProvider>
  <PlayerProvider frames={dfsFrames}>
    <VisualizerPane title="DFS" />
  </PlayerProvider>
</div>
```

Two isolated stores, zero extra code. For _linked_ scrubbing (optional, valuable pedagogy — same input, watch the orders diverge), add a thin `useLinkedPlayers([a, b])` coordinator above the providers. Keep the linkage outside the stores so the default case stays simple.

### 13.4 Playback loop

Drive playback with `requestAnimationFrame` and an accumulator, not `setInterval`:

- `setInterval` drifts and fires in background tabs
- rAF pauses when hidden, which is the correct behaviour
- Under `prefers-reduced-motion`, do not auto-play: require explicit stepping, and render frames with no transition (§18.2)

---

## 14. Gamification mathematics

All of it pure, in `src/lib/`, and calibrated to the numbers the specs already committed to.

### 14.1 XP and levels

The specs pin two data points: the learner is **Level 12 with 2,150 XP**, and is **250 XP from Level 13** → cumulative XP required for Level 13 is exactly **2,400**.

Proposed curve — quadratic, so early levels come fast and later ones slow:

$$\mathrm{xpForLevel}(L) = 10\,(L-1)^2 + 80\,(L-1)$$

Verification against the specs:

| L   | Cumulative XP | Check                               |
| --- | ------------- | ----------------------------------- |
| 1   | 0             | start                               |
| 2   | 90            | quick first win                     |
| 5   | 480           |                                     |
| 10  | 1,530         |                                     |
| 12  | 2,090         | 2,150 XP ⇒ Level **12** ✅          |
| 13  | **2,400**     | 2,400 − 2,150 = **250 XP to go** ✅ |
| 20  | 5,130         |                                     |

```ts
// src/lib/xp.ts  — pure, no imports
export const xpForLevel = (level: number): number =>
  level <= 1 ? 0 : 10 * (level - 1) ** 2 + 80 * (level - 1);

export function levelFromXp(totalXp: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) level++;
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return {
    level,
    xpIntoLevel: totalXp - floor,
    xpForNext: ceil - floor,
    xpToNext: ceil - totalXp,
    progressPct: Math.round(((totalXp - floor) / (ceil - floor)) * 100),
  };
}
```

**XP award table** (from spec copy — centralise, never inline):

| Source                         | XP           | Spec reference                   |
| ------------------------------ | ------------ | -------------------------------- |
| Lesson complete                | +40          | page 20 `"+40 XP on completion"` |
| Challenge solved               | +80          | pages 21, 22 `"+80 XP"`          |
| Daily quest (each)             | +50          | page 27 `"+50 XP"`               |
| Daily quest set (2 challenges) | +100         | page 17 `"+100 XP"`              |
| Weekly challenge               | +300 + badge | page 27                          |
| Review card                    | small, TBD   | page 24                          |

Weekly XP goal `1,200` (page 16). Rewards shop: Streak Freeze 200 · Theme: Mono 500 · Hint Pack 150 (page 29). Cosmetic caveat: **"Theme: Mono" must not become a dark theme** — the light-only rule is absolute (§5.1).

### 14.2 Streaks

Spec state: current 23, longest 31, freezes 2.

```ts
// src/lib/streak.ts
export function applyActivity(s: Streak, today: string): Streak;
```

Rules to implement and test:

- Same-day repeat activity → **no change** (idempotent; this is a real bug source)
- Exactly +1 day → `current++`, `longest = max(longest, current)`
- Gap of 2 days **and** `freezes > 0` → consume one freeze, preserve `current`
- Gap ≥ 2 with no freeze → `current = 1`
- **Day boundaries are the user's local timezone**, computed from a `YYYY-MM-DD` civil-date string, never a UTC timestamp. A student in IST who studies at 01:00 must not lose their streak.

The 52-week heatmap (page 30) is a derived view over an activity log — store per-day activity counts, not just the streak scalar, or the heatmap cannot be rendered.

### 14.3 Mastery

Page 26: 60 skills — 18 mastered, 6 in progress, 36 locked. States: `locked → available → in-progress (0–99%) → mastered`.

Unlocking is a **DAG over prerequisites** (`Arrays → Hashing → BFS → Dijkstra`; `A*` and `Segment Tree` locked). Requirements:

- The prerequisite graph must be **acyclic** — assert this in a test, or a content edit can silently make a skill permanently unreachable
- Every skill must be reachable from a root
- Mastery % is derived from lesson completion + challenge success + SRS retention, not hand-set

### 14.4 Leagues

Page 28: `Bronze · Silver · Gold · Teal · Diamond`; weekly cycles (`Week 24`); top 10 promote; a demotion zone at the bottom; current user rank 8 with 1,180 weekly XP; "220 XP to reach #6".

Pure functions: `bucketise(players)`, `rank(players)`, `promotionZone(size)`, `demotionZone(size)`, `xpToRank(user, players, targetRank)`. Weekly XP is a **separate accumulator** from lifetime XP — do not derive one from the other.

### 14.5 Spaced repetition (page 24)

Use a well-understood scheduler (SM-2 style or FSRS-lite) rather than inventing one:

```ts
export type SrsGrade = "again" | "hard" | "good" | "easy";
export interface SrsCard {
  id: string;
  ease: number;
  intervalDays: number;
  dueDay: string;
  reps: number;
  lapses: number;
}
export function schedule(card: SrsCard, grade: SrsGrade, today: string): SrsCard;
```

Invariants to test: `again` resets the interval and increments `lapses`; `good`/`easy` strictly increase the interval; ease is clamped to sane bounds; `dueDay` is always ≥ `today`; the function is pure and idempotent for identical inputs.

---

## 15. Domain data model

Static-phase shape (typed content modules) that maps 1:1 onto future database tables — so the migration in §19 is mechanical.

```
Skill        id, name, category, prerequisites[], algorithmIds[]
Algorithm    id, name, category, difficulty, complexity, source{lang}, defaultInput   ← AlgorithmModule
Lesson       id, pathId, moduleId, order, title, durationMin, blocks[], quiz[], xp
Path         id, title, description, level, moduleIds[], lessonCount, estWeeks
Module       id, pathId, order, title, lessonIds[]
Challenge    id, title, difficulty, topics[], statement, examples[], constraints[],
             starterCode{lang}, tests[], hints[], referenceSolution, complexity
Roadmap      id, goal, days, minutesPerDay, level, phases[]
Phase        id, title, dayStart, dayEnd, topicIds[]
DayPlan      day, phaseId, items[] (watch|lesson|practice|review)
Badge        id, name, description, icon, criteria
Quest        id, scope(daily|weekly|special), title, target, reward
SrsCard      id, lessonId|algorithmId, front, back, schedule
Learner      profile, xp, streak, progress, mastery, srs, quests, badges, prefs
ActivityDay  day, xpEarned, lessonsDone, challengesDone   ← powers the heatmap
```

Scale targets from the spec copy: **480 lessons, 60+ algorithms, 60 skills, 60 badges**, one 42-lesson × 6-module flagship path (`Interview Prep Fast-Track`, ~7 weeks, Intermediate), 90-day roadmap over 4 phases.

**Reality check:** 480 hand-authored lessons is a multi-person-year content effort. Phase 1 should ship a _vertical slice_ — one complete path, ~12 algorithms — and the number `480` must live in `marketing-claims.ts` flagged `UNVERIFIED` until it is true.

---

## 16. Routing map (TanStack Router, file-based)

### 16.1 Tree

```
src/routes/
├── __root.tsx
├── _marketing.tsx                      # MarketingShell
│   ├── index.tsx                       # 1  Home
│   ├── visualizer.tsx                  # 2  Public demo (real engine)
│   ├── paths.tsx                       # 3
│   ├── pricing.tsx                     # 4
│   ├── about.tsx                       # 5
│   ├── contact.tsx                     # 6
│   ├── blog/index.tsx  blog.$slug.tsx  # 7
│   ├── campus.tsx                      # 8
│   ├── help/index.tsx  help.$slug.tsx  # 36, 37
│   ├── status.tsx                      # 38
│   ├── privacy.tsx  terms.tsx          # 39, 40
├── _auth.tsx                           # AuthShell
│   ├── signup.tsx  login.tsx           # 9, 10
│   ├── forgot-password.tsx             # 11
│   ├── reset-password.tsx              # 12
│   └── verify-email.tsx                # 13
├── _onboarding.tsx                     # shared 3-step stepper
│   ├── goals.tsx  assessment.tsx  path.tsx     # 14, 15, 16
├── _app.tsx                            # AppShell (sidebar + top bar)
│   ├── dashboard.tsx                   # 17
│   ├── explore/index.tsx               # 18
│   ├── explore.$algorithmId.tsx        # 19  ★ flagship
│   ├── learn.$pathId.index.tsx         # 23
│   ├── learn.$pathId.$lessonId.tsx     # 20
│   ├── practice/index.tsx              # 21 list
│   ├── practice.$challengeId.tsx       # 21
│   ├── practice.$challengeId.results.tsx  # 22
│   ├── review.tsx                      # 24
│   ├── search.tsx                      # 25
│   ├── mastery.tsx                     # 26
│   ├── quests.tsx                      # 27
│   ├── leaderboard.tsx                 # 28
│   ├── achievements.tsx                # 29
│   ├── streak.tsx                      # 30
│   ├── roadmap/index.tsx               # 41 setup
│   ├── roadmap.plan.tsx                # 42
│   ├── roadmap.day.$day.tsx            # 43
│   ├── profile.$handle.tsx             # 31
│   ├── analytics.tsx                   # 32
│   ├── settings.tsx                    # 33
│   ├── billing.tsx                     # 34
│   └── notifications.tsx               # 35
└── admin/
    ├── login.tsx                       # A1 (outside AdminShell)
    ├── _shell.tsx                      # AdminShell
    │   ├── index.tsx                   # A2
    │   ├── students/index.tsx          # A3
    │   ├── students.$studentId.tsx     # A4
    │   ├── content.tsx                 # A5
    │   ├── billing.tsx                 # A6
    │   ├── analytics.tsx               # A7
    │   ├── settings.tsx                # A8
    │   └── profile.tsx                 # A9
```

### 16.2 Why pathless layout routes matter

`_marketing`, `_auth`, `_app`, `_admin` are pathless — they add a shell without adding a URL segment. This is the routing-level enforcement of §8.10: a page **cannot** be built without a shell, because the shell is its parent route. Consistency by construction, not by review.

### 16.3 Typed search params — the visualizer is a URL

Page 19's whole state should be shareable and deep-linkable:

```
/explore/bfs?lang=python&step=4&input=<encoded>&compare=dfs
```

TanStack Router's typed `validateSearch` gives compile-time safety here. This unlocks: an instructor linking students to _exactly_ step 7 of Dijkstra on a specific graph; the marketing page linking into a preloaded demo; bug reports that reproduce. Design this in from day one — retrofitting URL state is painful.

---

## 17. Testing strategy — how 100+ tests become meaningful

The target is not "100 tests." It is **"the invariants that make the product true are machine-checked."** Because the engine and math are pure (§10.3), this is cheap.

### 17.1 Engine invariants — generic, run against _every_ algorithm (~15 × N)

A single parameterised suite over the registry. Add an algorithm, inherit 15 tests free:

```ts
describe.each(registry.all())('engine invariant: %s', (mod) => {
  const frames = materialise(mod, mod.defaultInput)
  it('emits at least two frames', ...)
  it('step numbers are 0..n-1, strictly monotonic', ...)
  it('exactly one terminal frame, and it is last', ...)
  it('every frame.line is within source bounds for every language', ...)
  it('every frame has non-empty explain text', ...)
  it('all source languages have the same line count contract', ...)
  it('every node/cell status is a valid VizStatus', ...)
  it('visual element ids are stable across frames', ...)
  it('is deterministic — two runs deep-equal', ...)
  it('respects MAX_FRAMES on large input', ...)
  it('never mutates the input object', ...)
  it('emphasis, when present, appears inside explain', ...)
  it('aux displays are non-empty strings', ...)
  it('rejects invalid input via validateInput', ...)
  it('exactly one node is `current` per frame (where applicable)', ...)
})
```

### 17.2 Algorithm-specific correctness (~4–6 each)

- **BFS:** visit order is non-decreasing in distance from source; finds shortest unweighted path
- **DFS:** visit order is a valid DFS preorder; explores depth before breadth
- **Dijkstra:** a finalised distance never changes afterwards; matches a reference implementation on random weighted graphs
- **Sorting:** final array is sorted **and is a permutation of the input** (multiset equality — catches the classic "lost an element" bug); stability where claimed
- **Binary search:** finds every present element; correctly reports absence; visits O(log n) frames
- **Union-Find / Heap:** structural invariants hold in every frame

### 17.3 Gamification math (~30)

- `xpForLevel` monotonic; `xpForLevel(13) === 2400`; `levelFromXp(2150).level === 12`; `.xpToNext === 250` ← locks the spec to code
- `levelFromXp` round-trips against `xpForLevel` across 1..100
- Streak: same-day idempotence; +1 increments; freeze consumption; reset; longest never decreases; **timezone boundary cases**
- SRS: `again` resets & increments lapses; intervals strictly grow on success; ease clamped; `dueDay ≥ today`
- Leagues: ranking is a total order; promotion zone is exactly top 10; `xpToRank` arithmetic
- Mastery: prerequisite graph is **acyclic**; every skill reachable; no orphans

### 17.4 Runner (~15)

- Correct solution passes all cases
- Wrong solution fails with `actual` reported
- **Infinite loop resolves as `timeout` in ~3s and the main thread stays responsive** ← the single most important test in the file
- Syntax error → `compile` error with a line number
- Runtime throw → `runtime` error, not a crash
- TS stripping: generics `Map<string, number[]>`, `as`, `satisfies`, interfaces, enums, parameter properties, arrow return types, and `a < b` comparisons all survive
- `console.log` captured and truncated
- Fresh worker per run — no state leaks between submissions
- `Math.random`/`Date.now` are frozen (determinism)

### 17.5 Stores (~20)

- `awardXp` triggers exactly one level-up at a boundary
- Level is never persisted, always derived
- `persist` migration from v1→v2 preserves XP and streak
- Two `PlayerProvider`s have **fully independent** indices ← proves comparison mode
- `seek` clamps at both ends; `next` at the last frame is a no-op
- `load` resets index to 0
- `usePlayer` outside a provider throws a clear error

### 17.6 Components / a11y (~15)

- Playback bar controls have accessible names
- Timeline is keyboard-operable (arrows step, Home/End jump)
- `prefers-reduced-motion` disables autoplay and transitions
- Code pane's highlighted line is announced/associated for screen readers
- Colour is never the sole status carrier — every `VizStatus` also has text/icon/shape

**Total: comfortably 150+ tests, all of which fail loudly when something real breaks.** No snapshot-only tests — they pass while the product is wrong.

---

## 18. Quality budgets

### 18.1 Performance

| Metric                | Budget         | Why                                          |
| --------------------- | -------------- | -------------------------------------------- |
| LCP (marketing)       | < 2.0s         | Acquisition pages must be fast               |
| INP                   | < 200ms        | Scrubbing must feel instant                  |
| Frame render (canvas) | < 16ms         | 60fps stepping                               |
| Frame materialisation | < 50ms typical | Feels instant on load                        |
| `MAX_FRAMES`          | 2,000          | Bounded memory                               |
| Runner timeout        | 3,000ms        | Hard cap                                     |
| Route JS (marketing)  | < 150KB gz     |                                              |
| Editor + TS strip     | lazy-loaded    | JS-only users don't pay for the TS transform |

Canvas strategy: **SVG** up to ~150 elements (accessible, inspectable, styleable by token); switch to Canvas 2D only if a heatmap or large graph measurably drops frames. Do not start with Canvas — you lose accessibility and token-driven styling for a performance problem you may not have.

### 18.2 Accessibility — non-negotiable, and repeatedly promised in the specs

- **WCAG AA** contrast on every token pair. `slate #5B6763` on `paper #F7F9F8` must be verified, not assumed.
- **Reduced motion:** honour `prefers-reduced-motion` — no autoplay, no tweening, instant frame swaps, stepping still fully available. Four specs promise "Reduced-motion friendly"; a broken implementation is a broken promise to the exact users who need it.
- **Colour is never the only signal.** `current`/`visited`/`locked` each need an icon, label, or shape too — otherwise a colour-blind student cannot use the flagship feature.
- **Keyboard:** full playback control; visible pale-teal focus rings (already in the design system).
- **Screen readers:** the explanation pane is the accessible narration of the canvas. Wire it as a live region on step change — this makes the visualizer _usable_, not merely compliant.
- Semantic landmarks (`main`, `nav`, `header`), `sr-only` text, alt text on all meaningful imagery.

### 18.3 Security

- Runner sandbox per §12
- Baseline response headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`, `Permissions-Policy` denying unused features, `X-Frame-Options: SAMEORIGIN` on authenticated surfaces
- CSP starting in report-only, then enforced; `connect-src` must enumerate every real origin before enforcing
- Admin (A1–A9) requires RBAC + audit log; A4 exposes PII and is the highest-risk screen in the product

---

## 19. Static → dynamic migration path

Building 52 static pages first is correct — it de-risks design and produces a demoable product. But it must be built so the backend _slots in_ rather than requiring a rewrite. Three seams:

### Seam 1 — Content

Pages import from `src/content/*` via typed accessors (`getLesson(id)`), never inline literals. Later, the accessor becomes an async server call. Page components barely change.

### Seam 2 — Learner state

Zustand `persist` uses a **pluggable storage adapter**. Static phase: `localStorage`. Dynamic phase: swap the adapter for a server-backed one (or move the store behind server functions). The component API (`useLearner(s => s.xp)`) is unchanged.

### Seam 3 — Auth

Pages 9–13 are built as forms with a typed `authClient` interface that is stubbed in the static phase. Wiring a real provider replaces the stub, not the UI.

### Backend recommendation (when the time comes)

Postgres (Neon) + Drizzle + Better Auth, with server-authoritative gamification. Critically: **XP, streaks, and SRS scheduling must be computed server-side using the same pure functions from `src/lib/`.** Client-authoritative XP is trivially cheatable, and leaderboards (page 28) are worthless if XP can be forged. Sharing one implementation between client and server is exactly why §10.3's purity rule exists.

---

## 20. Risk register

| #    | Risk                                                                                        | Impact      | Likelihood | Mitigation                                                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------- | ----------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| R-1  | **Engine model designed wrong** → every algorithm becomes bespoke; 60 algorithms never ship | Fatal       | Medium     | §11 first. Prove it with 3 _structurally different_ algorithms (graph, sorting, DP table) before building page 19's chrome                   |
| R-2  | **Content volume** — 480 lessons, 60 algorithms is person-years                             | Severe      | High       | Vertical slice first (1 path, 12 algorithms). Mark unverified claims. Invest in the authoring pipeline, and an admin content tool (A5) early |
| R-3  | 52 pages hand-built → visual drift; the C-2 sidebar conflict shipping twice                 | Severe      | **High**   | 4 shells + token-only styling (§8.10, §9.3). Zero hex in components                                                                          |
| R-4  | Runner escape / tab freeze                                                                  | Severe      | Low        | §12; the timeout test is mandatory CI                                                                                                        |
| R-5  | Stack fork done late — 52 Next.js pages then a rewrite                                      | Severe      | Medium     | **Resolve D-1 now**, at zero cost                                                                                                            |
| R-6  | Hand-rolled TS stripper miscompiles valid student code                                      | Moderate    | High       | Use `sucrase`/`esbuild-wasm`; test generics and `<`                                                                                          |
| R-7  | XP curve invented per-page, contradicting the specs' 2,150/2,400                            | Moderate    | Medium     | §14.1 formula + locking tests                                                                                                                |
| R-8  | Reduced-motion mode ships broken                                                            | Moderate    | Medium     | Frame model makes it free (§11.1); test it (§17.6)                                                                                           |
| R-9  | Timezone bug destroys streaks — the highest-emotion data in the product                     | Moderate    | **High**   | Civil-date strings only; explicit timezone tests                                                                                             |
| R-10 | Fabricated stats (`120k+ students`) shipped publicly                                        | Legal/trust | Medium     | `marketing-claims.ts`, flagged, reviewed pre-launch                                                                                          |
| R-11 | Light-only editor rejected by developer taste ("I want dark mode")                          | Moderate    | High       | It is a deliberate brand stance (§5.1). Decide consciously; if dark mode is ever added, it is a _second_ full token set, not a hack          |
| R-12 | Admin PII exposure via A4                                                                   | Severe      | Low        | RBAC + audit log from the first admin commit                                                                                                 |

---

## 21. Roadmap & success criteria

### Phase 0 — Foundation

**Build:** stack decision (D-1) executed; Vite + TanStack Start + Router skeleton; `styles.css` with all §9.1 tokens in `@theme inline`; the 4 shells; ~20 UI primitives; Vitest configured; `content/nav.ts` resolving C-2.
**Done when:** every one of the 4 shells renders with canonical chrome; zero hex literals exist outside `styles.css`; CI runs green.

### Phase 1 — Prove the engine (the real milestone)

**Build:** `engine/types.ts`, `run.ts`, registry; **three structurally different algorithms** (BFS, Quicksort, LCS DP table); Canvas/Code/Explain panes; playback bar; player store factory; page 19 end-to-end; §17.1 generic invariant suite.
**Done when:** you can scrub BFS to step 4 and the canvas, line 7 highlight, and explanation all agree — and adding a 4th algorithm requires **one file and no UI changes**.
**This is the go/no-go gate for the whole project.**

### Phase 2 — The learning loop

**Build:** pages 17, 18, 20, 21, 22, 23, 24; the runner (§12) with full test suite; `lib/xp.ts`, `streak.ts`, `srs.ts`; learner store with persist + migration.
**Done when:** a student can go dashboard → lesson → visualizer → challenge → run code → pass → earn XP → level up → get a review card scheduled, and reload without losing anything.

### Phase 3 — Motivation & identity

**Build:** pages 26–30 (gamification), 31–35 (account), 41–43 (roadmap builder).
**Done when:** the 90-day roadmap generates a coherent day-by-day plan, and page 43 shows today's real tasks from real progress data.

### Phase 4 — Acquisition & support

**Build:** pages 1–8 marketing (page 2 running the **real engine**), 9–16 auth + onboarding (stubbed auth), 25 search, 36–40 supporting.
**Done when:** a cold visitor can experience the synchronised visualizer before signing up, then complete onboarding into a calibrated path.

### Phase 5 — Admin & backend

**Build:** A1–A9 with RBAC + audit log; Postgres + Drizzle + Better Auth; server-authoritative XP/streak/SRS reusing `lib/`; real leaderboards.
**Done when:** XP cannot be forged from the client and the leaderboard is trustworthy.

### 21.1 Success criteria

**Engineering**

- Adding an algorithm = 1 file, 0 UI changes, +15 tests passing automatically
- 150+ tests green; engine and `lib/` at high coverage
- Zero hex literals outside `styles.css`; zero page-local shells
- Runner: infinite loop terminates in ~3s with a responsive UI, every time
- Reduced-motion mode fully functional
- WCAG AA verified on all token pairs

**Product (once instrumented)**

- Onboarding completion → first lesson finished
- D1 / D7 / D30 retention; **streak survival past day 7** (the classic cliff)
- Visualizer engagement: steps scrubbed per session, replays, comparison-mode usage
- Challenge pass rate on 2nd attempt (learning, not luck)
- Review-queue adherence — the leading indicator of real retention
- Interview outcomes reported by users — the only metric that ultimately matters

---

## 22. Open decisions

### D-1 — Stack: fork to TanStack Start now, or stay on Next.js? ⚠️ **BLOCKING**

The repo is Next.js 16 + `@tailwindcss/postcss` + `@base-ui/react`. The stated target is TanStack Start on Vite + `@tailwindcss/vite` + Radix. There is **no application code to migrate**, so the cost of switching is essentially zero _today_ and grows linearly with every page written.
**Recommendation: decide before Phase 0 begins.** Either fork now, or consciously adopt Next.js and update this document. Do not start building pages with this unresolved — that is R-5.

### D-2 — Canonical sidebar navigation (C-2)

Two conflicting navs across the specs. **Recommendation:** `Dashboard, Explore, My Path, Roadmap, Practice, Review, Compete, Achievements`, defined once in `content/nav.ts`.

### D-3 — TS stripping implementation

**Recommendation:** `sucrase`, lazily imported in the worker. Regex stripping will produce silent miscompiles that students blame on themselves.

### D-4 — Canvas rendering: SVG or Canvas 2D

**Recommendation:** SVG first (accessible, token-styled, inspectable); measure; switch only where proven necessary.

### D-5 — Content authoring format

Lessons as MDX with embedded visualizer components, or as typed block arrays? MDX is nicer to author; typed blocks are easier to validate and to render in the admin tool (A5). **Recommendation:** typed blocks with an MDX escape hatch.

### D-6 — Scope of the first content slice

**Recommendation:** one path (`Interview Prep Fast-Track`), 12 algorithms, ~30 lessons, ~40 challenges. Enough to prove the loop; small enough to finish.

### D-7 — "Theme: Mono" reward (page 29)

A purchasable theme in a strictly light-only product. **Recommendation:** a typographic/monochrome _light_ variant. Never a dark theme unless the light-only stance is formally revoked.

---

## 23. Immediate next steps

1. **Resolve D-1.** Nothing else should start first.
2. Resolve C-1…C-6 and write them into `content/nav.ts` + `styles.css` as the single source of truth.
3. Write `src/engine/types.ts` — the `Frame` interface is the product's spine.
4. Implement BFS, Quicksort, and one DP algorithm as `AlgorithmModule`s.
5. Write the §17.1 generic invariant suite and run it against all three.
6. Only then build page 19's UI.

> **If step 5 passes for three structurally different algorithms, Algora is a tractable engineering project. If it doesn't, no amount of pixel-perfect page work will save it.**
