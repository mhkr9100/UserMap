## 2024-05-18 - Avoid O(N^2) array spreading in recursive tree flattening
**Learning:** Using `array.push(...recursiveCall())` in deep tree traversal creates an O(N²) array operation bottleneck because it allocates and spreads intermediate arrays repeatedly.
**Action:** Always use an accumulator array parameter passed down the recursive chain (e.g., `flatten(node, acc = [])`) for O(N) performance.
