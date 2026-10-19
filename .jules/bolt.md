## 2024-10-24 - Pre-compile Regex in tight loops
**Learning:** Instantiating new RegExp objects dynamically inside tight text-scoring loops (like `scoreMarkers` in `prismMemoryExtractor.ts`) causes extreme memory allocation and CPU overhead.
**Action:** Always pre-compile regular expressions with the 'g' flag. Use `String.prototype.match()` which safely ignores/resets the global `lastIndex` value across calls instead of advancing state as `RegExp.prototype.exec()` might do. This eliminates repetitive instantiation costs.
