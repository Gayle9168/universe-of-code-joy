# remotion.md — Motion Graphics Production Guide for the Algora DSA Course

**Purpose:** the single file you paste into (or point) an AI coding agent at when it must generate
Remotion animation code for the 240-day DSA curriculum in `roadmap.md`.

**Status of the contents:** every API, flag, default and number in Parts 1–5 and Part 10 was read
directly from the official Remotion sources listed in Part 12 on **2026-08-06**, against Remotion
**v4.0.506** (the version stamped in the official Agent Skill files). Parts 6–9 are Algora-specific
patterns _built on top of_ those verified primitives — they are design decisions, not Remotion docs.

> Rule for the agent: if anything in this file conflicts with what `/remotion-docs` returns today,
> **the live docs win.** Do not guess an API. Fetch it.

---

## Part 0 — TL;DR for the agent

```bash
# 1. Install the official Remotion agent skills (do this once, in the repo)
npx skills add remotion-dev/skills

# 2. Scaffold the video project
npx create-video@latest --yes --blank --no-tailwind algora-videos
cd algora-videos && npm i

# 3. Add the packages this course needs
npx remotion add @remotion/transitions
npx remotion add @remotion/layout-utils
npx remotion add @remotion/google-fonts
npx remotion add @remotion/captions
npx remotion add @remotion/media

# 4. Work
npx remotion studio
npx remotion render <CompositionId>
```

Then: **always invoke `/remotion-markup` before writing scene code**, and `/remotion-docs` to
verify any prop you are not 100% sure about.

---

## Part 1 — The official Remotion Agent Skills (use these; do not hand-roll knowledge)

Remotion maintains first-party Agent Skills for exactly this use case. They are the authoritative
"best practice" source for AI agents and they are versioned with the library.

Install:

```bash
npx skills add remotion-dev/skills
```

Source: `https://www.remotion.dev/docs/ai/skills`
Repo: `https://github.com/remotion-dev/remotion/tree/main/packages/skills/skills`

### The 12 skills that actually exist (verified from the repo listing)

| Skill                      | What it covers                                                                                     | Use it for Algora when…                                |
| :------------------------- | :------------------------------------------------------------------------------------------------- | :----------------------------------------------------- |
| `/remotion-best-practices` | Umbrella skill; encompasses all others                                                             | You're unsure which to load. Load this first.          |
| `/remotion-create`         | New project / new composition scaffold + `video-layout.md`                                         | Starting the repo, adding a new day's composition      |
| `/remotion-markup`         | **The big one.** Compositions, animation, layout, typography, media, effects, audio, fonts, timing | **Every single scene you write.** Non-negotiable.      |
| `/remotion-docs`           | Search Remotion docs, fetch any page as Markdown                                                   | Before using any prop/API you can't recall exactly     |
| `/remotion-captions`       | Transcribing, displaying, animating captions                                                       | Burned-in subtitles for every DSA video                |
| `/remotion-render`         | Invoking a render to video or still                                                                | Batch-rendering the day's video, thumbnails            |
| `/remotion-interactivity`  | Making elements selectable/editable in Studio                                                      | So the teacher can tweak timings without touching code |
| `/remotion-studio`         | Studio-specific guidance                                                                           | Studio workflow issues                                 |
| `/remotion-upgrade`        | Upgrading Remotion + Mediabunny + skills                                                           | Monthly maintenance                                    |
| `/remotion-multimedia`     | Mediabunny; video/audio metadata (e.g. `getAudioDuration`)                                         | Measuring TTS audio length for dynamic durations       |
| `/remotion-maps`           | Map animations, GeoJSON, Mapbox/MapLibre/Cesium                                                    | Not needed for DSA. Skip.                              |
| `/remotion-saas`           | Architecture for Remotion-powered products                                                         | Only if you build a student-facing render service      |

### Sub-files inside `/remotion-markup` worth loading explicitly

`timing.md` · `sequencing.md` · `transitions.md` · `multi-scene-video.md` · `voiceover.md` ·
`calculate-metadata.md` · `measuring-text.md` · `text-highlights.md` · `effects.md` ·
`compositions.md` · `google-fonts.md` · `local-fonts.md` · `audio.md` · `sfx.md` · `images.md` ·
`measuring-dom-nodes.md` · `html-in-canvas.md` · `lottie.md` · `3d.md` · `parameters.md` ·
`video-editing.md` · `silence-detection.md` · `audio-visualization.md` · `light-leaks.md` ·
`cropping.md` · `gifs.md` · `embedding-videos.md` · `ffmpeg.md`

### Skill → DSA task routing table

| Day's content type                               | Load these skills                                                 |
| :----------------------------------------------- | :---------------------------------------------------------------- |
| Array / two-pointer / sliding window walkthrough | `/remotion-markup` + `timing.md` + `sequencing.md`                |
| Sorting algorithm (bars swapping)                | `/remotion-markup` + `timing.md` (spring easing)                  |
| Linked list / pointer rewiring                   | `/remotion-markup` + `measuring-dom-nodes.md`                     |
| Tree / graph traversal                           | `/remotion-markup` + `sequencing.md`                              |
| Recursion tree, DP table fill                    | `/remotion-markup` + `sequencing.md` + `measuring-text.md`        |
| Code-on-screen with line highlight               | `/remotion-markup` + `text-highlights.md` + `measuring-text.md`   |
| Multi-topic video with scene cuts                | `multi-scene-video.md` + `transitions.md`                         |
| AI narration + auto-length composition           | `voiceover.md` + `calculate-metadata.md` + `/remotion-multimedia` |
| Burned-in subtitles                              | `/remotion-captions`                                              |
| Batch render 240 videos                          | `/remotion-render` (+ Lambda, Part 10)                            |

### Docs are AI-native — exploit this

- Append `.md` to any docs URL: `remotion.dev/docs/spring.md` returns raw Markdown.
- Or send `Accept: text/markdown`.
- Or click "Copy as Markdown" on any docs page.
- Paste a bare Remotion docs link into an agent and it fetches Markdown automatically.

Source: `https://www.remotion.dev/docs/ai`

---

## Part 2 — The non-negotiable laws (violating these breaks renders)

These are the rules that cause the most AI-generated Remotion code to fail. They come from
`llms.txt`, `/remotion-markup`, and `docs/troubleshooting/css-animations`.

### Law 1 — All motion is a pure function of `useCurrentFrame()`

Remotion renders frames **independently and out of order**. Frame 30 may render before frame 10;
frame 50 may render twice. Anything that depends on wall-clock time is therefore wrong.

**Banned outright:**

- CSS `transition`
- CSS `animation` / `@keyframes`
- Tailwind animation classes (`animate-*`) — explicitly called out as needing refactor
- `setTimeout` / `setInterval` / `requestAnimationFrame`
- `Math.random()`
- Framer Motion, GSAP, AOS, react-spring, or any self-driving animation runtime
- `Date.now()`, `new Date()` for anything visual

**Symptom if you break it:** flickering, blank frames, animation frozen at frame 0 in the output
while looking fine in the browser.

```tsx
// ✅ Correct
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const FadeIn = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>Hello</AbsoluteFill>;
};
```

Source: `https://www.remotion.dev/docs/troubleshooting/css-animations`, `https://www.remotion.dev/docs/animating-properties`

### Law 2 — Determinism. Randomness comes from `random()`

```tsx
import { random } from "remotion";

// ✅ Returns a number 0..1, stable across every render pass
const jitter = random("day-42-node-3");

// ❌ Math.random() is forbidden by Remotion
```

For the DSA course: **seed every generated dataset with the day number** so the array in Day 34's
Quick Sort video is byte-identical on every re-render.

```tsx
const arr = Array.from({ length: 8 }, (_, i) => Math.round(random(`d34-arr-${i}`) * 90) + 10);
```

Source: `https://www.remotion.dev/llms.txt`

### Law 3 — Always clamp

`interpolate()` does **not** clamp by default; values shoot past the output range. Remotion's own
guidance is to add both clamps by default.

```tsx
interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

### Law 4 — Keep `interpolate()` inline in `style`, and use individual transform properties

This is a _Studio editability_ rule from `/remotion-markup`. Inline keyframes are visually editable;
extracted variables and `transform` strings become opaque computed values.

```tsx
// 👍 editable in Studio
style={{
  scale: interpolate(frame, [0, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
    output: "perceptual-scale",
  }),
  translate: interpolate(frame, [0, 100], ["0px 0px", "100px 100px"], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
  rotate: interpolate(frame, [0, 100], ["20deg", "90deg"], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
}}

// 👎 hidden from Studio's visual editor
const scale = interpolate(frame, [0, 100], [0, 1]);
style={{ transform: `scale(${scale})` }}
```

Use a `transform` string **only** when individual properties can't express it — `skew()`,
`perspective()`, or order-sensitive multi-transform chains.

### Law 5 — Name your layers

Pass `name` to `<AbsoluteFill>`, `<Sequence>`, `<Interactive.*>`, `<Audio>`, `<Video>`. It labels
the layer in the Studio timeline. With 240 videos and a non-programmer editing timings, this is the
difference between a usable project and an unusable one.

### Law 6 — Assets live in `public/`, referenced via `staticFile()`

```tsx
import { staticFile, CanvasImage } from "remotion";
import { Audio } from "@remotion/media";

<Audio src={staticFile("voiceover/day-042/scene-01.mp3")} name="VO 01" />
<CanvasImage src={staticFile("brand/algora-mark.png")} style={{ width: 120 }} />
```

Never `import logo from './logo.png'` for media. Never a bare relative path.

---

## Part 3 — Verified animation primitives

### `interpolate()`

```tsx
import { interpolate } from "remotion";

const v = interpolate(frame, [0, 100], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

Args: `(value, inputRange, outputRange, options?)`.

**Express ranges in seconds × fps, not magic frame numbers** — this is how the official skill writes
it, and it survives an fps change:

```tsx
const { fps } = useVideoConfig();
interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
  /* clamps */
});
```

**Multi-keyframe with per-segment easing.** For `n` keyframes pass `n - 1` easings:

```tsx
const opacity = interpolate(frame, [0, 1 * fps, 9 * fps, 10 * fps], [0, 1, 1, 0], {
  easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.spring({ damping: 200 })],
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

**Two options AI code almost always misses:**

- `output: 'perceptual-scale'` — **add this to every scale animation.** Linear scale output looks
  progressively slower as the element grows; this compensates.
- `posterize: 3` — samples only every 3rd frame, for a deliberate stop-motion look. Optional,
  stylistic.

Source: `https://www.remotion.dev/docs/interpolate`, `/remotion-markup/timing.md`

### `Easing`

| Easing                            | Use in DSA videos                                                                                               |
| :-------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| `Easing.bezier(0.16, 1, 0.3, 1)`  | **Default for all UI entrances.** Fast out, soft settle. This is the exact curve in the official example scene. |
| `Easing.spring({ damping: 200 })` | Firm push with no bounce — pointer moves, comparison highlights                                                 |
| `Easing.spring({ damping: 12 })`  | Deliberate bounce — a value landing in its sorted slot                                                          |
| `Easing.linear`                   | Hold segments, and metronomic loops only                                                                        |

### `spring()`

```tsx
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const value = spring({
  frame,
  fps,
  config: { damping: 200 },
});
```

Verified parameters and defaults:

| Param                      | Default | Meaning                                               |
| :------------------------- | :------ | :---------------------------------------------------- |
| `frame`                    | —       | Pass `useCurrentFrame()`. Pass `frame - 20` to delay. |
| `fps`                      | —       | Always from `useVideoConfig()`                        |
| `from`                     | `0`     | Start value                                           |
| `to`                       | `1`     | End value (may overshoot)                             |
| `config.mass`              | `1`     | Lower mass = faster                                   |
| `config.damping`           | `10`    | Higher = less bounce. `200` ≈ no bounce.              |
| `config.stiffness`         | `100`   | Bounciness                                            |
| `config.overshootClamping` | `false` | `true` clamps at `to`                                 |
| `durationInFrames`         | —       | Stretches the curve to an exact length                |
| `durationRestThreshold`    | —       | Only with `durationInFrames`                          |
| `delay`                    | —       | Frames to hold the initial value                      |
| `reverse`                  | `false` | Play backwards                                        |

**Order of operations (this trips people up):** `durationInFrames` stretch → `reverse` → `delay`.

Tune interactively at `https://www.remotion.dev/timing-editor`.

Source: `https://www.remotion.dev/docs/spring`

### `useVideoConfig()`

```tsx
const { fps, durationInFrames, width, height } = useVideoConfig();
```

Derive every layout number from `width`/`height`. Hardcode nothing that would break at 1080×1920
vertical (you will want Shorts cutdowns).

---

## Part 4 — Timeline structure

### Delay/trim props exist on nearly every component

`<AbsoluteFill>`, `<Interactive.*>`, `<Img>`, `<AnimatedImage>`, `<CanvasImage>`, `<HtmlInCanvas>`,
`<Solid>`, `<Sequence>` (all from `remotion`), `<Video>` and `<Audio>` (from `@remotion/media`),
`<Gif>` and more all accept:

| Prop                           | Meaning                                                                                                                  |
| :----------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `from`                         | Frame at which the element enters the timeline                                                                           |
| `durationInFrames`             | How long it stays mounted                                                                                                |
| `trimBefore`                   | Shifts the element's **internal clock** forward (children's `useCurrentFrame()` starts there; for media, trims the head) |
| `trimAfter`                    | Cuts the tail                                                                                                            |
| `premountFor` / `postmountFor` | Mount early/late to buffer media                                                                                         |

```tsx
<Interactive.Div from={1 * fps} durationInFrames={4 * fps} name="Step 1" />
<Video trimBefore={2 * fps} trimAfter={4 * fps} src={staticFile("clip.mp4")} />
```

### Critical: local frames inside a Sequence

```tsx
<Sequence from={60} durationInFrames={30} name="Step 3">
  <MyStep />
  {/* inside MyStep, useCurrentFrame() returns 0–29, NOT 60–89 */}
</Sequence>
```

This is the single most useful fact for DSA videos: **write each algorithm step as a component that
animates from frame 0**, then place it on the timeline with `from`. Steps become reorderable and
individually retimeable without touching their internals.

Also pass `layout="none"` when the Sequence should not impose its own flex layout.

### `<Series>` — back-to-back steps without manual arithmetic

```tsx
<Series>
  <Series.Sequence durationInFrames={20}>{/* frame 0 */}</Series.Sequence>
  <Series.Sequence durationInFrames={30}>{/* frame 20 */}</Series.Sequence>
  <Series.Sequence durationInFrames={30} offset={-8}>
    {/* frame 42 */}
  </Series.Sequence>
</Series>
```

`Series.Sequence` has no `from`; it has `offset` to nudge the start. **This is the right container
for an N-step algorithm trace** — insert a step and everything after it shifts automatically.

### `<TransitionSeries>` — scene cuts

```bash
npx remotion add @remotion/transitions
```

```tsx
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={4 * fps} name="Problem">
    <SceneProblem />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={springTiming({ config: { damping: 200 } })}
  />
  <TransitionSeries.Sequence durationInFrames={6 * fps} name="Trace">
    <SceneTrace />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={wipe()}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  <TransitionSeries.Sequence durationInFrames={5 * fps} name="Complexity">
    <SceneComplexity />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

Rules: `Transition` must sit **between** two `Sequence`s. `TransitionSeries.Sequence` has no
`offset`. Children are absolutely positioned.

There is also `<TransitionSeries.Overlay>` — renders an effect over the cut point **without**
shortening the timeline (a transition _does_ shorten it, because both scenes play at once).

**Transitions shorten total duration. Compute it correctly:**

```tsx
const timing1 = linearTiming({ durationInFrames: 15 });
const timing2 = linearTiming({ durationInFrames: 20 });

const total =
  60 +
  60 +
  60 -
  timing1.getDurationInFrames({ fps: 30 }) -
  timing2.getDurationInFrames({ fps: 30 }); // 145
```

### Multi-scene file structure (official pattern)

One file per scene, and **register each scene as its own `<Composition>` inside a `<Folder>`** in
addition to the master composition. Then double-clicking a sequence in the master jumps to that
scene's composition — the teacher can iterate on scene 4 in isolation.

```tsx
// src/Root.tsx
export const Root: React.FC = () => (
  <>
    <Folder name="Day042-Scenes">
      <Composition
        id="Day042-S1-Problem"
        component={SceneProblem}
        durationInFrames={4 * 30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Day042-S2-Trace"
        component={SceneTrace}
        durationInFrames={6 * 30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Day042-S3-Complexity"
        component={SceneComplexity}
        durationInFrames={5 * 30}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
    <Composition
      id="Day042"
      component={Day042}
      durationInFrames={15 * 30}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
```

**Inline the `durationInFrames` numbers even though it's redundant** — only inline literals are
editable in Studio.

### Composition defaults

`fps: 30`, `width: 1920`, `height: 1080`. `defaultProps` must match the component's props shape.

---

## Part 5 — Text, fonts, layout

### Fonts

```tsx
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});
```

Load fonts in **one shared module** and wait until ready before rendering. Local fonts:

```tsx
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

loadFont({ family: "Inter", url: staticFile("Inter-Regular.woff2"), weight: "500" });
```

From v2.2 Remotion auto-waits for CSS-imported Google Fonts. For manual `FontFace` loading, wrap in
`delayRender()` / `continueRender()`.

**Course typography:** exactly two families — a geometric sans for narration/headings, and a true
monospace (JetBrains Mono / IBM Plex Mono) for **all** code, array values, and complexity notation.
Never render code in a proportional font.

### Measuring and fitting text

```bash
npx remotion add @remotion/layout-utils
```

```tsx
import { measureText, fitText } from "@remotion/layout-utils";

const { width, height } = measureText({
  text: "Hello World",
  fontFamily: "Inter",
  fontSize: 32,
  fontWeight: "bold",
});

const { fontSize } = fitText({
  text: "Hello World",
  withinWidth: 600,
  fontFamily: "Inter",
  fontWeight: "bold",
});
```

Verified gotchas:

- **The font must be loaded before you call these.** With `@remotion/google-fonts`, await
  `waitUntilDone()` first.
- Use **`outline`, not `border`** — Remotion's default stylesheet sets `box-sizing: border-box`, so a
  border shrinks the container and corrupts the measurement.
- `validateFontIsLoaded` defaults to `true` in Remotion 5.0 and throws if the fallback font was used.
- Pass the **same** `fontFamily`/`fontWeight`/`letterSpacing`/`textTransform` to the element that you
  passed to `fitText()`, or the measurement is meaningless.
- Cap the result: `Math.min(80, fitText({...}).fontSize)`.
- `measureText()` results are cached.

Use this for variable-length content: node labels, complexity strings, generated array values.

### Video-first layout rules (official, verbatim numbers)

> You are designing a video, not a webpage.

- Decide what the viewer should notice first in each scene. Build the frame around that one thing.
- Safe area, for a **1080px-wide** composition: key text ≥ **80px** from the sides, ≥ **100px** from
  top and bottom.
- Minimum sizes at 1080px wide: **headline 84px**, **important supporting text 44px**.
- Scale all of the above linearly with composition width.
- Do not add redundant elements.

At **1920×1080**, that means: ~142px safe margin sides, ~178px top/bottom, headline ≥ ~149px,
supporting text ≥ ~78px. AI-generated Remotion scenes are almost always too small and too crowded —
this is the correction.

Source: `/remotion-create/video-layout.md`

### Media components (current API)

```tsx
import { Audio, Video } from "@remotion/media";
import { staticFile, CanvasImage, AnimatedImage } from "remotion";

<Video src={staticFile("clip.mp4")} style={{ opacity: 0.5 }} />
<Audio src={staticFile("vo.mp3")} volume={0.9} />
<CanvasImage src={staticFile("logo.png")} style={{ width: 100, height: 100 }} />
<AnimatedImage src={staticFile("nyancat.gif")} />
```

- `<Video>`/`<Audio>` from **`@remotion/media`** are the recommended components. During render they
  extract media via Mediabunny (not FFmpeg), keeping audio locked to the timeline.
- Static images: **`<CanvasImage>`**. Animated GIF/APNG/WebP/AVIF: **`<AnimatedImage>`** (use
  `@remotion/gif`'s `<Gif>` only if not on Chrome).
- `<Audio volume>` accepts a number **or a per-frame callback**:

```tsx
<Audio
  src={staticFile("vo.mp3")}
  volume={(f) => interpolate(f, [0, 30], [0, 1], { extrapolateLeft: "clamp" })}
/>
```

- Other useful `<Audio>` props: `playbackRate`, `loop`, `muted`, `toneFrequency` (0.01–2, **server
  render only**), `audioStreamIndex`, `showInTimeline`, `onError` (return `'fallback'` or `'fail'`).

Source: `https://www.remotion.dev/docs/media/audio`, `/remotion-markup/SKILL.md`

### Layering

```tsx
<AbsoluteFill name="Scene">
  <AbsoluteFill name="Backdrop" />
  <AbsoluteFill name="Foreground" /> {/* later = on top */}
</AbsoluteFill>
```

### Studio interactivity (`Interactive.*`)

`/remotion-markup` v4.0.506 wraps animated elements in `<Interactive.Div name="...">` so they are
selectable and editable in Studio.

```tsx
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const Title: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Scene"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <Interactive.Div
        name="Title"
        style={{
          fontSize: 88,
          opacity: interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Title
      </Interactive.Div>
    </AbsoluteFill>
  );
};
```

> **Version check:** `Interactive.*` is recent. Run `/remotion-docs` or check your installed
> `remotion` version. If your version doesn't export it, use a plain `div` — everything else in this
> file is unaffected.

---

## Part 6 — Algora scene grammar _(Algora design decisions, not Remotion docs)_

Every video in `roadmap.md` follows the same 6-beat structure. Encode it once; the AI fills content.

| Beat                | Length    | Content                                             | Ties to roadmap                     |
| :------------------ | :-------- | :-------------------------------------------------- | :---------------------------------- |
| 1. Hook             | 0:00–0:20 | The concrete failure case. No definitions.          | Principle: motivation-first         |
| 2. Cold Open        | 0:20–1:10 | The SRS retrieval problem from a topic ≥21 days old | Part B, spaced repetition           |
| 3. Predict          | —         | Question on screen, **hold 3s**, then reveal        | Principle #7, predict-before-reveal |
| 4. Trace            | bulk      | Frame-stepped execution of the algorithm            | The core visual                     |
| 5. Misconception    | 0:45      | The wrong mental model, animated failing            | Principle #8, misconception-first   |
| 6. Complexity + Set | 0:30      | Big-O derived on screen, then the 6-problem set     | Practice architecture               |

Standing rule: **one idea per frame**. If two things move for unrelated reasons at the same time,
split them into two `Series.Sequence` steps.

### The 3-second predict hold

```tsx
export const PredictBeat: React.FC<{ question: string }> = ({ question }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill name="Predict" style={{ justifyContent: "center", alignItems: "center" }}>
      <Interactive.Div
        name="Question"
        style={{
          fontSize: 96,
          textAlign: "center",
          maxWidth: "70%",
          opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {question}
      </Interactive.Div>
      {/* countdown ring: 3 full seconds of dead air. Do not shorten it. */}
      <Interactive.Div
        name="Countdown"
        style={{
          marginTop: 64,
          fontSize: 120,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {Math.max(0, 3 - Math.floor(frame / fps))}
      </Interactive.Div>
    </AbsoluteFill>
  );
};
```

---

## Part 7 — Reusable DSA primitive components _(Algora spec)_

Build these **once** in `src/dsa/`. Every one of the 240 videos composes them. Do not let the AI
reinvent an array visual per video — that is where inconsistency and render bugs come from.

```
src/
  index.ts                  # registerRoot(Root)
  Root.tsx                  # all compositions
  theme.ts                  # colors, spacing, fonts, safe-area helpers
  fonts.ts                  # loadFont() calls, exports fontFamily + waitUntilDone
  dsa/
    ArrayRow.tsx            # boxed cells, per-index state
    Pointer.tsx             # labeled caret that travels between indices
    Bars.tsx                # sorting bars, height = value
    LinkedList.tsx          # nodes + animated next-arrows
    TreeView.tsx            # positioned binary tree, node states
    GraphView.tsx           # nodes/edges, visit + relax states
    StackFrames.tsx         # call stack push/pop
    RecursionTree.tsx       # progressive reveal of a recursion tree
    DPTable.tsx             # grid, cell-by-cell fill with a formula callout
    CodePane.tsx            # monospace code + active-line highlight
    ComplexityCard.tsx      # time/space, derived not asserted
    Callout.tsx             # misconception ✗ / insight ✓
    Narration.tsx           # per-scene <Audio> + caption binding
```

### Shared state model

One vocabulary for every structure, so a viewer learns the color language once and it holds for 240
days:

```ts
export type CellState =
  | "idle" // neutral
  | "scanning" // being read this step
  | "comparing" // in the current comparison
  | "swapping" // mid-swap
  | "settled" // final position, done
  | "excluded" // eliminated from the search space
  | "target"; // the answer

export type CellStateMap = Record<number, CellState>;
```

### `ArrayRow` — reference implementation

Note every law applied: frame-driven, inline interpolate, individual transform props,
`perceptual-scale`, clamps, named layers, seconds×fps ranges.

```tsx
import { Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, MONO } from "../theme";
import type { CellState } from "./types";

export const ArrayRow: React.FC<{
  values: number[];
  states?: Record<number, CellState>;
  cellSize?: number;
  showIndices?: boolean;
  /** frames between each cell's entrance */
  stagger?: number;
}> = ({ values, states = {}, cellSize = 128, showIndices = true, stagger = 2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Interactive.Div name="ArrayRow" style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
      {values.map((value, i) => {
        const state = states[i] ?? "idle";
        const delay = i * stagger;

        return (
          <Interactive.Div
            key={i}
            name={`Cell ${i}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              // entrance: staggered pop-in
              opacity: interpolate(frame, [delay, delay + 0.3 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              scale: interpolate(frame, [delay, delay + 0.3 * fps], [0.8, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.spring({ damping: 200 }),
                output: "perceptual-scale",
              }),
            }}
          >
            <Interactive.Div
              name={`Box ${i}`}
              style={{
                width: cellSize,
                height: cellSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: MONO,
                fontSize: cellSize * 0.36,
                fontVariantNumeric: "tabular-nums",
                borderRadius: 12,
                // outline, NOT border — border shrinks the box (border-box)
                outline: `4px solid ${COLORS.stateStroke[state]}`,
                backgroundColor: COLORS.stateFill[state],
                color: COLORS.stateText[state],
                // lift the active cell
                translate: interpolate(
                  frame,
                  [delay, delay + 0.3 * fps],
                  ["0px 0px", state === "idle" ? "0px 0px" : "0px -16px"],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                ),
              }}
            >
              {value}
            </Interactive.Div>
            {showIndices && (
              <Interactive.Div
                name={`Index ${i}`}
                style={{
                  fontFamily: MONO,
                  fontSize: cellSize * 0.2,
                  color: COLORS.muted,
                }}
              >
                {i}
              </Interactive.Div>
            )}
          </Interactive.Div>
        );
      })}
    </Interactive.Div>
  );
};
```

### The step-driven trace pattern — the backbone of the whole course

Precompute the algorithm's execution as **data**, then render step _k_ declaratively. This is the
single most important architectural decision in the project:

- the algorithm is written once, in plain TS, and is testable
- no animation logic hides inside the algorithm
- steps become reorderable, retimeable, skippable
- the same trace array feeds the video _and_ the interactive web widget

```ts
// src/dsa/traces/binary-search.ts
export type BSStep = {
  lo: number;
  hi: number;
  mid: number;
  verdict: "too-low" | "too-high" | "found";
  say: string; // narration line for this step
};

export const traceBinarySearch = (arr: number[], target: number): BSStep[] => {
  const steps: BSStep[] = [];
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2); // overflow-safe form — say this out loud
    if (arr[mid] === target) {
      steps.push({ lo, hi, mid, verdict: "found", say: `arr[${mid}] is ${target}. Found it.` });
      break;
    }
    if (arr[mid] < target) {
      steps.push({
        lo,
        hi,
        mid,
        verdict: "too-low",
        say: `${arr[mid]} is below ${target}. Discard the left half.`,
      });
      lo = mid + 1;
    } else {
      steps.push({
        lo,
        hi,
        mid,
        verdict: "too-high",
        say: `${arr[mid]} is above ${target}. Discard the right half.`,
      });
      hi = mid - 1;
    }
  }
  return steps;
};
```

```tsx
// src/dsa/scenes/BinarySearchTrace.tsx
import { Series, useVideoConfig } from "remotion";
import { ArrayRow } from "../ArrayRow";
import { Pointer } from "../Pointer";
import type { BSStep, CellState } from "../types";

const statesForStep = (len: number, s: BSStep): Record<number, CellState> => {
  const map: Record<number, CellState> = {};
  for (let i = 0; i < len; i++) {
    map[i] = i < s.lo || i > s.hi ? "excluded" : "idle";
  }
  map[s.mid] = s.verdict === "found" ? "target" : "comparing";
  return map;
};

export const BinarySearchTrace: React.FC<{
  values: number[];
  steps: BSStep[];
  secondsPerStep?: number;
}> = ({ values, steps, secondsPerStep = 2.5 }) => {
  const { fps } = useVideoConfig();

  return (
    <Series>
      {steps.map((step, k) => (
        <Series.Sequence
          key={k}
          durationInFrames={Math.round(secondsPerStep * fps)}
          name={`Step ${k + 1}: ${step.verdict}`}
        >
          {/* each step animates from its own local frame 0 */}
          <ArrayRow values={values} states={statesForStep(values.length, step)} />
          <Pointer index={step.lo} label="lo" />
          <Pointer index={step.hi} label="hi" />
          <Pointer index={step.mid} label="mid" emphasis />
        </Series.Sequence>
      ))}
    </Series>
  );
};
```

Every topic in `roadmap.md` gets a `traces/<topic>.ts` + a scene that renders it. Sorting, BFS/DFS,
Dijkstra, DP fills, recursion trees — all the same shape.

### `CodePane` — line highlighting

Drive the active line from the step index; never from a timer. Load `text-highlights.md` from
`/remotion-markup` before implementing, and `measuring-text.md` if you need exact line geometry
rather than a fixed `lineHeight`.

### `DPTable` and the 5-slot template

`roadmap.md` mandates that every DP video shows the same 5-slot state template on screen. Make it a
component with a hard-coded slot list so it is literally impossible to skip a slot:

```tsx
const DP_SLOTS = [
  "1. What varies? → state",
  "2. Choices at a state → transitions",
  "3. Base cases",
  "4. Order of computation",
  "5. Space reduction",
] as const;
```

---

## Part 8 — AI narration pipeline

This is the official `voiceover.md` workflow, applied to the course.

### Step 1 — Script as data, one file per day

```ts
// scripts/scripts/day-042.ts
export const day042 = {
  id: "Day042",
  title: "Binary Search on the Answer",
  scenes: [
    { id: "s1-hook", say: "You can binary search things that aren't arrays." },
    { id: "s2-coldopen", say: "First, a problem from three weeks ago." },
    { id: "s3-predict", say: "Pause. What is the smallest capacity that works?" },
    { id: "s4-trace", say: "We search the space of answers, not the space of items." },
    { id: "s5-misconcept", say: "The common error: binary searching an unsorted input." },
    { id: "s6-complexity", say: "Log of the answer range, times the cost of one check." },
  ],
} as const;
```

### Step 2 — Generate audio with ElevenLabs into `public/`

ElevenLabs is the provider the official skill recommends; any TTS that emits an audio file works.
Requires `ELEVENLABS_API_KEY`.

```ts
// scripts/generate-voiceover.ts
import { writeFileSync, mkdirSync } from "node:fs";
import { day042 as script } from "./scripts/day-042";

const voiceId = process.env.ELEVENLABS_VOICE_ID!;
const outDir = `public/voiceover/${script.id}`;
mkdirSync(outDir, { recursive: true });

for (const scene of script.scenes) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: scene.say,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3 },
    }),
  });

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(`${outDir}/${scene.id}.mp3`, audioBuffer);
}
```

Run it:

```bash
node --strip-types scripts/generate-voiceover.ts
```

**Pin the voice ID and model for all 240 videos.** A voice change mid-course is jarring and there is
no way to re-render old episodes cheaply.

### Step 3 — Let the audio decide the timeline, via `calculateMetadata`

Do **not** guess `durationInFrames`. Measure the audio and size the composition to it.

```tsx
import { CalculateMetadataFunction, staticFile } from "remotion";
import { getAudioDuration } from "./get-audio-duration"; // see /remotion-multimedia

const FPS = 30;

const SCENE_AUDIO_FILES = [
  "voiceover/Day042/s1-hook.mp3",
  "voiceover/Day042/s2-coldopen.mp3",
  "voiceover/Day042/s3-predict.mp3",
  "voiceover/Day042/s4-trace.mp3",
  "voiceover/Day042/s5-misconcept.mp3",
  "voiceover/Day042/s6-complexity.mp3",
];

export const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const durations = await Promise.all(
    SCENE_AUDIO_FILES.map((f) => getAudioDuration(staticFile(f))),
  );

  // pad each scene so visuals breathe past the last word
  const sceneDurations = durations.map((sec) => Math.ceil(sec * FPS) + Math.round(0.6 * FPS));

  return {
    durationInFrames: sceneDurations.reduce((a, b) => a + b, 0),
    props: { ...props, voiceover: { sceneDurations } },
    defaultCodec: "h264",
    defaultOutName: props.dayId,
  };
};
```

Pass `sceneDurations` into the component as a prop so scenes know their own length.

**If you use `<TransitionSeries>`, subtract every transition's
`timing.getDurationInFrames({ fps })` from the total** (Part 4) or the tail gets cut off.

`calculateMetadata` facts worth knowing: it runs **once**, independent of render concurrency, in a
separate tab; it may be `async`; it must return JSON-serializable values (plus `Date`, `Map`, `Set`,
`staticFile()`); it re-runs whenever props change in Studio; it must resolve within the
`delayRender()` timeout; it also sets `defaultCodec`, `defaultOutName`,
`defaultVideoImageFormat`, `defaultPixelFormat`, `defaultProResProfile`, `defaultSampleRate`.

### Step 4 — Captions

```ts
import type { Caption } from "@remotion/captions";

type Caption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
};
```

All captions are processed as JSON in this exact shape. Then:

- **Transcribe** → load `/remotion-captions` → `transcribe-captions.md` (word-level timings via
  `@remotion/install-whisper-cpp`)
- **Display** → `display-captions.md`
- **Import `.srt`** → `import-srt-captions.md`

Do not hand-roll caption timing. Load the skill.

**Accessibility requirement for this course:** burn in captions on every video. A large share of the
audience studies with sound off, and DSA narration is dense with symbols.

### Step 5 — Ducking under narration

```tsx
<Audio
  src={staticFile("music/bed.mp3")}
  name="Music bed"
  volume={(f) =>
    interpolate(f, [0, 0.5 * fps], [0.35, 0.08], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  }
/>
```

---

## Part 9 — Anti-patterns checklist

Run this list against every AI-generated scene before committing.

| #   | Anti-pattern                                                | Fix                                                       |
| :-- | :---------------------------------------------------------- | :-------------------------------------------------------- |
| 1   | CSS `transition` / `animation` / `@keyframes`               | Drive from `useCurrentFrame()`                            |
| 2   | Tailwind `animate-*` class                                  | Same — explicitly flagged as broken by the official skill |
| 3   | `setTimeout` / `setInterval` / rAF                          | Same                                                      |
| 4   | Framer Motion / GSAP / react-spring                         | Remove entirely                                           |
| 5   | `Math.random()`                                             | `random('stable-seed')`                                   |
| 6   | `interpolate()` with no clamps                              | Add `extrapolateLeft` + `extrapolateRight: 'clamp'`       |
| 7   | Scale animated without `output: 'perceptual-scale'`         | Add it                                                    |
| 8   | `transform: \`scale(${x})\``                                | Use the `scale` / `translate` / `rotate` properties       |
| 9   | `interpolate()` extracted to a variable                     | Inline it in `style` for Studio editability               |
| 10  | Magic frame numbers (`[0, 47]`)                             | `[0, 1.5 * fps]`                                          |
| 11  | Guessed `durationInFrames` with narration                   | `calculateMetadata` + measured audio                      |
| 12  | `TransitionSeries` duration not reduced by transitions      | Subtract `getDurationInFrames({ fps })`                   |
| 13  | `border` on a measured text box                             | Use `outline`                                             |
| 14  | `fitText`/`measureText` before font load                    | Await `waitUntilDone()`                                   |
| 15  | Body text below the 44px-at-1080 floor                      | Scale up                                                  |
| 16  | Content inside the safe margin                              | 80px sides / 100px top-bottom at 1080 wide                |
| 17  | Unnamed layers                                              | Add `name` to every Sequence / Interactive / media        |
| 18  | Relative asset paths or bundler imports for media           | `staticFile()` from `public/`                             |
| 19  | `<Img>`/`<img>` for statics; `<OffthreadVideo>` reflexively | `<CanvasImage>`; `<Video>` from `@remotion/media`         |
| 20  | Animation logic tangled inside the algorithm                | Precompute a trace array (Part 7)                         |
| 21  | Three things moving at once                                 | One idea per frame; split into steps                      |
| 22  | Code shown in a proportional font                           | Monospace, always                                         |
| 23  | `toneFrequency` expected to work in preview                 | Server-side render only                                   |
| 24  | Data regenerated per render                                 | Seed with the day number                                  |

---

## Part 10 — Rendering

### Local

```bash
npx remotion studio                 # preview + visual editing
npx remotion render Day042          # video
npx remotion still Day042           # thumbnail
```

### Batch the whole course

```bash
for d in $(seq -w 1 240); do npx remotion render "Day$d" "out/day-$d.mp4"; done
```

### Lambda (240 videos locally will not be fun)

Complete the setup at `https://www.remotion.dev/docs/lambda/setup`, then:

```bash
npx remotion lambda functions deploy
npx remotion lambda sites create
npx remotion lambda render <serve-url> Day042
```

Node APIs: `deployFunction()`, `bundle()` + `deploySiteFromBundle()`, `renderMediaOnLambda()`, and
poll with `getRenderProgress()`.

### Verification loop (do this, don't skip it)

1. `npx remotion still <Id> --frame=<n>` at the start, middle and end of each scene.
2. Render **one full video** before batching — flicker only appears in a real render, never in
   preview.
3. If frames flicker or freeze, you broke Law 1. Grep for `transition`, `animation`, `setTimeout`,
   `Math.random`, `animate-`.
4. Check the safe area on the stills at 100% zoom.
5. Watch once at 0.5× to catch two-things-moving-at-once.

---

## Part 11 — Prompt template for per-video generation

Paste this per day. It forces the agent through the skills instead of improvising.

```
Build the Remotion composition for Day {N}: "{TOPIC}" from roadmap.md.

Before writing code:
1. Load /remotion-markup, plus timing.md and sequencing.md.
2. Load /remotion-docs and verify every prop you use that you are not certain about.
3. Read remotion.md Parts 2, 6, 7, 9 in this repo and obey them.

Requirements:
- Reuse src/dsa/* primitives. Do not create a new array/tree/graph visual.
- Write the algorithm as a pure trace function in src/dsa/traces/{topic}.ts returning a step array.
  The scene renders step k declaratively via <Series>. No animation logic in the algorithm.
- Six scenes, one file each, per the Part 6 beat structure: hook, cold-open, predict (3s hold),
  trace, misconception, complexity + problem set.
- Register each scene as its own <Composition> inside <Folder name="Day{N}-Scenes">, plus the
  master composition. Inline all durationInFrames literals.
- Duration comes from calculateMetadata measuring public/voiceover/Day{N}/*.mp3. Subtract transition
  durations. Never hardcode a total.
- name= on every Sequence, Interactive.* and media element.
- Seed all generated data with random('d{N}-...').
- 1920x1080 @ 30fps. Headline >= 149px, supporting text >= 78px, safe margins 142px / 178px.
- Two font families max. All code and numeric values in monospace with tabular-nums.

Then: run the Part 9 checklist, render one still per scene, and report which anti-patterns you
checked.
```

---

## Part 12 — Sources

All fetched **2026-08-06**. Remotion skills version **4.0.506**.

**Official Agent Skills (primary source — versioned with the library)**

- `https://www.remotion.dev/docs/ai/skills`
- `https://github.com/remotion-dev/remotion/tree/main/packages/skills/skills`
- `packages/skills/skills/remotion-markup/SKILL.md` — general rules, `Interactive.*`, media components, delay/trim props
- `packages/skills/skills/remotion-markup/timing.md` — `Easing`, `perceptual-scale`, `posterize`, multi-keyframe easing arrays
- `packages/skills/skills/remotion-markup/sequencing.md` — `Sequence`, `Series`, local frames, nesting
- `packages/skills/skills/remotion-markup/transitions.md` — `TransitionSeries`, `Overlay`, total-duration math
- `packages/skills/skills/remotion-markup/multi-scene-video.md` — scene-per-file, `Folder` registration
- `packages/skills/skills/remotion-markup/voiceover.md` — ElevenLabs TTS + `calculateMetadata`
- `packages/skills/skills/remotion-markup/measuring-text.md` — `measureText`, `fitText`
- `packages/skills/skills/remotion-create/SKILL.md` — scaffold command
- `packages/skills/skills/remotion-create/video-layout.md` — safe area and minimum type sizes
- `packages/skills/skills/remotion-captions/SKILL.md` — `Caption` type, sub-file routing

**Official docs**

- `https://www.remotion.dev/llms.txt` — canonical LLM system prompt
- `https://www.remotion.dev/docs/ai` and `/docs/ai/system-prompt`
- `https://www.remotion.dev/docs/animating-properties`
- `https://www.remotion.dev/docs/troubleshooting/css-animations`
- `https://www.remotion.dev/docs/spring`
- `https://www.remotion.dev/docs/calculate-metadata`
- `https://www.remotion.dev/docs/layout-utils` and `/docs/layout-utils/fit-text`
- `https://www.remotion.dev/docs/fonts`
- `https://www.remotion.dev/docs/media/audio`
- `https://www.remotion.dev/docs/lambda/setup`
- `https://www.remotion.dev/timing-editor` — interactive easing tuner

**Maintenance:** re-run `/remotion-upgrade` monthly and re-verify Parts 3–5 against the refreshed
skill files. `Interactive.*`, `<CanvasImage>`, `<AnimatedImage>` and the `@remotion/media`
components are recent additions — they are the parts most likely to have changed.
