import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Copy, Dices, MonitorPlay, Play } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { resolveCodeLine } from "@/engine/builder";
import { ControlStrip } from "@/components/player/ControlStrip";
import { StepTimeline } from "@/components/player/StepTimeline";
import { ArrayCanvas } from "@/components/viz/ArrayCanvas";
import { FrameView } from "@/components/viz/FrameView";
import { getAlgorithm } from "@/content/algorithms";
import type { Algorithm } from "@/content/types";
import type { AlgorithmModule, InputField, AuxPanel } from "@/engine/types";
import { cn } from "@/lib/utils";
import { deriveReasoning } from "@/lib/reasoning";
import { tokenizeLine, type TokenKind } from "@/lib/syntaxHighlight";

import { useIsReducedMotion } from "@/hooks/useReducedMotionSync";
import { usePlayerStore, useCurrentStep } from "@/stores/playerStore";
import { usePrefsStore, type CodeLanguage } from "@/stores/prefsStore";

/* ---------------- code tab ---------------- */

/** Token colours, all from the theme tokens — the palette stays teal + ink. */
const TOKEN_CLASS: Record<TokenKind, string> = {
  keyword: "text-accent-strong",
  number: "text-ink",
  string: "text-accent-strong/80",
  comment: "text-slate-soft italic",
  fn: "text-ink font-medium",
  punct: "text-slate",
  plain: "",
};

const LANGS: { id: CodeLanguage; label: string; name: string }[] = [
  { id: "js", label: "JS", name: "JavaScript" },
  { id: "ts", label: "TS", name: "TypeScript" },
  { id: "py", label: "PY", name: "Python" },
];

export function CodePane({
  className,
  /** Hides the pane's own heading when a tab strip already names it. */
  hideTitle = false,
}: {
  className?: string;
  hideTitle?: boolean;
}): React.ReactElement | null {
  const run = usePlayerStore((s) => s.run);
  const index = usePlayerStore((s) => s.index);
  const language = usePrefsStore((s) => s.language);
  const setLanguage = usePrefsStore((s) => s.setLanguage);
  const reducedMotion = useIsReducedMotion();
  const activeRef = React.useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  const rawCodeLine = run?.steps[index]?.codeLine ?? null;
  /** `rawCodeLine` indexes the pseudocode; the listings need it translated. */
  const codeLine = run ? resolveCodeLine(run, language, rawCodeLine) : null;
  const lines = React.useMemo(() => run?.codeByLang[language] ?? [], [run, language]);

  React.useEffect(() => {
    const el = activeRef.current;
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: reducedMotion ? "auto" : "smooth" });
  }, [codeLine, language, reducedMotion]);

  if (!run) return null;

  const onCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const activeLang = LANGS.find((l) => l.id === language) ?? LANGS[0];

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col rounded-2xl border border-hairline bg-card shadow-sm",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-hairline px-4 py-3",
          hideTitle ? "justify-end" : "justify-between",
        )}
      >
        {hideTitle ? null : (
          <h2 className="font-sans text-[14px] font-medium text-ink">Code ({activeLang.name})</h2>
        )}
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
              className="appearance-none bg-transparent pr-4 font-mono text-[12px] text-ink outline-none cursor-pointer"
            >
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate">
              <svg
                aria-hidden="true"
                width="12"
                height="12"
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
          <button
            onClick={() => void onCopy()}
            className="flex items-center gap-1.5 font-mono text-[12px] text-primary hover:opacity-80 transition-opacity"
          >
            {copied ? (
              <Check className="h-3 w-3" strokeWidth={2.5} />
            ) : (
              <Copy className="h-3 w-3" strokeWidth={2} />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-2 py-3">
        {lines.map((line, i) => {
          const lineNo = i + 1;
          const isActive = codeLine === lineNo;
          return (
            <div
              key={lineNo}
              ref={isActive ? activeRef : undefined}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "group flex items-start gap-4 px-2 py-0 font-mono text-[13px] leading-5",
                "transition-[background-color,border-color,color] duration-300 ease-out",
                isActive
                  ? "border-l-2 border-primary bg-tint text-ink"
                  : "border-l-2 border-transparent text-slate",
              )}
            >
              {isActive ? (
                <div className="flex w-6 shrink-0 select-none items-center justify-end text-primary">
                  <svg
                    aria-hidden="true"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 3 14 9-14 9z" />
                  </svg>
                </div>
              ) : (
                <span className="w-6 shrink-0 select-none text-right text-slate">{lineNo}</span>
              )}
              <code className="whitespace-pre">
                {line === ""
                  ? " "
                  : tokenizeLine(line).map((t, ti) => (
                      <span key={ti} className={TOKEN_CLASS[t.kind]}>
                        {t.text}
                      </span>
                    ))}
              </code>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- explain tab ---------------- */

export function ExplainPane({ className }: { className?: string }): React.ReactElement {
  const run = usePlayerStore((s) => s.run);
  const index = usePlayerStore((s) => s.index);
  const step = useCurrentStep();
  const goNext = usePlayerStore((s) => s.next);
  const bodyRef = React.useRef<HTMLDivElement | null>(null);

  const prevStep = run && index > 0 ? (run.steps[index - 1] ?? null) : null;
  /* Reasoning is derived from the same canonical step the canvas, the variable
     board and the code pane read, so the panel can never disagree with them. */
  const reasoning = deriveReasoning(step, prevStep, index + 1);

  /* A new step starts at the beginning of its explanation instead of inheriting
     the previous step's scroll position. Never moves focus. */
  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [index]);

  if (!run || !step || !reasoning) {
    return (
      <div className="rounded-2xl border border-hairline bg-card p-6 shadow-sm">
        <p className="t-body text-slate">Run the algorithm to see the explanation.</p>
      </div>
    );
  }

  const hasNextStep = index + 1 < run.steps.length;

  return (
    <div
      className={cn("flex flex-col rounded-xl border border-hairline bg-card shadow-sm", className)}
    >
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <h2 className="font-sans text-[14px] font-medium text-ink">Reasoning</h2>
        {/* Step counting is secondary information next to the reasoning itself. */}
        <span className="font-mono text-[11px] text-slate-soft">
          Step {index + 1} / {run.steps.length}
        </span>
      </div>

      {/* No aria-live here: the workspace already announces one concise summary
          per step, and four regions talking at once is unusable on autoplay. */}
      <div ref={bodyRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3.5">
        <div>
          <h3 className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate">
            What happened
          </h3>
          {/* Keyed on the step so only the text cross-fades — the panel stays put. */}
          <p
            key={`happened-${index}`}
            className="viz-swap font-sans text-[13px] leading-relaxed text-ink"
          >
            {reasoning.happened}
          </p>
        </div>

        {reasoning.why ? (
          <div>
            <h3 className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate">
              Why
            </h3>
            {/* Why is the reasoning that matters most, so it keeps ink weight. */}
            <p
              key={`why-${index}`}
              className="viz-swap font-sans text-[13px] leading-relaxed text-ink"
            >
              {reasoning.why}
            </p>
          </div>
        ) : null}

        {reasoning.invariant ? (
          <div>
            <h3 className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate">
              {reasoning.invariantLabel}
            </h3>
            <p
              key={`invariant-${index}`}
              className="viz-swap rounded-lg border border-primary/20 bg-tint px-3 py-2 font-sans text-[13px] leading-relaxed text-ink"
            >
              {reasoning.invariant}
            </p>
          </div>
        ) : null}

        {/* Terminal steps have no Next: the section and its control both go away
            rather than offering a stale action. */}
        {reasoning.next && hasNextStep ? (
          <div className="flex items-center justify-between gap-3 border-t border-hairline pt-2.5">
            <p
              key={`next-${index}`}
              className="min-w-0 flex-1 font-sans text-[12px] leading-relaxed text-slate"
            >
              Next: {reasoning.next}
            </p>
            <button
              type="button"
              aria-label="Next step (→)"
              onClick={goNext}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-card text-primary transition-colors hover:bg-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <ArrowRight size={16} strokeWidth={1.8} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

}

/* ---------------- input tab ---------------- */

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
      return String(field.default);
    case "graph":
    case "grid":
    default:
      return String(field.default);
  }
}

export interface InputPaneProps {
  module: AlgorithmModule;
  slug: string;
  /** Called instead of the local player when the caller owns loading (compare mode). */
  onRun?: (values: Record<string, string>) => void;
}

export function InputPane({ module: mod, slug, onRun }: InputPaneProps): React.ReactElement {
  const rawInputs = usePlayerStore((s) => s.rawInputs);
  const error = usePlayerStore((s) => s.error);
  const load = usePlayerStore((s) => s.load);
  const [draft, setDraft] = React.useState<Record<string, string>>(rawInputs);

  React.useEffect(() => {
    setDraft(rawInputs);
  }, [rawInputs]);

  const run = React.useCallback(
    (values: Record<string, string>): void => {
      if (onRun) onRun(values);
      else load(slug, values);
    },
    [onRun, load, slug],
  );

  const setField = (name: string, value: string): void =>
    setDraft((d) => ({ ...d, [name]: value }));

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap gap-2">
        {mod.presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setDraft(preset.values);
              run(preset.values);
            }}
            className="rounded-full border border-hairline bg-card px-3 py-1 font-mono text-xs text-ink transition-colors hover:bg-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {mod.inputs.map((field) => {
          const id = `field-${slug}-${field.name}`;
          const value = draft[field.name] ?? String(field.default);
          return (
            <div key={field.name} className="space-y-1.5">
              <label htmlFor={id} className="t-mono-label block">
                {field.label}
              </label>
              {field.kind === "select" ? (
                <select
                  id={id}
                  value={value}
                  onChange={(e) => setField(field.name, e.target.value)}
                  className="h-10 w-full rounded-lg border border-hairline bg-card px-3 font-mono text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.kind === "number" ? (
                <input
                  id={id}
                  type="number"
                  min={field.min}
                  max={field.max}
                  value={value}
                  onChange={(e) => setField(field.name, e.target.value)}
                  className="h-10 w-full rounded-lg border border-hairline bg-card px-3 font-mono text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              ) : field.kind === "graph" || field.kind === "grid" ? (
                <textarea
                  id={id}
                  rows={3}
                  value={value}
                  onChange={(e) => setField(field.name, e.target.value)}
                  className="w-full rounded-lg border border-hairline bg-card px-3 py-2 font-mono text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              ) : (
                <input
                  id={id}
                  type="text"
                  value={value}
                  onChange={(e) => setField(field.name, e.target.value)}
                  className="h-10 w-full rounded-lg border border-hairline bg-card px-3 font-mono text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              )}
              {"help" in field && field.help ? (
                <p className="t-small text-slate">{field.help}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-error-tint px-3 py-2 font-mono text-xs text-error">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button size="sm" leadingIcon={Play} onClick={() => run(draft)}>
          Run
        </Button>
        <Button
          size="sm"
          variant="secondary"
          leadingIcon={Dices}
          onClick={() => {
            const next: Record<string, string> = {};
            for (const field of mod.inputs) next[field.name] = randomValue(field);
            setDraft(next);
            run(next);
          }}
        >
          Randomize
        </Button>
      </div>
    </div>
  );
}

/* ---------------- about tab ---------------- */

export function AboutPane({ algo }: { algo: Algorithm }): React.ReactElement {
  const prereqs = algo.prerequisites
    .map((slug) => getAlgorithm(slug))
    .filter((a): a is Algorithm => Boolean(a));

  return (
    <div className="space-y-5 p-4">
      <section>
        <h2 className="t-mono-label mb-1.5">Summary</h2>
        <p className="t-body text-slate">{algo.summary}</p>
      </section>
      {/* Complexity, category and tags moved here from the old bottom strip. */}
      <section>
        <h2 className="t-mono-label mb-1.5">Complexity</h2>
        <dl className="grid grid-cols-2 gap-2">
          {[
            { k: "Time (avg)", v: algo.timeAvg },
            { k: "Time (worst)", v: algo.timeWorst },
            { k: "Space", v: algo.space },
            { k: "Category", v: algo.category },
          ].map((row) => (
            <div
              key={row.k}
              className="flex flex-col rounded-lg border border-hairline bg-paper px-3 py-2"
            >
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate">
                {row.k}
              </dt>
              <dd className="font-mono text-[13px] text-ink">{row.v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section>
        <h2 className="t-mono-label mb-1.5">Tags</h2>
        <ul className="flex flex-wrap gap-2">
          {algo.tags.map((t) => (
            <li
              key={t}
              className="inline-flex rounded-full border border-hairline bg-card px-3 py-1 font-mono text-xs text-slate"
            >
              {t.replace(/-/g, " ")}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="t-mono-label mb-1.5">Real-world uses</h2>
        <ul className="space-y-1">
          {algo.realWorldUses.map((use) => (
            <li key={use} className="t-small text-slate">
              · {use}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="t-mono-label mb-1.5">Common mistakes</h2>
        <ul className="space-y-1">
          {algo.commonMistakes.map((m) => (
            <li key={m} className="t-small text-slate">
              · {m}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="t-mono-label mb-1.5">Prerequisites</h2>
        {prereqs.length === 0 ? (
          <p className="t-small text-slate">None — you can start here.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {prereqs.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/algorithms/$slug"
                  params={{ slug: p.slug }}
                  className="inline-flex rounded-full border border-hairline bg-card px-3 py-1 font-mono text-xs text-ink hover:bg-tint"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="t-mono-label mb-1.5">When NOT to use this</h2>
        <p className="t-small text-slate">
          Reach for something else when the worst case {algo.timeWorst} is too slow for your input
          size, when the space cost {algo.space} is unacceptable, or when the data does not satisfy
          the assumptions this technique relies on ({algo.tags.join(", ")}).
        </p>
      </section>
    </div>
  );
}

/* ---------------- tabs ---------------- */

export type TabId = "code" | "explain" | "input" | "about";

const TABS: { id: TabId; label: string }[] = [
  { id: "code", label: "Code" },
  { id: "explain", label: "Explain" },
  { id: "input", label: "Input" },
  { id: "about", label: "About" },
];

export interface SidePanelProps {
  algo: Algorithm;
  module: AlgorithmModule | undefined;
  slug: string;
  initialTab: TabId;
  onRun?: (values: Record<string, string>) => void;
  className?: string;
}

export function SidePanel({
  algo,
  module: mod,
  slug,
  initialTab,
  onRun,
  className,
}: SidePanelProps): React.ReactElement {
  const [tab, setTab] = React.useState<TabId>(initialTab);
  const available = TABS.filter((t) => (mod ? true : t.id === "about"));

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl border border-hairline bg-card",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label="Algorithm details"
        className="flex gap-1 border-b border-hairline px-2 py-2"
      >
        {available.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${slug}-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${slug}-${t.id}`}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              tab === t.id ? "bg-tint text-primary" : "text-slate hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${slug}-${tab}`}
        aria-labelledby={`tab-${slug}-${tab}`}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {tab === "code" && <CodePane />}
        {tab === "explain" && <ExplainPane />}
        {tab === "input" && mod && <InputPane module={mod} slug={slug} onRun={onRun} />}
        {tab === "about" && <AboutPane algo={algo} />}
      </div>
    </div>
  );
}

/* ---------------- visual column ---------------- */

export interface VisualStageProps {
  /** Undefined means this slug has no engine module yet. */
  module: AlgorithmModule | undefined;
  algoName: string;
  /** Hide the playback bar when a shared one drives both players. */
  showPlaybackBar?: boolean;
  showScrubber?: boolean;
  minHeightClass?: string;
  className?: string;
}

export function VisualStage({
  module: mod,
  algoName,
  showPlaybackBar = true,
  showScrubber = true,
  minHeightClass = "min-h-[420px]",
  className,
}: VisualStageProps): React.ReactElement {
  const step = useCurrentStep();
  const run = usePlayerStore((s) => s.run);
  const index = usePlayerStore((s) => s.index);

  const frame = step?.frame;

  if (!mod) {
    return (
      <div className="rounded-2xl border border-hairline bg-card shadow-sm">
        <EmptyState
          icon={MonitorPlay}
          title="Visualization coming soon"
          description={`We are still building the step-by-step player for ${algoName}. The About tab has everything else.`}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-2xl border border-hairline bg-card shadow-sm relative overflow-hidden",
        className,
      )}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {step ? `Step ${index + 1} of ${run?.steps.length ?? 0}: ${step.narration}` : ""}
      </div>

      {/* Floating Left Panels (Queue/Visited) */}
      <div className="absolute left-6 top-16 flex flex-col gap-4 z-10 pointer-events-none">
        {step?.aux?.map((panel, panelIndex) => {
          if (panel.kind === "queue" || panel.kind === "stack") {
            return (
              <div
                key={`queue-${panelIndex}`}
                className="flex flex-col rounded-xl border border-hairline bg-white/80 p-3 shadow-sm backdrop-blur-sm w-[200px] pointer-events-auto"
              >
                <span className="mb-2 font-mono text-[12px] font-semibold text-ink flex items-center gap-2">
                  <svg
                    aria-hidden="true"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                  </svg>
                  {panel.label}
                </span>
                <span className="font-mono text-[10px] text-slate uppercase mb-1">↑ Front</span>
                <div className="flex gap-2 min-h-[40px] items-center">
                  {panel.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-[#F2DEB4] bg-[#FDF5E6] font-mono text-[14px] text-ink shadow-sm"
                    >
                      {item.label}
                    </motion.div>
                  ))}
                  {panel.items.length === 0 && (
                    <span className="text-slate/50 text-xs italic">Empty</span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-slate uppercase mt-1">↓ Back</span>
              </div>
            );
          }
          /* Cost of each input item at the current candidate answer, plus the
             total against its budget. Only "binary search the answer" modules
             emit this kind, so no existing visualizer changes. */
          if (panel.kind === "cost") {
            return (
              <div
                key={`cost-${panelIndex}`}
                className="flex flex-col rounded-xl border border-hairline bg-white/80 p-3 shadow-sm backdrop-blur-sm w-[200px] pointer-events-auto"
              >
                <span className="mb-2 font-mono text-[12px] font-semibold text-ink">
                  {panel.label}
                </span>
                <ul className="flex flex-col gap-1">
                  {panel.rows.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-baseline justify-between gap-2 font-mono text-[11px]"
                    >
                      <span className="text-slate">{row.item}</span>
                      <span className="tabular-nums text-ink">{row.cost}</span>
                    </li>
                  ))}
                </ul>
                {panel.total ? (
                  <div className="mt-2 flex flex-col gap-1 border-t border-hairline pt-2 font-mono text-[11px]">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-slate">{panel.total.label}</span>
                      <span
                        className={cn(
                          "tabular-nums font-semibold",
                          panel.total.ok ? "text-primary" : "text-error",
                        )}
                      >
                        {panel.total.value}
                      </span>
                    </span>
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-slate">allowed</span>
                      <span className="tabular-nums text-ink">
                        {panel.total.budget}
                        {/* Never colour alone: the verdict carries a glyph too (S7.2). */}
                        <span aria-hidden="true" className="ml-1">
                          {panel.total.ok ? "✓" : "✕"}
                        </span>
                      </span>
                    </span>
                    <span className="sr-only">
                      {panel.total.ok ? "within the budget" : "over the budget"}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          }
          if (panel.kind === "keyvalue" && panel.label === "Visited order") {
            return (
              <div
                key={`visited-${panelIndex}`}
                className="flex flex-col rounded-xl border border-hairline bg-white/80 p-3 shadow-sm backdrop-blur-sm w-[240px] pointer-events-auto mt-2"
              >
                <span className="mb-2 font-mono text-[12px] font-semibold text-ink">
                  Visited order
                </span>
                <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
                  {panel.rows.map((row, i) => (
                    <React.Fragment key={row.k}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/20 bg-tint font-mono text-[11px] text-ink"
                      >
                        {row.v}
                      </motion.div>
                      {i < panel.rows.length - 1 && (
                        <ArrowRight size={12} className="text-primary/40" />
                      )}
                    </React.Fragment>
                  ))}
                  {panel.rows.length === 0 && (
                    <span className="text-slate/50 text-xs italic">None</span>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Canvas — the array/graph/grid itself, given the majority of the height */}
      <div className="relative z-0 flex min-h-0 flex-1 items-center justify-center overflow-y-auto overflow-x-hidden px-6 pb-3 pt-5">
        {step ? (
          frame?.kind === "array" ? (
            <ArrayCanvas frame={frame} />
          ) : (
            <FrameView frame={step.frame} className="max-h-full" />
          )
        ) : (
          <p className="t-small text-slate">Preparing the visualization…</p>
        )}
      </div>

      {/* Timeline and one-row control strip */}
      <div className="relative z-20 mt-auto flex shrink-0 flex-col gap-3 border-t border-hairline bg-card px-6 pb-5 pt-4">
        {showScrubber && <StepTimeline />}
        {showPlaybackBar && <ControlStrip />}
      </div>
    </div>
  );
}
