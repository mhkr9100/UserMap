## 2025-03-01 - Cache Intl.DateTimeFormat for Date Formatting
**Learning:** Calling `new Date(iso).toLocaleDateString()` inside a rendering loop (e.g. mapping over hundreds/thousands of entries to group by date) is surprisingly slow because it recreates the locale and formatting options every time. This can cause significant UI blocking in React components handling large datasets like the TimelineView.
**Action:** Always create a cached instance of `new Intl.DateTimeFormat(...)` outside the loop or component rendering function, and use its `.format()` method. This is over 50x faster.
