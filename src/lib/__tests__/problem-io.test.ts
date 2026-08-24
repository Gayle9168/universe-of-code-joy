import { describe, expect, it } from "vitest";
import { getProblem, getProblems } from "@/content/problems";
import type { Problem, ProblemTest } from "@/content/types";
import { expectedSlots, slotsFor } from "@/lib/problem-io";
import { deepEqual, entryName, stripTypes, summarize, toResults, workerSource } from "@/lib/runner";

type WorkerRows = Parameters<typeof toResults>[1];

type WorkerMessage =
  | { kind: "compile-error"; message: string }
  | { kind: "done"; results: WorkerRows };

/**
 * Drives a solution through the real worker source, exactly as the browser does:
 * `workerSource` is evaluated with a mock `self`, then `onmessage` is fired with
 * the problem's own tests. Nothing here re-implements the marshalling — a bug in
 * the preamble surfaces as a failing test rather than a passing mirror of it.
 */
function runProblem(problem: Problem, solution: string): WorkerMessage {
  const mockSelf: {
    onmessage?: (event: { data: unknown }) => void;
    postMessage?: (data: unknown) => void;
    performance: { now: () => number };
  } = { performance: { now: () => 0 } };

  const originalRandom = Math.random;
  const originalDateNow = Date.now;
  try {
    const js = stripTypes(solution);
    const entry = entryName(js)!;
    new Function("self", workerSource(js, entry, problem.io))(mockSelf);

    let message: unknown = null;
    mockSelf.postMessage = (data: unknown) => {
      message = data;
    };
    mockSelf.onmessage!({ data: { tests: problem.tests } });
    return message as WorkerMessage;
  } finally {
    Math.random = originalRandom;
    Date.now = originalDateNow;
  }
}

/** Rows from a run that is expected to have reached the test loop. */
function rowsOf(message: WorkerMessage): WorkerRows {
  expect(message.kind, `worker did not run: ${JSON.stringify(message)}`).toBe("done");
  return (message as { kind: "done"; results: WorkerRows }).results;
}

/** Every test in the problem must pass, and the failure message must name which. */
function expectAccepted(slug: string, solution: string): void {
  const problem = getProblem(slug)!;
  expect(problem, `${slug} is not in the catalog`).toBeDefined();
  const results = toResults(problem.tests, rowsOf(runProblem(problem, solution)));
  const failures = results
    .filter((r) => r.outcome !== "pass")
    .map((r) => `${r.id}: ${r.outcome} actual=${r.actual} expected=${r.expected}`);
  expect(failures, `${slug} did not accept a correct solution`).toEqual([]);
  expect(summarize(results).verdict).toBe("accepted");
}

describe("slotsFor / expectedSlots", () => {
  it("counts one slot per codec except list-cycle, which consumes two", () => {
    expect(slotsFor("raw")).toBe(1);
    expect(slotsFor("list")).toBe(1);
    expect(slotsFor("tree")).toBe(1);
    expect(slotsFor("tree-node")).toBe(1);
    expect(slotsFor("tree-val")).toBe(1);
    expect(slotsFor("list-cycle")).toBe(2);
  });

  it("sums the slots a descriptor consumes", () => {
    expect(expectedSlots({ args: ["tree", "tree-node", "tree-node"], returns: "tree-val" })).toBe(
      3,
    );
    expect(expectedSlots({ args: ["list-cycle"], returns: "raw" })).toBe(2);
    expect(expectedSlots({ args: ["list", "raw"], returns: "list" })).toBe(2);
    expect(expectedSlots({ args: [], returns: "raw" })).toBe(0);
  });
});

describe("catalog io descriptors match their tests", () => {
  const withIo = getProblems().filter((p) => p.io);

  it("declares io on exactly the problems whose starter code names a node class", () => {
    const needsIo = getProblems().filter((p) => /TreeNode|ListNode/.test(p.starterCode.ts));
    expect(withIo.map((p) => p.slug).sort()).toEqual(needsIo.map((p) => p.slug).sort());
  });

  it("consumes every input slot of every test — no argument silently dropped", () => {
    for (const problem of withIo) {
      for (const test of problem.tests) {
        expect(test.input.length, `${problem.slug}/${test.id}`).toBe(expectedSlots(problem.io!));
      }
    }
  });

  it("only uses tree-node after a tree argument that can resolve it", () => {
    for (const problem of withIo) {
      const args = problem.io!.args;
      args.forEach((codec, i) => {
        if (codec !== "tree-node") return;
        expect(args.slice(0, i), `${problem.slug} arg ${i}`).toContain("tree");
      });
    }
  });

  it("never returns a node codec from a problem whose signature returns a scalar", () => {
    for (const problem of withIo) {
      const returns = problem.io!.returns;
      if (returns !== "list" && returns !== "tree") continue;
      // A node-returning problem must expect an array, since that is what the
      // codec serializes back to.
      for (const test of problem.tests) {
        expect(Array.isArray(test.expected), `${problem.slug}/${test.id}`).toBe(true);
      }
    }
  });
});

describe("the ten node-shaped problems accept a correct solution", () => {
  it("reverse-linked-list — receives a real chain and returns one", () => {
    expectAccepted(
      "reverse-linked-list",
      `function reverseList(head) {
        var prev = null;
        while (head) { var next = head.next; head.next = prev; prev = head; head = next; }
        return prev;
      }`,
    );
  });

  it("middle-of-linked-list — returns a node, serialized from that node onward", () => {
    expectAccepted(
      "middle-of-linked-list",
      `function middleNode(head) {
        var slow = head, fast = head;
        while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }
        return slow;
      }`,
    );
  });

  it("merge-two-sorted-lists — takes two independent chains", () => {
    expectAccepted(
      "merge-two-sorted-lists",
      `function mergeTwoLists(list1, list2) {
        var dummy = { val: 0, next: null };
        var tail = dummy;
        while (list1 && list2) {
          if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }
          else { tail.next = list2; list2 = list2.next; }
          tail = tail.next;
        }
        tail.next = list1 || list2;
        return dummy.next;
      }`,
    );
  });

  it("linked-list-cycle — the pos slot actually links the tail back", () => {
    expectAccepted(
      "linked-list-cycle",
      `function hasCycle(head) {
        var slow = head, fast = head;
        while (fast && fast.next) {
          slow = slow.next; fast = fast.next.next;
          if (slow === fast) return true;
        }
        return false;
      }`,
    );
  });

  it("remove-nth-node-from-end — mixes a list argument with a raw number", () => {
    expectAccepted(
      "remove-nth-node-from-end",
      `function removeNthFromEnd(head, n) {
        var dummy = { val: 0, next: head };
        var fast = dummy, slow = dummy;
        for (var i = 0; i < n; i += 1) fast = fast.next;
        while (fast.next) { fast = fast.next; slow = slow.next; }
        slow.next = slow.next.next;
        return dummy.next;
      }`,
    );
  });

  it("binary-tree-level-order — tree in, plain nested array out", () => {
    expectAccepted(
      "binary-tree-level-order",
      `function levelOrder(root) {
        if (!root) return [];
        var out = [], queue = [root];
        while (queue.length) {
          var size = queue.length, level = [];
          for (var i = 0; i < size; i += 1) {
            var node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
          }
          out.push(level);
        }
        return out;
      }`,
    );
  });

  it("maximum-depth-of-binary-tree — a sparse level-order array builds the right shape", () => {
    expectAccepted(
      "maximum-depth-of-binary-tree",
      `function maxDepth(root) {
        if (!root) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
      }`,
    );
  });

  it("validate-binary-search-tree — nulls in the middle of the array place children correctly", () => {
    expectAccepted(
      "validate-binary-search-tree",
      `function isValidBST(root) {
        function walk(node, lo, hi) {
          if (!node) return true;
          if (lo !== null && node.val <= lo) return false;
          if (hi !== null && node.val >= hi) return false;
          return walk(node.left, lo, node.val) && walk(node.right, node.val, hi);
        }
        return walk(root, null, null);
      }`,
    );
  });

  it("invert-binary-tree — a returned tree serializes back to level order", () => {
    expectAccepted(
      "invert-binary-tree",
      `function invertTree(root) {
        if (!root) return null;
        var tmp = root.left;
        root.left = invertTree(root.right);
        root.right = invertTree(tmp);
        return root;
      }`,
    );
  });

  it("lowest-common-ancestor-bst — p and q arrive as nodes inside the same tree", () => {
    expectAccepted(
      "lowest-common-ancestor-bst",
      `function lowestCommonAncestor(root, p, q) {
        while (root) {
          if (p.val < root.val && q.val < root.val) root = root.left;
          else if (p.val > root.val && q.val > root.val) root = root.right;
          else return root;
        }
        return null;
      }`,
    );
  });
});

describe("marshalling rejects wrong answers rather than passing everything", () => {
  it("fails a list solution that returns the input unchanged", () => {
    const problem = getProblem("reverse-linked-list")!;
    const results = toResults(
      problem.tests,
      rowsOf(runProblem(problem, "function reverseList(head) { return head; }")),
    );
    // [] reversed is still [], so the empty case legitimately passes.
    expect(results.filter((r) => r.outcome === "fail").length).toBe(2);
    expect(summarize(results).verdict).toBe("failed");
  });

  it("fails a tree solution that returns the wrong depth", () => {
    const problem = getProblem("maximum-depth-of-binary-tree")!;
    const results = toResults(
      problem.tests,
      rowsOf(runProblem(problem, "function maxDepth(root) { return 1; }")),
    );
    expect(results.every((r) => r.outcome === "fail")).toBe(true);
  });

  it("reports a thrown error instead of silently accepting", () => {
    const problem = getProblem("invert-binary-tree")!;
    const results = toResults(
      problem.tests,
      rowsOf(runProblem(problem, "function invertTree(root) { return root.nope.nope; }")),
    );
    expect(results.every((r) => r.outcome === "error")).toBe(true);
    expect(summarize(results).verdict).toBe("error");
  });
});

describe("preamble edge cases", () => {
  /** Runs one expression against the preamble with an arbitrary io descriptor. */
  function evaluate(
    body: string,
    io: Problem["io"],
    tests: ProblemTest[],
  ): Array<{ actual: unknown; ok: boolean; message?: string }> {
    const mockSelf: {
      onmessage?: (event: { data: unknown }) => void;
      postMessage?: (data: unknown) => void;
      performance: { now: () => number };
    } = { performance: { now: () => 0 } };
    const originalRandom = Math.random;
    const originalDateNow = Date.now;
    try {
      new Function("self", workerSource(body, entryName(body)!, io))(mockSelf);
      let message: unknown = null;
      mockSelf.postMessage = (data: unknown) => {
        message = data;
      };
      mockSelf.onmessage!({ data: { tests } });
      return (message as { results: Array<{ actual: unknown; ok: boolean; message?: string }> })
        .results;
    } finally {
      Math.random = originalRandom;
      Date.now = originalDateNow;
    }
  }

  it("builds a null head from an empty array rather than an empty object", () => {
    const results = evaluate(
      "function f(head) { return head === null; }",
      { args: ["list"], returns: "raw" },
      [{ id: "t1", input: [[]], expected: true, hidden: false }],
    );
    expect(results[0]!.actual).toBe(true);
  });

  it("builds a null root from an empty array", () => {
    const results = evaluate(
      "function f(root) { return root === null; }",
      { args: ["tree"], returns: "raw" },
      [{ id: "t1", input: [[]], expected: true, hidden: false }],
    );
    expect(results[0]!.actual).toBe(true);
  });

  it("serializes a null return as an empty array for list and tree codecs", () => {
    expect(
      evaluate("function f(head) { return null; }", { args: ["list"], returns: "list" }, [
        { id: "t1", input: [[1]], expected: [], hidden: false },
      ])[0]!.actual,
    ).toEqual([]);
    expect(
      evaluate("function f(root) { return null; }", { args: ["tree"], returns: "tree" }, [
        { id: "t1", input: [[1]], expected: [], hidden: false },
      ])[0]!.actual,
    ).toEqual([]);
  });

  it("serializes a null tree-val return as null, not a crash on .val", () => {
    expect(
      evaluate("function f(root) { return null; }", { args: ["tree"], returns: "tree-val" }, [
        { id: "t1", input: [[1]], expected: null, hidden: false },
      ])[0]!.actual,
    ).toBeNull();
  });

  it("trims trailing nulls when serializing a tree, matching catalog expectations", () => {
    const results = evaluate(
      "function f(root) { return root; }",
      { args: ["tree"], returns: "tree" },
      [{ id: "t1", input: [[1, null, 2]], expected: [1, null, 2], hidden: false }],
    );
    expect(results[0]!.actual).toEqual([1, null, 2]);
  });

  it("leaves the list acyclic when pos is -1", () => {
    const results = evaluate(
      `function f(head) {
        var n = 0, node = head;
        while (node && n < 100) { n += 1; node = node.next; }
        return n;
      }`,
      { args: ["list-cycle"], returns: "raw" },
      [{ id: "t1", input: [[1, 2, 3], -1], expected: 3, hidden: false }],
    );
    expect(results[0]!.actual).toBe(3);
  });

  it("guards a cyclic list against an infinite serialization loop", () => {
    // Returning a cyclic list is a user error, but it must terminate rather than
    // hang the worker until the 3s timeout.
    const results = evaluate(
      "function f(head) { return head; }",
      { args: ["list-cycle"], returns: "list" },
      [{ id: "t1", input: [[1, 2, 3], 0], expected: [], hidden: false }],
    );
    expect((results[0]!.actual as unknown[]).length).toBe(10000);
  });

  it("lets user code declare its own ListNode without colliding with the preamble", () => {
    const results = evaluate(
      `function f(head) {
        class ListNode { constructor(v) { this.val = v; this.next = null; } }
        var mine = new ListNode(99);
        return mine.val + head.val;
      }`,
      { args: ["list"], returns: "raw" },
      [{ id: "t1", input: [[1]], expected: 100, hidden: false }],
    );
    expect(results[0]!.actual).toBe(100);
  });

  it("exposes ListNode and TreeNode to user code that constructs them", () => {
    // The preamble writes them onto the global object — in a Worker that is the
    // sandbox itself, but here it is the shared test realm, so restore after.
    const g = globalThis as Record<string, unknown>;
    const hadList = "ListNode" in g;
    const hadTree = "TreeNode" in g;
    try {
      const results = evaluate(
        "function f() { return [new ListNode(1).val, new TreeNode(2).val]; }",
        { args: [], returns: "raw" },
        [{ id: "t1", input: [], expected: [1, 2], hidden: false }],
      );
      expect(results[0]!.actual).toEqual([1, 2]);
    } finally {
      if (!hadList) delete g["ListNode"];
      if (!hadTree) delete g["TreeNode"];
    }
  });

  it("applies input raw when no io descriptor is given, preserving old behaviour", () => {
    const results = evaluate("function f(nums, t) { return nums.length + t; }", undefined, [
      { id: "t1", input: [[1, 2, 3], 10], expected: 13, hidden: false },
    ]);
    expect(results[0]!.actual).toBe(13);
  });

  it("does not let one test's mutations leak into the next", () => {
    const problem = getProblem("invert-binary-tree")!;
    const results = toResults(
      problem.tests,
      rowsOf(
        runProblem(
          problem,
          `function invertTree(root) {
            if (!root) return null;
            var tmp = root.left;
            root.left = invertTree(root.right);
            root.right = invertTree(tmp);
            return root;
          }`,
        ),
      ),
    );
    expect(results.every((r) => r.outcome === "pass")).toBe(true);
  });
});

describe("deepEqual over marshalled output", () => {
  it("still distinguishes order after list serialization", () => {
    expect(deepEqual([5, 4, 3], [5, 4, 3])).toBe(true);
    expect(deepEqual([5, 4, 3], [3, 4, 5])).toBe(false);
  });
});
