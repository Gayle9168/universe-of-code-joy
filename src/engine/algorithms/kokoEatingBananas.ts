import { StepBuilder } from "@/engine/builder";
import { parseNumberList } from "@/engine/algorithms/binarySearch";
import type {
  AlgorithmModule,
  AlgorithmRun,
  ArrayFrame,
  AuxPanel,
  CellState,
  CodeLineMap,
  ValidationResult,
} from "@/engine/types";

/**
 * The searched axis is 1..max(piles) — candidate *speeds*, not the piles. The
 * piles are input, and they never move; what narrows is the range of answers
 * still worth trying.
 *
 * `hoursNeeded` is left as a named call rather than spelled out as pseudocode
 * lines. Its body is already on screen: the piles panel shows ceil(pile / k) for
 * every pile and the sum, updated on each probe. Emitting a frame per pile would
 * multiply the step count by the pile count to show what one panel already shows.
 */
const PSEUDOCODE: string[] = [
  "function minEatingSpeed(piles, h)",
  "  lo <- 1",
  "  hi <- max(piles)",
  "  while lo < hi",
  "    mid <- floor((lo + hi) / 2)",
  "    if hoursNeeded(piles, mid) <= h",
  "      hi <- mid",
  "    else",
  "      lo <- mid + 1",
  "  return lo",
];

const CODE_BY_LANG: Record<"js" | "ts" | "py", string[]> = {
  js: [
    "function minEatingSpeed(piles, h) {",
    "  const hoursNeeded = (k) =>",
    "    piles.reduce((sum, pile) => sum + Math.ceil(pile / k), 0);",
    "  let lo = 1;",
    "  let hi = Math.max(...piles);",
    "  while (lo < hi) {",
    "    const mid = Math.floor((lo + hi) / 2);",
    "    if (hoursNeeded(mid) <= h) {",
    "      hi = mid;",
    "    } else {",
    "      lo = mid + 1;",
    "    }",
    "  }",
    "  return lo;",
    "}",
  ],
  ts: [
    "function minEatingSpeed(piles: number[], h: number): number {",
    "  const hoursNeeded = (k: number): number =>",
    "    piles.reduce((sum, pile) => sum + Math.ceil(pile / k), 0);",
    "  let lo = 1;",
    "  let hi = Math.max(...piles);",
    "  while (lo < hi) {",
    "    const mid = Math.floor((lo + hi) / 2);",
    "    if (hoursNeeded(mid) <= h) {",
    "      hi = mid;",
    "    } else {",
    "      lo = mid + 1;",
    "    }",
    "  }",
    "  return lo;",
    "}",
  ],
  py: [
    "def min_eating_speed(piles, h):",
    "    def hours_needed(k):",
    "        return sum((pile + k - 1) // k for pile in piles)",
    "    lo = 1",
    "    hi = max(piles)",
    "    while lo < hi:",
    "        mid = (lo + hi) // 2",
    "        if hours_needed(mid) <= h:",
    "            hi = mid",
    "        else:",
    "            lo = mid + 1",
    "    return lo",
  ],
};

/**
 * All three languages drift here, unlike the rest of this family: every listing
 * carries a `hoursNeeded` helper the 10-line pseudocode states as a single call.
 */
const CODE_MAP: CodeLineMap = {
  js: [1, 4, 5, 6, 7, 8, 9, 10, 11, 14],
  ts: [1, 4, 5, 6, 7, 8, 9, 10, 11, 14],
  py: [1, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};

const plural = (count: number, word: string): string => `${count} ${word}${count === 1 ? "" : "s"}`;

/**
 * A speed, said the way a person would. Every narration that names one goes
 * through here — "1 bananas an hour" is reachable three separate ways (a max pile
 * of 1, a probe at the very bottom of the axis, and an answer of 1 whenever the
 * budget is generous), so spelling it inline invites the same slip three times.
 */
const speedPhrase = (k: number): string => `${k} ${k === 1 ? "banana" : "bananas"} an hour`;

/** Hours to clear each pile at `k` bananas an hour — one whole hour per partial pile. */
function hoursPerPile(piles: number[], k: number): number[] {
  return piles.map((pile) => Math.ceil(pile / k));
}

const sum = (xs: number[]): number => xs.reduce((total, x) => total + x, 0);

function windowLabel(lo: number, hi: number, previous?: number): string {
  const size = Math.max(0, hi - lo + 1);
  if (previous !== undefined && previous !== size) {
    return `answer is in here · ${previous} → ${plural(size, "speed")}`;
  }
  return `answer is in here · ${plural(size, "speed")}`;
}

/**
 * The piles beside the axis, with what each costs at `k`. Emitted on every step —
 * `k` of null renders the piles with dashes rather than dropping the panel, so it
 * does not appear and disappear between steps and shift the canvas beside it.
 */
function pilesPanel(piles: number[], h: number, k: number | null): AuxPanel {
  const per = k === null ? null : hoursPerPile(piles, k);
  const rows = piles.map((pile, i) => ({
    id: `pile-${i}`,
    item: `${pile} ${pile === 1 ? "banana" : "bananas"}`,
    cost: per ? `${per[i]!} h` : "—",
  }));
  if (per === null) return { kind: "cost", label: "Piles", rows };
  const total = sum(per);
  return {
    kind: "cost",
    label: `Piles at ${k}/hour`,
    rows,
    total: { label: "hours needed", value: `${total} h`, budget: `${h} h`, ok: total <= h },
  };
}

interface FrameSpec {
  /** Speeds, not indexes — the view is handed `speed - 1`. */
  lo: number;
  hi: number;
  mid: number | null;
  showMidMath?: boolean;
  survivor?: { from: number; to: number };
  found?: number;
  label: string;
}

/**
 * Every cell is a candidate answer, so the two ruled-out sides are opposites and
 * get their own states — the same split first-bad-version makes, for the same
 * reason. Below `lo` a speed was measured and missed the deadline; above `hi` a
 * speed would finish in time but is not the *slowest* that does.
 *
 * `survivor` is applied after `mid` so membership decides whether the probed speed
 * lives: `hi <- mid` keeps it, `lo <- mid + 1` does not.
 */
function frameFor(speeds: number[], spec: FrameSpec): ArrayFrame {
  const { lo, hi, mid, showMidMath, survivor, found, label } = spec;
  const n = speeds.length;
  const at = (speed: number): number => speed - 1;
  const states: Record<number, CellState> = {};
  for (let i = 0; i < n; i += 1) {
    states[i] = i < at(lo) ? "excluded" : i > at(hi) ? "visited" : "idle";
  }
  if (mid !== null) states[at(mid)] = "compare";
  if (survivor) {
    const from = Math.max(0, at(survivor.from));
    const to = Math.min(n - 1, at(survivor.to));
    for (let i = from; i <= to; i += 1) states[i] = "frontier";
  }
  if (found !== undefined) states[at(found)] = "found";

  const pointers: ArrayFrame["pointers"] = [
    { name: "lo", index: at(lo) },
    { name: "hi", index: at(hi) },
  ];
  if (mid !== null) {
    pointers.push({
      name: "mid",
      index: at(mid),
      color: "accent",
      // Speeds, not indexes: the cell's own value is the speed, so the two agree.
      ...(showMidMath ? { note: `(${lo} + ${hi}) / 2 = ${mid}` } : {}),
    });
  }

  return {
    kind: "array",
    values: [...speeds],
    states,
    pointers,
    pointerNotes: true,
    ranges: lo <= hi ? [{ from: at(lo), to: at(hi), label, tone: "tint" }] : [],
  };
}

function run(parsed: Record<string, unknown>): AlgorithmRun {
  const piles = parsed["piles"] as number[];
  const h = parsed["h"] as number;
  const fastest = Math.max(...piles);
  // The axis IS the answer range. Index i holds speed i + 1.
  const speeds = Array.from({ length: fastest }, (_, i) => i + 1);
  const totalBananas = sum(piles);

  const b = new StepBuilder(PSEUDOCODE, CODE_BY_LANG, CODE_MAP);
  let lo = 1;
  let hi = fastest;
  let probes = 0;

  b.bump("probes", 0);
  b.bump("pile divisions", 0);
  b.bump("linear worst", fastest);

  b.emit({
    frame: frameFor(speeds, { lo, hi, mid: null, label: windowLabel(lo, hi) }),
    aux: [pilesPanel(piles, h, null)],
    codeLine: 3,
    narration: `Find the slowest speed that clears ${plural(totalBananas, "banana")} within ${plural(h, "hour")}.`,
    detail: `Nothing here searches the piles — the row above is every speed worth trying, 1 to ${fastest}, and that is what gets halved. It works because the answer is monotone: if ${speedPhrase(fastest)} finishes in time then so does anything faster, and if a speed is too slow then so is every speed below it. That yes/no split is the only thing binary search needs, and it does not care that the values being searched are answers rather than data. The upper end is max(piles) because a speed above it eats no faster — one pile still takes one whole hour.`,
    phase: "setup",
    isMilestone: true,
  });

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const size = hi - lo + 1;
    probes += 1;
    b.bump("probes");

    b.emit({
      frame: frameFor(speeds, { lo, hi, mid, showMidMath: true, label: windowLabel(lo, hi) }),
      aux: [pilesPanel(piles, h, null)],
      codeLine: 5,
      narration:
        // A window of two puts mid on lo, so there is no middle to speak of.
        size === 2
          ? `Try ${speedPhrase(mid)}, the lower of the last two speeds in play.`
          : `Try ${speedPhrase(mid)}, the middle of the ${plural(size, "speed")} still in play.`,
      detail: `mid = floor((lo + hi) / 2) = floor((${lo} + ${hi}) / 2) = ${mid}. Unlike its sibling questions, answering "is this the one?" is not a lookup — it costs a pass over all ${plural(piles.length, "pile")}.`,
      phase: "probe",
      isMilestone: true,
    });

    const per = hoursPerPile(piles, mid);
    const needed = sum(per);
    const fastEnough = needed <= h;
    b.bump("pile divisions", piles.length);

    const nextLo = fastEnough ? lo : mid + 1;
    const nextHi = fastEnough ? mid : hi;
    const remaining = nextHi - nextLo + 1;

    b.emit({
      frame: frameFor(speeds, {
        lo,
        hi,
        mid,
        showMidMath: true,
        survivor: { from: nextLo, to: nextHi },
        label: windowLabel(lo, hi),
      }),
      aux: [pilesPanel(piles, h, mid)],
      codeLine: 6,
      narration: fastEnough
        ? `${per.join(" + ")} = ${plural(needed, "hour")}, within ${h} — so ${mid} works.`
        : `${per.join(" + ")} = ${plural(needed, "hour")}, over ${h} — so ${mid} is too slow.`,
      detail: fastEnough
        ? `Each pile costs ceil(pile / ${mid}) hours, because a leftover of even one banana still occupies a whole hour — ${piles.map((p, i) => `ceil(${p}/${mid}) = ${per[i]!}`).join(", ")}. ${mid} finishing in time makes every speed above it finish in time too, so none of them can be the slowest answer.`
        : `Each pile costs ceil(pile / ${mid}) hours, a leftover banana still costing a whole hour — ${piles.map((p, i) => `ceil(${p}/${mid}) = ${per[i]!}`).join(", ")}. ${mid} missing the deadline means every slower speed misses it by more, so the whole lower stretch goes at once.`,
      phase: fastEnough ? "in-time" : "too-slow",
    });

    b.emit({
      frame: frameFor(speeds, {
        lo: nextLo,
        hi: nextHi,
        mid: null,
        label: windowLabel(nextLo, nextHi, size),
      }),
      codeLine: fastEnough ? 7 : 9,
      aux: [pilesPanel(piles, h, mid)],
      narration: fastEnough
        ? `hi drops to ${nextHi} — keeping ${mid} itself, since it may be the slowest that works.`
        : /* mid = lo whenever the window is exactly two wide, and then there is no
             stretch below mid to sweep away with it — only mid itself. */
          mid === lo
          ? `lo moves to ${nextLo}: ${mid} was the last speed below, and it is out.`
          : `lo moves to ${nextLo}: ${mid} and every speed under it are ruled out together.`,
      detail: fastEnough
        ? `hi <- mid, not mid - 1: ${mid} is the best answer found so far, so discarding it could discard the answer. ${plural(size, "speed")} → ${remaining}.`
        : mid === lo
          ? `lo <- mid + 1 is safe precisely because ${mid} failed — a failing speed is never the answer. With mid sitting on lo there is no half beneath it, so this step discards a single speed rather than a stretch. ${plural(size, "speed")} → ${remaining}.`
          : `lo <- mid + 1 is safe precisely because ${mid} failed — a failing speed is never the answer, so it goes with the half below it. ${plural(size, "speed")} → ${remaining}.`,
      phase: fastEnough ? "narrow-left" : "narrow-right",
      isMilestone: true,
    });

    lo = nextLo;
    hi = nextHi;
  }

  const answer = lo;
  const finalPer = hoursPerPile(piles, answer);
  const finalHours = sum(finalPer);
  b.emit({
    frame: frameFor(speeds, { lo, hi, mid: null, found: answer, label: windowLabel(lo, hi) }),
    aux: [pilesPanel(piles, h, answer)],
    codeLine: 10,
    narration:
      probes === 0
        ? `Every pile holds one banana, so 1 an hour is the only speed there is.`
        : `${speedPhrase(answer)} is the slowest speed that finishes in time.`,
    detail:
      probes === 0
        ? `max(piles) is 1, so lo and hi started equal and the loop never ran. ${plural(piles.length, "pile")} at 1 an hour takes ${plural(finalHours, "hour")}, inside the ${plural(h, "hour")} allowed.`
        : `${finalPer.join(" + ")} = ${plural(finalHours, "hour")} against a budget of ${h}${answer > 1 ? `, while ${answer - 1} an hour would need ${plural(sum(hoursPerPile(piles, answer - 1)), "hour")}` : ``}. ${probes === 1 ? `One probe found it, costing one pass over the piles` : `${probes} probes found it, each costing a pass over the piles`} — ${plural(probes * piles.length, "division")} in total, against the ${plural(fastest * piles.length, "division")} that testing every speed in turn would take.`,
    phase: "done",
    isMilestone: true,
  });

  return b.finish(
    "koko-eating-bananas",
    `piles [${piles.join(", ")}] in ${plural(h, "hour")}`,
    `the slowest workable speed is ${speedPhrase(answer)}`,
  );
}

/* Both caps exist to keep the answer axis legible rather than to mirror the
   question's own limits, which allow 10^9. The axis is max(piles) cells wide, and
   ArrayView switches from boxes to bars once a box cannot hold its digits — past
   23 two-digit cells, which would render the speeds as a meaningless rising ramp.
   20 leaves headroom. The pile cap keeps the panel and the summed narration short. */
const MAX_PILE = 20;
const MAX_PILES = 8;

export const kokoEatingBananasModule: AlgorithmModule = {
  slug: "koko-eating-bananas",
  inputs: [
    {
      name: "piles",
      label: "Banana piles",
      kind: "numbers",
      default: "3, 6, 7, 11",
      help: `Up to ${MAX_PILES} piles of 1 to ${MAX_PILE} bananas. The speed axis is 1 to the largest pile.`,
      max: MAX_PILES,
    },
    { name: "h", label: "Hours available", kind: "number", default: 8, min: 1, max: 999 },
  ],
  validate(raw: Record<string, string>): ValidationResult {
    const list = parseNumberList(raw["piles"] ?? "");
    if (!list.ok) return { ok: false, error: list.error };
    const piles = list.values;
    if (piles.length > MAX_PILES) {
      return {
        ok: false,
        error: `That is ${piles.length} piles — please use ${MAX_PILES} or fewer so the hours stay readable.`,
      };
    }
    for (let i = 0; i < piles.length; i += 1) {
      const pile = piles[i]!;
      if (!Number.isInteger(pile) || pile < 1) {
        return {
          ok: false,
          error: `Pile ${i} is ${pile}, but a pile must be a whole number of at least 1 banana.`,
        };
      }
      if (pile > MAX_PILE) {
        return {
          ok: false,
          error: `Pile ${i} holds ${pile} bananas, which would need an axis of ${pile} speeds. Keep piles at ${MAX_PILE} or under so the speeds stay readable.`,
        };
      }
    }
    const rawHours = (raw["h"] ?? "").trim();
    if (rawHours.length === 0) return { ok: false, error: "Hours available is required." };
    const h = Number(rawHours);
    if (!Number.isInteger(h)) {
      return { ok: false, error: `"${rawHours}" is not a whole number of hours.` };
    }
    /* Without this the algorithm still returns max(piles), but no speed actually
       finishes in time — it would animate a confident answer to an impossible
       question. The catalog states the same bound as a constraint. */
    if (h < piles.length) {
      return {
        ok: false,
        error: `${plural(h, "hour")} cannot clear ${plural(piles.length, "pile")}: each pile needs at least one hour, however fast Koko eats.`,
      };
    }
    return { ok: true, parsed: { piles, h } };
  },
  run,
  presets: [
    /* The question's own first example, answer 4. */
    { label: "Just enough time", values: { piles: "3, 6, 7, 11", h: "8" } },
    /* One hour fewer than the piles can be split across, so the answer jumps to
       the largest pile: every pile must be cleared in a single hour. */
    { label: "No slack at all", values: { piles: "3, 6, 7, 11", h: "4" } },
    /* Generous budget, so the answer is the slowest speed there is. */
    { label: "All the time in the world", values: { piles: "3, 6, 7, 11", h: "27" } },
    /* max(piles) is 1, so lo and hi start equal and the loop never runs — the
       zero-probe case, which still has to produce a coherent run. */
    { label: "Nothing to decide", values: { piles: "1, 1, 1, 1", h: "4" } },
    /* Widest axis the caps allow: 20 speeds, and 8 piles in the side panel. */
    { label: "Widest axis", values: { piles: "20, 4, 17, 9, 2, 13, 6, 11", h: "12" } },
  ],
};

export default kokoEatingBananasModule;
