## 2024-05-01 - Avoid dynamic RegExp compilation in tight loops
**Learning:** Instantiating `new RegExp()` inside a tight scoring loop (and unnecessarily copying strings via `.toLowerCase()`) causes significant CPU/memory overhead.
**Action:** Pre-compile `RegExp` objects with 'gi' flags module-wide and use `String.prototype.match()` to safely consume them without state issues.
