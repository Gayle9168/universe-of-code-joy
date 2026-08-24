import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TreeFrame } from "@/engine/types";
import {
  DURATION,
  EASE,
  EDGE_STROKE,
  EDGE_WIDTH,
  FILL,
  INK,
  NODE_R,
  VIEW_BOX,
} from "@/components/viz/tokens";
import { StateIcon } from "@/components/viz/StateIcon";

export interface TreeViewProps {
  frame: TreeFrame;
  className?: string;
}

function describe(frame: TreeFrame): string {
  const parts: string[] = [`Tree with ${frame.nodes.length} nodes.`];
  const byState: Record<string, string[]> = {};
  for (const n of frame.nodes) {
    if (n.state === "idle") continue;
    (byState[n.state] ??= []).push(String(n.label));
  }
  for (const [s, list] of Object.entries(byState)) parts.push(`${s}: ${list.join(", ")}.`);
  const treeEdges = frame.edges.filter((e) => e.state === "tree").length;
  if (treeEdges > 0) parts.push(`${treeEdges} edges included in the traversal.`);
  return parts.join(" ");
}

export function TreeView({ frame, className }: TreeViewProps): React.ReactElement {
  const reduced = useReducedMotion() ?? false;
  const transition = reduced ? { duration: 0 } : { duration: DURATION, ease: EASE };
  const pos = React.useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const n of frame.nodes) map.set(n.id, { x: n.x, y: n.y });
    return map;
  }, [frame.nodes]);

  return (
    <svg
      role="img"
      aria-label={describe(frame)}
      viewBox={VIEW_BOX}
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-auto w-full", className)}
    >
      <g>
        {frame.edges.map((e) => {
          const a = pos.get(e.from);
          const b = pos.get(e.to);
          if (!a || !b) return null;
          return (
            <motion.line
              key={`${e.from}-${e.to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={EDGE_STROKE[e.state]}
              strokeWidth={EDGE_WIDTH[e.state]}
              strokeLinecap="round"
              animate={{ stroke: EDGE_STROKE[e.state] }}
              transition={transition}
            />
          );
        })}
      </g>
      <g>
        {frame.edges.map((e) => {
          if (!e.label) return null;
          const a = pos.get(e.from);
          const b = pos.get(e.to);
          if (!a || !b) return null;
          return (
            <text
              key={`l-${e.from}-${e.to}`}
              x={(a.x + b.x) / 2}
              y={(a.y + b.y) / 2 - 1}
              textAnchor="middle"
              fontSize={3}
              fill="var(--viz-idle-ink)"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              {e.label}
            </text>
          );
        })}
      </g>
      <g>
        {frame.nodes.map((n) => (
          <g key={n.id}>
            <motion.circle
              cx={n.x}
              cy={n.y}
              r={NODE_R}
              fill={FILL[n.state]}
              stroke="var(--viz-edge)"
              strokeWidth={0.5}
              animate={{ fill: FILL[n.state] }}
              transition={transition}
            />
            <text
              x={n.x}
              y={n.y + 1.4}
              textAnchor="middle"
              fontSize={4}
              fill={INK[n.state]}
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              {n.label}
            </text>
            {n.state !== "idle" ? (
              <g transform={`translate(${n.x - NODE_R - 2}, ${n.y - NODE_R - 2})`}>
                <circle
                  cx={1.8}
                  cy={1.8}
                  r={2.2}
                  fill="var(--color-card)"
                  stroke="var(--viz-edge)"
                  strokeWidth={0.3}
                />
                <g transform="translate(0.3, 0.3)">
                  <StateIcon state={n.state} size={3} color={INK[n.state]} />
                </g>
              </g>
            ) : null}
            {n.badge ? (
              <g>
                <rect
                  x={n.x + 2.4}
                  y={n.y - NODE_R - 3.4}
                  width={Math.max(4.6, String(n.badge).length * 2.2 + 2)}
                  height={4.4}
                  rx={2.2}
                  fill="var(--viz-frontier)"
                  stroke="var(--viz-edge)"
                  strokeWidth={0.3}
                />
                <text
                  x={n.x + 2.4 + Math.max(4.6, String(n.badge).length * 2.2 + 2) / 2}
                  y={n.y - NODE_R - 0.2}
                  textAnchor="middle"
                  fontSize={2.8}
                  fill="var(--viz-frontier-ink)"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}
                >
                  {n.badge}
                </text>
              </g>
            ) : null}
          </g>
        ))}
      </g>
    </svg>
  );
}

export default TreeView;
