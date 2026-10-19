## 2024-05-14 - MindMapView Accessibility
**Learning:** Adding dynamic ARIA labels based on state (`aria-expanded={!isCollapsed}` and `aria-label={isCollapsed ? 'Expand node' : 'Collapse node'}`) significantly improves screen reader comprehension for interactive tree elements compared to static labels.
**Action:** Always pair `aria-expanded` with descriptive toggle states for custom collapsible components across the application.
