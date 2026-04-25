## $(date +%Y-%m-%d) - Optimize tree flattening from O(N²) to O(N)
**Learning:** Using array spreading (`entries.push(...recursiveCall())`) inside recursive tree flattening functions creates an O(N²) memory allocation and copying bottleneck.
**Action:** Always use an accumulator array parameter passed down the recursive chain (`flatten(node, entries = [])`) to achieve O(N) linear performance, avoiding unnecessary intermediate array creations and copies.
