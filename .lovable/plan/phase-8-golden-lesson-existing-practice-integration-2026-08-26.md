# Phase 8 — Golden Lesson ↔ Existing Practice Integration

Audit first, then a small integration layer. No new editor, no runtime changes, no Practice redesign.

## A. Audit findings (verified in code)

**Practice route** `src/routes/practice.$slug.tsx` — single self-contained page:
- Loader `fetchProblem(slug)` → `notFound()` on miss; `notFoundComponent` renders a fallback. No `validateSearch` today.
- Tabs: Description / Hints / Solutions. Staged hints via `hintsShown` counter; Solutions gated in-page.
- Editor: plain `<textarea>` + line-number gutter (no Monaco/CodeMirror). Reset code restores `problem.starterCode[lang]`.
- Drafts: `drafts` state per language, restored from `progressStore.problems[slug].lastCode`, saved on `recordAttempt`.
- Run → sample tests only (`tests.filter(t => !t.hidden)`), no attempt recorded. Submit → all tests, records attempt, on accepted calls `markSolved`, `touchStreak`, `awardXp(solveXp(...))` once for first solve, sets `resultStore.last`, navigates to `/practice/results`. Run/Submit semantics are already correct — leave alone.
- Language selector lists Python, JavaScript, TypeScript and **defaults to Python**.

**Runner** `src/hooks/useTestRunner.ts` + `src/lib/runner.ts`: code runs in a throwaway Web Worker with a 3s timeout; TS is stripped with sucrase. `lang === "py"` returns an immediate failure string — Python never executes.

**Progress** `src/stores/progressStore.ts`: `problems[slug].solvedAt/attempts/lastCode/bestRuntimeMs`, `lessons[...]`, XP, level, streak, bookmarks, activity. This is the single existing source of truth for solved state.

**Mapping**: `Problem.algorithmSlug` already links problems to algorithms; `getProblemsByAlgorithm()` exists. `resolvePracticeSlug()` (src/lib/explore-items.ts) picks the easiest linked problem — used today for both Practice and the Solve chip. There is **no** implementation-vs-transfer distinction yet. `Algorithm` (src/data/types.ts) has no problem field.

**Chosen CODE problem**: slug `binary-search-classic`, title "Classic Binary Search" (src/data/problems.ts:46), `algorithmSlug: "binary-search"`, difficulty easy.

## H. Language execution matrix (from code, not UI)

| Language | Edit | Run | Submit |
| --- | --- | --- | --- |
| JavaScript | yes | yes (Worker) | yes |
| TypeScript | yes | yes (sucrase strip → Worker) | yes |
| Python | yes (starter code + drafts) | no | no |

## I/J. Python findings and recommendation
Runner is a browser Web Worker executing JavaScript only; there is no Python interpreter in the bundle and no server execution path. Selecting Python today lets you type code, then Run/Submit shows a runner error string. Options for later (not implemented now): Pyodide/WASM in a Worker (~10MB download, offline, no server), or a sandboxed server execution service (small bundle, needs infra + abuse controls). **No Python runtime will be added in this phase.** Phase 8 only makes the UI truthful.

## What Phase 8 changes

1. **Content mapping (no scattered slug branches)**
   - Add optional `implementationProblemSlug?: string` to `Algorithm` in `src/data/types.ts`, set `"binary-search-classic"` on the binary-search entry in `src/data/algorithms.ts`, and keep the content-schema test valid.
   - New pure helper `resolveImplementationSlug(algorithmSlug)` in `src/lib/explore-items.ts` (or a small `src/lib/lesson-stages.ts`): returns the mapped slug when it exists and resolves to a real problem, else `null`. UI reads only this helper.

2. **Code stage is real**
   - `LessonStageStrip`: new optional props `codeSlug: string | null` and `codeComplete: boolean`. Code becomes a `Link` to `/practice/$slug` when mapped, stays an inert label when not; renders a check mark when the mapped problem is solved. Solve keeps using `practiceSlug` and must not reuse the implementation slug — when Solve's resolved slug equals the Code slug, prefer the next linked problem so CODE ≠ SOLVE.
   - `src/routes/algorithms.$slug.tsx` computes `codeSlug` via the helper and `codeComplete` from `progressStore.problems[codeSlug]?.solvedAt` behind `useHydrated()`.

3. **Trace → Code CTA**
   - `TraceSummaryCard` gains optional `codeSlug` + one primary CTA "Implement Binary Search →" (generic: "Implement {algoName} →") linking to `/practice/$slug` with `?from=lesson&algorithm=<slug>&stage=code`, plus one line of handoff copy: "You just tracked low, mid and high by hand — now express those transitions in code." "Trace again" becomes the secondary action. CTA hidden when unmapped. Trace completion does **not** mark Code complete.

4. **Practice entry context (lightweight)**
   - Add `validateSearch` to `/practice/$slug` for `from`, `algorithm`, `stage` (all optional, validated against the catalog). When `from === "lesson"` and the algorithm resolves, render one small mono caption line in the existing header row: `Binary Search · Code stage` with a back link to the lesson. No new hero, no layout change. Direct visits render exactly as today.

5. **Accepted → next action**
   - Extend `resultStore.last` with optional `from`/`algorithmSlug` set at submit time; on `/practice/results`, when present, the primary next action becomes "Continue Binary Search lesson →" (back to `/algorithms/$slug`) alongside the existing recommended-next-problem card. Generic results behaviour unchanged.

6. **Python UX truthfulness (no runtime work)**
   - Default the language to JavaScript instead of Python.
   - When Python is selected: Run/Submit disabled with a persistent inline note "Python execution isn't available yet — switch to JavaScript or TypeScript to run tests." Python editing and starter code stay.

## Not touched
Engine, trace engine, prediction, visualizer internals, editor technology, hint/solution content and gating, XP formula, test-case UI, Run/Submit semantics, Practice visual design.

## Tests
New/extended unit tests: mapping resolution (correct slug, missing mapping → null, Code CTA hidden, no slug-specific branch), Code completion derivation (unsolved → incomplete, solved → complete, visiting ≠ complete, failed submit ≠ complete), Solve ≠ Code slug, `validateSearch` rejects junk params, and a runner-level language-support test asserting py fails and js/ts execute. Then `bun run test`, `bun run typecheck`, `bun run lint`, plus the existing Practice e2e, and browser screenshots of: Trace complete + CTA, Practice with lesson context, Run, a failing test state, Accepted, and the stage strip showing CODE ✓.
