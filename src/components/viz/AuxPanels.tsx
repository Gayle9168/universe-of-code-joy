import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AuxPanel, CellState } from "@/engine/types";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface AuxPanelsProps {
  aux: AuxPanel[] | undefined;
  className?: string;
}

export function AuxPanels({ aux, className }: AuxPanelsProps): React.ReactElement | null {
  const reduced = useReducedMotion() ?? false;
  const transition = reduced ? { duration: 0 } : { duration: 0.35, ease: EASE };

  if (!aux || aux.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {aux.map((panel, panelIndex) => {
        // For queue or stack, we map the items into a bracketed array string like [2, 3, 4]
        if (panel.kind === "queue" || panel.kind === "stack") {
          return (
            <div
              key={`${panel.kind}-${panelIndex}`}
              className="flex items-center gap-3 rounded-lg border border-hairline px-4 py-2 font-mono text-[12px]"
            >
              <span className="text-slate lowercase">{panel.label}:</span>
              <ul className="flex items-center" aria-label={panel.label}>
                <span className="text-primary mr-1">[</span>
                <AnimatePresence initial={false}>
                  {panel.items.map((item, i) => (
                    <motion.li
                      key={item.id}
                      layout={!reduced}
                      initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduced ? { opacity: 0, scale: 0.8 } : { opacity: 0 }}
                      transition={transition}
                      className="text-primary flex items-center"
                    >
                      {item.label}
                      {i < panel.items.length - 1 && <span className="mr-1">,</span>}
                    </motion.li>
                  ))}
                </AnimatePresence>
                <span className="text-primary ml-1">]</span>
                {panel.items.length === 0 && (
                  <span className="text-primary/50 text-[10px]">empty</span>
                )}
              </ul>
            </div>
          );
        }

        // For keyvalue (e.g., current node: 1)
        if (panel.kind === "keyvalue") {
          // Flatten into pills
          return (
            <React.Fragment key={`${panel.kind}-${panelIndex}`}>
              {panel.rows.map((row) => (
                <div
                  key={row.k}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-hairline px-4 py-2 font-mono text-[12px]",
                    row.highlight && "bg-tint border-primary",
                  )}
                >
                  <span className="text-slate lowercase">{row.k}:</span>
                  <span className="text-primary">{row.v}</span>
                </div>
              ))}
            </React.Fragment>
          );
        }

        // Log panel is rarely used inline, but if it is, render a simple pill with the latest log
        if (panel.kind === "log") {
          const lastLine = panel.lines[panel.lines.length - 1];
          if (!lastLine) return null;
          return (
            <div
              key={`${panel.kind}-${panelIndex}`}
              className="flex items-center gap-3 rounded-lg border border-hairline px-4 py-2 font-mono text-[12px]"
            >
              <span className="text-slate lowercase">{panel.label}:</span>
              <span className="text-primary truncate max-w-[200px]">{lastLine}</span>
            </div>
          );
        }

        // Cost-per-item panel, compacted to one pill for this inline strip: the
        // player renders it as a full table (see WorkspacePanels).
        if (panel.kind === "cost") {
          return (
            <div
              key={`${panel.kind}-${panelIndex}`}
              className="flex items-center gap-3 rounded-lg border border-hairline px-4 py-2 font-mono text-[12px]"
            >
              <span className="text-slate lowercase">{panel.label}:</span>
              <span className="text-primary">{panel.rows.map((row) => row.cost).join(" + ")}</span>
              {panel.total ? (
                <span className="text-ink">
                  = {panel.total.value} / {panel.total.budget} {panel.total.ok ? "✓" : "✕"}
                </span>
              ) : null}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

export default AuxPanels;
