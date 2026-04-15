## 2024-05-15 - React Component Render Optimization
**Learning:** React component memoization `useMemo` is not widely used in the original codebase. Some components recursively process the whole `tree` prop, which may become an issue on larger UserMap trees.
**Action:** Adding useMemo to recursive calculations like tree node counts in Dashboard page.
