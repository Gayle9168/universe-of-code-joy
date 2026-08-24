import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Check, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar, AppWorkspaceBar } from "@/components/app-shell";
import useHydrated from "@/hooks/useHydrated";
import { buildQueue, cardFor, gradeXp, intervalLabel, nextInterval } from "@/lib/review";
import { baselineProgress, useProgressStore } from "@/stores/progressStore";

export const Route = createFileRoute("/review")({
  component: ReviewQueue,
  head: () => ({
    meta: [
      { title: "Review queue — spaced repetition — Algora" },
      {
        name: "description",
        content:
          "Work through today's spaced-repetition cards and self-grade each one to lock in the algorithms you have learned.",
      },
      { property: "og:title", content: "Review queue — spaced repetition — Algora" },
      {
        property: "og:description",
        content: "Self-grade each card and Algora schedules the next review for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const TEAL = "var(--primary)";
const EDGE = "var(--viz-edge)";

const GNODES = [
  { id: 1, x: 34, y: 62, current: true },
  { id: 2, x: 148, y: 26 },
  { id: 3, x: 272, y: 26 },
  { id: 4, x: 148, y: 98 },
  { id: 5, x: 272, y: 98 },
  { id: 6, x: 386, y: 62 },
];

const GEDGES: [number, number, boolean][] = [
  [1, 2, true],
  [2, 3, true],
  [3, 6, false],
  [1, 4, true],
  [4, 5, true],
  [5, 6, false],
];

function HintGraph({ frontier }: { frontier: number }) {
  const byId = (id: number) => GNODES.find((n) => n.id === id)!;
  return (
    <svg
      viewBox="0 0 420 124"
      className="h-[124px] w-[420px]"
      role="img"
      aria-label="Frontier graph"
    >
      {GEDGES.map(([a, b]) => {
        const A = byId(a);
        const B = byId(b);
        const visited = a <= frontier && b <= frontier;
        return (
          <line
            key={`${a}-${b}`}
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            stroke={visited ? TEAL : EDGE}
            strokeWidth={1.4}
          />
        );
      })}
      {GNODES.map((n) => {
        const current = n.id === 1;
        const visited = n.id <= frontier;
        return (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={18}
              fill={current ? TEAL : "var(--card)"}
              stroke={current || visited ? TEAL : EDGE}
              strokeWidth={1.5}
            />
            <text
              x={n.x}
              y={n.y + 5}
              textAnchor="middle"
              fill={current ? "var(--card)" : "var(--ink)"}
              fontFamily="JetBrains Mono, monospace"
              fontSize={13}
            >
              {n.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const GRADES = [
  { label: "Again", grade: 0 },
  { label: "Hard", grade: 1 },
  { label: "Good", grade: 2 },
  { label: "Easy", grade: 3 },
];

function ReviewQueue() {
  const hydrated = useHydrated();
  const live = useProgressStore((s) => s);
  const state = hydrated ? live : baselineProgress;
  const gradeCard = useProgressStore((s) => s.gradeCard);
  const awardXp = useProgressStore((s) => s.awardXp);
  const touchStreak = useProgressStore((s) => s.touchStreak);
  const toggleBookmark = useProgressStore((s) => s.toggleBookmark);

  // Snapshot the queue once, so grading a card never reshuffles the session.
  const [workingQueue, setWorkingQueue] = useState(() => buildQueue(baselineProgress));
  const built = useRef(false);
  useEffect(() => {
    if (!hydrated || built.current) return;
    built.current = true;
    setWorkingQueue(buildQueue(useProgressStore.getState()));
  }, [hydrated]);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [done, setDone] = useState(false);

  const card = workingQueue[index];
  const total = workingQueue.length;
  const record = card ? cardFor(state, card.slug) : null;
  const bookmarked = card ? state.bookmarks.includes(card.slug) : false;

  const advance = useCallback(() => {
    setRevealed(false);
    setIndex((i) => {
      if (i + 1 >= total) {
        setDone(true);
        return i;
      }
      return i + 1;
    });
  }, [total]);

  const grade = useCallback(
    (value: number) => {
      if (!card) return;
      gradeCard(card.slug, value);
      const gained = gradeXp(value);
      awardXp(gained, `review:${card.slug}`);
      touchStreak();
      setSessionXp((xp) => xp + gained);
      if (index + 1 >= total) {
        toast.success(`Review session complete — +${sessionXp + gained} XP`, {
          description: `${total} card${total === 1 ? "" : "s"} graded.`,
        });
      }
      advance();
    },
    [advance, awardXp, card, gradeCard, index, sessionXp, total, touchStreak],
  );

  if (!card || done) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar active="Review" collapsible />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppWorkspaceBar crumbs={["Review queue"]} />
          <main className="flex min-h-0 flex-1 items-center justify-center px-8 py-4">
            <section className="w-full max-w-[520px] rounded-2xl border border-hairline bg-card px-8 py-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-tint">
                <Check className="h-7 w-7 text-primary" strokeWidth={2.2} />
              </span>
              <h1 className="mt-4 text-[22px] font-semibold text-foreground">
                {total === 0 ? "Nothing due right now" : "Review session complete"}
              </h1>
              <p className="mt-2 font-mono text-[13px] text-muted-foreground">
                {total === 0
                  ? "Watch an algorithm run or finish a lesson and it will show up here for review."
                  : `You graded ${total} card${total === 1 ? "" : "s"} and earned +${sessionXp} XP.`}
              </p>
              <Link
                to="/explore"
                className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 font-sans text-[14px] font-medium text-primary-foreground hover:bg-primary-glow"
              >
                Explore algorithms
              </Link>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const pct = Math.round((index / total) * 100);
  const minutesLeft = Math.max(1, Math.round((total - index) * 0.7));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar active="Review" collapsible />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppWorkspaceBar crumbs={["Review queue"]} />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 py-4">
          {/* Progress strip */}
          <div className="flex shrink-0 items-center gap-6 rounded-2xl border border-hairline bg-card px-6 py-3.5">
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[13.5px] text-foreground">
                Card {index + 1} of {total}
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className="shrink-0 font-mono text-[13px] text-muted-foreground">
              ~{minutesLeft} min left
            </span>
            <span className="inline-flex h-10 shrink-0 items-center rounded-xl border border-primary/40 bg-card px-4 font-mono text-[13px] text-primary">
              Due today · {total}
            </span>
          </div>

          {/* Card deck */}
          <div className="relative mx-auto mt-5 w-[720px] shrink-0">
            <div className="absolute -top-2 left-4 right-4 h-full rounded-2xl border border-hairline bg-card/70" />
            <div className="absolute -top-1 left-2 right-2 h-full rounded-2xl border border-hairline bg-card/90" />
            <div className="relative rounded-2xl border border-hairline bg-card px-7 pb-6 pt-5 shadow-[0_10px_30px_-18px_rgba(14,21,19,0.25)]">
              <div className="flex items-start justify-between">
                <Link
                  to="/algorithms/$slug"
                  params={{ slug: card.slug }}
                  className="rounded-lg bg-primary-tint px-3 py-1.5 font-mono text-[12.5px] text-primary hover:underline"
                >
                  {card.label}
                </Link>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <button
                    aria-label={bookmarked ? "Remove bookmark" : "Bookmark card"}
                    aria-pressed={bookmarked}
                    onClick={() => toggleBookmark(card.slug)}
                    className={bookmarked ? "text-primary" : "hover:text-primary"}
                  >
                    <Bookmark
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.8}
                      fill={bookmarked ? "currentColor" : "none"}
                    />
                  </button>
                  <button aria-label="Skip card" onClick={advance} className="hover:text-primary">
                    <MoreVertical className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              <h1 className="mt-3 text-center font-mono text-[22px] font-medium leading-[1.35] text-foreground">
                {card.question}
              </h1>

              <div className="mt-4 flex justify-center">
                <HintGraph frontier={revealed ? 6 : 3} />
              </div>

              {revealed ? (
                <div className="mt-4 flex gap-3.5 rounded-2xl border border-hairline bg-primary-tint/60 px-5 py-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-mono text-[16px] font-medium text-primary">
                      {card.answer}
                    </div>
                    <p className="mt-1.5 font-mono text-[12.5px] leading-[1.6] text-muted-foreground">
                      {card.explanation}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setRevealed(true)}
                  className="mt-4 flex w-full items-center justify-center rounded-2xl border border-dashed border-primary/50 bg-primary-tint/30 px-5 py-4 font-mono text-[13.5px] text-primary hover:bg-primary-tint/60"
                >
                  Show answer <span className="ml-2 text-[12px] text-muted-foreground">Space</span>
                </button>
              )}
            </div>
          </div>

          {/* Self grade */}
          <div className="mt-5 shrink-0">
            <p className="text-center font-mono text-[14px] text-muted-foreground">
              {revealed ? "How well did you remember?" : "Reveal the answer to grade this card"}
            </p>
            <div className="mx-auto mt-3 grid w-[800px] grid-cols-4 gap-5">
              {GRADES.map((g) => {
                const preview = record ? nextInterval(record, g.grade) : 1;
                const isGood = g.grade === 2;
                return (
                  <div key={g.label} className="text-center">
                    <button
                      disabled={!revealed}
                      onClick={() => grade(g.grade)}
                      className={`h-12 w-full rounded-xl font-mono text-[14px] transition-colors disabled:opacity-45 ${
                        isGood
                          ? "bg-primary text-primary-foreground hover:bg-primary-glow"
                          : "border border-primary/50 bg-card text-primary hover:bg-primary-tint"
                      }`}
                    >
                      {g.label}
                    </button>
                    <div className="mt-2 font-mono text-[12.5px] text-muted-foreground">
                      {g.grade === 0 ? "<1m" : intervalLabel(preview)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer row */}
          <div className="mx-auto mt-auto flex w-[900px] shrink-0 items-center justify-between border-t border-hairline pt-3.5">
            <button
              onClick={advance}
              className="font-sans text-[13.5px] text-primary underline decoration-dotted underline-offset-4 hover:decoration-solid"
            >
              Skip card
            </button>
            <span className="font-mono text-[13.5px] text-muted-foreground">
              Session XP <span className="text-primary">·</span>{" "}
              <span className="text-primary">+{sessionXp}</span>
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
