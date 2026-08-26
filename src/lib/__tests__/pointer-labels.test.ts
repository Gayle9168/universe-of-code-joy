import { describe, expect, it } from "vitest";
import { pointerLabel } from "@/lib/pointerLabels";

describe("pointerLabel", () => {
  it("spells the binary-search pointers the way the lesson does", () => {
    expect(pointerLabel("lo")).toBe("low");
    expect(pointerLabel("hi")).toBe("high");
    expect(pointerLabel("mid")).toBe("mid");
  });

  it("is case-insensitive", () => {
    expect(pointerLabel("LO")).toBe("low");
  });

  it("passes unknown names through untouched", () => {
    expect(pointerLabel("slow")).toBe("slow");
    expect(pointerLabel("k")).toBe("k");
  });
});
