import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArrayFrame, CellState } from "@/engine/types";

/**
 * DOM (not SVG) canvas for searching-style array frames: index labels above the
 * row, large rounded value cells, a dashed search-window bracket with labelled
 * boundary markers, a three-part comparison strip and a decision callout.
 *
 * Pure presentation — `(props: { frame }) => JSX`, no stores, no router. Static
 * styling only: this pass fixes the composition, transitions land separately.
 */

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

export interface ArrayCanvasProps {
  frame: ArrayFrame;
  className?: string;
}

export function ArrayCanvas({ frame, className }: ArrayCanvasProps): React.ReactElement {
  const n = Math.max(1, frame.values.length);
  const win = windowExtent(frame);
  const cols: React.CSSProperties = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  /* Caps the row so ten cells read at the reference size instead of stretching
     across a 1536px card; narrower viewports shrink the cells, not the layout. */
  const rowStyle: React.CSSProperties = { ...cols, maxWidth: `${n * 72}px` };

  const pointerByIndex = new Map<number, ArrayFrame["pointers"]>();
  for (const p of frame.pointers) {
    const key = Math.max(0, Math.min(p.index, n - 1));
    const bucket = pointerByIndex.get(key);
    if (bucket) bucket.push(p);
    else pointerByIndex.set(key, [p]);
  }

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      <span className="sr-only" role="img" aria-label={describe(frame)} />

      {/* target */}
      {frame.target ? (
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">
            {frame.target.label}
          </span>
          <span className="flex h-14 min-w-[3.5rem] items-center justify-center rounded-xl border border-primary/40 bg-tint px-4 font-mono text-[24px] font-semibold tabular-nums text-primary">
            {String(frame.target.value)}
          </span>
        </div>
      ) : null}

      {/* index labels */}
      <div
        aria-hidden="true"
        className={cn("mt-6 grid w-full gap-2 px-1", frame.target ? "" : "mt-0")}
        style={rowStyle}
      >
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
      <div className="mt-1.5 grid w-full gap-2 px-1" style={rowStyle}>
        {frame.values.map((value, i) => {
          const state = stateOf(frame, i);
          return (
            <div
              key={`cell-${i}`}
              className={cn(
                "flex h-[54px] items-center justify-center rounded-xl border font-mono text-[20px] font-medium tabular-nums xl:h-[58px] 2xl:h-[62px]",
                CELL_SURFACE[state],
              )}
            >
              {String(value)}
            </div>
          );
        })}
      </div>

      {/* dashed search-window bracket */}
      {win ? (
        <div className="mt-3 grid w-full gap-2 px-1" style={rowStyle}>
          <div
            className="flex flex-col items-center"
            style={{ gridColumnStart: win.from + 1, gridColumnEnd: win.to + 2 }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
              {win.label}
            </span>
            <span className="mt-1 h-px w-full border-t border-dashed border-primary/50" />
          </div>
        </div>
      ) : null}

      {/* lo / hi / mid markers */}
      <div className="mt-2 grid w-full gap-2 px-1" style={rowStyle}>
        {frame.values.map((_, i) => {
          const marks = pointerByIndex.get(i);
          return (
            <div key={`ptr-${i}`} className="flex min-h-[34px] justify-center gap-2">
              {marks?.map((p) => (
                <span key={p.name} className="flex flex-col items-center leading-tight">
                  <span className="font-mono text-[11px] font-medium text-primary">{p.name}</span>
                  <span className="font-mono text-[13px] font-semibold tabular-nums text-primary">
                    {p.index}
                  </span>
                </span>
              ))}
            </div>
          );
        })}
      </div>

      {/* comparison strip */}
      {frame.comparison ? (
        <div className="mt-5 flex w-full max-w-[520px] items-stretch rounded-xl border border-hairline bg-card">
          <div className="flex flex-1 flex-col items-center gap-0.5 px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate">
              mid value
            </span>
            <span className="font-mono text-[20px] font-semibold tabular-nums text-primary">
              {frame.comparison.left}
            </span>
          </div>
          <div className="w-px self-stretch bg-hairline" />
          <div className="flex flex-1 items-center justify-center px-4 py-3">
            <span
              className={cn(
                "font-mono text-[22px] font-semibold tabular-nums",
                frame.comparison.tone === "error" ? "text-error" : "text-warning",
              )}
            >
              {frame.comparison.left} {frame.comparison.op} {frame.comparison.right}
            </span>
          </div>
          <div className="w-px self-stretch bg-hairline" />
          <div className="flex flex-1 flex-col items-center gap-0.5 px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate">
              target
            </span>
            <span className="font-mono text-[20px] font-semibold tabular-nums text-primary">
              {frame.comparison.right}
            </span>
          </div>
        </div>
      ) : null}

      {/* decision callout */}
      {frame.decision ? (
        <div
          className={cn(
            "mt-3 flex w-full max-w-[580px] items-center gap-3 rounded-xl px-4 py-3",
            frame.decision.tone === "error"
              ? "bg-error-tint"
              : frame.decision.tone === "accent"
                ? "bg-tint"
                : "bg-warning/10",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full text-card",
              frame.decision.tone === "error"
                ? "bg-error"
                : frame.decision.tone === "accent"
                  ? "bg-primary"
                  : "bg-warning",
            )}
          >
            <ArrowRight size={16} strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-sans text-[14px] font-semibold text-ink">
              {frame.decision.title}
            </span>
            {frame.decision.detail ? (
              <span className="mt-0.5 block font-sans text-[13px] leading-snug text-slate">
                {frame.decision.detail}
              </span>
            ) : null}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export default ArrayCanvas;
