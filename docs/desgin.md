# prompt.md — Pixel-Exact Design Bible + Generation Prompts

**For:** the Algora 240-day DSA video course (`roadmap.md`), built with Remotion (`remotion.md`).
**Purpose:** remove every design decision from the AI. It writes code; this file decides the pixels.

> **Read order for any agent:** `remotion.md` Parts 2 + 9 (the laws) → **this file** (the pixels) →
> `roadmap.md` (the content of the specific day). If this file and the AI's instinct disagree, this
> file wins. If this file and `remotion.md` disagree on an **API**, `remotion.md` wins. If this file
> and `remotion.md` disagree on a **number**, this file wins.

**Every number below is for a 1920×1080 @ 30fps master.** Part 10 gives the scale rule for other
aspect ratios. There are no "about" values in this document. If a value is not here, it is a bug in
this document — add it, don't improvise it.

---

## Part 0 — How to use this file

| You want to…                        | Go to                                   |
| :---------------------------------- | :-------------------------------------- |
| Understand the look before building | Part 1                                  |
| Place anything on screen            | Part 2 (grid), Part 8 (wireframes)      |
| Pick a colour                       | Part 3 — **never** invent a hex         |
| Pick a font size                    | Part 4 — **never** invent a size        |
| Pick an animation duration          | Part 5 — **never** invent a frame count |
| Copy-paste the design tokens        | Part 6                                  |
| Build a visual component            | Part 7                                  |
| Build a scene                       | Part 8 + Part 9                         |
| **Actually prompt the AI**          | **Part 11**                             |
| Brief one specific day              | Part 12                                 |
| Sign off a render                   | Part 13                                 |

---

## Part 1 — The locked aesthetic direction

**Direction: Instrument Panel.**

Not a slide deck. Not a "tech startup" gradient. The reference object is a piece of **laboratory
measurement equipment** — a logic analyser, an oscilloscope, a machinist's dial indicator. Things
that exist to show you a precise value and lie to you about nothing.

What that means concretely, and these are rules, not moods:

1. **Deep instrument-blue canvas, never pure black.** Pure black clips on OLED and kills the sense of
   a physical panel. Canvas is `#0F1420`.
2. **One signature element: the measurement gutter.** A 4px hairline rail runs the full width at
   `y=1076` and fills left-to-right as the video progresses. Every scene has it. It is the only
   persistent decoration in the entire course, and it is load-bearing — it tells the viewer how much
   is left. Nothing else decorates.
3. **The data is the hero.** Cells, bars, nodes, and table cells are the largest and brightest things
   in frame. Titles are support staff.
4. **Colour is a data type, not a style.** A colour on screen always means a _state_ (Part 3). A
   viewer who learns the seven state colours on Day 1 can read any frame of Day 240. Therefore:
   never use a state colour decoratively, and never introduce an eighth.
5. **Everything snaps to an 8px grid.** No `13px`, no `padding: 15`. This is what makes 240 videos
   produced over eight months look like one product.
6. **Monospace + tabular-nums for every number, index, and identifier.** Digits must not shift width
   when a value changes from `9` to `10`. This is the single most common jitter bug in algorithm
   animation.
7. **No gradients as backgrounds. No glows, orbs, blobs, or floating particles. No emoji.** If an
   element does not encode information, delete it.

**Banned, explicitly**, because AI reaches for these by default: cream/serif editorial styling;
neon-on-black single-accent styling; drop shadows used for depth (use the surface ramp in Part 3
instead); `border-radius` above 24px on any data element; italic anything; centre-aligned body
paragraphs; three or more font families; icon sets used decoratively.

---

## Part 2 — The pixel grid

### 2.1 Frame and the two safe areas

```
0,0 ┌────────────────────────────────────────────────────────────────┐
    │                          ↕ 96  BLEED SAFE                      │
    │    ┌──────────────────────────────────────────────────────┐    │
    │    │                    ↕ 184  TYPE SAFE                   │    │
    │ 96 │ 160 ┌──────────────────────────────────────────┐ 160  │ 96 │
    │    │     │                                          │      │    │
    │    │     │        CONTENT BOX  1600 × 712           │      │    │
    │    │     │                                          │      │    │
    │    │     └──────────────────────────────────────────┘      │    │
    │    │                    ↕ 184                              │    │
    │    └──────────────────────────────────────────────────────┘    │
    │                          ↕ 96                                  │
    └────────────────────────────────────────────────────────────┘ 1920,1080
```

Two tiers, deliberately:

| Tier           | Margins                                       | What may live here                                                                                                               |
| :------------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **Type safe**  | 160 sides / 184 top+bottom → box **1600×712** | All text. All titles, labels, captions, values, code. **Nothing textual crosses this line, ever.**                               |
| **Bleed safe** | 96 all sides → box **1728×888**               | Non-textual visual mass only: array cells, bars, edges, tree nodes, table strokes. A shape may enter this band; a glyph may not. |

Remotion's official floor is 142px sides / 178px top+bottom for key text at 1080 wide, scaled — this
spec uses **160 / 184** because they are 8px multiples and safely above the floor.

**Content box origin is `(160, 184)`. Content box centre is `(960, 540)`.** All coordinates in Part 8
are absolute frame coordinates, not offsets.

### 2.2 The 12-column grid

Inside the 1600px content box:

- **Columns:** 12 × **104px**
- **Gutters:** 11 × **32px**
- Check: `12×104 + 11×32 = 1248 + 352 = 1600` ✓

| Span       | Width    | Typical use                       |
| :--------- | :------- | :-------------------------------- |
| 1 col      | 104      | —                                 |
| 3 col      | 344      | Complexity value block            |
| 4 col      | 480      | Side panel, callout stack         |
| **5 col**  | **616**  | Narrow code pane                  |
| **6 col**  | **752**  | Half-split (visual ⇄ code)        |
| **7 col**  | **888**  | Wide visual in a split            |
| 8 col      | 1120     | Wide callout                      |
| **12 col** | **1600** | Full-width visual, headline block |

Span formula: `width = 104n + 32(n−1)`.

### 2.3 Vertical zones

Five fixed horizontal bands. Every scene assigns content to bands; it does not free-float.

| Zone              | y-range     | Height | Contents                                          |
| :---------------- | :---------- | :----- | :------------------------------------------------ |
| **Z0 Chrome**     | 184 – 248   | 64     | Day badge (left), beat label (right)              |
| **Z1 Title**      | 280 – 448   | 168    | Scene title. 1 line @ Display, or 2 lines @ H1    |
| **Z2 Stage**      | 480 – 800   | 320    | **The visualisation. The hero band.**             |
| **Z3 Annotation** | 824 – 920   | 96     | Pointers, index labels, formula callout, captions |
| **Z4 Rail**       | 1076 – 1080 | 4      | Progress hairline                                 |

Gap between zones is always **32px**. Zones Z1 and Z2 may be merged into one 520px band
(`280–800`) for trace scenes that need a tall structure (trees, DP tables, stacks) — in that case the
title drops to H2 and moves into Z0 on the right. That is the **only** permitted zone merge.

### 2.4 The spacing scale

Use these values and no others.

```
2  4  8  12  16  24  32  48  64  96  128  160  192  256
```

- **4** — hairlines, stroke widths, focus rails
- **8** — tight internal padding, bar gaps
- **16** — gap between array cells, stack frames
- **24** — gap between a value and its label
- **32** — the default gap between any two related elements; grid gutter
- **48** — gap between a label group and its content
- **64** — gap between two distinct UI groups
- **96 / 128** — gap between major regions

### 2.5 Radii and strokes

| Token         | Value    | Applies to                                      |
| :------------ | :------- | :---------------------------------------------- |
| `radius.sm`   | **8**    | Highlight bars, weight badges, index chips      |
| `radius.md`   | **12**   | Array cells, DP cells, stack frames             |
| `radius.lg`   | **16**   | Code pane, formula callout                      |
| `radius.xl`   | **20**   | Complexity card, misconception callout          |
| `radius.pill` | **9999** | Day badge, pointer label                        |
| `stroke.hair` | **2**    | Internal DP table grid lines                    |
| `stroke.edge` | **3**    | Graph edges, tree edges, linked-list arrows     |
| `stroke.data` | **4**    | Every data element's outline; the progress rail |
| `stroke.rail` | **8**    | Callout left rail                               |

**Hard rule: data elements are outlined with CSS `outline`, never `border`.** `box-sizing:
border-box` makes a border eat into the box, so a 128px cell that gains a border becomes visually
smaller than its neighbours and the row jitters. `outline` draws outside the box and does not
reflow. This is the number one cause of "why does my array wobble".

---

## Part 3 — Colour tokens (exact hex, nothing else permitted)

### 3.1 Canvas and surface ramp

Depth comes from this ramp, not from shadows.

| Token      | Hex       | Use                                        |
| :--------- | :-------- | :----------------------------------------- |
| `canvas`   | `#0F1420` | The frame background. Every scene.         |
| `surface1` | `#171E2E` | Code pane, complexity card, callout body   |
| `surface2` | `#1F2839` | DP table header cells, stack frame fill    |
| `hairline` | `#2A3448` | Dividers, table grid lines, inactive rails |

### 3.2 Ink

| Token      | Hex       | Contrast on canvas | Use                                                                 |
| :--------- | :-------- | :----------------- | :------------------------------------------------------------------ |
| `ink`      | `#E8ECF4` | 14.8:1             | Titles, primary text                                                |
| `inkMuted` | `#94A0B8` | 6.9:1              | Index labels, line numbers, secondary                               |
| `inkFaint` | `#5A6580` | 3.0:1              | Excluded / dimmed text only. **Never** for text a viewer must read. |

### 3.3 Brand

| Token      | Hex       | Use                                                                      |
| :--------- | :-------- | :----------------------------------------------------------------------- |
| `brand`    | `#4A9EFF` | The Algora blue. Progress rail fill, day badge stroke, active code rail. |
| `brandDim` | `#1E3A5F` | Fill behind brand-stroked elements                                       |

### 3.4 The state ramp — the whole visual language

Seven states. This is a **data-encoding scale**, which is why it exceeds a normal 5-colour palette:
each hue carries meaning and none is decorative. Learn once, applies to all 240 days.

| `CellState` | Meaning to the viewer            | `fill`    | `stroke`  | `text`    |
| :---------- | :------------------------------- | :-------- | :-------- | :-------- |
| `idle`      | untouched                        | `#1B2436` | `#33405C` | `#C3CCDD` |
| `scanning`  | being read right now             | `#1E3A5F` | `#4A9EFF` | `#DCE9FF` |
| `comparing` | one of the two operands          | `#4A3410` | `#F5A524` | `#FFECC7` |
| `swapping`  | mid-move                         | `#4A1F3D` | `#E255A1` | `#FFD6EE` |
| `settled`   | final, will never move again     | `#123A2E` | `#2ED08A` | `#C6F5E1` |
| `excluded`  | eliminated from the search space | `#141924` | `#2A3243` | `#4E5876` |
| `target`    | the answer                       | `#3D1520` | `#FF5C6E` | `#FFD3D8` |

Distinguishability notes that matter: `comparing` (amber) and `target` (red) are separated by ~40° of
hue **and** by luminance; `settled` (green) and `scanning` (blue) never appear as the sole difference
between two adjacent cells without a pointer also present. `excluded` is the only state that is
_darker_ than `idle` — that asymmetry is intentional, because elimination should read as recession.

### 3.5 Semantic pair

| Token   | Hex       | Use                                      |
| :------ | :-------- | :--------------------------------------- |
| `wrong` | `#FF5C6E` | Misconception rail, ✗ mark, failing path |
| `right` | `#2ED08A` | Insight rail, ✓ mark, correct path       |

### 3.6 Colour rules

1. Every coloured pixel resolves to a token above. Zero exceptions.
2. Change a background token → change the paired text token. The table already pairs them; use the pair.
3. Never encode meaning in colour **alone**. Every state change is accompanied by at least one of:
   a stroke-width change, a 16px lift, a pointer, or a label. Roughly 8% of your audience is
   red-green colour deficient and they are watching a course about correctness.
4. `opacity` is for entrances and exits only. To dim data, use the `excluded` state.

---

## Part 4 — Typography (exact px)

**Two families. That is the entire type system.**

| Role            | Family             | Source                                 |
| :-------------- | :----------------- | :------------------------------------- |
| Display / UI    | **Inter**          | `@remotion/google-fonts/Inter`         |
| Mono / all data | **JetBrains Mono** | `@remotion/google-fonts/JetBrainsMono` |

Weights loaded: Inter `400`, `600`, `700`. JetBrains Mono `400`, `500`, `700`. Nothing else — every
extra weight is a render-blocking font fetch × 240 videos.

### 4.1 The scale

| Token     | Size    | Line-height | Weight | Tracking | Family   | Use                                           |
| :-------- | :------ | :---------- | :----- | :------- | :------- | :-------------------------------------------- |
| `display` | **152** | 1.05 → 160  | 600    | −0.03em  | Inter    | Hook, Predict question, Misconception verdict |
| `h1`      | **96**  | 1.10 → 106  | 600    | −0.02em  | Inter    | Trace scene title                             |
| `h2`      | **64**  | 1.20 → 77   | 600    | −0.01em  | Inter    | Section label, merged-zone title              |
| `body`    | **80**  | 1.35 → 108  | 400    | 0        | Inter    | Supporting sentence. **Floor for prose.**     |
| `caption` | **64**  | 1.30 → 84   | 600    | 0        | Inter    | Burned-in subtitles                           |
| `value`   | **46**  | 1.00        | 500    | 0        | **Mono** | Number inside an array/DP cell                |
| `code`    | **44**  | 1.50 → 66   | 400    | 0        | **Mono** | Code pane body                                |
| `label`   | **40**  | 1.20 → 48   | 500    | 0        | **Mono** | Pointer labels, axis labels, badge text       |
| `micro`   | **32**  | 1.20 → 38   | 500    | 0        | **Mono** | Index numbers, line numbers, edge weights     |

`micro` and `label` sit below Remotion's 78px supporting-text floor. **This is a scoped exception:**
permitted **only** for a glyph that is spatially attached to a data element it annotates (the `3`
under cell 3), where the data element itself carries the size. It is never permitted for a sentence,
a title, a takeaway, or anything a viewer must read without an accompanying visual.

### 4.2 Type rules

1. `fontVariantNumeric: "tabular-nums"` on **every** element that can display a digit. Not optional.
2. `display` is max **2 lines**, ≤ 44 characters per line. Longer → it is not a headline, rewrite it.
3. `body` is max **3 lines**, ≤ 52 characters per line.
4. `code` is max **14 lines**, ≤ **42 characters** per line. At 44px JetBrains Mono the advance is
   ~26.4px, so 42 chars ≈ 1109px, which fits a 7-col pane. Longer code → split across two beats.
5. All prose is **left-aligned**. Only these are centred: `display` in the Hook and Predict beats, the
   countdown numeral, and captions.
6. `text-wrap: balance` on `display` and `h1`. `text-wrap: pretty` on `body`.
7. Never letter-space mono. Never italicise anything.

---

## Part 5 — Motion constants (exact frames @ 30fps)

Frames, not milliseconds. Always write `DUR.base`, never `12`.

### 5.1 Durations

| Token        | Frames | ms   | Use                                       |
| :----------- | :----- | :--- | :---------------------------------------- |
| `instant`    | **4**  | 133  | Colour/state cross-fade                   |
| `quick`      | **8**  | 267  | Pointer hop one index, highlight bar move |
| `base`       | **12** | 400  | Element entrance, cell lift, swap arc     |
| `slow`       | **20** | 667  | Title reveal, code pane entrance          |
| `xslow`      | **30** | 1000 | Full-structure reveal (tree, graph)       |
| `stagger`    | **2**  | 67   | Delay between sibling elements            |
| `transition` | **15** | 500  | Scene-to-scene transition                 |

### 5.2 Holds — the pacing rule most AI animation gets wrong

| Token         | Frames | s   | Rule                                                                      |
| :------------ | :----- | :-- | :------------------------------------------------------------------------ |
| `holdRead`    | **45** | 1.5 | After **any** new number appears, before the next change. Non-negotiable. |
| `holdBeat`    | **60** | 2.0 | After a completed logical step (one full comparison, one swap)            |
| `holdPredict` | **90** | 3.0 | The Predict beat's dead air. **Exactly 90. Never shorten it.**            |
| `holdLand`    | **75** | 2.5 | On the final settled state before leaving a trace                         |

**A trace step is never shorter than `base + holdRead` = 57 frames (1.9s).** An algorithm animation
that a learner cannot follow is decoration. If a trace has 20 steps that is 38 seconds and that is
correct — cut steps, never cut hold time.

### 5.3 Easings

| Token         | Definition                                                             | Use                                                          |
| :------------ | :--------------------------------------------------------------------- | :----------------------------------------------------------- |
| `ease.enter`  | `Easing.bezier(0.16, 1, 0.30, 1)`                                      | Everything entering. Expo-out.                               |
| `ease.exit`   | `Easing.bezier(0.70, 0, 0.84, 0)`                                      | Everything leaving. Expo-in.                                 |
| `ease.move`   | `spring({ fps, config: { damping: 200, stiffness: 100, mass: 0.6 } })` | Pointer travel, highlight bar, camera pan. **No overshoot.** |
| `ease.pop`    | `spring({ fps, config: { damping: 14, stiffness: 180, mass: 0.5 } })`  | Swaps and push/pop **only**. Slight overshoot = physicality. |
| `ease.linear` | none                                                                   | Progress rail. Only the rail.                                |

`ease.pop` is the one place overshoot is allowed. Overshoot on a _value_ implies the value wobbled;
it didn't.

### 5.4 Motion rules

1. **One idea per frame.** Two unrelated things moving simultaneously → split into two
   `Series.Sequence` steps.
2. Movement is **either** position **or** state, never both in the same 12 frames. Recolour, hold 4,
   then move.
3. Distance ≤ 1 cell → `quick`. > 1 cell → `base`. Never scale duration with distance beyond that;
   inconsistent timing reads as lag.
4. Entrances stagger at `stagger` (2f) and **cap at 12 siblings** (24f total). Beyond 12, reveal the
   group as one unit.
5. Scale animations **must** pass `output: "perceptual-scale"` to `interpolate`. Linear scale
   interpolation looks slow at the start and snappy at the end.
6. All `interpolate` calls clamp both ends: `extrapolateLeft: "clamp", extrapolateRight: "clamp"`.
   `interpolate` does **not** clamp by default and unclamped values are how you get a cell at
   `scale: -3`.
7. Zero use of CSS `@keyframes`, `transition`, or Tailwind `animate-*`. They are wall-clock driven
   and do not exist during a frame-by-frame render.
8. Write ranges as `seconds * fps`, e.g. `[0, 0.4 * fps]`, so a 60fps re-render is free.

---

## Part 6 — `src/theme.ts` (copy-paste, do not edit per video)

```ts
// src/theme.ts — the single source of truth. Videos import; they never redefine.

export const FRAME = { w: 1920, h: 1080, fps: 30 } as const;

/** Scale factor for non-1920 compositions. See Part 10. */
export const k = (width: number) => width / FRAME.w;

export const SAFE = {
  type: { x: 160, y: 184 },
  bleed: { x: 96, y: 96 },
  content: { x: 160, y: 184, w: 1600, h: 712 },
  center: { x: 960, y: 540 },
} as const;

export const GRID = { cols: 12, col: 104, gutter: 32 } as const;
/** Pixel width of an n-column span. */
export const span = (n: number) => GRID.col * n + GRID.gutter * (n - 1);

export const ZONE = {
  chrome: { top: 184, height: 64 },
  title: { top: 280, height: 168 },
  stage: { top: 480, height: 320 },
  annot: { top: 824, height: 96 },
  rail: { top: 1076, height: 4 },
  /** the only permitted merge: title+stage for tall structures */
  stageTall: { top: 280, height: 520 },
} as const;

export const SP = {
  x2: 2,
  x4: 4,
  x8: 8,
  x12: 12,
  x16: 16,
  x24: 24,
  x32: 32,
  x48: 48,
  x64: 64,
  x96: 96,
  x128: 128,
  x160: 160,
  x192: 192,
  x256: 256,
} as const;

export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, pill: 9999 } as const;
export const STROKE = { hair: 2, edge: 3, data: 4, rail: 8 } as const;

export const COLORS = {
  canvas: "#0F1420",
  surface1: "#171E2E",
  surface2: "#1F2839",
  hairline: "#2A3448",

  ink: "#E8ECF4",
  inkMuted: "#94A0B8",
  inkFaint: "#5A6580",

  brand: "#4A9EFF",
  brandDim: "#1E3A5F",

  wrong: "#FF5C6E",
  right: "#2ED08A",

  stateFill: {
    idle: "#1B2436",
    scanning: "#1E3A5F",
    comparing: "#4A3410",
    swapping: "#4A1F3D",
    settled: "#123A2E",
    excluded: "#141924",
    target: "#3D1520",
  },
  stateStroke: {
    idle: "#33405C",
    scanning: "#4A9EFF",
    comparing: "#F5A524",
    swapping: "#E255A1",
    settled: "#2ED08A",
    excluded: "#2A3243",
    target: "#FF5C6E",
  },
  stateText: {
    idle: "#C3CCDD",
    scanning: "#DCE9FF",
    comparing: "#FFECC7",
    swapping: "#FFD6EE",
    settled: "#C6F5E1",
    excluded: "#4E5876",
    target: "#FFD3D8",
  },
} as const;

export const DUR = {
  instant: 4,
  quick: 8,
  base: 12,
  slow: 20,
  xslow: 30,
  stagger: 2,
  transition: 15,
  holdRead: 45,
  holdBeat: 60,
  holdPredict: 90,
  holdLand: 75,
} as const;

/** Minimum frames for one trace step. Never go below this. */
export const STEP_MIN = DUR.base + DUR.holdRead; // 57

export const TYPE = {
  display: { fontSize: 152, lineHeight: "160px", fontWeight: 600, letterSpacing: "-0.03em" },
  h1: { fontSize: 96, lineHeight: "106px", fontWeight: 600, letterSpacing: "-0.02em" },
  h2: { fontSize: 64, lineHeight: "77px", fontWeight: 600, letterSpacing: "-0.01em" },
  body: { fontSize: 80, lineHeight: "108px", fontWeight: 400 },
  caption: { fontSize: 64, lineHeight: "84px", fontWeight: 600 },
  value: { fontSize: 46, lineHeight: "46px", fontWeight: 500 },
  code: { fontSize: 44, lineHeight: "66px", fontWeight: 400 },
  label: { fontSize: 40, lineHeight: "48px", fontWeight: 500 },
  micro: { fontSize: 32, lineHeight: "38px", fontWeight: 500 },
} as const;

/** Put on every element that can render a digit. */
export const NUM = { fontVariantNumeric: "tabular-nums" as const };
```

```ts
// src/fonts.ts
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Verify this signature against /remotion-docs before first use.
export const { fontFamily: SANS, waitUntilDone: sansReady } = loadInter("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

export const { fontFamily: MONO, waitUntilDone: monoReady } = loadMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

export const fontsReady = () => Promise.all([sansReady(), monoReady()]);
```

---

## Part 7 — Primitive pixel specs

Build each **once** in `src/dsa/`. The AI composes them; it never re-invents them. Every spec below
is measured, not suggested.

### 7.1 `ArrayRow`

| Property          | Value                                                                    |
| :---------------- | :----------------------------------------------------------------------- |
| Cell box          | **128 × 128**, `radius.md` (12)                                          |
| Outline           | `stroke.data` (4), `stateStroke[state]`, via `outline`                   |
| Fill              | `stateFill[state]`                                                       |
| Value type        | `value` (46 mono, 500, tabular) in `stateText[state]`                    |
| Gap between cells | **16**                                                                   |
| Index label       | `micro` (32 mono) in `inkMuted`, **24** below cell bottom                |
| Active lift       | `translate: "0px -16px"` over `base`, `ease.enter`                       |
| Entrance          | `opacity 0→1` + `scale 0.8→1` (`perceptual-scale`), `base`, `stagger` 2f |
| Row anchor        | horizontally centred on `x=960`; cell **tops** at `y=540`                |

**Capacity ladder — pick by `n`, do not eyeball:**

| n     | Cell | Gap | Total width | Index labels         |
| :---- | :--- | :-- | :---------- | :------------------- |
| 1–9   | 128  | 16  | ≤ 1280      | yes                  |
| 10–12 | 104  | 12  | ≤ 1380      | yes                  |
| 13–16 | 88   | 8   | ≤ 1528      | yes, `micro` 24px    |
| 17+   | —    | —   | —           | **switch to `Bars`** |

```
        ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
        │  4  │ │  8  │ │ 15  │ │ 16  │ │ 23  │   ← 128×128, gap 16, top y=540
        └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
           0       1       2       3       4      ← micro, inkMuted, 24 below
                           ▲
                        ┌──┴──┐
                        │ mid │                   ← Pointer, 24 below indices
                        └─────┘
```

### 7.2 `Pointer`

| Property               | Value                                                                                |
| :--------------------- | :----------------------------------------------------------------------------------- |
| Caret                  | triangle **32 wide × 24 tall**, filled `stateStroke` of its role colour              |
| Label pill             | height **56**, padding-x **20**, `radius.pill`, fill `brandDim`, outline 2px `brand` |
| Label type             | `label` (40 mono, 500, tabular)                                                      |
| Gap caret→pill         | **8**                                                                                |
| Vertical anchor        | pill top at `y=824` (Z3)                                                             |
| Travel                 | `ease.move` spring, `quick` for 1 index, `base` beyond                               |
| Multi-pointer stacking | 2nd pointer pill offset **+64** in y; max **3**                                      |

Role colours: `lo`/`left` → `scanning`; `hi`/`right` → `comparing`; `mid`/`current` → `brand`;
`found` → `target`.

### 7.3 `Bars`

| Property       | Value                                                                                  |
| :------------- | :------------------------------------------------------------------------------------- |
| Baseline       | `y=800` (bottom of Z2)                                                                 |
| Max bar height | **480** (top reaches `y=320`, inside bleed safe)                                       |
| Bar width      | `min(96, floor((1600 − (n−1)·gap) / n))`                                               |
| Gap            | **8**                                                                                  |
| Radius         | `radius.sm` (8), top corners only                                                      |
| Fill / outline | `stateFill` / `stroke.data` `stateStroke`                                              |
| Value label    | on top, `micro` mono, **only if bar width ≥ 48**                                       |
| Height mapping | `h = round((v / max) * 480 / 8) * 8` — **snap to 8px** so bars never sub-pixel shimmer |
| Capacity       | n ≤ 40 (at n=40: width 32, no labels)                                                  |

### 7.4 `LinkedList`

| Property          | Value                                                                                           |
| :---------------- | :---------------------------------------------------------------------------------------------- |
| Node box          | **160 × 96**, `radius.md`, split: value cell 96 wide + next cell 64 wide, divider `stroke.hair` |
| Gap between nodes | **64** (the arrow lives here)                                                                   |
| Arrow             | `stroke.edge` (3) line + 16px head, `inkMuted`; `brand` when traversed                          |
| Arrow draw-on     | `stroke-dashoffset` over `quick`                                                                |
| null terminator   | `∅` in `micro`, `inkFaint`                                                                      |
| Capacity          | 7 nodes (`7×160 + 6×64 = 1504`)                                                                 |
| Pointer rename    | reroute the arrow with `ease.move`; **never** teleport it                                       |

### 7.5 `TreeView`

| Depth | Node ⌀ | Level height | Min leaf gap                                   |
| :---- | :----- | :----------- | :--------------------------------------------- |
| ≤ 3   | **96** | 152          | 32                                             |
| 4     | **72** | 128          | 16                                             |
| ≥ 5   | 72     | 128          | 16 + **camera pan/zoom to the active subtree** |

| Property    | Value                                                                                      |
| :---------- | :----------------------------------------------------------------------------------------- |
| Node        | circle, `stroke.data` outline, `stateFill`, value in `value` type (46 → 36 at ⌀72)         |
| Edge        | `stroke.edge` (3), `hairline`; `brand` on the active path                                  |
| x-layout    | in-order index × leaf slot width. **Deterministic and precomputed** — never force-directed |
| Root anchor | `x=960`, node centre `y=340` (uses `stageTall`)                                            |
| Reveal      | BFS order, `stagger` 2f per node, edge draws `instant` before its child appears            |
| Null child  | 32×32 hollow square, `inkFaint`, only when the null-ness is the point                      |

### 7.6 `GraphView`

| Property        | Value                                                                                         |
| :-------------- | :-------------------------------------------------------------------------------------------- |
| Node            | circle ⌀ **88**, `stroke.data`, label `label` (40 mono)                                       |
| Edge            | `stroke.edge` (3); directed adds a 16px head inset 44px from centre                           |
| Weight badge    | **40 × 40**, `radius.sm`, fill `canvas`, outline 2 `hairline`, `micro` text, at edge midpoint |
| Distance label  | above node, `micro`, `brand`; `∞` until relaxed                                               |
| Layout          | **hand-authored coordinates** in a `1600 × 712` box, ≥ 176px between node centres             |
| Visit order     | node → `scanning`, hold `holdRead`, → `settled`                                               |
| Relax animation | edge pulses `stroke.data`→6→`stroke.data` over `quick`, then the distance label cross-fades   |

Force-directed layout is banned: it is nondeterministic across renders, which breaks Remotion's
purity requirement and makes two renders of the same video differ.

### 7.7 `StackFrames`

| Property          | Value                                                              |
| :---------------- | :----------------------------------------------------------------- |
| Frame card        | **640 × 112**, `radius.md`, fill `surface2`, outline `stroke.data` |
| Stack direction   | upward from bottom at `y=880`                                      |
| Gap               | **8**                                                              |
| Text              | `code` (44 mono) e.g. `fib(5)`, left pad 32                        |
| Return value chip | right-aligned, 120 × 64, `radius.sm`, `settled` colours            |
| Push              | slide in from `translate: "0px 112px"` + fade, `ease.pop`, `base`  |
| Pop               | reverse with `ease.exit`, `quick`                                  |
| Max visible       | **6**, then a `⋮ +n more` row in `micro`, `inkFaint`               |
| Anchor x          | left edge `x=160` (col 1)                                          |

### 7.8 `RecursionTree`

Same geometry as `TreeView` depth-4 (⌀72, level 128), plus:

| Property         | Value                                                                              |
| :--------------- | :--------------------------------------------------------------------------------- |
| Node label       | `f(n)` in `label` mono                                                             |
| Memo hit         | node → `settled` **and** a 32px `⚡` -free marker: a 4px double outline. No emoji. |
| Repeated subtree | outline both instances `target`, connect with a 3px dashed `target` link           |
| Reveal           | DFS pre-order, `stagger` 2f, so recursion _order_ is visible                       |

### 7.9 `DPTable`

| Cols  | Cell                                | Total  |
| :---- | :---------------------------------- | :----- |
| ≤ 12  | **96 × 96**                         | ≤ 1152 |
| 13–16 | **88 × 88**                         | ≤ 1408 |
| 17+   | window to a 12-col viewport and pan | —      |

| Property          | Value                                                                                                        |
| :---------------- | :----------------------------------------------------------------------------------------------------------- |
| Header row/col    | same size, fill `surface2`, text `micro` `inkMuted`                                                          |
| Internal grid     | `stroke.hair` (2) `hairline`                                                                                 |
| Outer frame       | `stroke.data` (4) `hairline`                                                                                 |
| Cell value        | `value` (46 mono, tabular)                                                                                   |
| Fill-in           | one cell per step, `opacity 0→1` + `scale 0.85→1`, `quick`                                                   |
| Dependency arrows | from the 1–3 source cells to the target, `stroke.edge` `comparing`, drawn over `quick`, then held `holdRead` |
| Formula callout   | **752 × 160** (6 col), `radius.lg`, `surface1`, right of table, formula in `code` mono                       |
| Max rows visible  | 8 (768px in `stageTall`)                                                                                     |

### 7.10 `CodePane`

| Property              | Value                                                                                                   |
| :-------------------- | :------------------------------------------------------------------------------------------------------ |
| Pane                  | **888 wide** (7 col), auto height, `radius.lg`, fill `surface1`, outline 2 `hairline`                   |
| Padding               | **32**                                                                                                  |
| Gutter                | **64** wide, line numbers `micro` mono `inkMuted`, right-aligned                                        |
| Gap gutter→code       | **24**                                                                                                  |
| Code                  | `code` (44 mono / 66 line-height)                                                                       |
| Active line highlight | full pane width bar, height **66**, `radius.sm`, fill `brand` @ 14% alpha, **4px left rail** in `brand` |
| Highlight move        | `ease.move`, `quick`                                                                                    |
| Dimmed lines          | `inkFaint`                                                                                              |
| Limits                | **14 lines**, **42 chars**                                                                              |

Syntax colouring uses **only**: keywords `brand`, strings `right`, numbers `#F5A524`, comments
`inkFaint`, everything else `ink`. Five colours, no theme imports — a full Shiki theme will introduce
hues outside the palette.

### 7.11 `ComplexityCard`

| Property        | Value                                                                        |
| :-------------- | :--------------------------------------------------------------------------- |
| Card            | **1120 × 280** (8 col), `radius.xl`, `surface1`, outline 2 `hairline`        |
| Layout          | two equal columns, `stroke.hair` divider                                     |
| Label           | `TIME` / `SPACE`, `label` mono, `inkMuted`, tracking `0.1em`                 |
| Value           | **88px mono 700**, `ink`                                                     |
| Derivation line | above the card, `body`, e.g. `halve the range each step → log₂(n) steps`     |
| Reveal          | derivation first, hold `holdBeat`, **then** the value. Never simultaneously. |

The derivation-before-value order is the pedagogical point of the component. Do not reorder it.

### 7.12 `Callout`

| Property  | Value                                                                   |
| :-------- | :---------------------------------------------------------------------- |
| Box       | **1120 wide** (8 col), min height **200**, `radius.xl`, `surface1`      |
| Left rail | `stroke.rail` (8) — `wrong` for misconception, `right` for insight      |
| Mark      | `✗` / `✓` at **64px**, 32 from rail                                     |
| Text      | `body` (80), left-aligned, 32 from mark                                 |
| Entrance  | slide `translate: "-32px 0px" → "0px 0px"` + fade, `ease.enter`, `slow` |

### 7.13 Persistent chrome — on every single scene

**`DayBadge`** — pill at `(160, 184)`, height **64**, padding-x 24, `radius.pill`, fill `surface1`,
outline 2 `brand`, text `label` mono `ink`, format exactly `DAY 042 · BINARY SEARCH` (zero-padded to
3, topic uppercase, `·` U+00B7 separator).

**`BeatLabel`** — right-aligned at `(1760, 184)`, `label` mono `inkMuted`, tracking `0.1em`, one of:
`HOOK` `COLD OPEN` `PREDICT` `TRACE` `MISCONCEPTION` `COMPLEXITY`.

**`ProgressRail`** — the signature element. Track: full width `0→1920`, at `y=1076`, height **4**,
fill `hairline`. Fill bar: same box, width `interpolate(frame, [0, durationInFrames], [0, 1920])`,
`ease.linear`, fill `brand`. Rendered in the **master** composition only, above all scenes, so it is
continuous across transitions.

**`Captions`** — block bottom at `y=920`, max width **1280**, centred on `x=960`, `caption` type
(64/600), fill `ink`, backdrop `canvas` @ 82% with `radius.md` and 16/24 padding. Max **2 lines**,
≤ 42 chars per line. Word-level highlight in `brand` when using `@remotion/captions` token timings.

---

## Part 8 — Scene wireframes, beat by beat

Six scenes per day, from `roadmap.md`'s scene grammar. Each is its own file **and** its own
`<Composition>` inside `<Folder name="Day{N}-Scenes">`, so any beat can be re-rendered alone.

### Beat 1 — HOOK · target 20s (600f)

```
 y=184  DAY 042 · BINARY SEARCH                                  HOOK
 y=280  ┌────────────────────────────────────────────────────────────┐
        │                                                            │
        │        You scanned 1,000,000 rows.                         │  display 152
        │        You needed to scan 20.                              │  centred, 2 lines
        │                                                            │
 y=600  └────────────────────────────────────────────────────────────┘
 y=640  ┌───────── Bars, n=40, all `idle`, sweeping `scanning` ──────┐
        │  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆              │  baseline y=800
 y=800  └────────────────────────────────────────────────────────────┘
 y=1076 ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

- Frame 0: canvas only. Chrome fades in over `slow`.
- Frame 12: line 1 of `display`, `ease.enter`, `slow`.
- Frame 42: line 2. Hold `holdBeat`.
- Frame 120: bars fade in at 40% opacity, then a `scanning` sweep left→right, 1 bar per 4 frames.
- **No definitions, no agenda slide, no "in this video".** A concrete failure, then stop.

### Beat 2 — COLD OPEN · target 50s (1500f)

The SRS retrieval problem from a topic ≥21 days old. Split layout.

```
 y=184  DAY 042 · BINARY SEARCH                             COLD OPEN
 y=280  RECALL · DAY 021 · TWO POINTERS                            ← h2, inkMuted
 y=380  ┌───── 7 col / 888 ─────┐   ┌──── 5 col / 616 ────┐
        │  ArrayRow n=7          │   │  CodePane           │
        │  cells top y=540       │   │  888→616 variant    │
        │  + Pointer(s) at 824   │   │  active line rail   │
 y=920  └────────────────────────┘   └─────────────────────┘
 y=1076 ══════════════════════════════════════════════════════════════
```

Split geometry: left block `x=160` w`888`; **gutter 96**; right block `x=1144` w`616`.
Check: `160 + 888 + 96 + 616 = 1760 = 1920 − 160` ✓

- Question on screen, 3s hold, then the trace runs. Reuse the Beat 3 `PredictBeat` component.

### Beat 3 — PREDICT · exactly 4s (120f)

```
 y=184  DAY 042 · BINARY SEARCH                               PREDICT
        ┌────────────────────────────────────────────────────────────┐
 y=340  │     What happens when lo and hi are adjacent?              │  display 152
        │                                        centred, max 2 lines│
 y=660  │                                                            │
 y=700  │                            3                               │  120px mono 700
        │                                                            │  tabular-nums
 y=860  └────────────────────────────────────────────────────────────┘
 y=1076 ══════════════════════════════════════════════════════════════
```

- Frames 0–30: question fades in, `ease.enter`.
- **Frames 30–120: exactly 90 frames of dead air.** Countdown numeral `3 → 2 → 1` at 30f each,
  cross-fading `instant`. A 96px ring stroke (`stroke.rail` 8, `brand`) sweeps `0→360°` over the 90f.
- **The 90 frames are the pedagogy** (`roadmap.md` predict-before-reveal). Any agent that shortens
  this has failed the brief. Nothing else animates. Do not add a "thinking" visual.

### Beat 4 — TRACE · bulk of the video, duration = steps × step cost

The hero beat. Uses `stageTall` (`280–800`) when the structure is tall; otherwise Z1+Z2 normally.

```
 y=184  DAY 042 · BINARY SEARCH                                 TRACE
 y=280  Step 3 of 7 — mid = 4, arr[4] = 23 > 16                     ← h2, ink, tabular
 y=380  ┌───── 7 col visual ─────┐   ┌──── 5 col code ─────┐
        │ ┌──┐┌──┐┌──┐┌──┐┌──┐   │   │ 1  while lo <= hi:  │
        │ │ 4││ 8││15││16││23│   │   │ 2    mid=(lo+hi)//2 │ ← active rail
        │ └──┘└──┘└──┘└──┘└──┘   │   │ 3    if a[mid]==t:  │
        │   0   1   2   3   4    │   │ 4      return mid   │
        │       ▲       ▲        │   │ 5    elif a[mid]<t: │
        │     ┌─┴─┐   ┌─┴─┐      │   │ 6      lo = mid+1   │
 y=824  │     │lo │   │hi │      │   │ 7    else: hi=mid-1 │
        │     └───┘   └───┘      │   │                     │
 y=920  └────────────────────────┘   └─────────────────────┘
 y=1076 ══════════════════════════════════════════════════════════════
```

**The architectural rule, and it is the most important rule in this document:**

Write the algorithm as a **pure trace function** in `src/dsa/traces/{topic}.ts` that returns
`Step[]`. Each `Step` is a complete snapshot: `{ states, pointers, codeLine, note }`. The scene then
renders **step `k` declaratively** inside `<Series>`. There is **zero animation logic inside the
algorithm** and **zero algorithm logic inside the component**.

Why: the algorithm stays unit-testable, the render stays pure and deterministic, any step can be
re-rendered as a still for QA, and the identical trace array can later drive a web widget for the
practice problems in `roadmap.md`.

Per-step budget:

| Sub-beat          | Frames            | What moves          |
| :---------------- | :---------------- | :------------------ |
| pointer travel    | `quick` 8         | position only       |
| state recolour    | `instant` 4       | colour only         |
| lift active cells | `base` 12         | `translate` only    |
| code line move    | `quick` 8         | (overlaps recolour) |
| **read hold**     | `holdRead` 45     | **nothing**         |
| **step total**    | **≈ 69** (min 57) |                     |

Step counter in the Z1 title is mandatory — `Step k of n` — so a viewer who looks away can re-enter.
Final step: everything not `target` goes `excluded`, target goes `target`, hold `holdLand` (75).

### Beat 5 — MISCONCEPTION · target 45s (1350f)

```
 y=184  DAY 042 · BINARY SEARCH                         MISCONCEPTION
 y=280  ┌────────────────────────────────────────────────────────────┐
        │ ▌ ✗  "mid = (lo + hi) / 2 is always safe."                 │ Callout, wrong rail
 y=480  └────────────────────────────────────────────────────────────┘
 y=520  ┌── ArrayRow / Bars showing the WRONG model actually FAIL ───┐
        │   overflow value flashes `wrong`, index goes out of range   │
 y=800  └────────────────────────────────────────────────────────────┘
 y=824  ┌────────────────────────────────────────────────────────────┐
        │ ▌ ✓  lo + (hi − lo) / 2                                    │ Callout, right rail
 y=1024 └────────────────────────────────────────────────────────────┘
 y=1076 ══════════════════════════════════════════════════════════════
```

Order is fixed and non-negotiable: **state the wrong model → animate it breaking → then correct it.**
Showing the fix first destroys the effect. Minimum **`holdBeat` (60)** on the visible failure before
the ✓ callout appears — the learner needs to see it fail.

### Beat 6 — COMPLEXITY + PROBLEM SET · target 30s (900f)

```
 y=184  DAY 042 · BINARY SEARCH                            COMPLEXITY
 y=280  Halve the range each step  →  log₂(n) steps                 ← body 80
 y=420  ┌──────────────── 1120 × 280 ComplexityCard ────────────────┐
        │        TIME          │          SPACE                      │
        │        O(log n)      │          O(1)                       │  88 mono 700
 y=700  └───────────────────────────────────────────────────────────┘
 y=760  YOUR SET — 1 guided · 3 core · 2 stretch                    ← h2
 y=848  ┌ 6 chips, 168 × 72, gap 24, radius.pill ────────────────────┐
        │ (GUIDED)(CORE 1)(CORE 2)(CORE 3)(STRETCH 1)(STRETCH 2)     │
 y=920  └────────────────────────────────────────────────────────────┘
 y=1076 ████████████████████████████████████████████████████████████
```

Chip row width check: `6×168 + 5×24 = 1008 + 120 = 1128`, centred on `x=960` ✓
Guided chip uses `settled` colours; core chips `scanning`; stretch chips `comparing`.

### 8.7 Scene transitions

| Boundary                   | Transition                            | Frames          |
| :------------------------- | :------------------------------------ | :-------------- |
| Hook → Cold Open           | `fade()`                              | `transition` 15 |
| Cold Open → Predict        | `wipe({ direction: "from-right" })`   | 15              |
| Predict → Trace            | `fade()`                              | 15              |
| Trace → Misconception      | `slide({ direction: "from-bottom" })` | 15              |
| Misconception → Complexity | `fade()`                              | 15              |

**`TransitionSeries` shortens total duration** — overlapping transitions consume frames from both
neighbours. The master `calculateMetadata` must subtract `Σ getDurationInFrames({ fps })` across all
five transitions (5 × 15 = **75 frames**). Never hardcode the total.

---

## Part 9 — Frame budget

Target per day: **8–12 minutes** = 14,400–21,600 frames @ 30fps.

| Beat             | Target         | Frames            | Driven by      |
| :--------------- | :------------- | :---------------- | :------------- |
| Hook             | 0:20           | 600               | script         |
| Cold Open        | 0:50           | 1500              | script + trace |
| Predict          | 0:04           | **120 fixed**     | fixed          |
| Trace            | 5:00–8:00      | 9000–14400        | `steps × 69`   |
| Misconception    | 0:45           | 1350              | script         |
| Complexity + Set | 0:30           | 900               | script         |
| Transitions      | —              | **−75**           | 5 × 15         |
| **Total**        | **8:00–11:30** | **14,400–20,700** |                |

**Trace step ceiling:** `(14400 − 4470) / 69 ≈ 143`. Practically, cap a single trace at **60 steps**
(≈ 69s) and split anything longer into two trace beats with a `holdBeat` breath between them.

**Duration is measured, never guessed.** Every scene's `durationInFrames` comes from
`calculateMetadata` measuring `public/voiceover/Day{N}/{beat}.mp3` with
`getAudioDurationInSeconds`, then `Math.ceil(seconds * fps) + DUR.holdBeat` of tail. The master
sums the children and subtracts 75. A hardcoded total will desync narration the first time you
regenerate a voice line.

---

## Part 10 — Aspect variants

One rule: **every value in this document scales linearly by `k = width / 1920`.** Compute, never
re-eyeball.

| Variant              | Size      | `k`    | Safe x / y | Content   | Display | Body | Cell |
| :------------------- | :-------- | :----- | :--------- | :-------- | :------ | :--- | :--- |
| **Master (YouTube)** | 1920×1080 | 1.00   | 160 / 184  | 1600×712  | 152     | 80   | 128  |
| **Shorts / Reels**   | 1080×1920 | 0.5625 | 90 / 104   | 900×1712  | 88      | 48   | 88   |
| **Square**           | 1080×1080 | 0.5625 | 90 / 104   | 900×872   | 88      | 48   | 88   |
| **4K master**        | 3840×2160 | 2.00   | 320 / 368  | 3200×1424 | 304     | 160  | 256  |

Vertical-specific overrides (this is a re-layout, not a crop):

- Split layouts become **stacked**: visual on top, code below. Never side-by-side at 1080 wide.
- `ArrayRow` capacity drops to **5 cells** at 88px + 12 gap (`5×88 + 4×12 = 488`).
- `CodePane` becomes full content width (900), **8 lines** max, **28 chars** max.
- Grid becomes **6 columns** of 118px, gutter 32 (`6×118 + 5×32 = 708`)… ⚠️ that yields 868, not 900.
  Use **6 × 124 + 5 × 32 = 744 + 160 = 904** and side margins of **88**. Recompute, don't approximate.
- Progress rail moves to `y = 1920 − 44 = 1876` to clear platform UI chrome.
- **Shorts carry only Beats 1, 3, 4** (hook, predict, one short trace). Cold Open and the problem set
  are long-form only.

---

## Part 11 — The prompts

Five prompts. Run **P0 → P3 exactly once each**, then **P4 once per day**, then **P5** to sign off.
Each is written to be pasted verbatim.

### P0 — Bootstrap the repo (run once)

```
Set up the Remotion project for the Algora DSA course.

1. Install the official Remotion agent skills, then load /remotion-create:
     npx skills add remotion-dev/skills
2. Scaffold a Remotion project at ./video (TypeScript, blank template).
3. Add: @remotion/media @remotion/transitions @remotion/google-fonts
        @remotion/layout-utils @remotion/captions @remotion/install-whisper-cpp
4. Read prompt.md Parts 1-6 and remotion.md Parts 2 and 9 in this repo.
5. Create src/theme.ts and src/fonts.ts EXACTLY as written in prompt.md Part 6.
   Do not rename a token. Do not add a token. Do not change a number.
6. Create src/Root.tsx with one 1920x1080 @ 30fps composition per Part 10, and
   a <Folder> per day.
7. Verify every API you used against /remotion-docs. Report anything in prompt.md
   that does not match the installed Remotion version instead of silently adapting.

Do not build any scene yet. Do not create placeholder content.
```

### P1 — Build the design-system layer (run once)

```
Build the shared chrome and layout layer. Read prompt.md Parts 2, 3, 4, 5, 7.13.

Create:
  src/layout/Frame.tsx      - AbsoluteFill, canvas bg, font families, zone helpers
  src/layout/Zone.tsx       - <Zone name="stage"> positions children per Part 2.3
  src/chrome/DayBadge.tsx   - Part 7.13 exact
  src/chrome/BeatLabel.tsx  - Part 7.13 exact
  src/chrome/ProgressRail.tsx - Part 7.13 exact, master composition only
  src/chrome/Captions.tsx   - Part 7.13 exact

Hard requirements:
- Every colour from COLORS. Every size from TYPE. Every duration from DUR.
  A raw hex, a raw px font size, or a raw frame number in any file is a bug.
- All spacing from SP. All radii from RADIUS. All strokes from STROKE.
- Data elements use `outline`, never `border`.
- NUM spread onto every element that can show a digit.
- name= on every AbsoluteFill and Interactive.* element.
- Zero CSS keyframes, transitions, or Tailwind animate-* classes.

Then render one still of a Frame with all chrome visible at 1920x1080 and confirm:
badge at (160,184), rail at y=1076 height 4, nothing textual outside 160/184.
```

### P2 — Build the primitives (run once, one at a time)

```
Build src/dsa/{PRIMITIVE}.tsx to the spec in prompt.md Part 7.{N}.

Every number in that section is a requirement, not a suggestion: box sizes, gaps,
radii, stroke widths, capacity ladders, anchor coordinates, entrance timings.

Contract:
- Props are DATA ONLY: values, states, pointers, sizes. No animation props.
  The component derives all motion from useCurrentFrame().
- Import CellState from src/dsa/types.ts. Do not extend the seven states.
- Every interpolate() clamps both ends.
- Every scale animation passes output: 'perceptual-scale'.
- Ranges written as seconds * fps.
- Individual transform properties (scale, translate, rotate) in style. Never a
  transform string.
- name= on every element.
- Respect the capacity ladder: if n exceeds it, throw with a clear message rather
  than silently overflowing the safe area.

Deliver: the component, plus a Studio-only demo composition showing it in
idle / scanning / comparing / swapping / settled / excluded / target.
Render 3 stills and confirm total width against the ladder arithmetic.

Order: ArrayRow, Pointer, Bars, CodePane, DPTable, StackFrames, TreeView,
GraphView, RecursionTree, LinkedList, ComplexityCard, Callout.
```

### P3 — Build the narration + timing pipeline (run once)

```
Build the audio-driven timing pipeline. Read remotion.md Part 8 and prompt.md Part 9.

1. src/scripts/types.ts - a Script type: six beats, each { text, captions? }.
2. scripts/generate-voice.ts - Node script: reads src/scripts/day{N}.ts, calls the
   TTS provider, writes public/voiceover/Day{N}/{beat}.mp3. Skips existing files
   unless --force. Uses only env vars for credentials; never inlines a key.
3. scripts/generate-captions.ts - @remotion/install-whisper-cpp over each mp3,
   writes public/voiceover/Day{N}/{beat}.json in @remotion/captions format.
4. src/timing.ts - calculateMetadata helpers:
     - beatDuration(mp3): ceil(getAudioDurationInSeconds * fps) + DUR.holdBeat
     - masterDuration(beats): sum(beats) - 5 * DUR.transition
   Never return a hardcoded number.
5. src/dsa/Narration.tsx - <Audio> from @remotion/media + <Captions> bound to the
   json. Duck any background bed to 20% under narration using the volume callback.

Confirm: changing an mp3 changes durationInFrames with no code edit.
```

### P4 — Per-day video (the one you run 240 times)

Fill the five `{...}` slots from `roadmap.md` and Part 12's brief.

```
Build Day {N}: "{TOPIC}" from roadmap.md.

BEFORE WRITING CODE
1. Load /remotion-markup plus its timing.md and sequencing.md.
2. Load /remotion-docs and verify every prop you are not 100% certain about.
3. Read prompt.md Parts 7, 8, 9 and remotion.md Parts 2 and 9. Obey them.
4. Read the Day {N} entry in roadmap.md for the concept, the misconception, and
   the six-problem set.

STRUCTURE
- Six scenes, one file each, in src/days/Day{N}/:
    Hook.tsx  ColdOpen.tsx  Predict.tsx  Trace.tsx  Misconception.tsx  Complexity.tsx
- Each is its own <Composition> inside <Folder name="Day{N}-Scenes">, plus a
  Master.tsx using TransitionSeries per prompt.md Part 8.7.
- Inline every durationInFrames literal. Composition props are not variables.

THE TRACE (most important)
- Write src/dsa/traces/{topic}.ts as a PURE function returning Step[].
  Step = { states: CellStateMap; pointers: Record<string, number>;
           codeLine: number; note: string }
- Zero animation logic in the trace. Zero algorithm logic in the scene.
- Trace.tsx renders step k declaratively via <Series>, each Series.Sequence
  durationInFrames >= STEP_MIN (57). Budget per prompt.md Part 8 Beat 4.
- Z1 title shows "Step k of n" with tabular-nums.
- Cap at 60 steps; split into two trace beats if longer.

PIXELS
- Compose src/dsa/* primitives only. Do NOT create a new array, tree, graph, bar,
  or table visual. If a primitive is missing a capability, say so and stop.
- Every coordinate from prompt.md Part 8's wireframe for that beat.
- Predict beat: exactly 120 frames, with exactly 90 frames of dead air. Do not
  shorten it for pacing. It is the pedagogy.
- Misconception beat: wrong model first, animate it failing, hold >= 60 frames,
  then the correct callout. Never reorder.
- Complexity beat: derivation line first, hold, then the O() values.

RULES
- 1920x1080 @ 30fps. Two font families. Every number in mono with tabular-nums.
- Nothing textual outside 160/184. No shape outside 96/96.
- Duration from calculateMetadata over public/voiceover/Day{N}/*.mp3,
  minus 75 frames of transitions. Never hardcode a total.
- Seed all generated data with random('d{N}-...'). No Math.random, no Date.now.
- name= on every Sequence, Interactive.*, and media element.

THEN
- Run the prompt.md Part 13 checklist and report each line as pass or fail.
- Render one still per beat plus the trace midpoint. Report measured pixel
  positions of the day badge, the progress rail, and the widest data element.
```

### P5 — Review pass (run before every publish)

```
Review Day {N} against prompt.md Part 13. For each of the 30 items, answer
PASS / FAIL / N-A with the file and line number as evidence.

Then render stills at frames 0, 25%, 50%, 75%, and the last frame. For each still
report, in pixels:
  - leftmost and rightmost textual glyph  (must be within 160 .. 1760)
  - topmost and bottommost textual glyph  (must be within 184 .. 896)
  - widest data element total width        (must match its capacity ladder)
  - progress rail y and height             (must be 1076 and 4)

Fix only FAIL items. Do not "improve" anything that passes. Do not restyle.
```

---

## Part 12 — Per-day brief template

Fill this before running P4. Keep it in `briefs/day{N}.yml` so the whole course is auditable.

```yaml
day: 42
topic: "Binary Search on Answer"
track: A # A = core, B = optional advanced
phase: "Month 2 — Searching"

hook:
  failure: "You scanned 1,000,000 rows. You needed to scan 20."
  visual: Bars # Bars | ArrayRow | GraphView

cold_open:
  recall_day: 21
  recall_topic: "Two Pointers"
  problem: "Pair sum in a sorted array"
  visual: ArrayRow

predict:
  question: "What happens when lo and hi are adjacent?"
  # hold is ALWAYS 90 frames. Not configurable.

trace:
  primitive: ArrayRow # must exist in src/dsa/
  data: [4, 8, 15, 16, 23, 42, 50]
  target: 16
  pointers: [lo, hi, mid]
  code_lines: 7 # must be <= 14
  expected_steps: 4 # must be <= 60
  layout: split # split | full | tall

misconception:
  wrong: "mid = (lo + hi) / 2 is always safe."
  failure_mode: "integer overflow at large lo + hi"
  right: "lo + (hi - lo) / 2"

complexity:
  derivation: "halve the range each step → log₂(n) steps"
  time: "O(log n)"
  space: "O(1)"

problem_set: # 1 guided + 3 core + 2 stretch, per roadmap.md
  guided: "Classic binary search"
  core: ["First bad version", "Search insert position", "Sqrt(x)"]
  stretch: ["Koko eating bananas", "Split array largest sum"]

srs_cold_open_pool: [21, 16, 12] # days this video is eligible to be recalled from
```

---

## Part 13 — Acceptance checklist

Thirty items. A day does not publish until every line passes. Have the agent report evidence.

**Grid & safe area**

1. No textual glyph outside `x 160…1760` or `y 184…896`.
2. No shape outside `x 96…1824` or `y 96…984`.
3. Every element's x-position resolves to a 12-col grid position or a Part 8 coordinate.
4. Every spacing value is in the Part 2.4 scale.
5. Split layouts measure `160 + 888 + 96 + 616 + 160 = 1920`.

**Colour** 6. Zero raw hex literals outside `theme.ts`. 7. Every colour used exists in `COLORS`. 8. No eighth state introduced; `CellState` union unchanged. 9. Every state change pairs colour with lift, stroke change, pointer, or label. 10. No overridden background without its paired text token.

**Type** 11. Exactly two font families in the whole render. 12. Every size resolves to a `TYPE` token. 13. `tabular-nums` on every digit-bearing element. 14. `code` ≤ 14 lines and ≤ 42 chars per line. 15. `micro`/`label` used only as annotation attached to a data element.

**Motion** 16. Every duration resolves to a `DUR` token. 17. Every `interpolate` clamps both ends. 18. Every scale animation passes `output: 'perceptual-scale'`. 19. Individual transform props only — zero `transform:` strings. 20. Zero CSS keyframes / transitions / Tailwind `animate-*`. 21. Every trace step ≥ `STEP_MIN` (57 frames). 22. Predict beat = 120 frames with 90 frames of dead air. 23. Only position **or** state changes in any given 12-frame window.

**Architecture** 24. Algorithm lives in `traces/*.ts` as a pure function; scene renders step `k`. 25. Zero new array/tree/graph/bar/table visuals — primitives composed only. 26. `durationInFrames` from `calculateMetadata`; no hardcoded master total. 27. Transitions subtracted (75 frames) from the master duration. 28. All randomness via `random()` with a `d{N}-` seed. No `Math.random`, no `Date.now`. 29. `name=` on every `Sequence`, `Interactive.*`, and media element. 30. Two consecutive renders of the same composition are byte-identical.

**Pedagogy — from `roadmap.md`, and the reason the course exists** 31. Hook is a concrete failure, not a definition. 32. Misconception order is wrong → fail → right. 33. Complexity is derived on screen before the `O()` value appears. 34. The 6-problem set is on screen and matches `roadmap.md`.

---

## Part 14 — Provenance

- **Verified from Remotion sources** (see `remotion.md` Part 12 for URLs and fetch date): the safe-area
  floors, `perceptual-scale`, clamping behaviour, `outline` vs `border`, individual transform
  properties, `@remotion/media` component names, `Interactive.*`, `TransitionSeries` duration
  subtraction, `calculateMetadata`, `random()`, the CSS-animation prohibition.
- **Algora design decisions** (mine, not Remotion's, and therefore changeable by you): the Instrument
  Panel direction, all hex values, the 160/184 margins, the 12×104/32 grid, the five zones, the type
  scale, all `DUR` values, every primitive dimension, the six-beat wireframes, and the checklist.

Change a number here and it changes for all 240 videos — which is the entire point. Change it in a
video file and you have started a second design system.
