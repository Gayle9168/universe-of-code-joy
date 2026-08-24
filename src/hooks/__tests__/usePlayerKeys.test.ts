import { describe, expect, it, vi } from "vitest";
import { handlePlayerKeyDown, PLAYER_SPEEDS } from "../usePlayerKeys";
import { createPlayerStore } from "@/stores/playerStore";

describe("Criterion S7.3 — Full keyboard playback control", () => {
  it("routes basic step, jump, play/pause, reset, and loop keyboard shortcuts", () => {
    const store = createPlayerStore();
    store.getState().load("binary-search");
    const run = store.getState().run;
    expect(run).toBeDefined();
    expect(run!.steps.length).toBeGreaterThan(5);

    const setSpeed = vi.fn();
    const getPlayer = () => store.getState();

    // Initial state: index 0, isPlaying false, loop false
    expect(getPlayer().index).toBe(0);

    // ArrowRight steps forward (+1)
    const handled = handlePlayerKeyDown("ArrowRight", false, getPlayer(), setSpeed);
    expect(handled).toBe(true);
    expect(getPlayer().index).toBe(1);

    // ArrowRight again (+2)
    handlePlayerKeyDown("ArrowRight", false, getPlayer(), setSpeed);
    expect(getPlayer().index).toBe(2);

    // ArrowLeft steps backward (-1)
    handlePlayerKeyDown("ArrowLeft", false, getPlayer(), setSpeed);
    expect(getPlayer().index).toBe(1);

    // End jumps to last step
    handlePlayerKeyDown("End", false, getPlayer(), setSpeed);
    expect(getPlayer().index).toBe(run!.steps.length - 1);

    // Home jumps to first step
    handlePlayerKeyDown("Home", false, getPlayer(), setSpeed);
    expect(getPlayer().index).toBe(0);

    // Space toggles play/pause
    expect(getPlayer().isPlaying).toBe(false);
    handlePlayerKeyDown(" ", false, getPlayer(), setSpeed);
    expect(getPlayer().isPlaying).toBe(true);
    handlePlayerKeyDown("Spacebar", false, getPlayer(), setSpeed);
    expect(getPlayer().isPlaying).toBe(false);

    // L toggles loop
    expect(getPlayer().loop).toBe(false);
    handlePlayerKeyDown("l", false, getPlayer(), setSpeed);
    expect(getPlayer().loop).toBe(true);
    handlePlayerKeyDown("L", false, getPlayer(), setSpeed);
    expect(getPlayer().loop).toBe(false);

    // R resets to index 0 and pauses
    handlePlayerKeyDown("End", false, getPlayer(), setSpeed);
    handlePlayerKeyDown("r", false, getPlayer(), setSpeed);
    expect(getPlayer().index).toBe(0);
    expect(getPlayer().isPlaying).toBe(false);
  });

  it("routes Shift+Arrow keys to milestone stepping", () => {
    const store = createPlayerStore();
    store.getState().load("binary-search");
    const run = store.getState().run;
    const setSpeed = vi.fn();
    const getPlayer = () => store.getState();

    // Find first milestone index > 0
    const firstMilestone = run!.steps.findIndex((s, i) => i > 0 && s.isMilestone);
    if (firstMilestone !== -1) {
      handlePlayerKeyDown("ArrowRight", true, getPlayer(), setSpeed);
      expect(getPlayer().index).toBe(firstMilestone);

      // Shift + ArrowLeft back to previous milestone (or index 0)
      handlePlayerKeyDown("ArrowLeft", true, getPlayer(), setSpeed);
      expect(getPlayer().index).toBeLessThan(firstMilestone);
    }
  });

  it("maps keys 1-6 to the full spectrum of playback speeds", () => {
    const store = createPlayerStore();
    const getPlayer = () => store.getState();
    const setSpeed = vi.fn();

    for (let i = 0; i < PLAYER_SPEEDS.length; i++) {
      const key = String(i + 1);
      const handled = handlePlayerKeyDown(key, false, getPlayer(), setSpeed);
      expect(handled).toBe(true);
      expect(setSpeed).toHaveBeenLastCalledWith(PLAYER_SPEEDS[i]);
    }

    // Unmapped key returns false
    const unhandled = handlePlayerKeyDown("z", false, getPlayer(), setSpeed);
    expect(unhandled).toBe(false);
  });
});
