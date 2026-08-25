ALGORA LEARNING EXPERIENCE

Version 1.0

Product: Algora
Purpose: Define exactly how students learn DSA inside Algora.
Relationship to other documents:

DESIGN_SYSTEM.md defines how Algora looks.

LEARNING_EXPERIENCE.md defines how students learn.

VISUALIZER_CONTRACT.md defines how code, visual state, variables, explanation and playback synchronize.

This document is a product-learning contract.

Any new lesson, algorithm experience, challenge, visualizer, quiz, exercise or course flow should follow it unless an explicitly approved exception exists.

1. CORE PRODUCT IDEA

Algora is not a video library.

Algora is not a LeetCode clone.

Algora is not just an algorithm visualizer.

Algora combines:

Teaching
Visualization
Code execution
Prediction
Practice
Problem solving
Revision
Mastery tracking

into one continuous learning journey.

The central product promise is:

See the algorithm think.

A student should not only know what code to write.

They should understand:

what the algorithm is doing

why it performs each operation

what changes after every important line

which state remains true

how the algorithm progresses toward the answer

when and why the algorithm terminates

how to implement the same reasoning themselves

2. PRIMARY LEARNING LOOP

Every complete Algora lesson should follow this canonical learning journey:

DISCOVER
   ↓
CONCEPT
   ↓
WATCH
   ↓
GUIDED VISUALIZE
   ↓
PREDICT
   ↓
TRACE
   ↓
IMPLEMENT
   ↓
SOLVE
   ↓
REVIEW
   ↓
MASTER


Short lessons may combine some stages.

However, the mental progression should remain the same:

Understand → Observe → Think → Perform → Apply → Remember

3. STAGE 1 — DISCOVER

Purpose

Give the student a reason to care before explaining implementation.

The first interaction should answer:

What problem are we trying to solve?

Not:

What is the syntax?

Example — Binary Search

Do not start with:

while (low <= high)


Start with:

Imagine searching for the number 42 inside a sorted list of one million numbers.

Then ask:

Do we really need to check all one million numbers?

The student should understand the problem before seeing implementation details.

Discover stage can contain

a real-world analogy

a tiny puzzle

a visual problem

an input/output example

a simple challenge

a misconception

a surprising comparison

Requirements

Keep Discover short.

Recommended duration:

30 seconds to 2 minutes.

The goal is curiosity, not full understanding.

4. STAGE 2 — CONCEPT

Purpose

Teach the core mental model without implementation complexity.

The student should understand the idea before seeing the final code.

Example — Binary Search

Concept:

Inspect the middle value.

If target is smaller:

Discard the right side.

If target is larger:

Discard the left side.

Repeat.

That mental model should be visually understandable without requiring code.

Concept screen should answer

What information do we have?

What decision does the algorithm make?

What information can be safely discarded?

What is repeated?

When do we stop?

Why is this better than the naive approach?

5. STAGE 3 — WATCH

Purpose

Allow the instructor to teach naturally through video.

Algora videos may be hosted on YouTube while the course experience stays inside Algora.

Video is not the whole lesson

Video provides:

teacher explanation

intuition

storytelling

examples

human guidance

Interactive learning provides:

execution

prediction

tracing

coding

testing

review

Students should never be forced to learn everything only through video.

6. VIDEO + INTERACTIVE RELATIONSHIP

Eventually lessons may contain synchronized video cue points.

Example:

videoCues = [
  { time: 0, step: 0 },
  { time: 24.5, step: 1 },
  { time: 39.2, step: 2 },
  { time: 52.8, step: 3 },
];


Potential behavior:

Video reaches a cue point.

Visualizer highlights the matching step.

Or:

Student selects an execution step.

Video seeks to the relevant explanation.

Important rule

Video synchronization must enhance learning.

It must not make the student feel that playback controls are fighting each other.

Students must still be able to use:

Video only
Visualizer only
Both together

7. STAGE 4 — GUIDED VISUALIZER

This is Algora's signature learning experience.

The guided visualizer teaches the algorithm one meaningful operation at a time.

8. GUIDED WORKSPACE MODEL

Desktop experience contains two primary mental spaces:

┌─────────────────────────────┬──────────────────────┐
│                             │                      │
│      ALGORITHM WORLD        │       CODE           │
│                             │                      │
│                             ├──────────────────────┤
│                             │   WHY / REASONING    │
│                             │                      │
├─────────────────────────────┴──────────────────────┤
│                 PLAYBACK CONTROLS                  │
└────────────────────────────────────────────────────┘


Algorithm World

Shows what exists and what changes.

Examples:

arrays

pointers

ranges

values

comparisons

stack

queue

call stack

tree

graph

heap

DP table

traversal order

Code World

Shows exactly which implementation instruction causes the current change.

Reasoning World

Answers:

What happened?

Why?

What remains true?

What should the student notice?

9. MEANINGFUL STEPS

Algora does not need one animation step for every microscopic JavaScript statement.

A step should represent a meaningful learning event.

Good examples:

calculate midpoint

compare target with midpoint

move low pointer

move high pointer

swap elements

push onto stack

pop from stack

enqueue node

visit node

relax an edge

update DP cell

enter recursive call

return recursive result

Bad meaningful-step design

Do not create separate teaching steps for:

i++


if the only educational consequence is that iteration proceeds normally.

But if incrementing i changes the important pointer in a Two Pointers algorithm, it may deserve its own step.

10. THE SIX QUESTIONS OF EVERY STEP

Every meaningful execution step should answer as many of these as relevant:

1. WHERE ARE WE?

Which iteration, node, range, recursion depth or phase?

2. WHICH CODE IS RUNNING?

Which line or logical operation caused the current transition?

3. WHAT CHANGED?

Pointer, node, array cell, range, variable, stack, queue, table or output?

4. WHY DID IT CHANGE?

What reasoning makes this operation valid?

5. WHAT REMAINS TRUE?

What invariant still holds?

6. WHAT HAPPENS NEXT?

Can the student anticipate the next logical move?

11. STEP INFORMATION HIERARCHY

A step may include:

ACTION

Short.

Example:

Move low to index 5.

WHY

Explanation.

Example:

The middle value 24 is less than 42, so the target cannot be at or left of index 4.

INVARIANT

Example:

If 42 exists, it must remain between low and high.

DETAIL

Optional deeper explanation.

COMPLEXITY IMPACT

Optional.

Example:

We discarded five candidates with one comparison.

Do not force every field onto every step.

Show only information that helps.

12. VARIABLES MUST BE VISIBLE

Important changing variables should not remain hidden inside code.

Examples:

low      0 → 5
mid      4
high     8
target   42


Variable changes should be synchronized with the visual state.

13. CALCULATIONS SHOULD BE VISUALIZED

Do not only say:

mid becomes 4

Show:

low + high
──────────
    2

0 + 8
─────
  2

= 4


For comparisons:

24 < 42
   ↓
 TRUE
   ↓
move low


Students should see the reasoning chain.

14. ALGORITHM INVARIANTS

One of Algora's strongest teaching features should be invariants.

An invariant explains what remains guaranteed while the algorithm changes state.

Binary Search

If the target exists, it remains inside [low, high].

Sliding Window

The current window satisfies the condition being tracked.

BFS

Every node already removed from the queue has been discovered at the shortest reachable BFS depth.

Heap

Every parent maintains the heap property relative to its children.

Why invariants matter

Most beginners memorize operations without understanding why they are safe.

Invariants convert memorization into reasoning.

Do not show invariants where they add unnecessary complexity for very early learners.

15. STAGE 5 — PREDICT

Passive watching is not enough.

Students should periodically predict the next meaningful operation.

Example

Current state:

arr[mid] = 24
target = 42


Question:

What happens next?

A. high = mid - 1

B. low = mid + 1

C. Return mid

D. Restart search

16. PREDICTION RULES

Prediction checkpoints should appear after meaningful reasoning opportunities.

Recommended:

Every 3–6 important operations.

Not every single step.

Predictions should test

pointer movement

comparison outcome

next node

next queue state

next recursive call

correct DP dependency

correct swap

correct branch

Predictions should NOT test

Random syntax.

Example bad question:

Which keyword appears on line 8?

That does not test algorithm understanding.

17. PREDICTION FEEDBACK

If correct:

Short confirmation.

Example:

Correct. Since 24 < 42, the left half is impossible.

Then continue.

If incorrect:

Do not only say:

Wrong.

Explain the misconception.

Example:

Moving high would keep smaller values and discard larger values. Since the target is larger than 24, we need to search right instead.

Then allow student to continue.

18. STAGE 6 — TRACE

After guided execution, remove some assistance.

Give the student a new input.

Example:

[2, 7, 12, 18, 29, 36, 44]
target = 36


The student manually determines:

low

mid

high

next range

result

Trace mode may ask students to

choose next pointer

select next active node

choose next array range

build stack state

build queue state

choose DP dependency

enter variable value

select recursive branch

19. TRACE SHOULD USE NEW INPUTS

Do not simply ask students to repeat the exact guided example from memory.

The algorithm should remain the same.

The data should change.

This checks transfer of understanding.

20. STAGE 7 — IMPLEMENT

Now the student writes code.

Do not immediately move from explanation to completely blank editor when the concept is new.

Use progressive implementation difficulty.

21. IMPLEMENTATION LEVELS

Level A — Fill the missing operation

if (arr[mid] < target) {
  low = __________;
}


Level B — Complete a block

while (low <= high) {
   // student completes body
}


Level C — Complete the full function

function binarySearch(arr, target) {
   // student implementation
}


22. IMPLEMENTATION FEEDBACK

Do not only show:

Wrong Answer


When possible, explain algorithmic behavior.

Example:

Your search gets stuck when low === mid because low is being assigned mid instead of mid + 1.

Or:

Your code correctly finds existing values but fails when the target is smaller than every element.

23. EXECUTION VISUALIZATION FOR STUDENT CODE

Future advanced feature:

Student writes code.

Algora executes it.

The visualizer reacts to their execution.

This requires runtime instrumentation or AST-level tracing.

This is not required for the first high-quality learning system.

Official guided implementations should be excellent before attempting arbitrary-code visualization.

24. STAGE 8 — SOLVE

Once implementation is understood, give an interview-style problem.

The student should apply the pattern rather than duplicate the lesson.

Example

After Binary Search:

Do not only ask:

Implement Binary Search.

Also introduce:

Search Insert Position

First Occurrence

Last Occurrence

Search in Rotated Sorted Array

Binary Search on Answer

Difficulty should increase gradually.

25. PATTERN TRANSFER

Algora should teach patterns, not isolated problems.

Every algorithm lesson should eventually tell the student:

You should think of this pattern when...

Example Binary Search:

sorted search space

monotonic condition

answer can be divided into possible/impossible ranges

each decision eliminates a large part of the search space

26. STAGE 9 — REVIEW

Algora already has an SRS foundation.

Review should revisit understanding after time has passed.

Review should mix

Concept questions

Execution predictions

Small traces

Complexity questions

Implementation fragments

Pattern recognition

27. REVIEW SHOULD NOT BE REPETITIVE

Do not repeatedly show the same question.

Test the same concept differently.

Example:

Day 1:

Where does low move?

Day 3:

Which half can be discarded?

Day 7:

Which invariant makes the discard safe?

Day 14:

Does this problem support binary search?

28. STAGE 10 — MASTER

Mastery should represent actual understanding.

Not just:

Video watched.

Mastery signals can include

Lesson viewed

Guided visualization completed

Prediction accuracy

Trace success

Implementation success

Challenge success

Review performance

Time since last review

29. MASTERY LEVELS

Suggested model:

NEW
↓
EXPOSED
↓
UNDERSTANDING
↓
PRACTICED
↓
RELIABLE
↓
MASTERED


Suggested interpretation

NEW

Never studied.

EXPOSED

Concept/video viewed.

UNDERSTANDING

Guided visualizer completed with reasonable prediction accuracy.

PRACTICED

Trace or implementation completed.

RELIABLE

Successfully solved related problems.

MASTERED

Strong performance after spaced review.

30. XP VS MASTERY

XP rewards activity.

Mastery measures understanding.

They must remain different.

A student may have:

High XP

but low Graph mastery.

That is valid.

Do not let gamification pretend that engagement equals knowledge.

31. THE LESSON PAGE

Recommended lesson architecture:

LESSON HEADER

Concept
↓
Video / Teacher explanation
↓
Key intuition
↓
Guided visualizer
↓
Prediction checkpoint
↓
Trace challenge
↓
Implementation
↓
Related problem
↓
Review status
↓
Next lesson


Do not place everything inside one giant unstructured page.

Use a clear learning progression.

32. STUDENT SHOULD ALWAYS KNOW

At any moment:

Where am I?

What am I learning?

What should I do next?

Why am I doing this?

How much remains?

What have I mastered?

Avoid screens where the student sees many actions with no obvious next step.

33. DASHBOARD PURPOSE

The dashboard is not an analytics dashboard.

It is the student's learning control center.

Its main job is:

Tell the student what to learn next.

Dashboard priority

Continue learning

Due review

Current learning path

Recent mastery

Streak / XP

Recommendations

Secondary statistics

Do not make streaks or charts more prominent than learning.

34. LEARNING PATH

Students should feel progression.

Example:

FOUNDATIONS

Arrays
↓
Complexity
↓
Searching
↓
Sorting

PATTERNS

Two Pointers
↓
Sliding Window
↓
Prefix Sum

DATA STRUCTURES

Stack
Queue
Linked List
Heap

TREES

Traversal
BST
Recursion

GRAPHS

BFS
DFS
Shortest Path

ADVANCED

Backtracking
Greedy
Dynamic Programming


Exact roadmap may differ.

The experience should always communicate prerequisites.

35. LOCKING CONTENT

Avoid excessive hard locking.

A student should usually be able to inspect future topics.

Recommended:

Allow preview.

Recommend prerequisites.

Use soft guidance.

Only hard-lock when necessary for structured cohort/course requirements.

36. BEGINNER VS ADVANCED DETAIL

Algora should progressively reveal complexity.

Beginner

Show:

Action

Why

Simple variable state

Basic invariant

Intermediate

Add:

Complexity

Alternative cases

Implementation details

Advanced

Add:

Proof intuition

Edge cases

Variants

Optimization

Tradeoffs

Do not overwhelm beginners with every theoretical detail immediately.

37. COMPLEXITY TEACHING

Complexity should be connected to execution.

Example Binary Search:

Instead of only:

O(log n)


show:

9 candidates
↓
4 candidates
↓
2 candidates
↓
1 candidate


Then explain why repeated halving produces logarithmic complexity.

Complexity should feel derived, not memorized.

38. EDGE CASES

After main understanding, show important edge cases.

Examples:

Empty input

Single element

Target absent

Duplicate values

Extreme indexes

Disconnected graph

Cycle

Deep recursion

Rule

Do not interrupt first-time conceptual understanding with ten edge cases.

Teach the normal case first.

Then expand.

39. WRONG MENTAL MODELS

Algora should explicitly teach common misconceptions.

Examples:

Binary Search:

“Binary Search only works when searching numbers.”

Correction:

Binary Search works on a monotonic search condition, not only numeric arrays.

BFS:

“Visited means processed.”

Correction:

Depending on implementation, a node may be marked visited when enqueued to prevent duplicates.

DP:

“DP means using a table.”

Correction:

DP means reusing overlapping subproblem results; tables are one storage technique.

40. LEARNING COPY STYLE

Use simple English.

Short sentences during execution.

Deeper explanations can be longer.

Avoid unnecessary academic wording.

Good

24 is smaller than 42. Everything to its left is also too small.

Worse

Owing to the sorted invariant of the collection, we can conclusively eliminate all predecessor indices.

Precision is important.

Complex wording is not.

41. NARRATION LENGTH

Immediate execution narration:

Recommended:

5–15 words.

Explanation:

1–3 short sentences.

Deep theory:

Separate expandable section.

Do not place paragraphs beside fast-moving animation.

42. ACTIVE LEARNING FREQUENCY

A student should not watch more than several minutes of interactive content without doing something.

Possible actions:

Predict

Select

Trace

Answer

Drag

Type

Code

Explain

Rule

Learning activity should be meaningful.

Do not introduce interactions solely to make the interface feel interactive.

43. PLAYBACK MODES

Visualizer should support:

Manual step

Autoplay

Pause

Previous meaningful step

Next meaningful step

Restart

Speed adjustment

44. DEFAULT PLAYBACK

For first-time learning:

Manual or slower guided playback is preferred.

For revision:

Faster autoplay may be useful.

45. SPEED

Suggested options:

0.5x

1x

1.5x

2x

Animations should remain understandable at every supported speed.

46. TIMELINE

Timeline should indicate meaningful algorithm phases.

Examples:

Initialize

Compare

Discard

Repeat

Found

Rather than only showing an anonymous progress percentage.

47. MILESTONES

Existing engine milestone information should be used to create stronger learning moments.

Possible milestones:

First comparison

Range reduced

Node discovered

Heap property restored

Recursive base case reached

DP row completed

Answer found

Milestones can trigger prediction or explanation.

48. LEARNING STATE PERSISTENCE

If the student leaves and returns, Algora should eventually remember:

Lesson position

Video progress

Visualizer step

Completed predictions

Trace state

Challenge state

Mastery

Review schedule

49. DON'T OVER-SAVE

Not every hover, animation state or temporary UI interaction needs persistence.

Save meaningful learning progress.

50. MOBILE LEARNING

Mobile should not shrink desktop UI blindly.

Recommended stack:

Algorithm World
↓
Playback
↓
Code
↓
Reasoning
↓
Prediction / exercise


The visualization remains the primary focus.

51. DESKTOP LEARNING

Desktop takes advantage of horizontal space:

Algorithm World | Code + Reasoning


Use responsive resizing.

Never make either pane so narrow that learning suffers.

52. ACCESSIBILITY

Learning must not depend only on:

Color

Motion

Audio

Hover

Pointer devices

Examples

Active code line:

Color + left marker + aria-current

Found node:

Color + icon/check + label

Animation:

State should still be understandable with reduced motion.

Video:

Captions/transcript eventually.

Predictions:

Keyboard accessible.

Playback:

Full keyboard control.

53. KEYBOARD-FIRST VISUALIZER

Recommended shortcuts while visualizer is focused:

Space

Play / Pause

Arrow Right

Next step

Arrow Left

Previous step

R

Restart

Shortcut behavior must not interfere with text editors or input fields.

54. FOCUS

When a meaningful visual state changes:

Do not constantly steal keyboard focus.

Use screen-reader announcements where appropriate.

Visible focus is mandatory for interactive controls.

55. FAILURE EXPERIENCE

Failure should teach.

When a student gets something wrong, the experience should answer:

What did you choose?

Why doesn't that work?

What should you notice?

Would you like to retry?

56. NO SHAME DESIGN

Never use:

Aggressive red flashing

Harsh failure language

Mocking messages

Punitive streak destruction messaging

The learning system should encourage deliberate retry.

57. HINT SYSTEM

Hints should progressively reveal information.

Example implementation challenge:

Hint 1:

Think about which boundary must move.

Hint 2:

The midpoint is smaller than the target.

Hint 3:

Update low.

Final hint:

low = mid + 1;


Do not reveal the entire solution immediately.

58. SOLUTION REVEAL

Allow solution reveal eventually.

But distinguish:

Solved independently

Solved with hints

Solution viewed

These can affect mastery differently.

59. LESSON COMPLETION

Do not mark a lesson mastered simply because the user scrolled to the end.

Possible completion:

Concept viewed

Visualizer completed

At least one active exercise attempted

Then mark lesson:

Completed

Mastery can remain lower.

60. NEXT BEST ACTION

At the end of every lesson, provide one obvious recommended action.

Examples:

Start Trace Exercise

Implement Binary Search

Solve Search Insert Position

Review Tomorrow

Continue to Two Pointers

Avoid giving ten equally weighted buttons.

61. ALGORITHM CATEGORIES

Different algorithms require different educational emphasis.

Searching

Focus:

search space

comparisons

range elimination

Sorting

Focus:

comparisons

swaps

partitions

sorted boundaries

Two Pointers

Focus:

pointer movement

conditions

relationship between pointers

Sliding Window

Focus:

window boundary

window contents

tracked aggregate

Stack / Queue

Focus:

state before and after operation

front/top

push/pop/enqueue/dequeue

Linked List

Focus:

references

pointer movement

mutation

Trees

Focus:

current node

parent/child relationship

traversal order

recursion stack

Graphs

Focus:

frontier

visited

edges

distance

queue/stack

Heap

Focus:

tree + array relationship

parent/child index arithmetic

heap property

Dynamic Programming

Focus:

state definition

dependency

transition

base cases

computed table

Backtracking

Focus:

choice

recursive state

dead end

undo

return

62. GOLDEN LESSON STANDARD

Before scaling a visualization pattern to all algorithms, one example should become a reference-quality lesson.

First recommendation:

Binary Search Golden Lesson

It must demonstrate:

Concept

Video placement

Visualizer

Code synchronization

Pointer movement

Variable board

Expression animation

Why panel

Invariant

Prediction

Trace

Implementation

Problem

Mastery

Responsive experience

Accessibility

63. GOLDEN LESSON SUCCESS TEST

A beginner should be able to use the Binary Search lesson and explain:

What low means.

What high means.

How mid is calculated.

Why half the array can be discarded.

Why the array must support the required ordering/condition.

Why the algorithm terminates.

Why complexity is logarithmic.

How to implement it.

When to recognize Binary Search in another problem.

If they cannot answer those questions, the lesson is not complete.

64. SCALE ONLY AFTER THE GOLDEN LESSON

After Binary Search is approved, extract reusable learning components.

Recommended:

AlgorithmWorkspace

CodePane

VariableBoard

ExplanationPanel

InvariantCard

PredictionGate

PlaybackBar

ExpressionView

RangeBand

Pointer

StackPanel

QueuePanel

CallStackPanel

ComplexityExplainer

These components should become the vocabulary for future lessons.

65. CONTENT AUTHORING CONTRACT

Every new algorithm should define:

Title
Prerequisites
Learning objectives
Intuition
Primary example
Complexity
Implementation
Execution steps
Narration
Reasoning
Variables
Milestones
Predictions
Trace exercise
Implementation exercise
Related problems
Common mistakes
Review concepts


Authors should not invent lesson structure independently.

66. LEARNING OBJECTIVES

Every lesson should contain 3–6 concrete objectives.

Good:

By the end, the student can:

explain why Binary Search discards half the search space

trace low, mid, and high

implement Binary Search

recognize monotonic search problems

state time and space complexity

Bad:

Understand Binary Search.

Too vague.

67. PREREQUISITES

Lessons should communicate required knowledge.

Example:

Binary Search prerequisites:

Arrays

Basic loops

Comparisons

Sorted arrays

No need for advanced recursion.

68. LEARNING PATH RECOMMENDATION

When students struggle repeatedly, Algora can eventually recommend prerequisite review.

Example:

You're having trouble with Sliding Window updates. Review Two Pointers first.

This should be supportive, not blocking.

69. ANALYTICS PURPOSE

Future analytics should help improve learning.

Track things like:

Where students pause

Where students replay

Incorrect prediction patterns

Trace failure patterns

Code challenge failure cases

Lesson abandonment

Review performance

Do not optimize only for

Time spent

Clicks

Screen count

Daily active usage

The goal is learning efficiency and mastery.

70. AI FEATURES

Future AI should act as a tutor.

Not as a solution vending machine.

Useful AI:

Explain current step differently

Give a hint

Explain why an answer is wrong

Generate another trace example

Compare two approaches

Explain complexity

Ask a Socratic question

Avoid by default

Immediately generating complete challenge solutions.

The AI should protect the student's opportunity to think.

71. PRODUCT SUCCESS PRINCIPLE

Every Algora feature should improve at least one of:

Understanding

Retention

Transfer

Practice quality

Motivation

Learning navigation

If a feature improves none of these, question why it exists.

72. FINAL LEARNING STANDARD

Every high-quality Algora lesson should leave the student able to answer:

INTUITION

What problem does this algorithm solve?

MECHANISM

How does it move from input to answer?

REASONING

Why are its operations valid?

STATE

Which variables or structures matter?

COMPLEXITY

Why does it have this runtime and memory usage?

IMPLEMENTATION

Can I code it?

RECOGNITION

When should I use it?

TRANSFER

Can I solve a related problem?

RETENTION

Will I still remember it later?

73. ALGORA PRINCIPLE

Watching creates familiarity.

Interaction creates understanding.

Practice creates ability.

Review creates memory.

Algora must support all four.

74. NON-NEGOTIABLE RULE

A student should never finish an Algora lesson thinking:

“I know the code, but I don't understand why it works.”

The purpose of Algora is to eliminate that gap.

75. PRODUCT STATEMENT

Algora teaches algorithms by making invisible reasoning visible.

That is the learning experience.
