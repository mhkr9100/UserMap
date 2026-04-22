## 2024-05-14 - Recursive Tree Flattening Array Spread Bottleneck
**Learning:** Using array spreading (`entries.push(...recursiveCall())`) inside a recursive tree traversal function creates an O(N^2) performance bottleneck due to the cost of creating and spreading intermediate arrays at every level.
**Action:** Always use an accumulator array parameter passed down the recursive chain (`flatten(node, entries = [])`) for O(N) performance when flattening tree structures.
