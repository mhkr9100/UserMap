## 2024-05-18 - RegExp Re-compilation in loop
**Learning:** Found an anti-pattern where a new RegExp object is created and strings are converted to lower case inside a scoring loop that processes text segments. This causes excessive memory allocation and CPU overhead.
**Action:** The solution is to pre-compile regular expressions globally (e.g. adding 'g' and 'i' flags to markers) and use 'String.prototype.match()' which resets 'lastIndex' to execute multiple matching safely instead of 'new RegExp(m.source, 'gi')' and text.toLowerCase() inside a loop.
