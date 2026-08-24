/**
 * Deterministic weekly league cohort.
 *
 * Everything here is a pure function of (week seed, user XP), so the server HTML and
 * the first client render are byte-identical — no `Math.random()`, no `Date.now()`.
 */

export interface LeagueMember {
  rank: number;
  name: string;
  handle: string;
  initials: string;
  xp: number;
  move: number | null;
  me: boolean;
}

export interface LeagueStanding {
  rows: LeagueMember[];
  size: number;
  myRank: number;
  myXp: number;
  targetRank: number;
  xpToClimb: number;
  promoteRank: number;
  demoteRank: number;
}

/** Small, fast, fully deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Monday 00:00 local time for the week containing `d`. */
export function weekStart(d: Date): Date {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (start.getDay() + 6) % 7; // Monday = 0
  start.setDate(start.getDate() - day);
  return start;
}

/** Monday 00:00 local time of the following week. */
export function weekEnd(d: Date): Date {
  const end = weekStart(d);
  end.setDate(end.getDate() + 7);
  return end;
}

/** ISO-8601 week number and a stable `YYYY-Www` key. */
export function isoWeek(d: Date): { year: number; week: number; key: string } {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3); // Thursday of this week
  const year = target.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
  return { year, week, key: `${year}-W${`${week}`.padStart(2, "0")}` };
}

/** Local 'YYYY-MM-DD' keys for every day of the week containing `d`. */
export function weekDayKeys(d: Date): string[] {
  const start = weekStart(d);
  const out: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const m = `${day.getMonth() + 1}`.padStart(2, "0");
    const dd = `${day.getDate()}`.padStart(2, "0");
    out.push(`${day.getFullYear()}-${m}-${dd}`);
  }
  return out;
}

const FIRST = [
  "Vivaan",
  "Sneha",
  "Rohan",
  "Aarav",
  "Tanvi",
  "Mehul",
  "Ishita",
  "Nikhil",
  "Pooja",
  "Karan",
  "Aditya",
  "Shruti",
  "Kabir",
  "Ananya",
  "Devansh",
  "Riya",
  "Yash",
  "Meera",
  "Farhan",
  "Diya",
  "Omkar",
  "Kavya",
  "Rahul",
  "Neha",
  "Siddharth",
  "Priya",
  "Manav",
  "Aisha",
  "Varun",
  "Lakshmi",
];
const LAST = ["K", "M", "S", "P", "D", "R", "T", "N", "B", "G", "V", "J"];

function handleFor(first: string, last: string, i: number): string {
  const base = first.toLowerCase();
  return i % 3 === 0 ? `@${base}` : i % 3 === 1 ? `@${base}_${last.toLowerCase()}` : `@${base}${i}`;
}

/**
 * Builds a stable cohort for one week and places the signed-in user by real weekly XP.
 * `size` counts the whole league; only a window of rows is returned for display.
 */
export function buildLeague(
  seed: number,
  userXp: number,
  options: { size?: number; name?: string; handle?: string; visible?: number } = {},
): LeagueStanding {
  const size = Math.max(2, options.size ?? 120);
  const visible = Math.max(4, options.visible ?? 13);
  const rand = mulberry32(seed);

  const cohort: LeagueMember[] = [];
  for (let i = 0; i < size - 1; i += 1) {
    const first = FIRST[Math.floor(rand() * FIRST.length)]!;
    const last = LAST[Math.floor(rand() * LAST.length)]!;
    const top = rand();
    // Long tail: a handful of very active students, most in the low hundreds.
    const xp = Math.round(120 + Math.pow(top, 2.4) * 1900);
    const moveRoll = rand();
    const move =
      moveRoll < 0.3 ? null : Math.max(1, Math.round(rand() * 3)) * (moveRoll < 0.65 ? 1 : -1);
    cohort.push({
      rank: 0,
      name: `${first} ${last}.`,
      handle: handleFor(first, last, i),
      initials: `${first[0]}${last[0]}`.toUpperCase(),
      xp,
      move,
      me: false,
    });
  }

  cohort.push({
    rank: 0,
    name: options.name ?? "You",
    handle: options.handle ?? "@you",
    initials: (options.name ?? "You")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    xp: Math.max(0, Math.round(userXp)),
    move: null,
    me: true,
  });

  // Ties break by name so the order never depends on insertion order.
  cohort.sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));
  cohort.forEach((m, i) => {
    m.rank = i + 1;
  });

  const myIndex = cohort.findIndex((m) => m.me);
  const myRank = myIndex + 1;
  const targetIndex = Math.max(0, myIndex - 2);
  const target = cohort[targetIndex]!;
  const xpToClimb = targetIndex === myIndex ? 0 : Math.max(1, target.xp - cohort[myIndex]!.xp + 1);

  // Window: the top of the table, plus the user's neighbourhood when they sit below it.
  let rows = cohort.slice(0, visible);
  if (myRank > visible) {
    const from = Math.max(0, myIndex - 2);
    rows = [...cohort.slice(0, 10), ...cohort.slice(from, from + 3)];
  }

  return {
    rows,
    size,
    myRank,
    myXp: cohort[myIndex]!.xp,
    targetRank: targetIndex + 1,
    xpToClimb,
    promoteRank: 10,
    demoteRank: size - 9,
  };
}
