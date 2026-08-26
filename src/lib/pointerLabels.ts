/**
 * Display labels for engine pointer names.
 *
 * The engine speaks in short names (`lo`, `hi`, `mid`); the learning UI spells
 * them the way the lesson does (`low`, `high`, `mid`). Pure presentation
 * mapping — no engine change, no stores, no DOM.
 */
const LABELS: Record<string, string> = {
  lo: "low",
  hi: "high",
  mid: "mid",
  l: "left",
  r: "right",
};

/** The lesson-facing label for a pointer or variable name. */
export function pointerLabel(name: string): string {
  return LABELS[name.toLowerCase()] ?? name;
}
