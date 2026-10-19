## 2024-05-22 - Pre-compiling RegExp for text scoring
**Learning:** Avoid dynamic RegExp instantiation and text.toLowerCase() string cloning inside tight text-scoring loops. Pre-compile regular expressions with 'g' and 'i' flags, and use String.prototype.match() to safely reset lastIndex and prevent excessive memory allocation and CPU overhead.
**Action:** Pre-compile regex markers and reuse them in matching loops instead of recreating them on the fly.
