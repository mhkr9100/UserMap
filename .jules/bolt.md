## 2024-06-25 - Avoid Array Spreading in Recursive Functions
**Learning:** When flattening tree structures recursively (e.g., in UI context or timeline components), using array spreading (`entries.push(...flatten(child))`) creates an O(N²) array operation bottleneck due to continuous reallocation and copying of arrays at each tree depth.
**Action:** Always use an accumulator array parameter passed down the recursive chain (`flatten(node, entries = [])`) and mutate it directly (`entries.push(item)`) to achieve O(N) linear time complexity.
