## 2024-05-24 - Avoid recursive array spreading
**Learning:** Array spreading inside a recursive tree traversal operation (like `entries.push(...flattenEntries(child, cat))`) turns an O(N) operation into an O(N²) operation because each level must iterate and copy the result of its children repeatedly.
**Action:** Use an accumulator parameter when traversing trees recursively (e.g. `function flatten(node, accumulator = [])`).
