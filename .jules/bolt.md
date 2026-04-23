## 2024-04-23 - Avoid array spreading in recursive tree flattening
**Learning:** Using array spreading (`entries.push(...recursiveCall())`) inside recursive tree traversal creates an O(N²) bottleneck due to repeated array reallocation and copying.
**Action:** Always use an accumulator array passed down through the recursive chain (e.g., `flatten(node, entries = [])`) to achieve O(N) performance.
