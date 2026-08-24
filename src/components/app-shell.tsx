import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, ChevronsLeft, Flame, Search, Menu, Timer } from "lucide-react";
import { CommandPalette } from "@/components/CommandPalette";
import { AlgoraGlyph } from "@/components/site-chrome";
import { demoLearner as mockUser } from "@/content/demo-learner";
import { useDueCardCount } from "@/hooks/useProgress";
import { useHydrated } from "@/hooks/useHydrated";
import { progressPct, xpAtLevelStart, xpForLevel } from "@/lib/xp";
import { baselineProgress, useProgressStore } from "@/stores/progressStore";

const displayName = mockUser.name;
const shortName = `${displayName.split(" ")[0]} ${displayName.split(" ")[1]?.[0] ?? ""}.`.trim();
const initials = displayName
  .split(" ")
  .map((w) => w[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

/** Streak, XP and level, hydration-safe (pre-hydration falls back to the shared baseline). */
export function useHeaderStats(): { streak: number; xp: number; level: number } {
  const hydrated = useHydrated();
  const streak = useProgressStore((s) => s.streak.current);
  const xp = useProgressStore((s) => s.xp);
  const level = useProgressStore((s) => s.level);
  if (!hydrated) {
    return {
      streak: baselineProgress.streak.current,
      xp: baselineProgress.xp,
      level: baselineProgress.level,
    };
  }
  return { streak, xp, level };
}

const formatXp = (xp: number): string => xp.toLocaleString("en-US");

import { APP_NAV, type AppNavKey } from "@/content/nav";
export type { AppNavKey };

const NAV = APP_NAV.filter((item) => item.inSidebar);

export function AppSidebar({ active, collapsible }: { active: AppNavKey; collapsible?: boolean }) {
  const { xp, level } = useHeaderStats();
  const dueCount = useDueCardCount();
  const hydrated = useHydrated();

  const levelStart = xpAtLevelStart(level);
  const levelEnd = xpForLevel(level);
  const pct = progressPct(xp);

  return (
    <aside
      aria-label="Sidebar"
      className="flex w-[240px] shrink-0 flex-col border-r border-hairline bg-card"
    >
      <div className="flex h-[68px] shrink-0 items-center px-6">
        <Link to="/" className="flex items-center gap-2">
          <AlgoraGlyph />
          <span className="font-mono text-[22px] font-medium tracking-tight text-foreground">
            algora
          </span>
        </Link>
      </div>

      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 pt-2">
        {NAV.map(({ label, icon: Icon, to }) => {
          const isActive = label === active;
          const showDueBadge = label === "Review" && hydrated && dueCount > 0;
          return (
            <Link
              key={label}
              to={to}
              className={[
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-[14px] transition-colors",
                isActive
                  ? "bg-primary-tint text-primary"
                  : "text-muted-foreground hover:bg-secondary",
              ].join(" ")}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary" />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.7} />
              <span className="flex-1">{label}</span>
              {showDueBadge && (
                <span className="rounded-md bg-primary px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary-foreground">
                  {dueCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="rounded-xl border border-hairline bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint font-mono text-[12px] text-primary">
              {initials}
            </span>
            <div>
              <div className="text-[14px] font-semibold text-foreground">{shortName}</div>
              <div className="font-mono text-[12px] text-muted-foreground">Lvl {level}</div>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 font-mono text-[11.5px] text-muted-foreground">
            {formatXp(xp - levelStart)} / {formatXp(levelEnd - levelStart)} XP
          </div>
        </div>
      </div>

      {collapsible && (
        <div className="px-4 pb-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 font-sans text-[14px] text-muted-foreground hover:bg-secondary">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline bg-card">
              <ChevronsLeft className="h-4 w-4" strokeWidth={1.8} />
            </span>
            Collapse
          </button>
        </div>
      )}
    </aside>
  );
}

export function AppTopBar({
  title,
  searchValue,
  onSearchChange,
}: {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}) {
  const { streak, xp } = useHeaderStats();
  const [cmdOpen, setCmdOpen] = useState(false);

  /* Global ⌘K / Ctrl+K listener */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="flex h-[68px] shrink-0 items-center gap-6 border-b border-hairline bg-card px-8">
        <h2 className="text-[18px] font-semibold text-foreground">{title}</h2>

        <div role="search" className="relative mx-auto w-full max-w-[500px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          {onSearchChange ? (
            <input
              type="search"
              aria-label="Search algorithms"
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search algorithms, lessons…"
              className="h-11 w-full rounded-xl border border-hairline bg-card pl-11 pr-4 font-mono text-[13.5px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          ) : (
            <button
              onClick={() => setCmdOpen(true)}
              className="flex h-11 w-full items-center justify-between rounded-xl border border-hairline bg-card pl-11 pr-4 font-mono text-[13.5px] text-muted-foreground hover:bg-secondary/40"
            >
              Search algorithms, lessons…
              <span className="rounded border border-hairline bg-paper px-1.5 py-0.5 text-[11px]">
                ⌘K
              </span>
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-hairline bg-card px-4 font-mono text-[13.5px] text-foreground"
            aria-label={`Current streak ${streak} days`}
          >
            <Flame className="h-4 w-4 text-primary" strokeWidth={1.8} /> {streak}
          </span>
          <span className="inline-flex h-10 items-center rounded-xl border border-hairline bg-card px-4 font-mono text-[13.5px] text-foreground">
            {formatXp(xp)} XP
          </span>
          <Link to="/notifications" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5 text-muted-foreground" strokeWidth={1.7} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
          </Link>
          <Link
            to="/settings"
            aria-label="Account settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint font-mono text-[12px] text-primary"
          >
            {initials}
          </Link>
        </div>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}

export function AppWorkspaceBar({
  crumbs,
  timer,
  xp,
  search,
}: {
  crumbs: string[];
  timer?: string;
  xp?: string;
  search?: boolean;
}) {
  const stats = useHeaderStats();
  const xpLabel = xp ?? `${formatXp(stats.xp)} XP`;
  const [cmdOpen, setCmdOpen] = useState(false);

  /* Global ⌘K / Ctrl+K listener */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="flex h-[68px] shrink-0 items-center gap-4 border-b border-hairline bg-card px-6">
        <button
          aria-label="Toggle navigation"
          className="text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" strokeWidth={1.8} />
        </button>
        <nav aria-label="Breadcrumbs" className="flex items-center gap-3 font-sans text-[15px]">
          {crumbs.map((c, i) => (
            <span key={c} className="flex items-center gap-3">
              {i > 0 && <span className="text-muted-foreground">/</span>}
              <span
                className={
                  i === crumbs.length - 1 ? "font-medium text-foreground" : "text-foreground"
                }
              >
                {c}
              </span>
            </span>
          ))}
        </nav>

        {search ? (
          <div role="search" className="relative mx-auto w-full max-w-[460px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <button
              onClick={() => setCmdOpen(true)}
              className="flex h-11 w-full items-center justify-between rounded-xl border border-hairline bg-card pl-11 pr-4 font-mono text-[13.5px] text-muted-foreground hover:bg-secondary/40"
            >
              Search algorithms, lessons…
              <span className="rounded border border-hairline bg-paper px-1.5 py-0.5 text-[11px]">
                ⌘K
              </span>
            </button>
          </div>
        ) : null}

        <div className={`flex shrink-0 items-center gap-3 ${search ? "" : "ml-auto"}`}>
          {timer && (
            <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-hairline bg-card px-4 font-mono text-[13.5px] text-foreground">
              <Timer className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} /> {timer}
            </span>
          )}
          <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-hairline bg-card px-4 font-mono text-[13.5px] text-foreground">
            <Flame className="h-4 w-4 text-primary" strokeWidth={1.8} /> {stats.streak}
          </span>
          <span className="inline-flex h-10 items-center rounded-xl border border-hairline bg-card px-4 font-mono text-[13.5px] text-foreground">
            {xpLabel}
          </span>
          <Link to="/notifications" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5 text-muted-foreground" strokeWidth={1.7} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
          </Link>
          <Link
            to="/settings"
            aria-label="Account settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint font-mono text-[12px] text-primary"
          >
            {initials}
          </Link>
        </div>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}
