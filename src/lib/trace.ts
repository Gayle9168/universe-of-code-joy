import type { AlgorithmRun, ArrayFrame, CellState, Step } from "@/engine/types";

/**
 * Trace Mode derivation.
 *
 * The canonical engine run is the correctness oracle: every expected answer here
 * is read out of the run's semantic frame data — `pointers`, `comparison`,
 * `ranges`, `target` and the pointer diff against the next step. Narration,
 * `detail` and `decision` English are never parsed, and binary search is never
 * reimplemented.
 *
 * Pure functions only: no React, no DOM, no stores, no engine schema additions.
 */

/* ---------------- pointer helpers ---------------- */

const LOW_NAMES = ["lo", "low", "l", "left"] as const;
const HIGH_NAMES = ["hi", "high", "r", "right"] as const;

function asArrayFrame(step: Step | null | undefined): ArrayFrame | null {
  const frame = step?.frame;
  return frame && frame.kind === "array" ? frame : null;
}

function ptr(frame: ArrayFrame, names: readonly string[]): number | null {
  for (const name of names) {
    const p = frame.pointers.find((q) => q.name === name);
    if (p) return p.index;
  }
  return null;
}

/* ---------------- public types ---------------- */

export type TraceKind = "choose-mid" | "compare" | "action" | "result";

export type TraceRelation = "lt" | "eq" | "gt";

export interface TraceOption {
  id: string;
  label: string;
  /** Only set for choose-mid: the array index this option selects. */
  index?: number;
}

/** The learner-visible algorithm state. Never contains unanswered future state. */
export interface TraceView {
  low: number;
  high: number;
  /** Shown only once the learner has correctly chosen it. */
  mid: number | null;
  /** Shown only once the learner has correctly named the comparison. */
  comparison: { left: string; op: string; right: string } | null;
  /** Index the target was found at, once the trace is complete. */
  found: number | null;
  /** True on the final view of an unsuccessful search. */
  exhausted: boolean;
}

export interface TraceQuestion {
  id: string;
  kind: TraceKind;
  prompt: string;
  /** Evidence the learner may reason from — never the answer. */
  context: string[];
  options: TraceOption[];
  correctOptionId: string;
  /** Why the correct answer follows. Shown after correct or reveal. */
  explanation: string;
  /** Per-option copy naming the misconception behind a wrong choice. */
  feedback: Record<string, string>;
  /** Progressive hints, levels 1..3. The answer itself is not in here. */
  hints: string[];
  /** Answer-level sentence used by "Show answer". */
  answerReveal: string;
  /** One sentence a screen reader hears when the question opens. */
  accessiblePrompt: string;
}

export interface TraceCheckpoint {
  id: string;
  kind: TraceKind;
  question: TraceQuestion;
  /** State on screen WHILE this question is unanswered. */
  view: TraceView;
}

export interface TraceSummary {
  /** Candidate counts at each probe, e.g. [9, 4, 2]. */
  candidateCounts: number[];
  found: boolean;
  foundIndex: number | null;
}

export interface TraceSession {
  algorithmSlug: string;
  values: (number | string)[];
  target: number | string;
  checkpoints: TraceCheckpoint[];
  /** State after every checkpoint is resolved. */
  finalView: TraceView;
  summary: TraceSummary;
}

/* ---------------- frame construction (presentation state) ---------------- */

/**
 * The `ArrayFrame` for a trace view, so Trace can reuse the guided canvas
 * without a second renderer. This is presentation state assembled from
 * already-confirmed learner answers, not an algorithm simulation.
 */
export function traceFrame(session: TraceSession, view: TraceView): ArrayFrame {
  const values = session.values;
  const states: Record<number, CellState> = {};
  for (let i = 0; i < values.length; i += 1) {
    states[i] = i < view.low || i > view.high ? "excluded" : "idle";
  }
  if (view.mid !== null && view.mid >= view.low && view.mid <= view.high) {
    states[view.mid] = "compare";
  }
  if (view.found !== null) states[view.found] = "found";

  const pointers: ArrayFrame["pointers"] = [
    { name: "lo", index: view.low },
    { name: "hi", index: view.high },
  ];
  if (view.mid !== null) pointers.push({ name: "mid", index: view.mid, color: "accent" });

  return {
    kind: "array",
    values: [...values],
    states,
    pointers,
    pointerNotes: false,
    ranges: view.low <= view.high ? [{ from: view.low, to: view.high, tone: "tint" }] : [],
    rangeRows: 1,
    target: { label: "target", value: session.target },
    ...(view.comparison ? { comparison: { ...view.comparison } } : {}),
  };
}

/* ---------------- question builders ---------------- */

const relationOf = (midValue: number, target: number): TraceRelation =>
  midValue === target ? "eq" : midValue < target ? "lt" : "gt";

const relationWord = (relation: TraceRelation): string =>
  relation === "eq" ? "equal to" : relation === "lt" ? "smaller than" : "larger than";

function chooseMidQuestion(
  id: string,
  low: number,
  high: number,
  correctIndex: number,
): TraceQuestion {
  const options: TraceOption[] = [];
  for (let i = low; i <= high; i += 1)
    options.push({ id: `index-${i}`, label: `index ${i}`, index: i });

  const feedback: Record<string, string> = {};
  for (const option of options) {
    const i = option.index ?? 0;
    feedback[option.id] =
      i === correctIndex
        ? ""
        : `Index ${i} does not split the current range evenly. The midpoint must be calculated from the CURRENT low (${low}) and high (${high}), not from the whole array.`;
  }

  return {
    id,
    kind: "choose-mid",
    prompt: "Where should mid be?",
    context: [`low = ${low}, high = ${high}`],
    options,
    correctOptionId: `index-${correctIndex}`,
    explanation: `mid = floor((${low} + ${high}) / 2) = ${correctIndex}. Mid splits the current search range as evenly as possible.`,
    feedback,
    hints: [
      "Use both current boundaries — low and high.",
      "Compute floor((low + high) / 2).",
      `floor((${low} + ${high}) / 2) = ?`,
    ],
    answerReveal: `mid = ${correctIndex}`,
    accessiblePrompt: `Choose mid. low is ${low}, high is ${high}. Where should mid be?`,
  };
}

function compareQuestion(
  id: string,
  mid: number,
  midValue: number,
  target: number,
  relation: TraceRelation,
): TraceQuestion {
  const options: TraceOption[] = [
    { id: "lt", label: `${midValue} < ${target}` },
    { id: "eq", label: `${midValue} = ${target}` },
    { id: "gt", label: `${midValue} > ${target}` },
  ];
  const correct = `${midValue} is ${relationWord(relation)} ${target}.`;
  const feedback: Record<string, string> = {
    lt: relation === "lt" ? correct : `${midValue} is not smaller than ${target}. ${correct}`,
    eq: relation === "eq" ? correct : `${midValue} and ${target} are different values. ${correct}`,
    gt: relation === "gt" ? correct : `${midValue} is not larger than ${target}. ${correct}`,
  };

  return {
    id,
    kind: "compare",
    prompt: `How does ${midValue} compare with ${target}?`,
    context: [`arr[${mid}] = ${midValue}`, `target = ${target}`],
    options,
    correctOptionId: relation,
    explanation: correct,
    feedback,
    hints: [
      `Read only arr[${mid}] — the rest of the range does not matter yet.`,
      `Compare the single value ${midValue} with the target ${target}.`,
      `Is ${midValue} below, at, or above ${target}?`,
    ],
    answerReveal: correct,
    accessiblePrompt: `Compare. arr index ${mid} is ${midValue}, target is ${target}. How do they compare?`,
  };
}

export type TraceActionId = "move-low" | "move-high" | "return-mid" | "not-found";

function actionQuestion(
  id: string,
  mid: number,
  midValue: number,
  target: number,
  relation: TraceRelation,
  correctAction: TraceActionId,
  newLow: number,
  newHigh: number,
): TraceQuestion {
  const options: TraceOption[] = [
    { id: "move-low", label: "low = mid + 1" },
    { id: "move-high", label: "high = mid - 1" },
    { id: "return-mid", label: "return mid" },
    { id: "not-found", label: "stop — target not found" },
  ];

  const explanation =
    correctAction === "return-mid"
      ? `The middle value equals the target, so index ${mid} is the answer and the search stops.`
      : correctAction === "move-low"
        ? `${midValue} is smaller than ${target}, so every value at or left of index ${mid} is too small. low becomes ${newLow}.`
        : `${midValue} is larger than ${target}, so every value at or right of index ${mid} is too large. high becomes ${newHigh}.`;

  const feedback: Record<string, string> = {
    "move-low":
      correctAction === "move-low"
        ? explanation
        : `Moving low right keeps the larger half, but ${midValue} is ${relationWord(relation)} ${target}, so that half cannot hold the target.`,
    "move-high":
      correctAction === "move-high"
        ? explanation
        : `Moving high left keeps the smaller half, but ${midValue} is ${relationWord(relation)} ${target}, so that half cannot hold the target.`,
    "return-mid":
      correctAction === "return-mid"
        ? explanation
        : `Returning mid claims a match, but ${midValue} is ${relationWord(relation)} ${target} — the middle value is not the target.`,
    "not-found":
      correctAction === "return-mid"
        ? "The middle value already matches the target, so there is nothing left to rule out."
        : `Stopping now gives up too early: half of the range has not been ruled out yet.`,
  };

  return {
    id,
    kind: "action",
    prompt: "What changes next?",
    context: [
      `arr[${mid}] = ${midValue}`,
      `${midValue} ${relation === "eq" ? "=" : relation === "lt" ? "<" : ">"} ${target}`,
    ],
    options,
    correctOptionId: correctAction,
    explanation,
    feedback,
    hints: [
      `${midValue} is ${relationWord(relation)} ${target}.`,
      relation === "eq"
        ? "The search is over the moment the middle value matches."
        : "Which side of mid can still contain the target?",
      relation === "eq"
        ? "Which line of the algorithm returns an index?"
        : "The half that cannot contain the target is discarded by moving one boundary past mid.",
    ],
    answerReveal:
      correctAction === "return-mid"
        ? `return mid (index ${mid})`
        : correctAction === "move-low"
          ? `low = mid + 1 → low = ${newLow}`
          : `high = mid - 1 → high = ${newHigh}`,
    accessiblePrompt: `Move boundary. ${midValue} is ${relationWord(relation)} ${target}. What changes next?`,
  };
}

function resultQuestion(
  id: string,
  found: boolean,
  low: number,
  high: number,
  index: number | null,
): TraceQuestion {
  const options: TraceOption[] = [
    { id: "found", label: "found — return the index" },
    { id: "absent", label: "not in the list — return -1" },
  ];
  const explanation = found
    ? `The middle value matched, so the search returns index ${index}.`
    : `low (${low}) has passed high (${high}), so no candidates remain and the target is not in this list.`;

  return {
    id,
    kind: "result",
    prompt: "What is the result?",
    context: found ? [`low = ${low}, high = ${high}`] : [`low = ${low}, high = ${high}`],
    options,
    correctOptionId: found ? "found" : "absent",
    explanation,
    feedback: {
      found: found
        ? explanation
        : `No index can be returned: the range is empty, so there is nothing left that could hold the target.`,
      absent: found
        ? `The target was matched at an index, so the search does not report it missing.`
        : explanation,
    },
    hints: [
      "Check whether any candidates remain in the search range.",
      `low = ${low}, high = ${high}.`,
      found
        ? "The middle value matched the target on the previous step."
        : "A range where low is greater than high holds no values at all.",
    ],
    answerReveal: found ? `found at index ${index}` : "not found (-1)",
    accessiblePrompt: `Result. low is ${low}, high is ${high}. What is the result?`,
  };
}

/* ---------------- session derivation ---------------- */

const cloneView = (v: TraceView): TraceView => ({
  ...v,
  comparison: v.comparison ? { ...v.comparison } : null,
});

/**
 * Folds a canonical run into the semantic checkpoints a learner must perform.
 *
 * One probe of the algorithm yields three learner actions — choose mid, compare,
 * move a boundary — and the run ends with one result question. Every expected
 * answer comes from the run's own frames.
 */
export function buildTraceSession(run: AlgorithmRun): TraceSession {
  const steps = run.steps;
  const first = steps.map(asArrayFrame).find((f): f is ArrayFrame => f !== null);
  const values = first ? [...first.values] : [];
  const target = first?.target?.value ?? "";

  const checkpoints: TraceCheckpoint[] = [];
  const candidateCounts: number[] = [];

  let view: TraceView = {
    low: first ? (ptr(first, LOW_NAMES) ?? 0) : 0,
    high: first ? (ptr(first, HIGH_NAMES) ?? Math.max(0, values.length - 1)) : 0,
    mid: null,
    comparison: null,
    found: null,
    exhausted: false,
  };

  let foundIndex: number | null = null;
  let probe = 0;

  for (let i = 0; i < steps.length; i += 1) {
    const frame = asArrayFrame(steps[i]);
    if (!frame) continue;
    const mid = ptr(frame, ["mid"]);
    const lo = ptr(frame, LOW_NAMES);
    const hi = ptr(frame, HIGH_NAMES);
    if (mid === null || lo === null || hi === null) continue;

    if (!frame.comparison) {
      /* Probe step: the engine has just computed mid for the current window. */
      view = { ...cloneView(view), low: lo, high: hi, mid: null, comparison: null };
      candidateCounts.push(Math.max(0, hi - lo + 1));
      checkpoints.push({
        id: `mid-${probe}`,
        kind: "choose-mid",
        question: chooseMidQuestion(`mid-${probe}`, lo, hi, mid),
        view: cloneView(view),
      });
      view = { ...cloneView(view), mid };
      continue;
    }

    /* Comparison step. */
    const midValue = Number(frame.comparison.left);
    const targetValue = Number(frame.comparison.right);
    if (!Number.isFinite(midValue) || !Number.isFinite(targetValue)) continue;
    const relation = relationOf(midValue, targetValue);

    checkpoints.push({
      id: `compare-${probe}`,
      kind: "compare",
      question: compareQuestion(`compare-${probe}`, mid, midValue, targetValue, relation),
      view: cloneView(view),
    });
    view = {
      ...cloneView(view),
      comparison: {
        left: String(midValue),
        op: relation === "eq" ? "=" : relation === "lt" ? "<" : ">",
        right: String(targetValue),
      },
    };

    const next = asArrayFrame(steps[i + 1]);
    const loNext = next ? (ptr(next, LOW_NAMES) ?? lo) : lo;
    const hiNext = next ? (ptr(next, HIGH_NAMES) ?? hi) : hi;

    if (relation === "eq") {
      checkpoints.push({
        id: `action-${probe}`,
        kind: "action",
        question: actionQuestion(
          `action-${probe}`,
          mid,
          midValue,
          targetValue,
          relation,
          "return-mid",
          lo,
          hi,
        ),
        view: cloneView(view),
      });
      foundIndex = mid;
      view = { ...cloneView(view), found: mid, low: mid, high: mid };
      break;
    }

    const correctAction: TraceActionId = relation === "lt" ? "move-low" : "move-high";
    const newLow = relation === "lt" ? mid + 1 : lo;
    const newHigh = relation === "lt" ? hi : mid - 1;

    checkpoints.push({
      id: `action-${probe}`,
      kind: "action",
      question: actionQuestion(
        `action-${probe}`,
        mid,
        midValue,
        targetValue,
        relation,
        correctAction,
        newLow,
        newHigh,
      ),
      view: cloneView(view),
    });

    /* The engine's own next frame is the oracle for the new boundaries; the
       arithmetic above only shapes the copy. */
    view = {
      ...cloneView(view),
      low: loNext,
      high: hiNext,
      mid: null,
      comparison: null,
    };
    probe += 1;
  }

  const found = foundIndex !== null;
  if (!found) view = { ...cloneView(view), exhausted: true };

  checkpoints.push({
    id: "result",
    kind: "result",
    question: resultQuestion("result", found, view.low, view.high, foundIndex),
    view: cloneView(view),
  });

  return {
    algorithmSlug: run.slug,
    values,
    target,
    checkpoints,
    finalView: cloneView(view),
    summary: { candidateCounts, found, foundIndex },
  };
}

/** The view to render given how many checkpoints have been resolved. */
export function viewAt(session: TraceSession, resolvedCount: number): TraceView {
  const checkpoint = session.checkpoints[resolvedCount];
  return checkpoint ? checkpoint.view : session.finalView;
}
