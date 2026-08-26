import * as React from "react";
import { cn } from "@/lib/utils";

export type FeedbackTone = "correct" | "incorrect" | "neutral";

export interface LearningFeedbackProps {
  tone: FeedbackTone;
  /** The sentence itself; null renders nothing but keeps the live region mounted. */
  message: string | null;
  /** Prefix announced before the message on a wrong answer. */
  prefix?: string;
  className?: string;
}

/**
 * The one feedback callout shared by the Prediction Gate and Trace Mode: a
 * single polite live region with exactly one sentence per outcome, focusable so
 * keyboard users land on the explanation. Never an aggressive red panel.
 */
export const LearningFeedback = React.forwardRef<HTMLParagraphElement, LearningFeedbackProps>(
  function LearningFeedback({ tone, message, prefix, className }, ref): React.ReactElement {
    return (
      <div aria-live="polite" aria-atomic="true" className={className}>
        {message ? (
          <p
            ref={ref}
            tabIndex={-1}
            className={cn(
              "rounded-lg border px-3 py-2 font-sans text-[12px] leading-relaxed outline-none",
              tone === "incorrect"
                ? "border-hairline bg-paper text-ink"
                : "border-primary/20 bg-tint text-ink",
            )}
          >
            {prefix ? `${prefix} ` : null}
            {message}
          </p>
        ) : null}
      </div>
    );
  },
);

export default LearningFeedback;
