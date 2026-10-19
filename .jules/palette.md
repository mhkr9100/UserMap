## 2024-05-01 - Missing ARIA Labels on Icon Buttons in MindMapView
**Learning:** Found several icon-only buttons in `MindMapView` (and others like zoom controls) lacking proper accessibility (missing `aria-label`). While some had `title`, `aria-label` is crucial for screen readers.
**Action:** Adding `aria-label` to icon-only buttons like toggle collapse, add child, cancel adding, zoom in/out, and reset view in `MindMapView`.
