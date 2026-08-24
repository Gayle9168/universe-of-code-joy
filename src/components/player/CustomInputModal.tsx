import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Play, Dices } from "lucide-react";
import { Button } from "@/components/common/Button";
import type { AlgorithmModule, InputField } from "@/engine/types";
import { usePlayerStore } from "@/stores/playerStore";
import { useIsReducedMotion } from "@/hooks/useReducedMotionSync";

function randomValue(field: InputField): string {
  switch (field.kind) {
    case "numbers": {
      const count = 8;
      return Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 98)).join(", ");
    }
    case "number": {
      const span = field.max - field.min;
      return String(field.min + Math.floor(Math.random() * (span + 1)));
    }
    case "select": {
      const pick = field.options[Math.floor(Math.random() * field.options.length)];
      return String(pick ?? field.default);
    }
    case "text":
    case "graph":
    case "grid":
    default:
      return String(field.default);
  }
}

export interface CustomInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: AlgorithmModule;
  slug: string;
  onRun?: (values: Record<string, string>) => void;
}

export function CustomInputModal({
  isOpen,
  onClose,
  module: mod,
  slug,
  onRun,
}: CustomInputModalProps): React.ReactElement {
  const rawInputs = usePlayerStore((s) => s.rawInputs);
  const error = usePlayerStore((s) => s.error);
  const load = usePlayerStore((s) => s.load);
  const reducedMotion = useIsReducedMotion();

  const [draft, setDraft] = React.useState<Record<string, string>>(rawInputs);

  React.useEffect(() => {
    if (isOpen) {
      setDraft(rawInputs);
    }
  }, [isOpen, rawInputs]);

  const run = React.useCallback(
    (values: Record<string, string>): void => {
      if (onRun) onRun(values);
      else load(slug, values);
      onClose();
    },
    [onRun, load, slug, onClose],
  );

  const setField = (name: string, value: string): void =>
    setDraft((d) => ({ ...d, [name]: value }));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-input-title"
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-hairline bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
              <h2 id="custom-input-title" className="font-sans text-[16px] font-medium text-ink">
                Custom Input
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate transition-colors hover:bg-paper hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex flex-wrap gap-2">
                {mod.presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setDraft(preset.values);
                    }}
                    className="rounded-full border border-hairline bg-card px-3 py-1 font-mono text-xs text-ink transition-colors hover:bg-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {mod.inputs.map((field) => {
                  const id = `field-${slug}-${field.name}`;
                  const value = draft[field.name] ?? String(field.default);
                  return (
                    <div key={field.name} className="space-y-1.5">
                      <label htmlFor={id} className="t-mono-label block">
                        {field.label}
                      </label>
                      {field.kind === "select" ? (
                        <div className="relative">
                          <select
                            id={id}
                            value={value}
                            onChange={(e) => setField(field.name, e.target.value)}
                            className="h-10 w-full appearance-none rounded-lg border border-hairline bg-card px-3 pr-8 font-mono text-sm text-ink outline-none hover:border-slate/30 focus-visible:ring-2 focus-visible:ring-primary/30"
                          >
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate">
                            <svg
                              aria-hidden="true"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </div>
                        </div>
                      ) : field.kind === "number" ? (
                        <input
                          id={id}
                          type="number"
                          min={field.min}
                          max={field.max}
                          value={value}
                          onChange={(e) => setField(field.name, e.target.value)}
                          className="h-10 w-full rounded-lg border border-hairline bg-card px-3 font-mono text-sm text-ink outline-none hover:border-slate/30 focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      ) : field.kind === "graph" || field.kind === "grid" ? (
                        <textarea
                          id={id}
                          rows={4}
                          value={value}
                          onChange={(e) => setField(field.name, e.target.value)}
                          className="w-full resize-none rounded-lg border border-hairline bg-card px-3 py-2 font-mono text-sm text-ink outline-none hover:border-slate/30 focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      ) : (
                        <input
                          id={id}
                          type="text"
                          value={value}
                          onChange={(e) => setField(field.name, e.target.value)}
                          className="h-10 w-full rounded-lg border border-hairline bg-card px-3 font-mono text-sm text-ink outline-none hover:border-slate/30 focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      )}
                      {"help" in field && field.help ? (
                        <p className="font-mono text-[11px] text-slate">{field.help}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-error-tint px-3 py-2 font-mono text-xs text-error"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-hairline bg-paper px-6 py-4">
              <Button
                size="sm"
                variant="secondary"
                leadingIcon={Dices}
                onClick={() => {
                  const next: Record<string, string> = {};
                  for (const field of mod.inputs) next[field.name] = randomValue(field);
                  setDraft(next);
                }}
              >
                Randomize
              </Button>
              <div className="flex items-center gap-3">
                <Button size="sm" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button size="sm" leadingIcon={Play} onClick={() => run(draft)}>
                  Run Algorithm
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CustomInputModal;
