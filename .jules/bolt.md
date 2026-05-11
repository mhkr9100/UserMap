## 2024-05-23 - Avoid dynamic RegExp compilation in text-scoring loops
**Learning:** Instantiating `RegExp` objects inside tight loops (like text scoring) with `new RegExp(m.source, 'gi')` causes excessive memory allocation and CPU overhead. Also, calling `.toLowerCase()` on large text segments before scoring adds unnecessary string cloning.
**Action:** Pre-compile regular expressions with 'g' and 'i' flags, and use `String.prototype.match()` to safely reset `lastIndex` and prevent excessive memory allocation and CPU overhead.
## 2024-05-23 - Stateful Regex Bug Avoidance
**Learning:** Adding the `g` flag to regular expressions makes them stateful (keeping track of `lastIndex`). This must only be done for regexes consumed by `String.prototype.match` or explicit loops with `.exec()`. Using a `g` flag on regexes evaluated via `.test()` or `.some(p => p.test())` will cause intermittent false negatives because `lastIndex` does not reset automatically.
**Action:** Always verify how a regular expression is executed before applying the `g` flag globally during optimizations.
