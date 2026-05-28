## 2025-05-28 - Add ARIA labels to mind map node actions
**Learning:** Icon-only buttons in complex, heavily interactive UI components like mind maps often lack `aria-label`s because they rely on hover titles for sighted users, making them completely inaccessible to screen readers navigating the nested node structure.
**Action:** Ensure all interactive elements, especially non-text icons representing CRUD actions in nested/tree components, explicitly define `aria-label` attributes to provide equivalent context for assistive technologies.
