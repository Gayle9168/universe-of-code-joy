import { describe, expect, it } from "vitest";
import { resolveCodeLine } from "@/engine/builder";
import { listAllModules } from "@/engine/registry";
import type { AlgorithmRun } from "@/engine/types";

const LANGS = ["js", "ts", "py"] as const;

/** Minimal stand-in — `resolveCodeLine` only reads `codeMap` and `codeByLang`. */
function stub(
  codeMap: AlgorithmRun["codeMap"],
  lengths: Record<(typeof LANGS)[number], number> = { js: 5, ts: 5, py: 5 },
): Pick<AlgorithmRun, "codeMap" | "codeByLang"> {
  return {
    ...(codeMap ? { codeMap } : {}),
    codeByLang: {
      js: Array.from({ length: lengths.js }, (_, i) => `js ${i + 1}`),
      ts: Array.from({ length: lengths.ts }, (_, i) => `ts ${i + 1}`),
      py: Array.from({ length: lengths.py }, (_, i) => `py ${i + 1}`),
    },
  };
}

describe("resolveCodeLine", () => {
  it("falls back to identity when the run has no map at all", () => {
    expect(resolveCodeLine(stub(undefined), "js", 3)).toBe(3);
  });

  it("falls back to identity for a language the map omits", () => {
    expect(resolveCodeLine(stub({ js: [5, 4, 3, 2, 1] }), "py", 2)).toBe(2);
  });

  it("translates through the map for a language it covers", () => {
    expect(resolveCodeLine(stub({ js: [1, 2, 3, 4, 14] }, { js: 15, ts: 5, py: 5 }), "js", 5)).toBe(
      14,
    );
  });

  it("returns null for a null codeLine", () => {
    expect(resolveCodeLine(stub({ js: [1, 2, 3] }), "js", null)).toBeNull();
  });

  it("returns null when the map marks a line as having no counterpart", () => {
    expect(resolveCodeLine(stub({ js: [1, 0, 3] }), "js", 2)).toBeNull();
  });

  it("returns null past the end of a short map rather than reading undefined", () => {
    expect(resolveCodeLine(stub({ js: [1, 2] }), "js", 3)).toBeNull();
  });

  it("returns null when the mapped line exceeds the listing length", () => {
    expect(resolveCodeLine(stub({ js: [99] }), "js", 1)).toBeNull();
  });

  it("returns null for out-of-range codeLine values", () => {
    expect(resolveCodeLine(stub(undefined), "js", 0)).toBeNull();
    expect(resolveCodeLine(stub(undefined), "js", -1)).toBeNull();
    expect(resolveCodeLine(stub(undefined), "js", 99)).toBeNull();
  });
});

describe("every module's CODE_MAP", () => {
  for (const mod of listAllModules()) {
    const preset = mod.presets[0]!;
    const validation = mod.validate(preset.values);
    if (!validation.ok) throw new Error(`${mod.slug}: preset failed validation`);
    const run = mod.run(validation.parsed);

    it(`${mod.slug} covers every pseudocode line in every language`, () => {
      for (const lang of LANGS) {
        const map = run.codeMap?.[lang];
        if (!map) continue;
        expect(map, `${mod.slug}/${lang}`).toHaveLength(run.pseudocode.length);
      }
    });

    it(`${mod.slug} resolves every emitted codeLine to a real listing line`, () => {
      // A run's steps only touch some pseudocode lines, but every one it does
      // touch must land somewhere real — that is the bug A7 fixed.
      for (const step of run.steps) {
        for (const lang of LANGS) {
          const resolved = resolveCodeLine(run, lang, step.codeLine);
          expect(resolved, `${mod.slug}/${lang} step ${step.i}`).not.toBeNull();
          expect(resolved!).toBeGreaterThanOrEqual(1);
          expect(resolved!).toBeLessThanOrEqual(run.codeByLang[lang].length);
        }
      }
    });
  }
});
