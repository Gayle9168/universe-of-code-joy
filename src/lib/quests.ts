/**
 * Quest progress is always derived from `progressStore` counters — never stored as a
 * separate source of truth. Only the claim timestamp is persisted.
 */
import { getAlgorithm } from "@/content/algorithms";
import { getLessons } from "@/content/lessons";
import { getPath } from "@/content/paths";
import type { Quest } from "@/content/types";
import type { ProgressData } from "@/stores/progressStore";
import { isoWeek, weekDayKeys } from "./league";

export interface QuestState {
  quest: Quest;
  current: number;
  target: number;
  pct: number;
  complete: boolean;
  claimed: boolean;
  periodKey: string;
}

/** Local 'YYYY-MM-DD'. Duplicated from the store to keep this module dependency-light. */
function dayKeyOf(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** The bucket a quest resets with: a calendar day for daily, an ISO week for weekly. */
export function periodKeyFor(kind: Quest["kind"], now: Date = new Date()): string {
  return kind === "daily" ? dayKeyOf(now) : isoWeek(now).key;
}

/** Instant when the current period ends (next local midnight / next Monday). */
export function periodEnd(kind: Quest["kind"], now: Date = new Date()): Date {
  if (kind === "daily") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  }
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = (end.getDay() + 6) % 7;
  end.setDate(end.getDate() - day + 7);
  return end;
}

function sameDay(iso: string | null | undefined, key: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && dayKeyOf(d) === key;
}

function inWeek(iso: string | null | undefined, keys: string[]): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && keys.includes(dayKeyOf(d));
}

/** Categories where every lesson is complete. */
export function completedCategories(state: ProgressData): string[] {
  const byCategory = new Map<string, { total: number; done: number }>();
  for (const lesson of getLessons()) {
    const category = getAlgorithm(lesson.algorithmSlug)?.category ?? "other";
    const bucket = byCategory.get(category) ?? { total: 0, done: 0 };
    bucket.total += 1;
    if (state.lessons[lesson.slug]?.completedAt) bucket.done += 1;
    byCategory.set(category, bucket);
  }
  return [...byCategory.entries()]
    .filter(([, b]) => b.total > 0 && b.done === b.total)
    .map(([c]) => c);
}

/** Percent of the active path's items that are mastered enough to count as done. */
export function activePathPct(state: ProgressData): number {
  const path = state.activePathSlug ? getPath(state.activePathSlug) : null;
  if (!path) return 0;
  const slugs = path.modules.flatMap((m) => m.itemSlugs);
  if (slugs.length === 0) return 0;
  const done = slugs.filter((s) => (state.algorithms[s]?.masteryPct ?? 0) >= 60).length;
  return Math.round((done / slugs.length) * 100);
}

/** Raw counter behind a single quest, in the quest's own units. */
export function questCurrent(quest: Quest, state: ProgressData, now: Date = new Date()): number {
  const today = dayKeyOf(now);
  const weekKeys = weekDayKeys(now);
  const todayRow = state.activity[today] ?? { xp: 0, minutes: 0, steps: 0, solved: 0 };
  const weekRows = weekKeys.map(
    (k) => state.activity[k] ?? { xp: 0, minutes: 0, steps: 0, solved: 0 },
  );
  const lessonRows = Object.values(state.lessons);

  switch (quest.id) {
    case "daily-lesson":
      return lessonRows.filter((l) => sameDay(l.completedAt, today)).length;
    case "daily-problems":
      return todayRow.solved;
    case "daily-quiz":
      return lessonRows.filter((l) => sameDay(l.completedAt, today) && (l.quizScore ?? 0) >= 80)
        .length;
    case "daily-xp":
      return todayRow.xp;
    case "daily-streak":
      return todayRow.xp + todayRow.minutes + todayRow.steps + todayRow.solved > 0 ? 1 : 0;
    case "daily-review":
      return Object.values(state.reviewCards).filter((c) => sameDay(c.lastGradedISO, today)).length;
    case "weekly-lessons":
      return lessonRows.filter((l) => inWeek(l.completedAt, weekKeys)).length;
    case "weekly-problems":
      return weekRows.reduce((sum, r) => sum + r.solved, 0);
    case "weekly-category":
      return completedCategories(state).length > 0 ? 1 : 0;
    case "weekly-streak":
      return weekRows.filter((r) => r.xp + r.minutes + r.steps + r.solved > 0).length;
    case "weekly-path-progress":
      return activePathPct(state);
    case "weekly-xp":
      return weekRows.reduce((sum, r) => sum + r.xp, 0);
    default:
      return 0;
  }
}

/** Full derived state for a quest, including whether this period's reward was claimed. */
export function questState(quest: Quest, state: ProgressData, now: Date = new Date()): QuestState {
  const periodKey = periodKeyFor(quest.kind, now);
  const stored = state.quests[quest.id];
  const target = Math.max(1, quest.target);
  const current = Math.min(target, questCurrent(quest, state, now));
  return {
    quest,
    current,
    target,
    pct: Math.round((current / target) * 100),
    complete: current >= target,
    claimed: Boolean(stored?.claimedAt) && stored?.periodKey === periodKey,
    periodKey,
  };
}

/** `HH:MM:SS` until the given instant, clamped at zero. */
export function formatCountdown(msLeft: number): string {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  const h = `${Math.floor(total / 3600)}`.padStart(2, "0");
  const m = `${Math.floor((total % 3600) / 60)}`.padStart(2, "0");
  const s = `${total % 60}`.padStart(2, "0");
  return `${h}:${m}:${s}`;
}
