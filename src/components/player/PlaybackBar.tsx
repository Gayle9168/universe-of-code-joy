import * as React from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/common/Tooltip";
import { usePlayerStore, useCanStepBack, useCanStepForward } from "@/stores/playerStore";
import { SpeedControl } from "@/components/player/SpeedControl";
import { StepCounter } from "@/components/player/StepCounter";

interface IconButtonProps {
  label: string;
  shortcut: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}

function IconButton({
  label,
  shortcut,
  icon: Icon,
  onClick,
  disabled,
  active,
}: IconButtonProps): React.ReactElement {
  return (
    <Tooltip content={`${label} · ${shortcut}`}>
      <button
        type="button"
        aria-label={`${label} (${shortcut})`}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-lg border border-transparent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          "disabled:pointer-events-none disabled:opacity-40",
          active ? "border-hairline bg-tint text-primary" : "text-ink hover:bg-tint",
        )}
      >
        <Icon size={20} strokeWidth={1.5} />
      </button>
    </Tooltip>
  );
}

export interface PlaybackBarProps {
  className?: string;
}

export function PlaybackBar({ className }: PlaybackBarProps): React.ReactElement {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const toggle = usePlayerStore((s) => s.toggle);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const first = usePlayerStore((s) => s.first);
  const last = usePlayerStore((s) => s.last);
  const index = usePlayerStore((s) => s.index);
  const total = usePlayerStore((s) => s.run?.steps.length ?? 0);

  const canBack = useCanStepBack();
  const canForward = useCanStepForward();
  const isEnded = total > 0 && index >= total - 1;

  return (
    <div className={cn("grid grid-cols-3 items-center w-full gap-4", className)}>
      {/* Left section: Speed and Auto play */}
      <div className="flex items-center gap-6 justify-start">
        <div className="flex items-center gap-3">
          <span className="font-sans text-[13px] font-medium text-ink">Speed</span>
          <SpeedControl />
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={total === 0}
          className="flex items-center gap-2 font-mono text-[12px] text-ink hover:text-primary transition-colors disabled:opacity-40"
        >
          {isPlaying ? <Pause size={14} /> : isEnded ? <RotateCcw size={14} /> : <Play size={14} />}
          {isEnded ? "Replay" : "Auto play"}
        </button>
      </div>

      {/* Center section: Playback Controls */}
      <div className="flex items-center gap-1 justify-center">
        <IconButton
          label="First step"
          shortcut="Home"
          icon={RotateCcw}
          onClick={first}
          disabled={!canBack}
        />
        <IconButton
          label="Previous step"
          shortcut="←"
          icon={ChevronLeft}
          onClick={prev}
          disabled={!canBack}
        />
        <Tooltip content={`${isPlaying ? "Pause" : isEnded ? "Replay" : "Play"} · Space`}>
          <button
            type="button"
            aria-label={`${isPlaying ? "Pause" : isEnded ? "Replay" : "Play"} (Space)`}
            disabled={total === 0}
            onClick={toggle}
            className={cn(
              "mx-1 inline-flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity",
              "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            {isPlaying ? (
              <Pause size={18} strokeWidth={2} />
            ) : isEnded ? (
              <RotateCcw size={18} strokeWidth={2} />
            ) : (
              <Play size={18} strokeWidth={2} className="ml-0.5" />
            )}
          </button>
        </Tooltip>
        <IconButton
          label="Next step"
          shortcut="→"
          icon={ChevronRight}
          onClick={next}
          disabled={!canForward}
        />
        <IconButton
          label="Last step"
          shortcut="End"
          icon={SkipForward}
          onClick={last}
          disabled={!canForward}
        />
      </div>

      {/* Right section: Step Counter */}
      <div className="flex items-center justify-end">
        <StepCounter />
      </div>
    </div>
  );
}

export default PlaybackBar;
