import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ArrayFrame, CellState } from "@/engine/types";
import { StateIcon } from "@/components/viz/StateIcon";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DURATION = 0.35;

const FILL: Record<CellState, string> = {
  idle: "var(--viz-idle)",
  active: "var(--viz-active)",
  visited: "var(--viz-visited)",
  frontier: "var(--viz-frontier)",
  found: "var(--viz-found)",
  excluded: "var(--viz-excluded)",
  compare: "var(--viz-compare)",
  sorted: "var(--viz-sorted)",
};

const INK: Record<CellState, string> = {
  idle: "var(--viz-idle-ink)",
  active: "var(--viz-active-ink)",
  visited: "var(--viz-visited-ink)",
  frontier: "var(--viz-frontier-ink)",
  found: "var(--viz-found-ink)",
  excluded: "var(--viz-excluded-ink)",
  compare: "var(--viz-compare-ink)",
  sorted: "var(--viz-sorted-ink)",
};

const POINTER_COLOR: Record<"accent" | "warning" | "error", string> = {
  accent: "var(--viz-edge-active)",
  warning: "var(--viz-frontier-ink)",
  error: "var(--viz-compare)",
};

/** A discarded cell deflates to this fraction of its plate and dims. */
const COLLAPSE_SCALE = 0.86;
const COLLAPSE_BAR_SCALE = 0.7;
const COLLAPSE_OPACITY = 0.6;
/** Per-cell ripple: cells nearest the cut fall away first, the wave travels out. */
const COLLAPSE_STAGGER = 0.035;
const COLLAPSE_STAGGER_MAX = 0.18;

/** JetBrains Mono advance width, as a fraction of the font size. */
const MONO_ADVANCE = 0.6;
const LABEL_FONT = 11;
const VALUE_FONT = 15;
/** Gutter between two pointer labels that land on the same cell. */
const POINTER_GUTTER = 4;
/** Keeps a fanned-out pointer cluster off the viewBox edge. */
const POINTER_EDGE_PAD = 2;
/** Same, for the range caption above the bracket. */
const LABEL_EDGE_PAD = 4;
/** Height reserved under the pointer labels for a pointer's arithmetic note. */
const NOTE_ROW = 15;
const NOTE_FONT = 10;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(Math.max(value, low), Math.max(low, high));

/** Half the rendered width of a mono label, used to keep captions on canvas. */
const labelHalfWidth = (text: string): number => (text.length * LABEL_FONT * MONO_ADVANCE) / 2;
const CELL_W_MAX = 46;
const BAR_W_MAX = 26;

function stateOf(frame: ArrayFrame, index: number): CellState {
  return frame.states[index] ?? "idle";
}

function describe(frame: ArrayFrame): string {
  const parts: string[] = [`Array of ${frame.values.length} values: ${frame.values.join(", ")}.`];
  const named: Record<string, number[]> = {};
  for (let i = 0; i < frame.values.length; i += 1) {
    const s = stateOf(frame, i);
    if (s === "idle") continue;
    (named[s] ??= []).push(i);
  }
  for (const [s, list] of Object.entries(named)) {
    parts.push(
      `${s} at position${list.length > 1 ? "s" : ""} ${list.map((i) => i + 1).join(", ")}.`,
    );
  }
  for (const p of frame.pointers) parts.push(`Pointer ${p.name} at position ${p.index + 1}.`);
  for (const r of frame.ranges) {
    parts.push(`${r.label ?? "Range"} covers positions ${r.from + 1} to ${r.to + 1}.`);
  }
  if (frame.swapPair) {
    parts.push(`Swapping positions ${frame.swapPair[0] + 1} and ${frame.swapPair[1] + 1}.`);
  }
  return parts.join(" ");
}

/**
 * Distance from each index to the nearest cell that is *not* excluded.
 *
 * This staggers the discard so the boundary collapses first and the wave travels
 * outward — the learner sees *where* the cut fell, not just that half the row
 * turned grey. Surviving cells are 0. A row with nothing left is uniformly
 * `Infinity`, which the delay clamp flattens into one beat.
 */
function excludedDistances(frame: ArrayFrame, n: number): number[] {
  const dist: number[] = new Array<number>(n).fill(Infinity);
  let previous = -Infinity;
  for (let i = 0; i < n; i += 1) {
    if (stateOf(frame, i) !== "excluded") previous = i;
    dist[i] = i - previous;
  }
  let next = Infinity;
  for (let i = n - 1; i >= 0; i -= 1) {
    if (stateOf(frame, i) !== "excluded") next = i;
    dist[i] = Math.min(dist[i]!, next - i);
  }
  return dist;
}

/**
 * Horizontal offsets for pointers sharing one cell, measured from their real
 * label widths so they sit shoulder to shoulder. Binary search converges `lo`,
 * `hi` and `mid` onto a single index, which used to stack three labels in one
 * spot; nudging them apart also makes the convergence readable.
 */
function pointerOffsets(names: string[]): number[] {
  const widths = names.map((name) => name.length * LABEL_FONT * MONO_ADVANCE);
  const total =
    widths.reduce((sum, w) => sum + w, 0) + POINTER_GUTTER * Math.max(0, names.length - 1);
  let cursor = -total / 2;
  return widths.map((w) => {
    const centre = cursor + w / 2;
    cursor += w + POINTER_GUTTER;
    return centre;
  });
}

/**
 * Fan-out offset for every pointer in `frame`, positionally aligned with
 * `frame.pointers`.
 *
 * A cluster that would hang off the canvas is slid back inside as a unit, so the
 * labels keep their order and spacing. Binary search's last cell is the case
 * that needs it: `lo`/`hi`/`mid` all land on index n-1, and the widest of the
 * three would otherwise be clipped by the viewBox edge.
 */
function pointerFanOut(
  frame: ArrayFrame,
  n: number,
  centreOf: (index: number) => number,
  width: number,
): number[] {
  const lanes = new Map<number, number[]>();
  const clamped = frame.pointers.map((p) => Math.min(Math.max(p.index, 0), Math.max(0, n - 1)));
  clamped.forEach((index, i) => {
    const lane = lanes.get(index);
    if (lane) lane.push(i);
    else lanes.set(index, [i]);
  });
  const offsets: number[] = new Array<number>(frame.pointers.length).fill(0);
  for (const [index, members] of lanes.entries()) {
    const names = members.map((i) => frame.pointers[i]!.name);
    const spread = pointerOffsets(names);
    const centre = centreOf(index);
    let left = Infinity;
    let right = -Infinity;
    names.forEach((name, slot) => {
      const half = (name.length * LABEL_FONT * MONO_ADVANCE) / 2;
      left = Math.min(left, centre + spread[slot]! - half);
      right = Math.max(right, centre + spread[slot]! + half);
    });
    const shift =
      Math.max(0, POINTER_EDGE_PAD - left) - Math.max(0, right - (width - POINTER_EDGE_PAD));
    members.forEach((pointerIndex, slot) => {
      offsets[pointerIndex] = spread[slot]! + shift;
    });
  }
  return offsets;
}

export interface ArrayViewProps {
  frame: ArrayFrame;
  className?: string;
}

export function ArrayView({ frame, className }: ArrayViewProps): React.ReactElement {
  const reduced = useReducedMotion() ?? false;
  const n = frame.values.length;
  const allNumeric = frame.values.every((v) => typeof v === "number");

  const transition = reduced ? { duration: 0 } : { duration: DURATION, ease: EASE };

  const label = describe(frame);

  /* geometry */
  const gap = 6;
  const width = 800;
  /**
   * Cells shrink to fit instead of overflowing, and bars take over only once a
   * box can no longer hold its own digits. The old fixed `n >= 12` cutoff flipped
   * the 16-value binary-search preset into a different visual language from its
   * 10-value siblings while boxes still had 44px of room each.
   */
  const available = (width - Math.max(0, n - 1) * gap) / Math.max(1, n);
  const boxW = Math.min(CELL_W_MAX, available);
  const maxChars = Math.max(1, ...frame.values.map((v) => String(v).length));
  const legibleBoxW = maxChars * VALUE_FONT * MONO_ADVANCE + 10;
  const barMode = allNumeric && boxW < legibleBoxW;
  const cellW = barMode ? Math.min(BAR_W_MAX, available) : boxW;
  /* Only bites when a box is too narrow for its digits and bars aren't an option
     (non-numeric values); every current preset resolves to the full 15px. */
  const valueFont = Math.min(VALUE_FONT, (cellW - 8) / (maxChars * MONO_ADVANCE));

  const contentWidth = Math.max(1, n) * cellW + Math.max(0, n - 1) * gap;
  const offsetX = Math.max(0, (width - contentWidth) / 2);
  /* Reserved for the run, not derived per frame: merge-sort and sliding-window
     alternate between one and two ranges, which used to resize the canvas
     between steps. */
  const rangeRows = Math.max(1, frame.rangeRows ?? frame.ranges.length);
  const topBand = 22 + rangeRows * 16; // ranges (stacked to avoid label overlap)
  const bodyH = barMode ? 150 : 52;
  const pointerPad = barMode ? 16 : 4; // clears the value labels printed under bars
  /* Reserved for the whole run when any frame carries a note, so the canvas does
     not change height between a probe step and a narrowing step. */
  const noteRow = frame.pointerNotes ? NOTE_ROW : 0;
  const bottomBand = pointerPad + 30 + noteRow; // caret + label baseline at +26, plus descender
  const height = topBand + bodyH + bottomBand;

  const x = (i: number): number => offsetX + i * (cellW + gap);
  const numeric = frame.values.map((v) => (typeof v === "number" ? v : 0));
  const maxAbs = Math.max(1, ...numeric.map((v) => Math.abs(v)));
  const distances = excludedDistances(frame, n);

  /* pointers landing on one cell are fanned apart rather than drawn on top of each other */
  const fanOut = pointerFanOut(frame, n, (i) => x(i) + cellW / 2, width);

  return (
    <div className={cn("w-full", className)}>
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        className="block h-auto w-full overflow-visible"
      >
        {/* ranges: bracket + label above */}
        {frame.ranges.map((range, rangeIndex) => {
          const left = x(range.from);
          const span = Math.max(0, x(range.to) + cellW - left);
          const stroke =
            range.tone === "warning" ? "var(--viz-frontier-ink)" : "var(--viz-edge-active)";
          const y = topBand - 14 - (rangeRows - 1 - rangeIndex) * 16;
          /* Centred on the bracket, but pulled back inside the canvas when the
             window shrinks near an edge — a 1-cell window at index 15 would
             otherwise centre a 200px caption 80px past the right edge. */
          const labelCentre = range.label
            ? clamp(
                left + span / 2,
                labelHalfWidth(range.label) + LABEL_EDGE_PAD,
                width - labelHalfWidth(range.label) - LABEL_EDGE_PAD,
              ) - left
            : 0;
          const tick = (
            <line
              x1={0}
              y1={y}
              x2={0}
              y2={y + 6}
              stroke={stroke}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
          return (
            /* Keyed by slot, not by extent: keying by the extent remounted the
               bracket every step, so the window snapped instead of contracting.
               Split into ticks + a rule so the right edge can travel on its own. */
            <motion.g
              key={`range-${rangeIndex}`}
              animate={{ x: left }}
              initial={false}
              transition={transition}
            >
              {tick}
              <motion.line
                x1={0}
                y1={y + 6}
                y2={y + 6}
                stroke={stroke}
                strokeWidth={1.5}
                strokeLinecap="round"
                animate={{ x2: span }}
                initial={false}
                transition={transition}
              />
              <motion.g animate={{ x: span }} initial={false} transition={transition}>
                {tick}
              </motion.g>
              {range.label ? (
                <motion.text
                  key={range.label}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize={LABEL_FONT}
                  fontFamily="var(--font-mono)"
                  fill={stroke}
                  animate={{ x: labelCentre, opacity: 1 }}
                  initial={reduced ? false : { x: labelCentre, opacity: 0 }}
                  transition={transition}
                >
                  {range.label}
                </motion.text>
              ) : null}
            </motion.g>
          );
        })}

        {/* body */}
        {frame.values.map((value, i) => {
          const state = stateOf(frame, i);
          const fill = FILL[state];
          const ink = INK[state];
          const identity = `${String(value)}#${i}`;
          const swapped = frame.swapPair?.includes(i) ?? false;
          const layoutId = swapped
            ? `cell-${String(value)}-${frame.swapPair!.join("-")}`
            : undefined;

          /* A discard is a physical event: the plate deflates and dims, nearest
             the cut first. It used to be a 0.35s fill change and nothing else. */
          const discarded = state === "excluded";
          const collapseDelay =
            discarded && !reduced
              ? Math.min(distances[i]! * COLLAPSE_STAGGER, COLLAPSE_STAGGER_MAX)
              : 0;
          const cellTransition = { ...transition, delay: collapseDelay };
          const contentOpacity = discarded ? COLLAPSE_OPACITY : 1;

          if (barMode) {
            const h = Math.max(4, (Math.abs(numeric[i]!) / maxAbs) * (bodyH - 20));
            return (
              <motion.g
                key={identity}
                layout={!reduced}
                layoutId={layoutId}
                transition={transition}
              >
                <motion.rect
                  x={x(i)}
                  y={topBand + bodyH - h}
                  width={cellW}
                  height={h}
                  rx={4}
                  /* scaleX only, so the bar narrows in place and keeps its baseline */
                  animate={{
                    fill,
                    scaleX: discarded ? COLLAPSE_BAR_SCALE : 1,
                    opacity: contentOpacity,
                  }}
                  transition={cellTransition}
                  initial={false}
                />
                {state !== "idle" ? (
                  <motion.g
                    transform={`translate(${x(i) + cellW / 2 - 5}, ${Math.max(topBand, topBand + bodyH - h - 14)})`}
                    animate={{ opacity: contentOpacity }}
                    transition={cellTransition}
                    initial={false}
                  >
                    <StateIcon state={state} size={10} color={ink} />
                  </motion.g>
                ) : null}
                <text
                  x={x(i) + cellW / 2}
                  y={topBand + bodyH + 12}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="var(--font-mono)"
                  fill="var(--viz-idle-ink)"
                >
                  {String(value)}
                </text>
              </motion.g>
            );
          }

          return (
            <motion.g key={identity} layout={!reduced} layoutId={layoutId} transition={transition}>
              <motion.rect
                x={x(i)}
                y={topBand}
                width={cellW}
                height={bodyH}
                rx={8}
                /* framer-motion sets transform-box: fill-box on SVG transforms,
                   so this scales about the plate's own centre. */
                animate={{
                  fill,
                  scale: discarded ? COLLAPSE_SCALE : 1,
                  opacity: contentOpacity,
                }}
                transition={cellTransition}
                initial={false}
                stroke="var(--viz-edge)"
                strokeWidth={1}
              />
              {state !== "idle" ? (
                <motion.g
                  transform={`translate(${x(i) + cellW - 15}, ${topBand + 4})`}
                  animate={{ opacity: contentOpacity }}
                  transition={cellTransition}
                  initial={false}
                >
                  <StateIcon state={state} size={11} color={ink} />
                </motion.g>
              ) : null}
              <motion.text
                x={x(i) + cellW / 2}
                y={topBand + bodyH / 2 + 5}
                textAnchor="middle"
                fontSize={valueFont}
                fontFamily="var(--font-mono)"
                animate={{ fill: ink, opacity: contentOpacity }}
                transition={cellTransition}
                initial={false}
              >
                {String(value)}
              </motion.text>
              <text
                x={x(i) + cellW / 2}
                y={topBand - 4}
                textAnchor="middle"
                fontSize={9}
                fontFamily="var(--font-mono)"
                fill="var(--viz-idle-ink)"
              >
                {i}
              </text>
            </motion.g>
          );
        })}

        {/* pointers below */}
        {frame.pointers.map((pointer, pointerIndex) => {
          const color = POINTER_COLOR[pointer.color ?? "accent"];
          const index = Math.min(Math.max(pointer.index, 0), Math.max(0, n - 1));
          const cx = x(index) + cellW / 2 + fanOut[pointerIndex]!;
          const top = topBand + bodyH + pointerPad;
          return (
            /* Keyed by name and driven purely by `x`, so a pointer slides to its
               new cell instead of vanishing and reappearing there. */
            <motion.g
              key={pointer.name}
              transition={transition}
              animate={{ x: cx, opacity: 1 }}
              initial={reduced ? false : { x: cx, opacity: 0 }}
            >
              {/* caret points up, at the cell it marks */}
              <path d={`M 0 ${top + 8} l -4 6 l 8 0 z`} fill={color} />
              <text
                y={top + 26}
                textAnchor="middle"
                fontSize={LABEL_FONT}
                fontFamily="var(--font-mono)"
                fill={color}
              >
                {pointer.name}
              </text>
            </motion.g>
          );
        })}

        {/* Pointer notes: the arithmetic that produced the pointer, on its own
            row so it can never collide with a neighbouring pointer's label.
            Positioned outside the pointer group because a note is much wider
            than its caret and needs its own clamp against the canvas edge. */}
        {frame.pointers.map((pointer, pointerIndex) => {
          if (!pointer.note) return null;
          const color = POINTER_COLOR[pointer.color ?? "accent"];
          const index = Math.min(Math.max(pointer.index, 0), Math.max(0, n - 1));
          const raw = x(index) + cellW / 2 + fanOut[pointerIndex]!;
          const half = (pointer.note.length * NOTE_FONT * MONO_ADVANCE) / 2;
          const cx = clamp(raw, half + LABEL_EDGE_PAD, width - half - LABEL_EDGE_PAD);
          const top = topBand + bodyH + pointerPad;
          return (
            <motion.text
              key={`note-${pointer.name}`}
              y={top + 26 + NOTE_ROW}
              textAnchor="middle"
              fontSize={NOTE_FONT}
              fontFamily="var(--font-mono)"
              fill={color}
              transition={transition}
              animate={{ x: cx, opacity: 1 }}
              initial={reduced ? false : { x: cx, opacity: 0 }}
            >
              {pointer.note}
            </motion.text>
          );
        })}
      </svg>
    </div>
  );
}

export default ArrayView;
