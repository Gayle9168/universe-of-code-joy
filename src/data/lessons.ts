import type { Lesson } from "./types";

export const lessons: Lesson[] = [
  {
    slug: "binary-search",
    algorithmSlug: "binary-search",
    title: "Mastering Binary Search",
    estMinutes: 15,
    xp: 100,
    sections: [
      {
        id: "intro",
        heading: "Why Binary Search?",
        markdown:
          "Imagine looking up a word in a physical dictionary. You would not start from page one and read every word — you would flip to the middle, decide whether your word comes before or after, and repeat. Binary search formalizes this intuition for sorted arrays, cutting the search space in half at every step.",
      },
      {
        id: "invariant",
        heading: "The Core Invariant",
        markdown:
          "Binary search maintains two pointers, `low` and `high`, that bound the region where the target could still be. At each step we compute `mid = low + Math.floor((high - low) / 2)` (avoiding overflow) and compare `arr[mid]` to the target. If it matches, we are done. If the target is smaller, we discard the right half by setting `high = mid - 1`; otherwise we discard the left half with `low = mid + 1`.",
        visualStep: 1,
      },
      {
        id: "complexity",
        heading: "Why O(log n)?",
        markdown:
          "Each comparison eliminates half of the remaining elements. Starting with n elements, after k halvings we have n / 2^k elements left. The search ends when this reaches 1, so k = log2(n). This logarithmic growth is why binary search scales beautifully — searching a billion sorted items takes at most about 30 comparisons.",
        visualStep: 2,
      },
      {
        id: "variants",
        heading: "Common Variants",
        markdown:
          'Beyond exact-match search, binary search underlies "lower bound" (first index where value >= target) and "upper bound" (first index where value > target) searches, which are essential for range queries. It also generalizes to "search on the answer" problems, where you binary search over a monotonic predicate rather than an array index.',
      },
      {
        id: "pitfalls",
        heading: "Pitfalls to Avoid",
        markdown:
          "The classic bug is computing `mid = (low + high) / 2`, which can overflow in languages with fixed-size integers — prefer `low + (high - low) / 2`. Another common mistake is an incorrect loop condition (`low < high` vs `low <= high`), which can cause infinite loops or missed elements. Always trace through a 1-element and 2-element array by hand to validate your bounds.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "What is the time complexity of binary search on a sorted array of n elements?",
        options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        answerIndex: 1,
        explanation: "Binary search halves the search space each iteration, giving O(log n) time.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt: "Binary search can be applied directly to an unsorted array.",
        options: ["True", "False"],
        answerIndex: 1,
        explanation:
          "The array must be sorted for binary search comparisons to correctly narrow the search space.",
      },
      {
        id: "q3",
        kind: "predict-step",
        prompt:
          "Given sorted array [2, 4, 6, 8, 10, 12] searching for 10, what is `mid` on the first iteration (0-indexed, low=0, high=5)?",
        options: [
          "Index 2 (value 6)",
          "Index 3 (value 8)",
          "Index 5 (value 12)",
          "Index 0 (value 2)",
        ],
        answerIndex: 0,
        explanation: "mid = 0 + floor((5-0)/2) = 2, which holds value 6.",
      },
      {
        id: "q4",
        kind: "mcq",
        prompt:
          "Why is `low + Math.floor((high - low) / 2)` preferred over `Math.floor((low + high) / 2)`?",
        options: [
          "It is faster to compute",
          "It avoids potential integer overflow for large indices",
          "It changes the algorithm complexity",
          "It works on unsorted arrays",
        ],
        answerIndex: 1,
        explanation:
          "Adding low and high directly can overflow in fixed-width integer languages; the alternative avoids this.",
      },
    ],
  },
  {
    slug: "linear-search",
    algorithmSlug: "linear-search",
    title: "Linear Search and Brute Force Fundamentals",
    estMinutes: 10,
    xp: 60,
    sections: [
      {
        id: "intro",
        heading: "Sequential Scanning",
        markdown:
          "Linear search inspects every element in a sequence one by one from left to right until the target value is found or the collection is exhausted. It represents the baseline brute-force approach against which all specialized search algorithms are compared.",
      },
      {
        id: "mechanics",
        heading: "When to Use Linear Search",
        markdown:
          "Linear search requires zero preconditions: the data does not need to be sorted, indexed, or stored in contiguous memory. It is ideal for small datasets (n < 50), unsorted streams, and singly linked lists where random access is impossible.",
      },
      {
        id: "complexity",
        heading: "Complexity Breakdown",
        markdown:
          "Best case is O(1) when the target is at index 0. Worst and average cases are O(n), requiring on average n/2 comparisons. Space complexity is O(1) as no auxiliary structures are needed.",
      },
      {
        id: "optimizations",
        heading: "Sentinel and Move-to-Front Optimizations",
        markdown:
          "A sentinel element placed at the array end avoids boundary checks inside the inner loop. In dynamic datasets, moving accessed elements toward the front (Move-to-Front heuristic) speeds up repeated lookups of popular items.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "What is the worst-case time complexity of linear search on an array of length n?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        answerIndex: 2,
        explanation:
          "In the worst case, the target is at the last index or absent, requiring n checks.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt: "Linear search requires the input array to be sorted beforehand.",
        options: ["True", "False"],
        answerIndex: 1,
        explanation:
          "Linear search works on completely unsorted collections without any prior ordering.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt: "Under what condition does linear search achieve O(1) best-case performance?",
        options: [
          "When the array is sorted",
          "When the target is the very first element checked",
          "When the array size is a power of two",
          "When using binary representation",
        ],
        answerIndex: 1,
        explanation:
          "If the first inspected element matches the target, the search terminates in 1 step.",
      },
      {
        id: "q4",
        kind: "true-false",
        prompt:
          "Linear search can be performed directly on a singly linked list without random access.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "Because linear search only requires traversing next pointers sequentially, it operates naturally on linked lists.",
      },
    ],
  },
  {
    slug: "bubble-sort",
    algorithmSlug: "bubble-sort",
    title: "Bubble Sort: Pairwise Swapping and Inversions",
    estMinutes: 12,
    xp: 60,
    sections: [
      {
        id: "intro",
        heading: "Floating Elements by Comparison",
        markdown:
          "Bubble sort repeatedly steps through an array, compares adjacent pairs, and swaps them if they are out of order. With each complete pass, the largest remaining unsorted element bubbles up to its final position at the end of the array.",
      },
      {
        id: "mechanics",
        heading: "Passes and Invariants",
        markdown:
          "After k passes, the last k elements are guaranteed to be in their correct, sorted positions. An optimized implementation tracks whether any swap occurred during a pass; if no swaps happened, the array is already sorted and execution halts immediately.",
        visualStep: 1,
      },
      {
        id: "complexity",
        heading: "Time and Space Analysis",
        markdown:
          "Best-case time with the early-exit optimization on an already-sorted array is O(n). Worst and average cases require n*(n-1)/2 comparisons, resulting in O(n^2) time. Auxiliary space is strictly O(1) in-place.",
      },
      {
        id: "stability",
        heading: "Stability and Inversions",
        markdown:
          "Bubble sort is stable because equal elements are never swapped past each other (`arr[j] > arr[j+1]`). The total number of swaps executed equals the number of inversions in the original permutation.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "What is the best-case time complexity of optimized bubble sort on an already sorted array?",
        options: ["O(1)", "O(n)", "O(n log n)", "O(n^2)"],
        answerIndex: 1,
        explanation:
          "With a swap-flag check, the algorithm makes a single O(n) pass, detects 0 swaps, and exits.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt: "Standard bubble sort is a stable sorting algorithm.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "Equal elements are never swapped when using strict greater-than comparison, preserving their original order.",
      },
      {
        id: "q3",
        kind: "predict-step",
        prompt:
          "After 1 full pass of bubble sort on [5, 1, 4, 2, 8], what value is guaranteed to be in its final position?",
        options: ["1", "2", "4", "8"],
        answerIndex: 3,
        explanation:
          "The largest element (8) bubbles all the way to the last index on the first pass.",
      },
      {
        id: "q4",
        kind: "mcq",
        prompt: "How many swaps does bubble sort perform on an array with k inversions?",
        options: ["k / 2", "Exactly k", "k^2", "log2(k)"],
        answerIndex: 1,
        explanation:
          "Every adjacent swap in bubble sort reduces the number of inversions in the permutation by exactly 1.",
      },
    ],
  },
  {
    slug: "insertion-sort",
    algorithmSlug: "insertion-sort",
    title: "Insertion Sort: Building Sorted Subarrays",
    estMinutes: 12,
    xp: 60,
    sections: [
      {
        id: "intro",
        heading: "The Card Player Analogy",
        markdown:
          "Insertion sort mimics how most people sort playing cards in their hands. You hold a sorted sub-hand, pick up the next unsorted card, and scan backwards to insert it into its correct position among the already-sorted cards.",
      },
      {
        id: "mechanics",
        heading: "In-Place Shifting",
        markdown:
          "At step i, element `key = arr[i]` is compared against elements `arr[i-1]`, `arr[i-2]`, etc. Elements greater than `key` are shifted one position right. When the correct spot is found, `key` is written into the vacated slot.",
        visualStep: 1,
      },
      {
        id: "online-adaptivity",
        heading: "Adaptive and Online Properties",
        markdown:
          "Insertion sort is adaptive: if the input is already sorted, it runs in O(n) time with only n-1 comparisons. It is also an online algorithm: it can sort a list as it receives it element-by-element from a stream.",
      },
      {
        id: "hybrid-use",
        heading: "Why Production Sorts Use It",
        markdown:
          "Because of its minimal constant overhead and cache friendliness, production hybrid sorting algorithms like Timsort and Introsort switch to insertion sort for small partitions (typically n <= 16 or 32).",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "Why do production sorting algorithms (like Timsort) use insertion sort for small subarrays?",
        options: [
          "It uses O(log n) space",
          "Low constant factor overhead and fast execution on small or nearly-sorted data",
          "It is faster than O(n log n) asymptotically",
          "It eliminates all recursion",
        ],
        answerIndex: 1,
        explanation:
          "For small n, insertion sort's simplicity and cache locality beat the overhead of merge sort or quicksort.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "Insertion sort is an online algorithm capable of sorting items as they arrive sequentially.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "New elements can be inserted directly into the already-sorted prefix as they are received.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt:
          "What is the worst-case time complexity of insertion sort (e.g., reverse-sorted input)?",
        options: ["O(n)", "O(n log n)", "O(n^2)", "O(2^n)"],
        answerIndex: 2,
        explanation:
          "On reverse-sorted inputs, inserting each element requires shifting the entire sorted prefix, totaling O(n^2).",
      },
      {
        id: "q4",
        kind: "order-steps",
        prompt:
          "Order the steps of insertion sort for index i: (A) Shift larger elements right, (B) Store arr[i] in temp key, (C) Insert key into vacated index.",
        options: ["B, A, C", "A, B, C", "C, B, A", "B, C, A"],
        answerIndex: 0,
        explanation:
          "First store the key, then shift elements greater than key to the right, then place key in the remaining position.",
      },
    ],
  },
  {
    slug: "selection-sort",
    algorithmSlug: "selection-sort",
    title: "Selection Sort: Finding Extremes",
    estMinutes: 12,
    xp: 60,
    sections: [
      {
        id: "intro",
        heading: "Min-Seeking Strategy",
        markdown:
          "Selection sort divides the array into a sorted prefix and an unsorted suffix. In each pass, it scans the unsorted suffix to identify the absolute minimum element, then swaps it with the first unsorted position.",
      },
      {
        id: "mechanics",
        heading: "Predictable Comparison Count",
        markdown:
          "Unlike bubble or insertion sort, selection sort always performs exactly n*(n-1)/2 comparisons regardless of whether the array is already sorted, reversed, or random. Its runtime is invariant to the initial order.",
        visualStep: 1,
      },
      {
        id: "swaps",
        heading: "Minimal Memory Writes",
        markdown:
          "Selection sort makes at most n-1 swaps across the entire sorting process. In hardware environments where writing to memory (such as Flash EEPROM) is significantly more expensive than reading, selection sort can be advantageous.",
      },
      {
        id: "instability",
        heading: "Default Instability",
        markdown:
          "Standard array-based selection sort is not stable because long-range swaps can jump an element over an identical duplicate earlier in the unsorted portion.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "What is the maximum number of swap operations performed by selection sort on an array of length n?",
        options: ["O(n^2)", "n - 1", "n log n", "O(1)"],
        answerIndex: 1,
        explanation:
          "Selection sort performs at most 1 swap per outer loop iteration, totaling at most n-1 swaps.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt: "Selection sort runs in O(n) time on an array that is already fully sorted.",
        options: ["True", "False"],
        answerIndex: 1,
        explanation:
          "Selection sort always scans the entire unsorted suffix to confirm the minimum, remaining O(n^2) in all cases.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt: "Why is standard selection sort typically classified as unstable?",
        options: [
          "It uses recursive partitioning",
          "Long-distance swaps can reorder identical elements",
          "It requires extra heap memory",
          "It cannot sort negative numbers",
        ],
        answerIndex: 1,
        explanation:
          "Swapping the minimum element into place can displace an identical element past another duplicate.",
      },
      {
        id: "q4",
        kind: "predict-step",
        prompt:
          "Given [64, 25, 12, 22, 11], what is the array state after the first pass of selection sort?",
        options: [
          "[11, 25, 12, 22, 64]",
          "[11, 12, 22, 25, 64]",
          "[25, 12, 22, 11, 64]",
          "[12, 25, 64, 22, 11]",
        ],
        answerIndex: 0,
        explanation:
          "The minimum (11) is found and swapped with the element at index 0 (64), yielding [11, 25, 12, 22, 64].",
      },
    ],
  },
  {
    slug: "merge-sort",
    algorithmSlug: "merge-sort",
    title: "Understanding Merge Sort",
    estMinutes: 20,
    xp: 130,
    sections: [
      {
        id: "intro",
        heading: "Divide, Conquer, Merge",
        markdown:
          "Merge sort follows the classic divide-and-conquer pattern: split the array into two halves, recursively sort each half, then merge the two sorted halves into a single sorted array. The merging step is where the real work happens.",
      },
      {
        id: "merge-step",
        heading: "The Merge Operation",
        markdown:
          "To merge two sorted arrays, use two pointers, one for each array, comparing the elements they point to and appending the smaller one to the result, advancing that pointer. Once one array is exhausted, append the remainder of the other.",
        visualStep: 1,
      },
      {
        id: "recurrence",
        heading: "Analyzing the Recurrence",
        markdown:
          "Merge sort splits the array in half (T(n/2) twice) and does O(n) work to merge, giving the recurrence T(n) = 2T(n/2) + O(n). By the Master Theorem, this resolves to O(n log n) in all cases — best, average, and worst.",
        visualStep: 2,
      },
      {
        id: "stability",
        heading: "Stability and Predictability",
        markdown:
          "Merge sort is stable (equal elements retain their relative order) as long as the merge step picks from the left array on ties. This predictability and guaranteed O(n log n) performance make it ideal when consistent behavior matters more than raw speed.",
      },
      {
        id: "tradeoffs",
        heading: "Space Tradeoff",
        markdown:
          "Unlike quicksort, merge sort requires O(n) auxiliary space for the temporary arrays used during merging. This makes it less memory-efficient but its guaranteed worst-case performance makes it valuable for large-scale, external, or linked-list sorting.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "What is the time complexity of merge sort in the worst case?",
        options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
        answerIndex: 1,
        explanation:
          "Merge sort guarantees O(n log n) in all cases due to its balanced divide-and-conquer structure.",
      },
      {
        id: "q2",
        kind: "mcq",
        prompt: "How much extra space does standard merge sort typically require?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        answerIndex: 2,
        explanation:
          "Merge sort needs auxiliary arrays proportional to the input size for the merge step.",
      },
      {
        id: "q3",
        kind: "true-false",
        prompt: "Merge sort is a stable sorting algorithm.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "When implemented to prefer the left array on ties, merge sort preserves relative order of equal elements.",
      },
      {
        id: "q4",
        kind: "order-steps",
        prompt:
          "Order the steps of merge sort: (A) Merge sorted halves, (B) Recursively sort each half, (C) Split array into two halves.",
        options: ["C, B, A", "A, B, C", "B, C, A", "C, A, B"],
        answerIndex: 0,
        explanation:
          "Merge sort first splits, then recursively sorts each half, then merges the sorted results.",
      },
    ],
  },
  {
    slug: "quicksort",
    algorithmSlug: "quicksort",
    title: "Understanding Quicksort",
    estMinutes: 22,
    xp: 140,
    sections: [
      {
        id: "intro",
        heading: "Divide by Partitioning",
        markdown:
          "Quicksort picks a pivot element and partitions the array so all elements less than the pivot land on its left and all greater land on its right. It then recursively sorts each partition, eventually producing a fully sorted array without needing extra merge steps.",
      },
      {
        id: "partition-scheme",
        heading: "The Lomuto Partition Scheme",
        markdown:
          "A common approach: choose the last element as pivot, maintain an index `i` marking the boundary of elements known to be less than the pivot, iterate through the array swapping elements less than the pivot into position, and finally swap the pivot into its correct sorted spot.",
        visualStep: 1,
      },
      {
        id: "pivot-choice",
        heading: "Why Pivot Choice Matters",
        markdown:
          "If the pivot consistently splits the array unevenly (e.g., always picking the smallest or largest element on already-sorted input), quicksort degrades to O(n^2). Techniques like choosing a random pivot, median-of-three, or Introsort (switching to heap sort on bad recursion depth) mitigate this.",
        visualStep: 2,
      },
      {
        id: "complexity",
        heading: "Average vs Worst Case",
        markdown:
          "On average, a random pivot splits the array roughly in half, giving the recurrence T(n) = 2T(n/2) + O(n), which resolves to O(n log n). In the worst case, an unbalanced split every time gives T(n) = T(n-1) + O(n), which is O(n^2).",
      },
      {
        id: "in-place",
        heading: "In-Place Efficiency",
        markdown:
          "Unlike merge sort, quicksort partitions in place, requiring only O(log n) extra space for the recursion stack (on average), making it a popular choice for general-purpose sorting where memory is a concern.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "What is quicksort's average-case time complexity?",
        options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
        answerIndex: 1,
        explanation: "A balanced partition on average leads to the O(n log n) recurrence.",
      },
      {
        id: "q2",
        kind: "mcq",
        prompt: "What causes quicksort's worst-case O(n^2) behavior?",
        options: [
          "Using recursion instead of iteration",
          "Consistently unbalanced pivot splits",
          "Sorting already-random data",
          "Using too much memory",
        ],
        answerIndex: 1,
        explanation:
          "If the pivot always creates a highly unbalanced split, the recursion depth becomes O(n) with O(n) work each level.",
      },
      {
        id: "q3",
        kind: "true-false",
        prompt: "Quicksort is generally considered a stable sort by default.",
        options: ["True", "False"],
        answerIndex: 1,
        explanation:
          "Standard in-place quicksort implementations do not preserve the relative order of equal elements.",
      },
      {
        id: "q4",
        kind: "predict-step",
        prompt:
          "Using Lomuto partition with last element as pivot on [3, 1, 4, 1, 5], what is the pivot value?",
        options: ["3", "1", "4", "5"],
        answerIndex: 3,
        explanation: "The last element of the array, 5, is chosen as the pivot in this scheme.",
      },
    ],
  },
  {
    slug: "heap-sort",
    algorithmSlug: "heap-sort",
    title: "Heap Sort and Complete Binary Trees",
    estMinutes: 20,
    xp: 130,
    sections: [
      {
        id: "intro",
        heading: "Sorting via Priority Queue",
        markdown:
          "Heap sort leverages a max-heap data structure to sort an array in place with guaranteed O(n log n) worst-case time complexity and O(1) auxiliary space.",
      },
      {
        id: "heapify",
        heading: "Building the Heap in O(n)",
        markdown:
          "The array is first converted into a max-heap using bottom-up `heapify` starting from the last non-leaf node `Math.floor(n/2) - 1` down to 0. Although each sift-down takes O(log n), the sum of node heights converges to O(n) total work.",
        visualStep: 1,
      },
      {
        id: "extraction",
        heading: "Repeated Maximum Extraction",
        markdown:
          "Once the heap is built, the root (maximum) is swapped with the last element of the heap. The heap boundary shrinks by one, and `siftDown(0)` restores the heap property. Repeating this n-1 times produces a sorted array.",
        visualStep: 2,
      },
      {
        id: "tradeoffs",
        heading: "Cache Behavior and Stability",
        markdown:
          "Heap sort is not stable and exhibits poor cache locality compared to quicksort because child lookups (`2*i + 1`, `2*i + 2`) jump across distant memory lines. However, its strict O(1) auxiliary space and guaranteed O(n log n) upper bound make it invaluable in deterministic systems.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "What is the time complexity to build a max-heap of n elements using bottom-up heapify?",
        options: ["O(log n)", "O(n)", "O(n log n)", "O(n^2)"],
        answerIndex: 1,
        explanation:
          "Summing node height over all levels yields a mathematical series that evaluates to O(n).",
      },
      {
        id: "q2",
        kind: "mcq",
        prompt: "What is the auxiliary space complexity of standard in-place heap sort?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        answerIndex: 0,
        explanation:
          "Heap sort arranges elements directly within the input array using index math, needing zero extra memory.",
      },
      {
        id: "q3",
        kind: "true-false",
        prompt: "Heap sort is a stable sorting algorithm.",
        options: ["True", "False"],
        answerIndex: 1,
        explanation:
          "Heap operations rearrange equal keys based on tree structural positions, destroying relative order.",
      },
      {
        id: "q4",
        kind: "predict-step",
        prompt:
          "For a 0-indexed binary heap array, what is the left child index of the node at index 3?",
        options: ["5", "6", "7", "8"],
        answerIndex: 2,
        explanation: "The left child index formula is 2 * i + 1. For i = 3, 2 * 3 + 1 = 7.",
      },
    ],
  },
  {
    slug: "counting-sort",
    algorithmSlug: "counting-sort",
    title: "Counting Sort: Non-Comparison Sorting",
    estMinutes: 15,
    xp: 90,
    sections: [
      {
        id: "intro",
        heading: "Breaking the Comparison Lower Bound",
        markdown:
          "Comparison-based sorts are mathematically bounded by Ω(n log n). Counting sort escapes this bound by using direct indexing on integer keys within a known range `k`, achieving linear O(n + k) time.",
      },
      {
        id: "mechanics",
        heading: "Frequency Array and Prefix Sums",
        markdown:
          "Counting sort creates a count array of size k, tallies occurrences of each value, and transforms counts into prefix sums. The prefix sum at index `v` indicates the exact ending output position for elements with value `v`.",
        visualStep: 1,
      },
      {
        id: "stability",
        heading: "Stable Placement via Backward Scan",
        markdown:
          "By iterating through the original input backwards and placing each item into the slot indicated by the prefix sum (decrementing the count after placement), counting sort guarantees stability.",
      },
      {
        id: "tradeoffs",
        heading: "When to Use Counting Sort",
        markdown:
          "Counting sort is ideal when the range `k` is roughly on the order of `n` (e.g. sorting test scores 0-100 or ASCII characters). It serves as the foundational sub-routine inside Radix Sort.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "What is the time complexity of counting sort on n elements with key range k?",
        options: ["O(n log n)", "O(n + k)", "O(n * k)", "O(k log n)"],
        answerIndex: 1,
        explanation:
          "Counting sort makes linear passes over the input array (size n) and the frequency array (size k).",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt: "Counting sort is a comparison-based sorting algorithm.",
        options: ["True", "False"],
        answerIndex: 1,
        explanation:
          "Counting sort uses direct arithmetic array indexing rather than pairwise element comparisons.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt:
          "Why is the input array traversed in reverse during the final output placement step?",
        options: [
          "To sort in descending order",
          "To preserve the stability of equal elements",
          "To reduce space complexity",
          "To avoid cache misses",
        ],
        answerIndex: 1,
        explanation:
          "Scanning backwards places the last-seen duplicate into the highest reserved slot, maintaining initial order.",
      },
      {
        id: "q4",
        kind: "true-false",
        prompt: "Counting sort is memory-efficient even when sorting keys with a range k = 10^12.",
        options: ["True", "False"],
        answerIndex: 1,
        explanation:
          "Counting sort requires O(k) memory for the frequency table, making huge key ranges impractical.",
      },
    ],
  },
  {
    slug: "two-pointers",
    algorithmSlug: "two-pointers",
    title: "Two-Pointer Technique: Opposite and Same Direction",
    estMinutes: 18,
    xp: 110,
    sections: [
      {
        id: "intro",
        heading: "Eliminating Nested Loops",
        markdown:
          "The two-pointer technique uses two indices to traverse a linear collection simultaneously. By taking advantage of structural properties (such as sorted order or monotonicity), it reduces brute-force O(n^2) searches into optimal O(n) linear scans.",
      },
      {
        id: "opposite",
        heading: "Opposite-Direction Pointers (Converging)",
        markdown:
          "One pointer starts at `0` and the other at `n-1`. At each step, comparing their values guides which pointer to advance. Classic examples include Two Sum on sorted arrays, palindrome checking, and container with most water.",
        visualStep: 1,
      },
      {
        id: "same-direction",
        heading: "Same-Direction Pointers (Reader / Writer)",
        markdown:
          "Both pointers move in the same direction at varying speeds. A `fast` pointer reads items while a `slow` pointer writes filtered or deduplicated items in place (e.g., removing duplicates from sorted array).",
      },
      {
        id: "dutch-flag",
        heading: "Three Pointers: Dutch National Flag",
        markdown:
          "Extending the concept to three pointers (`low`, `mid`, `high`) partitions an array into three discrete segments in a single pass with O(1) space, famously used in 3-way quicksort partitioning.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "What is the typical time complexity achieved by converging two pointers on a sorted array of length n?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        answerIndex: 2,
        explanation:
          "Because the two pointers move closer together each step without backtracking, at most n total moves occur.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "The converging two-pointer technique for Two Sum works equally well on an unsorted array without sorting first.",
        options: ["True", "False"],
        answerIndex: 1,
        explanation:
          "The directional decision to advance left vs right depends entirely on the sorted monotonic relationship of values.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt: "In the remove-duplicates in-place pattern, what does the slow pointer represent?",
        options: [
          "The current search target",
          "The boundary of the deduplicated valid prefix",
          "The total count of duplicates removed",
          "The middle element",
        ],
        answerIndex: 1,
        explanation:
          "The slow pointer tracks the write index for unique elements, bounding the clean subarray.",
      },
      {
        id: "q4",
        kind: "predict-step",
        prompt:
          "Given sorted array [1, 3, 5, 8, 12] with target sum 13. Left=0 (1), Right=4 (12). Sum=13. What should the algorithm do?",
        options: [
          "Increment left pointer",
          "Decrement right pointer",
          "Return indices [0, 4] as solution found",
          "Restart search from middle",
        ],
        answerIndex: 2,
        explanation:
          "1 + 12 = 13 matches target exactly; the solution pair is immediately identified.",
      },
    ],
  },
  {
    slug: "sliding-window",
    algorithmSlug: "sliding-window",
    title: "Sliding Window: Fixed and Variable Sizes",
    estMinutes: 20,
    xp: 120,
    sections: [
      {
        id: "intro",
        heading: "Contiguous Subarray Optimization",
        markdown:
          "The sliding window technique maintains a continuous subsegment `[left, right]` over an array or string. As the window expands and contracts, incremental updates avoid recomputing full window sums or frequency counts from scratch.",
      },
      {
        id: "fixed",
        heading: "Fixed-Size Windows",
        markdown:
          "When window size `k` is fixed, moving the window right involves adding `arr[right]` and subtracting `arr[left]` in O(1) time. This computes max/min subarray sums of length k across an entire array in O(n) total time.",
        visualStep: 1,
      },
      {
        id: "variable",
        heading: "Variable-Size Windows (Expand & Shrink)",
        markdown:
          "In variable-size windows, the right pointer advances to expand the window until a condition is met (or violated). The left pointer then advances to shrink the window, searching for optimal lengths (e.g., minimum window substring, longest substring with distinct characters).",
        visualStep: 2,
      },
      {
        id: "complexity",
        heading: "Why Variable Sliding Window is O(n)",
        markdown:
          "Although variable window algorithms have nested loops (`while left <= right`), both `left` and `right` only advance forward and never reset backwards. Each element enters and exits the window at most once, guaranteeing strict O(n) total time.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "What is the amortized cost per element in a variable-size sliding window algorithm?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        answerIndex: 0,
        explanation:
          "Since each element is added by `right` once and removed by `left` once, total operations are 2n, or O(1) amortized.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "A fixed-size sliding window requires re-summing all k elements each time it slides one position right.",
        options: ["True", "False"],
        answerIndex: 1,
        explanation:
          "You add the incoming element and subtract the outgoing element in O(1) time without re-summing.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt:
          "Which data structure is frequently used alongside sliding window to track character counts in substring problems?",
        options: [
          "Stack",
          "Hash map or fixed-size frequency array",
          "Binary search tree",
          "Disjoint set",
        ],
        answerIndex: 1,
        explanation:
          "A frequency map or 128-byte array allows O(1) tracking of character occurrences within the active window.",
      },
      {
        id: "q4",
        kind: "predict-step",
        prompt:
          "Given array [2, 1, 5, 1, 3, 2] with fixed window size k=3. Initial window [2,1,5] sum=8. Next element is 1. What is the new window sum?",
        options: ["6", "7", "8", "9"],
        answerIndex: 1,
        explanation: "New sum = Old sum (8) - outgoing element (2) + incoming element (1) = 7.",
      },
    ],
  },
  {
    slug: "linked-list-reversal",
    algorithmSlug: "linked-list-reversal",
    title: "Linked List Reversal and Pointer Manipulation",
    estMinutes: 16,
    xp: 90,
    sections: [
      {
        id: "intro",
        heading: "Dissecting Pointer Mutations",
        markdown:
          "Singly linked lists consist of nodes where each node holds data and a `next` pointer. Reversing a linked list requires flipping the direction of every pointer in place without allocating new nodes.",
      },
      {
        id: "iterative",
        heading: "The Three-Pointer Iterative Pattern",
        markdown:
          "Maintain three pointers: `prev` (initialized to null), `curr` (head), and `next` (temporary holder). In each step: save `curr.next`, redirect `curr.next = prev`, advance `prev = curr`, and advance `curr = next`.",
        visualStep: 1,
      },
      {
        id: "recursive",
        heading: "Recursive Reversal",
        markdown:
          "The recursive approach recurses to the end of the list to reach the new head. As the call stack unwinds, `node.next.next = node` flips the link and `node.next = null` prevents circular loops.",
      },
      {
        id: "sublist",
        heading: "Reversing Subsegments",
        markdown:
          "Reversing nodes between positions `m` and `n` uses dummy head nodes to preserve references to the preceding segment and reconnection points.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "What is the space complexity of iterative linked list reversal?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        answerIndex: 0,
        explanation:
          "Iterative reversal modifies pointers in place using only three pointer variables.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "In recursive linked list reversal, failing to set `head.next = null` creates a cycle in the list.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "The original head node's next pointer would still point to the second node, creating a two-node cycle.",
      },
      {
        id: "q3",
        kind: "order-steps",
        prompt:
          "Order the 4 core steps inside the iterative reversal loop: (A) curr.next = prev, (B) prev = curr, (C) next = curr.next, (D) curr = next.",
        options: ["C, A, B, D", "A, B, C, D", "C, B, A, D", "B, A, C, D"],
        answerIndex: 0,
        explanation:
          "Save next first, flip current's pointer backwards, step prev forward, step curr forward.",
      },
      {
        id: "q4",
        kind: "mcq",
        prompt:
          "What pointer value should `prev` be initialized to when reversing a complete singly linked list?",
        options: ["head.next", "null", "new Node(0)", "head"],
        answerIndex: 1,
        explanation:
          "The original head will become the new tail, so its next pointer must eventually point to null.",
      },
    ],
  },
  {
    slug: "stack-basics",
    algorithmSlug: "stack-basics",
    title: "Stacks: LIFO Order and Monotonic Patterns",
    estMinutes: 16,
    xp: 90,
    sections: [
      {
        id: "intro",
        heading: "Last-In, First-Out Mechanics",
        markdown:
          "A stack is a linear container where elements are added (`push`) and removed (`pop`) from the same end, known as the top. This strict LIFO ordering mirrors function call stacks, undo buffers, and syntax parsing.",
      },
      {
        id: "bracket-matching",
        heading: "Matching Pairs and Parsing",
        markdown:
          "When parsing nested structures (like parentheses, HTML tags, or arithmetic expressions), an opening delimiter is pushed. When a closing delimiter appears, popping the stack immediately verifies whether the most recently opened scope matches.",
        visualStep: 1,
      },
      {
        id: "monotonic-stack",
        heading: "The Monotonic Stack Technique",
        markdown:
          "A monotonic stack maintains its elements in strictly increasing or decreasing order. As new elements arrive, smaller (or larger) elements are popped off. This technique finds the Next Greater Element or Next Smaller Element for all array items in O(n) time.",
      },
      {
        id: "complexity",
        heading: "Performance Guarantees",
        markdown:
          "Push, pop, and peek operations take O(1) time. Space complexity is O(n) in the worst case where all elements remain on the stack simultaneously.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "Which data structure property defines a stack?",
        options: [
          "FIFO (First In, First Out)",
          "LIFO (Last In, First Out)",
          "Priority order",
          "Random access",
        ],
        answerIndex: 1,
        explanation: "A stack enforces Last-In, First-Out order for insertions and deletions.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "A monotonic stack solves the Next Greater Element problem for all elements of an array in O(n) total time.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "Each element is pushed and popped at most once across the entire traversal, yielding O(n) time.",
      },
      {
        id: "q3",
        kind: "predict-step",
        prompt:
          "Stack contains bottom [10, 20, 30] top. Execute push(40), pop(), peek(). What is the returned value?",
        options: ["40", "30", "20", "10"],
        answerIndex: 1,
        explanation:
          "Pushing 40 makes top 40; pop removes 40; peek returns the current top which is 30.",
      },
      {
        id: "q4",
        kind: "mcq",
        prompt:
          "When validating parentheses string '({[]})', what condition indicates a valid sequence upon loop completion?",
        options: [
          "The stack contains at least 1 element",
          "The stack is completely empty",
          "All elements in stack are opening brackets",
          "The top element is null",
        ],
        answerIndex: 1,
        explanation:
          "All opening brackets must be matched and popped; any remaining element indicates an unclosed delimiter.",
      },
    ],
  },
  {
    slug: "queue-basics",
    algorithmSlug: "queue-basics",
    title: "Queues: FIFO Order and Ring Buffers",
    estMinutes: 15,
    xp: 90,
    sections: [
      {
        id: "intro",
        heading: "First-In, First-Out Mechanics",
        markdown:
          "A queue processes items in the exact order they arrive: insertions (`enqueue`) happen at the rear, while deletions (`dequeue`) occur at the front. Queues model line management, job scheduling, and asynchronous message buffers.",
      },
      {
        id: "implementations",
        heading: "Array vs Linked List Implementations",
        markdown:
          "Using a standard JavaScript array `shift()` for dequeue takes O(n) time due to index re-shifting. High-performance queues use a doubly linked list or a fixed-capacity circular array (ring buffer) with head and tail pointers to achieve O(1) dequeues.",
        visualStep: 1,
      },
      {
        id: "circular-queue",
        heading: "Circular Ring Buffers",
        markdown:
          "A circular buffer wraps index math using modulo arithmetic: `tail = (tail + 1) % capacity`. This reuses freed memory at the front of the array without reallocation.",
      },
      {
        id: "deque",
        heading: "Double-Ended Queues (Deques)",
        markdown:
          "A deque supports O(1) push and pop at both front and rear. Deques are the cornerstone for implementing sliding window maximum algorithms in O(n) time.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "What is the time complexity of dequeue when using JavaScript array `arr.shift()` naively?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        answerIndex: 2,
        explanation:
          "Array shift re-indexes all remaining n-1 elements leftward, costing O(n) time.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "A ring buffer uses modulo arithmetic on indices to avoid shifting elements in memory.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "Circular index wrapping `(head + 1) % size` allows continuous reuse of array slots in O(1) time.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt: "Which graph traversal algorithm fundamentally relies on a FIFO queue?",
        options: [
          "Depth-First Search",
          "Breadth-First Search",
          "Dijkstra with negative edges",
          "Kruskal's algorithm",
        ],
        answerIndex: 1,
        explanation: "BFS explores vertices level-by-level using a FIFO queue.",
      },
      {
        id: "q4",
        kind: "predict-step",
        prompt:
          "Circular queue of capacity 5 with head=3. Advance head by 3 positions. What is the new head index?",
        options: ["0", "1", "2", "6"],
        answerIndex: 1,
        explanation: "(3 + 3) % 5 = 6 % 5 = 1.",
      },
    ],
  },
  {
    slug: "hash-table-chaining",
    algorithmSlug: "hash-table-chaining",
    title: "Hash Tables: Collision Resolution and Load Factor",
    estMinutes: 20,
    xp: 120,
    sections: [
      {
        id: "intro",
        heading: "Constant-Time Key Lookups",
        markdown:
          "A hash table maps keys to bucket indices in an array using a hash function `index = hash(key) % table_size`. This provides average O(1) insertion, deletion, and lookup times.",
      },
      {
        id: "collisions",
        heading: "Separate Chaining Collision Strategy",
        markdown:
          "When two distinct keys hash to the same bucket index (a collision), separate chaining stores all colliding key-value pairs in a linked list (or balanced BST) at that bucket.",
        visualStep: 1,
      },
      {
        id: "load-factor",
        heading: "Load Factor and Dynamic Resizing",
        markdown:
          "The load factor `alpha = n / buckets` measures table density. When alpha exceeds a threshold (typically 0.75), the table doubles its capacity and rehashes all elements to maintain short bucket chains.",
      },
      {
        id: "worst-case",
        heading: "Degradation and Hash DoS",
        markdown:
          "If the hash function produces many collisions, bucket chains grow to O(n), degrading lookup performance to O(n). High-reliability hash tables use cryptographic seeds or fallback trees to prevent denial-of-service attacks.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "What is the average-case time complexity of looking up a key in a hash table?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        answerIndex: 0,
        explanation:
          "With a uniform hash function and bounded load factor, lookups execute in O(1) expected time.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "In separate chaining, all colliding key-value pairs at a single bucket are lost except the newest.",
        options: ["True", "False"],
        answerIndex: 1,
        explanation:
          "Separate chaining preserves all colliding entries in a linked list or tree within that bucket.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt:
          "What action is triggered when a hash table's load factor exceeds its defined threshold (e.g. 0.75)?",
        options: [
          "Delete the oldest entries",
          "Double the bucket capacity and rehash all keys",
          "Convert all keys to integers",
          "Switch to binary search",
        ],
        answerIndex: 1,
        explanation:
          "Dynamic resizing doubles the table and re-indexes elements to bring the load factor back down.",
      },
      {
        id: "q4",
        kind: "mcq",
        prompt:
          "What is the worst-case lookup time if all n keys collide into the exact same bucket?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        answerIndex: 2,
        explanation:
          "If all n keys map to one bucket, searching that bucket's linked list degrades to linear O(n) search.",
      },
    ],
  },
  {
    slug: "bst-insert",
    algorithmSlug: "bst-insert",
    title: "Binary Search Trees: Search and Insertion Invariants",
    estMinutes: 18,
    xp: 110,
    sections: [
      {
        id: "intro",
        heading: "The BST Ordering Property",
        markdown:
          "A Binary Search Tree (BST) maintains the invariant that for any node X, all values in its left subtree are strictly less than X.val, and all values in its right subtree are strictly greater than X.val.",
      },
      {
        id: "search-insert",
        heading: "Search and Insertion Invariant",
        markdown:
          "To insert value V, compare V with current node. If V < node.val, recurse left; if V > node.val, recurse right. When a null pointer is reached, attach a new node with value V.",
        visualStep: 1,
      },
      {
        id: "balance-issue",
        heading: "Tree Balance and Degeneracy",
        markdown:
          "On balanced trees, height is O(log n), allowing O(log n) search and insert. If elements are inserted in already-sorted order, the BST degrades into a linear linked list with height O(n).",
      },
      {
        id: "self-balancing",
        heading: "Self-Balancing Trees",
        markdown:
          "Self-balancing BSTs like AVL trees and Red-Black trees perform tree rotations during insertions and deletions to guarantee O(log n) height under all insertion sequences.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "What is the height of an unbalanced BST created by inserting sorted numbers [1, 2, 3, 4, 5] sequentially?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        answerIndex: 2,
        explanation:
          "Sequential sorted inserts always branch right, creating a degenerate skewed tree of height n.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "In a valid BST, all values in a node's left subtree must be strictly less than the node's value.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation: "This is the defining invariant of Binary Search Trees.",
      },
      {
        id: "q3",
        kind: "predict-step",
        prompt: "BST has root 10 with left child 5. We insert value 7. Where does 7 attach?",
        options: [
          "As left child of 5",
          "As right child of 5",
          "As right child of 10",
          "Replaces root 10",
        ],
        answerIndex: 1,
        explanation:
          "7 < 10 moves left to node 5; 7 > 5 moves right to attach as right child of 5.",
      },
      {
        id: "q4",
        kind: "mcq",
        prompt: "What is the average time complexity of BST search on random input data?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        answerIndex: 1,
        explanation:
          "Random insertions produce approximately balanced trees with O(log n) expected height.",
      },
    ],
  },
  {
    slug: "bst-traversals",
    algorithmSlug: "bst-traversals",
    title: "BST Traversals: Pre, In, and Post-Order",
    estMinutes: 18,
    xp: 110,
    sections: [
      {
        id: "intro",
        heading: "Depth-First Tree Traversals",
        markdown:
          "Tree traversal visits every node in a tree exactly once. Depth-first traversals differ by the relative timing of when the root node is processed relative to its left and right subtrees.",
      },
      {
        id: "inorder",
        heading: "In-Order Traversal: Sorted Extraction",
        markdown:
          "In-order visits Left -> Root -> Right. On a Binary Search Tree, an in-order traversal visits keys in strictly ascending sorted order. It is the primary tool for validating BST validity and finding k-th smallest elements.",
        visualStep: 1,
      },
      {
        id: "preorder",
        heading: "Pre-Order Traversal: Serialization",
        markdown:
          "Pre-order visits Root -> Left -> Right. It is used to copy trees, serialize tree structures to disk, and evaluate prefix algebraic expressions.",
      },
      {
        id: "postorder",
        heading: "Post-Order Traversal: Bottom-Up Deletion",
        markdown:
          "Post-order visits Left -> Right -> Root. Because children are processed before parents, it is ideal for calculating subtree heights, directory sizes, and freeing node memory from the bottom up.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "Which tree traversal yields elements in strictly ascending sorted order for a BST?",
        options: ["Pre-order", "In-order", "Post-order", "Level-order"],
        answerIndex: 1,
        explanation:
          "In-order traversal (Left, Root, Right) naturally traverses a BST in sorted numerical order.",
      },
      {
        id: "q2",
        kind: "mcq",
        prompt: "Which traversal order processes child nodes before processing their parent node?",
        options: ["Pre-order", "In-order", "Post-order", "Breadth-first"],
        answerIndex: 2,
        explanation:
          "Post-order traversal visits Left and Right subtrees before processing the Root.",
      },
      {
        id: "q3",
        kind: "predict-step",
        prompt: "Tree: Root 2, Left 1, Right 3. What is the pre-order traversal sequence?",
        options: ["1, 2, 3", "2, 1, 3", "3, 2, 1", "1, 3, 2"],
        answerIndex: 1,
        explanation: "Pre-order visits Root (2), then Left (1), then Right (3) -> [2, 1, 3].",
      },
      {
        id: "q4",
        kind: "true-false",
        prompt:
          "All standard recursive tree traversals require O(h) space on the call stack, where h is tree height.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "The recursion stack depth matches the maximum path length from root to leaf, which is the tree height h.",
      },
    ],
  },
  {
    slug: "level-order",
    algorithmSlug: "level-order",
    title: "Level-Order Tree Traversal and BFS on Trees",
    estMinutes: 18,
    xp: 110,
    sections: [
      {
        id: "intro",
        heading: "Breadth-First Exploration of Hierarchies",
        markdown:
          "Level-order traversal visits nodes level by level from top to bottom, and left to right within each level. It is the tree equivalent of Breadth-First Search (BFS).",
      },
      {
        id: "queue-pattern",
        heading: "The Level-Tracking Queue Pattern",
        markdown:
          "Initialize a queue with the root. In each iteration, record `levelSize = queue.length`. Run a loop for `levelSize` iterations: dequeue a node, record its value, and enqueue its left and right children. This isolates each tree tier into its own array.",
        visualStep: 1,
      },
      {
        id: "variations",
        heading: "Zigzag and Side-View Variants",
        markdown:
          "Zigzag traversal alternates output direction per level. Right-side view problems simply collect the last element processed in each level loop.",
      },
      {
        id: "complexity",
        heading: "Time and Space Bounds",
        markdown:
          "Every node is enqueued and dequeued once, giving O(n) time. Space complexity is O(w) where w is maximum tree width (up to n/2 nodes at the bottom level of a full binary tree).",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "Which data structure is essential for performing level-order traversal on a tree?",
        options: ["Stack", "FIFO Queue", "Priority Queue", "Disjoint Set"],
        answerIndex: 1,
        explanation:
          "A FIFO queue processes nodes in the order they are discovered, enforcing level-by-level progression.",
      },
      {
        id: "q2",
        kind: "mcq",
        prompt:
          "What is the maximum space complexity of level-order traversal on a balanced binary tree with n nodes?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        answerIndex: 2,
        explanation:
          "The leaf level of a full binary tree contains (n+1)/2 nodes, requiring O(n) space in the queue.",
      },
      {
        id: "q3",
        kind: "true-false",
        prompt:
          "Level-order traversal on a tree requires a `visited` set to prevent infinite cycles.",
        options: ["True", "False"],
        answerIndex: 1,
        explanation:
          "Trees are acyclic directed structures by definition, so child pointers never lead back to visited ancestors.",
      },
      {
        id: "q4",
        kind: "predict-step",
        prompt:
          "Tree: Root 1, Left child 2, Right child 3. Level order produces what grouped output?",
        options: ["[[1], [2, 3]]", "[[2, 3], [1]]", "[[1, 2], [3]]", "[[1, 2, 3]]"],
        answerIndex: 0,
        explanation: "Level 0 is [1], Level 1 is [2, 3], resulting in [[1], [2, 3]].",
      },
    ],
  },
  {
    slug: "heap-insert",
    algorithmSlug: "heap-insert",
    title: "Binary Heap: Sift-Up, Sift-Down and Priority Queues",
    estMinutes: 18,
    xp: 110,
    sections: [
      {
        id: "intro",
        heading: "The Complete Binary Tree Property",
        markdown:
          "A binary heap is a complete binary tree where every level (except possibly the last) is fully filled, and all nodes are as far left as possible. This structure allows seamless representation in a flat array without pointer overhead.",
      },
      {
        id: "sift-up",
        heading: "Insertion and Sift-Up",
        markdown:
          "To insert an element, append it to the end of the array (preserving completeness) and `siftUp`: repeatedly compare the element with its parent `Math.floor((i-1)/2)` and swap if the heap order is violated.",
        visualStep: 1,
      },
      {
        id: "sift-down",
        heading: "Extraction and Sift-Down",
        markdown:
          "To extract the root, replace it with the last element of the array, shrink the array by one, and `siftDown`: repeatedly swap with the smaller child (for min-heap) until the heap invariant is restored.",
        visualStep: 2,
      },
      {
        id: "applications",
        heading: "Priority Queue Applications",
        markdown:
          "Binary heaps power priority queues used in Dijkstra's shortest path algorithm, Prim's minimum spanning tree, Huffman coding, and event-driven simulations.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "What is the time complexity of inserting an element into a binary heap of n items?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        answerIndex: 1,
        explanation:
          "Sift-up travels up the height of a complete binary tree, which is bounded by O(log n).",
      },
      {
        id: "q2",
        kind: "predict-step",
        prompt:
          "In a 0-indexed array representation of a binary heap, what is the parent index of node at index 6?",
        options: ["2", "3", "4", "5"],
        answerIndex: 0,
        explanation:
          "Parent index formula is floor((i - 1) / 2). For i = 6, floor((6 - 1) / 2) = floor(2.5) = 2.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt:
          "What element is placed at the root immediately after removing the minimum from a min-heap?",
        options: [
          "The smallest child of the root",
          "The last element in the array",
          "Null / undefined",
          "The largest element in the array",
        ],
        answerIndex: 1,
        explanation:
          "The last element replaces the root to maintain complete tree shape before sift-down begins.",
      },
      {
        id: "q4",
        kind: "true-false",
        prompt: "A min-heap root always holds the minimum element in the entire data structure.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "The min-heap invariant ensures every parent is less than or equal to both its children.",
      },
    ],
  },
  {
    slug: "bfs",
    algorithmSlug: "bfs",
    title: "Breadth-First Search Explained",
    estMinutes: 20,
    xp: 130,
    sections: [
      {
        id: "intro",
        heading: "Exploring Layer by Layer",
        markdown:
          "BFS explores a graph outward from a starting node, visiting all direct neighbors before moving to neighbors-of-neighbors. This layered exploration guarantees that when BFS first reaches a node, it has found the shortest path to it in terms of number of edges (for unweighted graphs).",
      },
      {
        id: "mechanics",
        heading: "The Queue-Driven Mechanism",
        markdown:
          "BFS uses a queue to track nodes to visit next. We start by enqueueing the source and marking it visited. Then we repeatedly dequeue a node, process it, and enqueue any unvisited neighbors, marking them visited immediately upon enqueueing (not upon dequeueing) to avoid duplicate enqueues.",
        visualStep: 1,
      },
      {
        id: "shortest-path",
        heading: "Why BFS Finds Shortest Paths",
        markdown:
          "Because BFS visits nodes in increasing order of distance from the source, the first time a node is discovered, it is via a shortest path. Tracking a `parent` map as you visit nodes lets you reconstruct the actual path after the search completes.",
        visualStep: 2,
      },
      {
        id: "complexity",
        heading: "Time and Space Complexity",
        markdown:
          "BFS visits every vertex once and examines every edge once (or twice for undirected graphs), giving O(V + E) time. Space is O(V) for the visited set and queue, which can hold up to an entire graph layer at once.",
      },
      {
        id: "applications",
        heading: "Real-World Applications",
        markdown:
          'BFS powers shortest-route features in unweighted networks, level-order tree printing, finding connected components, and "degrees of separation" features in social networks. It is also the foundation for more advanced algorithms like 0-1 BFS and multi-source BFS.',
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "Which data structure is central to a standard BFS implementation?",
        options: ["Stack", "Queue", "Priority queue", "Hash set only"],
        answerIndex: 1,
        explanation: "BFS processes nodes in FIFO order using a queue to explore level by level.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt: "BFS guarantees the shortest path in terms of edge count for unweighted graphs.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "Because BFS explores nodes in order of distance, the first discovery of a node is via the shortest path.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt: "What is the time complexity of BFS on a graph with V vertices and E edges?",
        options: ["O(V^2)", "O(V + E)", "O(E log V)", "O(V log V)"],
        answerIndex: 1,
        explanation: "BFS visits each vertex once and each edge at most twice, giving O(V + E).",
      },
      {
        id: "q4",
        kind: "order-steps",
        prompt:
          "Order these BFS steps correctly: (A) Dequeue a node, (B) Enqueue source and mark visited, (C) Enqueue unvisited neighbors and mark them visited, (D) Repeat until queue is empty.",
        options: ["B, A, C, D", "A, B, C, D", "B, C, A, D", "C, B, A, D"],
        answerIndex: 0,
        explanation:
          "BFS starts by enqueueing the source, then repeatedly dequeues and processes nodes, enqueueing neighbors.",
      },
    ],
  },
  {
    slug: "dfs",
    algorithmSlug: "dfs",
    title: "Depth-First Search Explained",
    estMinutes: 20,
    xp: 130,
    sections: [
      {
        id: "intro",
        heading: "Going Deep First",
        markdown:
          "DFS explores a graph by diving as deep as possible along one path before backtracking to explore other branches. It mirrors how you might explore a maze: keep going forward, and only turn back when you hit a dead end.",
      },
      {
        id: "implementation",
        heading: "Recursive and Iterative Forms",
        markdown:
          "DFS can be implemented recursively, where the call stack naturally tracks the path, or iteratively using an explicit stack. In both forms, we mark nodes visited as we enter them and recurse or push their unvisited neighbors.",
        visualStep: 1,
      },
      {
        id: "use-cases",
        heading: "Cycle Detection and Connectivity",
        markdown:
          "DFS is the backbone of cycle detection (if we reach an already-visited node in the current recursion path, there is a cycle), connected component labeling, and computing entry/exit times used in algorithms like Tarjan's for strongly connected components.",
        visualStep: 2,
      },
      {
        id: "topo-sort",
        heading: "DFS and Topological Sorting",
        markdown:
          "For directed acyclic graphs, running DFS and recording nodes in post-order (when we finish exploring all descendants) and then reversing that order produces a valid topological sort — an ordering respecting all dependency edges.",
      },
      {
        id: "complexity",
        heading: "Complexity and Pitfalls",
        markdown:
          "DFS runs in O(V + E) time and O(V) space for the visited set and recursion/explicit stack. A common pitfall is stack overflow on very deep or large graphs when using naive recursion; an iterative approach with an explicit stack avoids this.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "DFS most naturally uses which mechanism to track nodes to explore?",
        options: [
          "A queue",
          "A stack (explicit or via recursion)",
          "A priority queue",
          "A hash map only",
        ],
        answerIndex: 1,
        explanation:
          "DFS follows a path as deep as possible, which matches LIFO order provided by a stack or recursion call stack.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt: "DFS can be used to detect cycles in a directed graph.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "Detecting a back edge to a node currently in the recursion stack indicates a cycle.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt: "What is a common risk when implementing DFS recursively on very large graphs?",
        options: [
          "Incorrect results",
          "Stack overflow due to deep recursion",
          "Slower than BFS always",
          "It cannot detect connectivity",
        ],
        answerIndex: 1,
        explanation:
          "Deep recursive calls can exceed the call stack limit; an iterative version with an explicit stack avoids this.",
      },
      {
        id: "q4",
        kind: "mcq",
        prompt: "How is topological sort derived from DFS?",
        options: [
          "Sort nodes alphabetically after DFS",
          "Reverse the post-order finish sequence of DFS",
          "Use the pre-order sequence directly",
          "DFS cannot produce a topological sort",
        ],
        answerIndex: 1,
        explanation:
          "Recording finish times and reversing them yields a valid topological order for a DAG.",
      },
    ],
  },
  {
    slug: "dijkstra",
    algorithmSlug: "dijkstra",
    title: "Dijkstra's Shortest Path Algorithm",
    estMinutes: 25,
    xp: 160,
    sections: [
      {
        id: "intro",
        heading: "Finding Cheapest Paths",
        markdown:
          "Dijkstra's algorithm finds the shortest (lowest total weight) path from a source node to every other node in a graph with non-negative edge weights, generalizing BFS to weighted graphs.",
      },
      {
        id: "mechanics",
        heading: "Greedy Relaxation with a Priority Queue",
        markdown:
          'The algorithm maintains a distance estimate for every node, initialized to infinity except the source (0). It repeatedly extracts the unvisited node with the smallest known distance from a priority queue, and "relaxes" each outgoing edge: if going through this node offers a shorter path to a neighbor, update that neighbor\'s distance.',
        visualStep: 1,
      },
      {
        id: "why-nonneg",
        heading: "Why Non-Negative Weights Matter",
        markdown:
          "Dijkstra's greedy choice assumes that once a node is popped with its minimal distance, that distance can never be improved later. Negative edge weights break this assumption, since a longer path taken later could still result in a smaller total via a negative edge — for such graphs, use Bellman-Ford instead.",
        visualStep: 2,
      },
      {
        id: "complexity",
        heading: "Complexity with a Binary Heap",
        markdown:
          "Using a binary heap as the priority queue, each extraction is O(log V) and each edge relaxation may trigger a heap update, giving overall O((V + E) log V) time. Space is O(V) for the distance array and heap.",
      },
      {
        id: "applications",
        heading: "Applications",
        markdown:
          "Dijkstra's algorithm underlies GPS navigation systems, network routing protocols like OSPF, and flight-connection optimizers — anywhere you need the cheapest route through a weighted network with non-negative costs.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "Dijkstra's algorithm requires which property of edge weights?",
        options: [
          "All weights must be equal",
          "Weights must be non-negative",
          "Weights must be integers",
          "No requirement on weights",
        ],
        answerIndex: 1,
        explanation:
          "Dijkstra's greedy approach fails to produce correct results with negative edge weights.",
      },
      {
        id: "q2",
        kind: "mcq",
        prompt:
          "What data structure is typically used to efficiently implement Dijkstra's algorithm?",
        options: [
          "A simple array",
          "A min-priority queue (binary heap)",
          "A stack",
          "A hash set only",
        ],
        answerIndex: 1,
        explanation:
          "A min-heap allows efficiently extracting the node with the smallest tentative distance.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt: "What is the time complexity of Dijkstra's algorithm using a binary heap?",
        options: ["O(V + E)", "O((V + E) log V)", "O(V^2)", "O(V^3)"],
        answerIndex: 1,
        explanation:
          "Each of the O(V + E) heap operations costs O(log V), giving O((V + E) log V) overall.",
      },
      {
        id: "q4",
        kind: "true-false",
        prompt: "Dijkstra's algorithm is a special case that generalizes BFS to weighted graphs.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "When all edge weights are equal, Dijkstra reduces to essentially the same behavior as BFS.",
      },
    ],
  },
  {
    slug: "topological-sort",
    algorithmSlug: "topological-sort",
    title: "Topological Sort: Kahn's Algorithm and DAG Ordering",
    estMinutes: 20,
    xp: 130,
    sections: [
      {
        id: "intro",
        heading: "Ordering Directed Dependencies",
        markdown:
          "A topological sort of a Directed Acyclic Graph (DAG) produces a linear ordering of vertices such that for every directed edge `u -> v`, vertex `u` appears before vertex `v`. It models build systems, course prerequisite schedules, and task pipelines.",
      },
      {
        id: "kahns-algo",
        heading: "Kahn's In-Degree Algorithm",
        markdown:
          "Kahn's algorithm computes the in-degree of every vertex. All nodes with in-degree 0 are placed into a queue. Dequeuing a node appends it to the result and decrements the in-degree of its neighbors. Any neighbor whose in-degree reaches 0 enters the queue.",
        visualStep: 1,
      },
      {
        id: "cycle-detection",
        heading: "Cycle Detection Guarantee",
        markdown:
          "If the final topological order contains fewer than V vertices, the graph contains at least one directed cycle (which prevents in-degrees from reaching 0). Kahn's algorithm thus provides instant cycle detection.",
      },
      {
        id: "complexity",
        heading: "Linear Efficiency",
        markdown:
          "Kahn's algorithm processes every vertex and edge once, running in O(V + E) time with O(V) auxiliary space for in-degrees and queue.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "What type of graph is required for a valid topological sort to exist?",
        options: [
          "Any undirected graph",
          "Directed Acyclic Graph (DAG)",
          "Complete graph",
          "Bipartite graph",
        ],
        answerIndex: 1,
        explanation:
          "Topological ordering is only mathematically possible on graphs with directed edges and no cycles (DAGs).",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt: "In Kahn's algorithm, vertices are initially enqueued if their in-degree is 0.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "In-degree 0 means the node has no unmet prerequisites, so it can be processed immediately.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt: "How does Kahn's algorithm detect if a directed graph has a cycle?",
        options: [
          "The queue throws a memory error",
          "The count of processed nodes is less than total vertices V",
          "The in-degree of the source becomes negative",
          "All nodes finish with in-degree 1",
        ],
        answerIndex: 1,
        explanation: "Nodes trapped in cycles never reach in-degree 0, so they are never dequeued.",
      },
      {
        id: "q4",
        kind: "mcq",
        prompt:
          "What is the time complexity of Kahn's topological sort on a DAG with V vertices and E edges?",
        options: ["O(V)", "O(V + E)", "O(V * E)", "O(V log V)"],
        answerIndex: 1,
        explanation: "Every vertex and edge is evaluated exactly once in linear O(V + E) time.",
      },
    ],
  },
  {
    slug: "union-find",
    algorithmSlug: "union-find",
    title: "Disjoint Set Union: Path Compression and Union by Rank",
    estMinutes: 22,
    xp: 140,
    sections: [
      {
        id: "intro",
        heading: "Dynamic Connectivity and Equivalence",
        markdown:
          "The Disjoint Set Union (DSU or Union-Find) data structure maintains a collection of disjoint sets. It supports two operations: `find(x)` to determine which set x belongs to, and `union(x, y)` to merge the sets containing x and y.",
      },
      {
        id: "path-compression",
        heading: "Path Compression",
        markdown:
          "During `find(x)`, redirecting `parent[x] = find(parent[x])` flattens the tree so that all nodes on the traversal path point directly to the set representative root.",
        visualStep: 1,
      },
      {
        id: "union-rank",
        heading: "Union by Rank / Size",
        markdown:
          "When merging two sets, attaching the tree with smaller depth (rank) under the root of the deeper tree prevents tall skewed trees from forming.",
      },
      {
        id: "inverse-ackermann",
        heading: "Near Constant-Time Alpha(N) Bound",
        markdown:
          "Combining path compression with union by rank guarantees that any sequence of m operations on n elements runs in O(m * alpha(n)) time, where alpha is the inverse Ackermann function (effectively <= 4 for all universe scales).",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "What is the amortized time complexity per operation of Union-Find with path compression and union by rank?",
        options: ["O(1)", "O(alpha(n)) — nearly constant", "O(log n)", "O(n)"],
        answerIndex: 1,
        explanation:
          "The combination of optimizations yields O(alpha(n)), which is less than 5 for all practical input sizes.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt: "Path compression flattens the structure of the tree during find operations.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "Path compression directly attaches visited nodes to the root, dramatically speeding up future lookups.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt:
          "Which classic graph algorithm uses Union-Find to detect cycles when adding minimum-weight edges?",
        options: ["Dijkstra's algorithm", "Kruskal's algorithm", "Bellman-Ford", "Floyd-Warshall"],
        answerIndex: 1,
        explanation:
          "Kruskal's Minimum Spanning Tree algorithm uses DSU to prevent adding edges that form cycles.",
      },
      {
        id: "q4",
        kind: "predict-step",
        prompt:
          "Initially elements 1, 2, 3 are in separate sets. Execute union(1, 2) then union(2, 3). Does find(1) == find(3)?",
        options: [
          "Yes, they share the same set representative",
          "No, 1 and 3 remain disjoint",
          "Error thrown",
          "Depends on array size",
        ],
        answerIndex: 0,
        explanation:
          "Union is transitive: merging 1 with 2 and 2 with 3 places 1, 2, and 3 into the same connected set.",
      },
    ],
  },
  {
    slug: "binary-search-variants",
    algorithmSlug: "binary-search",
    title: "Binary Search on Answer and Monotonic Functions",
    estMinutes: 20,
    xp: 130,
    sections: [
      {
        id: "intro",
        heading: "Searching Over Solution Spaces",
        markdown:
          "Binary search is not restricted to explicit sorted arrays. It applies to any monotonic predicate `f(x)` where outcomes transition from `false` to `true` (or vice-versa). This is known as 'binary search on the answer'.",
      },
      {
        id: "lower-upper",
        heading: "Lower Bound and Upper Bound",
        markdown:
          "`lower_bound` finds the first index where `arr[i] >= target`. `upper_bound` finds the first index where `arr[i] > target`. The difference `upper_bound - lower_bound` calculates the exact frequency count of target in O(log n) time.",
      },
      {
        id: "capacity-patterns",
        heading: "Minimax Capacity Problems",
        markdown:
          "Problems like 'Ship Packages within D Days' binary search over package capacity `[max(weights), sum(weights)]`. A greedy helper function checks whether a given capacity can complete shipment in D days.",
      },
      {
        id: "bounds-discipline",
        heading: "Inclusive vs Exclusive Invariants",
        markdown:
          "Maintain strict invariants on `low` and `high`. For `while (low < high)`, set `mid = low + Math.floor((high - low) / 2)` and shrink with `high = mid` on true and `low = mid + 1` on false to guarantee loop termination without infinite oscillations.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "What mathematical property must a feasibility function f(x) possess to allow binary searching for the optimal answer x?",
        options: [
          "Differentiability",
          "Monotonicity (strictly non-decreasing or non-increasing)",
          "Linearity",
          "Periodicity",
        ],
        answerIndex: 1,
        explanation:
          "Monotonicity ensures a single clean boundary between valid and invalid solutions.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "The frequency of a target number in a sorted array can be computed in O(log n) time using upper_bound and lower_bound.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "Upper bound index minus lower bound index gives the exact count of target elements.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt:
          "When binary searching on a predicate with search space [1, 10^9] and O(n) validation check, what is the total complexity?",
        options: ["O(n)", "O(n log(10^9)) ~ 30n", "O(n^2)", "O(10^9)"],
        answerIndex: 1,
        explanation:
          "Log2(10^9) is roughly 30 iterations; each iteration performs O(n) work, resulting in O(n log M).",
      },
      {
        id: "q4",
        kind: "predict-step",
        prompt:
          "Array: [1, 2, 4, 4, 4, 7, 9]. Target = 4. What is the lower_bound index (first index >= 4)?",
        options: ["1", "2", "4", "5"],
        answerIndex: 1,
        explanation: "The first occurrence of 4 is at index 2.",
      },
    ],
  },
  {
    slug: "fast-slow-pointers",
    algorithmSlug: "two-pointers",
    title: "Fast and Slow Pointers: Cycle Detection and Midpoints",
    estMinutes: 16,
    xp: 100,
    sections: [
      {
        id: "intro",
        heading: "Floyd's Tortoise and Hare",
        markdown:
          "Floyd's cycle-finding algorithm uses two pointers that advance through a sequence at different speeds: a `slow` pointer moving 1 step and a `fast` pointer moving 2 steps per iteration.",
      },
      {
        id: "cycle-detection",
        heading: "Detecting Cycles in O(n) Time and O(1) Space",
        markdown:
          "If no cycle exists, `fast` reaches null. If a cycle exists, the distance between `fast` and `slow` decreases by 1 in every step within the cycle, guaranteeing they meet within O(n) steps.",
        visualStep: 1,
      },
      {
        id: "cycle-start",
        heading: "Locating the Cycle Entrance",
        markdown:
          "When `slow` and `fast` collide, reset `slow` to head while keeping `fast` at the meeting point. Advance both 1 step at a time; their new meeting point is mathematically guaranteed to be the exact cycle entrance.",
      },
      {
        id: "midpoint",
        heading: "Finding Linked List Midpoints",
        markdown:
          "When `fast` reaches the list tail, `slow` is located precisely at the middle node. This provides the split point for Merge Sort on linked lists in a single pass.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "What is the auxiliary space complexity of Floyd's cycle detection algorithm?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        answerIndex: 0,
        explanation:
          "Floyd's algorithm uses only two pointer references without hash sets or node modifications.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "When fast moves 2 steps and slow moves 1 step on an acyclic list of length n, slow reaches the middle when fast reaches the end.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "Because slow travels at half the speed of fast, it covers half the list length.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt: "After slow and fast meet in a cycle, how do you locate the cycle entrance?",
        options: [
          "Reverse the list from meeting point",
          "Reset slow to head and advance both slow and fast 1 step at a time until they collide",
          "Advance fast 3 steps and slow 1 step",
          "Count the total nodes and divide by 2",
        ],
        answerIndex: 1,
        explanation:
          "Mathematical derivation proves the distance from head to entrance equals distance from meeting point to entrance.",
      },
      {
        id: "q4",
        kind: "predict-step",
        prompt:
          "List nodes: 1 -> 2 -> 3 -> 4 -> 5 -> null. Where is slow when fast reaches node 5?",
        options: ["Node 2", "Node 3", "Node 4", "Node 5"],
        answerIndex: 1,
        explanation: "Slow is at index 2 (Node 3), which is the exact middle element.",
      },
    ],
  },
  {
    slug: "monotonic-stack",
    algorithmSlug: "stack-basics",
    title: "Monotonic Stack: Next Greater Element Pattern",
    estMinutes: 20,
    xp: 120,
    sections: [
      {
        id: "intro",
        heading: "Preserving Invariant Order",
        markdown:
          "A monotonic stack enforces a strict ascending or descending order among its entries. By shedding elements that violate monotonicity, it computes nearest greater or smaller neighbors in O(n) total time.",
      },
      {
        id: "nge",
        heading: "Next Greater Element Mechanics",
        markdown:
          "To find the next greater element to the right, traverse the array. While the stack is non-empty and `arr[i] > arr[stack.top]`, pop `stack.top` and record `arr[i]` as its next greater element, then push index `i`.",
      },
      {
        id: "histogram",
        heading: "Largest Rectangle in Histogram",
        markdown:
          "A monotonic increasing stack tracks left and right boundaries for histogram bars. When a shorter bar appears, popping taller bars computes the maximum rectangle bounded by that bar's height in O(1) per pop.",
      },
      {
        id: "circular-arrays",
        heading: "Circular Array Lookups",
        markdown:
          "For circular arrays, iterating the loop up to `2 * n` with modulo indexing `i % n` simulates circular wrapping with the same monotonic stack logic.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "What is the total time complexity of computing Next Greater Element across an array of length n using a monotonic stack?",
        options: ["O(log n)", "O(n)", "O(n log n)", "O(n^2)"],
        answerIndex: 1,
        explanation:
          "Each array index is pushed onto the stack once and popped at most once, totaling 2n operations.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "In a monotonic decreasing stack, elements are ordered from largest at the bottom to smallest at the top.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "Every new pushed element must be smaller than the current top, maintaining decreasing order towards the top.",
      },
      {
        id: "q3",
        kind: "predict-step",
        prompt:
          "Array: [2, 1, 5]. We process element 5 with stack containing indices of [2, 1]. What happens?",
        options: [
          "5 is discarded",
          "1 and 2 are popped because 5 is greater than both",
          "5 is placed at the bottom",
          "Stack overflows",
        ],
        answerIndex: 1,
        explanation:
          "5 is greater than 1 and 2, resolving 5 as the next greater element for both prior indices.",
      },
      {
        id: "q4",
        kind: "mcq",
        prompt:
          "What should typically be stored on a monotonic stack to resolve distance and area calculations?",
        options: ["The raw values only", "The array indices", "A boolean flag", "The running sum"],
        answerIndex: 1,
        explanation:
          "Storing indices allows retrieving both the element value `arr[idx]` and the distance `i - idx`.",
      },
    ],
  },
  {
    slug: "trie-basics",
    algorithmSlug: "bst-insert",
    title: "Tries: Prefix Trees and Fast String Retrieval",
    estMinutes: 20,
    xp: 130,
    sections: [
      {
        id: "intro",
        heading: "Prefix Tree Fundamentals",
        markdown:
          "A Trie (pronounced 'try') is an re-trie-val tree where each node represents a character. Common prefixes are shared across paths, making string lookups dependent on string length `L` rather than dataset size `N`.",
      },
      {
        id: "structure",
        heading: "Node Structure and End Markers",
        markdown:
          "Each Trie node contains a map or array of children (size 26 for lowercase English) and a boolean `isEndOfWord` flag marking valid word endpoints.",
      },
      {
        id: "operations",
        heading: "Insert, Search, and StartsWith",
        markdown:
          "Inserting a word of length L takes O(L) time by walking/creating child nodes. Search verifies the path and checks `isEndOfWord`. `startsWith(prefix)` only requires that the path exists.",
      },
      {
        id: "applications",
        heading: "Autocomplete and Spellcheckers",
        markdown:
          "Tries power search engine query autocomplete, IP routing tables (Longest Prefix Match), spell check dictionaries, and bitwise XOR maximum matching.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "What is the time complexity of searching for a word of length L in a Trie containing N total words?",
        options: ["O(log N)", "O(N * L)", "O(L)", "O(1)"],
        answerIndex: 2,
        explanation:
          "Trie traversal only follows L character edges, completely independent of total word count N.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "Two words that share a 4-letter prefix share the same first 4 ancestor nodes in a Trie.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation: "Tries compress shared prefixes into single shared ancestor paths.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt: "What distinguishes `search(word)` from `startsWith(prefix)` in a Trie?",
        options: [
          "`search` requires `isEndOfWord` to be true at the final node",
          "`startsWith` is slower",
          "`search` does not traverse child pointers",
          "There is no difference",
        ],
        answerIndex: 0,
        explanation:
          "`search` requires the final node to mark a completed word, whereas `startsWith` only requires the path to exist.",
      },
      {
        id: "q4",
        kind: "mcq",
        prompt: "What is a known tradeoff of standard array-based Trie implementations?",
        options: [
          "Slow search times",
          "High memory usage due to empty child pointers",
          "Cannot handle alphabetical keys",
          "Degrades on sorted inserts",
        ],
        answerIndex: 1,
        explanation:
          "Allocating 26 child references per node consumes significant memory when many branches are sparse.",
      },
    ],
  },
  {
    slug: "dynamic-programming-memo",
    algorithmSlug: "dfs",
    title: "Introduction to Dynamic Programming and Memoization",
    estMinutes: 24,
    xp: 150,
    sections: [
      {
        id: "intro",
        heading: "Overlapping Subproblems and Optimal Substructure",
        markdown:
          "Dynamic Programming (DP) solves complex problems by breaking them into overlapping subproblems with optimal substructure. Rather than re-solving identical subproblems exponentially, DP caches solutions.",
      },
      {
        id: "top-down",
        heading: "Top-Down DP (Recursion + Memoization)",
        markdown:
          "Top-down DP starts at the target problem and recursively breaks it down, checking a cache (memo table) before computing. This preserves natural recursive logic while pruning exponential branches to polynomial time.",
      },
      {
        id: "bottom-up",
        heading: "Bottom-Up DP (Tabulation)",
        markdown:
          "Bottom-up DP fills a table iteratively from base cases up to the target state. It eliminates recursive call stack overhead and frequently enables space optimization (e.g. tracking only the last 2 states in Fibonacci).",
      },
      {
        id: "state-transition",
        heading: "Defining the State and Recurrence",
        markdown:
          "The core skill in DP is defining the state variables (e.g., `dp[i][w]` = max value considering first i items with weight limit w) and formalizing the state transition equation.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt: "What reduces naive recursive Fibonacci from O(2^n) time to O(n) time?",
        options: [
          "Using binary search",
          "Memoizing subproblem results in a table or map",
          "Using a queue",
          "Sorting inputs",
        ],
        answerIndex: 1,
        explanation:
          "Memoization ensures each Fibonacci value from 0 to n is computed exactly once.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "Bottom-up tabulation starts from the smallest base cases and builds up to the final answer.",
        options: ["True", "False"],
        answerIndex: 0,
        explanation:
          "Tabulation iteratively fills values starting from known base cases (e.g., dp[0], dp[1]).",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt:
          "Which two properties are required for a problem to be solvable via Dynamic Programming?",
        options: [
          "Linearity and sorted inputs",
          "Optimal substructure and overlapping subproblems",
          "Acyclic edges and continuous variables",
          "Greedy choice property and random distribution",
        ],
        answerIndex: 1,
        explanation:
          "Optimal substructure allows building global optima from subproblem optima; overlapping subproblems makes caching valuable.",
      },
      {
        id: "q4",
        kind: "predict-step",
        prompt:
          "For climbing stairs problem where step(n) = step(n-1) + step(n-2) with step(1)=1, step(2)=2. What is step(4)?",
        options: ["3", "4", "5", "6"],
        answerIndex: 2,
        explanation: "step(3) = 1 + 2 = 3. step(4) = step(3) + step(2) = 3 + 2 = 5.",
      },
    ],
  },
  {
    slug: "graph-representations",
    algorithmSlug: "bfs",
    title: "Graph Representations: Adjacency Matrix vs Adjacency List",
    estMinutes: 16,
    xp: 90,
    sections: [
      {
        id: "intro",
        heading: "Representing Networks in Code",
        markdown:
          "Graphs consist of vertices (V) connected by edges (E). Choosing the right in-memory data representation directly impacts algorithm time and space efficiency.",
      },
      {
        id: "adj-list",
        heading: "Adjacency List (Sparse Graph Standard)",
        markdown:
          "An adjacency list maps each vertex to an array or linked list of its adjacent neighbors. It requires O(V + E) memory and allows iterating over a node's direct neighbors in O(degree) time. It is the preferred representation for sparse graphs (E << V^2).",
      },
      {
        id: "adj-matrix",
        heading: "Adjacency Matrix (Dense Graph Lookups)",
        markdown:
          "An adjacency matrix is a 2D boolean or weighted array of size `V x V` where `matrix[u][v]` indicates an edge between u and v. Edge existence queries take O(1) time, but space complexity is strictly O(V^2).",
      },
      {
        id: "tradeoffs",
        heading: "Summary of Tradeoffs",
        markdown:
          "Edge lookup: Matrix is O(1), List is O(degree). Neighbor iteration: List is O(degree), Matrix is O(V). Memory: List is O(V + E), Matrix is O(V^2). For competitive programming and web algorithms, Adjacency Lists are used ~95% of the time.",
      },
    ],
    quiz: [
      {
        id: "q1",
        kind: "mcq",
        prompt:
          "What is the space complexity of an adjacency list representation of a graph with V vertices and E edges?",
        options: ["O(V)", "O(V + E)", "O(V^2)", "O(E^2)"],
        answerIndex: 1,
        explanation:
          "Adjacency lists store V vertex buckets containing a total of 2E edge endpoints.",
      },
      {
        id: "q2",
        kind: "true-false",
        prompt:
          "An adjacency matrix is more memory-efficient than an adjacency list for sparse graphs where E << V^2.",
        options: ["True", "False"],
        answerIndex: 1,
        explanation:
          "Adjacency matrices always consume O(V^2) memory regardless of how few edges exist.",
      },
      {
        id: "q3",
        kind: "mcq",
        prompt:
          "What is the time complexity to check if an edge exists between vertex u and vertex v in an adjacency matrix?",
        options: ["O(1)", "O(log V)", "O(degree(u))", "O(V)"],
        answerIndex: 0,
        explanation: "Direct 2D array indexing `matrix[u][v]` executes in constant O(1) time.",
      },
      {
        id: "q4",
        kind: "mcq",
        prompt: "Why is an adjacency list preferred for BFS and DFS traversals on large graphs?",
        options: [
          "It uses recursion",
          "Iterating over direct neighbors takes O(degree) rather than checking all V potential vertices",
          "It sorts edges automatically",
          "It prevents cycles",
        ],
        answerIndex: 1,
        explanation:
          "Only existing neighbors are traversed, allowing BFS/DFS to achieve linear O(V + E) overall time.",
      },
    ],
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function getLessons(): Lesson[] {
  return lessons;
}

export function getLessonByAlgorithm(algorithmSlug: string): Lesson | undefined {
  return lessons.find((l) => l.algorithmSlug === algorithmSlug);
}

export function getLessonsByAlgorithm(algorithmSlug: string): Lesson[] {
  return lessons.filter((l) => l.algorithmSlug === algorithmSlug);
}

export async function fetchLesson(slug: string): Promise<Lesson | null> {
  return getLesson(slug) ?? null;
}

export async function fetchLessons(): Promise<Lesson[]> {
  return getLessons();
}
