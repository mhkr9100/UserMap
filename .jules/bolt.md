## YYYY-MM-DD - Recursive Flattening Bottleneck
**Learning:** When implementing recursive tree flattening operations, avoid array spreading (e.g., `entries.push(...recursiveCall())`) as it creates an O(N²) array operation bottleneck.
**Action:** Always use an accumulator array parameter passed down the recursive chain (`flatten(node, entries = [])`) for O(N) performance.

## YYYY-MM-DD - Date Sorting Bottleneck
**Learning:** Calling `new Date(dateString).getTime()` directly inside `Array.prototype.sort()` callbacks results in redundant O(N log N) date parsing operations.
**Action:** Pre-parse dates into timestamps before sorting or use a Schwartzian transform.
