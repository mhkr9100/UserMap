## 2024-04-21 - Avoid O(N²) array spreading in recursive tree flattening
**Learning:** Using array spreading (e.g., `entries.push(...recursiveCall())`) inside recursive tree flattening operations creates an O(N²) memory allocation bottleneck, which drastically slows down processing of large UI structures like the UserMap tree.
**Action:** Always use an accumulator array passed down the recursion chain (e.g., `flatten(node, entries = [])`) to achieve O(N) performance.
