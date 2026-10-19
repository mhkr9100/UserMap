## 2024-05-15 - Dynamic RegExp Compilation Overhead in Loops
**Learning:** In `prismMemoryExtractor.ts`, dynamically instantiating `new RegExp(m.source, 'gi')` inside a tight loop over text segments caused significant memory allocation and CPU overhead. Also, calling `.toLowerCase()` in the tight loop unnecessarily creates a string copy on each run.
**Action:** Pre-compile all marker regular expressions with the `g` and `i` flags globally, and use `String.prototype.match()` to safely consume them without tracking `lastIndex`.
