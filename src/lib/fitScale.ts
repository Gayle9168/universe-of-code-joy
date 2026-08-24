/**
 * Pure maths for scaling a fixed-width desktop layout down to a narrower
 * container, so small screens see a faithful miniature instead of a reflow.
 *
 * Architecture constraint: pure functions only — no React, DOM APIs or stores.
 */

/** Width the desktop workspace is authored against. */
export const DESIGN_WIDTH = 1440;
/** Height the desktop workspace is authored against. */
export const DESIGN_HEIGHT = 900;

/**
 * Uniform scale factor that fits `designWidth` into `containerWidth`.
 * Never upscales (caps at 1) and returns 1 before the container is measured,
 * so the server render and the first client render agree.
 */
export function fitScale(containerWidth: number, designWidth: number = DESIGN_WIDTH): number {
  const design = designWidth > 0 ? designWidth : DESIGN_WIDTH;
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) return 1;
  return Math.min(1, containerWidth / design);
}

/** Layout height a scaled board occupies, so nothing below it overlaps. */
export function scaledHeight(scale: number, designHeight: number = DESIGN_HEIGHT): number {
  const height = designHeight > 0 ? designHeight : DESIGN_HEIGHT;
  const s = Number.isFinite(scale) && scale > 0 ? scale : 1;
  return height * s;
}
