## 2025-02-18 - Improve accessibility of interactive controls
**Learning:** Found multiple instances where critical interactive elements lacked proper accessibility attributes, such as missing aria-labels on icon-only buttons, missing aria roles for tabbed navigation, and missing labels for forms.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes, use appropriate `role` and `aria-*` attributes for custom UI patterns like tabs, and provide screen-reader-only labels for all form inputs.
