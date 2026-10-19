## $(date +%Y-%m-%d) - Recursive Array Spreading
**Learning:** Found O(N²) bottlenecks in recursive tree operations `flattenAll` and `flattenEntries` due to the use of array spreading `entries.push(...recursiveCall())`.
**Action:** Always prefer using an accumulator array passed down the recursive chain (`flatten(node, entries = [])`) instead of array spreading, as this correctly yields O(N) performance for potentially deep or wide trees.
