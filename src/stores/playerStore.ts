import * as React from "react";
import { useStore, type StoreApi } from "zustand";
import { createStore } from "zustand/vanilla";
import { resolveModule } from "@/engine/registry";
import { paddedCounters } from "@/lib/counters";
import type { AlgorithmRun, Step } from "@/engine/types";
import { usePrefsStore } from "@/stores/prefsStore";

export interface PhaseSegment {
  phase: string;
  from: number;
  to: number;
}

export interface PlayerState {
  slug: string | null;
  run: AlgorithmRun | null;
  index: number;
  isPlaying: boolean;
  loop: boolean;
  error: string | null;
  rawInputs: Record<string, string>;

  load: (slug: string, rawInputs?: Record<string, string>) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (i: number) => void;
  first: () => void;
  last: () => void;
  toggleLoop: () => void;
  reset: () => void;
  stepToNextMilestone: () => void;
  stepToPrevMilestone: () => void;
  stepToNextPhase: () => void;
}

export type PlayerStoreApi = StoreApi<PlayerState>;

function clampIndex(run: AlgorithmRun | null, i: number): number {
  if (!run || run.steps.length === 0) return 0;
  const max = run.steps.length - 1;
  if (i < 0) return 0;
  if (i > max) return max;
  return Math.floor(i);
}

function defaultsFor(slug: string): Record<string, string> {
  const mod = resolveModule(slug);
  if (!mod) return {};
  const raw: Record<string, string> = {};
  for (const field of mod.inputs) {
    raw[field.name] = String(field.default);
  }
  return raw;
}

/** Creates an independent player instance. Used for compare mode. */
export function createPlayerStore(): PlayerStoreApi {
  return createStore<PlayerState>()((set, get) => ({
    slug: null,
    run: null,
    index: 0,
    isPlaying: false,
    loop: false,
    error: null,
    rawInputs: {},

    load: (slug, rawInputs) => {
      const mod = resolveModule(slug);
      if (!mod) {
        set({ error: `No visualizer is available for "${slug}" yet.` });
        return;
      }
      const raw = { ...defaultsFor(slug), ...(rawInputs ?? {}) };
      const validation = mod.validate(raw);
      if (!validation.ok) {
        // Keep the previous run intact so the canvas does not blank out.
        set({ error: validation.error, rawInputs: raw, isPlaying: false });
        return;
      }
      const run = mod.run(validation.parsed);
      set({ slug, run, rawInputs: raw, index: 0, isPlaying: false, error: null });
    },

    play: () => {
      const { run, index } = get();
      if (!run || run.steps.length === 0) return;
      if (index >= run.steps.length - 1) {
        set({ index: 0, isPlaying: true });
      } else {
        set({ isPlaying: true });
      }
    },
    pause: () => set({ isPlaying: false }),
    toggle: () => (get().isPlaying ? get().pause() : get().play()),

    next: () => {
      const { run, index, loop } = get();
      if (!run || run.steps.length === 0) return;
      const last = run.steps.length - 1;
      if (index >= last) {
        if (loop) set({ index: 0 });
        else set({ isPlaying: false });
        return;
      }
      set({ index: index + 1 });
    },
    prev: () => set((s) => ({ index: clampIndex(s.run, s.index - 1) })),
    seek: (i) => set((s) => ({ index: clampIndex(s.run, i) })),
    first: () => set({ index: 0 }),
    last: () => set((s) => ({ index: clampIndex(s.run, Number.MAX_SAFE_INTEGER) })),
    toggleLoop: () => set((s) => ({ loop: !s.loop })),
    reset: () => set({ index: 0, isPlaying: false }),

    stepToNextMilestone: () => {
      const { run, index } = get();
      if (!run) return;
      const found = run.steps.findIndex((s, i) => i > index && s.isMilestone === true);
      set({ index: found === -1 ? clampIndex(run, run.steps.length - 1) : found });
    },
    stepToPrevMilestone: () => {
      const { run, index } = get();
      if (!run) return;
      let target = 0;
      for (let i = index - 1; i >= 0; i -= 1) {
        if (run.steps[i]?.isMilestone === true) {
          target = i;
          break;
        }
      }
      set({ index: target });
    },
    stepToNextPhase: () => {
      const { run, index } = get();
      if (!run) return;
      const current = run.steps[index]?.phase;
      const found = run.steps.findIndex((s, i) => i > index && s.phase !== current);
      set({ index: found === -1 ? clampIndex(run, run.steps.length - 1) : found });
    },
  }));
}

/** The app-wide default instance. Every existing consumer keeps using this. */
export const defaultPlayerStore = createPlayerStore();

const PlayerStoreContext = React.createContext<PlayerStoreApi | null>(null);

export interface PlayerStoreProviderProps {
  store: PlayerStoreApi;
  children: React.ReactNode;
}

/** Scopes every player hook below it to `store`. */
export function PlayerStoreProvider({
  store,
  children,
}: PlayerStoreProviderProps): React.ReactElement {
  return React.createElement(PlayerStoreContext.Provider, { value: store }, children);
}

/** The nearest provided instance, falling back to the default one. */
export function usePlayerStoreApi(): PlayerStoreApi {
  return React.useContext(PlayerStoreContext) ?? defaultPlayerStore;
}

function usePlayerStoreBase<T>(selector: (state: PlayerState) => T): T {
  return useStore(usePlayerStoreApi(), selector);
}

/**
 * Context-aware store hook. Outside a PlayerStoreProvider it reads the default
 * instance, so existing call sites (including `usePlayerStore.getState()`)
 * behave exactly as before.
 */
export const usePlayerStore = Object.assign(usePlayerStoreBase, {
  getState: defaultPlayerStore.getState,
  setState: defaultPlayerStore.setState,
  subscribe: defaultPlayerStore.subscribe,
});

/* ---------------- derived selectors ---------------- */

export function useCurrentStep(): Step | null {
  return usePlayerStore((s) => (s.run ? (s.run.steps[s.index] ?? null) : null));
}

export function useProgressPercent(): number {
  return usePlayerStore((s) => {
    const total = s.run?.steps.length ?? 0;
    if (total <= 1) return total === 1 ? 100 : 0;
    return (s.index / (total - 1)) * 100;
  });
}

/**
 * Counters for the current step, padded with every counter the run will ever
 * show, so the strip keeps one width for the whole run. See `paddedCounters`.
 */
export function useCounters(): Record<string, number> {
  const run = usePlayerStore((s) => s.run);
  const step = useCurrentStep();
  return paddedCounters(run, step);
}

export function useCodeLine(): number | null {
  return usePlayerStore((s) => (s.run ? (s.run.steps[s.index]?.codeLine ?? null) : null));
}

export function useCanStepForward(): boolean {
  return usePlayerStore((s) => !!s.run && s.index < s.run.steps.length - 1);
}

export function useCanStepBack(): boolean {
  return usePlayerStore((s) => !!s.run && s.index > 0);
}

export function usePhaseSegments(): PhaseSegment[] {
  const run = usePlayerStore((s) => s.run);
  if (!run || run.steps.length === 0) return [];
  const segments: PhaseSegment[] = [];
  for (let i = 0; i < run.steps.length; i += 1) {
    const phase = run.steps[i]!.phase;
    const last = segments[segments.length - 1];
    if (last && last.phase === phase && last.to === i - 1) {
      last.to = i;
    } else {
      segments.push({ phase, from: i, to: i });
    }
  }
  return segments;
}

/** Convenience: playback speed lives in prefsStore, never here. */
export function usePlaybackSpeed(): number {
  return usePrefsStore((s) => s.playbackSpeed);
}
