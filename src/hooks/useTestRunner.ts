import { useCallback, useEffect, useRef, useState } from "react";
import type { ProblemIo, ProblemTest } from "@/content/types";
import {
  entryName,
  stripTypes,
  summarize,
  toResults,
  workerSource,
  type RunSummary,
  type RunnerLang,
  type TestResult,
} from "@/lib/runner";

export type RunnerStatus = "idle" | "running" | "done";

export interface RunnerState {
  status: RunnerStatus;
  results: TestResult[];
  summary: RunSummary | null;
  error: string | null;
}

const TIMEOUT_MS = 3000;

const idleResults = (tests: ProblemTest[]): TestResult[] => toResults(tests, []);

/**
 * Executes user code against a problem's tests inside a throwaway Web Worker
 * with a hard timeout, so an infinite loop can never freeze the page.
 *
 * `io` is the problem's argument marshalling descriptor — pass it for problems
 * whose starter code declares `TreeNode`/`ListNode` parameters.
 */
export function useTestRunner(tests: ProblemTest[], io?: ProblemIo) {
  const [state, setState] = useState<RunnerState>({
    status: "idle",
    results: idleResults(tests),
    summary: null,
    error: null,
  });
  const workerRef = useRef<Worker | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setState({ status: "idle", results: idleResults(tests), summary: null, error: null });
  }, [cleanup, tests]);

  const run = useCallback(
    (code: string, lang: RunnerLang, subset?: ProblemTest[]): Promise<RunnerState> => {
      const selected = subset ?? tests;
      const fail = (error: string): Promise<RunnerState> => {
        const next: RunnerState = {
          status: "done",
          results: idleResults(selected),
          summary: null,
          error,
        };
        setState(next);
        return Promise.resolve(next);
      };

      if (lang === "py") {
        return fail(
          "Python runs in the reader only for now — switch to JavaScript or TypeScript to run the tests.",
        );
      }
      if (typeof window === "undefined" || typeof Worker === "undefined") {
        return fail("The test runner is unavailable in this environment.");
      }

      let js: string;
      try {
        js = lang === "ts" ? stripTypes(code) : code;
      } catch {
        return fail("Could not parse your TypeScript. Try the JavaScript tab.");
      }
      const entry = entryName(js);
      if (!entry)
        return fail("No function declaration found — keep the provided function signature.");

      cleanup();
      setState({ status: "running", results: idleResults(selected), summary: null, error: null });

      return new Promise<RunnerState>((resolve) => {
        const url = URL.createObjectURL(
          new Blob([workerSource(js, entry, io)], { type: "text/javascript" }),
        );
        const worker = new Worker(url);
        workerRef.current = worker;

        const finish = (next: RunnerState): void => {
          URL.revokeObjectURL(url);
          cleanup();
          setState(next);
          resolve(next);
        };

        worker.onmessage = (event: MessageEvent) => {
          const data = event.data as
            | { kind: "compile-error"; message: string }
            | { kind: "done"; results: Parameters<typeof toResults>[1] };
          if (data.kind === "compile-error") {
            finish({
              status: "done",
              results: idleResults(selected),
              summary: null,
              error: data.message,
            });
            return;
          }
          const results = toResults(selected, data.results);
          finish({ status: "done", results, summary: summarize(results), error: null });
        };

        worker.onerror = (event) => {
          finish({
            status: "done",
            results: idleResults(selected),
            summary: null,
            error: event.message || "Your code threw before any test ran.",
          });
        };

        timerRef.current = setTimeout(() => {
          finish({
            status: "done",
            results: idleResults(selected),
            summary: null,
            error: `Timed out after ${TIMEOUT_MS / 1000}s — check for an infinite loop.`,
          });
        }, TIMEOUT_MS);

        worker.postMessage({ tests: selected });
      });
    },
    [cleanup, tests, io],
  );

  return { ...state, run, reset };
}
