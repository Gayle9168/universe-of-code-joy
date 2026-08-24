import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArrayFrame, CellState } from "@/engine/types";
import { cellCenter, scaleXFor, windowExtentPx } from "@/lib/vizTransitions";

/**
 * DOM (not SVG) canvas for searching-style array frames: index labels above the
 * row, large rounded value cells, a dashed search-window bracket with labelled
 * boundary markers, a three-part comparison strip and a decision callout.
 *
 * Pure presentation — `(props: { frame }) => JSX`, no stores, no router.
 * Frame-to-frame changes animate: cells cross-fade between states, the bracket
 * contracts, and the lo/hi/mid markers translate to their new cell centres.
 * Geometry is measured from the rendered row, never hardcoded, and the global
 * reduced-motion rules in `styles.css` collapse every transition to 0ms.
 */

/** Gap between cells; must stay in sync with the `gap-2` utility on the rows. */
const CELL_GAP = 8;
const MAX_CELL = 72;

const CELL_SURFACE: Record<CellState, string> = {
  idle: "border-hairline bg-card text-ink",
  active: "border-primary/30 bg-tint text-ink",
  visited: "border-hairline bg-paper text-slate",
  frontier: "border-primary/30 bg-tint text-ink",
  found: "border-primary bg-primary text-primary-foreground",
  excluded: "border-hairline bg-paper text-slate-soft",
  compare: "border-primary bg-primary text-primary-foreground",
  sorted: "border-primary/30 bg-tint text-ink",
};

/** Cells the frame has taken out of play read as secondary, never removed. */
const DIMMED: Partial<Record<CellState, string>> = {
  excluded: "opacity-45",
  visited: "opacity-60",
};

/** The emphasised states get a hair more presence as they take over. */
const EMPHASIS: Partial<Record<CellState, string>> = {
  found: "scale-[1.04] shadow-sm",
  compare: "scale-[1.04] shadow-sm",
};

function stateOf(frame: ArrayFrame, index: number): CellState {
  return frame.states[index] ?? "idle";
}

/** The window the bracket spans: the frame's own range, else its lo/hi pointers. */
function windowExtent(frame: ArrayFrame): { from: number; to: number; label: string } | null {
  const n = frame.values.length;
  const range = frame.ranges[0];
  if (range) {
    return {
      from: Math.max(0, Math.min(range.from, n - 1)),
      to: Math.max(0, Math.min(range.to, n - 1)),
      label: range.label ?? "search window",
    };
  }
  const lo = frame.pointers.find((p) => p.name === "lo");
  const hi = frame.pointers.find((p) => p.name === "hi");
  if (!lo || !hi || lo.index > hi.index) return null;
  return {
    from: Math.max(0, Math.min(lo.index, n - 1)),
    to: Math.max(0, Math.min(hi.index, n - 1)),
    label: "search window",
  };
}

function describe(frame: ArrayFrame): string {
  const parts: string[] = [`Array of ${frame.values.length} values: ${frame.values.join(", ")}.`];
  if (frame.target) parts.push(`${frame.target.label} ${String(frame.target.value)}.`);
  for (const p of frame.pointers) parts.push(`Pointer ${p.name} at index ${p.index}.`);
  const win = windowExtent(frame);
  if (win) parts.push(`Search window covers indexes ${win.from} to ${win.to}.`);
  if (frame.comparison) {
    const { left, op, right, verdict } = frame.comparison;
    parts.push(`Comparing ${left} ${op} ${right}.${verdict ? ` ${verdict}.` : ""}`);
  }
  if (frame.decision) parts.push(`${frame.decision.title} ${frame.decision.detail ?? ""}`.trim());
  return parts.join(" ");
}

/** Measures the rendered row so overlays can track real cell geometry. */
function useMeasuredWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = React.useRef<T | null>(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => setWidth(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}

interface ValueCellProps {
  value: string | number;
  state: CellState;
}

/** Memoized so playback re-renders only the cells whose state actually moved. */
const ValueCell = React.memo(function ValueCell({
  value,
  state,
}: ValueCellProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex h-[54px] items-center justify-center rounded-xl border font-mono text-[20px] font-medium tabular-nums xl:h-[58px] 2xl:h-[62px]",
        "transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-300 ease-out will-change-transform",
        CELL_SURFACE[state],
        DIMMED[state],
        EMPHASIS[state],
      )}
    >
      {String(value)}
    </div>
  );
});

export interface ArrayCanvasProps {
  frame: ArrayFrame;
  className?: string;
}

export function ArrayCanvas({ frame, className }: ArrayCanvasProps): React.ReactElement {
  const n = Math.max(1, frame.values.length);
  const win = windowExtent(frame);
  const [rowRef, rowWidth] = useMeasuredWidth<HTMLDivElement>();
  const cols: React.CSSProperties = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };

  /* Every pointer the run has shown so far keeps a mounted marker, so a marker
     travels to its new cell instead of unmounting and reappearing. */
  const [names, setNames] = React.useState<string[]>(() => frame.pointers.map((p) => p.name));
  React.useEffect(() => {
    setNames((prev) => {
      const next = [...prev];
      for (const p of frame.pointers) if (!next.includes(p.name)) next.push(p.name);
      return next.length === prev.length ? prev : next;
    });
  }, [frame.pointers]);

  /* Last known index per marker: a marker the current frame omits fades out in
     place rather than snapping to index 0. */
  const lastIndexRef = React.useRef<Record<string, number>>({});
  const markers = names.map((name) => {
    const live = frame.pointers.find((p) => p.name === name);
    if (live) lastIndexRef.current[name] = Math.max(0, Math.min(live.index, n - 1));
    const index = lastIndexRef.current[name] ?? 0;
    return { name, index, active: Boolean(live) };
  });

  const extent = win
    ? windowExtentPx(win.from, win.to, rowWidth, n, CELL_GAP)
    : { offset: 0, width: rowWidth, center: rowWidth / 2 };

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      <span className="sr-only" role="img" aria-label={describe(frame)} />

      {/* target — stationary, only its value cross-fades */}
      {frame.target ? (
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">
            {frame.target.label}
          </span>
          <span className="flex h-14 min-w-[3.5rem] items-center justify-center rounded-xl border border-primary/40 bg-tint px-4 font-mono text-[24px] font-semibold tabular-nums text-primary transition-colors duration-300 ease-out">
            <span key={String(frame.target.value)} className="viz-swap">
              {String(frame.target.value)}
            </span>
          </span>
        </div>
      ) : null}

      <div
        className={cn("w-full px-1", frame.target ? "mt-6" : "mt-0")}
        style={{ maxWidth: `${n * MAX_CELL}px` }}
      >
        {/* index labels */}
        <div aria-hidden="true" className="grid w-full gap-2" style={cols}>
          {frame.values.map((_, i) => (
            <span
              key={`idx-${i}`}
              className="text-center font-mono text-[11px] tabular-nums text-slate-soft"
            >
              {i}
            </span>
          ))}
        </div>

        {/* value cells */}
        <div ref={rowRef} className="mt-1.5 grid w-full gap-2" style={cols}>
          {frame.values.map((value, i) => (
            <ValueCell key={`cell-${i}`} value={value} state={stateOf(frame, i)} />
          ))}
        </div>

        {/* dashed search-window bracket — one element that contracts */}
        <div className="relative mt-3 h-[20px] w-full overflow-hidden">
          <div
            className="absolute left-0 top-0 w-full transition-[transform,opacity] duration-300 ease-out will-change-transform"
            style={{
              opacity: win ? 1 : 0,
              transform: `translateX(${extent.center}px) translateX(-50%)`,
            }}
          >
            <span className="block text-center font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
              {win?.label ?? "search window"}
            </span>
          </div>
          <div
            aria-hidden="true"
            className="absolute left-0 top-[15px] h-px w-full origin-left border-t border-dashed border-primary/50 transition-[transform,opacity] duration-300 ease-out will-change-transform"
            style={{
              opacity: win ? 1 : 0,
              transform: `translateX(${extent.offset}px) scaleX(${scaleXFor(extent.width, rowWidth)})`,
            }}
          />
        </div>

        {/* lo / hi / mid markers — persistent, they travel */}
        <div className="relative mt-2 h-[34px] w-full">
          {markers.map((m) => (
            <span
              key={m.name}
              className="absolute left-0 top-0 flex flex-col items-center leading-tight transition-[transform,opacity] duration-300 ease-out will-change-transform"
              style={{
                opacity: m.active ? 1 : 0,
                transform: `translateX(${cellCenter(m.index, rowWidth, n, CELL_GAP)}px) translateX(-50%)`,
              }}
            >
              <span className="font-mono text-[11px] font-medium text-primary">{m.name}</span>
              <span className="font-mono text-[13px] font-semibold tabular-nums text-primary">
                {m.index}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* comparison strip — height reserved so frames never shift the layout */}
      <div
        className="mt-5 flex w-full max-w-[520px] items-stretch rounded-xl border border-hairline bg-card transition-opacity duration-300 ease-out"
        style={{ opacity: frame.comparison ? 1 : 0 }}
        aria-hidden={frame.comparison ? undefined : true}
      >
        <div className="flex flex-1 flex-col items-center gap-0.5 px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate">
            mid value
          </span>
          <span
            key={`left-${String(frame.comparison?.left ?? "")}`}
            className="viz-swap font-mono text-[20px] font-semibold tabular-nums text-primary"
          >
            {frame.comparison?.left ?? "\u00a0"}
          </span>
        </div>
        <div className="w-px self-stretch bg-hairline" />
        <div className="flex flex-1 items-center justify-center px-4 py-3">
          <span
            key={`op-${String(frame.comparison?.left ?? "")}${frame.comparison?.op ?? ""}${String(frame.comparison?.right ?? "")}`}
            className={cn(
              "viz-swap font-mono text-[22px] font-semibold tabular-nums transition-colors duration-300 ease-out",
              frame.comparison?.tone === "error" ? "text-error" : "text-warning",
            )}
          >
            {frame.comparison
              ? `${frame.comparison.left} ${frame.comparison.op} ${frame.comparison.right}`
              : "\u00a0"}
          </span>
        </div>
        <div className="w-px self-stretch bg-hairline" />
        <div className="flex flex-1 flex-col items-center gap-0.5 px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate">
            target
          </span>
          <span
            key={`right-${String(frame.comparison?.right ?? "")}`}
            className="viz-swap font-mono text-[20px] font-semibold tabular-nums text-primary"
          >
            {frame.comparison?.right ?? "\u00a0"}
          </span>
        </div>
      </div>

      {/* decision callout — stays in place, content cross-fades */}
      <div
        className={cn(
          "mt-3 flex w-full max-w-[580px] items-center gap-3 rounded-xl px-4 py-3 transition-[background-color,opacity] duration-300 ease-out",
          frame.decision?.tone === "error"
            ? "bg-error-tint"
            : frame.decision?.tone === "accent"
              ? "bg-tint"
              : "bg-warning/10",
        )}
        style={{ opacity: frame.decision ? 1 : 0 }}
        aria-hidden={frame.decision ? undefined : true}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-card transition-colors duration-300 ease-out",
            frame.decision?.tone === "error"
              ? "bg-error"
              : frame.decision?.tone === "accent"
                ? "bg-primary"
                : "bg-warning",
          )}
        >
          <ArrowRight size={16} strokeWidth={2.2} />
        </span>
        <span key={frame.decision?.title ?? "none"} className="viz-swap min-w-0 flex-1">
          <span className="block font-sans text-[14px] font-semibold text-ink">
            {frame.decision?.title ?? "\u00a0"}
          </span>
          {frame.decision?.detail ? (
            <span className="mt-0.5 block font-sans text-[13px] leading-snug text-slate">
              {frame.decision.detail}
            </span>
          ) : null}
        </span>
      </div>
    </div>
  );
}

export default ArrayCanvas;
