/**
 * Pure geometry + timing maths for the array visualizer's animated overlays
 * (search-window bracket, lo/hi/mid markers).
 *
 * Architecture constraint: pure functions only — no React, DOM APIs or stores.
 * The presentation layer measures the rendered row width and feeds it in, so
 * markers track real geometry at every viewport instead of hardcoded pixels.
 */

export interface RowGeometry {
  /** Width of a single cell in px. */
  cellWidth: number;
  /** Distance between two neighbouring cell left edges (cell + gap) in px. */
  stride: number;
}

/**
 * Splits a measured row width into per-cell geometry for an `n`-column grid
 * with a fixed `gap`. Returns zeroed geometry when the row is not measured yet.
 */
export function rowGeometry(containerWidth: number, count: number, gap: number): RowGeometry {
  const n = Math.max(1, Math.floor(count));
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) {
    return { cellWidth: 0, stride: 0 };
  }
  const g = Math.max(0, gap);
  const cellWidth = Math.max(0, (containerWidth - g * (n - 1)) / n);
  return { cellWidth, stride: cellWidth + g };
}

/** Horizontal centre of cell `index`, in px from the row's left edge. */
export function cellCenter(
  index: number,
  containerWidth: number,
  count: number,
  gap: number,
): number {
  const n = Math.max(1, Math.floor(count));
  const i = Math.max(0, Math.min(Math.floor(index), n - 1));
  const { cellWidth, stride } = rowGeometry(containerWidth, n, gap);
  return i * stride + cellWidth / 2;
}

export interface WindowExtentPx {
  /** px from the row's left edge to the window's left edge. */
  offset: number;
  /** px width of the window span. */
  width: number;
  /** px from the row's left edge to the window's centre. */
  center: number;
}

/**
 * Pixel extent of the inclusive cell range `from..to`, used to position and
 * scale the dashed search-window bracket.
 */
export function windowExtentPx(
  from: number,
  to: number,
  containerWidth: number,
  count: number,
  gap: number,
): WindowExtentPx {
  const n = Math.max(1, Math.floor(count));
  const a = Math.max(0, Math.min(Math.floor(Math.min(from, to)), n - 1));
  const b = Math.max(0, Math.min(Math.floor(Math.max(from, to)), n - 1));
  const { cellWidth, stride } = rowGeometry(containerWidth, n, gap);
  const offset = a * stride;
  const width = (b - a) * stride + cellWidth;
  return { offset, width, center: offset + width / 2 };
}

/**
 * Horizontal scale factor for a full-width bracket element so it covers
 * `width` px. Falls back to 1 before the row has been measured.
 */
export function scaleXFor(width: number, containerWidth: number): number {
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) return 1;
  return Math.max(0, width) / containerWidth;
}
