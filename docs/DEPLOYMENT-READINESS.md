# Algora — Deployment Readiness Assessment

**Date:** 2026-08-23 · **Branch:** `main` · **Target:** Cloudflare Workers (`cloudflare-module` preset)

Every claim below was produced by running a command or reading the named file at the named
line. Nothing here is inferred from the roadmap's own status markers — several of those are
stale, and where they disagree with the code the code wins. Anything I could not execute is
listed under [§7 Not verified](#7-what-i-could-not-verify) rather than assumed.

---

## 1. Verdict

**Not ready to deploy as a product. Ready to deploy as a demo, after a half-day of fixes.**

The engineering foundation is genuinely solid: it builds, it typechecks, 552 unit tests and
12 browser tests pass, security headers and CSP are real and verified, and the visualizer
engine works. Those are the hard parts and they are done.

What blocks launch is not engineering quality — it is that **the site makes promises the code
cannot keep**. The legal pages commit to Stripe billing, refunds, account deletion and
authentication session tokens. None of those exist. A user can click "Upgrade to Pro Annual"
and get Pro for free via a `toast.success()`. That is a legal and commercial exposure, not a
bug backlog.

Three tiers of work, sized:

| Tier                                        | Items | Rough effort |
| ------------------------------------------- | ----: | ------------ |
| P0 — must fix before the domain goes public |     6 | ~4–6 h       |
| P1 — should fix in the first week           |     7 | ~2–3 d       |
| P2 — deferred by design (needs a backend)   |     5 | post-launch  |

---

## 2. What is complete (verified)

### 2.1 Build and toolchain — ✅

```
bun run verify   → typecheck 0 errors · content 100% · lint 0 errors (7 pre-existing warnings) · 552 tests / 42 files pass
bun run build    → exit 0, clean build from a deleted .output
bun run test:e2e → 12 passed (Chromium)
```

The production build emits a Cloudflare module worker (`.output/nitro.json`,
preset `cloudflare-module`), auto-named `gayle9168-algo-think-visual`, deployable with
`npx wrangler --cwd ./.output deploy`. No environment variables are required — the only
`process.env` read anywhere in the codebase is `CI` in [playwright.config.ts](../playwright.config.ts).
No secrets are committed (a scan for key/secret/token literals returns only CSS design-token
names in [src/lib/contrast.ts](../src/lib/contrast.ts)).

### 2.2 Security headers and CSP — ✅ genuinely done

`ROADMAP.md` heads Phase 7 as "33% (1/3)" while marking all three tasks `[x]`. **The code is
right and the header is stale.** Executed against a running server:

```
GET /            → content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline'; …
                   strict-transport-security: max-age=63072000; includeSubDomains; preload
                   referrer-policy: strict-origin-when-cross-origin
                   permissions-policy: camera=(), microphone=(), geolocation=()
                   x-content-type-options: nosniff
GET /dashboard   → x-frame-options: SAMEORIGIN   (correctly absent on public routes)
```

And they survive into the production bundle, not just dev: `applySecurityHeaders` compiles into
`.output/server/_ssr/ssr.mjs:118`, exported as that module's `default.fetch`
(`ssr.mjs:161-163`), which `.output/server/index.mjs:13` registers as the `ssr` service. The
wrapper is on the request path in the built worker.

### 2.3 The visualizer engine — ✅ for what it covers

19 engine modules: 13 keyed by algorithm slug, 6 keyed by question slug
([src/engine/registry.ts](../src/engine/registry.ts)). Coverage against the catalog, measured:

| Surface                                               | Animated | Total | Notes                             |
| ----------------------------------------------------- | -------: | ----: | --------------------------------- |
| Algorithms                                            |       13 |    26 | 50%                               |
| Practice questions                                    |       21 |    56 | 38%                               |
| — searching                                           |    **8** | **8** | 100% — complete, browser-verified |
| — sorting                                             |        5 |     5 | 100%                              |
| — graphs                                              |        4 |     5 |                                   |
| — arrays                                              |        4 |    12 |                                   |
| — trees / dp / linked-lists / stacks-queues / hashing |        0 |    26 | no modules at all                 |

The searching category is the only one proven in a real browser: 12 Playwright tests walk all
121 steps of all 10 searching cards, asserting the player's own live region matches the
engine's narration step-for-step, and that cell colours actually change across the run (a
static picture fails the test). Uncovered algorithms degrade honestly rather than breaking —
[WorkspacePanels.tsx:625](../src/components/player/WorkspacePanels.tsx#L625) renders
`title="Visualization coming soon"`.

### 2.4 Accessibility, content integrity, testing — ✅ per roadmap Phases 3–5

These I accepted on the strength of their tests, which I ran and which pass: WCAG AA contrast
table, non-colour state icons, keyboard playback, focus rings, live regions with `aria-atomic`,
`prefers-reduced-motion`, semantic landmarks, alt-text audit, playback-control labels; Zod
content-schema validation wired into `build`; zero snapshot tests, enforced by both an ESLint
rule and a test. Content validation reports 26 algorithms, 30 lessons, 56 challenges, 3 paths,
24 achievements, 12 quests, 100% referential integrity.

Caveat: these are Node-environment unit tests asserting on source and data, not rendered-DOM
tests. They prove the attributes are written; they do not prove a screen reader is happy. See §7.

### 2.5 Pages that exist and are real — ✅

33 routes. `/privacy` and `/terms` carry substantial hand-written content with a
zero-placeholder policy enforced at build time. `/robots.txt` returns 200. A 404 correctly
returns HTTP 404, not a 200 with an error body.

---

## 3. P0 — blockers before the domain is public

### P0-1 · Legal pages promise systems that do not exist ⛔ highest risk

[src/data/legal.ts](../src/data/legal.ts) is a binding public document. It currently states:

| Line  | Claim                                                                                           | Reality                                                               |
| ----- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `51`  | `algora-auth` (Authentication Session Token) is stored in your browser                          | Never written. The string exists only in the policy and its own test. |
| `89`  | Payments processed by "PCI-DSS Level 1 certified payment processor (Stripe)"                    | No payment integration anywhere in `src/`.                            |
| `112` | "Clicking **Reset All Progress** in your preferences immediately wipes…"                        | No such control exists in `/settings`.                                |
| `112` | "Account deletion from **Settings → Danger Zone** … purges your cloud record … within 24 hours" | No Danger Zone, no cloud, no database.                                |
| `226` | "100% full refund within 14 calendar days", `billing@algora.io`                                 | No billing system; unclear the mailbox exists.                        |
| `222` | Recurring monthly/annual billing, 30-day price-change notice                                    | No subscriptions exist.                                               |

The real storage keys are `algora-progress`, `algora-prefs`, `algora-onboarding` — three, all
local, no auth token. **Fix:** rewrite the legal pages to describe the product as it actually
is today (a local-only, no-account, no-payment educational tool), and reintroduce the billing
and account clauses when Phase 10 ships. Do not ship the current text.

### P0-2 · "Upgrade to Pro" is free ⛔

[settings.billing.tsx:103-113](../src/routes/settings.billing.tsx#L103-L113): `handleChangePlan`
flips a local preference and fires `toast.success("Upgraded to Pro Annual")`. `handleCancel`
does the same in reverse. Plan state is client-authoritative in `localStorage`. If any content
is ever gated on it, it is gated on nothing. **Fix:** either remove the plan controls until
billing is real, or label the whole surface as a demo.

### P0-3 · Favicon 404s on every page ⛔ trivial, very visible

[\_\_root.tsx:99](../src/routes/__root.tsx#L99) links `/favicon.ico`. `public/` contains only
`robots.txt` — `git status` shows `D public/favicon.ico`. Verified: `GET /favicon.ico → 404`.
Every browser tab will show a blank icon and log a console error. **Fix:** restore the file
(`git checkout HEAD -- public/favicon.ico`) or add a new one.

### P0-4 · Fabricated data presented as the user's own ⛔

[settings.index.tsx:210-215](../src/routes/settings.index.tsx#L210-L215) shows
"Active sessions — **2 devices**", hardcoded, for a user who has no account and no sessions.
Alongside it, "Password ·········" with a `Change` button that has **no `onClick`**, and a
`Manage` button likewise dead. This violates the project's own S10.1 rule ("no page invents
demo data"). **Fix:** remove the Security card or make the controls visibly disabled/"soon".

### P0-5 · Top-nav links go nowhere ⛔

[src/content/nav.ts](../src/content/nav.ts): `SITE_NAV` line `123` maps **Learn → `/`** and line
`126` maps **Compete → `/`** — while `FOOTER_ROUTE_MAP:150` sends the same "Compete" label to
`/leagues`, which exists. Footer likewise: `Blog → "/"` (line `152`) although a `/blog` route
exists; `About`, `Changelog` → `/`; `Careers` → `/contact`; `Security`, `Cookies` → `/privacy`.
Two nav systems disagree about the same label. **Fix:** point Compete at `/leagues` and Blog at
`/blog`; for About/Changelog/Careers/Security/Cookies either build stubs or remove the links.
Shipping a footer where 6 of 18 links are decorative reads as unfinished.

### P0-6 · Nothing is committed ⛔ practical blocker

`git status`: **130 modified, 50 untracked, 2 deleted**. `git log origin/main..HEAD` is empty.
Every piece of work described in this document — the 7 new searching modules, Playwright, the
content layer, the legal pages, the security headers — **exists only on this machine**. A
deploy from git today ships the old code. And because the repo syncs to Lovable
([AGENTS.md](../AGENTS.md)), the branch must be left in a working state.
**Fix:** review, commit in logical chunks, push. This is the first thing to do, not the last.

---

## 4. P1 — fix in week one

1. **`bun run preview` is broken and misleading.** Nitro writes `.output`; the TanStack preview
   plugin looks for `dist/server/server.js` and every route returns HTTP 500
   (`ERR_MODULE_NOT_FOUND`). Verified. The correct command per `.output/nitro.json` is
   `npx wrangler --cwd ./.output dev`. Either fix the script or document it — right now the
   documented preview path makes a healthy build look broken.
2. **No CI.** No `.github/` directory exists. `bun run verify` passes but nothing enforces it on
   push. Roadmap Task 8.8 is open. This is the single highest-leverage remaining item: it makes
   every other guarantee in this document self-maintaining.
3. **First-load JS is ~390 KB gzipped, against the project's own 150 KB budget.** Measured from
   the build: the shared client entry `assets/index-Dazj4Dbp.js` is **238.3 KB gz** (806 KB raw)
   and it statically imports `assets/lucide-react-D9ru-b_M.js` at **151.5 KB gz** (602 KB raw).
   The entire Lucide barrel ships to every visitor including the landing page. Total client
   payload: 44 assets, 2.24 MB raw / 627 KB gz. Roadmap S8.5 sets marketing-route JS at
   < 150 KB gz — currently exceeded by ~2.6×. Fixing the Lucide barrel import is the one change
   with the largest effect.
4. **No `sitemap.xml`** (verified 404) despite a `robots.txt` that explicitly welcomes
   Googlebot, Bingbot, Twitterbot and facebookexternalhit.
5. **No `og:image`.** [\_\_root.tsx](../src/routes/__root.tsx) sets
   `twitter:card: summary_large_image` with no image to fill it, so every shared link renders as
   a blank card. Self-inflicted first-impression damage.
6. **`/dev/engine` is publicly reachable.** It carries `robots: noindex, nofollow`, so it will
   not be indexed, but an internal regression harness is served on the production domain. Gate
   it or drop the route from the production build.
7. **Auth routes are five dead ends.** `/login`, `/auth`, `/forgot-password`, `/reset-password`,
   `/verify-email` exist; [login.tsx:77-97](../src/routes/login.tsx#L77-L97) and
   [auth.tsx:78-105](../src/routes/auth.tsx#L78-L105) `preventDefault()` and navigate straight
   to `/dashboard` or `/verify-email`. No credentials, no session, no store — there is no
   `authStore` in `src/stores/`. Acceptable as a design demo; not acceptable while the legal
   pages describe session tokens. Ties back to P0-1.

---

## 5. P2 — deferred by design, and correctly so

Not defects — these are the honest edge of a static build, and the roadmap already scopes them
to Phase 10 (G12).

- Real auth (Better Auth), Postgres + Drizzle, server-authoritative XP, trustworthy leaderboards.
- Missing screens from G6: `/status`, `/help`, the 3-screen roadmap builder, 9 admin screens with
  RBAC and an audit log.
- Product-metrics instrumentation (P1–P8) — no analytics of any kind is wired.
- Animation for the remaining 13 algorithms and 35 questions. Largest single gap: trees (7
  questions) and dp (7 questions), both at zero.
- Performance gates 8.1–8.7: LCP, INP, canvas repaint, frame materialisation, SVG element count.

---

## 6. Ordered pre-deploy checklist

Do these in order. Steps 1–7 are the launch gate.

1. `git checkout HEAD -- public/favicon.ico` (or add a new icon) — P0-3.
2. Rewrite [src/data/legal.ts](../src/data/legal.ts) to match the product as built — P0-1.
   Update [legal-content.test.ts:64](../src/content/__tests__/legal-content.test.ts#L64), which
   currently asserts the policy _mentions_ `algora-auth`.
3. Remove or disable the billing plan toggle — P0-2.
4. Remove or disable the Security card in `/settings` — P0-4.
5. Fix `SITE_NAV` and `FOOTER_ROUTE_MAP` — P0-5.
6. `bun run verify && bun run build && bun run test:e2e` — all three green.
7. Commit in logical chunks and push to `main` — P0-6.
8. Deploy: `npx wrangler --cwd ./.output deploy`. Then **verify the live headers with curl** —
   see §7, this has never been exercised on the real runtime.
9. Week one: CI workflow, Lucide barrel fix, `sitemap.xml`, `og:image`, gate `/dev/engine`.

---

## 7. What I could not verify

Stated plainly, because a readiness document that hides its gaps is worthless.

- **The production worker has never been run.** `wrangler` and `workerd` are not installed
  locally, and `vite preview` is broken for this build (§4-1). I proved the security-header code
  compiles into the built worker and sits on its `fetch` path by reading
  `.output/server/_ssr/ssr.mjs` and `index.mjs`, and I proved the headers work by executing them
  against the dev server — but **no request has ever gone through the built artifact**. Re-run
  the curl checks from §2.2 against the live URL immediately after the first deploy.
- **Static assets are probably not covered by the CSP.** Cloudflare's `ASSETS` binding
  (`.output/server/wrangler.json`) serves `/assets/*` directly, and the generated
  `.output/public/_headers` sets only `cache-control`. Documents get the CSP; asset responses
  likely do not. Unproven either way without a live deploy.
- **The code runner has never run in a browser.** The Web Worker sandbox
  ([src/lib/runner.ts](../src/lib/runner.ts)) has strong unit tests, and CSP allows
  `worker-src 'self' blob:`, but no browser test submits a solution on `/practice/$slug`. For a
  platform whose core loop is "write code, get graded", this is the most important untested path.
- **Only 8 of 19 engine modules are browser-verified.** The other 11 rest on unit tests.
- **Accessibility is asserted against source, not a rendered DOM.** No axe run, no screen-reader pass.
- **LCP, INP and runtime frame performance are unmeasured.** The bundle numbers in §4-3 are real;
  the user-experienced timings are not.
- **28 of 33 routes have never been opened in a browser** in any automated check.
- One temporary file is still on disk: `e2e/shots.spec.ts`, a screenshot-capture spec I wrote and
  never ran. It is untracked and harmless, but it will execute on `bun run test:e2e`. Delete it
  before it gets committed with everything else in P0-6.

---

## 8. Roadmap corrections

[ROADMAP.md](../ROADMAP.md) should be updated — its status markers now understate the work:

- **Phase 7 header says "33% (1/3)"; all three tasks are done and verified** (§2.2). Should read 100%.
- The "Current State" table (lines 10–24) predates the content layer: it lists G10 as
  "No `marketing-claims.ts`, no content schema validation" — both now exist and are wired into
  the build. G6 "Missing: privacy, terms…" — both now shipped. G11 "CI config pending" is the
  one item in that table still accurate.
- G2 says "12 algorithms exist"; there are 26 catalog algorithms and 19 engine modules.
- Test count reads 346 → actual 552.
