import { useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Grid2x2,
  Info,
  Lock,
  RectangleHorizontal,
  Star,
} from "lucide-react";
import {
  OnboardingFooter,
  OnboardingTopBar,
  StepBadge,
  TealPeriod,
} from "@/components/onboarding-chrome";
import useHydrated from "@/hooks/useHydrated";
import { usePrefsStore } from "@/stores/prefsStore";
import { useProgressStore } from "@/stores/progressStore";

export const Route = createFileRoute("/onboarding/path")({
  component: PathResultPage,
  head: () => ({
    meta: [
      { title: "Your personalized path — Algora onboarding" },
      {
        name: "description",
        content:
          "Step 3 of 3: your Interview Prep Fast-Track path — 42 lessons across 6 skills, tuned to about 4 hours a week.",
      },
      { property: "og:title", content: "Your personalized path — Algora onboarding" },
      {
        property: "og:description",
        content:
          "Your Interview Prep Fast-Track path is ready: skill roadmap, first lessons, and weekly XP goal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const STATS = [
  { icon: BarChart3, label: "Level start", value: "Intermediate", teal: false },
  { icon: CalendarDays, label: "Est. completion", value: "7 weeks", teal: false },
  { icon: Star, label: "Weekly XP goal", value: "1,200 XP", teal: true },
];

const ROADMAP = [
  { n: 1, state: "current", top: "Start here:", title: "Arrays &\nTwo Pointers" },
  { n: 2, state: "next", top: "Up next", title: "Hashing &\nSets" },
  { n: 3, state: "next", top: "Up next", title: "Sliding Window" },
  { n: 4, state: "locked", top: "Locked", title: "Binary Search\n& Variants" },
  { n: 5, state: "locked", top: "Locked", title: "Graphs" },
  { n: 6, state: "locked", top: "Locked", title: "Dynamic\nProgramming" },
] as const;

const LESSONS = [
  { icon: ArrowLeftRight, title: "Two Pointers", time: "20m" },
  { icon: RectangleHorizontal, title: "Sliding Window", time: "25m" },
  { icon: Grid2x2, title: "BFS on Grids", time: "30m" },
];

function XpRing() {
  const r = 24;
  const c = 2 * Math.PI * r;
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" role="img" aria-label="Level 1 progress">
      <circle
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke="var(--primary-tint-strong)"
        strokeWidth="4"
      />
      <circle
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${c * 0.04} ${c}`}
        transform="rotate(-90 30 30)"
      />
      <text
        x="30"
        y="34"
        textAnchor="middle"
        fontSize="12"
        fontFamily="JetBrains Mono, monospace"
        fill="var(--foreground)"
      >
        Lvl 1
      </text>
    </svg>
  );
}

function PathResultPage() {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const userEmail = usePrefsStore((s) => s.profile.email);
  const setActivePath = useProgressStore((s) => s.setActivePath);

  const handleStartLearning = useCallback(() => {
    setActivePath("interview-fast-track");
    navigate({ to: "/dashboard" });
  }, [setActivePath, navigate]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper text-foreground">
      <OnboardingTopBar
        current={3}
        right={<span>Signed in as {hydrated && userEmail ? userEmail : "arjun@stanford.edu"}</span>}
      />

      <main className="flex flex-1 min-h-0 items-center justify-center overflow-hidden px-6">
        <div className="w-full max-w-[960px] rounded-2xl border border-hairline bg-card px-9 py-6 shadow-sm">
          <StepBadge>YOUR PATH IS READY</StepBadge>

          <h1 className="mt-3 font-sans text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground">
            Your personalized path: Interview Prep Fast-Track
            <TealPeriod />
          </h1>
          <p className="mt-2 font-mono text-[13.5px] text-muted-foreground">
            Built from your goals and assessment — 42 lessons across 6 skills, tuned to ~4h/week.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-4">
            {STATS.map(({ icon: Icon, label, value, teal }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-hairline bg-card px-4 py-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-tint">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.7} />
                </span>
                <div>
                  <div className="font-mono text-[12px] text-muted-foreground">{label}</div>
                  <div
                    className={[
                      "font-mono text-[16px]",
                      teal ? "text-primary" : "text-foreground",
                    ].join(" ")}
                  >
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] gap-4">
            <div className="rounded-xl border border-hairline bg-card px-5 py-4">
              <div className="text-[14px] font-semibold text-foreground">Your skill roadmap</div>

              <div className="mt-4 flex items-start justify-between">
                {ROADMAP.map((step, i) => (
                  <div key={step.n} className="flex items-start">
                    {i > 0 && (
                      <span
                        className={[
                          "mt-[18px] h-[2px] w-3 shrink-0",
                          step.state === "locked" ? "bg-hairline" : "bg-primary",
                        ].join(" ")}
                      />
                    )}
                    <div className="flex w-[76px] shrink-0 flex-col items-center text-center">
                      {step.state === "locked" && (
                        <Lock className="mb-1 h-3.5 w-3.5 text-muted-foreground/70" />
                      )}
                      <span
                        className={[
                          "flex h-9 w-9 items-center justify-center rounded-full font-mono text-[14px]",
                          step.state === "current"
                            ? "bg-primary text-primary-foreground"
                            : step.state === "next"
                              ? "bg-primary-tint-strong text-foreground"
                              : "bg-secondary text-muted-foreground",
                        ].join(" ")}
                      >
                        {step.n}
                      </span>
                      <span
                        className={[
                          "mt-2 whitespace-nowrap font-mono text-[11px]",
                          step.state === "locked" ? "text-muted-foreground" : "text-primary",
                        ].join(" ")}
                      >
                        {step.top}
                      </span>
                      <span className="mt-0.5 whitespace-pre-line font-mono text-[11px] leading-[15px] text-foreground">
                        {step.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-6 font-mono text-[11px] text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Current
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-tint-strong" /> Up next
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" /> Locked
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-hairline bg-card px-5 py-4">
              <div className="text-[14px] font-semibold text-foreground">First 3 lessons</div>
              <div className="mt-3 space-y-2.5">
                {LESSONS.map(({ icon: Icon, title, time }) => (
                  <div key={title} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-card">
                      <Icon className="h-4.5 w-4.5 text-primary" strokeWidth={1.7} />
                    </span>
                    <span className="flex-1 text-[14px] text-foreground">{title}</span>
                    <span className="rounded-md border border-hairline px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                      {time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 border-t border-hairline pt-4">
                <XpRing />
                <div className="flex-1">
                  <div className="font-mono text-[13px] text-primary">0 / 1,200 XP</div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-secondary" />
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 flex items-center gap-2 font-mono text-[12.5px] text-muted-foreground">
            <Info className="h-4 w-4" /> You can adjust goals anytime in settings.
          </p>

          <div className="mt-4 flex items-start justify-between border-t border-hairline pt-4">
            <Link
              to="/onboarding/goals"
              className="flex h-11 items-center rounded-xl border border-primary bg-card px-7 font-mono text-[14px] text-primary transition-colors hover:bg-primary-tint/60"
            >
              Adjust goals
            </Link>
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleStartLearning}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-8 font-mono text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary-glow"
              >
                Start learning <ArrowRight className="h-4 w-4" />
              </button>
              <span className="mt-2 font-mono text-[11.5px] text-muted-foreground">
                Jump straight into your first visualized lesson.
              </span>
            </div>
          </div>
        </div>
      </main>

      <OnboardingFooter middle="Welcome aboard" />
    </div>
  );
}
