## 2026-05-20 - Schwartzian Transform for Date Sorting
**Learning:** Avoid calling `new Date(dateString).getTime()` directly inside `Array.prototype.sort()` callbacks (e.g., in `services/contextQuery.ts`), as it results in redundant O(N log N) date parsing operations.
**Action:** Pre-parse dates into timestamps before sorting using a Schwartzian transform pattern (`.map() -> .sort() -> .map()`) for O(N) parsing overhead.
