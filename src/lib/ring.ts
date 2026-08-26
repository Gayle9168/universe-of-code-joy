/**
 * Geometry for the circular mastery indicator. Pure math — no React, no DOM.
 */

export interface RingGeometry {
  /** Radius of the stroked circle's centre line. */
  radius: number;
  /** Full circumference, used as the dash array. */
  circumference: number;
  /** Dash offset that leaves exactly `pct` of the ring drawn. */
  dashOffset: number;
}

/** Clamps a percentage into 0..100. */
export function clampPct(pct: number): number {
  if (!Number.isFinite(pct)) return 0;
  return Math.max(0, Math.min(100, pct));
}

/**
 * Ring geometry for an SVG of `size` px drawn with `stroke` px width.
 * The dash offset shrinks linearly from the full circumference (0%) to 0 (100%).
 */
export function ringGeometry(size: number, stroke: number, pct: number): RingGeometry {
  const radius = Math.max(0, (size - stroke) / 2);
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clampPct(pct) / 100);
  return { radius, circumference, dashOffset };
}
