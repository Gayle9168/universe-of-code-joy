import { describe, expect, it } from "vitest";
import { algorithms, algorithmsByCategory, CATEGORY_META, getAlgorithm } from "../algorithms";
import { getAchievement, achievements } from "../achievements";
import { getPath, paths } from "../paths";
import { getQuest, quests } from "../quests";

describe("data layer accessors and helpers", () => {
  it("algorithmsByCategory groups all algorithms correctly", () => {
    const grouped = algorithmsByCategory();
    expect(Object.keys(grouped)).toEqual(Object.keys(CATEGORY_META));
    const count = Object.values(grouped).reduce((sum, list) => sum + list.length, 0);
    expect(count).toBe(algorithms.length);
  });

  it("getAlgorithm returns algorithm or undefined", () => {
    expect(getAlgorithm("binary-search")).toBeDefined();
    expect(getAlgorithm("non-existent-algo")).toBeUndefined();
  });

  it("getAchievement returns achievement or undefined", () => {
    expect(getAchievement(achievements[0]!.id)).toBeDefined();
    expect(getAchievement("unknown-achievement-id")).toBeUndefined();
  });

  it("getPath returns path or undefined", () => {
    expect(getPath(paths[0]!.slug)).toBeDefined();
    expect(getPath("unknown-path-slug")).toBeUndefined();
  });

  it("getQuest returns quest or undefined", () => {
    expect(getQuest(quests[0]!.id)).toBeDefined();
    expect(getQuest("unknown-quest-id")).toBeUndefined();
  });
});
