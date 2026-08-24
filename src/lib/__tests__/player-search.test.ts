import { describe, expect, it } from "vitest";
import { mergePlayerSearch, type AlgorithmSearch } from "@/lib/player-search";

/**
 * These guard one bug: the debounced URL write replacing the search object
 * instead of merging into it. That dropped `problem`, which made a question
 * visualizer silently reload itself as its parent algorithm ~300ms after opening.
 */
describe("mergePlayerSearch", () => {
  it("keeps ?problem= alive across a step write", () => {
    const prev: AlgorithmSearch = { problem: "search-insert-position" };
    const next = mergePlayerSearch(prev, "encoded", 3);
    expect(next.problem).toBe("search-insert-position");
    expect(next.input).toBe("encoded");
    expect(next.step).toBe(3);
  });

  it("keeps ?problem= alive across repeated writes", () => {
    // The effect fires on every step change, so surviving once is not enough.
    let s: AlgorithmSearch = { problem: "koko-eating-bananas" };
    for (let i = 0; i < 5; i += 1) s = mergePlayerSearch(s, `input-${i}`, i);
    expect(s.problem).toBe("koko-eating-bananas");
    expect(s.step).toBe(4);
  });

  it("does not invent a problem when there was none", () => {
    const next = mergePlayerSearch({}, "encoded", 0);
    expect(next.problem).toBeUndefined();
  });

  it("overwrites input and step rather than accumulating them", () => {
    const next = mergePlayerSearch({ input: "old", step: 9 }, "new", 1);
    expect(next.input).toBe("new");
    expect(next.step).toBe(1);
  });
});
