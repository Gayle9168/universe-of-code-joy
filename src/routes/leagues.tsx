import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Flame,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { AppSidebar, AppWorkspaceBar } from "@/components/app-shell";
import { getLesson } from "@/content/lessons";
import { demoLearner as mockUser } from "@/content/demo-learner";
import useHydrated from "@/hooks/useHydrated";
import { buildLeague, isoWeek, weekDayKeys, weekEnd } from "@/lib/league";
import { baselineProgress, useProgressStore } from "@/stores/progressStore";

export const Route = createFileRoute("/leagues")({
  component: Leagues,
  head: () => ({
    meta: [
      { title: "Teal League leaderboard — weekly rankings — Algora" },
      {
        name: "description",
        content:
          "See the Teal League weekly leaderboard: top 10 advance to Diamond. Track your rank, weekly XP and how far you are from climbing.",
      },
      { property: "og:title", content: "Teal League leaderboard — weekly rankings — Algora" },
      {
        property: "og:description",
        content: "Your weekly XP places you live on the Teal League table.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Medallion({ fill, stroke, active }: { fill: string; stroke: string; active?: boolean }) {
  return (
    <svg viewBox="0 0 32 34" className="h-[30px] w-[28px]" aria-hidden="true">
      <path
        d="M16 1.6 29.2 9.1v15.8L16 32.4 2.8 24.9V9.1z"
        fill={fill}
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d="M16 8.5 22.4 12v7L16 22.5 9.6 19v-7z"
        fill="none"
        stroke={active ? "var(--card)" : stroke}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <circle cx={16} cy={15.5} r={2.2} fill={active ? "var(--card)" : stroke} />
    </svg>
  );
}

const TIERS = [
  { name: "Bronze", fill: "var(--tier-bronze-bg)", stroke: "var(--tier-bronze-border)" },
  { name: "Silver", fill: "var(--tier-silver-bg)", stroke: "var(--tier-silver-border)" },
  { name: "Gold", fill: "var(--tier-gold-bg)", stroke: "var(--tier-gold-border)" },
  { name: "Teal", fill: "var(--primary)", stroke: "var(--primary)", current: true },
  { name: "Diamond", fill: "var(--tier-diamond-bg)", stroke: "var(--tier-diamond-border)" },
];

function MedalChip({ rank }: { rank: number }) {
  const map: Record<number, [string, string]> = {
    1: ["var(--tier-gold-bg)", "var(--tier-gold-border)"],
    2: ["var(--tier-silver-bg)", "var(--tier-silver-border)"],
    3: ["var(--tier-bronze-bg)", "var(--tier-bronze-border)"],
  };
  const [fill, stroke] = map[rank]!;
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" aria-hidden="true">
      <circle cx={12} cy={12} r={10.2} fill={fill} stroke={stroke} strokeWidth={1.4} />
      <text
        x={12}
        y={16}
        textAnchor="middle"
        fill={stroke}
        fontFamily="JetBrains Mono, monospace"
        fontSize={11}
        fontWeight={600}
      >
        {rank}
      </text>
    </svg>
  );
}

function Move({ move }: { move: number | null }) {
  if (move === null) return <span className="font-mono text-[13px] text-muted-foreground">—</span>;
  const up = move > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[13px] ${
        up ? "text-primary" : "text-error"
      }`}
    >
      {up ? (
        <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.4} />
      ) : (
        <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.4} />
      )}
      {Math.abs(move)}
    </span>
  );
}

function Leagues() {
  const hydrated = useHydrated();
  const live = useProgressStore((s) => s);
  const state = hydrated ? live : baselineProgress;

  // Week identity is captured once so the seed can never change mid-render.
  const [now] = useState(() => new Date());
  const week = useMemo(() => isoWeek(now), [now]);
  const weekKeys = useMemo(() => weekDayKeys(now), [now]);

  const weekly = useMemo(() => {
    const rows = weekKeys.map((k) => state.activity[k]);
    return {
      xp: rows.reduce((sum, r) => sum + (r?.xp ?? 0), 0),
      solved: rows.reduce((sum, r) => sum + (r?.solved ?? 0), 0),
      minutes: rows.reduce((sum, r) => sum + (r?.minutes ?? 0), 0),
      activeDays: rows.filter((r) => r && r.xp + r.minutes + r.steps + r.solved > 0).length,
    };
  }, [state.activity, weekKeys]);

  const lessonsThisWeek = useMemo(
    () =>
      Object.entries(state.lessons).filter(([slug, l]) => {
        if (!l.completedAt || !getLesson(slug)) return false;
        const d = new Date(l.completedAt);
        const key = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
        return weekKeys.includes(key);
      }).length,
    [state.lessons, weekKeys],
  );

  const league = useMemo(
    () =>
      buildLeague(week.year * 100 + week.week, weekly.xp, {
        name: mockUser.name,
        handle: `@${mockUser.handle}`,
      }),
    [week.week, week.year, weekly.xp],
  );

  // Countdown to the weekly reset; static text until mounted so SSR matches.
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  useEffect(() => {
    const update = () =>
      setDaysLeft(
        Math.max(0, Math.ceil((weekEnd(new Date()).getTime() - Date.now()) / 86_400_000)),
      );
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const climbPct = Math.min(
    100,
    Math.round((weekly.xp / Math.max(1, weekly.xp + league.xpToClimb)) * 100),
  );
  const avgPerDay = Math.round(weekly.xp / Math.max(1, weekly.activeDays || 1));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar active="Compete" collapsible />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppWorkspaceBar crumbs={[]} search />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 py-4">
          <div className="flex shrink-0 items-start justify-between">
            <div>
              <h1 className="text-[28px] font-semibold leading-none tracking-tight text-foreground">
                Teal League
              </h1>
              <p className="mt-2 font-mono text-[13px] text-muted-foreground">
                Top {league.promoteRank} advance to the Diamond League.
                {daysLeft === null ? "" : ` ${daysLeft} day${daysLeft === 1 ? "" : "s"} left.`}
              </p>
            </div>
            <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-hairline bg-card px-4 font-mono text-[13px] text-foreground">
              <CalendarDays className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} /> Week{" "}
              {week.week}
            </span>
          </div>

          {/* League bar */}
          <div className="mt-3 flex shrink-0 items-center gap-1 rounded-2xl border border-hairline bg-card px-5 py-2.5">
            {TIERS.map((t, i) => (
              <div key={t.name} className="flex items-center">
                <div
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-1.5 ${
                    t.current ? "border border-primary/40 bg-primary-tint/70" : ""
                  }`}
                >
                  <Medallion fill={t.fill} stroke={t.stroke} active={t.current} />
                  <span
                    className={`font-mono text-[13px] leading-tight ${
                      t.current ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {t.name}
                    {t.current && (
                      <span className="block text-[11px] text-primary/80">(Current)</span>
                    )}
                  </span>
                </div>
                {i < TIERS.length - 1 && (
                  <span className="mx-3 flex items-center gap-1.5">
                    <span className="h-px w-8 bg-hairline" />
                    <span className="h-1.5 w-1.5 rounded-full bg-hairline" />
                    <span className="h-px w-8 bg-hairline" />
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_310px] gap-4 pb-2">
            {/* Leaderboard */}
            <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-hairline bg-card">
              <div className="grid shrink-0 grid-cols-[64px_minmax(0,1fr)_120px_92px] items-center border-b border-hairline px-5 py-2.5 font-mono text-[12.5px] text-muted-foreground">
                <span>Rank</span>
                <span>Player</span>
                <span className="text-right">Weekly XP</span>
                <span className="text-right">Change</span>
              </div>

              <div className="min-h-0 flex-1 overflow-auto">
                {league.rows.map((r) => (
                  <div key={`${r.rank}-${r.handle}`}>
                    <div
                      className={`relative grid grid-cols-[64px_minmax(0,1fr)_120px_92px] items-center border-b border-hairline px-5 py-[6px] ${
                        r.me ? "bg-primary-tint/60" : ""
                      }`}
                    >
                      {r.me && <span className="absolute left-0 top-0 h-full w-[3px] bg-primary" />}
                      <span className="flex items-center gap-2">
                        {r.rank <= 3 && <MedalChip rank={r.rank} />}
                        <span
                          className={`font-mono text-[13.5px] ${
                            r.me ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {r.rank}
                        </span>
                      </span>

                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${
                            r.me
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary-tint text-primary"
                          }`}
                        >
                          {r.initials}
                        </span>
                        <span
                          className={`w-[110px] shrink-0 truncate text-[14px] ${
                            r.me ? "font-semibold text-foreground" : "text-foreground"
                          }`}
                        >
                          {r.name}
                        </span>
                        <span
                          className={`truncate font-mono text-[12.5px] ${
                            r.me ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {r.handle}
                        </span>
                      </span>

                      <span
                        className={`text-right font-mono text-[13.5px] ${
                          r.me ? "font-medium text-primary" : "text-foreground"
                        }`}
                      >
                        {r.xp.toLocaleString("en-US")} XP
                      </span>

                      <span className="flex justify-end">
                        <Move move={r.move} />
                      </span>
                    </div>

                    {r.rank === league.promoteRank && (
                      <div className="relative flex items-center gap-3 px-5 py-1.5">
                        <span className="h-px flex-1 border-t border-dashed border-primary/50" />
                        <span className="font-mono text-[12px] text-primary">
                          PROMOTION ZONE (Top {league.promoteRank})
                        </span>
                        <span className="h-px flex-1 border-t border-dashed border-primary/50" />
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-3 px-5 py-2">
                  <span className="h-px flex-1 border-t border-dashed border-hairline" />
                  <span className="font-mono text-[12px] text-muted-foreground">
                    DEMOTION ZONE (from #{league.demoteRank})
                  </span>
                  <span className="h-px flex-1 border-t border-dashed border-hairline" />
                </div>
              </div>
            </section>

            {/* Your standing */}
            <section className="flex min-h-0 flex-col rounded-2xl border border-hairline bg-card p-5">
              <h2 className="text-[16px] font-semibold text-foreground">Your standing</h2>
              <div className="mt-2 font-mono text-[42px] font-medium leading-none text-primary">
                #{league.myRank}
              </div>
              <div className="mt-3 font-mono text-[14px] text-foreground">
                {weekly.xp.toLocaleString("en-US")} XP this week
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${climbPct}%` }} />
              </div>
              <p className="mt-2 font-mono text-[12.5px] text-muted-foreground">
                {league.xpToClimb === 0
                  ? "You are top of the league."
                  : `${league.xpToClimb.toLocaleString("en-US")} XP to reach #${league.targetRank}`}
              </p>

              <Link
                to="/explore"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-primary font-mono text-[13.5px] text-primary-foreground hover:bg-primary-glow"
              >
                Solve to climb
              </Link>

              <div className="mt-4 flex items-center gap-2 border-t border-hairline pt-4">
                <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                <div>
                  <div className="font-mono text-[12px] text-muted-foreground">League size</div>
                  <div className="font-mono text-[13.5px] text-foreground">
                    {league.size} students
                  </div>
                </div>
              </div>

              <div className="mt-4 font-mono text-[12px] text-muted-foreground">
                Your stats this week
              </div>
              <div className="mt-2 space-y-2.5">
                {[
                  { icon: Zap, label: "Problems solved", value: `${weekly.solved}` },
                  { icon: CheckSquare, label: "Lessons completed", value: `${lessonsThisWeek}` },
                  {
                    icon: ShieldCheck,
                    label: "Review streak",
                    value: `${state.streak.current} days`,
                  },
                  { icon: Flame, label: "XP per day (avg)", value: `${avgPerDay}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.7} />
                    <span className="flex-1 font-mono text-[12.5px] text-muted-foreground">
                      {label}
                    </span>
                    <span className="font-mono text-[12.5px] text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/dashboard"
                className="mt-auto inline-flex items-center gap-2 border-t border-hairline pt-4 font-mono text-[13px] text-primary hover:underline"
              >
                View full breakdown <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </section>
          </div>

          <p className="shrink-0 pb-1 font-mono text-[12px] text-muted-foreground">
            Weekly XP resets every Monday. Your row updates the moment you earn XP.
          </p>
        </main>
      </div>
    </div>
  );
}
