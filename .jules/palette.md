## 2024-05-07 - Add missing aria-labels to icon-only buttons
**Learning:** Found several icon-only buttons in MindMapView.tsx missing aria-labels. It's a common accessibility issue for screen readers when buttons lack descriptive text.
**Action:** Always verify icon-only buttons have descriptive `aria-label` attributes.
