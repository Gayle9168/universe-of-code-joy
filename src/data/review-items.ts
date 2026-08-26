import type { ReviewItem } from "./types";

/**
 * Curated active-recall review prompts.
 *
 * Review is retrieval, not replay: every prompt asks the learner to reconstruct
 * a decision from memory, and each distractor encodes a real misconception seen
 * in the lesson stages (halving because the array is small, moving the wrong
 * boundary, off-by-one midpoints, treating an empty range as a failure of the
 * loop rather than of the candidate set).
 */
export const reviewItems: ReviewItem[] = [
  {
    id: "bs-review-concept",
    algorithmSlug: "binary-search",
    kind: "concept",
    prompt: "Why can binary search discard half of the current range?",
    given: [],
    choices: [
      {
        id: "a",
        label: "Because the values are sorted, one side provably cannot hold the target",
      },
      {
        id: "b",
        label: "Because mid is always close to the target",
        misconception:
          "mid is only the middle of the range, not an estimate of where the target lives. The discarded half is safe because of order, not proximity.",
      },
      {
        id: "c",
        label: "Because the array is small enough to halve",
        misconception:
          "Size never justifies elimination. Halving a small unsorted array would still skip the answer.",
      },
      {
        id: "d",
        label: "Because every value in the array is unique",
        misconception:
          "Duplicates are allowed. What matters is that values never decrease as the index grows.",
      },
    ],
    answerId: "a",
    explanation:
      "Sorted order turns one comparison into a proof: everything before a value too small, or after a value too large, cannot possibly equal the target.",
    hint: "Ask what property of the input the comparison is allowed to rely on.",
  },
  {
    id: "bs-review-boundary",
    algorithmSlug: "binary-search",
    kind: "boundary",
    prompt: "Which boundary changes next?",
    given: ["low = 0", "mid = 4", "high = 9", "arr[mid] = 16", "target = 23"],
    choices: [
      { id: "a", label: "low = mid + 1" },
      {
        id: "b",
        label: "high = mid - 1",
        misconception:
          "arr[mid] is below the target, so the target can only be to the right. Moving high would throw away the half that still contains it.",
      },
      {
        id: "c",
        label: "low = mid",
        misconception:
          "mid has already been compared and rejected. Keeping it in the range lets the same index be tested forever.",
      },
      {
        id: "d",
        label: "high = mid",
        misconception:
          "The surviving side is the right one, so high stays where it is; only low advances.",
      },
    ],
    answerId: "a",
    explanation:
      "16 < 23, so indices 0…4 are all too small. low jumps past mid to 5 and the range becomes 5…9.",
    hint: "Compare arr[mid] with the target first, then ask which side survives.",
  },
  {
    id: "bs-review-midpoint",
    algorithmSlug: "binary-search",
    kind: "midpoint",
    prompt: "What is mid for this range?",
    given: ["low = 5", "high = 8"],
    choices: [
      { id: "a", label: "6 — floor((5 + 8) / 2)" },
      {
        id: "b",
        label: "7 — round((5 + 8) / 2)",
        misconception:
          "The midpoint is floored, not rounded. 13 / 2 is 6.5, and floor takes it to 6.",
      },
      {
        id: "c",
        label: "4 — floor((8 - 5) / 2)",
        misconception: "Halving the width gives an offset, not an index. Add it to low: 5 + 1 = 6.",
      },
      {
        id: "d",
        label: "6.5 — (5 + 8) / 2",
        misconception: "An index must be an integer, so the division is floored to 6.",
      },
    ],
    answerId: "a",
    explanation: "mid = low + floor((high - low) / 2) = 5 + 1 = 6, the same as floor(13 / 2).",
    hint: "The midpoint is an index, so the division has to land on a whole number.",
  },
  {
    id: "bs-review-termination",
    algorithmSlug: "binary-search",
    kind: "termination",
    prompt: "What does this state mean?",
    given: ["low = 6", "high = 5"],
    choices: [
      { id: "a", label: "The candidate range is empty, so the target is not present" },
      {
        id: "b",
        label: "The loop overshot and should back up one step",
        misconception:
          "Nothing overshot. Crossed boundaries are the intended stop condition, not a bug to undo.",
      },
      {
        id: "c",
        label: "mid should now be checked one more time",
        misconception:
          "There is no index left between the boundaries, so there is nothing left to check.",
      },
      {
        id: "d",
        label: "The array was not sorted",
        misconception:
          "Crossed boundaries happen on perfectly sorted input whenever the target is absent.",
      },
    ],
    answerId: "a",
    explanation:
      "low > high means every index has been proved impossible. The search ends and reports absence.",
    hint: "Count how many indices satisfy low ≤ i ≤ high.",
  },
  {
    id: "bs-review-code",
    algorithmSlug: "binary-search",
    kind: "code",
    prompt: "Which statement completes the branch: if (nums[mid] < target) { ___ }",
    given: [
      "while (low <= high) {",
      "  mid = low + ((high - low) >> 1);",
      "  if (nums[mid] < target) { ___ }",
    ],
    choices: [
      { id: "a", label: "low = mid + 1;" },
      {
        id: "b",
        label: "high = mid - 1;",
        misconception:
          "That is the branch for nums[mid] > target. Here mid is too small, so the left side is the impossible one.",
      },
      {
        id: "c",
        label: "low = mid;",
        misconception:
          "Leaving mid inside the range means the loop can recompute the same mid and never terminate.",
      },
      {
        id: "d",
        label: "return mid;",
        misconception: "Returning is only correct on equality, which this branch has ruled out.",
      },
    ],
    answerId: "a",
    explanation:
      "A value below the target rules out mid and everything left of it, so low moves to mid + 1 and the range strictly shrinks.",
    hint: "Each branch must remove at least one index, including mid itself.",
  },
  {
    id: "bs-review-pattern",
    algorithmSlug: "binary-search",
    kind: "pattern",
    prompt: "What makes Search Insert Position solvable with this strategy?",
    given: [],
    choices: [
      {
        id: "a",
        label: "The candidate positions are ordered, so half of them can be eliminated per test",
      },
      {
        id: "b",
        label: "The answer is always near the middle of the array",
        misconception:
          "The insertion point can be at either end. Elimination comes from order, not from where the answer tends to sit.",
      },
      {
        id: "c",
        label: "The array is short, so any scan is fast enough",
        misconception:
          "Input size is not the property being exploited; a linear scan would work but would not be the same technique.",
      },
      {
        id: "d",
        label: "Every value in the array is distinct",
        misconception:
          "Distinctness is not required. A monotonic ordering of candidate positions is.",
      },
    ],
    answerId: "a",
    explanation:
      "Transfer works whenever the candidate answers form an ordered space and one test can prove a whole side impossible — here, positions left or right of mid.",
    hint: "Ask what the search space is: values, or positions?",
  },
];
