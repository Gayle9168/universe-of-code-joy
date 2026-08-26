import { describe, expect, it } from "vitest";
import { tokenizeLine } from "@/lib/syntaxHighlight";

const kindOf = (line: string, text: string): string | undefined =>
  tokenizeLine(line).find((t) => t.text === text)?.kind;

describe("tokenizeLine", () => {
  it("keeps the original text intact", () => {
    const line = "  const mid = Math.floor((lo + hi) / 2);";
    expect(
      tokenizeLine(line)
        .map((t) => t.text)
        .join(""),
    ).toBe(line);
  });

  it("colours keywords, numbers and call names", () => {
    const line = "const mid = Math.floor((lo + hi) / 2);";
    expect(kindOf(line, "const")).toBe("keyword");
    expect(kindOf(line, "floor")).toBe("fn");
    expect(kindOf(line, "2")).toBe("number");
    expect(kindOf(line, "mid")).toBe("plain");
  });

  it("treats trailing comments as one comment token", () => {
    const tokens = tokenizeLine("lo = mid + 1; // halve the window");
    expect(tokens[tokens.length - 1]).toEqual({
      text: "// halve the window",
      kind: "comment",
    });
  });

  it("handles python comments and defs", () => {
    expect(kindOf("def binary_search(a, target):", "def")).toBe("keyword");
    expect(tokenizeLine("# nothing left").map((t) => t.kind)).toEqual(["comment"]);
  });

  it("reads quoted strings as one token", () => {
    expect(kindOf('return "not found";', '"not found"')).toBe("string");
  });

  it("returns nothing for an empty line", () => {
    expect(tokenizeLine("")).toEqual([]);
  });
});
