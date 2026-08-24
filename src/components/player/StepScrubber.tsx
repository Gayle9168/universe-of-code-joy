import * as React from "react";
import { cn } from "@/lib/utils";
import { usePlayerStore, usePhaseSegments } from "@/stores/playerStore";

const PHASE_COLORS: string[] = [
  "bg-viz-visited",
  "bg-viz-frontier",
  "bg-viz-sorted",
  "bg-viz-idle",
  "bg-tint",
  "bg-viz-excluded",
];

function truncate(text: string, max = 80): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export interface StepScrubberProps {
  className?: string;
}

export function StepScrubber({ className }: StepScrubberProps): React.ReactElement | null {
  const run = usePlayerStore((s) => s.run);
  const index = usePlayerStore((s) => s.index);
  const seek = usePlayerStore((s) => s.seek);
  const stepToNextMilestone = usePlayerStore((s) => s.stepToNextMilestone);
  const stepToPrevMilestone = usePlayerStore((s) => s.stepToPrevMilestone);
  const segments = usePhaseSegments();

  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const draggingRef = React.useRef(false);

  const total = run?.steps.length ?? 0;
  const max = Math.max(0, total - 1);
  if (!run || total === 0) return null;

  const phaseNames = Array.from(new Set(segments.map((s) => s.phase)));
  const colorFor = (phase: string): string =>
    PHASE_COLORS[phaseNames.indexOf(phase) % PHASE_COLORS.length]!;

  const pct = (i: number): number => (max === 0 ? 0 : (i / max) * 100);

  const indexFromClientX = (clientX: number): number => {
    const el = trackRef.current;
    if (!el) return index;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(ratio * max);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    seek(indexFromClientX(event.clientX));
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    const at = indexFromClientX(event.clientX);
    setHoverIndex(at);
    if (draggingRef.current) seek(at);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.shiftKey) {
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        event.stopPropagation();
        stepToNextMilestone();
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        event.stopPropagation();
        stepToPrevMilestone();
        return;
      }
    }

    let target: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        target = index + 1;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        target = index - 1;
        break;
      case "PageUp":
        target = index + 10;
        break;
      case "PageDown":
        target = index - 10;
        break;
      case "Home":
        target = 0;
        break;
      case "End":
        target = max;
        break;
      default:
        target = null;
    }
    if (target !== null) {
      event.preventDefault();
      event.stopPropagation();
      seek(target);
    }
  };

  const narration = run.steps[index]?.narration ?? "";
  const hoverStep = hoverIndex === null ? null : run.steps[hoverIndex];

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Algorithm step"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={index}
        aria-valuetext={narration}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => setHoverIndex(null)}
        onKeyDown={onKeyDown}
        className={cn(
          "relative h-6 w-full cursor-pointer touch-none select-none rounded-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
        )}
      >
        {/* phase bands */}
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-hairline">
          {segments.map((segment) => {
            const left = pct(segment.from);
            const right = pct(segment.to + 1 > max ? max : segment.to + 1);
            return (
              <div
                key={`${segment.phase}-${segment.from}`}
                className={cn("absolute inset-y-0", colorFor(segment.phase))}
                style={{ left: `${left}%`, width: `${Math.max(0.6, right - left)}%` }}
                title={segment.phase}
              />
            );
          })}
        </div>

        {/* progress fill */}
        <div
          className="pointer-events-none absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-primary/25"
          style={{ width: `${pct(index)}%` }}
        />

        {/* milestone ticks */}
        {run.steps.map((step, i) =>
          step.isMilestone ? (
            <span
              key={`tick-${i}`}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 h-2.5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-primary/60 rounded-full"
              style={{ left: `${pct(i)}%` }}
            />
          ) : null,
        )}

        {/* thumb */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-sm ring-2 ring-card"
          style={{ left: `${pct(index)}%` }}
        />

        {hoverStep ? (
          <div
            className="pointer-events-none absolute bottom-full z-10 mb-1 max-w-72 -translate-x-1/2 rounded-lg border border-hairline bg-card px-2 py-1 text-xs text-ink shadow-sm"
            style={{ left: `${pct(hoverIndex ?? 0)}%` }}
          >
            <span className="font-mono text-[10px] text-slate">
              {(hoverIndex ?? 0) + 1}/{total}
            </span>{" "}
            {truncate(hoverStep.narration)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default StepScrubber;
