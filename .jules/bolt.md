## 2024-05-14 - Pre-compile memory extraction markers
**Learning:** `prismMemoryExtractor.ts` dynamically creates RegExp objects inside the tight `scoreMarkers` loop using `new RegExp(m.source, 'gi')` and clones the string with `text.toLowerCase()`. String.prototype.match with global flags is safe to use with shared regex objects because it resets `lastIndex` automatically, but the `g` flag must not be used with `.test()` as it maintains state.
**Action:** Pre-compile the marker arrays with `gi` flags, and replace `new RegExp` and `toLowerCase` with simple `match` calls.
