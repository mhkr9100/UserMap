## 2024-05-18 - [Optimized TreeNode with React.memo]
**Learning:** The UserMapView tree uses deep recursive React rendering for user context. Large maps create a performance chokepoint when rendering deeply nested recursive arrays if every node re-renders on a simple update.
**Action:** Wrapped recursive components handling long/deep datasets (like TreeNode) in `React.memo` to skip unaffected branches on single-node updates.
