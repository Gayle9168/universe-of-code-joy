import type { Path } from "./types";

export const paths: Path[] = [
  {
    slug: "interview-prep",
    title: "Interview Prep",
    subtitle: "Ace coding interviews with confidence. Master patterns. Solve under pressure.",
    weeks: 6,
    audience: "Engineers with 2-6 weeks until an interview who need high-yield DSA coverage fast.",
    outcomes: [
      "Master interview patterns",
      "Solve real interview questions",
      "Build speed and accuracy",
      "Explain time/space tradeoffs out loud while coding",
    ],
    modules: [
      {
        title: "Week 1-2: Array & String Patterns",
        itemSlugs: ["two-pointers", "sliding-window", "binary-search", "linear-search"],
      },
      {
        title: "Week 3: Sorting Toolbox",
        itemSlugs: ["merge-sort", "quicksort", "heap-sort", "counting-sort"],
      },
      {
        title: "Week 4: Linked Lists, Stacks & Queues",
        itemSlugs: ["linked-list-reversal", "stack-basics", "queue-basics"],
      },
      {
        title: "Week 5: Trees & Heaps",
        itemSlugs: ["bst-insert", "bst-traversals", "level-order", "heap-insert"],
      },
      {
        title: "Week 6: Graphs & Hashing Under Pressure",
        itemSlugs: ["hash-table-chaining", "bfs", "dfs", "union-find"],
      },
    ],
  },
  {
    slug: "data-structures",
    title: "Data Structures",
    subtitle: "Build strong fundamentals in data structures.",
    weeks: 8,
    audience: "Learners who want a rigorous, ground-up foundation in the core data structures.",
    outcomes: [
      "Learn core data structures",
      "Visualize how they work",
      "Solve problems with confidence",
      "Understand the trade-offs between structures",
    ],
    modules: [
      {
        title: "Module 1: Arrays & Searching",
        itemSlugs: ["linear-search", "binary-search"],
      },
      {
        title: "Module 2: Elementary Sorting",
        itemSlugs: ["bubble-sort", "insertion-sort", "selection-sort"],
      },
      {
        title: "Module 3: Stacks & Queues",
        itemSlugs: ["stack-basics", "queue-basics"],
      },
      {
        title: "Module 4: Linked Lists",
        itemSlugs: ["linked-list-reversal"],
      },
      {
        title: "Module 5: Trees",
        itemSlugs: ["bst-insert", "bst-traversals", "level-order"],
      },
      {
        title: "Module 6: Heaps & Priority Queues",
        itemSlugs: ["heap-insert", "heap-sort"],
      },
      {
        title: "Module 7: Hashing",
        itemSlugs: ["hash-table-chaining", "counting-sort"],
      },
      {
        title: "Module 8: Graph Basics",
        itemSlugs: ["bfs", "dfs"],
      },
    ],
  },
  {
    slug: "competitive-programming",
    title: "Competitive Programming",
    subtitle: "Level up with advanced algorithms and problem solving.",
    weeks: 10,
    audience: "Contest-minded learners who already know the basics and want advanced DSA depth.",
    outcomes: [
      "Advanced algorithm design",
      "Contest strategies & tricks",
      "Performance tuning",
      "Recognize the right algorithm under a strict time limit",
    ],
    modules: [
      {
        title: "Week 1-2: Fast Array Techniques",
        itemSlugs: ["two-pointers", "sliding-window"],
      },
      {
        title: "Week 3: Divide & Conquer",
        itemSlugs: ["merge-sort", "quicksort"],
      },
      {
        title: "Week 4: Graph Traversal at Speed",
        itemSlugs: ["bfs", "dfs"],
      },
      {
        title: "Week 5: Shortest Paths",
        itemSlugs: ["heap-insert", "dijkstra"],
      },
      {
        title: "Week 6: Ordering & Connectivity",
        itemSlugs: ["topological-sort", "union-find"],
      },
      {
        title: "Week 7: Hashing Tricks",
        itemSlugs: ["hash-table-chaining"],
      },
      {
        title: "Week 8: Heap-Driven Optimization",
        itemSlugs: ["heap-sort", "counting-sort"],
      },
      {
        title: "Week 9-10: Dynamic Programming",
        itemSlugs: ["dp-1d", "dp-2d"],
      },
    ],
  },
];

export function getPath(slug: string): Path | undefined {
  return paths.find((p) => p.slug === slug);
}

export function getPaths(): Path[] {
  return paths;
}

export async function fetchPath(slug: string): Promise<Path | null> {
  return getPath(slug) ?? null;
}

export async function fetchPaths(): Promise<Path[]> {
  return getPaths();
}
