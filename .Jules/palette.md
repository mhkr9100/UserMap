## 2024-05-18 - Missing ARIA labels on icon-only buttons
**Learning:** Found multiple instances where icon-only action buttons (like "Edit node", "Add child node", "Send message") lacked `aria-label` attributes, relying only on visual icons or tooltip `title`s (which screen readers handle inconsistently).
**Action:** Added `aria-label` to these buttons in `MindMapView`, `PrismAgentPage`, and `PrismInterface` to ensure proper accessibility for screen reader users. Always ensure icon-only buttons have descriptive `aria-label`s.
