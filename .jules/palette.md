## 2024-05-09 - Missing aria-labels on icon-only buttons
**Learning:** Found multiple icon-only buttons across components (`UserMapView.tsx`, `ConnectorsPage.tsx`, `PrismAgentPage.tsx`, `PrismInterface.tsx`) that lack `aria-label` attributes, which makes them inaccessible to screen readers.
**Action:** Always add descriptive `aria-label` or `title` attributes to buttons that only contain icons.
