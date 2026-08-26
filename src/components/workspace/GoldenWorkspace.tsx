import * as React from "react";
import { AlgorithmWorldPanel } from "@/components/workspace/AlgorithmWorldPanel";
import { PlaybackBand } from "@/components/workspace/PlaybackBand";
import { CodePane, ExplainPane, InputPane, AboutPane } from "@/components/player/WorkspacePanels";
import type { Algorithm } from "@/content/types";
import type { AlgorithmModule } from "@/engine/types";
import { cn } from "@/lib/utils";

type RightTab = "code" | "input" | "about";

const TABS: Array<{ id: RightTab; label: string }> = [
  { id: "code", label: "Code" },
  { id: "input", label: "Input" },
  { id: "about", label: "About" },
];

function RightColumn({
  algo,
  module: mod,
  slug,
}: {
  algo: Algorithm;
  module: AlgorithmModule | undefined;
  slug: string;
}): React.ReactElement {
  const [tab, setTab] = React.useState<RightTab>("code");
  const tabs = TABS.filter((t) => t.id !== "input" || mod);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-col gap-4">
      <div className="flex min-h-0 flex-[6] flex-col overflow-hidden rounded-2xl border border-hairline bg-card shadow-sm">
        <div
          role="tablist"
          aria-label="Code and settings"
          className="flex gap-1 border-b border-hairline px-3 py-2"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`golden-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`golden-panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                tab === t.id ? "bg-tint font-semibold text-primary" : "text-slate hover:text-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`golden-panel-${tab}`}
          aria-labelledby={`golden-tab-${tab}`}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          {tab === "code" && <CodePane className="h-full rounded-none border-0 shadow-none" />}
          {tab === "input" && mod && <InputPane module={mod} slug={slug} />}
          {tab === "about" && <AboutPane algo={algo} />}
        </div>
      </div>

      <ExplainPane className="flex min-h-0 flex-[4] flex-col rounded-2xl border border-hairline bg-card shadow-sm" />
    </div>
  );
}

export interface GoldenWorkspaceProps {
  algo: Algorithm;
  module: AlgorithmModule | undefined;
  /** Slug the player store loaded — a question's slug when one drives the canvas. */
  slug: string;
  className?: string;
}

/**
 * The Golden Visualizer shell: Algorithm World on the left (~58%), code and
 * reasoning on the right (~42%), with the playback band spanning both columns.
 */
export function GoldenWorkspace({
  algo,
  module: mod,
  slug,
  className,
}: GoldenWorkspaceProps): React.ReactElement {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-4", className)}>
      <div className="grid min-h-0 flex-1 grid-cols-[58fr_42fr] gap-4">
        <AlgorithmWorldPanel module={mod} algoName={algo.name} className="min-h-0" />
        <RightColumn algo={algo} module={mod} slug={slug} />
      </div>
      {mod ? <PlaybackBand /> : null}
    </div>
  );
}

export default GoldenWorkspace;
