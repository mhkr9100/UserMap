## 2023-10-24 - Pre-compiling RegExp in Memory Extractor
**Learning:** Codebase-specific performance anti-pattern: Avoid dynamic `RegExp` instantiation and `text.toLowerCase()` string cloning inside tight text-scoring loops (e.g., in `prismMemoryExtractor.ts`).
**Action:** Pre-compile regular expressions with 'g' and 'i' flags, and use `String.prototype.match()` to safely reset `lastIndex` and prevent excessive memory allocation and CPU overhead.
