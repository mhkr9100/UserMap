## 2024-05-13 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Many interactive icon-only buttons (like Close `X` and Send `<Send />`) lack descriptive ARIA labels, causing accessibility issues for screen readers. This pattern is prevalent across several components including MindMapView, ConnectorsPage, DataStudioPage, PrismAgentPage, and PrismInterface.
**Action:** Added `aria-label` attributes to these icon-only buttons to enhance accessibility for screen reader users and comply with standard UX/a11y practices.
