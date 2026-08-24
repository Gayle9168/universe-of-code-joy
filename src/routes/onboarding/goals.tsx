import { useCallback, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Check, Lightbulb, Target, Trophy } from "lucide-react";
import {
  OnboardingFooter,
  OnboardingTopBar,
  StepBadge,
  TealPeriod,
} from "@/components/onboarding-chrome";

export const Route = createFileRoute("/onboarding/goals")({
  component: GoalsPage,
  head: () => ({
    meta: [
      { title: "Learning goals — Algora onboarding" },
      {
        name: "description",
        content:
          "Step 1 of 3: pick your learning goals, weekly time commitment, and experience level so Algora can shape the right path.",
      },
      { property: "og:title", content: "Learning goals — Algora onboarding" },
      {
        property: "og:description",
        content:
          "Step 1 of 3: pick your learning goals so Algora can build a personalized algorithm-learning path.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type GoalKey = "interview" | "coursework" | "competitive" | "curiosity";
type Commitment = "casual" | "steady" | "focused" | "intense";
type ExpLevel = "beginner" | "intermediate" | "advanced";

const GOALS: { key: GoalKey; icon: typeof Target; title: string; body: string }[] = [
  {
    key: "interview",
    icon: Target,
    title: "Interview prep",
    body: "Crack FAANG-style DS&A questions.",
  },
  {
    key: "coursework",
    icon: BookOpen,
    title: "Ace my coursework",
    body: "Keep up with CS classes and exams.",
  },
  {
    key: "competitive",
    icon: Trophy,
    title: "Competitive programming",
    body: "Train speed and pattern recognition.",
  },
  {
    key: "curiosity",
    icon: Lightbulb,
    title: "Curiosity & fundamentals",
    body: "Truly understand how algorithms work.",
  },
];

const COMMITMENTS: { key: Commitment; label: string }[] = [
  { key: "casual", label: "Casual · 1–2h" },
  { key: "steady", label: "Steady · 3–5h" },
  { key: "focused", label: "Focused · 6–9h" },
  { key: "intense", label: "Intense · 10h+" },
];

const LEVELS: { key: ExpLevel; label: string }[] = [
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
];

function Segmented<T extends string>({
  options,
  active,
  onSelect,
}: {
  options: { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-xl border border-hairline bg-card">
      {options.map((option, i) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onSelect(option.key)}
          className={[
            "h-10 px-6 font-mono text-[13px] transition-colors",
            i > 0 ? "border-l border-hairline" : "",
            option.key === active
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-secondary",
          ].join(" ")}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function GoalsPage() {
  const navigate = useNavigate();
  const [selectedGoals, setSelectedGoals] = useState<Set<GoalKey>>(
    new Set(["interview", "coursework"]),
  );
  const [commitment, setCommitment] = useState<Commitment>("steady");
  const [level, setLevel] = useState<ExpLevel>("intermediate");

  const toggleGoal = useCallback((key: GoalKey) => {
    setSelectedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleContinue = useCallback(() => {
    /* Store goals in sessionStorage for the assessment/path pages to read */
    sessionStorage.setItem(
      "algora-onboarding",
      JSON.stringify({
        goals: Array.from(selectedGoals),
        commitment,
        level,
      }),
    );
    navigate({ to: "/onboarding/assessment" });
  }, [selectedGoals, commitment, level, navigate]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper text-foreground">
      <OnboardingTopBar current={1} right={<Link to="/paths">Skip for now</Link>} />

      <main className="flex flex-1 min-h-0 items-center justify-center overflow-hidden px-6">
        <div className="w-full max-w-[920px] rounded-2xl border border-hairline bg-card px-10 py-7 shadow-sm">
          <StepBadge>STEP 1 OF 3</StepBadge>

          <h1 className="mt-4 font-sans text-[34px] font-semibold leading-[1.1] tracking-[-0.025em] text-foreground">
            What brings you to Algora?
            <TealPeriod />
          </h1>
          <p className="mt-2 font-mono text-[14px] text-muted-foreground">
            Pick your goals so we can shape the right path. Choose all that apply.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4">
            {GOALS.map(({ key, icon: Icon, title, body }) => {
              const selected = selectedGoals.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleGoal(key)}
                  className={[
                    "flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary-tint/50"
                      : "border-hairline bg-card hover:bg-secondary/60",
                  ].join(" ")}
                >
                  <Icon className="h-7 w-7 shrink-0 text-primary" strokeWidth={1.6} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold text-foreground">{title}</div>
                    <div className="mt-0.5 text-[13px] text-muted-foreground">{body}</div>
                  </div>
                  {selected ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="h-5 w-5 rounded-full border border-hairline" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <div className="font-mono text-[13px] text-foreground">Weekly time commitment</div>
            <div className="mt-2">
              <Segmented options={COMMITMENTS} active={commitment} onSelect={setCommitment} />
            </div>
          </div>

          <div className="mt-5">
            <div className="font-mono text-[13px] text-foreground">Experience level</div>
            <div className="mt-2">
              <Segmented options={LEVELS} active={level} onSelect={setLevel} />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-hairline pt-5">
            <button
              type="button"
              disabled
              className="h-11 rounded-xl border border-hairline bg-card px-8 font-mono text-[14px] text-muted-foreground/60"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={selectedGoals.size === 0}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-8 font-mono text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary-glow disabled:opacity-50"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      <OnboardingFooter middle="Personalizing your experience" />
    </div>
  );
}
