/**
 * The shape check both rotated-array questions need.
 *
 * Split out rather than duplicated because the rule is subtler than it looks and
 * two copies would drift: a rotation of a strictly increasing list steps down *at
 * most once*, and if it steps down at all it must also wrap — the last value below
 * the first. Both halves are load-bearing. [1, 5, 2, 3] steps down exactly once
 * and is still not a rotation of any sorted list, which only the wrap check
 * catches.
 *
 * Duplicates are rejected rather than approximated. Equal values genuinely break
 * the O(log n) guarantee for both questions — that is why a separate "with
 * duplicates" variant of each exists — so animating a confident answer would be
 * teaching a bug. Callers pass their own explanation of why, since the mechanic
 * that fails differs between them.
 */
export function checkRotatedShape(a: number[], whyUniqueMatters: string): string | null {
  const n = a.length;
  const seen = new Map<number, number>();
  for (let i = 0; i < n; i += 1) {
    const first = seen.get(a[i]!);
    if (first !== undefined) {
      return `Every value must be different, but ${a[i]!} appears at index ${first} and index ${i}. ${whyUniqueMatters}`;
    }
    seen.set(a[i]!, i);
  }
  const descents: number[] = [];
  for (let i = 0; i + 1 < n; i += 1) if (a[i]! > a[i + 1]!) descents.push(i);
  if (descents.length > 1) {
    return `A rotated sorted list steps down exactly once, but this one steps down ${descents.length} times, after indexes ${descents.join(", ")}.`;
  }
  if (descents.length === 1 && !(a[n - 1]! < a[0]!)) {
    return `This steps down once, but it does not wrap: a[${n - 1}] = ${a[n - 1]!} would have to be below a[0] = ${a[0]!} for the list to be a rotation of a sorted one.`;
  }
  return null;
}

/** How far left the sorted list was rotated, i.e. where the smallest value ended up. */
export function rotationOf(values: number[]): number {
  let min = 0;
  for (let i = 1; i < values.length; i += 1) if (values[i]! < values[min]!) min = i;
  return min;
}

/** `rotated left by k`, or `not rotated`, for an input summary. */
export function rotationNote(values: number[]): string {
  const k = rotationOf(values);
  return k === 0 ? "not rotated" : `rotated left by ${k}`;
}
