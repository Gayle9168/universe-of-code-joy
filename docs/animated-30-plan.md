# Plan — 30 Animated Problems (Initial State)

> **Scope:** select 30 problems from [`dsaResearch.md`](dsaResearch.md) v3.0 (227 curated) and give
> each one a step-through animation. This document is the selection + sequencing decision only.
> **No code is written until this plan is approved.**

---

## 1. The constraint that drives every choice

An animation exists only if a `Frame` can represent it. Per [`src/engine/types.ts`](../src/engine/types.ts)
the engine renders exactly five frame kinds:

| Frame kind | Renderer    | What it draws                                               |
| :--------- | :---------- | :---------------------------------------------------------- |
| `array`    | `ArrayView` | values, per-index state, named pointers, ranges, swap pairs |
| `tree`     | `TreeView`  | positioned nodes + edges                                    |
| `graph`    | `GraphView` | directed/weighted nodes + edges, `dist` badges              |
| `grid`     | `GridView`  | r/c cells + path overlay                                    |
| `table`    | `TableView` | row/col labels + cell values — **this is the DP renderer**  |

Plus `AuxPanel`: `stack`, `queue`, `keyvalue`, `log`.

**Consequence:** a problem is animatable when its core state fits one of those five. Linked lists
have no frame kind — but they animate acceptably as `array` with `next`-pointer overlays, which is
how the 5 existing linked-list problems are already modelled. That is a deliberate accepted
compromise, not an oversight, and I flag it rather than hide it.

**Everything below was checked against this table.** Nothing is proposed that the engine cannot draw.

---

## 2. What already exists (verified, not assumed)

- **40 problems** in [`src/data/problems.ts`](../src/data/problems.ts) — all with tests + starter code
- **12 runnable engine modules** in [`src/engine/registry.ts`](../src/engine/registry.ts):
  `binary-search`, `bubble-sort`, `insertion-sort`, `selection-sort`, `merge-sort`, `quicksort`,
  `heap-sort`, `sliding-window`, `bfs`, `dfs`, `dijkstra`, `topological-sort`
- **`Problem.algorithmSlug` already exists** on the type — the seam is half-built

### The gap that blocks everything

Every problem already names an `algorithmSlug`, but **18 of the 40 point at slugs with no engine
module** — `two-pointers`, `linked-list-reversal`, `stack-basics`, `queue-basics`,
`hash-table-chaining`, `bst-traversals`, `bst-insert`, `level-order`, `linear-search`, `union-find`.

And [`practice.$slug.tsx`](../src/routes/practice.$slug.tsx) contains **zero** references to
`getModule`, `VisualStage`, or `Frame`. The practice route has no animation seam at all.

> **So "30 animated problems" is really two jobs:** build the missing modules, _and_ build the
> seam that lets a problem page show one. Task 0 below is not optional — without it, 30 finished
> animations would have nowhere to render.

---

## 3. Selection method

Each of the 227 candidates was scored on four axes:

1. **Engine-representable** — does its state fit a `Frame`? (hard gate — no exceptions)
2. **Pattern coverage** — does it teach a _reusable_ pattern, per Principle 18 "pattern over problem"?
3. **Reuse** — can it share a module with problems already in the catalog?
4. **Interview weight** — Part I.2 frequency alignment

Then applied two rules from the doc itself:

- **Track A only.** All 30 are core. Zero Track B (`Advanced Graphs`, `Math & Geometry`,
  `String Algorithms`) — Part L.3 says cut Track B first, so it should not be in an _initial_ slice.
- **Prerequisite order respected.** Sequenced along the Part J graph, so no problem animates a
  pattern whose prerequisite has not been animated yet.

**Deliberately excluded**, with reasons:

| Excluded                              | Why                                                                                                                                                           |
| :------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Trapping Rain Water (42)              | Already in catalog, but the two-max invariant needs a dual-overlay `array` frame the renderer can't express cleanly. Keep as a coding problem; revisit later. |
| LRU Cache (146), Design Twitter (355) | Design problems. State is two coupled structures — no single frame.                                                                                           |
| Median of Two Sorted Arrays (4)       | Partition-point search across two arrays; needs a split-array frame that does not exist.                                                                      |
| Serialize/Deserialize (297)           | The artifact is a string, not a traversal state.                                                                                                              |
| Regular Expression Matching (10)      | Fits `table`, but transitions are too dense to narrate one step at a time.                                                                                    |
| All Tries problems                    | `tree` frame can draw a trie, but `TreeView` layout assumes binary positioning. Needs layout work first — a later slice.                                      |

---

## 4. The 30 problems

Grouped by build wave. **LC#** cross-references `dsaResearch.md`. **Module** is the engine module
that renders it. ✅ = module exists today; 🔨 = must be built.

### Wave 1 — Reuse existing modules (10 problems, 0 new modules)

These animate on the 12 modules already shipped. Fastest possible proof the seam works.

| #   | Problem                              | LC#  | Diff | Frame                | Module                | Pattern |
| :-- | :----------------------------------- | :--- | :--- | :------------------- | :-------------------- | :------ |
| 1   | Binary Search                        | 704  | Easy | `array`              | `binary-search` ✅    | 5       |
| 2   | Search Insert Position               | 35   | Easy | `array`              | `binary-search` ✅    | 5       |
| 3   | Find Minimum in Rotated Sorted Array | 153  | Med  | `array`              | `binary-search` ✅    | 5       |
| 4   | Search in Rotated Sorted Array       | 33   | Med  | `array`              | `binary-search` ✅    | 5       |
| 5   | Koko Eating Bananas                  | 875  | Med  | `array`              | `binary-search` ✅    | 5       |
| 6   | Longest Substring Without Repeating  | 3    | Med  | `array` + `keyvalue` | `sliding-window` ✅   | 3       |
| 7   | Minimum Size Subarray Sum            | 209  | Med  | `array`              | `sliding-window` ✅   | 3       |
| 8   | Max Consecutive Ones III             | 1004 | Med  | `array`              | `sliding-window` ✅   | 3       |
| 9   | Number of Islands                    | 200  | Med  | `grid`               | `bfs` ✅              | 13      |
| 10  | Course Schedule                      | 207  | Med  | `graph` + `queue`    | `topological-sort` ✅ | 13      |

> All 10 already exist in `problems.ts` with tests. Wave 1 is **pure wiring** — no new content.

### Wave 2 — Two Pointers + Stack (8 problems, 2 new modules)

| #   | Problem                   | LC# | Diff | Frame             | Module            | Pattern |
| :-- | :------------------------ | :-- | :--- | :---------------- | :---------------- | :------ |
| 11  | Valid Palindrome          | 125 | Easy | `array`           | `two-pointers` 🔨 | 2       |
| 12  | Move Zeroes               | 283 | Easy | `array`           | `two-pointers` 🔨 | 2       |
| 13  | Two Sum II                | 167 | Med  | `array`           | `two-pointers` 🔨 | 2       |
| 14  | Container With Most Water | 11  | Med  | `array`           | `two-pointers` 🔨 | 2       |
| 15  | 3Sum                      | 15  | Med  | `array`           | `two-pointers` 🔨 | 2       |
| 16  | Valid Parentheses         | 20  | Easy | `array` + `stack` | `stack-basics` 🔨 | 4       |
| 17  | Daily Temperatures        | 739 | Med  | `array` + `stack` | `stack-basics` 🔨 | 4       |
| 18  | Evaluate RPN              | 150 | Med  | `array` + `stack` | `stack-basics` 🔨 | 4       |

**Why these two modules first:** `two-pointers` unblocks 3 catalog problems, `stack-basics`
unblocks 3 more. Highest unblock-per-module ratio in the whole set.

### Wave 3 — Trees (6 problems, 2 new modules)

| #   | Problem                           | LC# | Diff | Frame               | Module              | Pattern |
| :-- | :-------------------------------- | :-- | :--- | :------------------ | :------------------ | :------ |
| 19  | Invert Binary Tree                | 226 | Easy | `tree`              | `tree-traversal` 🔨 | 7       |
| 20  | Maximum Depth of Binary Tree      | 104 | Easy | `tree`              | `tree-traversal` 🔨 | 7       |
| 21  | Diameter of Binary Tree           | 543 | Easy | `tree`              | `tree-traversal` 🔨 | 7       |
| 22  | Binary Tree Level Order Traversal | 102 | Med  | `tree` + `queue`    | `level-order` 🔨    | 7       |
| 23  | Binary Tree Right Side View       | 199 | Med  | `tree` + `queue`    | `level-order` 🔨    | 7       |
| 24  | Validate Binary Search Tree       | 98  | Med  | `tree` + `keyvalue` | `tree-traversal` 🔨 | 7       |

Trees are the **highest-frequency category** (22 problems, ~15% of interviews) and the `tree`
frame + `TreeView` + `layout.ts` already exist. Strong return per unit of work.

### Wave 4 — Dynamic Programming (6 problems, 2 new modules)

The payoff wave. Every one renders the **5-Slot Template** (Part F) into a `table` frame — the
DP table _is_ the animation, filled cell by cell.

| #   | Problem                    | LC#  | Diff | Frame         | Module     | Pattern |
| :-- | :------------------------- | :--- | :--- | :------------ | :--------- | :------ |
| 25  | Climbing Stairs            | 70   | Easy | `table` (1×n) | `dp-1d` 🔨 | 15      |
| 26  | House Robber               | 198  | Med  | `table` (1×n) | `dp-1d` 🔨 | 15      |
| 27  | Coin Change                | 322  | Med  | `table` (1×n) | `dp-1d` 🔨 | 15      |
| 28  | Unique Paths               | 62   | Med  | `table` (m×n) | `dp-2d` 🔨 | 16      |
| 29  | Longest Common Subsequence | 1143 | Med  | `table` (m×n) | `dp-2d` 🔨 | 16      |
| 30  | Edit Distance              | 72   | Med  | `table` (m×n) | `dp-2d` 🔨 | 16      |

> **Why DP is last:** Part J puts DP downstream of Binary Search (W1) and Backtracking, and
> `dp-2d` builds on `dp-1d`. It is also where animation adds the _most_ pedagogical value — a
> filling table is far clearer than static code — so it earns the deepest position.

---

## 5. Totals

| Measure                                                   | Count                                                                                     |
| :-------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| Problems animated                                         | **30**                                                                                    |
| Already in `problems.ts` (wiring only)                    | 14                                                                                        |
| New problems to author (statement + tests + starter code) | 16                                                                                        |
| New engine modules                                        | **6** — `two-pointers`, `stack-basics`, `tree-traversal`, `level-order`, `dp-1d`, `dp-2d` |
| Existing modules reused                                   | 4 — `binary-search`, `sliding-window`, `bfs`, `topological-sort`                          |
| Patterns covered                                          | **8 of 19** — 1, 2, 3, 4, 5, 7, 13, 15, 16                                                |
| Track B included                                          | 0 (deliberate)                                                                            |

**Difficulty mix:** 9 Easy / 21 Medium / 0 Hard.
Deliberately no Hard in the initial slice — v3.0 targets ~27% Easy and this sits at 30%, close
enough. Hard problems are where animations break down (dense state, many edge cases); they belong
in a second slice once the seam is proven.

**Frame coverage: all 5 kinds exercised** — `array` (13), `tree` (6), `table` (6), `grid` (1),
`graph` (1). That doubles as an integration test of every renderer.

---

## 6. Build order

**Task 0 — the animation seam (blocking, must ship first).**
Add an optional visualization to the practice page: `getModule(problem.algorithmSlug)` →
`VisualStage`. Requires deciding how a problem seeds module input (fixed preset vs. derived from
the problem's own examples — I recommend preset, simplest and deterministic). Until this exists,
no animation is reachable by a user. **Nothing else starts until this is done.**

Then, one wave at a time, each gated on `bun run verify` + your approval:

| Wave  | Content                  | New modules | Risk                                             |
| :---- | :----------------------- | :---------- | :----------------------------------------------- |
| **1** | 10 problems, wiring only | 0           | Low — proves the seam end-to-end                 |
| **2** | 8 problems               | 2           | Low — `array` + `stack` are well-understood      |
| **3** | 6 problems               | 2           | Medium — `TreeView` layout for arbitrary shapes  |
| **4** | 6 problems               | 2           | Medium — `table` is the least-exercised renderer |

Wave 1 deliberately ships zero new content so the seam is validated against known-good modules
before any new engine code is trusted.

---

## 7. Decisions I need from you

1. **Input seeding** — should each animated problem run a fixed preset, or derive its input from
   the problem's own `examples[0]`? (I recommend **preset**: deterministic, and `examples` are
   prose strings that would need parsing.)
2. **Non-animated problems** — the other 10 of the current 40 stay code-only. Should the practice
   page hide the viz panel entirely for them, or show an explicit "no visualization yet" state?
3. **`estMinutes` / XP** — new problems need both. Reuse the existing catalog's ranges, or set fresh?

---

## 8. Two things worth flagging

- **This grows the catalog from 40 → 56 problems**, which will break the frozen S0.11 manifest in
  [`src/content/first-slice.ts`](../src/content/first-slice.ts) that currently asserts _exactly_ 40.
  `bun run validate:content` will fail until that manifest is updated deliberately. That is a
  conscious scope change to a frozen gate, and it is your call — not something I should slip in
  silently.
- **`dsaResearch.md` is a content spec, not a build spec.** It assumes YouTube walkthroughs
  (Part L.1: _"no heavy animation needed for each problem"_). This plan does the opposite — it
  animates in-engine. That is a better fit for Algora, but it means the doc's ~725hr effort budget
  does not describe this work.
