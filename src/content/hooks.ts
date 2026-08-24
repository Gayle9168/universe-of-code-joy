import * as React from "react";
import type {
  Achievement,
  Algorithm,
  Category,
  Difficulty,
  Lesson,
  MarketingClaim,
  Path,
  Problem,
  Quest,
} from "./types";
import type { DemoLearner } from "./demo-learner";
import type { ContentClient } from "./client";
import { getContentClient } from "./client";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Access the active ContentClient singleton in React components.
 */
export function useContentClient(): ContentClient {
  return getContentClient();
}

/**
 * React hook to fetch a single algorithm by slug asynchronously.
 */
export function useAlgorithm(slug: string): AsyncState<Algorithm> {
  const [state, setState] = React.useState<AsyncState<Algorithm>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getContentClient()
      .getAlgorithm(slug)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return state;
}

/**
 * React hook to fetch all algorithms asynchronously.
 */
export function useAlgorithms(): AsyncState<Algorithm[]> {
  const [state, setState] = React.useState<AsyncState<Algorithm[]>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getContentClient()
      .getAlgorithms()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

/**
 * React hook to fetch algorithms grouped by category asynchronously.
 */
export function useAlgorithmsByCategory(): AsyncState<Record<Category, Algorithm[]>> {
  const [state, setState] = React.useState<AsyncState<Record<Category, Algorithm[]>>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getContentClient()
      .getAlgorithmsByCategory()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

/**
 * React hook to fetch a single lesson by slug asynchronously.
 */
export function useLesson(slug: string): AsyncState<Lesson> {
  const [state, setState] = React.useState<AsyncState<Lesson>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getContentClient()
      .getLesson(slug)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return state;
}

/**
 * React hook to fetch all lessons asynchronously.
 */
export function useLessons(): AsyncState<Lesson[]> {
  const [state, setState] = React.useState<AsyncState<Lesson[]>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getContentClient()
      .getLessons()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

/**
 * React hook to fetch a problem by slug asynchronously.
 */
export function useProblem(slug: string): AsyncState<Problem> {
  const [state, setState] = React.useState<AsyncState<Problem>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getContentClient()
      .getProblem(slug)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return state;
}

/**
 * React hook to fetch all problems asynchronously.
 */
export function useProblems(difficulty?: Difficulty): AsyncState<Problem[]> {
  const [state, setState] = React.useState<AsyncState<Problem[]>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const promise = difficulty
      ? getContentClient().getProblemsByDifficulty(difficulty)
      : getContentClient().getProblems();
    promise
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [difficulty]);

  return state;
}

/**
 * React hook to fetch a learning path by slug asynchronously.
 */
export function usePath(slug: string): AsyncState<Path> {
  const [state, setState] = React.useState<AsyncState<Path>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getContentClient()
      .getPath(slug)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return state;
}

/**
 * React hook to fetch all learning paths asynchronously.
 */
export function usePaths(): AsyncState<Path[]> {
  const [state, setState] = React.useState<AsyncState<Path[]>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getContentClient()
      .getPaths()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

/**
 * React hook to fetch a quest by ID asynchronously.
 */
export function useQuest(id: string): AsyncState<Quest> {
  const [state, setState] = React.useState<AsyncState<Quest>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getContentClient()
      .getQuest(id)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [id]);

  return state;
}

/**
 * React hook to fetch all quests (optionally filtered by kind) asynchronously.
 */
export function useQuests(kind?: Quest["kind"]): AsyncState<Quest[]> {
  const [state, setState] = React.useState<AsyncState<Quest[]>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const promise = kind
      ? getContentClient().getQuestsByKind(kind)
      : getContentClient().getQuests();
    promise
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [kind]);

  return state;
}

/**
 * React hook to fetch an achievement by ID asynchronously.
 */
export function useAchievement(id: string): AsyncState<Achievement> {
  const [state, setState] = React.useState<AsyncState<Achievement>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getContentClient()
      .getAchievement(id)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [id]);

  return state;
}

/**
 * React hook to fetch all achievements (optionally filtered by tier) asynchronously.
 */
export function useAchievements(tier?: Achievement["tier"]): AsyncState<Achievement[]> {
  const [state, setState] = React.useState<AsyncState<Achievement[]>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const promise = tier
      ? getContentClient().getAchievementsByTier(tier)
      : getContentClient().getAchievements();
    promise
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [tier]);

  return state;
}

/**
 * React hook to fetch the demo learner profile asynchronously.
 */
export function useDemoLearner(): AsyncState<DemoLearner> {
  const [state, setState] = React.useState<AsyncState<DemoLearner>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getContentClient()
      .getDemoLearner()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

/**
 * React hook to fetch a marketing claim by ID asynchronously.
 */
export function useMarketingClaim<T extends MarketingClaim = MarketingClaim>(
  id: string,
): AsyncState<T> {
  const [state, setState] = React.useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    getContentClient()
      .getMarketingClaim<T>(id)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (active) setState({ data: null, loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [id]);

  return state;
}
