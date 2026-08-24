/**
 * Generic, pure graph layout helpers in a 0-100 x / 0-100 y coordinate space.
 * Reused by BFS, DFS, Dijkstra and topological sort.
 */

export interface Point {
  x: number;
  y: number;
}

export type Positions = Record<string, Point>;

const PAD = 10;
const SPAN = 100 - PAD * 2;

function spread(count: number, index: number): number {
  if (count <= 1) return 50;
  return PAD + (SPAN * index) / (count - 1);
}

/**
 * Places nodes in horizontal layers by breadth-first distance from `startIds`.
 * Nodes unreachable from any start are placed on a circle at the bottom-right.
 */
export function layeredLayout(
  nodeIds: string[],
  neighborsOf: (id: string) => string[],
  startIds: string[],
): Positions {
  const known = new Set(nodeIds);
  const depth = new Map<string, number>();
  const layers: string[][] = [];

  const seeds = startIds.filter((id) => known.has(id));
  const queue: string[] = [];

  for (const seed of seeds) {
    if (depth.has(seed)) continue;
    depth.set(seed, 0);
    queue.push(seed);
  }

  let head = 0;
  while (head < queue.length) {
    const node = queue[head]!;
    head += 1;
    const d = depth.get(node) ?? 0;
    (layers[d] ??= []).push(node);
    for (const next of neighborsOf(node)) {
      if (!known.has(next) || depth.has(next)) continue;
      depth.set(next, d + 1);
      queue.push(next);
    }
  }

  const positions: Positions = {};
  const layerCount = layers.length;
  const maxRows = 6;
  const colCount = Math.max(1, Math.ceil(layerCount / maxRows));
  const colWidth = 80 / colCount;

  for (let d = 0; d < layerCount; d += 1) {
    const layer = layers[d] ?? [];
    const colIndex = Math.floor(d / maxRows);
    const isSnakingUp = colIndex % 2 === 1;

    const rawRow = d % maxRows;
    const rowIndex = isSnakingUp ? maxRows - 1 - rawRow : rawRow;

    const effectiveRows = Math.min(layerCount, maxRows);
    const y = effectiveRows <= 1 ? 22 : PAD + (SPAN * rowIndex) / (effectiveRows - 1);

    const colCenterX = 10 + (colIndex + 0.5) * colWidth;

    for (let i = 0; i < layer.length; i += 1) {
      let x = colCenterX;
      if (layer.length > 1) {
        const spreadSpan = colCount > 1 ? colWidth * 0.8 : colWidth;
        const xOffset = (spreadSpan * i) / (layer.length - 1) - spreadSpan / 2;
        x += xOffset;
      }
      positions[layer[i]!] = { x: round(x), y: round(y) };
    }
  }

  const orphans = nodeIds.filter((id) => !depth.has(id));
  Object.assign(positions, circularLayout(orphans, { x: 50, y: 88 }, 34));
  return positions;
}

/** Even circular placement — the fallback for disconnected components. */
export function circularLayout(nodeIds: string[], center: Point, radius: number): Positions {
  const positions: Positions = {};
  const n = nodeIds.length;
  if (n === 0) return positions;
  if (n === 1) {
    positions[nodeIds[0]!] = { x: round(center.x), y: round(center.y) };
    return positions;
  }
  for (let i = 0; i < n; i += 1) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    positions[nodeIds[i]!] = {
      x: round(clamp(center.x + radius * Math.cos(angle))),
      y: round(clamp(center.y + radius * Math.sin(angle) * 0.55)),
    };
  }
  return positions;
}

function clamp(v: number): number {
  return Math.min(96, Math.max(4, v));
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}
