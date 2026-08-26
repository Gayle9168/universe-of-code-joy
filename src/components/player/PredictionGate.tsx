import * as React from "react";
import { Check, HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prediction, PredictionOptionId } from "@/lib/prediction";
import type { PredictionEntry } from "@/stores/predictionStore";
import { usePredictionStoreApi } from "@/stores/predictionStore";

export interface PredictionGateProps {
  prediction: Prediction;
  entry: PredictionEntry;
  className?: string;
}

/**
 * The Prediction Gate: the reasoning card's body while a checkpoint is
 * unresolved. It never moves the player — Continue only marks the interaction
 * finished so the normal teaching content may render on the *same* step.
 *
 * `data-player-keys="off"` tells the global player shortcuts to stand down while
 * focus is inside, so Space selects a radio instead of starting playback.
 */
export function PredictionGate({
  prediction,
  entry,
  className,
}: PredictionGateProps): React.ReactElement {
  const storeApi = usePredictionStoreApi();
  const feedbackRef = React.useRef<HTMLParagraphElement | null>(null);
  const id = prediction.id;

  const status = entry.status;
  const selected = entry.selectedOptionId ?? null;
  const isCorrect = status === "correct";
  const isRevealed = status === "revealed";
  const isIncorrect = status === "incorrect";
  const resolvedView = isCorrect || isRevealed;

  /* One announcement per resolution, and focus lands on the sentence that
     explains it, so keyboard users are not hunting for the result. */
  React.useEffect(() => {
    if (isCorrect || isRevealed || isIncorrect) feedbackRef.current?.focus();
  }, [isCorrect, isRevealed, isIncorrect]);

  const feedback = resolvedView
    ? prediction.explanation
    : isIncorrect && selected
      ? prediction.misconceptionFeedback[selected]
      : null;

  const heading = resolvedView
    ? isCorrect
      ? "Correct"
      : "Answer revealed"
    : isIncorrect
      ? "Not quite"
      : "Your turn";

  const onSelect = (optionId: PredictionOptionId): void => storeApi.getState().select(id, optionId);

  return (
    <section
      aria-labelledby={`prediction-heading-${id}`}
      data-player-keys="off"
      data-prediction-gate={status}
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex items-center gap-1.5">
        {resolvedView ? (
          isCorrect ? (
            <Check aria-hidden="true" size={14} strokeWidth={1.8} className="text-accent-strong" />
          ) : (
            <Info aria-hidden="true" size={14} strokeWidth={1.5} className="text-slate" />
          )
        ) : (
          <HelpCircle aria-hidden="true" size={14} strokeWidth={1.5} className="text-primary" />
        )}
        <h3
          id={`prediction-heading-${id}`}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate"
        >
          Prediction checkpoint — {heading}
        </h3>
      </div>

      <p className="font-sans text-[13px] leading-relaxed text-ink">{prediction.question}</p>

      {/* The evidence rows the learner reasons from are already on screen in the
          Variable Board and the comparison card, so the gate repeats only the
          comparison line and stays inside the reasoning card without pushing the
          options and Check answer below the fold. The full evidence still reaches
          screen readers through the accessible prompt. */}
      <p className="font-mono text-[11px] text-slate-soft">
        {prediction.context[prediction.context.length - 1]}
      </p>

      {resolvedView ? null : (
        <div
          role="radiogroup"
          aria-labelledby={`prediction-heading-${id}`}
          className="flex flex-col gap-1.5"
        >
          {prediction.options.map((option) => {
            const active = selected === option.id;
            return (
              <label
                key={option.id}
                className={cn(
                  "flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-1.5 transition-colors",
                  active ? "border-primary bg-tint" : "border-hairline bg-card hover:bg-tint/60",
                )}
              >
                <input
                  type="radio"
                  name={`prediction-${id}`}
                  value={option.id}
                  checked={active}
                  onChange={() => onSelect(option.id)}
                  className="size-4 shrink-0 accent-[var(--accent-strong)]"
                />
                {/* Selection is carried by the check glyph and the weight, never
                    by colour alone. */}
                <span
                  className={cn(
                    "flex-1 font-mono text-[12px]",
                    active ? "font-semibold text-ink" : "text-slate",
                  )}
                >
                  {option.label}
                </span>
                {active ? (
                  <Check
                    aria-hidden="true"
                    size={13}
                    strokeWidth={2}
                    className="shrink-0 text-accent-strong"
                  />
                ) : null}
              </label>
            );
          })}
        </div>
      )}

      {/* The single live region for the gate: exactly one sentence per outcome. */}
      <div aria-live="polite" aria-atomic="true">
        {feedback ? (
          <p
            ref={feedbackRef}
            tabIndex={-1}
            className={cn(
              "rounded-lg border px-3 py-2 font-sans text-[12px] leading-relaxed outline-none",
              isIncorrect
                ? "border-hairline bg-paper text-ink"
                : "border-primary/20 bg-tint text-ink",
            )}
          >
            {isIncorrect ? "Not quite. " : null}
            {feedback}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        {resolvedView ? (
          <button
            type="button"
            onClick={() => storeApi.getState().continueFrom(id)}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 font-sans text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
          >
            Continue
          </button>
        ) : isIncorrect ? (
          <>
            <button
              type="button"
              onClick={() => storeApi.getState().retry(id)}
              className="inline-flex h-9 items-center rounded-lg border border-primary/30 bg-card px-4 font-sans text-[13px] font-medium text-primary transition-colors hover:bg-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => storeApi.getState().reveal(id, prediction.correctOptionId)}
              className="inline-flex h-9 items-center rounded-lg px-2 font-sans text-[12px] text-slate underline decoration-hairline underline-offset-4 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              Show answer
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={!selected}
            onClick={() => storeApi.getState().check(id, prediction.correctOptionId)}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 font-sans text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
          >
            Check answer
          </button>
        )}
      </div>

      <span className="sr-only">{prediction.accessiblePrompt}</span>
    </section>
  );
}

export default PredictionGate;
