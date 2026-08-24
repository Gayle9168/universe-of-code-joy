import * as React from "react";
import { cn } from "@/lib/utils";
import type { CellState, GridFrame } from "@/engine/types";
import { FILL, INK } from "@/components/viz/tokens";
import { StateIcon } from "@/components/viz/StateIcon";

export interface GridViewProps {
  frame: GridFrame;
  className?: string;
}

function describe(frame: GridFrame): string {
  const parts: string[] = [`Grid with ${frame.rows} rows and ${frame.cols} columns.`];
  const byState: Record<string, number> = {};
  for (const c of frame.cells) {
    if (c.state === "idle") continue;
    byState[c.state] = (byState[c.state] ?? 0) + 1;
  }
  for (const [s, count] of Object.entries(byState)) parts.push(`${count} ${s} cells.`);
  if (frame.path && frame.path.length > 0) parts.push(`Path of ${frame.path.length} cells found.`);
  return parts.join(" ");
}

export function GridView({ frame, className }: GridViewProps): React.ReactElement {
  const stateMap = React.useMemo(() => {
    const map = new Map<string, { state: CellState; label?: string | number }>();
    for (const c of frame.cells) map.set(`${c.r}:${c.c}`, { state: c.state, label: c.label });
    return map;
  }, [frame.cells]);

  const pathSet = React.useMemo(
    () => new Set((frame.path ?? []).map(([r, c]) => `${r}:${c}`)),
    [frame.path],
  );

  const dense = frame.cols > 16;

  return (
    <div
      role="img"
      aria-label={describe(frame)}
      className={cn("mx-auto w-full", className)}
      style={{ maxWidth: `${Math.min(100, (frame.cols / Math.max(frame.rows, 1)) * 68)}%` }}
    >
      <div
        className="grid gap-px rounded-lg bg-hairline p-px"
        style={{
          gridTemplateColumns: `repeat(${frame.cols}, minmax(0, 1fr))`,
          aspectRatio: `${frame.cols} / ${frame.rows}`,
        }}
      >
        {Array.from({ length: frame.rows * frame.cols }, (_, k) => {
          const r = Math.floor(k / frame.cols);
          const c = k % frame.cols;
          const cell = stateMap.get(`${r}:${c}`);
          const state: CellState = cell?.state ?? "idle";
          const onPath = pathSet.has(`${r}:${c}`);
          return (
            <div
              key={`${r}:${c}`}
              className="relative flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: FILL[state] }}
            >
              {onPath ? (
                <span
                  aria-hidden
                  className="absolute inset-0 bg-accent/70"
                  style={{ position: "absolute" }}
                />
              ) : null}
              {state !== "idle" && (!dense || cell?.label === undefined) ? (
                <StateIcon
                  state={state}
                  size={dense ? 8 : 10}
                  color={onPath ? "var(--viz-active-ink)" : INK[state]}
                  className={cn(
                    "relative z-10 shrink-0 opacity-85",
                    !dense && cell?.label !== undefined && "mr-0.5",
                  )}
                />
              ) : null}
              {!dense && cell?.label !== undefined ? (
                <span
                  className="relative font-mono text-[10px] leading-none"
                  style={{ color: onPath ? "var(--viz-active-ink)" : INK[state] }}
                >
                  {cell.label}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GridView;
