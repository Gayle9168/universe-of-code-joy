import * as React from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayerStore, useCanStepBack, useCanStepForward } from "@/stores/playerStore";
import { SpeedControl } from "@/components/player/SpeedControl";

/**
 * The single-row control strip under the timeline: Previous, Play/Pause, Next,
 * Speed. Deliberately smaller than `PlaybackBar` — the reference workspace gives
 * the canvas the height, so the controls stay one compact row.
 */
export interface ControlStripProps {
  className?: string;
}

export function ControlStrip({ className }: ControlStripProps): React.ReactElement {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const toggle = usePlayerStore((s) => s.toggle);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const index = usePlayerStore((s) => s.index);
  const total = usePlayerStore((s) => s.run?.steps.length ?? 0);
  const canBack = useCanStepBack();
  const canForward = useCanStepForward();
  const isEnded = total > 0 && index >= total - 1;

  const side =
    "inline-flex h-9 items-center gap-1.5 rounded-lg border border-hairline bg-card px-3 font-sans text-[13px] font-medium text-ink transition-colors hover:bg-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className={cn("flex w-full items-center justify-between gap-4", className)}>
      <button
        type="button"
        aria-label="Previous step (←)"
        onClick={prev}
        disabled={!canBack}
        className={side}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
        Previous
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`${isPlaying ? "Pause" : isEnded ? "Replay" : "Play"} (Space)`}
          onClick={toggle}
          disabled={total === 0}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 font-sans text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
        >
          {isPlaying ? (
            <Pause size={16} strokeWidth={2} />
          ) : isEnded ? (
            <RotateCcw size={16} strokeWidth={2} />
          ) : (
            <Play size={16} strokeWidth={2} />
          )}
          {isPlaying ? "Pause" : isEnded ? "Replay" : "Play"}
        </button>
        <span className="font-mono text-[12px] tabular-nums text-slate">
          {total === 0 ? "0 / 0" : `${index + 1} / ${total}`}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="font-sans text-[13px] font-medium text-slate">Speed</span>
          <SpeedControl />
        </div>
        <button
          type="button"
          aria-label="Next step (→)"
          onClick={next}
          disabled={!canForward}
          className={side}
        >
          Next
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export default ControlStrip;
