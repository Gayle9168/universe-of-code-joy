import * as React from "react";
import { ControlStrip } from "@/components/player/ControlStrip";
import { StepTimeline } from "@/components/player/StepTimeline";
import { cn } from "@/lib/utils";

export interface PlaybackBandProps {
  className?: string;
}

/**
 * The full-width band under both workspace columns: the meaningful phase
 * timeline over one row of playback controls.
 */
export function PlaybackBand({ className }: PlaybackBandProps): React.ReactElement {
  return (
    <section
      aria-label="Playback"
      className={cn(
        "flex shrink-0 flex-col gap-2 rounded-2xl border border-hairline bg-card px-6 py-3 shadow-sm",
        className,
      )}
    >
      <StepTimeline />
      <ControlStrip />
    </section>
  );
}

export default PlaybackBand;
