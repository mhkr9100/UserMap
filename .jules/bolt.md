## 2024-05-06 - [Avoid array spreading in recursive tree flattening]
**Learning:** Using array spreading like `entries.push(...recursiveCall())` inside recursive tree traversals creates an O(N²) memory allocation and performance bottleneck.
**Action:** Always use an accumulator array parameter passed down the recursive chain (`flatten(node, entries = [])`) for O(N) performance.
