## 2025-05-18 - Avoid dynamic RegExp instantiation in score loops
**Learning:** Instantiating `new RegExp(m.source, 'gi')` inside the `scoreMarkers` function loop in `prismMemoryExtractor.ts` caused high memory allocation and CPU overhead during text extraction. Doing this on every segment for every marker category is a huge waste.
**Action:** Pre-compile regular expressions with the 'g' flag and use `String.prototype.match()` to safely extract matches without needing to constantly re-allocate RegExp objects or normalize case at runtime (the 'i' flag handles it).
