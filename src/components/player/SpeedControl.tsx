import * as React from "react";
import { cn } from "@/lib/utils";
import { usePrefsStore } from "@/stores/prefsStore";

const SPEEDS: number[] = [0.25, 0.5, 1, 1.5, 2, 4];

export interface SpeedControlProps {
  className?: string;
}

export function SpeedControl({ className }: SpeedControlProps): React.ReactElement {
  const speed = usePrefsStore((s) => s.playbackSpeed);
  const setPlaybackSpeed = usePrefsStore((s) => s.setPlaybackSpeed);

  return (
    <div
      role="radiogroup"
      aria-label="Playback speed"
      className={cn("relative flex items-center h-6 w-32", className)}
    >
      <div className="absolute inset-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-hairline" />
      {SPEEDS.map((value, i) => {
        const active = Math.abs(value - speed) < 0.001;
        const left = (i / (SPEEDS.length - 1)) * 100;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`Speed ${value}x`}
            onClick={() => setPlaybackSpeed(value)}
            className={cn(
              "absolute top-1/2 flex size-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              active
                ? "bg-primary ring-2 ring-card z-10"
                : "bg-slate-soft/30 hover:bg-slate-soft/50 z-0",
            )}
            style={{ left: `${left}%` }}
          />
        );
      })}
    </div>
  );
}

export default SpeedControl;
