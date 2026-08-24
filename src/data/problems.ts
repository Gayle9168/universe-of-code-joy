import type { Problem } from "./types";

export const problems: Problem[] = [
  {
    slug: "two-sum",
    algorithmSlug: "two-pointers",
    title: "Two Sum II — Input Array Is Sorted",
    difficulty: "medium",
    statementMarkdown:
      "Given a 1-indexed array of integers `numbers` that is sorted in non-decreasing order, find two numbers such that they add up to a specific target number.\n\nReturn the indices of the two numbers, `index1` and `index2`, where `1 <= index1 < index2 <= numbers.length`.\n\nThe tests are generated such that there is exactly one solution. You may not use the same element twice.",
    constraints: [
      "2 <= numbers.length <= 3 * 10^4",
      "-1000 <= numbers[i] <= 1000",
      "numbers is sorted in non-decreasing order",
      "-1000 <= target <= 1000",
      "The tests are generated such that there is exactly one solution.",
    ],
    examples: [
      {
        input: "numbers = [2,7,11,15], target = 9",
        output: "[1,2]",
        explanation: "numbers[1] + numbers[2] = 2 + 7 = 9",
      },
      { input: "numbers = [2,3,4], target = 6", output: "[1,3]" },
    ],
    starterCode: {
      js: "function twoSum(numbers, target) {\n  // your code here\n}",
      ts: "function twoSum(numbers: number[], target: number): number[] {\n  // your code here\n  return [];\n}",
      py: "from typing import List\n\nclass Solution:\n    def twoSum(self, numbers: List[int], target: int) -> List[int]:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[2, 7, 11, 15], 9], expected: [1, 2], hidden: false },
      { id: "t2", input: [[2, 3, 4], 6], expected: [1, 3], hidden: false },
      { id: "t3", input: [[-1, 0], -1], expected: [1, 2], hidden: false },
      { id: "t4", input: [[1, 2, 3, 4, 4, 9, 56, 90], 8], expected: [4, 5], hidden: true },
    ],
    hints: [
      "The array is sorted — start one pointer at the first element and one at the last.",
      "If the pair sums above the target, move the right pointer left; if below, move the left pointer right.",
      "Return 1-indexed positions, so add 1 to both pointer indices.",
    ],
    xp: 80,
  },

  {
    slug: "binary-search-classic",
    algorithmSlug: "binary-search",
    title: "Classic Binary Search",
    difficulty: "easy",
    statementMarkdown:
      "Given a sorted array of distinct integers `nums` and a target value `target`, return the index of `target` in `nums`, or -1 if it is not present. You must write an algorithm with O(log n) runtime complexity.",
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^4 <= nums[i], target <= 10^4",
      "nums is sorted in ascending order",
    ],
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums and its index is 4.",
      },
      {
        input: "nums = [-1,0,3,5,9,12], target = 2",
        output: "-1",
        explanation: "2 does not exist in nums so return -1.",
      },
    ],
    starterCode: {
      js: "function search(nums, target) {\n  // your code here\n}",
      ts: "function search(nums: number[], target: number): number {\n  // your code here\n  return -1;\n}",
      py: "from typing import List\n\nclass Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4, hidden: false },
      { id: "t2", input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1, hidden: false },
      { id: "t3", input: [[5], 5], expected: 0, hidden: false },
      { id: "t4", input: [[1, 3, 5, 7, 9, 11, 13, 15], 11], expected: 5, hidden: true },
    ],
    hints: [
      "Initialize low = 0 and high = nums.length - 1.",
      "In each step, compare the middle element with the target.",
      "Narrow the search window by setting low = mid + 1 or high = mid - 1.",
    ],
    xp: 60,
  },

  {
    slug: "first-bad-version",
    algorithmSlug: "binary-search",
    title: "First Bad Version",
    difficulty: "easy",
    statementMarkdown:
      "You are a product manager and currently leading a team to develop a new product. Unfortunately, the latest version of your product fails the quality check. Since each version is developed based on the previous version, all the versions after a bad version are also bad.\n\nSuppose you have `n` versions `[1, 2, ..., n]` and you want to find out the first bad one, which causes all the following ones to be bad.\n\nYou are given an API `bool isBadVersion(version)` which returns whether `version` is bad. Implement a function to find the first bad version with minimal API calls.",
    constraints: ["1 <= k <= n <= 2^31 - 1"],
    examples: [
      {
        input: "n = 5, bad = 4",
        output: "4",
        explanation:
          "call isBadVersion(3) -> false\ncall isBadVersion(5) -> true\ncall isBadVersion(4) -> true\nThen 4 is the first bad version.",
      },
    ],
    starterCode: {
      js: "function solution(isBadVersion) {\n  return function(n) {\n    // your code here\n  };\n}",
      ts: "function solution(isBadVersion: (v: number) => boolean) {\n  return function(n: number): number {\n    // your code here\n    return 1;\n  };\n}",
      py: "class Solution:\n    def firstBadVersion(self, n: int) -> int:\n        # isBadVersion(version) is pre-defined\n        pass",
    },
    tests: [
      { id: "t1", input: [5, 4], expected: 4, hidden: false },
      { id: "t2", input: [1, 1], expected: 1, hidden: false },
      { id: "t3", input: [2126753390, 1702766719], expected: 1702766719, hidden: true },
    ],
    hints: [
      "Notice that the versions form a monotonic predicate: false, false, ..., true, true.",
      "Use binary search: if mid is bad, the first bad version is at mid or to the left.",
      "If mid is good, the first bad version must be strictly to the right of mid.",
    ],
    xp: 60,
  },

  {
    slug: "merge-sorted-arrays",
    algorithmSlug: "merge-sort",
    title: "Merge Sorted Arrays In-Place",
    difficulty: "easy",
    statementMarkdown:
      "You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order, and two integers `m` and `n`, representing the number of elements in `nums1` and `nums2` respectively.\n\nMerge `nums1` and `nums2` into a single array sorted in non-decreasing order.\n\nThe final sorted array should not be returned by the function, but instead be stored inside the array `nums1`. To accommodate this, `nums1` has a length of `m + n`, where the first `m` elements denote the elements that should be merged, and the last `n` elements are set to `0` and should be ignored.",
    constraints: [
      "nums1.length == m + n",
      "nums2.length == n",
      "0 <= m, n <= 200",
      "1 <= m + n <= 200",
      "-10^9 <= nums1[i], nums2[j] <= 10^9",
    ],
    examples: [
      {
        input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3",
        output: "[1,2,2,3,5,6]",
        explanation: "The arrays we are merging are [1,2,3] and [2,5,6].",
      },
    ],
    starterCode: {
      js: "function merge(nums1, m, nums2, n) {\n  // your code here (modify nums1 in-place)\n}",
      ts: "function merge(nums1: number[], m: number, nums2: number[], n: number): void {\n  // your code here (modify nums1 in-place)\n}",
      py: "from typing import List\n\nclass Solution:\n    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:\n        # your code here (modify nums1 in-place)\n        pass",
    },
    tests: [
      {
        id: "t1",
        input: [[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3],
        expected: [1, 2, 2, 3, 5, 6],
        hidden: false,
      },
      { id: "t2", input: [[1], 1, [], 0], expected: [1], hidden: false },
      { id: "t3", input: [[0], 0, [1], 1], expected: [1], hidden: false },
    ],
    hints: [
      "Since nums1 has empty space at the end, fill it starting from the back (largest elements first).",
      "Maintain three pointers: p1 at m-1, p2 at n-1, and p at m+n-1.",
      "Compare nums1[p1] and nums2[p2], place the larger one at nums1[p], and decrement.",
    ],
    xp: 60,
  },

  {
    slug: "kth-largest-element",
    algorithmSlug: "quicksort",
    title: "Kth Largest Element in an Array",
    difficulty: "medium",
    statementMarkdown:
      "Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.\n\nNote that it is the `k`th largest element in the sorted order, not the `k`th distinct element.\n\nCan you solve it in O(n) average time complexity using Quickselect?",
    constraints: ["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    examples: [
      { input: "nums = [3,2,1,5,6,4], k = 2", output: "5" },
      { input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", output: "4" },
    ],
    starterCode: {
      js: "function findKthLargest(nums, k) {\n  // your code here\n}",
      ts: "function findKthLargest(nums: number[], k: number): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[3, 2, 1, 5, 6, 4], 2], expected: 5, hidden: false },
      { id: "t2", input: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4, hidden: false },
      { id: "t3", input: [[1], 1], expected: 1, hidden: false },
      { id: "t4", input: [[7, 10, 4, 3, 20, 15], 3], expected: 10, hidden: true },
    ],
    hints: [
      "Finding the kth largest is equivalent to finding the (n - k)th smallest element (0-indexed).",
      "Use the partition step from Quicksort: after partitioning around a pivot, its final index is known.",
      "Only recurse into the partition that contains the target index.",
    ],
    xp: 90,
  },

  {
    slug: "reverse-linked-list",
    algorithmSlug: "linked-list-reversal",
    title: "Reverse a Singly Linked List",
    difficulty: "easy",
    statementMarkdown:
      "Given the `head` of a singly linked list, reverse the list, and return the reversed list's head.",
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000",
    ],
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
      },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" },
    ],
    starterCode: {
      js: "function reverseList(head) {\n  // your code here\n}",
      ts: "function reverseList(head: ListNode | null): ListNode | null {\n  // your code here\n  return null;\n}",
      py: "class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1], hidden: false },
      { id: "t2", input: [[1, 2]], expected: [2, 1], hidden: false },
      { id: "t3", input: [[]], expected: [], hidden: false },
    ],
    io: { args: ["list"], returns: "list" },
    hints: [
      "Keep track of three pointers: prev, curr, and next.",
      "Before changing curr.next, store curr.next in next so you don't lose the rest of the list.",
      "Point curr.next to prev, then advance prev and curr forward.",
    ],
    xp: 60,
  },

  {
    slug: "valid-parentheses",
    algorithmSlug: "stack-basics",
    title: "Valid Parentheses",
    difficulty: "easy",
    statementMarkdown:
      "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    starterCode: {
      js: "function isValid(s) {\n  // your code here\n}",
      ts: "function isValid(s: string): boolean {\n  // your code here\n  return false;\n}",
      py: "class Solution:\n    def isValid(self, s: str) -> bool:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: ["()"], expected: true, hidden: false },
      { id: "t2", input: ["()[]{}"], expected: true, hidden: false },
      { id: "t3", input: ["(]"], expected: false, hidden: false },
      { id: "t4", input: ["([)]"], expected: false, hidden: true },
      { id: "t5", input: ["{[]}"], expected: true, hidden: true },
    ],
    hints: [
      "Use a stack to push opening brackets onto.",
      "When encountering a closing bracket, pop from the stack and check if it matches the expected open bracket.",
      "At the end of the string, the stack must be empty for the string to be valid.",
    ],
    xp: 60,
  },

  {
    slug: "binary-tree-level-order",
    algorithmSlug: "level-order",
    title: "Binary Tree Level Order Traversal",
    difficulty: "medium",
    statementMarkdown:
      "Given the `root` of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    constraints: [
      "The number of nodes in the tree is in the range [0, 2000].",
      "-1000 <= Node.val <= 1000",
    ],
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
      },
      { input: "root = [1]", output: "[[1]]" },
      { input: "root = []", output: "[]" },
    ],
    starterCode: {
      js: "function levelOrder(root) {\n  // your code here\n}",
      ts: "function levelOrder(root: TreeNode | null): number[][] {\n  // your code here\n  return [];\n}",
      py: "class Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        # your code here\n        pass",
    },
    tests: [
      {
        id: "t1",
        input: [[3, 9, 20, null, null, 15, 7]],
        expected: [[3], [9, 20], [15, 7]],
        hidden: false,
      },
      { id: "t2", input: [[1]], expected: [[1]], hidden: false },
      { id: "t3", input: [[]], expected: [], hidden: false },
    ],
    io: { args: ["tree"], returns: "raw" },
    hints: [
      "Use a queue to explore the tree breadth-first.",
      "At the start of each level, record queue.length so you know how many nodes belong to the current tier.",
      "Collect all values for that level, enqueue their children, and append the level array to the result.",
    ],
    xp: 80,
  },

  {
    slug: "number-of-islands",
    algorithmSlug: "bfs",
    title: "Number of Islands",
    difficulty: "medium",
    statementMarkdown:
      "Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'.",
    ],
    examples: [
      {
        input:
          'grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]',
        output: "1",
      },
      {
        input:
          'grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]',
        output: "3",
      },
    ],
    starterCode: {
      js: "function numIslands(grid) {\n  // your code here\n}",
      ts: "function numIslands(grid: string[][]): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      {
        id: "t1",
        input: [
          [
            ["1", "1", "1", "1", "0"],
            ["1", "1", "0", "1", "0"],
            ["1", "1", "0", "0", "0"],
            ["0", "0", "0", "0", "0"],
          ],
        ],
        expected: 1,
        hidden: false,
      },
      {
        id: "t2",
        input: [
          [
            ["1", "1", "0", "0", "0"],
            ["1", "1", "0", "0", "0"],
            ["0", "0", "1", "0", "0"],
            ["0", "0", "0", "1", "1"],
          ],
        ],
        expected: 3,
        hidden: false,
      },
    ],
    hints: [
      "Iterate through each cell in the grid.",
      "When you encounter a '1', increment your island count and trigger a BFS or DFS to sink all connected land (turn '1's to '0's).",
      "Be careful to check row and column boundaries before visiting adjacent cells.",
    ],
    xp: 90,
  },

  {
    slug: "course-schedule",
    algorithmSlug: "topological-sort",
    title: "Course Schedule",
    difficulty: "medium",
    statementMarkdown:
      "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course `bi` first if you want to take course `ai`.\n\nReturn `true` if you can finish all courses. Otherwise, return `false`.",
    constraints: [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= 5000",
      "prerequisites[i].length == 2",
      "0 <= ai, bi < numCourses",
      "All the pairs prerequisites[i] are unique.",
    ],
    examples: [
      {
        input: "numCourses = 2, prerequisites = [[1,0]]",
        output: "true",
        explanation:
          "There are a total of 2 courses. To take course 1 you should have finished course 0. So it is possible.",
      },
      {
        input: "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        output: "false",
        explanation:
          "To take course 1 you should have finished course 0, and to take course 0 you should also have finished course 1. Impossible.",
      },
    ],
    starterCode: {
      js: "function canFinish(numCourses, prerequisites) {\n  // your code here\n}",
      ts: "function canFinish(numCourses: number, prerequisites: number[][]): boolean {\n  // your code here\n  return false;\n}",
      py: "from typing import List\n\nclass Solution:\n    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [2, [[1, 0]]], expected: true, hidden: false },
      {
        id: "t2",
        input: [
          2,
          [
            [1, 0],
            [0, 1],
          ],
        ],
        expected: false,
        hidden: false,
      },
      {
        id: "t3",
        input: [
          3,
          [
            [0, 1],
            [0, 2],
            [1, 2],
          ],
        ],
        expected: true,
        hidden: true,
      },
    ],
    hints: [
      "This problem is equivalent to detecting if a directed cycle exists in the dependency graph.",
      "Build an adjacency list and compute in-degrees for all nodes.",
      "Use Kahn's algorithm with a queue of in-degree 0 nodes. If the count of processed nodes equals numCourses, return true.",
    ],
    xp: 90,
  },

  {
    slug: "network-delay-time",
    algorithmSlug: "dijkstra",
    title: "Network Delay Time",
    difficulty: "medium",
    statementMarkdown:
      "You are given a network of `n` nodes, labeled from `1` to `n`. You are also given `times`, a list of travel times as directed edges `times[i] = (ui, vi, wi)`, where `ui` is the source node, `vi` is the target node, and `wi` is the time it takes for a signal to travel from source to target.\n\nWe will send a signal from a given node `k`. Return the minimum time it takes for all the `n` nodes to receive the signal. If it is impossible for all the `n` nodes to receive the signal, return `-1`.",
    constraints: [
      "1 <= k <= n <= 100",
      "1 <= times.length <= 6000",
      "times[i].length == 3",
      "1 <= ui, vi <= n",
      "ui != vi",
      "0 <= wi <= 100",
      "All the pairs (ui, vi) are unique.",
    ],
    examples: [
      {
        input: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2",
        output: "2",
      },
      { input: "times = [[1,2,1]], n = 2, k = 1", output: "1" },
      { input: "times = [[1,2,1]], n = 2, k = 2", output: "-1" },
    ],
    starterCode: {
      js: "function networkDelayTime(times, n, k) {\n  // your code here\n}",
      ts: "function networkDelayTime(times: number[][], n: number, k: number): number {\n  // your code here\n  return -1;\n}",
      py: "from typing import List\n\nclass Solution:\n    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:\n        # your code here\n        pass",
    },
    tests: [
      {
        id: "t1",
        input: [
          [
            [2, 1, 1],
            [2, 3, 1],
            [3, 4, 1],
          ],
          4,
          2,
        ],
        expected: 2,
        hidden: false,
      },
      { id: "t2", input: [[[1, 2, 1]], 2, 1], expected: 1, hidden: false },
      { id: "t3", input: [[[1, 2, 1]], 2, 2], expected: -1, hidden: false },
    ],
    hints: [
      "This is single-source shortest path on a directed graph with non-negative weights — use Dijkstra's algorithm.",
      "Initialize distances to infinity, set dist[k] = 0, and use a priority queue.",
      "The answer is the maximum distance among all nodes from 1 to n. If any node is unreachable, return -1.",
    ],
    xp: 100,
  },

  {
    slug: "linear-search-find-target",
    algorithmSlug: "linear-search",
    title: "Find Target in Unsorted Array",
    difficulty: "easy",
    statementMarkdown:
      "Given an unsorted array of integers `nums` and a target value `target`, return the index of the first occurrence of `target` in `nums`, or `-1` if it is not present.",
    constraints: ["1 <= nums.length <= 10^4", "-10^4 <= nums[i], target <= 10^4"],
    examples: [
      { input: "nums = [4, 2, 7, 1, 9], target = 7", output: "2" },
      { input: "nums = [1, 2, 3], target = 5", output: "-1" },
    ],
    starterCode: {
      js: "function findTarget(nums, target) {\n  // your code here\n}",
      ts: "function findTarget(nums: number[], target: number): number {\n  // your code here\n  return -1;\n}",
      py: "from typing import List\n\nclass Solution:\n    def findTarget(self, nums: List[int], target: int) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[4, 2, 7, 1, 9], 7], expected: 2, hidden: false },
      { id: "t2", input: [[1, 2, 3], 5], expected: -1, hidden: false },
      { id: "t3", input: [[10], 10], expected: 0, hidden: false },
    ],
    hints: [
      "Iterate through indices 0 to n-1 sequentially.",
      "Return the index as soon as nums[i] === target.",
    ],
    xp: 50,
  },

  {
    slug: "bubble-sort-steps",
    algorithmSlug: "bubble-sort",
    title: "Count Swaps in Bubble Sort",
    difficulty: "easy",
    statementMarkdown:
      "Given an array of integers `nums`, sort the array using bubble sort and return the total number of element swaps performed.",
    constraints: ["1 <= nums.length <= 500", "-1000 <= nums[i] <= 1000"],
    examples: [
      {
        input: "nums = [4, 3, 2, 1]",
        output: "6",
        explanation: "4 swaps pass 1, 2 swaps pass 2, total 6.",
      },
      { input: "nums = [1, 2, 3]", output: "0", explanation: "Already sorted." },
    ],
    starterCode: {
      js: "function countSwaps(nums) {\n  // your code here\n}",
      ts: "function countSwaps(nums: number[]): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def countSwaps(self, nums: List[int]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[4, 3, 2, 1]], expected: 6, hidden: false },
      { id: "t2", input: [[1, 2, 3]], expected: 0, hidden: false },
      { id: "t3", input: [[3, 1, 2]], expected: 2, hidden: false },
    ],
    hints: [
      "Run nested loops: outer i from 0 to n-1, inner j from 0 to n-i-2.",
      "Increment a counter whenever nums[j] > nums[j+1].",
    ],
    xp: 50,
  },

  {
    slug: "insertion-sort-list",
    algorithmSlug: "insertion-sort",
    title: "Insertion Sort Array Simulation",
    difficulty: "medium",
    statementMarkdown:
      "Given an array of integers `nums`, implement insertion sort and return the sorted array. Maintain in-place insertion invariants.",
    constraints: ["1 <= nums.length <= 1000", "-10^4 <= nums[i] <= 10^4"],
    examples: [
      { input: "nums = [4, 2, 1, 3]", output: "[1, 2, 3, 4]" },
      { input: "nums = [-1, 5, 3, 4, 0]", output: "[-1, 0, 3, 4, 5]" },
    ],
    starterCode: {
      js: "function insertionSort(nums) {\n  // your code here\n}",
      ts: "function insertionSort(nums: number[]): number[] {\n  // your code here\n  return nums;\n}",
      py: "from typing import List\n\nclass Solution:\n    def insertionSort(self, nums: List[int]) -> List[int]:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[4, 2, 1, 3]], expected: [1, 2, 3, 4], hidden: false },
      { id: "t2", input: [[-1, 5, 3, 4, 0]], expected: [-1, 0, 3, 4, 5], hidden: false },
    ],
    hints: [
      "For each element at index i, shift greater elements right and insert at target position.",
    ],
    xp: 70,
  },

  {
    slug: "sort-colors",
    algorithmSlug: "two-pointers",
    title: "Sort Colors (Dutch National Flag)",
    difficulty: "medium",
    statementMarkdown:
      "Given an array `nums` with `n` objects colored red (0), white (1), or blue (2), sort them in-place so that objects of the same color are adjacent, in color order 0, 1, 2.\n\nYou must solve this without using the library's sort function and in one pass with O(1) extra space.",
    constraints: ["1 <= nums.length <= 300", "nums[i] is either 0, 1, or 2."],
    examples: [
      { input: "nums = [2,0,2,1,1,0]", output: "[0,0,1,1,2,2]" },
      { input: "nums = [2,0,1]", output: "[0,1,2]" },
    ],
    starterCode: {
      js: "function sortColors(nums) {\n  // your code here (modify nums in-place)\n}",
      ts: "function sortColors(nums: number[]): void {\n  // your code here (modify nums in-place)\n}",
      py: "from typing import List\n\nclass Solution:\n    def sortColors(self, nums: List[int]) -> None:\n        # your code here (modify nums in-place)\n        pass",
    },
    tests: [
      { id: "t1", input: [[2, 0, 2, 1, 1, 0]], expected: [0, 0, 1, 1, 2, 2], hidden: false },
      { id: "t2", input: [[2, 0, 1]], expected: [0, 1, 2], hidden: false },
    ],
    hints: [
      "Maintain three pointers: low, mid, and high.",
      "Swap 0s with low, 2s with high, and advance mid on 1s.",
    ],
    xp: 80,
  },

  {
    slug: "search-rotated-sorted-array",
    algorithmSlug: "binary-search",
    title: "Search in Rotated Sorted Array",
    difficulty: "medium",
    statementMarkdown:
      "Given an integer array `nums` sorted in ascending order (with distinct values) that is rotated at some unknown pivot, and an integer `target`, return the index of `target` or `-1` if not found in O(log n) time.",
    constraints: [
      "1 <= nums.length <= 5000",
      "-10^4 <= nums[i], target <= 10^4",
      "All elements in nums are unique.",
    ],
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" },
      { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1" },
    ],
    starterCode: {
      js: "function searchRotated(nums, target) {\n  // your code here\n}",
      ts: "function searchRotated(nums: number[], target: number): number {\n  // your code here\n  return -1;\n}",
      py: "from typing import List\n\nclass Solution:\n    def searchRotated(self, nums: List[int], target: int) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4, hidden: false },
      { id: "t2", input: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1, hidden: false },
      { id: "t3", input: [[1], 0], expected: -1, hidden: false },
    ],
    hints: [
      "At least one half (left or right of mid) is always normally sorted.",
      "Check if target lies inside the sorted half to decide branching.",
    ],
    xp: 90,
  },

  {
    slug: "find-minimum-in-rotated-sorted-array",
    algorithmSlug: "binary-search",
    title: "Find Minimum in Rotated Sorted Array",
    difficulty: "medium",
    statementMarkdown:
      "Given a sorted rotated array of unique elements `nums`, return the minimum element of this array in O(log n) time.",
    constraints: ["1 <= nums.length <= 5000", "-5000 <= nums[i] <= 5000", "All values are unique."],
    examples: [
      { input: "nums = [3,4,5,1,2]", output: "1" },
      { input: "nums = [4,5,6,7,0,1,2]", output: "0" },
    ],
    starterCode: {
      js: "function findMin(nums) {\n  // your code here\n}",
      ts: "function findMin(nums: number[]): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def findMin(self, nums: List[int]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[3, 4, 5, 1, 2]], expected: 1, hidden: false },
      { id: "t2", input: [[4, 5, 6, 7, 0, 1, 2]], expected: 0, hidden: false },
      { id: "t3", input: [[11, 13, 15, 17]], expected: 11, hidden: false },
    ],
    hints: [
      "Compare nums[mid] with nums[high].",
      "If nums[mid] > nums[high], min must be to the right.",
    ],
    xp: 80,
  },

  {
    slug: "peak-index-in-mountain-array",
    algorithmSlug: "binary-search",
    title: "Peak Index in a Mountain Array",
    difficulty: "easy",
    statementMarkdown:
      "An array `arr` is a mountain if `arr[0] < arr[1] < ... < arr[i]` and `arr[i] > arr[i+1] > ... > arr[arr.length - 1]`. Return the peak index `i` in O(log n) time.",
    constraints: ["3 <= arr.length <= 10^5", "0 <= arr[i] <= 10^6"],
    examples: [
      { input: "arr = [0,1,0]", output: "1" },
      { input: "arr = [0,2,1,0]", output: "1" },
      { input: "arr = [0,10,5,2]", output: "1" },
    ],
    starterCode: {
      js: "function peakIndexInMountainArray(arr) {\n  // your code here\n}",
      ts: "function peakIndexInMountainArray(arr: number[]): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def peakIndexInMountainArray(self, arr: List[int]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[0, 1, 0]], expected: 1, hidden: false },
      { id: "t2", input: [[0, 2, 1, 0]], expected: 1, hidden: false },
      { id: "t3", input: [[0, 10, 5, 2]], expected: 1, hidden: false },
    ],
    hints: [
      "If arr[mid] < arr[mid+1], you are on the uphill slope; search right.",
      "Otherwise you are on downhill slope or at the peak.",
    ],
    xp: 60,
  },

  {
    slug: "max-consecutive-ones-iii",
    algorithmSlug: "sliding-window",
    title: "Max Consecutive Ones III",
    difficulty: "medium",
    statementMarkdown:
      "Given a binary array `nums` and an integer `k`, return the maximum number of consecutive `1`s in the array if you can flip at most `k` `0`s.",
    constraints: ["1 <= nums.length <= 10^5", "nums[i] is either 0 or 1", "0 <= k <= nums.length"],
    examples: [
      { input: "nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2", output: "6" },
      { input: "nums = [0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1], k = 3", output: "10" },
    ],
    starterCode: {
      js: "function longestOnes(nums, k) {\n  // your code here\n}",
      ts: "function longestOnes(nums: number[], k: number): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def longestOnes(self, nums: List[int], k: int) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], expected: 6, hidden: false },
      {
        id: "t2",
        input: [[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3],
        expected: 10,
        hidden: false,
      },
    ],
    hints: [
      "Translate to: find the longest subarray containing at most k zeros.",
      "Use sliding window expanding right and contracting left when zeros > k.",
    ],
    xp: 80,
  },

  {
    slug: "minimum-size-subarray-sum",
    algorithmSlug: "sliding-window",
    title: "Minimum Size Subarray Sum",
    difficulty: "medium",
    statementMarkdown:
      "Given an array of positive integers `nums` and a positive integer `target`, return the minimal length of a subarray whose sum is greater than or equal to `target`. If there is no such subarray, return 0.",
    constraints: ["1 <= target <= 10^9", "1 <= nums.length <= 10^5", "1 <= nums[i] <= 10^4"],
    examples: [
      {
        input: "target = 7, nums = [2,3,1,2,4,3]",
        output: "2",
        explanation: "Subarray [4,3] has minimal length 2.",
      },
      { input: "target = 4, nums = [1,4,4]", output: "1" },
    ],
    starterCode: {
      js: "function minSubArrayLen(target, nums) {\n  // your code here\n}",
      ts: "function minSubArrayLen(target: number, nums: number[]): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def minSubArrayLen(self, target: int, nums: List[int]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [7, [2, 3, 1, 2, 4, 3]], expected: 2, hidden: false },
      { id: "t2", input: [4, [1, 4, 4]], expected: 1, hidden: false },
      { id: "t3", input: [11, [1, 1, 1, 1, 1, 1, 1, 1]], expected: 0, hidden: false },
    ],
    hints: [
      "Expand right to accumulate sum.",
      "While sum >= target, record window length and contract left.",
    ],
    xp: 80,
  },

  {
    slug: "longest-substring-without-repeating-characters",
    algorithmSlug: "sliding-window",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "medium",
    statementMarkdown:
      "Given a string `s`, find the length of the longest substring without duplicate characters.",
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with length 3.' },
      { input: 's = "bbbbb"', output: "1" },
      { input: 's = "pwwkew"', output: "3" },
    ],
    starterCode: {
      js: "function lengthOfLongestSubstring(s) {\n  // your code here\n}",
      ts: "function lengthOfLongestSubstring(s: string): number {\n  // your code here\n  return 0;\n}",
      py: "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: ["abcabcbb"], expected: 3, hidden: false },
      { id: "t2", input: ["bbbbb"], expected: 1, hidden: false },
      { id: "t3", input: ["pwwkew"], expected: 3, hidden: false },
      { id: "t4", input: [""], expected: 0, hidden: true },
    ],
    hints: [
      "Use a map/set to track characters currently inside the window.",
      "When a duplicate enters, advance left until the duplicate is dropped.",
    ],
    xp: 90,
  },

  {
    slug: "container-with-most-water",
    algorithmSlug: "two-pointers",
    title: "Container With Most Water",
    difficulty: "medium",
    statementMarkdown:
      "Given an integer array `height` of length `n`, find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
    constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
    examples: [
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" },
      { input: "height = [1,1]", output: "1" },
    ],
    starterCode: {
      js: "function maxArea(height) {\n  // your code here\n}",
      ts: "function maxArea(height: number[]): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def maxArea(self, height: List[int]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49, hidden: false },
      { id: "t2", input: [[1, 1]], expected: 1, hidden: false },
    ],
    hints: [
      "Start with maximum width (pointers at 0 and n-1).",
      "Area is limited by the shorter line; always move the shorter line pointer inward.",
    ],
    xp: 90,
  },

  {
    slug: "trapping-rain-water",
    algorithmSlug: "two-pointers",
    title: "Trapping Rain Water",
    difficulty: "hard",
    statementMarkdown:
      "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
    ],
    starterCode: {
      js: "function trap(height) {\n  // your code here\n}",
      ts: "function trap(height: number[]): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def trap(self, height: List[int]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6, hidden: false },
      { id: "t2", input: [[4, 2, 0, 3, 2, 5]], expected: 9, hidden: false },
    ],
    hints: [
      "Use two pointers left and right, maintaining leftMax and rightMax.",
      "Water trapped at pointer depends only on min(leftMax, rightMax) - height.",
    ],
    xp: 130,
  },

  {
    slug: "middle-of-linked-list",
    algorithmSlug: "linked-list-reversal",
    title: "Middle of the Linked List",
    difficulty: "easy",
    statementMarkdown:
      "Given the `head` of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the second middle node.",
    constraints: [
      "The number of nodes in the list is in the range [1, 100].",
      "1 <= Node.val <= 100",
    ],
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[3,4,5]" },
      { input: "head = [1,2,3,4,5,6]", output: "[4,5,6]" },
    ],
    starterCode: {
      js: "function middleNode(head) {\n  // your code here\n}",
      ts: "function middleNode(head: ListNode | null): ListNode | null {\n  // your code here\n  return head;\n}",
      py: "class Solution:\n    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[1, 2, 3, 4, 5]], expected: [3, 4, 5], hidden: false },
      { id: "t2", input: [[1, 2, 3, 4, 5, 6]], expected: [4, 5, 6], hidden: false },
    ],
    io: { args: ["list"], returns: "list" },
    hints: [
      "Use fast and slow pointers: fast moves 2 steps, slow moves 1 step.",
      "When fast reaches end, slow is at the middle.",
    ],
    xp: 60,
  },

  {
    slug: "merge-two-sorted-lists",
    algorithmSlug: "linked-list-reversal",
    title: "Merge Two Sorted Linked Lists",
    difficulty: "easy",
    statementMarkdown:
      "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list and return its head.",
    constraints: [
      "The number of nodes in both lists is in range [0, 50].",
      "-100 <= Node.val <= 100",
    ],
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "list1 = [], list2 = []", output: "[]" },
    ],
    starterCode: {
      js: "function mergeTwoLists(list1, list2) {\n  // your code here\n}",
      ts: "function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {\n  // your code here\n  return null;\n}",
      py: "class Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        # your code here\n        pass",
    },
    tests: [
      {
        id: "t1",
        input: [
          [1, 2, 4],
          [1, 3, 4],
        ],
        expected: [1, 1, 2, 3, 4, 4],
        hidden: false,
      },
      { id: "t2", input: [[], []], expected: [], hidden: false },
    ],
    io: { args: ["list", "list"], returns: "list" },
    hints: [
      "Use a dummy pre-head node to simplify edge cases.",
      "Compare heads of both lists and advance the smaller one.",
    ],
    xp: 60,
  },

  {
    slug: "linked-list-cycle",
    algorithmSlug: "linked-list-reversal",
    title: "Linked List Cycle Detection",
    difficulty: "easy",
    statementMarkdown:
      "Given `head`, the head of a linked list, determine if the linked list has a cycle in it using O(1) memory.",
    constraints: [
      "The number of the nodes in the list is in the range [0, 10^4].",
      "-10^5 <= Node.val <= 10^5",
    ],
    examples: [
      { input: "head = [3,2,0,-4], pos = 1", output: "true" },
      { input: "head = [1,2], pos = 0", output: "true" },
      { input: "head = [1], pos = -1", output: "false" },
    ],
    starterCode: {
      js: "function hasCycle(head) {\n  // your code here\n}",
      ts: "function hasCycle(head: ListNode | null): boolean {\n  // your code here\n  return false;\n}",
      py: "class Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[3, 2, 0, -4], 1], expected: true, hidden: false },
      { id: "t2", input: [[1, 2], 0], expected: true, hidden: false },
      { id: "t3", input: [[1], -1], expected: false, hidden: false },
    ],
    io: { args: ["list-cycle"], returns: "raw" },
    hints: ["Apply Floyd's cycle-finding algorithm with fast and slow pointers."],
    xp: 60,
  },

  {
    slug: "remove-nth-node-from-end",
    algorithmSlug: "linked-list-reversal",
    title: "Remove Nth Node From End of List",
    difficulty: "medium",
    statementMarkdown:
      "Given the `head` of a linked list, remove the `n`th node from the end of the list and return its head in one pass.",
    constraints: [
      "The number of nodes in the list is sz.",
      "1 <= sz <= 30",
      "0 <= Node.val <= 100",
      "1 <= n <= sz",
    ],
    examples: [
      { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]" },
      { input: "head = [1], n = 1", output: "[]" },
    ],
    starterCode: {
      js: "function removeNthFromEnd(head, n) {\n  // your code here\n}",
      ts: "function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {\n  // your code here\n  return null;\n}",
      py: "class Solution:\n    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5], hidden: false },
      { id: "t2", input: [[1], 1], expected: [], hidden: false },
    ],
    io: { args: ["list", "raw"], returns: "list" },
    hints: [
      "Advance fast pointer n steps ahead of slow pointer.",
      "When fast reaches end, slow is right before the target node.",
    ],
    xp: 80,
  },

  {
    slug: "min-stack",
    algorithmSlug: "stack-basics",
    title: "Min Stack Design",
    difficulty: "medium",
    statementMarkdown:
      "Design a stack that supports push, pop, top, and retrieving the minimum element in constant O(1) time.",
    constraints: [
      "Methods pop, top and getMin operations will always be called on non-empty stacks.",
      "At most 3 * 10^4 calls will be made.",
    ],
    examples: [
      {
        input:
          '["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]',
        output: "[null,null,null,null,-3,null,0,-2]",
      },
    ],
    starterCode: {
      js: "class MinStack {\n  constructor() {}\n  push(val) {}\n  pop() {}\n  top() {}\n  getMin() {}\n}",
      ts: "class MinStack {\n  constructor() {}\n  push(val: number): void {}\n  pop(): void {}\n  top(): number { return 0; }\n  getMin(): number { return 0; }\n}",
      py: "class MinStack:\n    def __init__(self):\n        pass\n    def push(self, val: int) -> None:\n        pass\n    def pop(self) -> None:\n        pass\n    def top(self) -> int:\n        pass\n    def getMin(self) -> int:\n        pass",
    },
    tests: [
      {
        id: "t1",
        input: [["push", -2], ["push", 0], ["push", -3], ["getMin"], ["pop"], ["top"], ["getMin"]],
        expected: [null, null, null, -3, null, 0, -2],
        hidden: false,
      },
    ],
    hints: ["Maintain a companion min-stack that pushes min(val, currentMin) on every push."],
    xp: 80,
  },

  {
    slug: "evaluate-reverse-polish-notation",
    algorithmSlug: "stack-basics",
    title: "Evaluate Reverse Polish Notation",
    difficulty: "medium",
    statementMarkdown:
      "Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are `+`, `-`, `*`, and `/`. Division truncates toward zero.",
    constraints: [
      "1 <= tokens.length <= 10^4",
      "tokens[i] is either an operator or an integer in range [-200, 200].",
    ],
    examples: [
      { input: 'tokens = ["2","1","+","3","*"]', output: "9", explanation: "((2 + 1) * 3) = 9" },
      { input: 'tokens = ["4","13","5","/","+"]', output: "6" },
    ],
    starterCode: {
      js: "function evalRPN(tokens) {\n  // your code here\n}",
      ts: "function evalRPN(tokens: string[]): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def evalRPN(self, tokens: List[str]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [["2", "1", "+", "3", "*"]], expected: 9, hidden: false },
      { id: "t2", input: [["4", "13", "5", "/", "+"]], expected: 6, hidden: false },
    ],
    hints: [
      "Push numbers onto a stack.",
      "When an operator appears, pop two operands, apply operator, and push result.",
    ],
    xp: 80,
  },

  {
    slug: "daily-temperatures",
    algorithmSlug: "stack-basics",
    title: "Daily Temperatures",
    difficulty: "medium",
    statementMarkdown:
      "Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i`th day to get a warmer temperature. If no warmer day exists, keep `answer[i] == 0`.",
    constraints: ["1 <= temperatures.length <= 10^5", "30 <= temperatures[i] <= 100"],
    examples: [
      { input: "temperatures = [73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]" },
      { input: "temperatures = [30,40,50,60]", output: "[1,1,1,0]" },
    ],
    starterCode: {
      js: "function dailyTemperatures(temperatures) {\n  // your code here\n}",
      ts: "function dailyTemperatures(temperatures: number[]): number[] {\n  // your code here\n  return [];\n}",
      py: "from typing import List\n\nclass Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        # your code here\n        pass",
    },
    tests: [
      {
        id: "t1",
        input: [[73, 74, 75, 71, 69, 72, 76, 73]],
        expected: [1, 1, 4, 2, 1, 1, 0, 0],
        hidden: false,
      },
      { id: "t2", input: [[30, 40, 50, 60]], expected: [1, 1, 1, 0], hidden: false },
    ],
    hints: [
      "Use a monotonic decreasing stack storing indices.",
      "When current temp > temp at stack top, resolve wait distance.",
    ],
    xp: 90,
  },

  {
    slug: "implement-queue-using-stacks",
    algorithmSlug: "queue-basics",
    title: "Implement Queue using Stacks",
    difficulty: "easy",
    statementMarkdown:
      "Implement a first-in first-out (FIFO) queue using only two standard stacks. The implemented queue should support `push`, `pop`, `peek`, and `empty`.",
    constraints: [
      "At most 100 calls will be made to push, pop, peek, and empty.",
      "All calls to pop and peek are valid.",
    ],
    examples: [
      {
        input: '["MyQueue", "push", "push", "peek", "pop", "empty"]\n[[], [1], [2], [], [], []]',
        output: "[null, null, null, 1, 1, false]",
      },
    ],
    starterCode: {
      js: "class MyQueue {\n  constructor() {}\n  push(x) {}\n  pop() {}\n  peek() {}\n  empty() {}\n}",
      ts: "class MyQueue {\n  constructor() {}\n  push(x: number): void {}\n  pop(): number { return 0; }\n  peek(): number { return 0; }\n  empty(): boolean { return true; }\n}",
      py: "class MyQueue:\n    def __init__(self):\n        pass\n    def push(self, x: int) -> None:\n        pass\n    def pop(self) -> int:\n        pass\n    def peek(self) -> int:\n        pass\n    def empty(self) -> bool:\n        pass",
    },
    tests: [
      {
        id: "t1",
        input: [["push", 1], ["push", 2], ["peek"], ["pop"], ["empty"]],
        expected: [null, null, 1, 1, false],
        hidden: false,
      },
    ],
    hints: [
      "Use an `inStack` for pushes and an `outStack` for pops/peeks.",
      "Transfer elements from inStack to outStack only when outStack is empty.",
    ],
    xp: 60,
  },

  {
    slug: "two-sum-hash-map",
    algorithmSlug: "hash-table-chaining",
    title: "Two Sum (Hash Map Lookup)",
    difficulty: "easy",
    statementMarkdown:
      "Given an unsorted array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target` in O(n) time.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
    ],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    starterCode: {
      js: "function twoSum(nums, target) {\n  // your code here\n}",
      ts: "function twoSum(nums: number[], target: number): number[] {\n  // your code here\n  return [];\n}",
      py: "from typing import List\n\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[2, 7, 11, 15], 9], expected: [0, 1], hidden: false },
      { id: "t2", input: [[3, 2, 4], 6], expected: [1, 2], hidden: false },
    ],
    hints: [
      "Store seen values mapped to their indices in a hash map.",
      "For each element x, check if (target - x) is already in the map.",
    ],
    xp: 60,
  },

  {
    slug: "group-anagrams",
    algorithmSlug: "hash-table-chaining",
    title: "Group Anagrams",
    difficulty: "medium",
    statementMarkdown:
      "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
    constraints: [
      "1 <= strs.length <= 10^4",
      "0 <= strs[i].length <= 100",
      "strs[i] consists of lowercase English letters.",
    ],
    examples: [
      {
        input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
        output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
      },
      { input: 'strs = [""]', output: '[[""]]' },
    ],
    starterCode: {
      js: "function groupAnagrams(strs) {\n  // your code here\n}",
      ts: "function groupAnagrams(strs: string[]): string[][] {\n  // your code here\n  return [];\n}",
      py: "from typing import List\n\nclass Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        # your code here\n        pass",
    },
    tests: [
      {
        id: "t1",
        input: [["eat", "tea", "tan", "ate", "nat", "bat"]],
        expected: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]],
        hidden: false,
      },
      { id: "t2", input: [[""]], expected: [[""]], hidden: false },
    ],
    hints: [
      "Sort each string alphabetically to generate a canonical hash key.",
      "Group strings with identical sorted keys into a list in your hash table.",
    ],
    xp: 80,
  },

  {
    slug: "validate-binary-search-tree",
    algorithmSlug: "bst-traversals",
    title: "Validate Binary Search Tree",
    difficulty: "medium",
    statementMarkdown:
      "Given the `root` of a binary tree, determine if it is a valid binary search tree (BST).",
    constraints: [
      "The number of nodes in the tree is in range [1, 10^4].",
      "-2^31 <= Node.val <= 2^31 - 1",
    ],
    examples: [
      { input: "root = [2,1,3]", output: "true" },
      {
        input: "root = [5,1,4,null,null,3,6]",
        output: "false",
        explanation: "The root node's value is 5 but its right child's value is 4.",
      },
    ],
    starterCode: {
      js: "function isValidBST(root) {\n  // your code here\n}",
      ts: "function isValidBST(root: TreeNode | null): boolean {\n  // your code here\n  return true;\n}",
      py: "class Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[2, 1, 3]], expected: true, hidden: false },
      { id: "t2", input: [[5, 1, 4, null, null, 3, 6]], expected: false, hidden: false },
    ],
    io: { args: ["tree"], returns: "raw" },
    hints: [
      "Pass min and max bounds down the recursion: left child bounded by (min, node.val), right by (node.val, max).",
      "Alternatively, verify that in-order traversal values are strictly increasing.",
    ],
    xp: 90,
  },

  {
    slug: "maximum-depth-of-binary-tree",
    algorithmSlug: "level-order",
    title: "Maximum Depth of Binary Tree",
    difficulty: "easy",
    statementMarkdown: "Given the `root` of a binary tree, return its maximum depth.",
    constraints: [
      "The number of nodes in the tree is in range [0, 10^4].",
      "-100 <= Node.val <= 100",
    ],
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "3" },
      { input: "root = [1,null,2]", output: "2" },
    ],
    starterCode: {
      js: "function maxDepth(root) {\n  // your code here\n}",
      ts: "function maxDepth(root: TreeNode | null): number {\n  // your code here\n  return 0;\n}",
      py: "class Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[3, 9, 20, null, null, 15, 7]], expected: 3, hidden: false },
      { id: "t2", input: [[1, null, 2]], expected: 2, hidden: false },
    ],
    io: { args: ["tree"], returns: "raw" },
    hints: [
      "Base case: if root is null, depth is 0.",
      "Recursive case: 1 + max(maxDepth(left), maxDepth(right)).",
    ],
    xp: 50,
  },

  {
    slug: "invert-binary-tree",
    algorithmSlug: "level-order",
    title: "Invert Binary Tree",
    difficulty: "easy",
    statementMarkdown:
      "Given the `root` of a binary tree, invert the tree (mirror all left and right children), and return its root.",
    constraints: [
      "The number of nodes in the tree is in range [0, 100].",
      "-100 <= Node.val <= 100",
    ],
    examples: [
      { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" },
      { input: "root = [2,1,3]", output: "[2,3,1]" },
    ],
    starterCode: {
      js: "function invertTree(root) {\n  // your code here\n}",
      ts: "function invertTree(root: TreeNode | null): TreeNode | null {\n  // your code here\n  return root;\n}",
      py: "class Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[4, 2, 7, 1, 3, 6, 9]], expected: [4, 7, 2, 9, 6, 3, 1], hidden: false },
      { id: "t2", input: [[2, 1, 3]], expected: [2, 3, 1], hidden: false },
    ],
    io: { args: ["tree"], returns: "tree" },
    hints: ["Swap root.left and root.right, then recursively invert both subtrees."],
    xp: 50,
  },

  {
    slug: "lowest-common-ancestor-bst",
    algorithmSlug: "bst-insert",
    title: "Lowest Common Ancestor of a BST",
    difficulty: "medium",
    statementMarkdown:
      "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes `p` and `q`.",
    constraints: [
      "The number of nodes in the tree is in range [2, 10^5].",
      "All Node.val are unique.",
      "p != q",
      "p and q exist in the BST.",
    ],
    examples: [
      { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8", output: "6" },
      { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4", output: "2" },
    ],
    starterCode: {
      js: "function lowestCommonAncestor(root, p, q) {\n  // your code here\n}",
      ts: "function lowestCommonAncestor(root: TreeNode | null, p: TreeNode | null, q: TreeNode | null): TreeNode | null {\n  // your code here\n  return root;\n}",
      py: "class Solution:\n    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':\n        # your code here\n        pass",
    },
    tests: [
      {
        id: "t1",
        input: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8],
        expected: 6,
        hidden: false,
      },
      {
        id: "t2",
        input: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 4],
        expected: 2,
        hidden: false,
      },
    ],
    io: { args: ["tree", "tree-node", "tree-node"], returns: "tree-val" },
    hints: [
      "If both p and q are smaller than root, LCA is in left subtree.",
      "If both are larger, LCA is in right subtree. Otherwise, current root is the split LCA.",
    ],
    xp: 80,
  },

  {
    slug: "top-k-frequent-elements",
    algorithmSlug: "heap-sort",
    title: "Top K Frequent Elements",
    difficulty: "medium",
    statementMarkdown:
      "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements in any order.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
      "k is in range [1, number of unique elements].",
    ],
    examples: [
      { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]" },
      { input: "nums = [1], k = 1", output: "[1]" },
    ],
    starterCode: {
      js: "function topKFrequent(nums, k) {\n  // your code here\n}",
      ts: "function topKFrequent(nums: number[], k: number): number[] {\n  // your code here\n  return [];\n}",
      py: "from typing import List\n\nclass Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2], hidden: false },
      { id: "t2", input: [[1], 1], expected: [1], hidden: false },
    ],
    hints: [
      "Count element frequencies with a hash table.",
      "Use a min-heap of size k or bucket sort by frequency.",
    ],
    xp: 90,
  },

  {
    slug: "clone-graph",
    algorithmSlug: "dfs",
    title: "Clone Graph",
    difficulty: "medium",
    statementMarkdown:
      "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.",
    constraints: [
      "The number of nodes in the graph is in range [0, 100].",
      "1 <= Node.val <= 100",
      "Graph has no repeated edges and no self-loops.",
    ],
    examples: [
      { input: "adjList = [[2,4],[1,3],[2,4],[1,3]]", output: "[[2,4],[1,3],[2,4],[1,3]]" },
    ],
    starterCode: {
      js: "function cloneGraph(node) {\n  // your code here\n}",
      ts: "function cloneGraph(node: _Node | null): _Node | null {\n  // your code here\n  return null;\n}",
      py: "class Solution:\n    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:\n        # your code here\n        pass",
    },
    tests: [
      {
        id: "t1",
        input: [
          [
            [2, 4],
            [1, 3],
            [2, 4],
            [1, 3],
          ],
        ],
        expected: [
          [2, 4],
          [1, 3],
          [2, 4],
          [1, 3],
        ],
        hidden: false,
      },
    ],
    hints: [
      "Use a map from original node to cloned node to prevent duplicate creations and infinite cycles during DFS.",
    ],
    xp: 90,
  },

  {
    slug: "number-of-connected-components",
    algorithmSlug: "union-find",
    title: "Number of Connected Components in an Undirected Graph",
    difficulty: "medium",
    statementMarkdown:
      "You have a graph of `n` nodes. You are given an integer `n` and an array `edges` where `edges[i] = [ai, bi]` indicates an undirected edge between `ai` and `bi`. Return the number of connected components in the graph.",
    constraints: [
      "1 <= n <= 2000",
      "0 <= edges.length <= 5000",
      "edges[i].length == 2",
      "0 <= ai <= bi < n",
    ],
    examples: [
      { input: "n = 5, edges = [[0,1],[1,2],[3,4]]", output: "2" },
      { input: "n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]", output: "1" },
    ],
    starterCode: {
      js: "function countComponents(n, edges) {\n  // your code here\n}",
      ts: "function countComponents(n: number, edges: number[][]): number {\n  // your code here\n  return n;\n}",
      py: "from typing import List\n\nclass Solution:\n    def countComponents(self, n: int, edges: List[List[int]]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      {
        id: "t1",
        input: [
          5,
          [
            [0, 1],
            [1, 2],
            [3, 4],
          ],
        ],
        expected: 2,
        hidden: false,
      },
      {
        id: "t2",
        input: [
          5,
          [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
          ],
        ],
        expected: 1,
        hidden: false,
      },
    ],
    hints: [
      "Initialize Union-Find with count = n.",
      "For each edge, union the two nodes; if they were in different sets, decrement count.",
    ],
    xp: 90,
  },

  {
    slug: "search-insert-position",
    algorithmSlug: "binary-search",
    title: "Search Insert Position",
    difficulty: "easy",
    oneLiner: "Find a target's index, or where it would be inserted to keep the array sorted.",
    estMinutes: 12,
    statementMarkdown:
      "Given a sorted array of distinct integers `nums` and a target value `target`, return the index if the target is found. If not, return the index where it would be if it were inserted in order.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^4 <= nums[i] <= 10^4",
      "nums contains distinct values sorted in ascending order",
      "-10^4 <= target <= 10^4",
    ],
    examples: [
      { input: "nums = [1,3,5,6], target = 5", output: "2", explanation: "5 is found at index 2." },
      {
        input: "nums = [1,3,5,6], target = 2",
        output: "1",
        explanation: "2 belongs between 1 and 3, so it would be inserted at index 1.",
      },
      {
        input: "nums = [1,3,5,6], target = 7",
        output: "4",
        explanation: "7 is larger than every element, so it goes at the end.",
      },
    ],
    starterCode: {
      js: "function searchInsert(nums, target) {\n  // your code here\n}",
      ts: "function searchInsert(nums: number[], target: number): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def searchInsert(self, nums: List[int], target: int) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[1, 3, 5, 6], 5], expected: 2, hidden: false },
      { id: "t2", input: [[1, 3, 5, 6], 2], expected: 1, hidden: false },
      { id: "t3", input: [[1, 3, 5, 6], 7], expected: 4, hidden: false },
      { id: "t4", input: [[1, 3, 5, 6], 0], expected: 0, hidden: false },
      { id: "t5", input: [[1], 1], expected: 0, hidden: true },
      { id: "t6", input: [[2, 4, 6, 8, 10], 9], expected: 4, hidden: true },
    ],
    hints: [
      "This is binary search with a different return value for the not-found case.",
      "Keep low = 0 and high = nums.length - 1 and narrow the window as usual.",
      "When the loop ends without a match, low is exactly the insertion point.",
    ],
    xp: 60,
  },

  {
    slug: "koko-eating-bananas",
    algorithmSlug: "binary-search",
    title: "Koko Eating Bananas",
    difficulty: "medium",
    oneLiner: "Binary search the answer: the smallest eating speed that finishes in time.",
    estMinutes: 22,
    statementMarkdown:
      "Koko loves to eat bananas. There are `n` piles of bananas, the i-th pile has `piles[i]` bananas. The guards have gone and will come back in `h` hours.\n\nKoko can decide her bananas-per-hour eating speed `k`. Each hour, she chooses a pile and eats `k` bananas from it. If the pile has fewer than `k` bananas, she eats all of them and will not eat any more bananas during that hour.\n\nReturn the minimum integer `k` such that she can eat all the bananas within `h` hours.",
    constraints: [
      "1 <= piles.length <= 10^4",
      "piles.length <= h <= 10^9",
      "1 <= piles[i] <= 10^9",
    ],
    examples: [
      {
        input: "piles = [3,6,7,11], h = 8",
        output: "4",
        explanation: "At k = 4 the hours are 1 + 2 + 2 + 3 = 8. At k = 3 they total 10, too slow.",
      },
      { input: "piles = [30,11,23,4,20], h = 5", output: "30" },
      { input: "piles = [30,11,23,4,20], h = 6", output: "23" },
    ],
    starterCode: {
      js: "function minEatingSpeed(piles, h) {\n  // your code here\n}",
      ts: "function minEatingSpeed(piles: number[], h: number): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def minEatingSpeed(self, piles: List[int], h: int) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[3, 6, 7, 11], 8], expected: 4, hidden: false },
      { id: "t2", input: [[30, 11, 23, 4, 20], 5], expected: 30, hidden: false },
      { id: "t3", input: [[30, 11, 23, 4, 20], 6], expected: 23, hidden: false },
      { id: "t4", input: [[312884470], 968709470], expected: 1, hidden: true },
      { id: "t5", input: [[1, 1, 1, 1], 4], expected: 1, hidden: true },
    ],
    hints: [
      "You are not searching the array — you are searching the range of possible speeds, 1 to max(piles).",
      "For a candidate speed k, the hours needed are the sum of ceil(pile / k) over all piles.",
      "If a speed finishes in time, record it and search lower; otherwise search higher.",
    ],
    xp: 100,
  },

  {
    slug: "best-time-to-buy-and-sell-stock",
    algorithmSlug: "sliding-window",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "easy",
    oneLiner: "Track the cheapest price so far and the best profit it could produce.",
    estMinutes: 14,
    statementMarkdown:
      "You are given an array `prices` where `prices[i]` is the price of a given stock on the i-th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.",
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation: "Prices only fall, so no transaction is profitable.",
      },
    ],
    starterCode: {
      js: "function maxProfit(prices) {\n  // your code here\n}",
      ts: "function maxProfit(prices: number[]): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[7, 1, 5, 3, 6, 4]], expected: 5, hidden: false },
      { id: "t2", input: [[7, 6, 4, 3, 1]], expected: 0, hidden: false },
      { id: "t3", input: [[1, 2]], expected: 1, hidden: false },
      { id: "t4", input: [[2]], expected: 0, hidden: true },
      { id: "t5", input: [[3, 3, 3, 3]], expected: 0, hidden: true },
      { id: "t6", input: [[2, 4, 1, 7]], expected: 6, hidden: true },
    ],
    hints: [
      "One pass is enough — you never need to compare every pair of days.",
      "Keep the minimum price seen so far as you sweep left to right.",
      "At each day, the best profit ending there is price - minSoFar; keep the largest.",
    ],
    xp: 60,
  },

  {
    slug: "valid-palindrome",
    algorithmSlug: "two-pointers",
    title: "Valid Palindrome",
    difficulty: "easy",
    oneLiner: "Walk inward from both ends, skipping anything that is not a letter or digit.",
    estMinutes: 12,
    statementMarkdown:
      "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
    constraints: ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters"],
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: "true",
        explanation:
          'After cleaning, s becomes "amanaplanacanalpanama", which reads the same backward.',
      },
      {
        input: 's = "race a car"',
        output: "false",
        explanation: 'After cleaning, s becomes "raceacar", which is not a palindrome.',
      },
      {
        input: 's = " "',
        output: "true",
        explanation:
          "After removing non-alphanumeric characters the string is empty, and an empty string is a palindrome.",
      },
    ],
    starterCode: {
      js: "function isPalindrome(s) {\n  // your code here\n}",
      ts: "function isPalindrome(s: string): boolean {\n  // your code here\n  return false;\n}",
      py: "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: ["A man, a plan, a canal: Panama"], expected: true, hidden: false },
      { id: "t2", input: ["race a car"], expected: false, hidden: false },
      { id: "t3", input: [" "], expected: true, hidden: false },
      { id: "t4", input: ["0P"], expected: false, hidden: true },
      { id: "t5", input: ["ab_a"], expected: true, hidden: true },
      { id: "t6", input: [".,"], expected: true, hidden: true },
    ],
    hints: [
      "You do not have to build a cleaned copy of the string — two indices can walk toward each other in place.",
      "When the left character is not alphanumeric, advance left; when the right one is not, retreat right.",
      "Compare the two characters case-insensitively; the moment they differ, the answer is false.",
    ],
    xp: 60,
  },

  {
    slug: "move-zeroes",
    algorithmSlug: "two-pointers",
    title: "Move Zeroes",
    difficulty: "easy",
    oneLiner: "A write pointer trails a read pointer, packing non-zero values to the front.",
    estMinutes: 10,
    statementMarkdown:
      "Given an integer array `nums`, move all `0`s to the end of it while maintaining the relative order of the non-zero elements.\n\nDo this in place without making a copy of the array, then return `nums`.",
    constraints: ["1 <= nums.length <= 10^4", "-2^31 <= nums[i] <= 2^31 - 1"],
    examples: [
      {
        input: "nums = [0,1,0,3,12]",
        output: "[1,3,12,0,0]",
        explanation:
          "The non-zero values keep their order 1, 3, 12 and the two zeroes are pushed to the back.",
      },
      {
        input: "nums = [0]",
        output: "[0]",
        explanation: "A single zero is already in its final position.",
      },
    ],
    starterCode: {
      js: "function moveZeroes(nums) {\n  // your code here\n}",
      ts: "function moveZeroes(nums: number[]): number[] {\n  // your code here\n  return nums;\n}",
      py: "from typing import List\n\nclass Solution:\n    def moveZeroes(self, nums: List[int]) -> List[int]:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0], hidden: false },
      { id: "t2", input: [[0]], expected: [0], hidden: false },
      { id: "t3", input: [[1, 2, 3]], expected: [1, 2, 3], hidden: false },
      { id: "t4", input: [[0, 0, 1]], expected: [1, 0, 0], hidden: true },
      { id: "t5", input: [[4, 0, 5, 0, 0, 6]], expected: [4, 5, 6, 0, 0, 0], hidden: true },
      { id: "t6", input: [[0, 0, 0]], expected: [0, 0, 0], hidden: true },
    ],
    hints: [
      "Sorting or splicing works but is slower than necessary — one pass is enough.",
      "Keep a write index starting at 0. Scan with a read index and copy every non-zero value to the write index, then advance it.",
      "After the scan, every slot from the write index to the end must be filled with 0.",
    ],
    xp: 60,
  },

  {
    slug: "remove-duplicates-from-sorted-array",
    algorithmSlug: "two-pointers",
    title: "Remove Duplicates from Sorted Array",
    difficulty: "easy",
    oneLiner:
      "Because the array is sorted, duplicates are always neighbours — overwrite them as you go.",
    estMinutes: 12,
    statementMarkdown:
      "Given an integer array `nums` sorted in non-decreasing order, remove the duplicates in place so that each unique element appears only once. The relative order of the elements must be kept the same.\n\nReturn `k`, the number of unique elements. The first `k` slots of `nums` must hold those unique elements; whatever is left beyond `k` does not matter.\n\nYou must do this with O(1) extra memory.",
    constraints: [
      "1 <= nums.length <= 3 * 10^4",
      "-100 <= nums[i] <= 100",
      "nums is sorted in non-decreasing order",
    ],
    examples: [
      {
        input: "nums = [1,1,2]",
        output: "2",
        explanation: "The unique elements are 1 and 2, so k = 2 and nums starts with [1,2].",
      },
      {
        input: "nums = [0,0,1,1,1,2,2,3,3,4]",
        output: "5",
        explanation: "The unique elements are 0, 1, 2, 3 and 4, so k = 5.",
      },
    ],
    starterCode: {
      js: "function removeDuplicates(nums) {\n  // your code here\n}",
      ts: "function removeDuplicates(nums: number[]): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def removeDuplicates(self, nums: List[int]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[1, 1, 2]], expected: 2, hidden: false },
      { id: "t2", input: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expected: 5, hidden: false },
      { id: "t3", input: [[1]], expected: 1, hidden: false },
      { id: "t4", input: [[1, 2, 3, 4]], expected: 4, hidden: true },
      { id: "t5", input: [[2, 2, 2, 2]], expected: 1, hidden: true },
      { id: "t6", input: [[-3, -1, -1, 0, 0, 0, 5]], expected: 4, hidden: true },
    ],
    hints: [
      "Sorted input is the whole trick: equal values are always adjacent, so you never need a set.",
      "Keep a write index k starting at 1, since the first element is always unique.",
      "Scan from index 1. When nums[i] differs from nums[k - 1], write it at nums[k] and increment k.",
    ],
    xp: 60,
  },

  {
    slug: "three-sum",
    algorithmSlug: "two-pointers",
    title: "3Sum",
    difficulty: "medium",
    oneLiner: "Sort first, fix one number, then close in on the other two from both ends.",
    estMinutes: 25,
    statementMarkdown:
      "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nThe solution set must not contain duplicate triplets.\n\nTo keep the answer comparable, sort each triplet in non-decreasing order and sort the list of triplets in non-decreasing lexicographic order.",
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    examples: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
        explanation:
          "Both triplets sum to 0. The triplet [-1,-1,2] appears only once even though -1 occurs twice.",
      },
      {
        input: "nums = [0,1,1]",
        output: "[]",
        explanation: "The only possible triplet sums to 2, so there is no answer.",
      },
      {
        input: "nums = [0,0,0]",
        output: "[[0,0,0]]",
        explanation: "The three zeroes are distinct positions and sum to 0.",
      },
    ],
    starterCode: {
      js: "function threeSum(nums) {\n  // your code here\n}",
      ts: "function threeSum(nums: number[]): number[][] {\n  // your code here\n  return [];\n}",
      py: "from typing import List\n\nclass Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        # your code here\n        pass",
    },
    tests: [
      {
        id: "t1",
        input: [[-1, 0, 1, 2, -1, -4]],
        expected: [
          [-1, -1, 2],
          [-1, 0, 1],
        ],
        hidden: false,
      },
      { id: "t2", input: [[0, 1, 1]], expected: [], hidden: false },
      { id: "t3", input: [[0, 0, 0]], expected: [[0, 0, 0]], hidden: false },
      {
        id: "t4",
        input: [[-2, 0, 1, 1, 2]],
        expected: [
          [-2, 0, 2],
          [-2, 1, 1],
        ],
        hidden: true,
      },
      { id: "t5", input: [[1, 2, -2, -1]], expected: [], hidden: true },
      { id: "t6", input: [[-1, 0, 1, 0]], expected: [[-1, 0, 1]], hidden: true },
      {
        id: "t7",
        input: [[3, 0, -2, -1, 1, 2]],
        expected: [
          [-2, -1, 3],
          [-2, 0, 2],
          [-1, 0, 1],
        ],
        hidden: true,
      },
    ],
    hints: [
      "Sort the array first. Sorting is what makes both the two-pointer sweep and the duplicate handling possible.",
      "Fix nums[i] as the first number, then two-pointer over the rest: if the sum is too small move left up, if too large move right down.",
      "Skip a value of nums[i] identical to the previous one, and after recording a hit skip identical values at both pointers — that is what prevents duplicate triplets.",
    ],
    xp: 100,
  },

  {
    slug: "diameter-of-binary-tree",
    algorithmSlug: "bst-traversals",
    title: "Diameter of Binary Tree",
    difficulty: "easy",
    oneLiner: "One post-order pass returns height upward while quietly tracking the widest path.",
    estMinutes: 18,
    statementMarkdown:
      "Given a binary tree, return the length of its diameter — the number of edges on the longest path between any two nodes. That path may or may not pass through the root.\n\nThe tree is given as a level-order array in which `null` marks a missing child, and the children of a `null` are not listed. For example `[1,2,3,null,null,4]` is a root `1` with children `2` and `3`, where `3` has a left child `4`.",
    constraints: [
      "The number of nodes in the tree is in range [1, 10^4].",
      "-100 <= Node.val <= 100",
    ],
    examples: [
      {
        input: "root = [1,2,3,4,5]",
        output: "3",
        explanation: "The longest path is 4 - 2 - 1 - 3, which has 3 edges.",
      },
      {
        input: "root = [1,2]",
        output: "1",
        explanation: "The only path runs from the root to its single child.",
      },
    ],
    starterCode: {
      js: "function diameterOfBinaryTree(root) {\n  // root is a level-order array, e.g. [1,2,3,null,null,4]\n  // your code here\n}",
      ts: "function diameterOfBinaryTree(root: (number | null)[]): number {\n  // root is a level-order array, e.g. [1,2,3,null,null,4]\n  // your code here\n  return 0;\n}",
      py: "from typing import List, Optional\n\nclass Solution:\n    def diameterOfBinaryTree(self, root: List[Optional[int]]) -> int:\n        # root is a level-order array, e.g. [1,2,3,None,None,4]\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[1, 2, 3, 4, 5]], expected: 3, hidden: false },
      { id: "t2", input: [[1, 2]], expected: 1, hidden: false },
      { id: "t3", input: [[1]], expected: 0, hidden: false },
      { id: "t4", input: [[1, 2, 3, 4, 5, null, null, 6, 7]], expected: 4, hidden: true },
      { id: "t5", input: [[1, null, 2, null, 3, null, 4]], expected: 3, hidden: true },
      { id: "t6", input: [[1, 2, 3, null, null, 4, 5]], expected: 3, hidden: true },
    ],
    hints: [
      "Rebuild the tree from the level-order array first: walk the array with a queue, attaching each non-null value as the next pending child.",
      "The diameter through a given node is height(left) + height(right), counted in edges.",
      "Write one recursion that returns the height of a subtree and, as a side effect, updates the best diameter seen — that keeps it O(n) instead of O(n^2).",
    ],
    xp: 70,
  },

  {
    slug: "binary-tree-right-side-view",
    algorithmSlug: "level-order",
    title: "Binary Tree Right Side View",
    difficulty: "medium",
    oneLiner: "Sweep level by level and keep only the last node you meet on each row.",
    estMinutes: 20,
    statementMarkdown:
      "Given a binary tree, imagine yourself standing on its right side. Return the values of the nodes you can see, ordered from top to bottom.\n\nThe tree is given as a level-order array in which `null` marks a missing child, and the children of a `null` are not listed. An empty array means an empty tree, for which the answer is `[]`.",
    constraints: [
      "The number of nodes in the tree is in range [0, 100].",
      "-100 <= Node.val <= 100",
    ],
    examples: [
      {
        input: "root = [1,2,3,null,5,null,4]",
        output: "[1,3,4]",
        explanation: "Level 1 shows 1, level 2 shows 3, level 3 shows 4.",
      },
      {
        input: "root = [1,null,3]",
        output: "[1,3]",
        explanation: "Only the right spine is visible.",
      },
      {
        input: "root = []",
        output: "[]",
        explanation: "There is nothing to see in an empty tree.",
      },
    ],
    starterCode: {
      js: "function rightSideView(root) {\n  // root is a level-order array, e.g. [1,2,3,null,5,null,4]\n  // your code here\n}",
      ts: "function rightSideView(root: (number | null)[]): number[] {\n  // root is a level-order array, e.g. [1,2,3,null,5,null,4]\n  // your code here\n  return [];\n}",
      py: "from typing import List, Optional\n\nclass Solution:\n    def rightSideView(self, root: List[Optional[int]]) -> List[int]:\n        # root is a level-order array, e.g. [1,2,3,None,5,None,4]\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[1, 2, 3, null, 5, null, 4]], expected: [1, 3, 4], hidden: false },
      { id: "t2", input: [[1, null, 3]], expected: [1, 3], hidden: false },
      { id: "t3", input: [[]], expected: [], hidden: false },
      { id: "t4", input: [[1, 2, 3, 4]], expected: [1, 3, 4], hidden: true },
      { id: "t5", input: [[1, 2]], expected: [1, 2], hidden: true },
      { id: "t6", input: [[1, 2, 3, null, null, 4, 5]], expected: [1, 3, 5], hidden: true },
    ],
    hints: [
      "Rebuild the tree from the level-order array with a queue, then run a breadth-first traversal over it.",
      "Process one whole level at a time: record how many nodes are in the queue, then pop exactly that many.",
      "The visible node is the last one popped on each level — not necessarily a right child, as a level whose right subtree is empty still shows its leftmost node.",
    ],
    xp: 90,
  },

  {
    slug: "climbing-stairs",
    algorithmSlug: "dp-1d",
    title: "Climbing Stairs",
    difficulty: "easy",
    oneLiner: "The ways to reach a step are the ways to reach the two steps below it.",
    estMinutes: 12,
    statementMarkdown:
      "You are climbing a staircase that takes `n` steps to reach the top.\n\nEach time you can climb either 1 or 2 steps. In how many distinct ways can you climb to the top?",
    constraints: ["1 <= n <= 45"],
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "Either 1 step + 1 step, or a single 2-step stride.",
      },
      {
        input: "n = 3",
        output: "3",
        explanation: "1+1+1, 1+2, and 2+1.",
      },
    ],
    starterCode: {
      js: "function climbStairs(n) {\n  // your code here\n}",
      ts: "function climbStairs(n: number): number {\n  // your code here\n  return 0;\n}",
      py: "class Solution:\n    def climbStairs(self, n: int) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [2], expected: 2, hidden: false },
      { id: "t2", input: [3], expected: 3, hidden: false },
      { id: "t3", input: [1], expected: 1, hidden: false },
      { id: "t4", input: [5], expected: 8, hidden: true },
      { id: "t5", input: [10], expected: 89, hidden: true },
      { id: "t6", input: [45], expected: 1836311903, hidden: true },
    ],
    hints: [
      "The last move onto step n came either from step n-1 or from step n-2, and those two sets of routes never overlap.",
      "So ways(n) = ways(n-1) + ways(n-2), with ways(1) = 1 and ways(2) = 2.",
      "Plain recursion recomputes the same steps exponentially — iterate upward keeping only the last two values.",
    ],
    xp: 60,
  },

  {
    slug: "house-robber",
    algorithmSlug: "dp-1d",
    title: "House Robber",
    difficulty: "medium",
    oneLiner:
      "At each house, choose the better of skipping it or taking it plus the best two back.",
    estMinutes: 18,
    statementMarkdown:
      "You are a robber planning to rob houses along a street, where `nums[i]` is the money stashed in house `i`.\n\nAdjacent houses have connected security systems, so you cannot rob two directly neighbouring houses on the same night.\n\nReturn the maximum amount of money you can rob tonight without alerting the police.",
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
    examples: [
      {
        input: "nums = [1,2,3,1]",
        output: "4",
        explanation: "Rob house 1 (money = 1) and house 3 (money = 3) for a total of 4.",
      },
      {
        input: "nums = [2,7,9,3,1]",
        output: "12",
        explanation: "Rob houses 1, 3 and 5 for 2 + 9 + 1 = 12.",
      },
    ],
    starterCode: {
      js: "function rob(nums) {\n  // your code here\n}",
      ts: "function rob(nums: number[]): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def rob(self, nums: List[int]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[1, 2, 3, 1]], expected: 4, hidden: false },
      { id: "t2", input: [[2, 7, 9, 3, 1]], expected: 12, hidden: false },
      { id: "t3", input: [[5]], expected: 5, hidden: false },
      { id: "t4", input: [[2, 1, 1, 2]], expected: 4, hidden: true },
      { id: "t5", input: [[0, 0, 0]], expected: 0, hidden: true },
      { id: "t6", input: [[100, 1, 1, 100]], expected: 200, hidden: true },
    ],
    hints: [
      "Greedily taking every other house fails — [2,1,1,2] shows why the choice has to be made per house.",
      "Define best(i) as the most money obtainable from the first i houses: best(i) = max(best(i-1), best(i-2) + nums[i]).",
      "Only two previous values are ever needed, so the whole table collapses to two variables.",
    ],
    xp: 90,
  },

  {
    slug: "coin-change",
    algorithmSlug: "dp-1d",
    title: "Coin Change",
    difficulty: "medium",
    oneLiner: "Build the fewest-coins answer for every amount up to the target, smallest first.",
    estMinutes: 25,
    statementMarkdown:
      "You are given an integer array `coins` representing coin denominations, and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins needed to make up that amount. If the amount cannot be made up by any combination of the coins, return `-1`.\n\nYou have an infinite supply of each kind of coin.",
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    examples: [
      {
        input: "coins = [1,2,5], amount = 11",
        output: "3",
        explanation: "11 = 5 + 5 + 1.",
      },
      {
        input: "coins = [2], amount = 3",
        output: "-1",
        explanation: "No combination of 2s makes an odd amount.",
      },
      {
        input: "coins = [1], amount = 0",
        output: "0",
        explanation: "Zero coins are needed to make nothing.",
      },
    ],
    starterCode: {
      js: "function coinChange(coins, amount) {\n  // your code here\n}",
      ts: "function coinChange(coins: number[], amount: number): number {\n  // your code here\n  return -1;\n}",
      py: "from typing import List\n\nclass Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[1, 2, 5], 11], expected: 3, hidden: false },
      { id: "t2", input: [[2], 3], expected: -1, hidden: false },
      { id: "t3", input: [[1], 0], expected: 0, hidden: false },
      { id: "t4", input: [[1, 3, 4], 6], expected: 2, hidden: true },
      { id: "t5", input: [[2, 5, 10, 1], 27], expected: 4, hidden: true },
      { id: "t6", input: [[186, 419, 83, 408], 6249], expected: 20, hidden: true },
    ],
    hints: [
      "Taking the largest coin first is wrong: with coins [1,3,4] and amount 6, greedy gives 4+1+1 but 3+3 is better.",
      "Let best[a] be the fewest coins for amount a. Then best[a] = 1 + min(best[a - c]) over every coin c that fits.",
      "Fill best[0..amount] upward, seeding best[0] = 0 and everything else with a sentinel that means unreachable — if the sentinel survives at the end, return -1.",
    ],
    xp: 100,
  },

  {
    slug: "longest-increasing-subsequence",
    algorithmSlug: "dp-1d",
    title: "Longest Increasing Subsequence",
    difficulty: "medium",
    oneLiner: "For each element, extend the best increasing run that could legally end before it.",
    estMinutes: 25,
    statementMarkdown:
      "Given an integer array `nums`, return the length of the longest strictly increasing subsequence.\n\nA subsequence is derived from the array by deleting zero or more elements without changing the order of the remaining ones.",
    constraints: ["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"],
    examples: [
      {
        input: "nums = [10,9,2,5,3,7,101,18]",
        output: "4",
        explanation: "One longest increasing subsequence is [2,3,7,101].",
      },
      {
        input: "nums = [7,7,7,7,7]",
        output: "1",
        explanation: "Strictly increasing means equal values cannot be chained.",
      },
    ],
    starterCode: {
      js: "function lengthOfLIS(nums) {\n  // your code here\n}",
      ts: "function lengthOfLIS(nums: number[]): number {\n  // your code here\n  return 0;\n}",
      py: "from typing import List\n\nclass Solution:\n    def lengthOfLIS(self, nums: List[int]) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4, hidden: false },
      { id: "t2", input: [[0, 1, 0, 3, 2, 3]], expected: 4, hidden: false },
      { id: "t3", input: [[7, 7, 7, 7, 7]], expected: 1, hidden: false },
      { id: "t4", input: [[1]], expected: 1, hidden: true },
      { id: "t5", input: [[5, 4, 3, 2, 1]], expected: 1, hidden: true },
      { id: "t6", input: [[4, 10, 4, 3, 8, 9]], expected: 3, hidden: true },
    ],
    hints: [
      "Let len[i] be the length of the longest increasing subsequence that ends exactly at index i. Every len[i] starts at 1.",
      "For each i, look back at every j < i with nums[j] < nums[i] and take len[i] = max(len[i], len[j] + 1).",
      "The answer is the maximum over the whole len array, not len at the last index — the best run may end anywhere.",
    ],
    xp: 100,
  },

  {
    slug: "unique-paths",
    algorithmSlug: "dp-2d",
    title: "Unique Paths",
    difficulty: "medium",
    oneLiner: "Each cell's path count is the sum of the cell above and the cell to its left.",
    estMinutes: 18,
    statementMarkdown:
      "A robot sits in the top-left corner of an `m x n` grid. It can only move either down or right at any point in time, and it is trying to reach the bottom-right corner.\n\nReturn the number of distinct paths it can take.",
    constraints: ["1 <= m, n <= 100"],
    examples: [
      {
        input: "m = 3, n = 7",
        output: "28",
      },
      {
        input: "m = 3, n = 2",
        output: "3",
        explanation: "Down-Down-Right, Down-Right-Down, and Right-Down-Down.",
      },
    ],
    starterCode: {
      js: "function uniquePaths(m, n) {\n  // your code here\n}",
      ts: "function uniquePaths(m: number, n: number): number {\n  // your code here\n  return 0;\n}",
      py: "class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: [3, 7], expected: 28, hidden: false },
      { id: "t2", input: [3, 2], expected: 3, hidden: false },
      { id: "t3", input: [1, 1], expected: 1, hidden: false },
      { id: "t4", input: [1, 10], expected: 1, hidden: true },
      { id: "t5", input: [7, 3], expected: 28, hidden: true },
      { id: "t6", input: [10, 10], expected: 48620, hidden: true },
    ],
    hints: [
      "The only ways into a cell are from directly above or directly to the left, so paths[r][c] = paths[r-1][c] + paths[r][c-1].",
      "Every cell in the first row and first column has exactly one path, which seeds the table.",
      "One row of the table is enough: update it left to right in place, since the value already there is the cell above.",
    ],
    xp: 90,
  },

  {
    slug: "longest-common-subsequence",
    algorithmSlug: "dp-2d",
    title: "Longest Common Subsequence",
    difficulty: "medium",
    oneLiner: "Compare two strings cell by cell: matching characters extend the diagonal.",
    estMinutes: 28,
    statementMarkdown:
      "Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return `0`.\n\nA subsequence of a string is formed by deleting some or no characters without changing the order of the rest. A common subsequence is one that appears in both strings.",
    constraints: [
      "1 <= text1.length, text2.length <= 1000",
      "text1 and text2 consist of lowercase English characters",
    ],
    examples: [
      {
        input: 'text1 = "abcde", text2 = "ace"',
        output: "3",
        explanation: 'The longest common subsequence is "ace".',
      },
      {
        input: 'text1 = "abc", text2 = "def"',
        output: "0",
        explanation: "The two strings share no characters at all.",
      },
    ],
    starterCode: {
      js: "function longestCommonSubsequence(text1, text2) {\n  // your code here\n}",
      ts: "function longestCommonSubsequence(text1: string, text2: string): number {\n  // your code here\n  return 0;\n}",
      py: "class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: ["abcde", "ace"], expected: 3, hidden: false },
      { id: "t2", input: ["abc", "abc"], expected: 3, hidden: false },
      { id: "t3", input: ["abc", "def"], expected: 0, hidden: false },
      { id: "t4", input: ["bsbininm", "jmjkbkjkv"], expected: 1, hidden: true },
      { id: "t5", input: ["oxcpqrsvwf", "shmtulqrypy"], expected: 2, hidden: true },
      { id: "t6", input: ["a", "a"], expected: 1, hidden: true },
    ],
    hints: [
      "Build a table where lcs[i][j] is the answer for the first i characters of text1 and the first j of text2.",
      "If the characters match, lcs[i][j] = lcs[i-1][j-1] + 1 — the match extends the diagonal.",
      "If they do not match, you must drop one character or the other, so take max(lcs[i-1][j], lcs[i][j-1]).",
    ],
    xp: 100,
  },

  {
    slug: "edit-distance",
    algorithmSlug: "dp-2d",
    title: "Edit Distance",
    difficulty: "hard",
    oneLiner: "Insert, delete, or replace — each cell takes the cheapest of its three neighbours.",
    estMinutes: 35,
    statementMarkdown:
      "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` into `word2`.\n\nYou may insert a character, delete a character, or replace a character, each at a cost of one operation.",
    constraints: [
      "0 <= word1.length, word2.length <= 500",
      "word1 and word2 consist of lowercase English letters",
    ],
    examples: [
      {
        input: 'word1 = "horse", word2 = "ros"',
        output: "3",
        explanation: "horse -> rorse (replace h with r) -> rose (delete r) -> ros (delete e).",
      },
      {
        input: 'word1 = "intention", word2 = "execution"',
        output: "5",
      },
    ],
    starterCode: {
      js: "function minDistance(word1, word2) {\n  // your code here\n}",
      ts: "function minDistance(word1: string, word2: string): number {\n  // your code here\n  return 0;\n}",
      py: "class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        # your code here\n        pass",
    },
    tests: [
      { id: "t1", input: ["horse", "ros"], expected: 3, hidden: false },
      { id: "t2", input: ["intention", "execution"], expected: 5, hidden: false },
      { id: "t3", input: ["", "abc"], expected: 3, hidden: false },
      { id: "t4", input: ["abc", "abc"], expected: 0, hidden: true },
      { id: "t5", input: ["sunday", "saturday"], expected: 3, hidden: true },
      { id: "t6", input: ["plasma", "altruism"], expected: 6, hidden: true },
    ],
    hints: [
      "Let dist[i][j] be the cost of turning the first i characters of word1 into the first j of word2.",
      "Seed the edges: turning a prefix into an empty string costs one delete per character, and the reverse costs one insert per character.",
      "If the characters match the cost carries over from dist[i-1][j-1]; otherwise it is 1 + min(delete = dist[i-1][j], insert = dist[i][j-1], replace = dist[i-1][j-1]).",
    ],
    xp: 140,
  },
];

export function getProblem(slug: string): Problem | undefined {
  return problems.find((p) => p.slug === slug);
}

export function getProblems(): Problem[] {
  return problems;
}

export function getProblemsByAlgorithm(algorithmSlug: string): Problem[] {
  return problems.filter((p) => p.algorithmSlug === algorithmSlug);
}

export async function fetchProblem(slug: string): Promise<Problem | null> {
  return getProblem(slug) ?? null;
}

export async function fetchProblems(): Promise<Problem[]> {
  return getProblems();
}
