## 2024-05-19 - Avoid Date instantiation in sort callbacks
**Learning:** Calling `new Date(dateString).getTime()` directly inside `Array.prototype.sort()` callbacks (like in `services/contextQuery.ts`) causes redundant O(N log N) date parsing operations, severely impacting performance for large lists.
**Action:** Always pre-parse dates into timestamps before sorting (e.g., using a Schwartzian transform: map-sort-map) to reduce date parsing to O(N).
