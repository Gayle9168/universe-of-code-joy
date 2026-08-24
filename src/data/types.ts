export type Category =
  | "arrays"
  | "strings"
  | "linked-lists"
  | "stacks-queues"
  | "trees"
  | "heaps"
  | "hashing"
  | "graphs"
  | "sorting"
  | "searching"
  | "greedy"
  | "dp"
  | "backtracking"
  | "bit-manipulation"
  | "math";

export type Difficulty = "easy" | "medium" | "hard";

export type VizKind =
  | "array"
  | "tree"
  | "graph"
  | "grid"
  | "table"
  | "linked-list"
  | "stack"
  | "queue";

export interface Algorithm {
  slug: string;
  name: string;
  category: Category;
  difficulty: Difficulty;
  vizKind: VizKind;
  oneLiner: string;
  summary: string;
  timeBest: string;
  timeAvg: string;
  timeWorst: string;
  space: string;
  prerequisites: string[];
  tags: string[];
  realWorldUses: string[];
  commonMistakes: string[];
  estMinutes: number;
  xp: number;
}

export interface LessonSection {
  id: string;
  heading: string;
  markdown: string;
  visualStep?: number;
}

export interface QuizQuestion {
  id: string;
  kind: "mcq" | "predict-step" | "order-steps" | "true-false";
  prompt: string;
  options: string[];
  answerIndex: number | number[];
  explanation: string;
}

export interface Lesson {
  slug: string;
  algorithmSlug: string;
  title: string;
  estMinutes: number;
  xp: number;
  sections: LessonSection[];
  quiz: QuizQuestion[];
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemTest {
  id: string;
  input: unknown[];
  expected: unknown;
  hidden: boolean;
}

/**
 * How one function argument is built from a test's `input` array, or how the
 * return value is converted back into something comparable with `expected`.
 *
 * - `raw` — pass through untouched (numbers, strings, arrays, grids)
 * - `list` — `number[]` to a `ListNode` chain
 * - `list-cycle` — consumes two input slots, `values` and a `pos` index, and
 *   links the tail back to `pos` (`-1` leaves the list acyclic)
 * - `tree` — LeetCode level-order array to a `TreeNode`
 * - `tree-node` — a node value to the matching node inside the tree built by the
 *   preceding `tree` argument
 * - `tree-val` — return only: a returned `TreeNode` to its `.val`
 */
export type IoCodec = "raw" | "list" | "list-cycle" | "tree" | "tree-node" | "tree-val";

export interface ProblemIo {
  /** One entry per function parameter, not per input slot — `list-cycle` eats two. */
  args: IoCodec[];
  returns: IoCodec;
}

export interface Problem {
  slug: string;
  algorithmSlug: string;
  title: string;
  difficulty: Difficulty;
  statementMarkdown: string;
  constraints: string[];
  examples: ProblemExample[];
  starterCode: Record<"js" | "ts" | "py", string>;
  tests: ProblemTest[];
  hints: string[];
  xp: number;
  /**
   * How the runner converts flat test JSON into the argument shapes the starter
   * code declares. Required only for problems whose signature names `TreeNode`
   * or `ListNode`; absent means every input is applied as-is.
   */
  io?: ProblemIo;
  /** Card-length summary for browse surfaces. Falls back to the statement's first sentence. */
  oneLiner?: string;
  /** Expected solve time in minutes. Falls back to an xp-derived estimate. */
  estMinutes?: number;
}

export interface PathModule {
  title: string;
  itemSlugs: string[];
}

export interface Path {
  slug: string;
  title: string;
  subtitle: string;
  weeks: number;
  audience: string;
  outcomes: string[];
  modules: PathModule[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  xp: number;
  criteria: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  kind: "daily" | "weekly";
  target: number;
  xp: number;
  icon: string;
}

export interface LegalSubSection {
  id: string;
  title: string;
  contentMarkdown: string;
}

export interface LegalSection {
  id: string;
  title: string;
  summary?: string;
  contentMarkdown: string;
  subsections?: LegalSubSection[];
}

export interface LegalDocument {
  id: "privacy" | "terms";
  title: string;
  subtitle: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  summaryMarkdown: string;
  sections: LegalSection[];
}
