## 2024-04-28 - Flattening Recursive Tree Traversal Array Spread
**Learning:** When flattening recursive tree structures, using array spreading inside a loop (e.g. `entries.push(...flattenEntries(...))`) creates an O(N²) array operation bottleneck due to memory reallocation and array copying. This codebase specifically flags this in the instructions.
**Action:** Always use an accumulator array parameter passed down the recursive chain (`flatten(node, entries = [])`) for O(N) performance.
