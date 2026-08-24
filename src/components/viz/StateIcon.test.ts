import { describe, expect, it } from "vitest";
import { StateIcon } from "./StateIcon";
import { STATE_ICON_NAMES, STATE_LABELS } from "./tokens";
import type { CellState } from "@/engine/types";

describe("Criterion S7.2 — Non-colour signals for viz states", () => {
  it("explicitly verifies that current (active), visited, and locked (sorted) carry distinct non-colour icon signals", () => {
    expect(STATE_ICON_NAMES.active).toBe("Play"); // current active working element
    expect(STATE_ICON_NAMES.visited).toBe("Check"); // processed visited element
    expect(STATE_ICON_NAMES.sorted).toBe("Lock"); // locked in final sorted position

    expect(STATE_LABELS.active).toContain("Play symbol");
    expect(STATE_LABELS.visited).toContain("Check symbol");
    expect(STATE_LABELS.sorted).toContain("Lock symbol");
  });

  it("ensures every non-idle state across the entire visualization engine has a dedicated icon mapping and descriptive accessible label", () => {
    const allStates: CellState[] = [
      "idle",
      "active",
      "visited",
      "frontier",
      "found",
      "excluded",
      "compare",
      "sorted",
    ];

    for (const s of allStates) {
      if (s === "idle") {
        expect(STATE_ICON_NAMES[s]).toBeNull();
        expect(STATE_LABELS[s]).toBe("Idle");
      } else {
        expect(typeof STATE_ICON_NAMES[s]).toBe("string");
        expect(STATE_ICON_NAMES[s]!.length).toBeGreaterThan(0);
        expect(STATE_LABELS[s]).toBeDefined();
        expect(STATE_LABELS[s]).not.toBe("");
      }
    }
  });

  it("exports StateIcon component complying with pure presentation requirements (no store dependencies)", () => {
    expect(typeof StateIcon).toBe("function");
    const idleResult = StateIcon({ state: "idle" });
    expect(idleResult).toBeNull();
  });
});
