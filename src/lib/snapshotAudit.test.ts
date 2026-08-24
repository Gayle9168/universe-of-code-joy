import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const FORBIDDEN_SNAPSHOT_PATTERNS: { name: string; regex: RegExp }[] = [
  { name: "toMatchSnapshot", regex: /\.\s*toMatchSnapshot\s*\(/ },
  { name: "toMatchInlineSnapshot", regex: /\.\s*toMatchInlineSnapshot\s*\(/ },
  { name: "toMatchFileSnapshot", regex: /\.\s*toMatchFileSnapshot\s*\(/ },
  {
    name: "toThrowErrorMatchingSnapshot",
    regex: /\.\s*toThrowErrorMatchingSnapshot\s*\(/,
  },
  {
    name: "toThrowErrorMatchingInlineSnapshot",
    regex: /\.\s*toThrowErrorMatchingInlineSnapshot\s*\(/,
  },
];

export interface SnapshotViolation {
  filePath: string;
  pattern: string;
  line: number;
  preview: string;
}

export function auditTestFileContent(filePath: string, content: string): SnapshotViolation[] {
  const violations: SnapshotViolation[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Ignore lines that are comments or part of the audit test itself defining patterns
    if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
      continue;
    }

    for (const pattern of FORBIDDEN_SNAPSHOT_PATTERNS) {
      if (pattern.regex.test(line)) {
        violations.push({
          filePath,
          pattern: pattern.name,
          line: i + 1,
          preview: line.trim(),
        });
      }
    }
  }

  return violations;
}

function findFilesRecursive(dir: string, filter: (filePath: string) => boolean): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") {
        continue;
      }
      results.push(...findFilesRecursive(fullPath, filter));
    } else if (entry.isFile() && filter(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

describe("Zero Snapshot-Only Tests Audit (Criterion S11.4)", () => {
  it("audit scanner correctly flags forbidden snapshot assertions in synthetic samples", () => {
    const cleanSample = `
      it("adds numbers correctly", () => {
        expect(1 + 1).toBe(2);
        expect({ a: 1 }).toEqual({ a: 1 });
      });
    `;
    expect(auditTestFileContent("clean.test.ts", cleanSample)).toEqual([]);

    const dirtySample1 = `
      it("renders component", () => {
        expect(tree).toMatchSnapshot();
      });
    `;
    const v1 = auditTestFileContent("dirty1.test.ts", dirtySample1);
    expect(v1.length).toBe(1);
    expect(v1[0].pattern).toBe("toMatchSnapshot");

    const dirtySample2 = `
      it("matches inline", () => {
        expect(result).toMatchInlineSnapshot('"<div></div>"');
      });
    `;
    const v2 = auditTestFileContent("dirty2.test.ts", dirtySample2);
    expect(v2.length).toBe(1);
    expect(v2[0].pattern).toBe("toMatchInlineSnapshot");

    const dirtySample3 = `
      it("throws error", () => {
        expect(() => fn()).toThrowErrorMatchingSnapshot();
      });
    `;
    const v3 = auditTestFileContent("dirty3.test.ts", dirtySample3);
    expect(v3.length).toBe(1);
    expect(v3[0].pattern).toBe("toThrowErrorMatchingSnapshot");
  });

  it("zero .snap files or snapshot directories exist anywhere in the repository", () => {
    const rootDir = path.resolve(__dirname, "../../");
    const snapFiles = findFilesRecursive(rootDir, (file) => file.endsWith(".snap"));

    expect(
      snapFiles,
      `Forbidden snapshot files detected (${snapFiles.length}). Criterion S11.4 forbids snapshot-only testing.`,
    ).toEqual([]);
  });

  it("zero snapshot matchers are used across all test files in src/", () => {
    const srcDir = path.resolve(__dirname, "../");
    const testFiles = findFilesRecursive(srcDir, (file) => {
      const isTest = /\.(test|spec)\.(ts|tsx)$/.test(file);
      const isThisAuditFile = file.includes("snapshotAudit.test.ts");
      return isTest && !isThisAuditFile;
    });

    expect(testFiles.length).toBeGreaterThanOrEqual(12);

    const allViolations: SnapshotViolation[] = [];
    for (const file of testFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const violations = auditTestFileContent(file, content);
      allViolations.push(...violations);
    }

    expect(
      allViolations,
      `Forbidden snapshot matcher calls detected in test suite: ${JSON.stringify(allViolations, null, 2)}`,
    ).toEqual([]);
  });
});
