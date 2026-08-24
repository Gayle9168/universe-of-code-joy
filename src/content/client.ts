import type {
  Achievement,
  Algorithm,
  Category,
  Difficulty,
  Lesson,
  Path,
  Problem,
  Quest,
  LegalDocument,
} from "./types";
import type { DemoLearner } from "./demo-learner";
import type { MarketingClaim } from "./types";
import type { AppNavItem, SiteNavItem, SettingsNavItem } from "./nav";
import {
  getAlgorithm,
  getAlgorithms,
  getAlgorithmsByCategory,
  getAlgorithmsByDifficulty,
  getCategoryMeta,
} from "./algorithms";
import { getLesson, getLessons, getLessonByAlgorithm, getLessonsByAlgorithm } from "./lessons";
import {
  getProblem,
  getProblems,
  getProblemsByAlgorithm,
  getProblemsByDifficulty,
} from "./problems";
import { getPath, getPaths } from "./paths";
import { getQuest, getQuests, getQuestsByKind } from "./quests";
import { getAchievement, getAchievements, getAchievementsByTier } from "./achievements";
import { getDemoLearner } from "./demo-learner";
import { getMarketingClaim, getMarketingClaims } from "./marketing-claims";
import { getAppNav, getSiteNav, getSettingsNav } from "./nav";
import { getLegalDocument, getLegalDocuments } from "./legal";

/**
 * Asynchronous content interface for Seam 1 (Content Accessors).
 * Allows plugging in static bundles now and server-authoritative backends later.
 */
export interface ContentClient {
  getAlgorithm(slug: string): Promise<Algorithm | null>;
  getAlgorithms(): Promise<Algorithm[]>;
  getAlgorithmsByCategory(): Promise<Record<Category, Algorithm[]>>;
  getCategoryMeta(): Promise<
    Record<Category, { label: string; icon: string; description: string }>
  >;
  getAlgorithmsByDifficulty(difficulty: Difficulty): Promise<Algorithm[]>;

  getLesson(slug: string): Promise<Lesson | null>;
  getLessons(): Promise<Lesson[]>;
  getLessonByAlgorithm(algorithmSlug: string): Promise<Lesson | null>;
  getLessonsByAlgorithm(algorithmSlug: string): Promise<Lesson[]>;

  getProblem(slug: string): Promise<Problem | null>;
  getProblems(): Promise<Problem[]>;
  getProblemsByAlgorithm(algorithmSlug: string): Promise<Problem[]>;
  getProblemsByDifficulty(difficulty: Difficulty): Promise<Problem[]>;

  getPath(slug: string): Promise<Path | null>;
  getPaths(): Promise<Path[]>;

  getQuest(id: string): Promise<Quest | null>;
  getQuests(): Promise<Quest[]>;
  getQuestsByKind(kind: Quest["kind"]): Promise<Quest[]>;

  getAchievement(id: string): Promise<Achievement | null>;
  getAchievements(): Promise<Achievement[]>;
  getAchievementsByTier(tier: Achievement["tier"]): Promise<Achievement[]>;

  getDemoLearner(): Promise<DemoLearner>;

  getMarketingClaim<T extends MarketingClaim = MarketingClaim>(id: string): Promise<T | null>;
  getMarketingClaims(): Promise<MarketingClaim[]>;

  getAppNav(): Promise<AppNavItem[]>;
  getSiteNav(): Promise<SiteNavItem[]>;
  getSettingsNav(): Promise<SettingsNavItem[]>;

  getLegalDocument(id: "privacy" | "terms"): Promise<LegalDocument | null>;
  getLegalDocuments(): Promise<LegalDocument[]>;
}

/**
 * Default Static content client implementation.
 * Returns defensively copied arrays and structures to prevent in-place mutation.
 */
export class StaticContentClient implements ContentClient {
  async getAlgorithm(slug: string): Promise<Algorithm | null> {
    const algo = getAlgorithm(slug);
    return algo ? { ...algo } : null;
  }
  async getAlgorithms(): Promise<Algorithm[]> {
    return getAlgorithms().map((a) => ({ ...a }));
  }
  async getAlgorithmsByCategory(): Promise<Record<Category, Algorithm[]>> {
    const raw = getAlgorithmsByCategory();
    const result = {} as Record<Category, Algorithm[]>;
    for (const [k, v] of Object.entries(raw) as [Category, Algorithm[]][]) {
      result[k] = v.map((a) => ({ ...a }));
    }
    return result;
  }
  async getCategoryMeta(): Promise<
    Record<Category, { label: string; icon: string; description: string }>
  > {
    return { ...getCategoryMeta() };
  }
  async getAlgorithmsByDifficulty(difficulty: Difficulty): Promise<Algorithm[]> {
    return getAlgorithmsByDifficulty(difficulty).map((a) => ({ ...a }));
  }

  async getLesson(slug: string): Promise<Lesson | null> {
    const lesson = getLesson(slug);
    return lesson ? { ...lesson } : null;
  }
  async getLessons(): Promise<Lesson[]> {
    return getLessons().map((l) => ({ ...l }));
  }
  async getLessonByAlgorithm(algorithmSlug: string): Promise<Lesson | null> {
    const lesson = getLessonByAlgorithm(algorithmSlug);
    return lesson ? { ...lesson } : null;
  }
  async getLessonsByAlgorithm(algorithmSlug: string): Promise<Lesson[]> {
    return getLessonsByAlgorithm(algorithmSlug).map((l) => ({ ...l }));
  }

  async getProblem(slug: string): Promise<Problem | null> {
    const problem = getProblem(slug);
    return problem ? { ...problem } : null;
  }
  async getProblems(): Promise<Problem[]> {
    return getProblems().map((p) => ({ ...p }));
  }
  async getProblemsByAlgorithm(algorithmSlug: string): Promise<Problem[]> {
    return getProblemsByAlgorithm(algorithmSlug).map((p) => ({ ...p }));
  }
  async getProblemsByDifficulty(difficulty: Difficulty): Promise<Problem[]> {
    return getProblemsByDifficulty(difficulty).map((p) => ({ ...p }));
  }

  async getPath(slug: string): Promise<Path | null> {
    const path = getPath(slug);
    return path ? { ...path } : null;
  }
  async getPaths(): Promise<Path[]> {
    return getPaths().map((p) => ({ ...p }));
  }

  async getQuest(id: string): Promise<Quest | null> {
    const quest = getQuest(id);
    return quest ? { ...quest } : null;
  }
  async getQuests(): Promise<Quest[]> {
    return getQuests().map((q) => ({ ...q }));
  }
  async getQuestsByKind(kind: Quest["kind"]): Promise<Quest[]> {
    return getQuestsByKind(kind).map((q) => ({ ...q }));
  }

  async getAchievement(id: string): Promise<Achievement | null> {
    const ach = getAchievement(id);
    return ach ? { ...ach } : null;
  }
  async getAchievements(): Promise<Achievement[]> {
    return getAchievements().map((a) => ({ ...a }));
  }
  async getAchievementsByTier(tier: Achievement["tier"]): Promise<Achievement[]> {
    return getAchievementsByTier(tier).map((a) => ({ ...a }));
  }

  async getDemoLearner(): Promise<DemoLearner> {
    const learner = getDemoLearner();
    return { ...learner };
  }

  async getMarketingClaim<T extends MarketingClaim = MarketingClaim>(
    id: string,
  ): Promise<T | null> {
    try {
      const claim = getMarketingClaim<T>(id);
      return claim ? ({ ...claim } as T) : null;
    } catch {
      return null;
    }
  }
  async getMarketingClaims(): Promise<MarketingClaim[]> {
    return getMarketingClaims().map((c) => ({ ...c }));
  }

  async getAppNav(): Promise<AppNavItem[]> {
    return getAppNav().map((n) => ({ ...n }));
  }
  async getSiteNav(): Promise<SiteNavItem[]> {
    return getSiteNav().map((n) => ({ ...n }));
  }
  async getSettingsNav(): Promise<SettingsNavItem[]> {
    return getSettingsNav().map((n) => ({ ...n }));
  }

  async getLegalDocument(id: "privacy" | "terms"): Promise<LegalDocument | null> {
    try {
      const doc = getLegalDocument(id);
      return {
        ...doc,
        sections: doc.sections.map((s) => ({
          ...s,
          subsections: s.subsections ? s.subsections.map((sub) => ({ ...sub })) : undefined,
        })),
      };
    } catch {
      return null;
    }
  }
  async getLegalDocuments(): Promise<LegalDocument[]> {
    return getLegalDocuments().map((doc) => ({
      ...doc,
      sections: doc.sections.map((s) => ({
        ...s,
        subsections: s.subsections ? s.subsections.map((sub) => ({ ...sub })) : undefined,
      })),
    }));
  }
}

let activeContentClient: ContentClient = new StaticContentClient();

/**
 * Get the currently registered ContentClient (Seam 1 adapter).
 */
export function getContentClient(): ContentClient {
  return activeContentClient;
}

/**
 * Set or mock the active ContentClient (useful for testing or future backend swapping).
 */
export function setContentClient(client: ContentClient): void {
  activeContentClient = client;
}

/**
 * Reset the active ContentClient back to the default StaticContentClient.
 */
export function resetContentClient(): void {
  activeContentClient = new StaticContentClient();
}
