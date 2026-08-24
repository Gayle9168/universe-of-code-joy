/**
 * Pure helpers for the practice test runner.
 *
 * Nothing here touches the DOM, a Worker or a store: everything is a pure
 * function so it can be unit tested in Node. The Worker plumbing lives in
 * `src/hooks/useTestRunner.ts`.
 */

import type { ProblemTest } from "@/content/types";
import { IO_PREAMBLE_SOURCE, type ProblemIo } from "@/lib/problem-io";

export type RunnerLang = "js" | "ts" | "py";

export type TestOutcome = "idle" | "pass" | "fail" | "error";

export interface TestResult {
  id: string;
  outcome: TestOutcome;
  /** Serialized actual value, or the error message when `outcome === 'error'`. */
  actual: string;
  expected: string;
  ms: number | null;
  logs?: string[];
}

export interface RunSummary {
  passed: number;
  total: number;
  totalMs: number;
  verdict: "accepted" | "failed" | "error";
}

/* ------------------------------ formatting ------------------------------ */

/** Compact, deterministic display form for a test value. */
export function formatValue(value: unknown): string {
  if (value === undefined) return "undefined";
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

/** Human-readable "Input: …" text for a test row. */
export function formatArgs(input: unknown[]): string {
  return input.map(formatValue).join(", ");
}

/** Structural equality with NaN treated as equal to NaN. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number") {
    return Number.isNaN(a) && Number.isNaN(b);
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a as Record<string, unknown>);
    const kb = Object.keys(b as Record<string, unknown>);
    if (ka.length !== kb.length) return false;
    return ka.every(
      (k) =>
        Object.prototype.hasOwnProperty.call(b, k) &&
        deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
    );
  }
  return false;
}

/* ------------------------------ entry point ------------------------------ */

/** First top-level function name declared in the source, or null. */
export function entryName(code: string): string | null {
  const fn = /(?:^|\n)\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/.exec(code);
  if (fn?.[1]) return fn[1];
  const arrow =
    /(?:^|\n)\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/.exec(
      code,
    );
  return arrow?.[1] ?? null;
}

/* ------------------------------ TS stripping ------------------------------ */

import { transform } from "sucrase";

/**
 * Remove TypeScript-only syntax so the source can run as plain JavaScript.
 * Uses sucrase for robust handling of generics, `as const`, `satisfies`,
 * parameter properties, arrow return types, and all other TS constructs.
 */
export function stripTypes(src: string): string {
  return transform(src, {
    transforms: ["typescript"],
    disableESTransforms: true,
  }).code;
}

/* ------------------------------ worker source ------------------------------ */

export interface RunRequest {
  code: string;
  lang: RunnerLang;
  entry: string;
  tests: ProblemTest[];
}

/**
 * Source of the sandbox worker that executes user code against the tests.
 *
 * `io` describes how to turn a test's flat JSON into the `TreeNode`/`ListNode`
 * arguments the starter code declares, and how to turn the return value back
 * into something comparable with `expected`. Omit it and inputs are applied raw,
 * which is what all but ten catalog problems want.
 */
export function workerSource(code: string, entry: string, io?: ProblemIo): string {
  const argCodecs = io ? JSON.stringify(io.args) : "null";
  const returnCodec = io ? JSON.stringify(io.returns) : '"raw"';
  return `
delete self.fetch;
delete self.XMLHttpRequest;
delete self.WebSocket;
delete self.indexedDB;

var __dateNow = Date.now;
var __now = self.performance ? function () { return self.performance.now(); } : function () { return __dateNow(); };
Math.random = () => 0.5;
Date.now = () => 0;

var __logs = [];
console.log = function() {
  if (__logs.length < 50) {
    var args = Array.prototype.slice.call(arguments);
    var msg = args.map(function(a) { 
      try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } 
      catch (e) { return String(a); }
    }).join(" ");
    __logs.push(msg);
  } else if (__logs.length === 50) {
    __logs.push("... [console output truncated] ...");
  }
};

${IO_PREAMBLE_SOURCE}

${code}

self.onmessage = function (event) {
  var data = event.data;
  var results = [];
  var fn = typeof ${entry} === 'function' ? ${entry} : null;
  var __argCodecs = ${argCodecs};
  var __returnCodec = ${returnCodec};

  if (!fn) {
    self.postMessage({ kind: 'compile-error', message: 'No function named ' + "${entry}" + ' was found.' });
    return;
  }
  
  for (var i = 0; i < data.tests.length; i += 1) {
    var test = data.tests[i];
    var started = __now();
    __logs = [];
    try {
      var __inputs = __marshalArgs(JSON.parse(JSON.stringify(test.input)), __argCodecs);
      var __raw = fn.apply(null, __inputs);
      var actual = __raw === undefined ? null : __marshalReturn(__raw, __returnCodec);
      results.push({
        id: test.id,
        ok: true,
        actual: actual,
        undef: __raw === undefined,
        ms: __now() - started,
        logs: __logs.slice()
      });
    } catch (err) {
      results.push({ 
        id: test.id, 
        ok: false, 
        message: String(err && err.message ? err.message : err), 
        ms: __now() - started,
        logs: __logs.slice()
      });
    }
  }
  self.postMessage({ kind: 'done', results: results });
};
`;
}

/** Convert raw worker output into display rows. */
export function toResults(
  tests: ProblemTest[],
  raw: Array<{
    id: string;
    ok: boolean;
    actual?: unknown;
    undef?: boolean;
    message?: string;
    ms: number;
    logs?: string[];
  }>,
): TestResult[] {
  return tests.map((test) => {
    const row = raw.find((r) => r.id === test.id);
    const expected = formatValue(test.expected);
    if (!row) return { id: test.id, outcome: "idle", actual: "—", expected, ms: null };
    if (!row.ok) {
      return {
        id: test.id,
        outcome: "error",
        actual: row.message ?? "Runtime error",
        expected,
        ms: Math.round(row.ms),
        logs: row.logs,
      };
    }
    const actual = row.undef ? undefined : row.actual;
    return {
      id: test.id,
      outcome: deepEqual(actual, test.expected) ? "pass" : "fail",
      actual: formatValue(actual),
      expected,
      ms: Math.round(row.ms),
      logs: row.logs,
    };
  });
}

/** Aggregate verdict for a finished run. */
export function summarize(results: TestResult[]): RunSummary {
  const total = results.length;
  const passed = results.filter((r) => r.outcome === "pass").length;
  const totalMs = results.reduce((sum, r) => sum + (r.ms ?? 0), 0);
  const errored = results.some((r) => r.outcome === "error");
  return {
    passed,
    total,
    totalMs: Math.round(totalMs),
    verdict: passed === total && total > 0 ? "accepted" : errored ? "error" : "failed",
  };
}

/** XP awarded for a first-time solve: full value, reduced after failed attempts. */
export function solveXp(baseXp: number, attempts: number, hintsUsed: number): number {
  const attemptPenalty = Math.min(Math.max(attempts - 1, 0) * 0.1, 0.4);
  const hintPenalty = Math.min(hintsUsed * 0.1, 0.3);
  return Math.max(
    Math.round(baseXp * (1 - attemptPenalty - hintPenalty)),
    Math.round(baseXp * 0.3),
  );
}
