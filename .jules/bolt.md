## 2025-04-20 - Tree Flattening Bottleneck
**Learning:** When implementing recursive tree flattening operations, avoid array spreading (e.g., `entries.push(...recursiveCall())`) as it creates an O(N²) array operation bottleneck. Always use an accumulator array parameter passed down the recursive chain (`flatten(node, entries = [])`) for O(N) performance.
**Action:** Optimize `flattenAll` and `flattenEntries` in `components/ContextSearchView.tsx` and `components/TimelineView.tsx` by passing an accumulator array.
