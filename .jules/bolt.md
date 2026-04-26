## 2025-04-26 - RegExp instantiation in inner loops
**Learning:** Building `new RegExp(m.source, 'gi')` inside a tight extraction loop drastically slows down processing.
**Action:** Precompile regex markers with the `/gi` flags directly so they can be reused without instantiation overhead.
