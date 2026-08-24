import { StepBuilder } from "@/engine/builder";
import { parseEdgeList } from "@/engine/algorithms/bfs";
import { layeredLayout } from "@/engine/layout";
import type {
  AlgorithmModule,
  AlgorithmRun,
  AuxPanel,
  CellState,
  CodeLineMap,
  EdgeState,
  GraphFrame,
  ValidationResult,
} from "@/engine/types";

/** Pseudocode -> listing line. The braced listings close the seen-guard before `next`. */
const CODE_MAP: CodeLineMap = {
  js: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 19],
  ts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 19],
};

const PSEUDOCODE: string[] = [
  "function dfs(graph, start)",
  "  seen <- empty set",
  "  order <- empty list",
  "  stack <- new Stack()",
  "  push start",
  "  while stack is not empty",
  "    node <- peek()",
  "    if node not in seen",
  "      add node to seen",
  "      append node to order",
  "    next <- first unseen neighbour of node",
  "    if next exists",
  "      push next",
  "    else",
  "      pop node",
  "  return order",
];

const CODE_BY_LANG: Record<"js" | "ts" | "py", string[]> = {
  js: [
    "function dfs(graph, start) {",
    "  const seen = new Set();",
    "  const order = [];",
    "  const stack = [];",
    "  stack.push(start);",
    "  while (stack.length > 0) {",
    "    const node = stack[stack.length - 1];",
    "    if (!seen.has(node)) {",
    "      seen.add(node);",
    "      order.push(node);",
    "    }",
    "    const next = (graph[node] ?? []).find((n) => !seen.has(n));",
    "    if (next !== undefined) {",
    "      stack.push(next);",
    "    } else {",
    "      stack.pop();",
    "    }",
    "  }",
    "  return order;",
    "}",
  ],
  ts: [
    "function dfs(graph: Record<string, string[]>, start: string): string[] {",
    "  const seen = new Set<string>();",
    "  const order: string[] = [];",
    "  const stack: string[] = [];",
    "  stack.push(start);",
    "  while (stack.length > 0) {",
    "    const node = stack[stack.length - 1]!;",
    "    if (!seen.has(node)) {",
    "      seen.add(node);",
    "      order.push(node);",
    "    }",
    "    const next = (graph[node] ?? []).find((n) => !seen.has(n));",
    "    if (next !== undefined) {",
    "      stack.push(next);",
    "    } else {",
    "      stack.pop();",
    "    }",
    "  }",
    "  return order;",
    "}",
  ],
  py: [
    "def dfs(graph, start):",
    "    seen = set()",
    "    order = []",
    "    stack = []",
    "    stack.append(start)",
    "    while stack:",
    "        node = stack[-1]",
    "        if node not in seen:",
    "            seen.add(node)",
    "            order.append(node)",
    "        nxt = next((n for n in graph.get(node, []) if n not in seen), None)",
    "        if nxt is not None:",
    "            stack.append(nxt)",
    "        else:",
    "            stack.pop()",
    "    return order",
  ],
};

function edgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

interface Graph {
  nodes: string[];
  edges: Array<{ from: string; to: string; weight?: number }>;
  weighted: boolean;
  adjacency: Map<string, string[]>;
}

function buildFrame(
  graph: Graph,
  positions: Record<string, { x: number; y: number }>,
  nodeStates: Map<string, CellState>,
  edgeStates: Map<string, EdgeState>,
  depth: Map<string, number>,
): GraphFrame {
  return {
    kind: "graph",
    directed: false,
    weighted: false,
    nodes: graph.nodes.map((id) => {
      const pos = positions[id] ?? { x: 50, y: 50 };
      const node: GraphFrame["nodes"][number] = {
        id,
        label: id,
        x: pos.x,
        y: pos.y,
        state: nodeStates.get(id) ?? "idle",
      };
      const d = depth.get(id);
      if (d !== undefined) node.badge = `d${d}`;
      return node;
    }),
    edges: graph.edges.map((e) => ({
      from: e.from,
      to: e.to,
      state: edgeStates.get(edgeKey(e.from, e.to)) ?? "idle",
    })),
  };
}

function auxFor(stack: string[], order: string[]): AuxPanel[] {
  return [
    {
      kind: "stack",
      label: "Stack (last in, first out)",
      items: stack.map((id, index) => ({
        id: `${id}-${index}`,
        label: id,
        state: index === stack.length - 1 ? ("active" as CellState) : ("frontier" as CellState),
      })),
    },
    {
      kind: "log",
      label: "Visit order",
      lines: order.length > 0 ? order.map((id, i) => `${i + 1}. ${id}`) : ["nothing visited yet"],
    },
  ];
}

function run(parsed: Record<string, unknown>): AlgorithmRun {
  const graph = parsed["graph"] as Graph;
  const start = parsed["start"] as string;

  const positions = layeredLayout(graph.nodes, (id) => graph.adjacency.get(id) ?? [], [start]);
  const nodeStates = new Map<string, CellState>();
  const edgeStates = new Map<string, EdgeState>();
  const depth = new Map<string, number>([[start, 0]]);
  const seen = new Set<string>();
  const order: string[] = [];
  const stack: string[] = [start];

  const b = new StepBuilder(PSEUDOCODE, CODE_BY_LANG, CODE_MAP);
  nodeStates.set(start, "frontier");
  b.bump("pushes");

  b.emit({
    frame: buildFrame(graph, positions, nodeStates, edgeStates, depth),
    aux: auxFor(stack, order),
    codeLine: 5,
    narration: `We push the starting node ${start} onto the stack, because that is where we dive in.`,
    detail:
      "Depth-first search follows one path as deep as it can go, then backtracks and tries the next branch.",
    phase: "setup",
    isMilestone: true,
  });

  while (stack.length > 0) {
    const node = stack[stack.length - 1]!;

    if (!seen.has(node)) {
      seen.add(node);
      order.push(node);
      nodeStates.set(node, "active");
      b.bump("visits");
      b.emit({
        frame: buildFrame(graph, positions, nodeStates, edgeStates, depth),
        aux: auxFor(stack, order),
        codeLine: 10,
        narration: `We step into ${node} for the first time and mark it as visited.`,
        phase: "enter",
        isMilestone: true,
      });
    }

    let next: string | undefined;
    for (const candidate of graph.adjacency.get(node) ?? []) {
      b.bump("edgesExamined");
      if (!seen.has(candidate)) {
        next = candidate;
        break;
      }
      const key = edgeKey(node, candidate);
      if (edgeStates.get(key) !== "tree") {
        edgeStates.set(key, "rejected");
        b.emit({
          frame: buildFrame(graph, positions, nodeStates, edgeStates, depth),
          aux: auxFor(stack, order),
          codeLine: 11,
          narration: `${candidate} has already been visited, so this connection leads nowhere new.`,
          phase: "skip",
        });
      }
    }

    if (next !== undefined) {
      edgeStates.set(edgeKey(node, next), "tree");
      depth.set(next, (depth.get(node) ?? 0) + 1);
      nodeStates.set(node, "visited");
      nodeStates.set(next, "frontier");
      stack.push(next);
      b.bump("pushes");
      b.emit({
        frame: buildFrame(graph, positions, nodeStates, edgeStates, depth),
        aux: auxFor(stack, order),
        codeLine: 13,
        narration: `${next} is unexplored, so we go one level deeper and push it onto the stack.`,
        phase: "enter",
      });
    } else {
      stack.pop();
      nodeStates.set(node, "visited");
      b.bump("pops");
      b.emit({
        frame: buildFrame(graph, positions, nodeStates, edgeStates, depth),
        aux: auxFor(stack, order),
        codeLine: 15,
        narration: `${node} has no unexplored neighbours left, so we back out of it.`,
        phase: "backtrack",
        isMilestone: true,
      });
    }
  }

  const unreached = graph.nodes.filter((id) => !seen.has(id));
  b.emit({
    frame: buildFrame(graph, positions, nodeStates, edgeStates, depth),
    aux: auxFor(stack, order),
    codeLine: 16,
    narration:
      unreached.length > 0
        ? `The stack is empty, and ${unreached.join(", ")} could never be reached from ${start}.`
        : "The stack is empty, which means every reachable node has been explored.",
    phase: "done",
    isMilestone: true,
  });

  return b.finish(
    "dfs",
    `${graph.nodes.length} nodes, ${graph.edges.length} edges, starting at ${start}`,
    `Visit order: ${order.join(" → ")}`,
  );
}

export const dfsModule: AlgorithmModule = {
  slug: "dfs",
  inputs: [
    {
      name: "graph",
      label: "Edges",
      kind: "graph",
      default: "A-B, A-C, B-D, B-E, C-F, E-G",
      help: 'One edge per pair, like "A-B".',
    },
    { name: "start", label: "Start node", kind: "text", default: "A" },
  ],
  validate(raw: Record<string, string>): ValidationResult {
    const parsedGraph = parseEdgeList(raw["graph"] ?? "");
    if (!parsedGraph.ok) return { ok: false, error: parsedGraph.error };
    const start = (raw["start"] ?? "").trim();
    if (start.length === 0)
      return { ok: false, error: "Enter the node the search should start from." };
    if (!parsedGraph.graph.adjacency.has(start)) {
      return {
        ok: false,
        error: `"${start}" is not a node in this graph. Available nodes: ${parsedGraph.graph.nodes.join(", ")}.`,
      };
    }
    return { ok: true, parsed: { graph: parsedGraph.graph, start } };
  },
  run,
  presets: [
    { label: "Balanced tree", values: { graph: "A-B, A-C, B-D, B-E, C-F, E-G", start: "A" } },
    {
      label: "Cycle to backtrack out of",
      values: { graph: "A-B, B-C, C-A, C-D, D-E", start: "A" },
    },
    {
      label: "Worst case: long chain + island",
      values: { graph: "A-B, B-C, C-D, D-E, E-F, F-G, G-H, X-Y", start: "A" },
    },
  ],
};

export default dfsModule;
