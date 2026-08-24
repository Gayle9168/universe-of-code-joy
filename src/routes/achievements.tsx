import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownUp,
  ArrowRight,
  BookCopy,
  BookOpen,
  Brain,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Crown,
  Dumbbell,
  Flame,
  Footprints,
  Gem,
  GitBranch,
  GraduationCap,
  Hash,
  Lock,
  Milestone,
  Monitor,
  Moon,
  Puzzle,
  Rocket,
  ScrollText,
  Snowflake,
  Star,
  Sunrise,
  Swords,
  Trophy,
  Waypoints,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AppSidebar, AppWorkspaceBar } from "@/components/app-shell";
import useHydrated from "@/hooks/useHydrated";
import { evaluateAchievements, type AchievementState } from "@/lib/achievements";
import { baselineProgress, useProgressStore } from "@/stores/progressStore";

export const Route = createFileRoute("/achievements")({
  component: Achievements,
  head: () => ({
    meta: [
      { title: "Achievements & rewards — badge progress — Algora" },
      {
        name: "description",
        content:
          "Track your algorithm badges: earned, in progress and locked. Spend XP in the rewards shop on streak freezes, themes and hint packs.",
      },
      { property: "og:title", content: "Achievements & rewards — badge progress — Algora" },
      {
        property: "og:description",
        content: "Earn badges for streaks, graph mastery and speed — then spend XP on perks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const ICONS: Record<string, LucideIcon> = {
  Footprints,
  BookOpen,
  GraduationCap,
  Crown,
  Swords,
  Puzzle,
  Dumbbell,
  Gem,
  Zap,
  Flame,
  CalendarCheck,
  Rocket,
  Waypoints,
  ArrowDownUp,
  GitBranch,
  Hash,
  Milestone,
  Trophy,
  Brain,
  Moon,
  Sunrise,
  ScrollText,
  CalendarDays,
  Star,
};

const TIERS = ["All tiers", "bronze", "silver", "gold", "platinum"] as const;
type Tier = (typeof TIERS)[number];
type Filter = "All" | "Earned" | "In progress" | "Locked";

function Crest({ icon: Icon, muted }: { icon: LucideIcon; muted?: boolean }) {
  const stroke = muted ? "var(--slate-soft)" : "var(--primary)";
  return (
    <span className="relative flex h-[62px] w-[56px] shrink-0 items-center justify-center">
      <svg viewBox="0 0 56 62" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path
          d="M28 2 52 15.5v31L28 60 4 46.5v-31z"
          fill={muted ? "var(--muted)" : "var(--card)"}
          stroke={stroke}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </svg>
      <Icon
        className={`relative h-6 w-6 ${muted ? "text-slate-soft" : "text-primary"}`}
        strokeWidth={1.7}
      />
    </span>
  );
}

const SHOP = [
  {
    id: "freeze",
    icon: Snowflake,
    name: "Streak Freeze",
    desc: "Protect your streak for one day.",
    price: 200,
  },
  {
    id: "theme",
    icon: Monitor,
    name: "Theme: Mono",
    desc: "Clean mono theme for the editor.",
    price: 500,
  },
  {
    id: "hints",
    icon: BookCopy,
    name: "Hint Pack",
    desc: "Get 5 hints for any challenge.",
    price: 150,
  },
];

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit" });

function Achievements() {
  const hydrated = useHydrated();
  const live = useProgressStore((s) => s);
  const state = hydrated ? live : baselineProgress;
  const unlockAchievement = useProgressStore((s) => s.unlockAchievement);
  const awardXp = useProgressStore((s) => s.awardXp);
  const addFreeze = useProgressStore((s) => s.addFreeze);

  const [filter, setFilter] = useState<Filter>("All");
  const [tier, setTier] = useState<Tier>("All tiers");
  const [tierOpen, setTierOpen] = useState(false);

  const all = useMemo(() => evaluateAchievements(state), [state]);

  // Record freshly earned badges once, awarding their XP and toasting the unlock.
  const announced = useRef(false);
  useEffect(() => {
    if (!hydrated || announced.current) return;
    announced.current = true;
    const fresh = evaluateAchievements(useProgressStore.getState()).filter(
      (a) => a.unlocked && !a.unlockedAt,
    );
    for (const a of fresh) {
      unlockAchievement(a.achievement.id, 100);
      awardXp(a.achievement.xp, `achievement:${a.achievement.id}`);
      toast.success(`Badge unlocked — ${a.achievement.name}`, {
        description: `${a.achievement.description} +${a.achievement.xp} XP`,
      });
    }
  }, [awardXp, hydrated, unlockAchievement]);

  const earned = all.filter((a) => a.unlocked).length;
  const pct = all.length === 0 ? 0 : Math.round((earned / all.length) * 100);

  const rank = (a: AchievementState): number => (a.unlocked ? 0 : a.pct > 0 ? 1 : 2);

  const visible = all
    .filter((a) => (tier === "All tiers" ? true : a.achievement.tier === tier))
    .filter((a) => {
      if (filter === "Earned") return a.unlocked;
      if (filter === "In progress") return !a.unlocked && a.pct > 0;
      if (filter === "Locked") return !a.unlocked && a.pct === 0;
      return true;
    })
    .sort((a, b) => rank(a) - rank(b) || b.pct - a.pct)
    .slice(0, 12);

  const redeem = (item: (typeof SHOP)[number]) => {
    if (state.xp < item.price) {
      toast.error("Not enough XP", {
        description: `${item.name} costs ${item.price} XP — you have ${state.xp}.`,
      });
      return;
    }
    awardXp(-item.price, `redeem:${item.id}`);
    if (item.id === "freeze") addFreeze(1);
    toast.success(`${item.name} redeemed`, { description: `−${item.price} XP` });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar active="Achievements" collapsible />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppWorkspaceBar crumbs={[]} search />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 py-4">
          <div className="flex shrink-0 items-center justify-between gap-8">
            <div>
              <h1 className="text-[28px] font-semibold leading-none tracking-tight text-foreground">
                Achievements
              </h1>
              <p className="mt-2 font-mono text-[13px] text-muted-foreground">
                {earned} of {all.length} badges earned. Keep going.
              </p>
            </div>
            <div className="flex w-[420px] items-center gap-3">
              <span className="font-mono text-[13px] text-primary">{pct}%</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-3.5 flex shrink-0 items-center justify-between">
            <div className="flex overflow-hidden rounded-xl border border-hairline bg-card">
              {(["All", "Earned", "In progress", "Locked"] as Filter[]).map((t, i) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  aria-pressed={filter === t}
                  className={`h-10 px-6 font-mono text-[13px] transition-colors ${
                    i > 0 ? "border-l border-hairline" : ""
                  } ${
                    filter === t
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative">
              <button
                onClick={() => setTierOpen((o) => !o)}
                aria-expanded={tierOpen}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-hairline bg-card px-4 font-mono text-[13px] text-foreground hover:bg-secondary"
              >
                {tier === "All tiers" ? "Category" : tier}{" "}
                <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.9} />
              </button>
              {tierOpen && (
                <div className="absolute right-0 z-20 mt-1.5 w-[160px] overflow-hidden rounded-xl border border-hairline bg-card py-1 shadow-[0_12px_30px_-18px_rgba(14,21,19,0.35)]">
                  {TIERS.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTier(t);
                        setTierOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-left font-mono text-[12.5px] capitalize hover:bg-secondary ${
                        tier === t ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3.5 grid min-h-0 flex-1 grid-cols-4 grid-rows-3 gap-3.5">
            {visible.map((a) => {
              const locked = !a.unlocked && a.pct === 0;
              const Icon = ICONS[a.achievement.icon] ?? Trophy;
              return (
                <div
                  key={a.achievement.id}
                  className={`relative flex min-h-0 flex-col rounded-2xl border p-4 ${
                    a.unlocked
                      ? "border-primary/25 bg-primary-tint/40"
                      : locked
                        ? "border-hairline bg-paper"
                        : "border-hairline bg-card"
                  }`}
                >
                  {locked && (
                    <Lock
                      className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-muted-foreground"
                      strokeWidth={1.9}
                    />
                  )}
                  <div className="flex gap-3.5">
                    <Crest icon={Icon} muted={locked} />
                    <div className="min-w-0 pt-1">
                      <div className="text-[14.5px] font-semibold leading-tight text-foreground">
                        {a.achievement.name}
                      </div>
                      <p className="mt-1 font-mono text-[11.5px] leading-[1.5] text-muted-foreground">
                        {a.achievement.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-3">
                    {a.unlocked && (
                      <span className="inline-flex items-center gap-2 font-mono text-[12px] text-primary">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                        {a.unlockedAt ? `Earned ${formatDate(a.unlockedAt)}` : "Earned"}
                      </span>
                    )}
                    {!a.unlocked && !locked && (
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${a.pct}%` }}
                          />
                        </div>
                        <span className="shrink-0 font-mono text-[12px] text-foreground">
                          {a.current} / {a.target}
                        </span>
                      </div>
                    )}
                    {locked && (
                      <span className="inline-flex items-center gap-2 font-mono text-[12px] text-muted-foreground">
                        <Lock className="h-3.5 w-3.5" strokeWidth={1.9} />
                        {a.achievement.criteria}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rewards shop */}
          <div className="mt-3.5 flex shrink-0 items-center gap-5 rounded-2xl border border-hairline bg-primary-tint/50 px-6 py-4">
            <div className="w-[150px] shrink-0">
              <div className="text-[17px] font-semibold leading-tight text-foreground">
                Rewards shop
              </div>
              <p className="mt-1 font-mono text-[12px] text-muted-foreground">Spend XP on perks</p>
            </div>

            {SHOP.map((item) => (
              <div
                key={item.name}
                className="flex min-w-0 flex-1 items-start gap-3 rounded-xl border border-hairline bg-card px-3.5 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hairline bg-primary-tint/60">
                  <item.icon className="h-4.5 w-4.5 text-primary" strokeWidth={1.7} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold leading-tight text-foreground">
                    {item.name}
                  </div>
                  <p className="mt-0.5 font-mono text-[11.5px] leading-[1.45] text-muted-foreground">
                    {item.desc}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="whitespace-nowrap font-mono text-[12.5px] text-primary">
                      {item.price} XP
                    </span>
                    <button
                      onClick={() => redeem(item)}
                      disabled={state.xp < item.price}
                      className="h-7 rounded-lg bg-primary px-3 font-mono text-[12px] text-primary-foreground hover:bg-primary-glow disabled:opacity-45"
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="w-[160px] shrink-0 text-right">
              <div className="font-mono text-[13px] text-foreground">
                Balance: <span className="text-primary">{state.xp.toLocaleString("en-US")} XP</span>
              </div>
              <span className="mt-2 inline-flex items-center gap-2 font-mono text-[12.5px] text-primary">
                Freezes: {state.streak.freezesLeft}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
