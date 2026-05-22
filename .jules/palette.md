## 2025-02-28 - Add ARIA labels to icon-only buttons
**Learning:** Map visualization components (MindMapView, UserMapView) use complex interactive elements with icon-only buttons (like collapse/expand, zoom, add category) that lack descriptive accessible names, making them difficult to use for screen reader users.
**Action:** Added `aria-label` attributes to these buttons to provide descriptive names based on their visual intent.
