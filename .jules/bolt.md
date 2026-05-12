## 2024-05-12 - Pre-compiling RegExes in tight text-scoring loops
**Learning:** Dynamic `RegExp` instantiation (`new RegExp(..., 'gi')`) and string cloning (`text.toLowerCase()`) inside tight loops create massive memory allocations and CPU overhead, especially when parsing large text segments in `prismMemoryExtractor.ts`.
**Action:** Pre-compile regular expressions with 'g' and 'i' flags once at the module level. Use `String.prototype.match()` directly on the raw text, which is case-insensitive (due to 'i') and safely resets `lastIndex` automatically for stateful 'g' regexes.
