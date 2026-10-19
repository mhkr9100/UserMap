## 2024-05-03 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found multiple instances where icon-only buttons (using SVGs or Lucide icons) were missing accessible names (`aria-label`). While some used `title`, `aria-label` provides broader and more consistent screen reader support.
**Action:** Always add `aria-label` attributes to any `<button>` element that only contains an icon (no text content) across the UI components.
