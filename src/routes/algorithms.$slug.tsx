import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Bookmark,
  BookmarkCheck,
  Check,
  Flame,
  MonitorPlay,
  NotebookPen,
  Settings2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { useHeaderStats } from "@/components/app-shell";
import { AlgoraGlyph } from "@/components/site-chrome";
import {
  VisualStage,
  CodePane,
  ExplainPane,
  InputPane,
  AboutPane,
} from "@/components/player/WorkspacePanels";
import { CustomInputModal } from "@/components/player/CustomInputModal";
import type { AlgorithmModule } from "@/engine/types";

function RightColumnPanels({
  algo,
  module: mod,
  slug,
}: {
  algo: Algorithm;
  module: AlgorithmModule | undefined;
  slug: string;
}): React.ReactElement {
  const [tab, setTab] = React.useState<"code" | "input" | "about">("code");

  return (
    <div className="flex w-full shrink-0 flex-col gap-6 min-h-0 lg:w-[37%]">
      {/* Upper Panel with Tabs: Code, Input, About */}
      <div className="flex min-h-0 flex-[7] flex-col overflow-hidden rounded-2xl border border-hairline bg-card shadow-sm">
        <div
          role="tablist"
          aria-label="Code and settings"
          className="flex gap-1 border-b border-hairline px-3 py-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "code"}
            onClick={() => setTab("code")}
            className={cn(
              "rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              tab === "code" ? "bg-tint text-primary font-semibold" : "text-slate hover:text-ink",
            )}
          >
            Code
          </button>
          {mod && (
            <button
              type="button"
              role="tab"
              aria-selected={tab === "input"}
              onClick={() => setTab("input")}
              className={cn(
                "rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                tab === "input"
                  ? "bg-tint text-primary font-semibold"
                  : "text-slate hover:text-ink",
              )}
            >
              Input
            </button>
          )}
          <button
            type="button"
            role="tab"
            aria-selected={tab === "about"}
            onClick={() => setTab("about")}
            className={cn(
              "rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              tab === "about" ? "bg-tint text-primary font-semibold" : "text-slate hover:text-ink",
            )}
          >
            About
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {tab === "code" && <CodePane className="border-0 shadow-none rounded-none h-full" />}
          {tab === "input" && mod && <InputPane module={mod} slug={slug} />}
          {tab === "about" && <AboutPane algo={algo} />}
        </div>
      </div>

      {/* Lower Panel: Explanation (Always visible at the bottom) */}
      <ExplainPane className="flex min-h-0 flex-[3] flex-col rounded-2xl border border-hairline bg-card shadow-sm" />
    </div>
  );
}
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { ComplexityTag } from "@/components/common/ComplexityTag";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Tooltip } from "@/components/common/Tooltip";
import { CATEGORY_META, getAlgorithm } from "@/content/algorithms";
import { getLessonByAlgorithm } from "@/content/lessons";
import { getProblem } from "@/content/problems";
import type { Algorithm } from "@/content/types";
import { getModule, getModuleForProblem, hasModuleForProblem } from "@/engine/registry";
import { useAutoplay } from "@/hooks/useAutoplay";
import { useHydrated } from "@/hooks/useHydrated";
import { usePlayerKeys } from "@/hooks/usePlayerKeys";
import { useSession } from "@/hooks/useSession";
import { resolvePracticeSlug } from "@/lib/explore-items";
import { mergePlayerSearch, type AlgorithmSearch } from "@/lib/player-search";
import { cn } from "@/lib/utils";
import { progressPct } from "@/lib/xp";
import { usePlayerStore } from "@/stores/playerStore";
import { useProgressStore } from "@/stores/progressStore";

export const Route = createFileRoute("/algorithms/$slug")({
  validateSearch: (search: Record<string, unknown>): AlgorithmSearch => {
    const input =
      typeof search.input === "string" && search.input.length > 0 ? search.input : undefined;
    const rawStep = search.step;
    const stepNumber =
      typeof rawStep === "number"
        ? rawStep
        : typeof rawStep === "string" && rawStep.trim() !== ""
          ? Number(rawStep)
          : Number.NaN;
    const step =
      Number.isFinite(stepNumber) && stepNumber >= 0 ? Math.floor(stepNumber) : undefined;
    // Resolved against the catalog, so a hand-edited slug falls back to the
    // algorithm's own default rather than routing to a 404 on /practice.
    const problem =
      typeof search.problem === "string" && getProblem(search.problem) ? search.problem : undefined;
    return {
      ...(input ? { input } : {}),
      ...(step !== undefined ? { step } : {}),
      ...(problem ? { problem } : {}),
    };
  },
  component: AlgorithmWorkspace,
  head: ({ params, match }) => {
    const algo = getAlgorithm(params.slug);
    // The tab title follows the canvas for the same reason the <h1> does. `head`
    // has no `search` argument, but `match` carries the validated search schema,
    // so a shared link to a question visualizer is titled by the question.
    // Renamed only when the question drives the canvas, matching the <h1>. A
    // `?problem=` with no module of its own still shows the algorithm, so it
    // keeps the algorithm's title.
    const problem =
      match.search.problem && hasModuleForProblem(match.search.problem)
        ? getProblem(match.search.problem)
        : undefined;
    const named =
      problem && problem.algorithmSlug === params.slug
        ? problem.title
        : (algo?.name ?? "Algorithm");
    const title = `${named} visualizer — Algora`;
    const description =
      problem?.oneLiner ??
      algo?.summary.slice(0, 155) ??
      "Step through an algorithm with synchronized visualization, code, and plain-English narration.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
});

/* ---------------- base64 helpers (SSR-safe) ---------------- */

function encodeInputs(raw: Record<string, string>): string {
  const json = JSON.stringify(raw);
  if (typeof globalThis.btoa === "function") return globalThis.btoa(json);
  return Buffer.from(json, "utf-8").toString("base64");
}

function decodeInputs(value: string): Record<string, string> | null {
  try {
    const json =
      typeof globalThis.atob === "function"
        ? globalThis.atob(value)
        : Buffer.from(value, "base64").toString("utf-8");
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) out[k] = String(v);
    return out;
  } catch {
    return null;
  }
}

/* ---------------- workspace ---------------- */

function AlgorithmWorkspace(): React.ReactElement {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  usePlayerKeys();
  useAutoplay();

  const algo = getAlgorithm(slug);

  /**
   * Which module drives the canvas.
   *
   * Six searching questions share `algorithmSlug: "binary-search"`, so arriving
   * from one of their cards used to animate a plain binary search over an
   * unrelated array. When the question has its own module, play that instead —
   * the URL still names the algorithm, which keeps the header, complexity strip
   * and session recording pointed at the catalog entry.
   *
   * The question must belong to *this* algorithm. `?problem=` is user-editable,
   * and `validateSearch` only checks the slug exists — without this, a hand-typed
   * `/algorithms/quicksort?problem=koko-eating-bananas` would play Koko under a
   * quicksort header. Same stance `resolvePracticeSlug` takes on the same param.
   */
  const problemMod =
    search.problem && getProblem(search.problem)?.algorithmSlug === slug
      ? getModuleForProblem(search.problem)
      : undefined;
  const mod = problemMod ?? getModule(slug);
  /** The slug the player store loads: the question's when it has a module. */
  const modSlug = problemMod?.slug ?? slug;

  /**
   * The heading names whatever is actually on the canvas. Playing Koko under a
   * plain "Binary Search" title misdescribes the screen — the array, the counters
   * and the narration are all about eating speeds. The algorithm is still one
   * line up in the breadcrumb, so the technique being taught is not lost, and
   * the difficulty follows the same source so an easy question cannot inherit a
   * medium algorithm's badge.
   */
  const problemForTitle = problemMod ? getProblem(problemMod.slug) : undefined;
  const heading = problemForTitle?.title ?? algo?.name ?? slug;
  const headingDifficulty = problemForTitle?.difficulty ?? algo?.difficulty;

  /** Null for algorithms with no linked question — the button renders disabled. */
  const practiceSlug = React.useMemo(
    () => resolvePracticeSlug(slug, search.problem),
    [slug, search.problem],
  );

  const load = usePlayerStore((s) => s.load);
  const seek = usePlayerStore((s) => s.seek);
  const run = usePlayerStore((s) => s.run);
  const index = usePlayerStore((s) => s.index);
  const rawInputs = usePlayerStore((s) => s.rawInputs);

  const [customInputOpen, setCustomInputOpen] = React.useState(false);

  const hydrated = useHydrated();
  const { streak, xp, level } = useHeaderStats();
  const formatXp = (val: number): string => val.toLocaleString("en-US");

  const lesson = React.useMemo(
    () => (algo ? (getLessonByAlgorithm(algo.slug) ?? null) : null),
    [algo],
  );
  const lessonCompleted = useProgressStore((s) =>
    lesson ? Boolean(s.lessons[lesson.slug]?.completedAt) : false,
  );
  const lessonDone = hydrated && lessonCompleted;
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const awardXp = useProgressStore((s) => s.awardXp);
  const touchStreak = useProgressStore((s) => s.touchStreak);

  const onCompleteLesson = (): void => {
    if (!lesson || lessonDone) return;
    completeLesson(lesson.slug, 100);
    const { leveledUp, newLevel } = awardXp(lesson.xp, `lesson:${lesson.slug}`);
    touchStreak();
    toast.success(`+${lesson.xp} XP — lesson complete`, {
      description: leveledUp ? `Level ${newLevel} unlocked. ${lesson.title}` : lesson.title,
    });
  };

  /* record time, steps watched, streak and completion XP into progressStore */
  useSession({
    slug: algo ? slug : null,
    index,
    totalSteps: run?.steps.length ?? 0,
    enabled: Boolean(run),
  });

  /* mount: load from the deep link, else the module's first preset */
  const restoredRef = React.useRef(false);
  React.useEffect(() => {
    restoredRef.current = false;
  }, [modSlug]);

  React.useEffect(() => {
    if (!mod || restoredRef.current) return;
    const fromLink = search.input ? decodeInputs(search.input) : null;
    const preset = mod.presets[0]?.values;
    load(modSlug, fromLink ?? preset);
    if (search.step !== undefined) seek(search.step);
    restoredRef.current = true;
  }, [mod, modSlug, load, seek, search.input, search.step]);

  /* write input + step back into the URL, debounced */
  React.useEffect(() => {
    if (!run) return;
    const handle = window.setTimeout(() => {
      void navigate({
        search: (prev: AlgorithmSearch) => mergePlayerSearch(prev, encodeInputs(rawInputs), index),
        replace: true,
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [run, rawInputs, index, navigate]);

  const shareUrl = React.useCallback((): string => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.searchParams.set("input", encodeInputs(rawInputs));
    url.searchParams.set("step", String(index));
    return url.toString();
  }, [rawInputs, index]);

  if (!algo) {
    return (
      <div className="flex h-screen w-full flex-col bg-background">
        <main className="flex-1 items-center justify-center p-8">
          <EmptyState
            icon={MonitorPlay}
            title="Algorithm not found"
            description={`We do not have an algorithm called "${slug}".`}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-paper">
      {/* Top Nav (Global) */}
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-hairline bg-card px-24">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2">
            <AlgoraGlyph />
            <span className="font-mono text-[22px] font-medium tracking-tight text-foreground">
              algora
            </span>
          </Link>
          <nav className="flex items-center gap-8 font-mono text-[14px]">
            <Link
              to="/explore"
              className="flex items-center gap-2 text-slate hover:text-ink transition-colors"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              Explore
            </Link>
            <Link
              to="/algorithms/$slug"
              params={{ slug }}
              className="flex items-center gap-2 text-primary font-medium"
            >
              <MonitorPlay size={16} />
              Visualizer
            </Link>
            <Link
              to="/practice/$slug"
              params={{ slug: practiceSlug ?? slug }}
              disabled={!practiceSlug}
              className={cn(
                "flex items-center gap-2 transition-colors",
                practiceSlug
                  ? "text-slate hover:text-ink"
                  : "pointer-events-none cursor-default text-slate/40",
              )}
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Practice
            </Link>
            <Link
              to="/explore"
              className="flex items-center gap-2 text-slate hover:text-ink transition-colors"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Playground
            </Link>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <span className="inline-flex h-9 items-center gap-2 rounded-full bg-tint px-3 font-mono text-[13px] text-primary">
            <Flame className="h-4 w-4 text-primary" strokeWidth={1.8} /> {streak}
          </span>
          <span className="inline-flex h-9 items-center rounded-full border border-hairline px-3 font-mono text-[13px] text-ink">
            {formatXp(xp)} XP
          </span>
          <button className="text-slate hover:text-ink transition-colors">
            <Bell className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint font-mono text-[12px] text-primary">
            AL
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex min-h-0 flex-1 flex-col px-24 py-4">
        {/* Header Row */}
        <div className="mb-4 flex shrink-0 flex-col gap-2">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 font-mono text-[12px] text-slate"
          >
            <Link to="/explore" className="hover:text-ink">
              Explore
            </Link>
            <span>&gt;</span>
            <span>{CATEGORY_META[algo.category].label}</span>
            <span>&gt;</span>
            {problemForTitle ? (
              <>
                <Link
                  to="/algorithms/$slug"
                  params={{ slug }}
                  search={{}}
                  className="font-medium hover:text-ink"
                >
                  {algo.name}
                </Link>
                <span>&gt;</span>
                <span className="font-medium text-ink">{problemForTitle.title}</span>
              </>
            ) : (
              <span className="font-medium text-ink">{algo.name}</span>
            )}
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">
                {heading}
              </h1>
              {headingDifficulty && <DifficultyBadge difficulty={headingDifficulty} />}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onCompleteLesson}
                disabled={lessonDone || !lesson}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-primary px-5 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  lessonDone
                    ? "bg-transparent text-primary/60 border-primary/30 cursor-default"
                    : "text-primary hover:bg-tint cursor-pointer",
                )}
              >
                {lessonDone && <Check size={16} strokeWidth={2} />}
                {lessonDone ? "Lesson complete" : "Mark as complete"}
              </button>
              <Link
                to="/practice/$slug"
                params={{ slug: practiceSlug ?? slug }}
                disabled={!practiceSlug}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  practiceSlug
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "pointer-events-none cursor-default bg-primary/40 text-primary-foreground",
                )}
              >
                Practice <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="flex min-h-0 flex-1 gap-6">
          {/* Left Column - VisualStage (63%) */}
          <VisualStage
            module={mod}
            algoName={algo.name}
            className="flex flex-1 flex-col min-h-0 rounded-2xl border border-hairline bg-card shadow-sm lg:w-[63%]"
          />

          {/* Right Column - Code/Input/About top panel + ExplainPane bottom panel (37%) */}
          <RightColumnPanels algo={algo} module={mod} slug={modSlug} />
        </div>

        {/* Bottom Strip */}
        <div className="mt-4 flex shrink-0 items-center justify-between rounded-xl border border-hairline bg-card px-6 py-4 shadow-sm">
          <div className="flex items-center gap-8 font-mono text-[12px]">
            <div className="flex items-center gap-2 text-ink">
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                <path d="m2 17 10 5 10-5" />
                <path d="m2 12 10 5 10-5" />
              </svg>
              <span>Algorithm Properties</span>
            </div>
            <div className="h-6 w-px bg-hairline" />
            <div className="flex flex-col">
              <span className="text-slate mb-0.5 text-[10px] uppercase tracking-wider">
                Time Complexity
              </span>
              <span className="text-primary font-medium">{algo.timeAvg}</span>
            </div>
            <div className="h-6 w-px bg-hairline" />
            <div className="flex flex-col">
              <span className="text-slate mb-0.5 text-[10px] uppercase tracking-wider">
                Space Complexity
              </span>
              <span className="text-primary font-medium">{algo.space}</span>
            </div>
            <div className="h-6 w-px bg-hairline" />
            <div className="flex flex-col">
              <span className="text-slate mb-0.5 text-[10px] uppercase tracking-wider">
                Category
              </span>
              <span className="text-ink font-medium">{CATEGORY_META[algo.category].label}</span>
            </div>
            <div className="h-6 w-px bg-hairline" />
            <div className="flex flex-col">
              <span className="text-slate mb-0.5 text-[10px] uppercase tracking-wider">Tags</span>
              <span className="text-ink font-medium">
                {algo.tags
                  .slice(0, 2)
                  .map((t) => t.replace(/-/g, " "))
                  .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
                  .join(", ")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 w-[240px]">
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-ink">Learning Progress</span>
                  <span className="text-primary font-medium">{Math.floor(progressPct(xp))}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary transition-[width] duration-500"
                    style={{ width: `${progressPct(xp)}%` }}
                  />
                </div>
              </div>
              <div className="font-mono text-[10px] text-slate leading-tight w-24">
                You are discovering level {level + 1}
              </div>
            </div>
          </div>
        </div>
      </main>

      {mod && (
        <CustomInputModal
          isOpen={customInputOpen}
          onClose={() => setCustomInputOpen(false)}
          module={mod}
          slug={modSlug}
        />
      )}
    </div>
  );
}

export default AlgorithmWorkspace;
