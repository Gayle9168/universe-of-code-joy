import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArrayFrame } from "@/engine/types";

export interface DecisionNoteProps {
  /** Null on steps that conclude nothing yet. */
  decision: ArrayFrame["decision"] | null;
  className?: string;
}

const TONE: Record<"accent" | "error" | "warning", string> = {
  accent: "border-primary/25 bg-tint text-accent-strong",
  error: "border-error/25 bg-error-tint text-error",
  warning: "border-warning/25 bg-warning-tint text-warning",
};

/**
 * The consequence line: what the comparison lets us conclude, and which region
 * that rules out. Rendered only on steps that carry a decision, so nothing
 * empty is ever held open. Pure presentation.
 */
export function DecisionNote({
  decision,
  className,
}: DecisionNoteProps): React.ReactElement | null {
  if (!decision) return null;
  const tone = TONE[decision.tone ?? "accent"];

  return (
    <section
      aria-label="Decision"
      className={cn(
        "viz-swap flex w-full items-start gap-2 rounded-xl border px-4 py-2.5",
        tone,
        className,
      )}
      key={decision.title}
    >
      <ArrowRight aria-hidden="true" size={15} strokeWidth={1.5} className="mt-[3px] shrink-0" />
      <p className="min-w-0 font-sans text-[13px] leading-[1.45]">
        <span className="font-semibold">{decision.title}</span>
        {decision.detail ? <span className="text-ink"> — {decision.detail}</span> : null}
      </p>
    </section>
  );
}

export default DecisionNote;
