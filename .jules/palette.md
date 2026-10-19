## 2024-05-15 - Icon-Only Button Comprehensive State Pattern
**Learning:** Icon-only buttons frequently lack multiple critical states simultaneously: accessible names (ARIA labels), loading feedback, disabled protections during async operations, and clear keyboard focus indicators. This pattern was observed on the global refresh button which lacked all four.
**Action:** Always verify icon-only buttons have an `aria-label`, a `disabled` state when triggering async actions, visual loading feedback (like `animate-spin` on the icon), and `focus-visible` classes for keyboard users.
