/**
 * XP + level curve. Pure functions — no store, no React, no DOM.
 *
 * xpForLevel(level) is the total XP a user must reach to LEAVE that level.
 * Level 1 starts at 0 XP.
 */

const MAX_LEVEL = 1_000_000;

function safeXp(xp: number): number {
  if (!Number.isFinite(xp) || xp < 0) return 0;
  return Math.floor(xp);
}

/** Total XP required to leave `level` and enter `level + 1`. */
export function xpForLevel(level: number): number {
  const l = Number.isFinite(level) && level >= 1 ? Math.floor(level) : 1;
  return Math.round(100 * Math.pow(l, 1.35));
}

/** Current level for a total XP amount. Always >= 1, never NaN. */
export function levelFromXp(xp: number): number {
  const total = safeXp(xp);
  if (total < xpForLevel(1)) return 1;

  // Binary search the largest L where xpForLevel(L) <= total, level = L + 1.
  let lo = 1;
  let hi = 1;
  while (hi < MAX_LEVEL && xpForLevel(hi) <= total) hi *= 2;
  hi = Math.min(hi, MAX_LEVEL);
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (xpForLevel(mid) <= total) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

/** XP floor of the given level (0 for level 1). */
export function xpAtLevelStart(level: number): number {
  const l = Number.isFinite(level) && level >= 1 ? Math.floor(level) : 1;
  return l <= 1 ? 0 : xpForLevel(l - 1);
}

/** XP still needed to reach the next level. Always > 0. */
export function xpToNextLevel(xp: number): number {
  const total = safeXp(xp);
  const level = levelFromXp(total);
  return Math.max(1, xpForLevel(level) - total);
}

/** Progress through the current level, 0–100. */
export function progressPct(xp: number): number {
  const total = safeXp(xp);
  const level = levelFromXp(total);
  const start = xpAtLevelStart(level);
  const end = xpForLevel(level);
  const span = end - start;
  if (span <= 0) return 0;
  const pct = ((total - start) / span) * 100;
  if (!Number.isFinite(pct)) return 0;
  return Math.min(100, Math.max(0, Math.round(pct)));
}
