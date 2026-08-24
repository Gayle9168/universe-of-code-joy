import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CellState, TableFrame } from "@/engine/types";
import { DURATION, EASE, FILL, INK } from "@/components/viz/tokens";
import { StateIcon } from "@/components/viz/StateIcon";

export interface TableViewProps {
  frame: TableFrame;
  className?: string;
}

function describe(frame: TableFrame): string {
  const parts: string[] = [
    `${frame.title ?? "Table"} with ${frame.rowLabels.length} rows and ${frame.colLabels.length} columns.`,
  ];
  const active = frame.cells.filter((c) => c.state === "active");
  for (const c of active) {
    parts.push(
      `Active cell row ${frame.rowLabels[c.r] ?? c.r}, column ${frame.colLabels[c.c] ?? c.c} holds ${c.value ?? "empty"}.`,
    );
  }
  return parts.join(" ");
}

export function TableView({ frame, className }: TableViewProps): React.ReactElement {
  const reduced = useReducedMotion() ?? false;
  const transition = reduced ? { duration: 0 } : { duration: DURATION, ease: EASE };
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [fade, setFade] = React.useState(false);

  const onScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setFade(el.scrollWidth - el.clientWidth - el.scrollLeft > 2);
  }, []);

  React.useEffect(() => {
    onScroll();
  }, [onScroll, frame.colLabels.length]);

  const cellMap = React.useMemo(() => {
    const map = new Map<string, { value: string | number | null; state: CellState }>();
    for (const c of frame.cells) map.set(`${c.r}:${c.c}`, { value: c.value, state: c.state });
    return map;
  }, [frame.cells]);

  return (
    <div className={cn("relative", className)}>
      {frame.title ? (
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-slate">
          {frame.title}
        </p>
      ) : null}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="overflow-x-auto rounded-lg border border-hairline bg-card"
      >
        <table
          role="img"
          aria-label={describe(frame)}
          className="border-separate border-spacing-0 font-mono text-xs"
        >
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-card px-2 py-1.5 text-slate" />
              {frame.colLabels.map((cl, c) => (
                <th
                  key={`c-${c}`}
                  className="border-b border-hairline bg-card px-2 py-1.5 text-center font-normal text-slate"
                >
                  {cl}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {frame.rowLabels.map((rl, r) => (
              <tr key={`r-${r}`}>
                <th className="sticky left-0 z-10 border-r border-hairline bg-card px-2 py-1 text-right font-normal text-slate">
                  {rl}
                </th>
                {frame.colLabels.map((_, c) => {
                  const cell = cellMap.get(`${r}:${c}`);
                  const state: CellState = cell?.state ?? "idle";
                  const isActive = state === "active";
                  return (
                    <td key={`${r}-${c}`} className="p-0.5">
                      <motion.div
                        className="flex h-7 min-w-9 items-center justify-center rounded-md"
                        style={{ backgroundColor: FILL[state], color: INK[state] }}
                        animate={{
                          backgroundColor: FILL[state],
                          scale: isActive && !reduced ? 1.06 : 1,
                        }}
                        transition={transition}
                      >
                        <span
                          className={cn(
                            "flex h-full w-full items-center justify-center gap-1 rounded-md",
                            isActive && "ring-2 ring-accent ring-offset-1 ring-offset-card",
                          )}
                        >
                          {state !== "idle" ? (
                            <StateIcon state={state} size={12} className="shrink-0 opacity-80" />
                          ) : null}
                          <span>{cell?.value ?? ""}</span>
                        </span>
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {fade ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-lg bg-gradient-to-l from-card to-transparent"
        />
      ) : null}
    </div>
  );
}

export default TableView;
