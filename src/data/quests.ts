import type { Quest } from "./types";

export const quests: Quest[] = [
  {
    id: "daily-lesson",
    title: "Daily Lesson",
    description: "Complete 1 lesson today.",
    kind: "daily",
    target: 1,
    xp: 20,
    icon: "BookOpen",
  },
  {
    id: "daily-problems",
    title: "Sharpen Your Skills",
    description: "Solve 2 coding problems today.",
    kind: "daily",
    target: 2,
    xp: 30,
    icon: "Code2",
  },
  {
    id: "daily-quiz",
    title: "Quiz Check-In",
    description: "Score at least 80% on 1 lesson quiz today.",
    kind: "daily",
    target: 1,
    xp: 15,
    icon: "HelpCircle",
  },
  {
    id: "daily-xp",
    title: "XP Hunter",
    description: "Earn 100 XP today.",
    kind: "daily",
    target: 100,
    xp: 25,
    icon: "Zap",
  },
  {
    id: "daily-streak",
    title: "Keep the Flame Alive",
    description: "Log in and complete any activity today.",
    kind: "daily",
    target: 1,
    xp: 10,
    icon: "Flame",
  },
  {
    id: "daily-review",
    title: "Review Session",
    description: "Revisit 1 previously completed lesson.",
    kind: "daily",
    target: 1,
    xp: 15,
    icon: "RotateCcw",
  },
  {
    id: "weekly-lessons",
    title: "Weekly Learner",
    description: "Complete 7 lessons this week.",
    kind: "weekly",
    target: 7,
    xp: 120,
    icon: "CalendarDays",
  },
  {
    id: "weekly-problems",
    title: "Problem Marathon",
    description: "Solve 15 coding problems this week.",
    kind: "weekly",
    target: 15,
    xp: 180,
    icon: "Swords",
  },
  {
    id: "weekly-category",
    title: "Category Deep Dive",
    description: "Complete all lessons in one category this week.",
    kind: "weekly",
    target: 1,
    xp: 150,
    icon: "Layers",
  },
  {
    id: "weekly-streak",
    title: "Perfect Week",
    description: "Maintain your streak for all 7 days this week.",
    kind: "weekly",
    target: 7,
    xp: 200,
    icon: "Trophy",
  },
  {
    id: "weekly-path-progress",
    title: "Path Progress",
    description: "Advance 20% through any learning path this week.",
    kind: "weekly",
    target: 20,
    xp: 160,
    icon: "Milestone",
  },
  {
    id: "weekly-xp",
    title: "XP Powerhouse",
    description: "Earn 500 XP this week.",
    kind: "weekly",
    target: 500,
    xp: 220,
    icon: "Sparkles",
  },
];

export function getQuest(id: string): Quest | undefined {
  return quests.find((q) => q.id === id);
}

export function getQuests(): Quest[] {
  return quests;
}

export function getQuestsByKind(kind: Quest["kind"]): Quest[] {
  return quests.filter((q) => q.kind === kind);
}

export async function fetchQuest(id: string): Promise<Quest | null> {
  return getQuest(id) ?? null;
}

export async function fetchQuests(): Promise<Quest[]> {
  return getQuests();
}

export async function fetchQuestsByKind(kind: Quest["kind"]): Promise<Quest[]> {
  return getQuestsByKind(kind);
}
