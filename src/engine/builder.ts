import type { AlgorithmRun, AuxPanel, CodeLineMap, Frame, Step } from "@/engine/types";

export const MAX_FRAMES = 2000;

/**
 * Which line of a real-language listing corresponds to `codeLine`.
 *
 * `codeLine` indexes the pseudocode, which has no closing braces, so it drifts
 * from the JS/TS listings — see `CodeLineMap`. Returns a 1-based line, or null
 * when the pseudocode line has no counterpart in that language.
 */
export function resolveCodeLine(
  run: Pick<AlgorithmRun, "codeMap" | "codeByLang">,
  lang: "js" | "ts" | "py",
  codeLine: number | null,
): number | null {
  if (codeLine === null || codeLine < 1) return null;
  const map = run.codeMap?.[lang];
  const mapped = map ? map[codeLine - 1] : codeLine;
  if (mapped === undefined || mapped < 1) return null;
  return mapped > run.codeByLang[lang].length ? null : mapped;
}

export interface EmitArgs {
  frame: Frame;
  aux?: AuxPanel[];
  codeLine: number;
  narration: string;
  detail?: string;
  phase: string;
  /** Short label for the numbered step timeline; defaults to `phase` in the view. */
  timelineLabel?: string;
  isMilestone?: boolean;
}


function deepClone<T>(value: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);
}

/**
 * Accumulates steps for an algorithm run. Pure logic — no DOM, no timers.
 * Counters carry forward cumulatively and never decrease.
 */
export class StepBuilder {
  private readonly steps: Step[] = [];
  private readonly counters: Record<string, number> = {};
  private truncated = false;

  constructor(
    private readonly pseudocode: string[],
    private readonly codeByLang: AlgorithmRun["codeByLang"],
    private readonly codeMap?: CodeLineMap,
  ) {}

  emit(args: EmitArgs): this {
    if (this.steps.length >= MAX_FRAMES) {
      this.truncated = true;
      return this;
    }

    const { frame, aux, codeLine, narration, detail, phase, timelineLabel, isMilestone } = args;

    if (!Number.isInteger(codeLine) || codeLine < 1 || codeLine > this.pseudocode.length) {
      throw new Error(
        `StepBuilder.emit: codeLine ${String(codeLine)} is out of range for pseudocode of ` +
          `${this.pseudocode.length} line(s) (expected an integer between 1 and ${this.pseudocode.length}). ` +
          `Step index ${this.steps.length}, phase "${phase}".`,
      );
    }

    const step: Step = {
      i: this.steps.length,
      frame: deepClone(frame),
      codeLine,
      narration,
      phase,
      counters: { ...this.counters },
    };
    if (aux !== undefined) step.aux = deepClone(aux);
    if (detail !== undefined) step.detail = detail;
    if (timelineLabel !== undefined) step.timelineLabel = timelineLabel;
    if (isMilestone !== undefined) step.isMilestone = isMilestone;


    this.steps.push(step);
    return this;
  }

  /** Mutates the running counter; applies to SUBSEQUENT steps. */
  bump(name: string, by = 1): this {
    if (by < 0) {
      throw new Error(`StepBuilder.bump: counters never decrease (got by=${by} for "${name}").`);
    }
    this.counters[name] = (this.counters[name] ?? 0) + by;
    return this;
  }

  get count(): number {
    return this.steps.length;
  }

  finish(slug: string, inputSummary: string, result: string): AlgorithmRun {
    const last = this.steps[this.steps.length - 1];
    const totalCounters = last ? { ...last.counters } : { ...this.counters };

    return Object.freeze({
      slug,
      steps: this.steps,
      pseudocode: this.pseudocode,
      codeByLang: this.codeByLang,
      ...(this.codeMap ? { codeMap: this.codeMap } : {}),
      inputSummary,
      result,
      totalCounters,
      truncated: this.truncated,
    }) as AlgorithmRun;
  }
}
