# Plan — 56 Questions, Browsable as Cards in Explore

> **Scope:** grow the catalog from 40 → **56 questions**, and make them browsable in
> [`/explore`](../src/routes/explore.tsx) as cards — reusing the **existing card design verbatim**.
> **No code is written until this plan is approved.**

---

## 1. Correction to my earlier flag

In [`animated-30-plan.md`](animated-30-plan.md) §8 I told you that growing the catalog past 40 would
break the frozen S0.11 manifest and turn `bun run validate:content` red. **That was wrong, and it
matters because it changes your decision.**

I read the audit ([`first-slice.ts:264-306`](../src/content/first-slice.ts#L264-L306)). It is a
**presence check, not an exact-count check**:

```
for (const slug of FIRST_CONTENT_SLICE_SCOPE.problemSlugs)  // iterates the frozen 40
totalPresent = ...problemSlugs.filter((s) => problemMap.has(s)).length   // capped at 40
counts.problems = cat.problems.length                        // reported, never asserted
```

Adding problems cannot lower `scorePercent`. `counts.problems` is printed by
[`validate-cli.ts:86`](../src/content/validate-cli.ts#L86) as `56/40 coding challenges` and nothing
compares it. **Adding 16 problems keeps the gate green.** No manifest edit required.

There is one real constraint, from a different place — see §5.

---

## 2. What exists today (verified, not assumed)

| Thing                                                        | Reality                                   |
| :----------------------------------------------------------- | :---------------------------------------- |
| Problems in [`problems.ts`](../src/data/problems.ts)         | **40**                                    |
| Algorithms in [`algorithms.ts`](../src/data/algorithms.ts)   | **24**                                    |
| Engine modules in [`registry.ts`](../src/engine/registry.ts) | **12**                                    |
| `/explore` renders                                           | **algorithm** cards (24), `PAGE_SIZE = 9` |
| `/practice` renders                                          | problems as a **`<table>`**, not cards    |

So today there is **no card view of questions anywhere in the app**. `/practice` is a table;
`/explore` is cards but of algorithms. That gap is exactly what this plan closes.

**Current difficulty mix (40):** 15 Easy / 24 Medium / **1 Hard**.

**Algorithms with zero problems:** `selection-sort`, `counting-sort`, `heap-insert`.

---

## 3. The 16 new questions (40 → 56)

Selected so that **every problem in the animated-30 plan exists**. 14 of the 16 are the ones that
plan needs but the catalog lacks; 2 more close genuine high-frequency gaps and require **no new
engine module**.

### 3a. Required by the animated-30 plan (14)

| #   | Question                    | LC#  | Diff | `algorithmSlug`  | Frame            |
| :-- | :-------------------------- | :--- | :--- | :--------------- | :--------------- |
| 41  | Search Insert Position      | 35   | Easy | `binary-search`  | `array`          |
| 42  | Koko Eating Bananas         | 875  | Med  | `binary-search`  | `array`          |
| 43  | Valid Palindrome            | 125  | Easy | `two-pointers`   | `array`          |
| 44  | Move Zeroes                 | 283  | Easy | `two-pointers`   | `array`          |
| 45  | Two Sum II — Sorted Array   | 167  | Med  | `two-pointers`   | `array`          |
| 46  | 3Sum                        | 15   | Med  | `two-pointers`   | `array`          |
| 47  | Diameter of Binary Tree     | 543  | Easy | `bst-traversals` | `tree`           |
| 48  | Binary Tree Right Side View | 199  | Med  | `level-order`    | `tree` + `queue` |
| 49  | Climbing Stairs             | 70   | Easy | `dp-1d` 🆕       | `table` (1×n)    |
| 50  | House Robber                | 198  | Med  | `dp-1d` 🆕       | `table` (1×n)    |
| 51  | Coin Change                 | 322  | Med  | `dp-1d` 🆕       | `table` (1×n)    |
| 52  | Unique Paths                | 62   | Med  | `dp-2d` 🆕       | `table` (m×n)    |
| 53  | Longest Common Subsequence  | 1143 | Med  | `dp-2d` 🆕       | `table` (m×n)    |
| 54  | Edit Distance               | 72   | Med  | `dp-2d` 🆕       | `table` (m×n)    |

### 3b. Two additions that close real gaps (2)

| #   | Question                        | LC# | Diff | `algorithmSlug`  | Why                                                                                          |
| :-- | :------------------------------ | :-- | :--- | :--------------- | :------------------------------------------------------------------------------------------- |
| 55  | Best Time to Buy and Sell Stock | 121 | Easy | `sliding-window` | Top-10 interview frequency, absent from the catalog, animates on a module that already ships |
| 56  | Longest Increasing Subsequence  | 300 | Med  | `dp-1d` 🆕       | The canonical 1-D DP after House Robber; reuses `dp-1d`, adds nothing                        |

**Neither addition introduces a new module.** They ride modules already committed in the animated-30 plan.

### Resulting mix

|             | Easy           | Medium         | Hard         | Total  |
| :---------- | :------------- | :------------- | :----------- | :----- |
| Existing 40 | 15             | 24             | 1            | 40     |
| New 16      | 6              | 10             | 0            | 16     |
| **56**      | **21 (37.5%)** | **34 (60.7%)** | **1 (1.8%)** | **56** |

> ⚠️ **I am flagging this rather than hiding it: 1 Hard out of 56 is thin.** `dsaResearch.md` v3.0
> targets a broader spread. The cause is deliberate — Hard problems have dense state that animates
> badly — but if you want the catalog to read as interview-credible, a second slice needs Hard
> problems even if some of them ship without animation. **Your call, not mine to quietly absorb.**

---

## 4. The blocker nobody has hit yet: DP has no algorithm record

`validateCatalog` enforces `problem.algorithmSlug` as a **foreign key into `algorithms`**
([`schemas.ts:586-593`](../src/content/schemas.ts#L586-L593)):

```
Foreign key violation: algorithmSlug "..." does not exist in algorithms
```

I checked all 24 algorithm slugs. `two-pointers`, `stack-basics`, `level-order`, `bst-traversals`
all exist (they simply lack engine modules). But **there is no DP algorithm at all** — no `dp-1d`,
no `dp-2d`, nothing. The `dp` category exists in the `Category` union and has **zero members**.

**Consequence:** questions 49–54 and 56 cannot be added until `dp-1d` and `dp-2d` are added to
`algorithms.ts`. This is not optional and it is not a nice-to-have — `bun run validate:content`
fails hard without it.

**Side effect, stated up front:** algorithms go 24 → 26, so **`/explore`'s algorithm grid gains 2
cards**, and the `dp` category chip becomes non-empty for the first time. `targetCounts.totalAlgorithms: 24`
in the manifest is _printed only_, never asserted — so this too stays green.

---

## 5. Surfacing 56 questions in Explore — the design decision

`/explore` currently renders `Algorithm`. `Problem` is a different shape, and three fields the
existing card and filter bar depend on **do not exist on `Problem`**:

| Explore needs                        | `Algorithm` | `Problem` | Resolution                                                                                                                                           |
| :----------------------------------- | :---------- | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `category` (filter chips)            | ✅          | ❌        | Derive: `getAlgorithm(problem.algorithmSlug).category` — [`practice.index.tsx:141`](../src/routes/practice.index.tsx#L141) already does exactly this |
| `oneLiner` (card body)               | ✅          | ❌        | Add `oneLiner?: string`, fall back to first sentence of `statementMarkdown`                                                                          |
| `estMinutes` ("Shortest first" sort) | ✅          | ❌        | Add `estMinutes?: number`, fall back to a pure `xp`-derived estimate                                                                                 |
| `masteryPct` (progress bar)          | ✅          | ❌        | `progressStore.problems[slug]` has `{ attempts, solvedAt }` → solved = 100, else 0                                                                   |

### Three options, and my recommendation

|       | Approach                                                              | Verdict                                                                                   |
| :---- | :-------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| **A** | Explore shows **questions only**, replacing the algorithm grid        | ❌ Silently deletes the algorithm browser. Route title is literally "Explore algorithms". |
| **B** | **Add an `Algorithms │ Questions` toggle** to the existing filter bar | ✅ **Recommended**                                                                        |
| **C** | Append a second "Questions" section below the algorithm grid          | ❌ Two paginators on one page; 80 cards deep.                                             |

**Why B respects "don't change UI style/design":** the toggle reuses the _existing_ category-chip
markup verbatim — same `h-11 rounded-xl px-5 font-mono text-[13.5px]`, same active/inactive states
already at [`explore.tsx:384-389`](../src/routes/explore.tsx#L384-L389). **No new visual language,
no new component, no new spacing.** The grid (`lg:grid-cols-2 2xl:grid-cols-3`), the card shell, the
pagination, the empty state — all reused unchanged. It is wiring, per AGENTS.md §1.

The question card is the **same `<article>` with the same class strings** as `AlgoCard`
([`explore.tsx:139-190`](../src/routes/explore.tsx#L139-L190)), with four substitutions:

| Slot        | Algorithm card                        | Question card                                     |
| :---------- | :------------------------------------ | :------------------------------------------------ |
| Thumbnail   | `AlgorithmThumbnail slug={algo.slug}` | `AlgorithmThumbnail slug={problem.algorithmSlug}` |
| Title       | `algo.name`                           | `problem.title`                                   |
| Link target | `/algorithms/$slug`                   | `/practice/$slug`                                 |
| Progress    | `masteryPct`                          | solved → 100, else 0                              |

**56 questions ÷ `PAGE_SIZE = 9` = 7 pages.** The existing `pageNumbers` gap logic
([`explore.tsx:288-298`](../src/routes/explore.tsx#L288-L298)) already handles >5 pages. Nothing to change.

---

## 6. Build order

Each step gated on `bun run verify` + your approval.

| Step  | Work                                                                                                                                                         | Files                                                  | Risk                                                  |
| :---- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------- | :---------------------------------------------------- |
| **0** | **Fix the red lint** — 30 problems (23 errors), mostly Prettier CRLF in `runner.test.ts` + 6 `no-explicit-any`. `verify` is red _today_, before any of this. | `src/lib/runner.test.ts`, `src/hooks/useTestRunner.ts` | None — 17 auto-fixable                                |
| **1** | Add `dp-1d` + `dp-2d` algorithm records (24 → 26)                                                                                                            | `src/data/algorithms.ts`                               | Low                                                   |
| **2** | Add optional `oneLiner` / `estMinutes` to `Problem` + Zod schema                                                                                             | `src/data/types.ts`, `src/content/schemas.ts`          | Low — optional fields, 40 existing entries stay valid |
| **3** | Pure helpers + unit tests (AGENTS.md §5.2 requires tests)                                                                                                    | `src/lib/problem-meta.ts`, `src/lib/recommend.ts`      | Low                                                   |
| **4** | Author the 16 questions — statement, constraints, examples, `starterCode` ×3 langs, tests, hints, xp                                                         | `src/data/problems.ts` (40 → 56)                       | **Medium — this is the bulk of the effort**           |
| **5** | Explore toggle + question card wiring                                                                                                                        | `src/routes/explore.tsx`                               | Low — wiring only                                     |
| **6** | Route tests for explore (**currently zero**)                                                                                                                 | `src/routes/__tests__/`                                | Low                                                   |

**Step 4 is the real cost.** Each question needs `starterCode` in **js, ts, and py** (all three are
schema-required, `min(1)`) plus a non-empty `examples` array and working `tests`. That is 16 × ~45
lines of authored content. It is not a wiring task and I would rather say so now than discover it
at hour three.

---

## 7. Things I will not slip past you

- **`bun run verify` is red right now**, independent of this work — lint fails with 30 problems.
  Step 0 exists so we are not diagnosing new failures against an already-broken baseline.
- **The "Pro / 🔒" badge is fake.** [`explore.tsx:152-158`](../src/routes/explore.tsx#L152-L158)
  shows it whenever `!hasModule(slug)` — it means _"no visualizer built yet"_, not _"paid tier"_.
  Ported naively to questions, **34 of 56 cards** would show a lock. I would fix the semantics
  rather than replicate them; tell me if you disagree.
- **`AlgoCard` reads the progress store during render** ([`explore.tsx:135`](../src/routes/explore.tsx#L135))
  without `useHydrated()`, which AGENTS.md §6 forbids. The question card should use `useHydrated()`
  the way [`practice.index.tsx:54`](../src/routes/practice.index.tsx#L54) already does.
- **The copy at [`explore.tsx:321`](../src/routes/explore.tsx#L321)** reads `{getAlgorithms().length}+
interactive visualizers`. In the questions view it must not claim 56 visualizers — only 12 modules
  exist. Catalog-size copy is audited as a `catalog_size` marketing claim
  ([`marketing-claims.ts:143`](../src/data/marketing-claims.ts#L143)), so this wording goes through
  `MARKETING_CLAIMS`, not a hardcoded string.
- **153 modified + 27 untracked files are still uncommitted.** None of it is on Lovable either.
  That remains the largest operational risk on this repo and it is unrelated to this plan.

---

## 8. Decisions I need from you

1. **Explore layout** — confirm **Option B** (`Algorithms │ Questions` toggle), or say if you meant
   Explore should show questions _instead of_ algorithms.
2. **The Pro/lock badge** — fix the semantics, or replicate as-is on question cards?
3. **Hard problems** — accept 1 Hard out of 56 for this slice, or should I swap 2 of the 16 for Hard
   ones (accepting that they may ship without animation)?
