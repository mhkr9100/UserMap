## 2025-05-18 - Recursive Tree Flattening Performance
**Learning:** When implementing recursive tree flattening operations, avoiding array spreading (e.g., `entries.push(...recursiveCall())`) prevents an O(N²) array operation bottleneck.
**Action:** Always use an accumulator array parameter passed down the recursive chain (`flatten(node, entries = [])`) for O(N) performance.