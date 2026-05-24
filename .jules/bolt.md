## 2024-03-20 - Tree Flattening Array Spread Bottleneck
**Learning:** Using array spread `entries.push(...recursiveCall())` inside recursive tree traversal creates an O(N²) memory allocation and copying bottleneck, degrading performance significantly on deep or large trees.
**Action:** Always implement recursive tree flattening using an accumulator array parameter passed down the recursive chain (`flatten(node, entries = [])`) to ensure O(N) time and space complexity.
