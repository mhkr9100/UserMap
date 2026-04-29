## 2024-04-29 - Avoid Array Spreading in Recursive Flattening
**Learning:** Found that using `entries.push(...recursiveCall())` in recursive tree flattening operations (like `flattenAll` and `flattenEntries`) creates an O(N²) array operation bottleneck, making it very slow for large user maps.
**Action:** Always use an accumulator array parameter passed down the recursive chain (`flatten(node, category, entries = [])`) for O(N) performance. Avoid `push(...array)` inside loops when recursively collecting items.
