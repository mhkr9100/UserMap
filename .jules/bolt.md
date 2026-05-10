## 2024-05-10 - RegExp Instantiation and String Cloning Performance
**Learning:** Codebase-specific performance anti-pattern: Avoid dynamic `RegExp` instantiation (`new RegExp(...)`) and `text.toLowerCase()` string cloning inside tight text-scoring loops (e.g., in `prismMemoryExtractor.ts`). Pre-compile regular expressions with 'g' and 'i' flags.
**Action:** Use `String.prototype.match()` to safely reset `lastIndex` and prevent excessive memory allocation and CPU overhead, especially when processing many chunks of text against multiple patterns.
