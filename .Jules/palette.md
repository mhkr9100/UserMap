## 2024-05-15 - Add ARIA labels to icon-only buttons
**Learning:** Found multiple icon-only interactive controls (zoom, edit, delete, expand) in MindMapView that were completely inaccessible to screen readers because they relied only on SVG icons or title attributes.
**Action:** Always add explicit `aria-label` attributes to icon-only buttons, as `title` is insufficient for proper accessibility and mobile support.
