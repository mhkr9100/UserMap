## Palette Journal
## 2025-02-18 - Missing aria-labels on icon-only buttons
**Learning:** Found multiple instances across the app (`PrismInterface`, `ConnectorsPage`, `DataStudioPage`, `MindMapView`) where icon-only "close" or "cancel" buttons using `<X />` are missing `aria-label` attributes. This breaks accessibility for screen reader users who won't know what the button does.
**Action:** When using icon-only buttons, always include descriptive `aria-label`s (e.g., `aria-label="Close"`, `aria-label="Cancel"`).
